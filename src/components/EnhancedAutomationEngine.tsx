import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Bot, 
  Wand2, 
  Image as ImageIcon, 
  FileText, 
  Sparkles, 
  Zap,
  Brain,
  Search,
  Target,
  Camera,
  Cloud,
  Play,
  Pause,
  Square,
  Settings,
  Facebook,
  Send,
  TestTube,
  Download
} from "lucide-react";
import { AutomationProgressDialog, AutomationStep } from "./AutomationProgressDialog";
import { EnhancedAutomationResultsDisplay } from "./EnhancedAutomationResultsDisplay";
import { APIStatusIndicator } from "./APIStatusIndicator";
import { PromptPatternSelector } from "./PromptPatternSelector";
import { useAutomationEngine } from "@/hooks/useAutomationEngine";
import { useGeneratedContent, GeneratedContent } from "@/contexts/GeneratedContentContext";
import { useFacebookAuth } from "@/hooks/useFacebookAuth";
import { useFacebook } from "@/contexts/FacebookContext";
import { useGeminiAutoConfiguration } from "@/hooks/useGeminiAutoConfiguration";
import { geminiApiManager } from "@/utils/geminiApiManager";
import { supabase } from "@/integrations/supabase/client";

interface EnhancedAutomationEngineProps {
  className?: string;
}

const specialties = [
  { value: "طب", label: "طبي" },
  { value: "تقنية", label: "تقنية ومعلومات" },
  { value: "تعليم", label: "تعليمي" },
  { value: "تسويق", label: "تسويق ومبيعات" },
  { value: "صحة", label: "صحة ولياقة" },
  { value: "طعام", label: "طعام ومطاعم" },
  { value: "سفر", label: "سفر وسياحة" },
  { value: "موضة", label: "موضة وجمال" },
  { value: "رياضة", label: "رياضة" },
  { value: "فن", label: "فن وثقافة" },
  { value: "عقارات", label: "عقارات" },
  { value: "سيارات", label: "سيارات" },
];

const contentTypes = [
  { value: "منشور", label: "منشور تسويقي" },
  { value: "إعلان", label: "إعلان ترويجي" },
  { value: "تعليمي", label: "محتوى تعليمي" },
  { value: "نصائح", label: "نصائح ومعلومات" },
  { value: "قصة", label: "قصة نجاح" },
  { value: "عرض", label: "عرض خاص" },
];

const imageStyles = [
  { value: "احترافي", label: "احترافي وأنيق" },
  { value: "ملون", label: "ملون وجذاب" },
  { value: "بسيط", label: "بسيط ونظيف" },
  { value: "عصري", label: "عصري وحديث" },
  { value: "فني", label: "فني وإبداعي" },
];

const languages = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
  { value: "ar-en", label: "عربي - إنجليزي" }
];

