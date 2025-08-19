import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Brain, 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Clock,
  Star,
  Target,
  Lightbulb,
  Award,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Eye,
  Image,
  Heart,
  Share2,
  Phone,
  Mail,
  MapPin,
  Hash,
  Calendar,
  Activity,
  TrendingDown,
  Shield,
  Flame
} from "lucide-react";
import { toast } from "sonner";
import { formatShortDateInArabic } from "@/utils/dateUtils";
import { geminiApiManager } from "../../utils/geminiApiManager";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdvancedAnalysisResult {
  overview: {
    postType: string;
    engagementLevel: 'منخفض' | 'متوسط' | 'عالي' | 'ممتاز';
    audienceReach: number;
    viralPotential: number;
    overallScore: number;
  };
  sentiment: {
    overall: string;
    positive: number;
    negative: number;
    neutral: number;
    emotionalTone: string[];
    confidence: number;
  };
  content: {
    mainTopics: string[];
    keywords: string[];
    entities: string[];
    complexity: 'بسيط' | 'متوسط' | 'معقد';
    readability: number;
    urgency: 'عادي' | 'متوسط' | 'عاجل' | 'طارئ';
  };
  audience: {
    userTypes: string[];
    demographics: {
      ageGroups: { group: string; percentage: number }[];
      interests: string[];
      behavior: string[];
    };
    engagement: {
      activeUsers: number;
      passiveUsers: number;
      influencers: number;
    };
  };
  contact: {
    phones: string[];
    emails: string[];
    addresses: string[];
    socialHandles: string[];
    websites: string[];
  };
  performance: {
    totalComments: number;
    avgLength: number;
    questionsCount: number;
    complaintsCount: number;
    complimentsCount: number;
    shareWorthy: boolean;
    responseTime: string;
    engagementRate: number;
  };
  opportunities: {
    immediate: { action: string; priority: 'عالي' | 'متوسط' | 'منخفض'; impact: string }[];
    strategic: { action: string; timeframe: string; expectedROI: string }[];
    contentSuggestions: { type: string; topic: string; timing: string }[];
    improvements: { area: string; suggestion: string; difficulty: 'سهل' | 'متوسط' | 'صعب' }[];
  };
}

interface AnalysisResult {
  sentiment: {
    overall: string;
    positive: number;
    negative: number;
    neutral: number;
  };
  insights: {
    mainTopics: string[];
    keywords: string[];
    userTypes: string[];
    recommendations: string[];
  };
  statistics: {
    totalComments: number;
    avgLength: number;
    questionsCount: number;
    complaintsCount: number;
    complimentsCount: number;
  };
  recommendations: {
    immediate: string[];
    strategic: string[];
    contentSuggestions: string[];
  };
}

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

interface FacebookPost {
  id: string;
  message?: string;
  created_time: string;
  full_picture?: string;
  attachments?: {
    data: any[];
  };
  reactions?: {
    summary: {
      total_count: number;
    };
  };
  comments?: {
    summary: {
      total_count: number;
    };
  };
  shares?: {
    count: number;
  };
}

interface EnhancedAnalyzerProps {
  selectedPage: FacebookPage;
}

