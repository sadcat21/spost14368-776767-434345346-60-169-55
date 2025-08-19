import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Sparkles, AlertTriangle, Settings, Eye, TrendingUp, MessageSquare, Target, Heart, BarChart3, Lightbulb, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SmartReplyProps {
  postContent?: string;
  postImageUrl?: string;
  userComment: string;
  onReplyGenerated: (reply: string) => void;
  selectedPage?: any; // Facebook page object
  commentData?: any; // Comment data including post ID
}

interface ContentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  mainTopics: string[];
  contactInfo: {
    phones: string[];
    emails: string[];
    addresses: string[];
  };
  contentType: 'promotional' | 'informational' | 'question' | 'announcement' | 'personal';
  engagementPotential: number;
  keywords: string[];
  suggestions: string[];
  complexity: 'simple' | 'medium' | 'complex';
  urgency: 'low' | 'medium' | 'high';
}

export const SmartReply = ({ postContent, postImageUrl, userComment, onReplyGenerated, selectedPage, commentData }: SmartReplyProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingContent, setIsAnalyzingContent] = useState(false);
  const [perplexityApiKey, setPerplexityApiKey] = useState("");
  const [usePerplexity, setUsePerplexity] = useState(false);
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis | null>(null);
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false);
  const geminiApiKey = localStorage.getItem("gemini-api-key");

  // جلب صورة المنشور من Facebook API
  const getPostImage = async (postId: string) => {
    if (!selectedPage) return null;
    
    try {
      // جلب المنشور المحدد مع الصورة
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${postId}?` +
        `fields=id,message,full_picture,picture&` +
        `access_token=${selectedPage.access_token}`
      );
      
      const postData = await response.json();
      
      if (postData.error) {
        console.warn('Error fetching post:', postData.error.message);
        return null;
      }
      
      return postData.full_picture || postData.picture || null;
    } catch (error) {
      console.error('Error fetching post image:', error);
      return null;
    }
  };

  // Function to fix Arabic punctuation positioning
  const fixArabicPunctuation = (text: string): string => {
    return text
      // Fix comma positioning in Arabic
      .replace(/(\w)\s*,\s*/g, '$1، ')
      // Fix period positioning
      .replace(/(\w)\s*\.\s*/g, '$1. ')
      // Fix exclamation mark
      .replace(/(\w)\s*!\s*/g, '$1! ')
      // Fix question mark - use Arabic question mark
      .replace(/(\w)\s*\?\s*/g, '$1؟ ')
      // Fix colon positioning
      .replace(/(\w)\s*:\s*/g, '$1: ')
      // Fix semicolon - use Arabic semicolon
      .replace(/(\w)\s*;\s*/g, '$1؛ ')
      // Fix parentheses spacing
      .replace(/\s*\(\s*/g, ' (')
      .replace(/\s*\)\s*/g, ') ')
      // Fix quotes positioning
      .replace(/\s*"\s*/g, ' "')
      .replace(/\s*"\s*/g, '" ')
      // Ensure proper RTL marks
      .replace(/([a-zA-Z]+)/g, '\u202D$1\u202C') // Wrap Latin text with LTR override
      .trim();
  };

  const generateWithPerplexity = async (prompt: string, apiKey: string) => {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'أنت مساعد ذكي متخصص في تحليل المنشورات والرد على التعليقات بطريقة مفيدة ودقيقة وودية باللغة العربية.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 400,
        return_images: false,
        return_related_questions: false,
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'فشل في توليد الرد باستخدام Perplexity');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  const generateWithGemini = async (prompt: string) => {
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
          maxOutputTokens: 400,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'فشل في توليد الرد');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  };

  const analyzeContent = async () => {
    if (!postContent && !postImageUrl) {
      toast.error("لا يوجد محتوى للتحليل");
      return;
    }

    if (usePerplexity && !perplexityApiKey.trim()) {
      toast.error("يرجى إدخال مفتاح Perplexity API للتحليل");
      return;
    }

    if (!usePerplexity && !geminiApiKey) {
      toast.error("يرجى إدخال مفتاح Gemini API في إعدادات توليد المحتوى");
      return;
    }

    setIsAnalyzingContent(true);
    try {
      const analysisPrompt = `قم بتحليل شامل ومتقدم للمحتوى التالي وقدم تحليلاً دقيقاً وتفصيلياً باللغة العربية:

محتوى المنشور:
${postContent || "لا يوجد نص"}

${postImageUrl ? `المنشور يحتوي على صورة: ${postImageUrl}` : "لا توجد صورة"}

يجب أن يكون التحليل شاملاً ومفصلاً ويغطي النقاط التالية:

1. تحليل المشاعر: (إيجابي/سلبي/محايد) مع درجة من 1-100
2. الموضوعات الرئيسية: استخرج 3-5 موضوعات أساسية
3. معلومات الاتصال: ابحث بدقة عن أرقام الهواتف والإيميلات والعناوين
4. نوع المحتوى: (ترويجي/معلوماتي/سؤال/إعلان/شخصي)
5. إمكانية التفاعل: تقدير من 1-100 لمدى احتمالية حصول المنشور على تفاعل
6. الكلمات المفتاحية: 5-8 كلمات مهمة
7. اقتراحات التحسين: 3-5 اقتراحات لتحسين المحتوى
8. مستوى التعقيد: (بسيط/متوسط/معقد)
9. مستوى الإلحاح: (منخفض/متوسط/عالي)

قدم التحليل بتنسيق JSON واضح ومنظم:

{
  "sentiment": "positive/negative/neutral",
  "sentimentScore": 85,
  "mainTopics": ["موضوع1", "موضوع2", "موضوع3"],
  "contactInfo": {
    "phones": ["0501234567"],
    "emails": ["test@example.com"],
    "addresses": ["العنوان"]
  },
  "contentType": "promotional/informational/question/announcement/personal",
  "engagementPotential": 75,
  "keywords": ["كلمة1", "كلمة2", "كلمة3"],
  "suggestions": ["اقتراح1", "اقتراح2", "اقتراح3"],
  "complexity": "simple/medium/complex",
  "urgency": "low/medium/high"
}`;

      let analysisResult;
      if (usePerplexity && perplexityApiKey) {
        analysisResult = await generateWithPerplexity(analysisPrompt, perplexityApiKey);
      } else {
        analysisResult = await generateWithGemini(analysisPrompt);
      }

      try {
        // محاولة تنظيف النتيجة واستخراج JSON
        const jsonMatch = analysisResult.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          setContentAnalysis(analysis);
          setShowAdvancedAnalysis(true);
          toast.success("تم إجراء التحليل المتقدم بنجاح!");
        } else {
          throw new Error("تنسيق JSON غير صحيح");
        }
      } catch (parseError) {
        // إذا فشل parsing، نحاول استخراج المعلومات يدوياً
        const fallbackAnalysis: ContentAnalysis = {
          sentiment: analysisResult.includes('إيجابي') ? 'positive' : 
                    analysisResult.includes('سلبي') ? 'negative' : 'neutral',
          sentimentScore: 70,
          mainTopics: ["تحليل عام"],
          contactInfo: { phones: [], emails: [], addresses: [] },
          contentType: 'informational',
          engagementPotential: 60,
          keywords: ["محتوى", "تحليل"],
          suggestions: ["تحسين المحتوى", "إضافة تفاصيل أكثر"],
          complexity: 'medium',
          urgency: 'medium'
        };
        setContentAnalysis(fallbackAnalysis);
        setShowAdvancedAnalysis(true);
        toast.success("تم إجراء تحليل أساسي للمحتوى");
      }

    } catch (error) {
      console.error("Content analysis error:", error);
      toast.error("فشل في تحليل المحتوى: " + (error as Error).message);
    } finally {
      setIsAnalyzingContent(false);
    }
  };

  const generateSmartReply = async () => {
    if (!userComment.trim()) {
      toast.error("يرجى التأكد من وجود تعليق المستخدم");
      return;
    }

    if (usePerplexity && !perplexityApiKey.trim()) {
      toast.error("يرجى إدخال مفتاح Perplexity API");
      return;
    }

    if (!usePerplexity && !geminiApiKey) {
      toast.error("يرجى إدخال مفتاح Gemini API في إعدادات توليد المحتوى");
      return;
    }

    setIsAnalyzing(true);
    try {
      // تحديد ما إذا كان السؤال حول الصورة
      const commentText = userComment.toLowerCase();
      const isImageQuestion =
        commentText.includes('صور') ||
        commentText.includes('صورة') ||
        commentText.includes('الصورة') ||
        commentText.includes('صورة المنشور') ||
        commentText.includes('بالصورة') ||
        commentText.includes('في الصورة') ||
        commentText.includes('عناصر الصورة') ||
        commentText.includes('ماهي العناصر') ||
        commentText.includes('شو') ||
        commentText.includes('ايش') ||
        commentText.includes('وين') ||
        commentText.includes('كيف') ||
        commentText.includes('متى') ||
        commentText.includes('price') ||
        commentText.includes('سعر') ||
        commentText.includes('location') ||
        commentText.includes('مكان') ||
        commentText.includes('فين') ||
        commentText.includes('كم') ||
        commentText.includes('details') ||
        commentText.includes('تفاصيل') ||
        commentText.includes('image') ||
        commentText.includes('photo') ||
        commentText.includes('picture');

      let imageAnalysis = null;
      let actualPostImageUrl = postImageUrl;

      // إذا كان السؤال يتعلق بالصورة، جلب صورة المنشور
      if (isImageQuestion && selectedPage && commentData?.id) {
        toast.info("جاري البحث عن صورة المنشور...");
        let postId: string | null = null;
        try {
          const commentInfoRes = await fetch(
            `https://graph.facebook.com/v19.0/${commentData.id}?fields=object,permalink_url&access_token=${selectedPage.access_token}`
          );
          const commentInfo = await commentInfoRes.json();
          if (!commentInfo.error && commentInfo.object?.id) {
            postId = commentInfo.object.id;
          }
        } catch (e) {
          console.warn('Error fetching comment object:', e);
        }
        if (!postId) {
          const parts = String(commentData.id).split('_');
          if (parts.length >= 2) {
            postId = `${parts[0]}_${parts[1]}`;
          }
        }
        if (postId) {
          const fetchedImageUrl = await getPostImage(postId);
          if (fetchedImageUrl) {
            actualPostImageUrl = fetchedImageUrl;
            toast.success("تم العثور على صورة المنشور");
          }
        }
      }

      // تحليل الصورة أولاً إذا كانت متوفرة
      if (actualPostImageUrl) {
        try {
          toast.info("جاري تحليل الصورة...");
          
          // استخدام Supabase client بدلاً من fetch مباشر
          const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
            'facebook-image-analyzer',
            {
              body: {
                imageUrl: actualPostImageUrl,
                postContent: postContent || "",
                userComment: userComment,
                analysisType: 'comment'
              }
            }
          );

          if (analysisError) {
            throw analysisError;
          }

          imageAnalysis = analysisData;
          console.log('تحليل الصورة:', imageAnalysis);
          if (imageAnalysis && imageAnalysis.hasImage) {
            toast.success("تم تحليل الصورة بنجاح - يمكن الآن الرد على أسئلة حول محتوى الصورة");
          }
        } catch (imageError) {
          console.error('خطأ في تحليل الصورة:', imageError);
          toast.warning("لم يتم تحليل الصورة، سيتم الاعتماد على النص فقط");
        }
      }

      // بناء prompt محسن باستخدام التحليل المتقدم وتحليل الصورة
      let enhancedPrompt = `أنت مساعد ذكي متخصص في تحليل المنشورات والصور والرد على التعليقات بطريقة مفيدة ودقيقة وودية.

محتوى المنشور:
${postContent || "لا يوجد نص للمنشور"}

${actualPostImageUrl ? `المنشور يحتوي على صورة: ${actualPostImageUrl}` : "لا توجد صورة"}`;

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
هل يمكن للصورة الإجابة على السؤال: ${imageAnalysis.canAnswerQuestion ? 'نعم' : 'لا'}

