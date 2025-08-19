import { useState, useEffect } from "react";
import { geminiApiManager } from "../../utils/geminiApiManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Reply, Search, Sparkles, RefreshCw, User, Brain, Zap, AlertTriangle, Heart, HelpCircle, Star, Frown, Bot, ChevronDown, Eye, EyeOff, Trash2, Ban, RotateCcw, Image, Edit3, Camera } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { CommentClassifier } from "./CommentClassifier";
import { SmartReply } from "./SmartReply";
import { formatDateInArabic, formatShortDateInArabic } from "@/utils/dateUtils";

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

interface FacebookUser {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

interface Comment {
  id: string;
  message: string;
  from: {
    name: string;
    id: string;
  };
  created_time: string;
  post_id?: string;
  like_count?: number;
  comment_count?: number;
  reactions?: {
    summary: {
      total_count: number;
    };
  };
  parent?: {
    created_time: string;
    from: {
      id: string;
      name: string;
    };
    message: string;
    id: string;
  };
}

interface CommentManagerProps {
  selectedPage: FacebookPage;
}

export const CommentManager = ({ selectedPage }: CommentManagerProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [currentUser, setCurrentUser] = useState<FacebookUser | null>(null);
  const [selectedPostId, setSelectedPostId] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingToId, setReplyingToId] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [nextCommentsUrl, setNextCommentsUrl] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [autoLoadEnabled, setAutoLoadEnabled] = useState(true);
  const [classifyingAll, setClassifyingAll] = useState(false);
  const [bulkReplying, setBulkReplying] = useState(false);
  const [classifiedComments, setClassifiedComments] = useState<{[key: string]: any}>({});
  const [activeClassificationTab, setActiveClassificationTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [commentReplies, setCommentReplies] = useState<{[commentId: string]: any[]}>({});
  const [hiddenComments, setHiddenComments] = useState<Set<string>>(new Set());
  const [autoClassifyEnabled, setAutoClassifyEnabled] = useState(true);
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem("gemini-api-key") || geminiApiManager.getCurrentKey();
  });
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // Load user info and pages on component mount
  useEffect(() => {
    loadUserInfo();
    loadPagesWithProfilePictures();
    loadPosts();
  }, [selectedPage]);

  // Listen for refresh events when switching tabs
  useEffect(() => {
    const handleRefresh = () => {
      if (selectedPostId) {
        loadComments();
      }
      loadPosts();
    };

    window.addEventListener('refreshFacebookData', handleRefresh);
    return () => window.removeEventListener('refreshFacebookData', handleRefresh);
  }, [selectedPostId]);

  // Load user information
  const loadUserInfo = async () => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${selectedPage.id}?fields=id,name,category,picture&access_token=${selectedPage.access_token}`
      );
      
      const pageData = await response.json();
      
      if (pageData.error) {
        console.warn("Could not load page info:", pageData.error.message);
        return;
      }

      setCurrentUser({
        id: pageData.id,
        name: pageData.name,
        picture: pageData.picture
      });
    } catch (error) {
      console.error("Error loading page info:", error);
    }
  };

  // Load pages with profile pictures
  const loadPagesWithProfilePictures = async () => {
    try {
      setPages([selectedPage]);
    } catch (error) {
      console.error("Error setting pages:", error);
    }
  };

  // Load comments when post is selected
  useEffect(() => {
    if (selectedPostId) {
      setComments([]);
      setNextCommentsUrl(null);
      setClassifiedComments({});
      setActiveClassificationTab("all");
      setCommentReplies({});
      loadComments();
    }
  }, [selectedPostId]);

  // Auto-reply monitoring with polling
  useEffect(() => {
    if (!autoReplyEnabled || !selectedPostId) return;

    const interval = setInterval(async () => {
      try {
        await loadCommentsAndCheckForNew();
      } catch (error) {
        console.error('Auto-reply monitoring error:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [autoReplyEnabled, selectedPostId, comments.length]);

  // Listen for comment hiding events
  useEffect(() => {
    const handleHideComment = (event: CustomEvent) => {
      const { commentId } = event.detail;
      // Find comment by message substring since we don't have direct comment ID
      const commentToHide = comments.find(comment => 
        comment.message && comment.message.includes(commentId)
      );
      
      if (commentToHide) {
        setHiddenComments(prev => new Set([...prev, commentToHide.id]));
        toast.info("تم إخفاء التعليق المصنف كشكوى تلقائياً");
      }
    };

    window.addEventListener('hideComment', handleHideComment as EventListener);
    return () => window.removeEventListener('hideComment', handleHideComment as EventListener);
  }, [comments]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${selectedPage.id}/posts?access_token=${selectedPage.access_token}&fields=id,message,created_time,full_picture,picture,attachments{media}&limit=20`
      );
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const validPosts = (data.data || []).filter(post => post && post.id);
      setPosts(validPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("فشل في تحميل المنشورات");
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (nextUrl?: string) => {
    if (!selectedPostId && !nextUrl) return;
    
    const isLoadingMore = !!nextUrl;
    if (isLoadingMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const url = nextUrl || 
        `https://graph.facebook.com/v19.0/${selectedPostId}/comments?access_token=${selectedPage.access_token}&fields=id,message,from{name,id},created_time,parent,like_count,comment_count,reactions.summary(total_count),comments{id,message,from{name,id},created_time,like_count}&limit=25&order=chronological`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const newComments = data.data || [];
      const validComments = newComments.filter(comment => {
        const hasBasicData = comment && comment.id;
        const hasMessage = comment.message && comment.message.trim().length > 0;
        const hasAuthor = comment.from && (comment.from.name || comment.from.id);
        return hasBasicData && (hasMessage || hasAuthor);
      });
      
      const newReplies = {};
      validComments.forEach(comment => {
        if (comment.comments && comment.comments.data) {
          newReplies[comment.id] = comment.comments.data;
        }
      });
      
      if (nextUrl) {
        setComments(prev => [...prev, ...validComments]);
        setCommentReplies(prev => ({ ...prev, ...newReplies }));
        if (validComments.length > 0) {
          toast.success(`تم تحميل ${validComments.length} تعليق إضافي`);
        }
      } else {
        setComments(validComments);
        setCommentReplies(newReplies);
        if (validComments.length > 0) {
          toast.success(`تم جلب ${validComments.length} تعليق من أصل ${newComments.length}`);
        }
      }
      
      if (data.paging?.next) {
        setNextCommentsUrl(data.paging.next);
      } else {
        setNextCommentsUrl(null);
      }

      // Auto-classify comments if enabled
      if (autoClassifyEnabled && validComments.length > 0 && !nextUrl) {
        setTimeout(() => {
          autoClassifyComments(validComments);
        }, 1000);
      }
      
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error("فشل في تحميل التعليقات: " + (error as Error).message);
    } finally {
      if (isLoadingMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const loadCommentsAndCheckForNew = async () => {
    if (!selectedPostId) return;
    
    try {
      const url = `https://graph.facebook.com/v19.0/${selectedPostId}/comments?access_token=${selectedPage.access_token}&fields=id,message,from{name,id},created_time,parent,like_count,comment_count,reactions.summary(total_count),comments{id,message,from{name,id},created_time,like_count}&limit=25&order=chronological`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const newComments = data.data || [];
      const validComments = newComments.filter(comment => {
        const hasBasicData = comment && comment.id;
        const hasMessage = comment.message && comment.message.trim().length > 0;
        const hasAuthor = comment.from && (comment.from.name || comment.from.id);
        return hasBasicData && (hasMessage || hasAuthor);
      });

      const currentCommentIds = comments.map(c => c.id);
      const newUniqueComments = validComments.filter(comment => 
        !currentCommentIds.includes(comment.id) && 
        comment.message && 
        (!comment.comment_count || comment.comment_count === 0)
      );

      if (newUniqueComments.length > 0 && autoReplyEnabled) {
        for (const comment of newUniqueComments) {
          try {
            await autoReplyToComment(comment);
            await new Promise(resolve => setTimeout(resolve, 3000));
          } catch (error) {
            console.error('Auto-reply failed for comment:', comment.id, error);
          }
        }
      }

      const newReplies = {};
      validComments.forEach(comment => {
        if (comment.comments && comment.comments.data) {
          newReplies[comment.id] = comment.comments.data;
        }
      });

      setComments(validComments);
      setCommentReplies(newReplies);
      
    } catch (error) {
      console.error("Error in auto-reply monitoring:", error);
    }
  };

  const autoReplyToComment = async (comment: Comment) => {
    if (!comment.message || !autoReplyEnabled) return;

    try {
      const prompt = `أنت مساعد ذكي للرد التلقائي على تعليقات فيسبوك.

محتوى المنشور:
${posts.find(post => post.id === selectedPostId)?.message || "منشور على فيسبوك"}

تعليق المستخدم:
"${comment.message}"

إرشادات:
- رد مفيد ومهذب باللغة العربية
- كن مختصراً (أقل من 40 كلمة)
- إذا كان سؤالاً، قدم إجابة مفيدة أو اطلب التواصل
- إذا كان إيجابياً، اشكره باختصار
- تجنب الرد على التعليقات السلبية أو المهاجمة

الرد:`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 100,
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const generatedReply = data.candidates[0].content.parts[0].text.trim();

        const replyResponse = await fetch(
          `https://graph.facebook.com/v19.0/${comment.id}/comments`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              message: generatedReply,
              access_token: selectedPage.access_token
            })
          }
        );

        if (replyResponse.ok) {
          toast.success(`رد تلقائي على تعليق: ${comment.from?.name}`);
        }
      }
    } catch (error) {
      console.error(`Auto-reply error for comment ${comment.id}:`, error);
    }
  };

  const replyToComment = async (commentId: string) => {
    if (!replyText.trim()) {
      toast.error("يرجى كتابة رد");
      return;
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${commentId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            message: replyText,
            access_token: selectedPage.access_token
          })
        }
      );

      const result = await response.json();

      if (result.error) {
        throw new Error(`خطأ فيسبوك: ${result.error.message} (كود: ${result.error.code})`);
      }

      toast.success("✅ تم إرسال الرد بنجاح!");
      setReplyText("");
      setReplyingToId("");
      
      setComments([]);
      setNextCommentsUrl(null);
      await loadComments();

    } catch (error) {
      toast.error(`❌ فشل في إرسال الرد: ${(error as Error).message}`);
    }
  };

  // دالة تحليل الصورة للإجابة على الأسئلة
  const analyzeImageForReply = async (imageUrl: string, userQuestion: string, postContent: string) => {
    try {
      // تحويل الصورة إلى base64
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.readAsDataURL(blob);
      });

      // استدعاء دالة Supabase لتحليل الصورة
      const analysisResponse = await fetch(`${window.location.origin}/functions/v1/gemini-image-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64,
          imageMimeType: blob.type,
          prompt: userQuestion,
          action: "answer",
          postContent: postContent
        })
      });

      if (analysisResponse.ok) {
        const result = await analysisResponse.json();
        return result.text || result.analysis || null;
      }
    } catch (error) {
      console.error('Error analyzing image for reply:', error);
    }
    return null;
  };

  // دالة تحليل عام للصورة
  const analyzePostImage = async (imageUrl: string, prompt = "حلل محتوى هذه الصورة بالتفصيل") => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.readAsDataURL(blob);
      });

      const analysisResponse = await fetch(`${window.location.origin}/functions/v1/gemini-image-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64,
          imageMimeType: blob.type,
          prompt: prompt,
          action: "analyze"
        })
      });

      if (analysisResponse.ok) {
        const result = await analysisResponse.json();
        return result.text || result.analysis || null;
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
    }
    return null;
  };

  const generateSmartReply = async (commentText: string, commentData?: Comment) => {
    setGenerating(true);
    try {
      // استخدام منطق الرد الذكي المتقدم
      const selectedPost = posts.find(post => post.id === selectedPostId);
      const postContent = selectedPost?.message || "";
      
      // تحديد ما إذا كان السؤال حول الصورة
      const commentTextLower = commentText.toLowerCase();
      const isImageQuestion =
        commentTextLower.includes('صور') ||
        commentTextLower.includes('صورة') ||
        commentTextLower.includes('عناصر') ||
        commentTextLower.includes('عناصر الصورة') ||
        commentTextLower.includes('صورة المنشور') ||
        commentTextLower.includes('شو') ||
        commentTextLower.includes('ايش') ||
        commentTextLower.includes('وين') ||
        commentTextLower.includes('كيف') ||
        commentTextLower.includes('متى') ||
        commentTextLower.includes('price') ||
        commentTextLower.includes('سعر') ||
        commentTextLower.includes('location') ||
        commentTextLower.includes('مكان') ||
        commentTextLower.includes('فين') ||
        commentTextLower.includes('كم') ||
        commentTextLower.includes('details') ||
        commentTextLower.includes('تفاصيل') ||
        commentTextLower.includes('image') ||
        commentTextLower.includes('photo') ||
        commentTextLower.includes('picture');

      let postImageUrl =
        selectedPost?.full_picture ||
        selectedPost?.picture ||
        selectedPost?.attachments?.data?.[0]?.media?.image?.src;

      // إذا كان السؤال يتعلق بالصورة، استخدام تحليل الصور مع Gemini
      if (isImageQuestion && postImageUrl) {
        toast.info("تحليل الصورة للإجابة على السؤال...");
        const imageAnalysisReply = await analyzeImageForReply(postImageUrl, commentText, postContent);
        if (imageAnalysisReply) {
          setReplyText(imageAnalysisReply);
          toast.success("تم توليد رد ذكي بناءً على تحليل الصورة!");
          return;
        }
      }

      // معالجة حالة البحث عن صورة المنشور
      if (isImageQuestion && commentData?.id) {
        const postId = commentData.id.split('_')[0];
        try {
          const response = await fetch(
            `https://graph.facebook.com/v19.0/${postId}?` +
            `fields=id,message,full_picture,picture&` +
            `access_token=${selectedPage.access_token}`
          );
          
          const postData = await response.json();
          if (!postData.error && (postData.full_picture || postData.picture)) {
            postImageUrl = postData.full_picture || postData.picture;
            toast.success("تم العثور على صورة المنشور");
            
            // إعادة محاولة تحليل الصورة
            const imageAnalysisReply = await analyzeImageForReply(postImageUrl, commentText, postContent);
            if (imageAnalysisReply) {
              setReplyText(imageAnalysisReply);
              toast.success("تم توليد رد ذكي بناءً على تحليل الصورة!");
              return;
            }
          }
        } catch (error) {
          console.warn('Could not fetch post image:', error);
        }
      }

      // تحليل الصورة أولاً إذا كانت متوفرة
      let imageAnalysis = null;
      if (postImageUrl) {
        try {
          toast.info("جاري تحليل الصورة...");
          const imageAnalysisResponse = await fetch(`https://msrtbumkztdwtoqysykf.supabase.co/functions/v1/facebook-image-analyzer`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageUrl: postImageUrl,
              postContent: postContent || "",
              userComment: commentText,
              analysisType: 'comment'
            })
          });

          if (imageAnalysisResponse.ok) {
            imageAnalysis = await imageAnalysisResponse.json();
            console.log('تحليل الصورة:', imageAnalysis);
            if (imageAnalysis.hasImage) {
              toast.success("تم تحليل الصورة بنجاح");
            }
          } else {
            console.warn('فشل في تحليل الصورة:', imageAnalysisResponse.status);
          }
        } catch (imageError) {
          console.error('خطأ في تحليل الصورة:', imageError);
          toast.warning("لم يتم تحليل الصورة، سيتم الاعتماد على النص فقط");
        }
      }

      let enhancedPrompt = `أنت مساعد ذكي متخصص في تحليل المنشورات والصور والرد على التعليقات بطريقة مفيدة ودقيقة وودية.

محتوى المنشور:
${postContent || "لا يوجد نص للمنشور"}

${postImageUrl ? `المنشور يحتوي على صورة: ${postImageUrl}` : "لا توجد صورة"}`;

      // إضافة تحليل الصورة إذا كان متوفراً
      if (imageAnalysis && imageAnalysis.hasImage) {
        enhancedPrompt += `

=== تحليل الصورة المرفقة ===
وصف الصورة: ${imageAnalysis.imageDescription || "تم تحليل الصورة"}

المعلومات المستخرجة من الصورة:
${imageAnalysis.extractedInfo?.text?.length > 0 ? `- النصوص: ${imageAnalysis.extractedInfo.text.join(', ')}` : ''}
${imageAnalysis.extractedInfo?.numbers?.length > 0 ? `- الأرقام/الأسعار: ${imageAnalysis.extractedInfo.numbers.join(', ')}` : ''}
${imageAnalysis.extractedInfo?.locations?.length > 0 ? `- المواقع/العناوين: ${imageAnalysis.extractedInfo.locations.join(', ')}` : ''}
${imageAnalysis.extractedInfo?.products?.length > 0 ? `- المنتجات/الخدمات: ${imageAnalysis.extractedInfo.products.join(', ')}` : ''}
${imageAnalysis.extractedInfo?.dates?.length > 0 ? `- التواريخ: ${imageAnalysis.extractedInfo.dates.join(', ')}` : ''}
${imageAnalysis.extractedInfo?.other?.length > 0 ? `- معلومات أخرى: ${imageAnalysis.extractedInfo.other.join(', ')}` : ''}

علاقة الصورة بالتعليق: ${imageAnalysis.relevanceToComment || "ذات صلة"}
هل يمكن للصورة الإجابة على السؤال: ${imageAnalysis.canAnswerQuestion ? 'نعم' : 'لا'}`;
      }

      enhancedPrompt += `

تعليق/سؤال المستخدم:
"${commentText}"

إرشادات مهمة للتحليل الذكي المتقدم:
- أعط الأولوية للمعلومات المستخرجة من الصورة إذا كانت متوفرة
- إذا سأل المستخدم عن معلومات موجودة في الصورة، استخدمها مباشرة
- لا تنكر وجود صورة إذا كانت موجودة ومُحللة
- ابحث في النص الأصلي والصورة بدقة فائقة عن أي معلومات اتصال إضافية
- لا تقل "لا يوجد رقم هاتف" إذا كان موجود فعلاً في النص أو الصورة
- استخرج المعلومات الدقيقة من النص والصورة بدلاً من إعطاء ردود عامة
- اكتب باللغة العربية بأسلوب ودود ومهني يتناسب مع نوع المحتوى
- كن مختصراً ومباشراً ومفيداً (أقل من 150 كلمة)
- إذا كان السؤال عن السعر أو التفاصيل، ابحث في المحتوى والصورة أولاً قبل طلب التواصل
- إذا كان التعليق إيجابي، اشكر المعلق بطريقة مناسبة
- راعي السياق والموضوع في ردك

قم بتحليل المحتوى والصورة بدقة شديدة وقدم رد ذكي ومناسب على تعليق المستخدم:`;

      // محاولة استخدام نماذج مختلفة كنظام fallback
      const models = [
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash',
        'gemini-2.0-flash-exp'
      ];

      let lastError;
      
      for (const model of models) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: enhancedPrompt
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 400,
              }
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            lastError = new Error(`خطأ في نموذج ${model} (${response.status}): ${errorText}`);
            
            // إذا كان الخطأ 429 (quota exceeded)، جرب النموذج التالي
            if (response.status === 429) {
              console.log(`تم تجاوز حصة نموذج ${model}، جاري المحاولة مع النموذج التالي...`);
              continue;
            }
            
            throw lastError;
          }

          const data = await response.json();
          
          if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            lastError = new Error(`استجابة غير صحيحة من نموذج ${model}`);
            continue;
          }
          
          const generatedReply = data.candidates[0].content.parts[0].text;
          
          // Fix Arabic punctuation
          const fixedReply = generatedReply
            .replace(/(\w)\s*,\s*/g, '$1، ')
            .replace(/(\w)\s*\.\s*/g, '$1. ')
            .replace(/(\w)\s*!\s*/g, '$1! ')
            .replace(/(\w)\s*\?\s*/g, '$1؟ ')
            .trim();
          
          setReplyText(fixedReply);
          toast.success(`تم توليد رد ذكي باستخدام نموذج ${model}!`);
          return; // نجح الطلب، اخرج من الحلقة
          
        } catch (error) {
          lastError = error;
          console.log(`فشل نموذج ${model}:`, error);
          continue; // جرب النموذج التالي
        }
      }
      
      // إذا فشلت جميع النماذج
      throw lastError || new Error("فشلت جميع النماذج المتاحة");

    } catch (error) {
      console.error("Error generating smart reply:", error);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع";
      
      if (errorMessage.includes("429")) {
        toast.error("تم تجاوز الحد المسموح لـ Gemini API. يرجى المحاولة لاحقاً أو ترقية خطتك.", {
          duration: 8000
        });
      } else {
        toast.error(`فشل في توليد الرد الذكي: ${errorMessage}`);
      }
    } finally {
      setGenerating(false);
    }
  };

  // Auto-classify new comments
  const autoClassifyComments = async (commentsToClassify: Comment[]) => {
    const newClassifications: {[key: string]: any} = {};
    
    try {
      for (const comment of commentsToClassify) {
        if (comment.message && comment.message.trim() && !classifiedComments[comment.id]) {
          try {
            // Try intelligent classification first
            const intelligentClassification = await performIntelligentClassification(comment.message);
            newClassifications[comment.id] = intelligentClassification;
          } catch (error) {
            console.error(`Intelligent classification failed for comment ${comment.id}:`, error);
            // Fallback to basic classification
            const classification = getBasicClassification(comment.message);
            newClassifications[comment.id] = classification;
          }
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      setClassifiedComments(prev => ({ ...prev, ...newClassifications }));
      
      if (Object.keys(newClassifications).length > 0) {
        toast.success(`تم تصنيف ${Object.keys(newClassifications).length} تعليق تلقائياً`);
      }
      
    } catch (error) {
      console.error('خطأ في التصنيف التلقائي:', error);
    }
  };

  const performIntelligentClassification = async (commentText: string) => {
    const prompt = `أنت نظام ذكي لتصنيف التعليقات على منشورات فيسبوك. قم بتحليل التعليق التالي وتصنيفه:

التعليق: "${commentText}"

قم بتصنيف التعليق إلى واحدة من الفئات التالية:
1. داعم - تعليق إيجابي يدعم المحتوى أو يشكر أو يمدح
2. استفسار - سؤال عام أو طلب معلومات عامة
3. طلب تفاصيل - طلب تفاصيل محددة مثل السعر، المدة، الحجم، التوقيت، الألوان، المواصفات
4. طلب تواصل - طلب معلومات التواصل مثل العنوان، الهاتف، البريد الإلكتروني، الموقع
5. شكوى - تعليق سلبي أو شكوى أو انتقاد
6. سبام - تعليق مكرر أو غير مناسب أو إعلان غير مرغوب
7. طلب خدمة - طلب مباشر لخدمة أو منتج
8. مناقشة - تعليق يفتح نقاش أو يضيف معلومة مفيدة
9. غير مفهوم - تعليق غير واضح أو بلغة أخرى

أريد منك الرد في صيغة JSON بهذا الشكل فقط:
{
  "type": "نوع التصنيف",
  "confidence": رقم من 0 إلى 100,
  "description": "وصف مختصر للتصنيف"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 200,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to classify comment');
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    
    // محاولة استخراج JSON من النص
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Could not parse classification result');
    }
  };

  const getBasicClassification = (text: string) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("شكرا") || lowerText.includes("ممتاز") || lowerText.includes("رائع")) {
      return {
        type: "داعم",
        confidence: 75,
        description: "تعليق إيجابي داعم"
      };
    } else if (lowerText.includes("سعر") || lowerText.includes("كم") || lowerText.includes("مدة")) {
      return {
        type: "طلب تفاصيل",
        confidence: 85,
        description: "طلب تفاصيل محددة"
      };
    } else if (lowerText.includes("رقم") || lowerText.includes("هاتف") || lowerText.includes("عنوان")) {
      return {
        type: "طلب تواصل",
        confidence: 85,
        description: "طلب معلومات التواصل"
      };
    } else if (lowerText.includes("كيف") || lowerText.includes("ماذا") || lowerText.includes("؟")) {
      return {
        type: "استفسار",
        confidence: 70,
        description: "سؤال أو استفسار عام"
      };
    } else {
      return {
        type: "مناقشة",
        confidence: 60,
        description: "تعليق عام"
      };
    }
  };

  // Single comment classification
  const classifyComment = async (comment: Comment) => {
    const prompt = `صنف التعليق التالي إلى إحدى الفئات:
          
التعليق: "${comment.message}"
المؤلف: ${comment.from?.name || 'غير معروف'}

الفئات المتاحة:
- سبام: إعلانات أو محتوى غير مرغوب
- مهاجم: تعليقات عدائية أو مسيئة
- شكوى: شكاوى أو انتقادات
- استفسار: أسئلة تحتاج إجابة
- طلب خدمة: طلب معلومات أو خدمات
- مناقشة: نقاش بناء أو آراء
- داعم: تعليقات إيجابية أو مدح

أجب بكلمة واحدة فقط من الفئات المذكورة:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 50,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('فشل في التصنيف');
    }

    const data = await response.json();
    let classification = data.candidates[0].content.parts[0].text.trim();
    
    // تنظيف النتيجة
    classification = classification.replace(/[^\u0600-\u06FF\u0750-\u077F]/g, '').trim();
    
    // تحديد الأولوية واللون والأيقونة
    let priority = 999;
    let color = 'bg-gray-500';
    let icon = null;
    
    switch (classification) {
      case 'سبام':
        priority = 1;
        color = 'bg-red-600';
        icon = <AlertTriangle className="h-3 w-3" />;
        break;
      case 'مهاجم':
        priority = 2;
        color = 'bg-red-500';
        icon = <Frown className="h-3 w-3" />;
        break;
      case 'شكوى':
        priority = 3;
        color = 'bg-orange-600';
        icon = <Frown className="h-3 w-3" />;
        break;
      case 'استفسار':
        priority = 4;
        color = 'bg-blue-600';
        icon = <HelpCircle className="h-3 w-3" />;
        break;
      case 'طلب خدمة':
        priority = 5;
        color = 'bg-purple-600';
        icon = <Star className="h-3 w-3" />;
        break;
      case 'مناقشة':
        priority = 6;
        color = 'bg-teal-600';
        icon = <MessageSquare className="h-3 w-3" />;
        break;
      case 'داعم':
        priority = 7;
        color = 'bg-green-600';
        icon = <Heart className="h-3 w-3" />;
        break;
      default:
        classification = 'مناقشة';
        priority = 6;
        color = 'bg-teal-600';
        icon = <MessageSquare className="h-3 w-3" />;
    }
    
    return {
      type: classification,
      priority,
      color,
      icon
    };
  };

  // Batch classify all comments
  const classifyAllComments = async () => {
    if (comments.length === 0) {
      toast.error('لا توجد تعليقات للتصنيف');
      return;
    }
    
    setClassifyingAll(true);
    let successCount = 0;
    
    try {
      const newClassifications: {[key: string]: any} = {};
      
      for (const comment of comments) {
        if (classifiedComments[comment.id]) continue; // Skip already classified
        
        try {
          // Try intelligent classification first
          const intelligentClassification = await performIntelligentClassification(comment.message);
          newClassifications[comment.id] = intelligentClassification;
          successCount++;
          
          // Hide aggressive comments automatically
          if (intelligentClassification.type === 'مهاجم') {
            setHiddenComments(prev => new Set([...prev, comment.id]));
          }
          
        } catch (error) {
          console.error(`خطأ في تصنيف التعليق ${comment.id}:`, error);
          // Fallback to basic classification
          try {
            const basicClassification = getBasicClassification(comment.message);
            newClassifications[comment.id] = basicClassification;
            successCount++;
          } catch (basicError) {
            console.error(`فشل في التصنيف الأساسي للتعليق ${comment.id}:`, basicError);
          }
        }
        
        // تأخير بسيط لتجنب تجاوز حدود API
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setClassifiedComments(prev => ({ ...prev, ...newClassifications }));
      toast.success(`تم تصنيف ${successCount} تعليق بنجاح`);
      
    } catch (error) {
      console.error('خطأ في التصنيف الجماعي:', error);
      toast.error('فشل في التصنيف الجماعي');
    } finally {
      setClassifyingAll(false);
    }
  };

  // Bulk smart reply to comments that need replies
  const bulkSmartReply = async () => {
    if (comments.length === 0) {
      toast.info('لا توجد تعليقات');
      return;
    }
    
    setBulkReplying(true);
    let successCount = 0;
    
    try {
      // العثور على التعليقات التي تحتاج رد - إما مصنفة أو غير مصنفة وبدون ردود
      let commentsNeedingReply;
      
      // إذا كان هناك تصنيفات، استخدمها
      if (Object.keys(classifiedComments).length > 0) {
        commentsNeedingReply = comments.filter(comment => {
          const classification = classifiedComments[comment.id]?.type;
          const needsReply = classification && ['استفسار', 'طلب خدمة', 'شكوى'].includes(classification);
          const hasNoReplies = !comment.comment_count || comment.comment_count === 0;
          const isNotHidden = !hiddenComments.has(comment.id);
          return needsReply && hasNoReplies && isNotHidden;
        });
      } else {
        // إذا لم يكن هناك تصنيفات، ابحث عن التعليقات بدون ردود
        commentsNeedingReply = comments.filter(comment => {
          const hasNoReplies = !comment.comment_count || comment.comment_count === 0;
          const isNotHidden = !hiddenComments.has(comment.id);
          return hasNoReplies && isNotHidden && comment.message && comment.message.trim().length > 0;
        });
      }
      
      if (commentsNeedingReply.length === 0) {
        toast.info('لا توجد تعليقات تحتاج رد');
        return;
      }
      
      for (const comment of commentsNeedingReply) {
        try {
          const generatedReply = await generateContextualReply(comment.message);
          
          const replyResponse = await fetch(
            `https://graph.facebook.com/v19.0/${comment.id}/comments`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                message: generatedReply,
                access_token: selectedPage.access_token
              })
            }
          );

          const result = await replyResponse.json();

          if (!result.error) {
            successCount++;
          } else {
            console.error("Reply error:", result.error);
          }
          
          // تأخير بين الردود لتجنب تجاوز حدود API
          await new Promise(resolve => setTimeout(resolve, 3000));
          
        } catch (error) {
          console.error(`خطأ في الرد على التعليق ${comment.id}:`, error);
        }
      }
      
      toast.success(`تم الرد بنجاح على ${successCount} من ${commentsNeedingReply.length} تعليق`);
      
      if (successCount > 0) {
        // إعادة تحميل التعليقات لعرض الردود الجديدة
        await loadComments();
      }
      
    } catch (error) {
      console.error('خطأ في الرد الجماعي:', error);
      toast.error('فشل في الرد الجماعي');
    } finally {
      setBulkReplying(false);
    }
  };

  const generateContextualReply = async (commentText: string): Promise<string> => {
    const fallbackReplies = [
      "شكراً لك على تعليقك المفيد! 🙏",
      "نقدر تفاعلك معنا، وسنوافيك بالمزيد من التفاصيل قريباً 📞",
      "أهلاً وسهلاً، يمكنك التواصل معنا للاستفسار عن أي تفاصيل إضافية 💬",
      "مرحباً بك! نحن سعداء بتفاعلك وسنرد عليك في أقرب وقت ⭐"
    ];

    try {
      const selectedPost = posts.find(post => post.id === selectedPostId);
      const postContent = selectedPost?.message || "منشور على فيسبوك";

      const prompt = `أنت مساعد ذكي للرد على تعليقات فيسبوك.

محتوى المنشور:
${postContent}

تعليق المستخدم:
"${commentText}"

إرشادات:
- رد مفيد ومهذب باللغة العربية
- كن مختصراً (أقل من 30 كلمة)
- استخدم محتوى المنشور للإجابة إذا أمكن
- إذا كان سؤالاً، قدم إجابة مفيدة أو اطلب التواصل
- إذا كان إيجابياً، اشكره باختصار
- تجنب الرد على التعليقات السلبية أو المهاجمة

الرد:`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 100,
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const generatedReply = data.candidates[0].content.parts[0].text.trim();
        return generatedReply;
      } else {
        console.error("Gemini API error:", await response.text());
        throw new Error("Failed to generate reply with Gemini");
      }
      
    } catch (error) {
      console.error("Error generating contextual reply:", error);
      return fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
    }
  };

  // Comment action functions
  const hideComment = async (commentId: string) => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${commentId}?access_token=${selectedPage.access_token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            is_hidden: 'true'
          })
        }
      );

      const result = await response.json();

      if (result.error) {
        console.error("Hide comment API error:", result.error);
        
        // معالجة محسنة لحالات مختلفة من أخطاء إخفاء التعليقات
        if (result.error.code === 200) {
          const errorMessage = result.error.message || "";
          let description = "سيتم إخفاؤه محلياً فقط";
          
          // تحديد السبب المحتمل للخطأ
          if (errorMessage.includes("admin") || errorMessage.includes("owner")) {
            description = "التعليق من مشرف الصفحة - لا يمكن إخفاؤه";
          } else if (errorMessage.includes("permission")) {
            description = "صلاحيات غير كافية لإخفاء هذا التعليق";
          } else if (errorMessage.includes("post")) {
            description = "قد يكون التعليق من منشور آخر";
          }
          
          toast.warning("⚠️ تعذر إخفاء التعليق على فيسبوك", {
            description: description
          });
        } else if (result.error.error_subcode === 1446036) {
          // التعليق مُصنف بالفعل كسبام
          toast.info("ℹ️ التعليق مُصنف بالفعل كسبام", {
            description: "لا يمكن إخفاء التعليقات المُصنفة كسبام - سيتم إخفاؤه محلياً"
          });
        } else if (result.error.code === 1) {
          // خطأ OAuth عام
          const errorMessage = result.error.message || "";
          let description = "سيتم إخفاؤه محلياً فقط";
          
          if (errorMessage.includes("spam")) {
            description = "التعليق مُصنف كسبام بالفعل - لا يمكن إخفاؤه";
          } else if (errorMessage.includes("duplicate")) {
            description = "طلب مكرر - التعليق مُعالج بالفعل";
          }
          
          toast.warning("⚠️ لا يمكن إخفاء هذا التعليق", {
            description: description
          });
        } else {
          toast.error(`❌ فشل إخفاء التعليق: ${result.error.message}`);
        }
        
        // إخفاء محلي كحل بديل
        setHiddenComments(prev => new Set([...prev, commentId]));
        return;
      }

      setHiddenComments(prev => new Set([...prev, commentId]));
      toast.success("✅ تم إخفاء التعليق على فيسبوك بنجاح!");

    } catch (error) {
      console.error("Hide comment error:", error);
      // إخفاء محلي كحل بديل
      setHiddenComments(prev => new Set([...prev, commentId]));
      toast.error("❌ فشل في الاتصال - تم الإخفاء محلياً فقط");
    }
  };

  const showComment = async (commentId: string) => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${commentId}?access_token=${selectedPage.access_token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            is_hidden: 'false'
          })
        }
      );

      const result = await response.json();

      if (result.error) {
        console.error("Show comment API error:", result.error);
        
        if (result.error.code === 200) {
          toast.error("⚠️ لا يمكن إظهار هذا التعليق - قد يكون من منشور صفحة أخرى أو لا تملك الصلاحية", {
            description: "إظهار محلي فقط"
          });
        } else {
          toast.error(`❌ فشل إظهار التعليق: ${result.error.message}`);
        }
        
        // إظهار محلي كحل بديل
        setHiddenComments(prev => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
        return;
      }

      setHiddenComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
      toast.success("✅ تم إظهار التعليق على فيسبوك بنجاح!");

    } catch (error) {
      console.error("Show comment error:", error);
      // إظهار محلي كحل بديل
      setHiddenComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
      toast.error("❌ فشل في الاتصال - تم الإظهار محلياً فقط");
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm("⚠️ هل أنت متأكد من حذف هذا التعليق نهائياً؟\n\nملاحظة: يمكن حذف التعليقات فقط إذا كانت:\n• على منشورات صفحتك\n• أو كتبتها صفحتك\n\nلا يمكن التراجع عن هذا الإجراء.")) {
      return;
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${commentId}?access_token=${selectedPage.access_token}`,
        {
          method: 'DELETE'
        }
      );

      const result = await response.json();

      if (result.error) {
        console.error("Delete comment API error:", result.error);
        
        if (result.error.code === 200) {
          toast.error("⚠️ لا يمكن حذف هذا التعليق", {
            description: "قد يكون التعليق من صفحة أخرى أو لا تملك الصلاحية لحذفه"
          });
        } else {
          toast.error(`❌ فشل في حذف التعليق: ${result.error.message}`);
        }
        return;
      }

      if (result.success === true || response.ok) {
        // إزالة التعليق من القائمة المحلية
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        setHiddenComments(prev => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
        toast.success("✅ تم حذف التعليق من فيسبوك بنجاح!");
      } else {
        throw new Error("استجابة غير متوقعة من فيسبوك");
      }

    } catch (error) {
      console.error("Delete comment error:", error);
      toast.error(`❌ فشل في حذف التعليق: ${(error as Error).message}`);
    }
  };

  // Filter and sort comments
  const filteredComments = comments.filter(comment => {
    const matchesSearch = !searchKeyword || 
      comment.message?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      comment.from?.name?.toLowerCase().includes(searchKeyword.toLowerCase());
    
    let matchesClassification = true;
    
    if (activeClassificationTab === "مخفية") {
      return matchesSearch && hiddenComments.has(comment.id);
    } else if (activeClassificationTab === "all") {
      matchesClassification = !hiddenComments.has(comment.id);
    } else {
      matchesClassification = classifiedComments[comment.id]?.type === activeClassificationTab && !hiddenComments.has(comment.id);
    }
    
    return matchesSearch && matchesClassification;
  }).sort((a, b) => {
    const dateA = new Date(a.created_time).getTime();
    const dateB = new Date(b.created_time).getTime();
    const likesA = a.reactions?.summary?.total_count || a.like_count || 0;
    const likesB = b.reactions?.summary?.total_count || b.like_count || 0;
    const repliesA = a.comment_count || 0;
    const repliesB = b.comment_count || 0;
    
    if (Object.keys(classifiedComments).length > 0 && sortBy === "newest") {
      const priorityA = classifiedComments[a.id]?.priority || 999;
      const priorityB = classifiedComments[b.id]?.priority || 999;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
    }
    
    switch (sortBy) {
      case "oldest":
        return dateA - dateB;
      case "most_likes":
        return likesB - likesA;
      case "most_replies":
        return repliesB - repliesA;
      case "newest":
      default:
        return dateB - dateA;
    }
  });

  // Count comments by classification
  const commentsCounts = {
    all: comments.filter(c => !hiddenComments.has(c.id)).length,
    'مخفية': hiddenComments.size,
    'سبام': 0,
    'مهاجم': 0,
    'شكوى': 0,
    'استفسار': 0,
    'طلب خدمة': 0,
    'مناقشة': 0,
    'داعم': 0
  };

  Object.entries(classifiedComments).forEach(([commentId, classification]: [string, any]) => {
    if (!hiddenComments.has(commentId) && commentsCounts.hasOwnProperty(classification.type)) {
      commentsCounts[classification.type]++;
    }
  });

  const availableTabs = [
    { value: "all", label: "الكل", count: commentsCounts.all, color: "text-gray-600" },
    { value: "مخفية", label: "مخفية", count: commentsCounts['مخفية'], color: "text-gray-500", icon: <EyeOff className="h-4 w-4 mr-1" /> },
    { value: "سبام", label: "سبام", count: commentsCounts['سبام'], color: "text-red-600", icon: <AlertTriangle className="h-4 w-4 mr-1" /> },
    { value: "مهاجم", label: "مهاجم", count: commentsCounts['مهاجم'], color: "text-red-500", icon: <Frown className="h-4 w-4 mr-1" /> },
    { value: "شكوى", label: "شكوى", count: commentsCounts['شكوى'], color: "text-orange-600", icon: <Frown className="h-4 w-4 mr-1" /> },
    { value: "استفسار", label: "استفسار", count: commentsCounts['استفسار'], color: "text-blue-600", icon: <HelpCircle className="h-4 w-4 mr-1" /> },
    { value: "طلب خدمة", label: "طلب خدمة", count: commentsCounts['طلب خدمة'], color: "text-purple-600", icon: <Star className="h-4 w-4 mr-1" /> },
    { value: "مناقشة", label: "مناقشة", count: commentsCounts['مناقشة'], color: "text-teal-600", icon: <MessageSquare className="h-4 w-4 mr-1" /> },
    { value: "داعم", label: "داعم", count: commentsCounts['داعم'], color: "text-green-600", icon: <Heart className="h-4 w-4 mr-1" /> }
  ].filter(tab => tab.value === "all" || tab.value === "مخفية" || tab.count > 0);

  const saveGeminiApiKey = (key: string) => {
    localStorage.setItem("gemini-api-key", key);
    setGeminiApiKey(key);
    setShowApiKeyInput(false);
    toast.success("تم حفظ مفتاح Gemini API بنجاح");
  };

  return (
    <div className="space-y-4 arabic-text">

      {/* Main Comment Management Card */}
      <Card className="shadow-elegant border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-primary">
            <MessageSquare className="h-5 w-5" />
            إدارة التعليقات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Post Selection Row */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label className="text-sm font-medium mb-2 block">اختر المنشور</Label>
              <Select value={selectedPostId} onValueChange={setSelectedPostId}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="من طالب جامعي إلى رائد أعمال ناجح، قصة 'مذهلة الح'..." />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {posts.map((post) => (
                    <SelectItem key={post.id} value={post.id} className="hover:bg-accent">
                  {post.message ? 
                    `${post.message.substring(0, 50)}...` : 
                    `منشور ${post.created_time ? formatShortDateInArabic(post.created_time) : 'غير محدد'}`
                  }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={loadPosts} disabled={loading} className="bg-background">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Search and Sort Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">البحث في التعليقات</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث بالكلمات المفتاحية أو اسم المعلق"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">ترتيب التعليقات</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="newest">الأحدث أولاً</SelectItem>
                  <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                  <SelectItem value="most_likes">الأكثر إعجاباً</SelectItem>
                  <SelectItem value="most_replies">الأكثر ردوداً</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Toggle Switches Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 flex-1">
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-blue-600" />
                <div>
                  <Label className="text-sm font-medium">التصنيف التلقائي</Label>
                  <p className="text-xs text-muted-foreground">تصنيف فوري للتعليقات الجديدة</p>
                </div>
              </div>
              <Switch
                checked={autoClassifyEnabled}
                onCheckedChange={setAutoClassifyEnabled}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 flex-1">
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-green-600" />
                <div>
                  <Label className="text-sm font-medium">الرد التلقائي الذكي</Label>
                </div>
              </div>
              <Switch
                checked={autoReplyEnabled}
                onCheckedChange={setAutoReplyEnabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      {selectedPostId && (
        <Card className="shadow-elegant">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                التعليقات ({filteredComments.length})
                <Badge variant="destructive" className="text-xs">
                  {comments.filter(comment => 
                    (!comment.comment_count || comment.comment_count === 0) && 
                    !hiddenComments.has(comment.id)
                  ).length} بلا رد
                </Badge>
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={classifyAllComments}
                  disabled={classifyingAll || comments.length === 0}
                  className="bg-background"
                >
                  <Brain className={`h-4 w-4 mr-1 ${classifyingAll ? 'animate-spin' : ''}`} />
                  {classifyingAll ? "جاري التصنيف..." : "تصنيف جماعي"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={bulkSmartReply}
                  disabled={bulkReplying || comments.length === 0}
                  className="bg-background"
                >
                  <Zap className={`h-4 w-4 mr-1 ${bulkReplying ? 'animate-spin' : ''}`} />
                  {bulkReplying ? "جاري الرد..." : "رد ذكي جماعي"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => loadComments()} disabled={loading} className="bg-background">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  تحديث
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">جاري تحميل التعليقات...</p>
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد تعليقات</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Classification Tabs */}
                <Tabs value={activeClassificationTab} onValueChange={setActiveClassificationTab}>
                  <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 gap-1">
                    {availableTabs.slice(0, 5).map((tab) => (
                      <TabsTrigger 
                        key={tab.value} 
                        value={tab.value} 
                        className={`text-xs ${tab.color} flex items-center gap-1`}
                      >
                        {tab.icon}
                        {tab.label} ({tab.count})
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {availableTabs.length > 5 && (
                    <TabsList className="grid w-full grid-cols-3 gap-1 mt-2">
                      {availableTabs.slice(5).map((tab) => (
                        <TabsTrigger 
                          key={tab.value} 
                          value={tab.value} 
                          className={`text-xs ${tab.color} flex items-center gap-1`}
                        >
                          {tab.icon}
                          {tab.label} ({tab.count})
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  )}
                </Tabs>

                {/* Comments List */}
                <div className="space-y-3">
                  {filteredComments.map((comment) => (
                    <Card key={comment.id} className={`border-l-4 ${hiddenComments.has(comment.id) ? 'opacity-60' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{comment.from?.name || 'مستخدم غير معروف'}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDateInArabic(comment.created_time, true)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Classification Badge */}
                          {classifiedComments[comment.id] && (
                            <Badge className={`text-xs text-white flex items-center gap-1`}>
                              {classifiedComments[comment.id].icon}
                              {classifiedComments[comment.id].type}
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm mb-4 leading-relaxed">{comment.message}</p>

                        {/* Comment Actions */}
                        <div className="flex flex-wrap gap-2 items-center">
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setReplyingToId(replyingToId === comment.id ? "" : comment.id)}
                              className="text-xs"
                            >
                              <Reply className="h-3 w-3 mr-1" />
                              رد
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateSmartReply(comment.message, comment)}
                              disabled={generating}
                              className="text-xs"
                            >
                              <Sparkles className={`h-3 w-3 mr-1 ${generating ? 'animate-spin' : ''}`} />
                              ذكي
                            </Button>
                          </div>

                          <div className="flex gap-1">
                            {hiddenComments.has(comment.id) ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => showComment(comment.id)}
                                className="text-xs text-green-600"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                إظهار
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => hideComment(comment.id)}
                                className="text-xs text-gray-600"
                              >
                                <EyeOff className="h-3 w-3 mr-1" />
                                إخفاء
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteComment(comment.id)}
                              className="text-xs text-red-600"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              حذف
                            </Button>
                          </div>

                          {/* Smart Classification */}
                          <CommentClassifier 
                            commentText={comment.message}
                            authorName={comment.from?.name}
                            geminiApiKey={geminiApiKey}
                          />
                        </div>

                        {/* Reply Section */}
                        {replyingToId === comment.id && (
                          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                            <div className="space-y-3">
                              <Textarea
                                placeholder="اكتب ردك هنا..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="min-h-[80px] bg-background"
                              />
                              
                              {/* أزرار تحليل الصور الجديدة */}
                              <div className="border-t pt-3 mt-3">
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                      const selectedPost = posts.find(post => post.id === selectedPostId);
                                      const postImageUrl = selectedPost?.full_picture || selectedPost?.picture;
                                      
                                      if (postImageUrl) {
                                        setGenerating(true);
                                        try {
                                          const analysis = await analyzePostImage(postImageUrl);
                                          if (analysis) {
                                            setReplyText(`📸 تحليل الصورة:\n${analysis}`);
                                            toast.success("تم تحليل الصورة بنجاح!");
                                          } else {
                                            toast.error("فشل في تحليل الصورة");
                                          }
                                        } catch (error) {
                                          toast.error("خطأ في تحليل الصورة");
                                        } finally {
                                          setGenerating(false);
                                        }
                                      } else {
                                        toast.error("لا توجد صورة في هذا المنشور");
                                      }
                                    }}
                                    disabled={generating}
                                    className="flex items-center gap-1"
                                  >
                                    <Image className="h-3 w-3" />
                                    {generating ? "جاري التحليل..." : "تحليل الصورة"}
                                  </Button>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                      const selectedPost = posts.find(post => post.id === selectedPostId);
                                      const postImageUrl = selectedPost?.full_picture || selectedPost?.picture;
                                      const postContent = selectedPost?.message || "";
                                      
                                      if (postImageUrl) {
                                        setGenerating(true);
                                        try {
                                          const imageReply = await analyzeImageForReply(postImageUrl, comment.message, postContent);
                                          if (imageReply) {
                                            setReplyText(imageReply);
                                            toast.success("تم توليد رد بناءً على الصورة!");
                                          } else {
                                            toast.error("فشل في تحليل الصورة للإجابة");
                                          }
                                        } catch (error) {
                                          toast.error("خطأ في تحليل الصورة");
                                        } finally {
                                          setGenerating(false);
                                        }
                                      } else {
                                        toast.error("لا توجد صورة في هذا المنشور");
                                      }
                                    }}
                                    disabled={generating}
                                    className="flex items-center gap-1"
                                  >
                                    <Camera className="h-3 w-3" />
                                    {generating ? "جاري الإجابة..." : "إجابة عن الصورة"}
                                  </Button>
                                </div>

                                <SmartReply
                                  postContent={posts.find(post => post.id === selectedPostId)?.message}
                                  userComment={comment.message}
                                  onReplyGenerated={(reply) => setReplyText(reply)}
                                  selectedPage={selectedPage}
                                  commentData={comment}
                                />
                              </div>
                              
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setReplyingToId("");
                                    setReplyText("");
                                  }}
                                >
                                  إلغاء
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => replyToComment(comment.id)}
                                  disabled={!replyText.trim()}
                                >
                                  إرسال الرد
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Existing Replies */}
                        {commentReplies[comment.id] && commentReplies[comment.id].length > 0 && (
                          <div className="mt-4 pl-4 border-l-2 border-muted">
                            <p className="text-xs text-muted-foreground mb-2">الردود ({commentReplies[comment.id].length})</p>
                            {commentReplies[comment.id].slice(0, 2).map((reply, idx) => (
                              <div key={idx} className="text-xs p-2 bg-muted/30 rounded mb-1">
                                <strong>{reply.from?.name}:</strong> {reply.message}
                              </div>
                            ))}
                            {commentReplies[comment.id].length > 2 && (
                              <p className="text-xs text-muted-foreground">
                                و {commentReplies[comment.id].length - 2} ردود أخرى...
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {/* Load More Button */}
                  {nextCommentsUrl && (
                    <div className="text-center pt-4">
                      <Button
                        variant="outline"
                        onClick={() => loadComments(nextCommentsUrl)}
                        disabled={loadingMore}
                        className="bg-background"
                      >
                        {loadingMore ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                            جاري التحميل...
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-2" />
                            تحميل المزيد من التعليقات
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