export const EnhancedAutomationEngine: React.FC<EnhancedAutomationEngineProps> = ({ className = "" }) => {
  // استخدام Facebook Context للحصول على الصفحة المختارة
  const { selectedPage, pages, isConnected } = useFacebook();
  const { generateAutoConfig, isGenerating } = useGeminiAutoConfiguration();
  
  // حالات لعرض النتائج المرحلية
  const [stepResults, setStepResults] = useState<{[key: string]: any}>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [isQuickPublishing, setIsQuickPublishing] = useState(false);
  const [interactiveQuestions, setInteractiveQuestions] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<{[key: string]: {url: string, prompt: string}}>({});
  
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedPromptPattern, setSelectedPromptPattern] = useState("pattern1");
  const [isImageTestOpen, setIsImageTestOpen] = useState(false);
  const [testPrompt, setTestPrompt] = useState('');
  const [testImageResult, setTestImageResult] = useState<{url: string, prompt: string} | null>(null);
  const [isGeneratingTestImage, setIsGeneratingTestImage] = useState(false);
  const [config, setConfig] = useState({
    topic: '',
    specialty: specialties[0].value,
    contentType: contentTypes[0].value,
    language: languages[0].value,
    imageStyle: imageStyles[0].value,
    imageSource: 'ai-generated',
    selectedFacebookPage: '',
    useBlendedLayout: false, // خيار تقسيم الشاشة المدمج
    customGeminiApiKey: '', // مفتاح API خاص لتوليد الصور
    stopAfterPromptGeneration: false // إيقاف التوليد التلقائي للصور
  });

  const { generatedContent, setGeneratedContent } = useGeneratedContent();
  
  const {
    isRunning,
    isPaused,
    steps,
    currentStepIndex,
    elapsedTime,
    startAutomation,
    pauseAutomation,
    resumeAutomation,
    cancelAutomation
  } = useAutomationEngine({
    onStepResult: (stepId, result) => {
      setStepResults(prev => ({ ...prev, [stepId]: result }));
      
      // حفظ الأسئلة التفاعلية عند اكتمالها
      if (stepId === 'interactive-questions' && result?.data) {
        setInteractiveQuestions(result.data);
      }

      // حفظ الصور المولدة عند اكتمال خطوة توليد الصورة
      if (stepId === 'image-generation' && result?.content) {
        // استخراج البرومت من خطوة توليد البرومت
        const promptStepResult = stepResults['prompt-generation'];
        let prompt = 'صورة مولدة من الأتمتة';

        // محاولة استخراج البرومت من النتائج
        if (typeof promptStepResult === 'string') {
          prompt = promptStepResult.substring(0, 200) + '...';
        } else if (promptStepResult?.data && typeof promptStepResult.data === 'string') {
          prompt = promptStepResult.data.substring(0, 200) + '...';
        }
        
        // حفظ الصورة مع البرومت المناسب
        setGeneratedImages(prev => ({
          ...prev,
          [`automation-${Date.now()}`]: { 
            url: result.content, 
            prompt: prompt
          }
        }));

        console.log('تم حفظ الصورة المولدة من الأتمتة:', result.content);
      }
    }
  });

  // تحديث الصفحة المختارة تلقائياً عند تغييرها في الهيدر
  useEffect(() => {
    if (selectedPage?.id) {
      setConfig(prev => ({ ...prev, selectedFacebookPage: selectedPage.id }));
    }
  }, [selectedPage]);

  // دالة التكوين التلقائي بواسطة Gemini
  const handleAutoConfig = useCallback(async () => {
    if (!selectedPage) {
      toast.error('يرجى اختيار صفحة فيسبوك أولاً');
      return;
    }

    const autoConfig = await generateAutoConfig(selectedPage, config.topic || undefined);
    if (autoConfig) {
      setConfig(prev => ({
        ...prev,
        specialty: autoConfig.specialty,
        contentType: autoConfig.contentType,
        language: autoConfig.language,
        imageStyle: autoConfig.imageStyle,
        topic: autoConfig.suggestedTopic || prev.topic
      }));
      
      // تحديث المحتوى المولد أيضاً
      setGeneratedContent({
        longText: autoConfig.longText,
        shortText: autoConfig.shortText,
        imageUrl: '',
        imageAlt: 'صورة مولدة تلقائياً'
      });
      
      toast.success('تم إنتاج التكوين والمحتوى التلقائي بنجاح!');
      
      // فاصل زمني قبل بداية الأتمتة التلقائية
      setTimeout(() => {
        handleStartAutomation();
      }, 3000); // 3 ثواني فاصل
    }
  }, [selectedPage, config.topic, generateAutoConfig]);

  const handlePatternGenerate = (pattern: string, topic: string) => {
    setSelectedPromptPattern(pattern);
    setConfig(prev => ({ 
      ...prev, 
      topic,
      selectedPattern: pattern,
      useBlendedLayout: pattern === "pattern2" // تفعيل التقسيم المدمج للنمط المتقدم
    }));
    setIsConfigOpen(true);
  };

  const handleStartAutomation = useCallback(async () => {
    if (!config.topic.trim()) {
      toast.error('يرجى إدخال موضوع المحتوى');
      return;
    }

    if (!config.customGeminiApiKey?.trim()) {
      toast.error('⚠️ مفتاح Gemini API مطلوب! يرجى إدخال المفتاح في الحقل المخصص أولاً. النظام يعتمد حصرياً على المفتاح المدخل من قِبلك.');
      return;
    }

    if (!selectedPage) {
      toast.error('يرجى اختيار صفحة الفيسبوك من الهيدر');
      return;
    }

    const automationConfig = {
      ...config,
      selectedFacebookPage: selectedPage.id,
      selectedTabs: ['main', 'textual'],
      promptPattern: selectedPromptPattern,
      selectedPattern: selectedPromptPattern
    };

    await startAutomation(automationConfig);
    setIsConfigOpen(false);
  }, [config, selectedPage, selectedPromptPattern, startAutomation]);

  // دالة اختبار توليد الصور باستخدام A4F API
  const handleTestImageGeneration = useCallback(async () => {
    if (!testPrompt.trim()) {
      toast.error('يرجى إدخال برومت لتوليد الصورة');
      return;
    }

    setIsGeneratingTestImage(true);
    
    try {
      const response = await fetch('https://api.a4f.co/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ddc-a4f-d18769825db54bb0a03e087f28dda67f'
        },
        body: JSON.stringify({
          model: 'provider-4/imagen-3',
          prompt: testPrompt,
          n: 1,
          size: "1024x1024"
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || data.error);
      }

      const imageUrl = data.data?.[0]?.url;
      if (imageUrl) {
        setTestImageResult({
          url: imageUrl,
          prompt: testPrompt
        });
        toast.success('تم توليد الصورة بنجاح!');
      } else {
        throw new Error('لم يتم إرجاع رابط صورة من A4F API');
      }

    } catch (error) {
      console.error('خطأ في توليد الصورة:', error);
      toast.error(`فشل في توليد الصورة: ${(error as Error).message}`);
    } finally {
      setIsGeneratingTestImage(false);
    }
  }, [testPrompt]);

  // دالة الناشر السريع - توليد وإنشاء ونشر سريع
  const handleQuickPublish = useCallback(async () => {
    if (!selectedPage) {
      toast.error('يرجى اختيار صفحة فيسبوك أولاً');
      return;
    }

    if (!config.topic.trim()) {
      toast.error('يرجى إدخال موضوع المحتوى');
      return;
    }

    setIsQuickPublishing(true);
    
    try {
      toast.info('🚀 بدء الناشر السريع...');
      
      // 1. توليد المحتوى النصي أولاً
      const { data: contentData, error: contentError } = await supabase.functions.invoke('gemini-suggestions', {
        body: {
          topic: config.topic,
          specialty: config.specialty,
          contentType: config.contentType,
          language: config.language,
          context: `صفحة فيسبوك: ${selectedPage.name}`
        }
      });

      if (contentError) {
        throw new Error(`خطأ في توليد المحتوى: ${contentError.message}`);
      }

      const shortText = contentData?.shortText || config.topic;
      const longText = contentData?.longText || `محتوى متميز حول ${config.topic}`;

      toast.success('✅ تم توليد المحتوى النصي');

      // 2. توليد برومت الصورة باستخدام Gemini
      const imagePrompt = `صورة احترافية ${config.imageStyle} تعبر عن موضوع "${config.topic}" في مجال ${config.specialty}، بدون نصوص أو كتابة، جودة عالية، إضاءة طبيعية، خلفية مناسبة`;

      toast.info('🎨 جاري توليد الصورة...');

      // 3. توليد الصورة باستخدام Runware API
      const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: imagePrompt,
          width: 1024,
          height: 1024,
          model: "runware:100@1"
        }
      });

      if (imageError) {
        throw new Error(`خطأ في توليد الصورة: ${imageError.message}`);
      }

      const imageURL = imageData?.imageURL;
      if (!imageURL) {
        throw new Error('لم يتم الحصول على رابط الصورة');
      }

      toast.success('🖼️ تم توليد الصورة بنجاح');

      // 4. تحديث المحتوى المولد
      setGeneratedContent({
        longText,
        shortText,
        imageUrl: imageURL,
        imageAlt: `صورة مولدة حول ${config.topic}`
      });

      // 5. نشر المحتوى على فيسبوك
      toast.info('📤 جاري النشر على فيسبوك...');

      const postMessage = `${shortText}\n\n${longText}`;
      
      const formData = new FormData();
      formData.append('message', postMessage);
      formData.append('url', imageURL);
      formData.append('access_token', selectedPage.access_token);

      const publishResponse = await fetch(
        `https://graph.facebook.com/v19.0/${selectedPage.id}/photos`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json();
        throw new Error(errorData.error?.message || 'فشل في النشر على فيسبوك');
      }

      const publishData = await publishResponse.json();
      
      toast.success('🎉 تم النشر بنجاح على فيسبوك!');
      
      // إضافة الصورة المولدة إلى الصور المحفوظة
      setGeneratedImages(prev => ({
        ...prev,
        [`quick-publish-${Date.now()}`]: { 
          url: imageURL, 
          prompt: imagePrompt
        }
      }));

    } catch (error) {
      console.error('خطأ في الناشر السريع:', error);
      toast.error(`فشل الناشر السريع: ${(error as Error).message}`);
    } finally {
      setIsQuickPublishing(false);
    }
  }, [selectedPage, config, setGeneratedContent]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // دالة تنظيف وتحسين التعليقات التفاعلية
  const cleanInteractiveComment = (comment: string): string => {
    // إزالة العبارات غير المرغوبة
    let cleaned = comment
      .replace(/سؤال للتفاعل:?\s*/gi, '')
      .replace(/التعليق الأول المميز سيُثبّت\s*🧷?/gi, '')
      .replace(/🧷\s*التعليق الأول المميز سيُثبّت/gi, '')
      .replace(/\s*🧷\s*/g, ' ')
      .trim();

    // إزالة الهاشتاغات في نهاية التعليق
    cleaned = cleaned.replace(/#\w+\s*/g, '').trim();
    
    return cleaned;
  };

  // دالة النظام الاحتياطي للأشكال التفاعلية المخصصة
  const getFallbackInteractiveForms = (topic: string, specialty: string): string[] => {
    const topicAnalysis = topic.toLowerCase();
    
    // جوانب مخصصة حسب المجال
    const aspectsByField: { [key: string]: string[] } = {
      'طب': ['التجربة العلاجية', 'النصائح الطبية', 'الوقاية', 'الأعراض', 'التشخيص المبكر'],
      'تقنية': ['الابتكار', 'الحلول التقنية', 'التطوير', 'الأمان السيبراني', 'الذكاء الاصطناعي'],
      'تعليم': ['طرق التعلم', 'التحديات التعليمية', 'المهارات الحياتية', 'التطوير الذاتي', 'البحث العلمي'],
      'تسويق': ['استراتيجيات الترويج', 'تجربة العملاء', 'العلامة التجارية', 'التسويق الرقمي', 'المبيعات'],
      'صحة': ['العادات الصحية', 'اللياقة البدنية', 'التغذية', 'الصحة النفسية', 'نمط الحياة'],
      'طعام': ['الوصفات', 'التغذية المتوازنة', 'المذاق', 'الطبخ المنزلي', 'المطاعم'],
      'default': ['التجربة الشخصية', 'الرأي والمقارنة', 'التطوير والمستقبل', 'الاختيار والتفضيل', 'التحدي والإبداع']
    };

    const aspects = aspectsByField[specialty] || aspectsByField['default'];
    const forms: string[] = [];

    // تنويع الأشكال حسب الجوانب المختلفة
    aspects.slice(0, 5).forEach((aspect, index) => {
      switch (index) {
        case 0: // التجارب الشخصية
          forms.push(`🎤 مساحتك للتعبير:
✨ شاركنا تجربتك الشخصية مع ${aspect} في ${topic}
💬 كيف أثّر هذا على حياتك أو عملك؟
👇 رأيك قد يلهم الآخرين!`);
          break;
        case 1: // استطلاع تفاعلي
          forms.push(`📊 استطلاع سريع:
أي جانب من ${aspect} في ${topic} يهمك أكثر؟
1️⃣ الجانب العملي والتطبيقي
2️⃣ الجانب النظري والمعرفي  
3️⃣ الجانب التقني والتطويري
🗳️ اكتب رقم اختيارك أو رأيك الحر!`);
          break;
        case 2: // تحدي إبداعي
          forms.push(`🔍 تحدي إبداعي:
🕒 في 10 كلمات أو أقل... صف ${aspect} في ${topic}!
🎁 أفضل وصف سيحصل على تفاعل مميز!
💡 تحداك الإبداع؟`);
          break;
        case 3: // رؤية مستقبلية
          forms.push(`🔮 نظرة للمستقبل:
كيف ترى تطور ${aspect} في ${topic} خلال السنوات القادمة؟
🚀 ما هي التوقعات والطموحات؟
💭 شاركنا رؤيتك المستقبلية!`);
          break;
        case 4: // مقارنة واختيار
          forms.push(`⚡ اختر الأنسب لك:
🅰️ ${aspect} التقليدي في ${topic}
🅱️ ${aspect} الحديث والمطور
🆎 مزيج من التقليدي والحديث
📝 أو اكتب اختيارك الخاص!`);
          break;
      }
    });

    return forms;
  };

  // دالة التعليق بالأسئلة التفاعلية المحدثة
  const commentWithInteractiveQuestions = async (postData: any, questions: string[]) => {
    try {
      if (!questions || questions.length === 0) {
        console.warn('لا توجد أسئلة تفاعلية، استخدام النظام الاحتياطي');
        questions = getFallbackInteractiveForms(config.topic, config.specialty);
      }

      console.log('بدء التعليق بالأشكال التفاعلية المحدثة للمنشور:', postData.id);
      
      // اختر شكل تفاعلي عشوائي
      const randomQuestionIndex = Math.floor(Math.random() * questions.length);
      let selectedInteractiveForm = questions[randomQuestionIndex];

      // تنظيف التعليق من العبارات غير المرغوبة
      selectedInteractiveForm = cleanInteractiveComment(selectedInteractiveForm);

      // تحضير التعليق النظيف بدون هاشتاغات
      const commentText = `${selectedInteractiveForm}

🔁 شارك النقاش وادعُ من يهتمّ!`;

      // التعليق على المنشور
      const commentParams = new URLSearchParams();
      commentParams.append('message', commentText);
      commentParams.append('access_token', selectedPage.access_token);

      const commentResponse = await fetch(
        `https://graph.facebook.com/v19.0/${postData.id}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: commentParams.toString()
        }
      );

      const commentResult = await commentResponse.json();

      if (commentResult.error) {
        console.error('خطأ في التعليق:', commentResult.error);
        toast.error('فشل في إضافة الأسئلة التفاعلية: ' + commentResult.error.message);
      } else if (commentResult.id) {
        console.log('تم إضافة التعليق التفاعلي المحسن بنجاح:', commentResult.id);
        toast.success('🎉 تم إضافة الأسئلة التفاعلية المحسنة (بدون هاشتاغات)!');
        
        // حفظ الأسئلة المنظفة في الحالة لعرضها في النتائج
        const cleanedQuestions = questions.map(q => cleanInteractiveComment(q));
        setInteractiveQuestions(cleanedQuestions);
      }

    } catch (error) {
      console.error('خطأ في التعليق بالأسئلة التفاعلية:', error);
      toast.error('فشل في إضافة الأسئلة التفاعلية: ' + (error as Error).message);
    }
  };

  // دالة النشر المدمج - توليد الصورة والنشر التلقائي من البرومت
  const handleIntegratedPublish = useCallback(async () => {
    if (!selectedPage) {
      toast.error('يرجى اختيار صفحة فيسبوك أولاً');
      return;
    }

    if (!generatedContent?.longText) {
      toast.error('لا يوجد محتوى نصي للنشر');
      return;
    }

    // التحقق من وجود برومت مولد في النتائج
    const promptStepResult = stepResults['prompt-generation'];
    let imagePrompt = '';
    
    if (typeof promptStepResult === 'string') {
      imagePrompt = promptStepResult;
    } else if (promptStepResult?.data && typeof promptStepResult.data === 'string') {
      imagePrompt = promptStepResult.data;
    } else {
      // إنشاء برومت احتياطي
      imagePrompt = `صورة احترافية ${config.imageStyle} تعبر عن موضوع "${config.topic}" في مجال ${config.specialty}، بدون نصوص أو كتابة، جودة عالية، إضاءة طبيعية، خلفية مناسبة`;
    }

    setIsQuickPublishing(true);
    
    try {
      toast.info('🎨 جاري توليد الصورة من البرومت المولد...');
      
      // توليد الصورة باستخدام A4F API
      const imageResponse = await fetch('https://api.a4f.co/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ddc-a4f-d18769825db54bb0a03e087f28dda67f'
        },
        body: JSON.stringify({
          model: 'provider-4/imagen-3',
          prompt: imagePrompt,
          n: 1,
          size: "1024x768"
        })
      });

      if (!imageResponse.ok) {
        throw new Error(`A4F API error: ${imageResponse.status}`);
      }

      const imageData = await imageResponse.json();
      
      if (imageData.error) {
        throw new Error(imageData.error.message || imageData.error);
      }

      const imageUrl = imageData.data?.[0]?.url;
      if (!imageUrl) {
        throw new Error('لم يتم إرجاع رابط صورة من A4F API');
      }

      toast.success('🖼️ تم توليد الصورة بنجاح!');

      // تحديث المحتوى المولد بالصورة الجديدة
      setGeneratedContent(prev => ({
        ...prev,
        imageUrl: imageUrl,
        imageAlt: `صورة مولدة من البرومت: ${imagePrompt.substring(0, 100)}...`
      }));

      // إضافة الصورة للصور المحفوظة
      setGeneratedImages(prev => ({
        ...prev,
        [`integrated-publish-${Date.now()}`]: { 
          url: imageUrl, 
          prompt: imagePrompt
        }
      }));

      toast.info('📤 جاري النشر على فيسبوك...');

      // النشر على فيسبوك مع الصورة المولدة
      const postMessage = `${generatedContent.shortText}\n\n${generatedContent.longText}`;
      
      const formData = new FormData();
      formData.append('message', postMessage);
      formData.append('url', imageUrl);
      formData.append('access_token', selectedPage.access_token);

      const publishResponse = await fetch(
        `https://graph.facebook.com/v19.0/${selectedPage.id}/photos`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json();
        throw new Error(errorData.error?.message || 'فشل في النشر على فيسبوك');
      }

      const publishData = await publishResponse.json();
      
      toast.success('🎉 تم النشر المدمج بنجاح! صورة + نص على فيسبوك');
      
      // إضافة الأسئلة التفاعلية إذا كانت متوفرة
      const questionsResult = stepResults['interactive-questions'];
      const questions = questionsResult?.data || [];
      
      if (questions.length > 0) {
        toast.info('سيتم إضافة أسئلة تفاعلية خلال 30 ثانية... 🎯');
        
        const postData = {
          id: publishData.id,
          message: postMessage,
          pageId: selectedPage.id,
          pageName: selectedPage.name,
          publishedAt: new Date().toISOString()
        };
        
        setTimeout(async () => {
          await commentWithInteractiveQuestions(postData, questions);
        }, 30000);
      }

    } catch (error) {
      console.error('خطأ في النشر المدمج:', error);
      toast.error(`فشل النشر المدمج: ${(error as Error).message}`);
    } finally {
      setIsQuickPublishing(false);
    }
  }, [selectedPage, generatedContent, stepResults, config, setGeneratedContent]);

  // دالة النشر المباشر
  const handleDirectPublish = async () => {
    if (!generatedContent?.longText) {
      toast.error('لا يوجد محتوى للنشر');
      return;
    }

    if (!selectedPage) {
      toast.error('يرجى اختيار صفحة فيسبوك أولاً');
      return;
    }

    setIsPublishing(true);
    
    try {
      // التحقق من صحة التوكن أولاً
      const tokenValidationResponse = await fetch(
        `https://graph.facebook.com/v19.0/me?access_token=${selectedPage.access_token}&fields=id,name`
      );
      
      if (!tokenValidationResponse.ok) {
        throw new Error('التوكن منتهي الصلاحية أو غير صحيح');
      }

      const tokenData = await tokenValidationResponse.json();
      if (tokenData.error) {
        throw new Error('التوكن غير صالح: ' + tokenData.error.message);
      }

      let photoId: string | null = null;

      // رفع الصورة إذا كانت موجودة
      if (generatedContent.imageUrl) {
        try {
          console.log('محاولة رفع الصورة باستخدام الرابط المباشر:', generatedContent.imageUrl);
          
          // إضافة معاينة الصورة المولدة
          setStepResults(prev => ({ ...prev, 'image-generation': {
            content: generatedContent.imageUrl,
            prompt: 'صورة مولدة'
          }}));

          const photoParams = new URLSearchParams();
          photoParams.append('url', generatedContent.imageUrl);
          photoParams.append('published', 'false');
          photoParams.append('access_token', selectedPage.access_token);

          const photoResponse = await fetch(
            `https://graph.facebook.com/v19.0/${selectedPage.id}/photos`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: photoParams.toString()
            }
          );

          const photoResult = await photoResponse.json();
          
          if (photoResult.error) {
            console.warn('فشل في رفع الصورة:', photoResult.error);
            toast.warning('سيتم النشر بدون صورة بسبب: ' + photoResult.error.message);
          } else if (photoResult.id) {
            photoId = photoResult.id;
            console.log('تم رفع الصورة بنجاح. معرف الصورة:', photoId);
            toast.info("تم رفع الصورة بنجاح");
          }
        } catch (error) {
          console.warn('خطأ في رفع الصورة:', error);
          toast.warning('سيتم النشر بدون صورة');
        }
      }

      // تحضير بيانات المنشور
      const postParams = new URLSearchParams();
      postParams.append('message', generatedContent.longText.trim());
      postParams.append('access_token', selectedPage.access_token);

      // إضافة الصورة إذا تم رفعها بنجاح
      if (photoId) {
        postParams.append('attached_media[0]', JSON.stringify({
          media_fbid: photoId
        }));
        console.log('إضافة الصورة للمنشور:', photoId);
      } else if (generatedContent.imageUrl) {
        // محاولة إضافة الصورة مباشرة إذا كانت من A4F
        const isA4FImage = generatedContent.imageUrl.includes('runware.ai') || 
                           generatedContent.imageUrl.includes('a4f.co');
        
        if (isA4FImage) {
          console.log('إضافة صورة A4F مباشرة للمنشور:', generatedContent.imageUrl);
          postParams.append('picture', generatedContent.imageUrl);
          toast.info("استخدام صورة A4F المولدة مباشرة في المنشور");
        }
      }

      console.log('إرسال بيانات المنشور:', {
        hasMessage: !!generatedContent.longText.trim(),
        messageLength: generatedContent.longText.trim().length,
        hasPhoto: !!photoId,
        photoId: photoId,
        pageId: selectedPage.id,
        pageName: selectedPage.name
      });

      // نشر المنشور
      const postResponse = await fetch(
        `https://graph.facebook.com/v19.0/${selectedPage.id}/feed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: postParams.toString()
        }
      );

      const result = await postResponse.json();
      
      console.log('استجابة Facebook API:', result);

      if (result.error) {
        console.error('خطأ في النشر:', result.error);
        
        // معالجة أخطاء محددة
        if (result.error.code === 100) {
          if (result.error.message && result.error.message.includes('Invalid parameter')) {
            throw new Error("معامل غير صحيح - تحقق من النص والصورة");
          } else if (result.error.message && result.error.message.includes('Requires one of the params')) {
            throw new Error("خطأ في المعاملات المرسلة");
          } else {
            throw new Error("خطأ في المعاملات: " + result.error.message);
          }
        } else if (result.error.code === 190) {
          throw new Error("التوكن منتهي الصلاحية");
        } else if (result.error.code === 200) {
          throw new Error("صلاحيات غير كافية");
        } else {
          throw new Error(result.error.message || 'خطأ غير معروف في النشر');
        }
      }

      if (result.id) {
        console.log('تم النشر بنجاح. معرف المنشور:', result.id);
        toast.success('تم نشر المحتوى بنجاح!');
        
        // حفظ بيانات المنشور
        const postData = {
          id: result.id,
          message: generatedContent.longText,
          pageId: selectedPage.id,
          pageName: selectedPage.name,
          publishedAt: new Date().toISOString()
        };
        
         // الحصول على الأسئلة التفاعلية من النتائج
         const questionsResult = stepResults['interactive-questions'];
         const questions = questionsResult?.data || [];
         
         if (questions.length > 0) {
           // إظهار إشعار حول توليد الأسئلة التفاعلية القادم
           toast.info('سيتم إضافة أسئلة تفاعلية خلال 30 ثانية... 🎯');
           
           // تشغيل دالة التعليق بالأسئلة التفاعلية بعد 30 ثانية (فاصل زمني كافي)
           setTimeout(async () => {
             await commentWithInteractiveQuestions(postData, questions);
           }, 30000); // 30 ثانية
         }
        
      } else {
        throw new Error('لم يتم الحصول على معرف المنشور');
      }
    } catch (error) {
      console.error('خطأ في النشر:', error);
      toast.error(`فشل في النشر: ${(error as Error).message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900 relative overflow-hidden ${className}`}>
      {/* خلفية متحركة للذكاء الاصطناعي */}
      <div className="absolute inset-0 bg-neural-pattern opacity-20 animate-pulse-slow"></div>
      <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 rounded-full blur-2xl animate-float" style={{animationDelay: '4s'}}></div>
      
      {/* شبكة الطاقة الكهربائية */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="relative container mx-auto p-6 space-y-8">
        {/* العنوان الرئيسي المطور */}
        <div className="text-center space-y-6 py-12">
          <div className="relative inline-block">
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 animate-brain-pulse drop-shadow-2xl">
              🤖 الأتمتة الذكية
            </h1>
            <div className="absolute -top-4 -right-4">
              <Sparkles className="h-10 w-10 text-cyan-400 animate-spin drop-shadow-lg" />
            </div>
            <div className="absolute -bottom-2 -left-4">
              <Zap className="h-8 w-8 text-purple-400 animate-pulse drop-shadow-lg" />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="relative">
              <Brain className="h-10 w-10 text-cyan-400 animate-pulse drop-shadow-lg" />
              <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping"></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              نظام الذكاء الاصطناعي المتقدم
            </h2>
            <div className="relative">
              <Bot className="h-10 w-10 text-purple-400 animate-pulse drop-shadow-lg" />
              <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
            </div>
          </div>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
            محرك أتمتة متطور مدعوم بالذكاء الاصطناعي لإنتاج ونشر المحتوى تلقائياً
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Badge className="px-6 py-3 text-base bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 border-cyan-400/20 animate-fade-in hover-scale shadow-lg">
              <Zap className="h-5 w-5 ml-2" />
              أتمتة فورية
            </Badge>
            <Badge className="px-6 py-3 text-base bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 border-purple-400/20 animate-fade-in hover-scale shadow-lg" style={{animationDelay: '0.2s'}}>
              <Brain className="h-5 w-5 ml-2" />
              ذكاء اصطناعي
            </Badge>
            <Badge className="px-6 py-3 text-base bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 border-emerald-400/20 animate-fade-in hover-scale shadow-lg" style={{animationDelay: '0.4s'}}>
              <Target className="h-5 w-5 ml-2" />
              دقة عالية
            </Badge>
          </div>
        </div>

      {/* واجهة بألوان الشبكة العصبية */}
      <div className="relative max-w-6xl mx-auto">
        {/* خلفية شبكة عصبية متحركة محسنة */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 via-slate-700/30 to-slate-800/50 backdrop-blur-sm"></div>
          <div className="absolute top-4 left-4 w-3 h-3 bg-cyan-400/80 rounded-full animate-ping drop-shadow-lg"></div>
          <div className="absolute top-8 right-12 w-2 h-2 bg-purple-400/80 rounded-full animate-ping drop-shadow-lg" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-6 left-1/3 w-2 h-2 bg-emerald-400/80 rounded-full animate-ping drop-shadow-lg" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-12 right-6 w-1.5 h-1.5 bg-pink-400/60 rounded-full animate-ping animation-delay-700"></div>
          
          {/* خطوط الشبكة العصبية */}
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 300">
            <defs>
              <linearGradient id="neuralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.7"/>
                <stop offset="30%" stopColor="#EC4899" stopOpacity="0.5"/>
                <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.7"/>
              </linearGradient>
            </defs>
            <g stroke="url(#neuralGrad)" strokeWidth="1.5" fill="none" className="animate-pulse">
              <path d="M50,50 Q200,100 350,50" />
              <path d="M80,120 Q200,80 320,120" />
              <path d="M60,200 Q200,160 340,200" />
              <path d="M90,250 Q200,220 310,250" />
              <circle cx="50" cy="50" r="4" fill="url(#neuralGrad)" className="animate-pulse" />
              <circle cx="200" cy="100" r="5" fill="url(#neuralGrad)" className="animate-pulse animation-delay-300" />
              <circle cx="350" cy="50" r="4" fill="url(#neuralGrad)" className="animate-pulse animation-delay-600" />
              <circle cx="80" cy="120" r="3" fill="#EC4899" className="animate-pulse animation-delay-900" />
              <circle cx="320" cy="120" r="3" fill="#06B6D4" className="animate-pulse animation-delay-1200" />
            </g>
          </svg>
        </div>

        <Card className="relative border-0 shadow-2xl bg-gradient-to-br from-slate-800/95 via-slate-700/90 to-slate-800/95 backdrop-blur-xl rounded-3xl overflow-hidden border border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-500 hover:shadow-cyan-500/20">
          {/* شريط علوي بألوان الشبكة العصبية */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 via-pink-500 to-emerald-500"></div>
          
          {/* تأثير الضوء المتحرك */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent -skew-x-12 animate-data-flow"></div>
          
          <CardHeader className="pb-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="relative group">
                  <div className="relative bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg group-hover:shadow-cyan-400/30 transition-all duration-300">
                    <Bot className="h-8 w-8 text-white drop-shadow-lg" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse drop-shadow-lg"></div>
                  </div>
                  <div className="absolute inset-0 bg-cyan-400/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                </div>
                
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-100 via-cyan-100 to-slate-200 bg-clip-text text-transparent flex items-center gap-3">
                    <Wand2 className="h-6 w-6 text-cyan-400 drop-shadow-lg" />
                    محرك الأتمتة الذكي
                  </CardTitle>
                  <p className="text-lg text-slate-300 mt-2 drop-shadow-sm">
                    أنشئ محتوى احترافي وصور عالية الجودة بذكاء اصطناعي متطور
                  </p>
                </div>
              </div>
              
              <Badge className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white border-0 px-4 py-2 text-base shadow-lg hover:shadow-cyan-400/30 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse drop-shadow-sm"></div>
                  AI Neural Engine
                </div>
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 relative">
            {/* مؤشر حالة APIs بسيط */}
            <div className="relative">
              <APIStatusIndicator />
            </div>
            
            {!isRunning && !isConfigOpen && (
              <div className="space-y-6">
                {/* قسم اختيار الأنماط */}
                <PromptPatternSelector
                  selectedPattern={selectedPromptPattern}
                  topic={config.topic}
                  onPatternSelect={setSelectedPromptPattern}
                  onTopicChange={(topic) => setConfig(prev => ({ ...prev, topic }))}
                  onGenerate={handlePatternGenerate}
                  isGenerating={false}
                />

                {/* زر الناشر السريع */}
                <div className="flex justify-center mt-8">
                  <Button 
                    onClick={handleQuickPublish}
                    disabled={isQuickPublishing || !selectedPage || !config.topic.trim()}
                    className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-500 hover:via-cyan-500 hover:to-blue-500 text-white border-0 px-12 py-4 text-xl font-bold rounded-2xl shadow-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-emerald-400/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-cyan-400/20 to-blue-400/20 animate-pulse group-hover:animate-none"></div>
                    <div className="relative flex items-center gap-4">
                      {isQuickPublishing ? (
                        <>
                          <div className="animate-spin h-6 w-6 border-3 border-white/20 border-t-white rounded-full drop-shadow-lg"></div>
                          <span className="drop-shadow-lg">جاري النشر السريع...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-6 w-6 drop-shadow-lg" />
                          <Sparkles className="h-6 w-6 drop-shadow-lg" />
                          <span className="drop-shadow-lg">الناشر السريع</span>
                          <Zap className="h-6 w-6 drop-shadow-lg" />
                        </>
                      )}
                    </div>
                  </Button>
                </div>

                <div className="text-center mt-4">
                  <p className="text-lg text-slate-300 drop-shadow-sm">
                    🚀 ينشئ المحتوى والصور وينشر على فيسبوك تلقائياً
                  </p>
                </div>

                {/* زر اختبار توليد الصور */}
                <div className="flex justify-center mt-6">
                  <Dialog open={isImageTestOpen} onOpenChange={setIsImageTestOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="bg-slate-700/50 border-cyan-400/30 text-cyan-300 hover:bg-slate-600/50 hover:border-cyan-400/60 hover:text-cyan-200 transition-all duration-300 px-6 py-3 text-base rounded-xl shadow-lg backdrop-blur-sm"
                      >
                        <TestTube className="h-5 w-5 ml-2" />
                        اختبار توليد الصور
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-600"
                    >
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Camera className="h-5 w-5 text-cyan-600" />
                          اختبار توليد الصور بواسطة A4F API
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="test-prompt" className="text-sm font-medium">
                            أدخل البرومت (وصف الصورة):
                          </Label>
                          <Textarea
                            id="test-prompt"
                            placeholder="مثال: صورة احترافية لطبيب في عيادة حديثة، إضاءة طبيعية، جودة عالية"
                            value={testPrompt}
                            onChange={(e) => setTestPrompt(e.target.value)}
                            className="mt-1 min-h-[100px]"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleTestImageGeneration}
                            disabled={!testPrompt.trim() || isGeneratingTestImage}
                            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                          >
                            {isGeneratingTestImage ? (
                              <>
                                <div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full mr-2"></div>
                                جاري التوليد...
                              </>
                            ) : (
                              <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                توليد الصورة
                              </>
                            )}
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setTestPrompt('');
                              setTestImageResult(null);
                            }}
                          >
                            مسح
                          </Button>
                        </div>
                        
                        {testImageResult && (
                          <div className="mt-4 space-y-2">
                            <Label className="text-sm font-medium text-green-700">
                              🎉 تم توليد الصورة بنجاح!
                            </Label>
                            <div className="border rounded-lg overflow-hidden bg-gray-50">
                              <img 
                                src={testImageResult.url} 
                                alt="الصورة المولدة"
                                className="w-full h-64 object-cover"
                              />
                              <div className="p-3 text-sm text-gray-600">
                                <strong>البرومت:</strong> {testImageResult.prompt}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}

            {/* تكوين الأتمتة */}
            {isConfigOpen && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>التخصص</Label>
                    <Select value={config.specialty} onValueChange={(value) => setConfig(prev => ({ ...prev, specialty: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map(specialty => (
                          <SelectItem key={specialty.value} value={specialty.value}>
                            {specialty.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>نوع المحتوى</Label>
                    <Select value={config.contentType} onValueChange={(value) => setConfig(prev => ({ ...prev, contentType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {contentTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>اللغة</Label>
                    <Select value={config.language} onValueChange={(value) => setConfig(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>نمط الصورة</Label>
                    <Select value={config.imageStyle} onValueChange={(value) => setConfig(prev => ({ ...prev, imageStyle: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {imageStyles.map(style => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* حقل مفتاح API خاص لتوليد الصور - المرحلة الرابعة */}
                <div className="space-y-2">
                  <Label htmlFor="custom-gemini-api-key" className="text-sm font-medium flex items-center gap-2">
                    <Camera className="h-4 w-4 text-purple-600" />
                    مفتاح Gemini API خاص لتوليد الصور (اختياري)
                  </Label>
                  <Input
                    id="custom-gemini-api-key"
                    type="password"
                    placeholder="أدخل مفتاح Gemini API الخاص بك..."
                    value={config.customGeminiApiKey}
                    onChange={(e) => setConfig(prev => ({ ...prev, customGeminiApiKey: e.target.value }))}
                    className="bg-purple-50/50 border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                  />
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-purple-400 rounded-full"></span>
                    سيتم استخدامه في المرحلة الرابعة (توليد البرومت) والخامسة (توليد الصورة)
                  </p>
                  {config.customGeminiApiKey && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      تم إدخال مفتاح API مخصص - سيتم استخدامه بالأولوية
                    </div>
                  )}
                </div>

                {/* خيار إيقاف التوليد التلقائي للصور */}
                <div className="flex items-center space-x-3 p-3 bg-orange-50/50 rounded-lg border border-orange-200">
                  <input 
                    type="checkbox"
                    id="stopAfterPrompts"
                    checked={config.stopAfterPromptGeneration}
                    onChange={(e) => setConfig(prev => ({ ...prev, stopAfterPromptGeneration: e.target.checked }))}
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-orange-300 rounded focus:ring-orange-500"
                  />
                  <Label 
                    htmlFor="stopAfterPrompts"
                    className="text-sm font-medium cursor-pointer flex-1 text-orange-700"
                  >
                    إيقاف التوليد التلقائي للصور بعد إنشاء البرومتات
                  </Label>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleStartAutomation}
                    disabled={!config.topic.trim() || !selectedPage || !config.customGeminiApiKey?.trim()}
                    className="flex-1 bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 hover:from-violet-700 hover:via-purple-700 hover:to-cyan-700 text-white"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    بدء الأتمتة
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setIsConfigOpen(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            )}

            {/* عرض حالة الأتمتة أثناء التشغيل */}
            {isRunning && (
              <div className="space-y-4">
                <AutomationProgressDialog
                  isOpen={false}
                  isRunning={isRunning}
                  onClose={() => {}}
                  steps={steps}
                  currentStep={currentStepIndex}
                  elapsedTime={elapsedTime}
                  onPause={pauseAutomation}
                  onResume={resumeAutomation}
                  onCancel={cancelAutomation}
                />
              </div>
            )}

            {/* عرض النتائج التفصيلية بعد الانتهاء من الأتمتة */}
            {!isRunning && steps.length > 0 && (
              <div className="mt-6 space-y-4">
                <EnhancedAutomationResultsDisplay
                  steps={steps}
                  stepResults={stepResults}
                  isRunning={false}
                  currentStepIndex={currentStepIndex}
                  elapsedTime={elapsedTime}
                  automationGeneratedImages={generatedImages}
                  selectedPage={selectedPage}
                />
              </div>
            )}

            {(generatedContent?.imageUrl || generatedContent?.longText) && !isRunning && (
              <div className="mt-6 space-y-4">
                {/* عرض النتائج النهائية بألوان الشبكة العصبية */}
                <div className="p-4 border rounded-lg bg-gradient-to-br from-violet-50 via-purple-50 to-cyan-50 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-cyan-950/30 border-violet-200/50 dark:border-violet-700/50">
                  <h3 className="text-lg font-semibold text-center mb-4 bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
                    ✨ تم إنجاز الأتمتة العصبية بنجاح!
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedContent?.imageUrl && (
                      <div>
                        <img 
                          src={generatedContent.imageUrl} 
                          alt={generatedContent.imageAlt || "الصورة المولدة"}
                          className="w-full h-48 object-cover rounded-lg border border-violet-200/50 shadow-md"
                        />
                      </div>
                    )}
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-violet-700 dark:text-violet-300">النص القصير:</Label>
                        <div className="text-sm bg-white/90 dark:bg-slate-800/90 p-3 rounded border border-violet-200/50 dark:border-violet-700/50 mt-1 max-h-32 overflow-y-auto">
                          {generatedContent?.shortText || 'لم يتم توليد نص قصير بعد'}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-violet-700 dark:text-violet-300">النص الطويل:</Label>
                        <div className="text-sm bg-white/90 dark:bg-slate-800/90 p-3 rounded border border-violet-200/50 dark:border-violet-700/50 mt-1 max-h-32 overflow-y-auto">
                          {generatedContent?.longText || 'لم يتم توليد نص طويل بعد'}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => {
                            // تبديل إلى تبويب facebook-content في السايدبار
                            const event = new CustomEvent('switch-to-tab', { 
                              detail: { tabId: 'facebook-content' } 
                            });
                            window.dispatchEvent(event);
                          }}
                          variant="outline"
                          className="flex-1 border-violet-300 dark:border-violet-600 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          انتقل لنشر فيسبوك
                        </Button>

                        {/* زر النشر المدمج - توليد صورة من البرومت + نشر */}
                        {stepResults['prompt-generation'] && (
                          <Button 
                            onClick={handleIntegratedPublish}
                            disabled={!generatedContent?.longText || !selectedPage || isQuickPublishing}
                            className="flex-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white border-0 shadow-lg"
                          >
                            {isQuickPublishing ? (
                              <>
                                <div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full mr-2"></div>
                                جاري النشر المدمج...
                              </>
                            ) : (
                              <>
                                <Camera className="mr-2 h-4 w-4" />
                                <Send className="mr-1 h-4 w-4" />
                                نشر مدمج (صورة + نص)
                              </>
                            )}
                          </Button>
                        )}
                        
                        <Button 
                          onClick={handleDirectPublish}
                          disabled={!generatedContent?.longText || !selectedPage || isPublishing}
                          className="flex-1 bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 hover:from-violet-700 hover:via-purple-700 hover:to-cyan-700 text-white"
                        >
                          {isPublishing ? (
                            "جاري النشر..."
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              نشر الآن
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* عرض النتائج المرحلية */}
                {Object.keys(stepResults).length > 0 && (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-semibold mb-3 text-gray-800">نتائج المراحل المختلفة:</h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {stepResults['facebook-analysis'] && (
                        <div className="p-3 bg-white rounded border">
                          <h5 className="font-medium text-blue-800 mb-2">🔍 نتائج تحليل الفيسبوك:</h5>
                          <div className="text-sm text-gray-600">
                            <p><strong>التصنيف:</strong> {stepResults['facebook-analysis'].category}</p>
                            <p><strong>الجمهور:</strong> {stepResults['facebook-analysis'].targetAudience}</p>
                            <p><strong>النبرة:</strong> {stepResults['facebook-analysis'].tone}</p>
                          </div>
                        </div>
                      )}
                      
                      {stepResults['prompt-generation'] && (
                        <div className="p-3 bg-white rounded border">
                          <h5 className="font-medium text-purple-800 mb-2">🎨 البرومت المولد:</h5>
                          <div className="text-sm text-gray-600 max-h-20 overflow-y-auto">
                            {typeof stepResults['prompt-generation'] === 'string' 
                              ? stepResults['prompt-generation'].substring(0, 200) 
                              : JSON.stringify(stepResults['prompt-generation']).substring(0, 200)}...
                          </div>
                        </div>
                      )}
                      
                     </div>
                   </div>
                 )}

                 {/* عرض الأسئلة التفاعلية المضافة */}
                 {interactiveQuestions.length > 0 && (
                   <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                     <h4 className="font-semibold mb-3 text-green-800 flex items-center gap-2">
                       <Brain className="h-5 w-5" />
                       الأسئلة التفاعلية المضافة:
                     </h4>
                     <div className="space-y-2">
                       {interactiveQuestions.map((question, index) => (
                         <div key={index} className="text-sm bg-white/80 p-2 rounded border border-green-200">
                           <span className="font-medium text-green-700">{index + 1}.</span> {question}
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
             )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    );
  };

export default EnhancedAutomationEngine;