${imageAnalysis.suggestedResponse ? `اقتراح الرد من تحليل الصورة: ${imageAnalysis.suggestedResponse}` : ''}`;
      }

      // إضافة معلومات التحليل المتقدم إذا كان متوفراً
      if (contentAnalysis) {
        enhancedPrompt += `

=== التحليل المتقدم للمحتوى ===
نوع المحتوى: ${contentAnalysis.contentType === 'promotional' ? 'ترويجي' :
                    contentAnalysis.contentType === 'informational' ? 'معلوماتي' :
                    contentAnalysis.contentType === 'question' ? 'سؤال' :
                    contentAnalysis.contentType === 'announcement' ? 'إعلان' : 'شخصي'}

تحليل المشاعر: ${contentAnalysis.sentiment === 'positive' ? 'إيجابي' :
                    contentAnalysis.sentiment === 'negative' ? 'سلبي' : 'محايد'} (${contentAnalysis.sentimentScore}%)

الموضوعات الرئيسية: ${contentAnalysis.mainTopics.join(', ')}

معلومات الاتصال المتاحة:
${contentAnalysis.contactInfo.phones.length > 0 ? `- أرقام الهواتف: ${contentAnalysis.contactInfo.phones.join(', ')}` : ''}
${contentAnalysis.contactInfo.emails.length > 0 ? `- البريد الإلكتروني: ${contentAnalysis.contactInfo.emails.join(', ')}` : ''}
${contentAnalysis.contactInfo.addresses.length > 0 ? `- العناوين: ${contentAnalysis.contactInfo.addresses.join(', ')}` : ''}