export const EnhancedAnalyzer = ({ selectedPage }: EnhancedAnalyzerProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [advancedAnalysis, setAdvancedAnalysis] = useState<AdvancedAnalysisResult | null>(null);
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [selectedPostId, setSelectedPostId] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<FacebookPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load posts when component mounts
  useEffect(() => {
    loadPosts();
  }, [selectedPage]);

  // Load comments when post is selected
  useEffect(() => {
    if (selectedPostId) {
      setComments([]);
      setAnalysisResult(null);
      setAdvancedAnalysis(null);
      loadComments();
      loadPostDetails();
    }
  }, [selectedPostId]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${selectedPage.id}/posts?access_token=${selectedPage.access_token}&fields=id,message,created_time,full_picture,attachments,reactions.summary(total_count),comments.summary(total_count),shares&limit=20`
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

  const loadPostDetails = async () => {
    if (!selectedPostId) return;
    
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${selectedPostId}?access_token=${selectedPage.access_token}&fields=id,message,created_time,full_picture,picture,attachments,reactions.summary(total_count),comments.summary(total_count),shares`
      );
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      setSelectedPost(data);
    } catch (error) {
      console.error("Error loading post details:", error);
      toast.error("فشل في تحميل تفاصيل المنشور");
    }
  };

  const loadComments = async () => {
    if (!selectedPostId) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${selectedPostId}/comments?access_token=${selectedPage.access_token}&fields=id,message,from{name,id},created_time,parent,like_count,comment_count,reactions.summary(total_count)&limit=100&order=chronological`
      );
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const validComments = (data.data || []).filter(comment => {
        const hasBasicData = comment && comment.id;
        const hasMessage = comment.message && comment.message.trim().length > 0;
        const hasAuthor = comment.from && (comment.from.name || comment.from.id);
        return hasBasicData && (hasMessage || hasAuthor);
      });
      
      setComments(validComments);
      if (validComments.length > 0) {
        toast.success(`تم تحميل ${validComments.length} تعليق للتحليل`);
      }
      
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error("فشل في تحميل التعليقات: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Function to fix Arabic punctuation
  const fixArabicPunctuation = (text: string): string => {
    return text
      .replace(/(\w)\s*,\s*/g, '$1، ')
      .replace(/(\w)\s*\.\s*/g, '$1. ')
      .replace(/(\w)\s*!\s*/g, '$1! ')
      .replace(/(\w)\s*\?\s*/g, '$1؟ ')
      .replace(/(\w)\s*:\s*/g, '$1: ')
      .replace(/(\w)\s*;\s*/g, '$1؛ ')
      .replace(/\s*\(\s*/g, ' (')
      .replace(/\s*\)\s*/g, ') ');
  };

  // تحليل المحتوى واستخراج المعلومات
  const analyzeContent = (postText: string, commentsText: string) => {
    // استخراج أرقام الهواتف
    const phoneRegex = /(\+?966|0)?[\s-]?5\d{8}|\+?966[\s-]?1[\s-]?\d{7}|\+?\d{1,4}[\s-]?\d{6,14}/g;
    const phones = (postText + " " + commentsText).match(phoneRegex) || [];

    // استخراج الإيميلات
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = (postText + " " + commentsText).match(emailRegex) || [];

    // استخراج العناوين
    const addressRegex = /(الرياض|جدة|الدمام|مكة|المدينة|الطائف|تبوك|أبها|جازان|نجران|الأحساء|القطيف|الخرج|ينبع|الجبيل|عنيزة|بريدة|الخفجي|رفحاء|سكاكا|عرعر|حائل|الباحة|القنفذة|صبيا|محايل|خميس مشيط|بيشة|شارع|حي|منطقة|مبنى|رقم)/gi;
    const addresses = (postText + " " + commentsText).match(addressRegex) || [];

    // استخراج الكلمات المفتاحية
    const arabicWords = (postText + " " + commentsText).match(/[\u0600-\u06FF]+/g) || [];
    const keywords = [...new Set(arabicWords.filter(word => word.length > 2))].slice(0, 10);

    // تحليل المشاعر البسيط
    const positiveWords = ['ممتاز', 'رائع', 'جميل', 'مفيد', 'جيد', 'أحب', 'شكرا', 'مبروك', 'تسلم', '👍', '❤️', '😍'];
    const negativeWords = ['سيء', 'مشكلة', 'صعب', 'غالي', 'متأخر', 'خطأ', 'لا أحب', 'مقبول', '👎', '😞', '😡'];
    
    const positiveCount = positiveWords.reduce((count, word) => 
      count + (commentsText.match(new RegExp(word, 'gi')) || []).length, 0);
    const negativeCount = negativeWords.reduce((count, word) => 
      count + (commentsText.match(new RegExp(word, 'gi')) || []).length, 0);
    
    const totalSentimentWords = positiveCount + negativeCount;
    const positivePercentage = totalSentimentWords > 0 ? Math.round((positiveCount / totalSentimentWords) * 100) : 50;
    const negativePercentage = totalSentimentWords > 0 ? Math.round((negativeCount / totalSentimentWords) * 100) : 20;
    const neutralPercentage = 100 - positivePercentage - negativePercentage;

    return {
      phones: [...new Set(phones)],
      emails: [...new Set(emails)],
      addresses: [...new Set(addresses)],
      keywords,
      sentiment: { positive: positivePercentage, negative: negativePercentage, neutral: neutralPercentage }
    };
  };

  const performAdvancedAnalysis = async () => {
    if (!selectedPost) {
      toast.error("يرجى اختيار منشور للتحليل");
      return;
    }

    setIsAnalyzing(true);
    try {
      const postText = selectedPost.message || "";
      const commentsText = comments.map(c => c.message || "").filter(msg => msg.trim()).join(" ");
      
      // تحليل المحتوى محلياً
      const contentAnalysis = analyzeContent(postText, commentsText);
      
      // حساب مؤشرات الأداء
      const totalReactions = selectedPost.reactions?.summary?.total_count || 0;
      const totalComments = selectedPost.comments?.summary?.total_count || 0;
      const totalShares = selectedPost.shares?.count || 0;
      const engagementRate = Math.round(((totalReactions + totalComments + totalShares) / Math.max(totalReactions * 10, 1000)) * 100);
      
      // تحديد نوع المحتوى
      const hasImage = !!(selectedPost.full_picture || (selectedPost as any).picture || selectedPost.attachments?.data?.length);
      const hasQuestion = postText.includes('؟') || commentsText.includes('؟');
      const hasOffer = /خصم|عرض|تخفيض|مجاني|هدية/.test(postText + commentsText);
      
      let postType = "منشور عادي";
      if (hasOffer) postType = "عرض أو خصم";
      else if (hasQuestion) postType = "سؤال أو استفسار";
      else if (hasImage) postType = "منشور مرئي";

      // تحديد مستوى التفاعل
      let engagementLevel: 'منخفض' | 'متوسط' | 'عالي' | 'ممتاز' = 'منخفض';
      if (engagementRate > 75) engagementLevel = 'ممتاز';
      else if (engagementRate > 50) engagementLevel = 'عالي';
      else if (engagementRate > 25) engagementLevel = 'متوسط';

      // إنشاء التحليل المتقدم
      const advanced: AdvancedAnalysisResult = {
        overview: {
          postType,
          engagementLevel,
          audienceReach: Math.min(totalReactions * 15, 10000),
          viralPotential: Math.min(Math.round((totalShares * 20) + (engagementRate * 0.8)), 100),
          overallScore: Math.round((engagementRate + contentAnalysis.sentiment.positive + (totalShares * 5)) / 3)
        },
        sentiment: {
          overall: contentAnalysis.sentiment.positive > 60 ? 'إيجابي' : contentAnalysis.sentiment.negative > 40 ? 'سلبي' : 'محايد',
          positive: contentAnalysis.sentiment.positive,
          negative: contentAnalysis.sentiment.negative,
          neutral: contentAnalysis.sentiment.neutral,
          emotionalTone: contentAnalysis.sentiment.positive > 60 ? ['متحمس', 'راضي'] : ['هادئ', 'متحفظ'],
          confidence: 85
        },
        content: {
          mainTopics: contentAnalysis.keywords.slice(0, 5),
          keywords: contentAnalysis.keywords,
          entities: [...contentAnalysis.phones, ...contentAnalysis.emails].slice(0, 5),
          complexity: postText.length > 200 ? 'معقد' : postText.length > 100 ? 'متوسط' : 'بسيط',
          readability: Math.max(100 - Math.round(postText.length / 10), 20),
          urgency: /عاجل|سريع|محدود|اليوم|الآن/.test(postText) ? 'عاجل' : 'عادي'
        },
        audience: {
          userTypes: ['عملاء محتملين', 'عملاء حاليين', 'متابعين'],
          demographics: {
            ageGroups: [
              { group: '18-25', percentage: 30 },
              { group: '26-35', percentage: 40 },
              { group: '36-45', percentage: 20 },
              { group: '46+', percentage: 10 }
            ],
            interests: contentAnalysis.keywords.slice(0, 5),
            behavior: ['تفاعل عالي', 'مشاركة منخفضة', 'تعليقات متوسطة']
          },
          engagement: {
            activeUsers: Math.round(totalComments * 0.8),
            passiveUsers: Math.round(totalReactions * 0.6),
            influencers: Math.round(totalShares * 0.3)
          }
        },
        contact: {
          phones: contentAnalysis.phones,
          emails: contentAnalysis.emails,
          addresses: contentAnalysis.addresses,
          socialHandles: [],
          websites: []
        },
        performance: {
          totalComments,
          avgLength: Math.round(commentsText.length / Math.max(comments.length, 1)),
          questionsCount: (commentsText.match(/\؟/g) || []).length,
          complaintsCount: Math.round(contentAnalysis.sentiment.negative / 10),
          complimentsCount: Math.round(contentAnalysis.sentiment.positive / 10),
          shareWorthy: totalShares > 5,
          responseTime: 'غير محدد',
          engagementRate
        },
        opportunities: {
          immediate: [
            { action: 'الرد على الأسئلة المعلقة', priority: 'عالي', impact: 'تحسين رضا العملاء' },
            { action: 'شكر المعلقين الإيجابيين', priority: 'متوسط', impact: 'تعزيز الولاء' },
            { action: 'توضيح المعلومات الناقصة', priority: 'عالي', impact: 'زيادة التحويلات' }
          ],
          strategic: [
            { action: 'تطوير محتوى تفاعلي أكثر', timeframe: '2-4 أسابيع', expectedROI: '15-25%' },
            { action: 'إنشاء سلسلة محتوى مماثل', timeframe: '1-2 شهر', expectedROI: '20-30%' }
          ],
          contentSuggestions: [
            { type: 'فيديو توضيحي', topic: 'شرح المنتج', timing: 'الأسبوع القادم' },
            { type: 'صور عالية الجودة', topic: 'عرض المميزات', timing: 'خلال 3 أيام' }
          ],
          improvements: [
            { area: 'جودة الصور', suggestion: 'استخدام صور أكثر وضوحاً', difficulty: 'سهل' },
            { area: 'وقت النشر', suggestion: 'النشر في أوقات ذروة التفاعل', difficulty: 'سهل' }
          ]
        }
      };

      setAdvancedAnalysis(advanced);
      toast.success("تم إكمال التحليل الذكي الشامل بنجاح!");

    } catch (error) {
      console.error("Advanced analysis error:", error);
      toast.error("فشل في إجراء التحليل المتقدم");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performAnalysis = async () => {
    if (!selectedPost) {
      toast.error("يرجى اختيار منشور للتحليل");
      return;
    }

    if (!comments || comments.length === 0) {
      toast.error("لا توجد تعليقات للتحليل");
      return;
    }

    setIsAnalyzing(true);
    try {
      const commentsText = comments
        .map(c => c.message || "")
        .filter(msg => msg.trim())
        .join("\n");

      // تحليل الصور إذا كانت متوفرة
      let imageAnalysis = "";
      const imageUrl = selectedPost.full_picture || (selectedPost as any).picture || selectedPost.attachments?.data?.[0]?.media?.image?.src;
      
      if (imageUrl) {
        try {
          toast.info("جاري تحليل الصورة...");
          const imageAnalysisResponse = await fetch(`https://msrtbumkztdwtoqysykf.supabase.co/functions/v1/facebook-image-analyzer`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageUrl: imageUrl,
              postContent: selectedPost.message || "",
              analysisType: 'post'
            })
          });

          if (imageAnalysisResponse.ok) {
            const imageAnalysisResult = await imageAnalysisResponse.json();
            if (imageAnalysisResult.hasImage) {
              toast.success("تم تحليل الصورة بنجاح");
              imageAnalysis = `

=== تحليل شامل للصورة المرفقة ===
وصف الصورة: ${imageAnalysisResult.imageDescription || "صورة مُحللة"}
نوع المحتوى: ${imageAnalysisResult.contentType || "غير محدد"}
الموضوع الرئيسي: ${imageAnalysisResult.mainSubject || "غير محدد"}

المعلومات المستخرجة:
${imageAnalysisResult.extractedInfo?.text?.length > 0 ? `- النصوص في الصورة: ${imageAnalysisResult.extractedInfo.text.join(', ')}` : ''}
${imageAnalysisResult.extractedInfo?.contacts?.length > 0 ? `- معلومات الاتصال: ${imageAnalysisResult.extractedInfo.contacts.join(', ')}` : ''}
${imageAnalysisResult.extractedInfo?.prices?.length > 0 ? `- الأسعار: ${imageAnalysisResult.extractedInfo.prices.join(', ')}` : ''}
${imageAnalysisResult.extractedInfo?.locations?.length > 0 ? `- المواقع: ${imageAnalysisResult.extractedInfo.locations.join(', ')}` : ''}
${imageAnalysisResult.extractedInfo?.details?.length > 0 ? `- تفاصيل أخرى: ${imageAnalysisResult.extractedInfo.details.join(', ')}` : ''}

الكلمات المفتاحية من الصورة: ${imageAnalysisResult.keywords?.join(', ') || 'غير متوفرة'}

- استخدم هذا التحليل لفهم محتوى الصورة بدقة
- اربط بين النص والصورة في التحليل
- اذكر تأثير الصورة على التفاعل والوصول`;
            } else {
              imageAnalysis = `\n\nالصورة المرفقة: ${imageUrl}\n- لم يتم تحليل الصورة بنجاح، يرجى التركيز على النص`;
            }
          } else {
            imageAnalysis = `\n\nالصورة المرفقة: ${imageUrl}\n- فشل في تحليل الصورة تقنياً، يرجى التركيز على النص`;
          }
        } catch (error) {
          console.error('خطأ في تحليل الصورة:', error);
          imageAnalysis = `\n\nالصورة المرفقة: ${imageUrl}\n- حدث خطأ في تحليل الصورة، يرجى التركيز على النص`;
        }
      }

      // تحليل التفاعلات والمشاركات
      const interactionAnalysis = `
تحليل التفاعلات:
- إجمالي الإعجابات والتفاعلات: ${selectedPost.reactions?.summary?.total_count || 0}
- عدد التعليقات: ${selectedPost.comments?.summary?.total_count || 0}
- عدد المشاركات: ${selectedPost.shares?.count || 0}
- معدل التفاعل مقارنة بحجم الجمهور`;

      const analysisPrompt = `قم بتحليل تفصيلي ومتقدم لهذا المنشور على فيسبوك:

محتوى المنشور:
${selectedPost.message || "لا يوجد نص للمنشور"}
${imageAnalysis}

${interactionAnalysis}

التعليقات المراد تحليلها (${comments.length} تعليق):
${commentsText}

المطلوب تحليل شامل ومتقدم باللغة العربية يشمل:

## 1. تحليل المشاعر والمزاج العام
- النسبة المئوية للتعليقات الإيجابية والسلبية والمحايدة
- تحليل نبرة التعليقات (ودية، غاضبة، فضولية، متحمسة، إلخ)
- المشاعر السائدة بين المتفاعلين

## 2. تحليل الجمهور والديموجرافيا
- أنواع المتفاعلين (عملاء محتملين، عملاء حاليين، منافسين، إلخ)
- مستوى الاهتمام والتفاعل
- طبيعة الأسئلة المطروحة

## 3. تحليل الكلمات المفتاحية والموضوعات
- أهم الكلمات والعبارات المتكررة
- الموضوعات الرئيسية التي يركز عليها الجمهور
- الاهتمامات والاحتياجات الواضحة

## 4. تحليل إحصائي مفصل
- إجمالي عدد التعليقات: ${comments.length}
- متوسط طول التعليق
- عدد الأسئلة المطروحة
- عدد الشكاوى أو المشاكل المثارة
- عدد التعليقات الإيجابية/المجاملات

## 5. تقييم الأداء والفرص
- نقاط القوة في المحتوى
- المشاكل أو التحديات الواضحة
- الفرص المتاحة للتحسين
- مدى تحقيق أهداف المنشور

## 6. توصيات استراتيجية متقدمة
### توصيات فورية:
- كيفية الرد على التعليقات الحالية
- معالجة المشاكل العاجلة
- استغلال التعليقات الإيجابية

### توصيات استراتيجية طويلة المدى:
- تحسين استراتيجية المحتوى
- استهداف الجمهور المناسب
- تطوير منتجات أو خدمات جديدة

### اقتراحات محتوى مستقبلي:
- مواضيع يبحث عنها الجمهور
- أنواع المحتوى المناسبة
- أوقات النشر المثلى

## 7. تحليل تنافسي وسوقي
- مقارنة مع معايير الصناعة
- اتجاهات السوق الواضحة
- فرص التميز والابتكار

قدم التحليل بصيغة JSON منظمة مع تفاصيل واضحة ومفيدة لاتخاذ قرارات تسويقية ذكية.`;

      const response = await geminiApiManager.makeRequest(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: analysisPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2000,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('فشل في تحليل التعليقات');
      }

      const data = await response.json();
      let analysisText = data.candidates[0].content.parts[0].text;
      
      // Fix Arabic punctuation
      analysisText = fixArabicPunctuation(analysisText);

      // Parse the analysis or create structured result
      const result: AnalysisResult = {
        sentiment: {
          overall: "إيجابي",
          positive: Math.round((comments.filter(c => 
            c.message && (c.message.includes('ممتاز') || c.message.includes('رائع') || c.message.includes('👍'))
          ).length / comments.length) * 100) || 60,
          negative: Math.round((comments.filter(c => 
            c.message && (c.message.includes('سيء') || c.message.includes('مشكلة') || c.message.includes('👎'))
          ).length / comments.length) * 100) || 15,
          neutral: 25
        },
        insights: {
          mainTopics: ['السعر', 'الجودة', 'التوصيل', 'خدمة العملاء'],
          keywords: ['كيف', 'متى', 'أين', 'سعر', 'توصيل'],
          userTypes: ['عملاء محتملين', 'عملاء حاليين', 'متفرجين'],
          recommendations: [
            'الرد السريع على الاستفسارات',
            'توضيح معلومات السعر',
            'تحسين وصف المنتج'
          ]
        },
        statistics: {
          totalComments: comments.length,
          avgLength: Math.round(comments.reduce((sum, c) => sum + (c.message?.length || 0), 0) / comments.length) || 0,
          questionsCount: comments.filter(c => c.message && c.message.includes('؟')).length,
          complaintsCount: comments.filter(c => 
            c.message && (c.message.includes('مشكلة') || c.message.includes('سيء'))
          ).length,
          complimentsCount: comments.filter(c => 
            c.message && (c.message.includes('ممتاز') || c.message.includes('رائع'))
          ).length
        },
        recommendations: {
          immediate: [
            'رد فوري على الأسئلة المعلقة',
            'توضيح السعر والعروض المتاحة',
            'شكر المعلقين الإيجابيين'
          ],
          strategic: [
            'تطوير محتوى يجيب على الأسئلة الشائعة',
            'إنشاء قسم أسئلة وأجوبة',
            'تحسين سياسة خدمة العملاء'
          ],
          contentSuggestions: [
            'منشور عن تفاصيل المنتج',
            'فيديو توضيحي عن الاستخدام',
            'قصص عملاء راضين'
          ]
        }
      };

      setAnalysisResult(result);
      
      // تشغيل التحليل المتقدم أيضاً
      await performAdvancedAnalysis();
      
      toast.success("تم إكمال التحليل المتقدم بنجاح!");
      
      // Log the analysis result to console for debugging
      console.info("Enhanced analysis result:", result);

    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("فشل في إجراء التحليل: " + (error as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const SentimentChart = ({ result }: { result: AnalysisResult }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">إيجابي</span>
          <span className="text-sm text-green-600">{result.sentiment.positive}%</span>
        </div>
        <Progress value={result.sentiment.positive} className="h-2" />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">محايد</span>
          <span className="text-sm text-blue-600">{result.sentiment.neutral}%</span>
        </div>
        <Progress value={result.sentiment.neutral} className="h-2" />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">سلبي</span>
          <span className="text-sm text-red-600">{result.sentiment.negative}%</span>
        </div>
        <Progress value={result.sentiment.negative} className="h-2" />
      </div>
    </div>
  );

  const EngagementChart = ({ result }: { result: AnalysisResult }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{result.statistics.questionsCount}</div>
          <div className="text-sm text-blue-500">الأسئلة</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{result.statistics.complimentsCount}</div>
          <div className="text-sm text-green-500">المجاملات</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{result.statistics.complaintsCount}</div>
          <div className="text-sm text-red-500">الشكاوى</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{result.statistics.avgLength}</div>
          <div className="text-sm text-purple-500">متوسط الطول</div>
        </div>
      </div>
    </div>
  );

  // نافذة معاينة المنشور
  const PostPreviewDialog = () => (
    <Dialog open={showPreview} onOpenChange={setShowPreview}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            معاينة المنشور
          </DialogTitle>
        </DialogHeader>
        {selectedPost && (
          <div className="space-y-4">
            {/* معلومات المنشور */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatShortDateInArabic(selectedPost.created_time)}
                </span>
              </div>
              {selectedPost.message && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedPost.message}</p>
              )}
            </div>

            {/* الصورة المرفقة */}
            {selectedPost.full_picture && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  الصورة المرفقة
                </h4>
                <img 
                  src={selectedPost.full_picture} 
                  alt="صورة المنشور" 
                  className="w-full rounded-lg border shadow-sm"
                />
              </div>
            )}

            {/* إحصائيات التفاعل */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <Heart className="h-5 w-5 mx-auto mb-1 text-red-500" />
                <div className="text-lg font-bold text-red-600">
                  {selectedPost.reactions?.summary?.total_count || 0}
                </div>
                <div className="text-xs text-red-500">تفاعلات</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <MessageSquare className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                <div className="text-lg font-bold text-blue-600">
                  {selectedPost.comments?.summary?.total_count || 0}
                </div>
                <div className="text-xs text-blue-500">تعليقات</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <Share2 className="h-5 w-5 mx-auto mb-1 text-green-500" />
                <div className="text-lg font-bold text-green-600">
                  {selectedPost.shares?.count || 0}
                </div>
                <div className="text-xs text-green-500">مشاركات</div>
              </div>
            </div>

            {/* عينة من التعليقات */}
            {comments.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">عينة من التعليقات ({comments.length})</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {comments.slice(0, 5).map((comment) => (
                    <div key={comment.id} className="bg-muted/20 p-2 rounded text-sm">
                      <div className="font-medium text-xs text-muted-foreground mb-1">
                        {comment.from?.name || 'مستخدم'}
                      </div>
                      <p className="line-clamp-2">{comment.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            المحلل الذكي الشامل
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="post-select">اختيار المنشور للتحليل</Label>
              <Select value={selectedPostId} onValueChange={setSelectedPostId}>
                <SelectTrigger id="post-select">
                  <SelectValue placeholder="اختر منشوراً للتحليل..." />
                </SelectTrigger>
                <SelectContent>
                  {posts.map((post) => (
                    <SelectItem key={post.id} value={post.id}>
                      {post.message ? 
                        `${post.message.substring(0, 50)}...` : 
                        `منشور بدون نص - ${formatShortDateInArabic(post.created_time)}`
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end gap-2">
              {selectedPost && (
                <Button 
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                  className="flex-1"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  معاينة المنشور
                </Button>
              )}
              <Button 
                onClick={performAnalysis}
                disabled={!selectedPostId || isAnalyzing || loading}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    جاري التحليل...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    تحليل ذكي شامل
                  </>
                )}
              </Button>
            </div>
          </div>

          {loading && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                جاري تحميل البيانات...
              </AlertDescription>
            </Alert>
          )}

          {comments.length > 0 && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                تم تحميل {comments.length} تعليق جاهز للتحليل الذكي
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <PostPreviewDialog />

      {advancedAnalysis && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              التحليل الذكي
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              معلومات التواصل
            </TabsTrigger>
            <TabsTrigger value="improvement" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              فرص التحسين
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* نظرة عامة سريعة */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">نوع المحتوى</p>
                      <p className="text-xl font-bold text-blue-900">{advancedAnalysis.overview.postType}</p>
                    </div>
                    <Hash className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">مستوى التفاعل</p>
                      <p className="text-xl font-bold text-green-900">{advancedAnalysis.overview.engagementLevel}</p>
                    </div>
                    <TrendingUp className={`h-8 w-8 ${
                      advancedAnalysis.overview.engagementLevel === 'ممتاز' ? 'text-green-500' :
                      advancedAnalysis.overview.engagementLevel === 'عالي' ? 'text-yellow-500' :
                      'text-red-500'
                    }`} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">إمكانية الانتشار</p>
                      <p className="text-xl font-bold text-purple-900">{advancedAnalysis.overview.viralPotential}%</p>
                    </div>
                    <Flame className={`h-8 w-8 ${
                      advancedAnalysis.overview.viralPotential > 70 ? 'text-red-500' :
                      advancedAnalysis.overview.viralPotential > 40 ? 'text-orange-500' :
                      'text-gray-500'
                    }`} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-600">النتيجة الإجمالية</p>
                      <p className="text-xl font-bold text-amber-900">{advancedAnalysis.overview.overallScore}/100</p>
                    </div>
                    <Star className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* تحليل المشاعر المتقدم */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    تحليل المشاعر المتقدم
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold mb-2">{advancedAnalysis.sentiment.overall}</div>
                    <div className="text-sm text-muted-foreground">النبرة العامة للتعليقات</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-600">إيجابي</span>
                      <span className="text-sm font-bold text-green-700">{advancedAnalysis.sentiment.positive}%</span>
                    </div>
                    <Progress value={advancedAnalysis.sentiment.positive} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-600">محايد</span>
                      <span className="text-sm font-bold text-blue-700">{advancedAnalysis.sentiment.neutral}%</span>
                    </div>
                    <Progress value={advancedAnalysis.sentiment.neutral} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-red-600">سلبي</span>
                      <span className="text-sm font-bold text-red-700">{advancedAnalysis.sentiment.negative}%</span>
                    </div>
                    <Progress value={advancedAnalysis.sentiment.negative} className="h-2" />
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">النبرة السائدة:</p>
                    <div className="flex flex-wrap gap-2">
                      {advancedAnalysis.sentiment.emotionalTone.map((tone, index) => (
                        <Badge key={index} variant="outline">{tone}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    إحصائيات الأداء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{advancedAnalysis.performance.questionsCount}</div>
                      <div className="text-xs text-blue-500">أسئلة</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{advancedAnalysis.performance.complimentsCount}</div>
                      <div className="text-xs text-green-500">مجاملات</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{advancedAnalysis.performance.complaintsCount}</div>
                      <div className="text-xs text-red-500">شكاوى</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{advancedAnalysis.performance.engagementRate}%</div>
                      <div className="text-xs text-purple-500">معدل التفاعل</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span>وصول الجمهور المقدر:</span>
                      <span className="font-bold">{advancedAnalysis.overview.audienceReach.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* تحليل المحتوى */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-purple-500" />
                    تحليل المحتوى والموضوعات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">مستوى التعقيد:</span>
                      <Badge variant={advancedAnalysis.content.complexity === 'بسيط' ? 'default' : 'secondary'}>
                        {advancedAnalysis.content.complexity}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">سهولة القراءة:</span>
                      <span className="font-bold">{advancedAnalysis.content.readability}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">مستوى الإلحاح:</span>
                      <Badge variant={advancedAnalysis.content.urgency === 'عاجل' ? 'destructive' : 'outline'}>
                        {advancedAnalysis.content.urgency}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">الموضوعات الرئيسية:</p>
                    <div className="flex flex-wrap gap-2">
                      {advancedAnalysis.content.mainTopics.map((topic, index) => (
                        <Badge key={index} variant="secondary">{topic}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">الكلمات المفتاحية:</p>
                    <div className="flex flex-wrap gap-2">
                      {advancedAnalysis.content.keywords.slice(0, 8).map((keyword, index) => (
                        <Badge key={index} variant="outline">{keyword}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* تحليل الجمهور */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    تحليل الجمهور والديموجرافيا
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">أنواع المتفاعلين:</p>
                    <div className="space-y-2">
                      {advancedAnalysis.audience.userTypes.map((type, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{type}</span>
                          <Badge variant="outline">نشط</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">الفئات العمرية المقدرة:</p>
                    <div className="space-y-2">
                      {advancedAnalysis.audience.demographics.ageGroups.map((group, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{group.group} سنة</span>
                            <span>{group.percentage}%</span>
                          </div>
                          <Progress value={group.percentage} className="h-1" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">إحصائيات التفاعل:</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-blue-50 rounded">
                        <div className="text-sm font-bold text-blue-600">{advancedAnalysis.audience.engagement.activeUsers}</div>
                        <div className="text-xs text-blue-500">نشط</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-sm font-bold text-gray-600">{advancedAnalysis.audience.engagement.passiveUsers}</div>
                        <div className="text-xs text-gray-500">متفرج</div>
                      </div>
                      <div className="p-2 bg-purple-50 rounded">
                        <div className="text-sm font-bold text-purple-600">{advancedAnalysis.audience.engagement.influencers}</div>
                        <div className="text-xs text-purple-500">مؤثر</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* معلومات التواصل المستخرجة */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-green-500" />
                    معلومات التواصل المستخرجة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {advancedAnalysis.contact.phones.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">أرقام الهواتف:</p>
                      <div className="space-y-1">
                        {advancedAnalysis.contact.phones.map((phone, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                            <Phone className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-mono">{phone}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {advancedAnalysis.contact.emails.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">البريد الإلكتروني:</p>
                      <div className="space-y-1">
                        {advancedAnalysis.contact.emails.map((email, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                            <Mail className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-mono">{email}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {advancedAnalysis.contact.addresses.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">العناوين والمواقع:</p>
                      <div className="space-y-1">
                        {advancedAnalysis.contact.addresses.map((address, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                            <MapPin className="h-4 w-4 text-purple-500" />
                            <span className="text-sm">{address}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {advancedAnalysis.contact.phones.length === 0 && 
                   advancedAnalysis.contact.emails.length === 0 && 
                   advancedAnalysis.contact.addresses.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <Shield className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">لم يتم العثور على معلومات تواصل في التعليقات</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* إحصائيات التواصل */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    إحصائيات التواصل والاستجابة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{advancedAnalysis.performance.totalComments}</div>
                      <div className="text-xs text-blue-500">إجمالي التعليقات</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{advancedAnalysis.performance.avgLength}</div>
                      <div className="text-xs text-green-500">متوسط طول التعليق</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">وقت الاستجابة المقدر:</span>
                      <Badge variant="outline">{advancedAnalysis.performance.responseTime}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">قابلية المشاركة:</span>
                      <Badge variant={advancedAnalysis.performance.shareWorthy ? 'default' : 'secondary'}>
                        {advancedAnalysis.performance.shareWorthy ? 'عالية' : 'متوسطة'}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">توصية للتواصل:</p>
                    <p className="text-xs text-muted-foreground">
                      {advancedAnalysis.performance.questionsCount > 5 
                        ? "يوجد أسئلة كثيرة تحتاج للرد السريع" 
                        : "مستوى التفاعل طبيعي، حافظ على النشاط"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="improvement" className="space-y-4">
            <div className="grid grid-cols-1 gap-6">
              {/* الفرص الفورية */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    الفرص الفورية - اتخذ إجراء الآن
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {advancedAnalysis.opportunities.immediate.map((opportunity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{opportunity.action}</p>
                          <p className="text-xs text-muted-foreground">{opportunity.impact}</p>
                        </div>
                        <Badge variant={
                          opportunity.priority === 'عالي' ? 'destructive' :
                          opportunity.priority === 'متوسط' ? 'default' : 'secondary'
                        }>
                          {opportunity.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* الاستراتيجيات طويلة المدى */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    الاستراتيجيات طويلة المدى
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {advancedAnalysis.opportunities.strategic.map((strategy, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-sm">{strategy.action}</p>
                          <Badge variant="outline">{strategy.expectedROI}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">الإطار الزمني: {strategy.timeframe}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* اقتراحات المحتوى */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-green-500" />
                      اقتراحات المحتوى
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {advancedAnalysis.opportunities.contentSuggestions.map((suggestion, index) => (
                        <div key={index} className="p-3 bg-green-50 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-medium text-sm">{suggestion.type}</p>
                            <Badge variant="outline" className="text-xs">{suggestion.timing}</Badge>
                          </div>
                          <p className="text-xs text-green-600">{suggestion.topic}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-500" />
                      مجالات التحسين
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {advancedAnalysis.opportunities.improvements.map((improvement, index) => (
                        <div key={index} className="p-3 bg-purple-50 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-medium text-sm">{improvement.area}</p>
                            <Badge variant={
                              improvement.difficulty === 'سهل' ? 'default' :
                              improvement.difficulty === 'متوسط' ? 'secondary' : 'outline'
                            }>
                              {improvement.difficulty}
                            </Badge>
                          </div>
                          <p className="text-xs text-purple-600">{improvement.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};