مستوى الإلحاح: ${contentAnalysis.urgency === 'high' ? 'عالي' :
                    contentAnalysis.urgency === 'medium' ? 'متوسط' : 'منخفض'}

الكلمات المفتاحية: ${contentAnalysis.keywords.join(', ')}`;
      }

      enhancedPrompt += `

تعليق/سؤال المستخدم:
"${userComment}"

إرشادات مهمة للتحليل الذكي المتقدم:
- أعط الأولوية للمعلومات المستخرجة من الصورة إذا كانت متوفرة
- إذا سأل المستخدم عن معلومات موجودة في الصورة، استخدمها مباشرة
- لا تنكر وجود صورة إذا كانت موجودة ومُحللة
- استخدم التحليل المتقدم المتوفر أعلاه لفهم السياق بشكل أفضل
- إذا كانت معلومات الاتصال متوفرة في التحليل وسأل المستخدم عنها، قدمها مباشرة
- اعتبر نوع المحتوى ومستوى الإلحاح في صياغة ردك
- استخدم الموضوعات الرئيسية والكلمات المفتاحية لتقديم رد أكثر دقة
- راعي تحليل المشاعر في نبرة ردك
- ابحث في النص الأصلي والصورة بدقة فائقة عن أي معلومات اتصال إضافية
- لا تقل "لا يوجد رقم هاتف" إذا كان موجود فعلاً في النص أو الصورة أو التحليل
- استخرج المعلومات الدقيقة من النص والصورة بدلاً من إعطاء ردود عامة
- اكتب باللغة العربية بأسلوب ودود ومهني يتناسب مع نوع المحتوى
- كن مختصراً ومباشراً ومفيداً (أقل من 150 كلمة)

قم بتحليل المحتوى والصورة والتحليل المتقدم بدقة شديدة وقدم رد ذكي ومناسب على تعليق المستخدم:`;

      const prompt = enhancedPrompt;

      let generatedReply;
      if (usePerplexity) {
        generatedReply = await generateWithPerplexity(prompt, perplexityApiKey);
      } else {
        generatedReply = await generateWithGemini(prompt);
      }

      // Fix Arabic punctuation before sending the reply
      const fixedReply = fixArabicPunctuation(generatedReply);
      
      onReplyGenerated(fixedReply);
      toast.success(`تم توليد الرد الذكي بنجاح باستخدام ${usePerplexity ? 'Perplexity' : 'Gemini'}!`);

    } catch (error) {
      console.error("Smart reply error:", error);
      if (!usePerplexity && (error as Error).message.includes("quota")) {
        toast.error("تجاوز الحد اليومي لـ Gemini. جرب استخدام Perplexity API");
        setUsePerplexity(true);
      } else {
        toast.error("فشل في توليد الرد الذكي: " + (error as Error).message);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="arabic-text">
      <Card className="shadow-elegant border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary arabic-enhanced">
            <Brain className="h-5 w-5" />
            الرد الذكي المتقدم
            <span className={`text-xs px-2 py-1 rounded-full text-white ${
              usePerplexity 
                ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                : "bg-gradient-to-r from-blue-500 to-purple-500"
            }`}>
              {usePerplexity ? "Perplexity AI" : "Gemini AI"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className={usePerplexity ? "border-purple-200 bg-purple-50" : ""}>
            <Brain className="h-4 w-4" />
            <AlertDescription className="arabic-enhanced">
              {usePerplexity 
                ? "يستخدم هذا النظام Perplexity AI لتحليل المحتوى وتوليد ردود ذكية ومناسبة."
                : "يستخدم هذا النظام تقنية Gemini AI من Google لتحليل المحتوى وتوليد ردود ذكية ومناسبة."
              }
            </AlertDescription>
          </Alert>

        {/* خيارات اختيار API */}
        <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <Label className="text-sm font-medium">اختيار محرك الذكاء الاصطناعي</Label>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={!usePerplexity ? "default" : "outline"}
              size="sm"
              onClick={() => setUsePerplexity(false)}
              className="flex-1"
            >
              Gemini (مجاني محدود)
            </Button>
            <Button
              variant={usePerplexity ? "default" : "outline"}
              size="sm"
              onClick={() => setUsePerplexity(true)}
              className="flex-1"
            >
              Perplexity (بمفتاح API)
            </Button>
          </div>

          {usePerplexity && (
            <div className="space-y-2">
              <Label htmlFor="perplexity-key" className="text-xs">
                مفتاح Perplexity API
              </Label>
              <Input
                id="perplexity-key"
                type="password"
                placeholder="أدخل مفتاح Perplexity API الخاص بك"
                value={perplexityApiKey}
                onChange={(e) => setPerplexityApiKey(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                احصل على مفتاح API من: <a href="https://www.perplexity.ai/settings/api" target="_blank" className="text-blue-500 hover:underline">perplexity.ai/settings/api</a>
              </p>
            </div>
          )}
        </div>

        {/* قسم معاينة المنشور والتحليل المتقدم */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* معاينة المنشور */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                معاينة المنشور
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle className="arabic-enhanced">معاينة المنشور الكاملة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">محتوى المنشور:</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <p className="arabic-enhanced whitespace-pre-wrap">
                      {postContent || "لا يوجد محتوى نصي للمنشور"}
                    </p>
                  </div>
                </div>
                
                {postImageUrl && (
                  <div>
                    <Label className="text-sm font-medium">صورة المنشور:</Label>
                    <div className="mt-2">
                      <img
                        src={postImageUrl}
                        alt="صورة المنشور"
                        className="w-full rounded-lg object-cover shadow-lg"
                        style={{ maxHeight: "400px" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* التحليل المتقدم */}
          <Button
            onClick={analyzeContent}
            disabled={isAnalyzingContent || (!postContent && !postImageUrl)}
            variant="outline"
            className="w-full border-primary/50 hover:bg-primary/10"
          >
            {isAnalyzingContent ? (
              <>
                <BarChart3 className="h-4 w-4 mr-2 animate-pulse" />
                جاري التحليل المتقدم...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                تحليل شامل للمحتوى
              </>
            )}
          </Button>
        </div>

        {/* عرض نتائج التحليل المتقدم */}
        {showAdvancedAnalysis && contentAnalysis && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <TrendingUp className="h-5 w-5" />
                التحليل الذكي الشامل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                  <TabsTrigger value="analysis">التحليل</TabsTrigger>
                  <TabsTrigger value="contact">الاتصال</TabsTrigger>
                  <TabsTrigger value="suggestions">التحسين</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        تحليل المشاعر
                      </Label>
                      <div className="flex items-center gap-2">
                        <Badge className={`${
                          contentAnalysis.sentiment === 'positive' ? 'bg-green-500' :
                          contentAnalysis.sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                        }`}>
                          {contentAnalysis.sentiment === 'positive' ? 'إيجابي' :
                           contentAnalysis.sentiment === 'negative' ? 'سلبي' : 'محايد'}
                        </Badge>
                        <span className="text-sm">({contentAnalysis.sentimentScore}%)</span>
                      </div>
                      <Progress value={contentAnalysis.sentimentScore} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        إمكانية التفاعل
                      </Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{contentAnalysis.engagementPotential}%</Badge>
                      </div>
                      <Progress value={contentAnalysis.engagementPotential} className="h-2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">نوع المحتوى</Label>
                      <Badge variant="secondary" className="mt-1">
                        {contentAnalysis.contentType === 'promotional' ? 'ترويجي' :
                         contentAnalysis.contentType === 'informational' ? 'معلوماتي' :
                         contentAnalysis.contentType === 'question' ? 'سؤال' :
                         contentAnalysis.contentType === 'announcement' ? 'إعلان' : 'شخصي'}
                      </Badge>
                    </div>

                    <div>
                      <Label className="text-sm">مستوى الإلحاح</Label>
                      <Badge variant={
                        contentAnalysis.urgency === 'high' ? 'destructive' :
                        contentAnalysis.urgency === 'medium' ? 'default' : 'secondary'
                      } className="mt-1">
                        {contentAnalysis.urgency === 'high' ? 'عالي' :
                         contentAnalysis.urgency === 'medium' ? 'متوسط' : 'منخفض'}
                      </Badge>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">الموضوعات الرئيسية</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {contentAnalysis.mainTopics.map((topic, index) => (
                        <Badge key={index} variant="outline">{topic}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">الكلمات المفتاحية</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {contentAnalysis.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary">{keyword}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">مستوى التعقيد</Label>
                    <Badge className="mt-1" variant={
                      contentAnalysis.complexity === 'complex' ? 'destructive' :
                      contentAnalysis.complexity === 'medium' ? 'default' : 'secondary'
                    }>
                      {contentAnalysis.complexity === 'complex' ? 'معقد' :
                       contentAnalysis.complexity === 'medium' ? 'متوسط' : 'بسيط'}
                    </Badge>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  {contentAnalysis.contactInfo.phones.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        أرقام الهواتف
                      </Label>
                      <div className="space-y-1 mt-2">
                        {contentAnalysis.contactInfo.phones.map((phone, index) => (
                          <div key={index} className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                            {phone}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {contentAnalysis.contactInfo.emails.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">البريد الإلكتروني</Label>
                      <div className="space-y-1 mt-2">
                        {contentAnalysis.contactInfo.emails.map((email, index) => (
                          <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                            {email}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {contentAnalysis.contactInfo.addresses.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">العناوين</Label>
                      <div className="space-y-1 mt-2">
                        {contentAnalysis.contactInfo.addresses.map((address, index) => (
                          <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                            {address}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {contentAnalysis.contactInfo.phones.length === 0 && 
                   contentAnalysis.contactInfo.emails.length === 0 && 
                   contentAnalysis.contactInfo.addresses.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>لم يتم العثور على معلومات اتصال في المنشور</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="suggestions" className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Lightbulb className="h-3 w-3" />
                    اقتراحات التحسين
                  </Label>
                  {contentAnalysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm arabic-enhanced">{suggestion}</span>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          <Label>تعليق/سؤال المستخدم</Label>
          <Textarea
            value={userComment}
            readOnly
            className="bg-muted"
            rows={2}
          />
        </div>

        <Button
          onClick={generateSmartReply}
          disabled={isAnalyzing || !userComment.trim() || (usePerplexity && !perplexityApiKey.trim())}
          className={`w-full ${
            usePerplexity 
              ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          }`}
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              جاري التحليل بواسطة {usePerplexity ? 'Perplexity' : 'Gemini'}...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              توليد رد ذكي {contentAnalysis ? 'مع التحليل المتقدم' : ''} بواسطة {usePerplexity ? 'Perplexity' : 'Gemini'}
            </>
          )}
        </Button>
        </CardContent>
      </Card>
    </div>
  );
};