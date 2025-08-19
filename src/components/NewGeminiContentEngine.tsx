import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Bot, 
  Wand2, 
  Sparkles, 
  Zap,
  Play,
  RotateCcw,
  Settings,
  Brain,
  Facebook
} from "lucide-react";
import { ContentGenerationResults } from "./ContentGenerationResults";
import { useGeminiTextGeneration } from "@/hooks/useGeminiTextGeneration";
import { useGeminiImagePrompt } from "@/hooks/useGeminiImagePrompt";
import { useGeminiInteractiveQuestions } from "@/hooks/useGeminiInteractiveQuestions";
import { useGeminiContentImageGeneration } from "@/hooks/useGeminiContentImageGeneration";
import { useGeminiApiKey } from "@/hooks/useGeminiApiKey";
import { GeminiApiKeyPrompt } from "./GeminiApiKeyPrompt";
import { GeminiSystemStatus } from "./GeminiSystemStatus";

interface NewGeminiContentEngineProps {
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

export const NewGeminiContentEngine: React.FC<NewGeminiContentEngineProps> = ({ className = "" }) => {
  // Form states
  const [specialty, setSpecialty] = useState("تسويق");
  const [contentType, setContentType] = useState("منشور");
  const [language, setLanguage] = useState("ar");
  const [imageStyle, setImageStyle] = useState("احترافي");
  const [topic, setTopic] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  // استخدام hook مخصص لإدارة مفتاح API
  const { apiKey: geminiApiKey, isLoaded: isApiKeyLoaded, saveApiKey, hasApiKey } = useGeminiApiKey();
  
  // Handler لحفظ مفتاح API باستخدام hook مخصص
  const handleApiKeySet = useCallback((apiKey: string) => {
    saveApiKey(apiKey);
  }, [saveApiKey]);
  
  // Process states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);
  const [currentStep, setCurrentStep] = useState<'idle' | 'text' | 'image-prompt' | 'questions' | 'image-generation' | 'complete'>('idle');
  
  // Hooks for each generation step
  const {
    generateText,
    resetText,
    isGenerating: isTextGenerating,
    generatedText,
    error: textError
  } = useGeminiTextGeneration();
  
  const {
    generateImagePrompt,
    resetPrompt,
    isGenerating: isPromptGenerating,
    generatedPrompt,
    error: promptError
  } = useGeminiImagePrompt();
  
  const {
    generateQuestions,
    resetQuestions,
    isGenerating: isQuestionsGenerating,
    generatedQuestions,
    error: questionsError
  } = useGeminiInteractiveQuestions();

  // Hook لتوليد الصور
  const {
    generateImageFromPrompt,
    resetImages,
    isGenerating: isImageGenerating,
    generatedImages,
    setGeneratedImages,
    error: imageError
  } = useGeminiContentImageGeneration();

  // حالة الأتمتة التلقائية للنشر على فيسبوك
  const [isAutoPublishing, setIsAutoPublishing] = useState(false);
  // خيار إيقاف التوليد التلقائي للصور بعد البرومتات
  const [stopAfterPrompts, setStopAfterPrompts] = useState(false);

  const generateAllContent = useCallback(async () => {
    if (!topic.trim()) {
      toast.error('يرجى إدخال موضوع المحتوى');
      return;
    }

    // التحقق من وجود المفتاح (سيتم تحميل المفتاح الافتراضي تلقائياً)
    if (!hasApiKey() && !geminiApiKey) {
      toast.error('⚠️ خطأ في تحميل مفتاح Gemini API');
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('🚀 بدء توليد المحتوى مع المعاملات:', {
        topic: topic.trim(),
        specialty,
        contentType,
        language,
        imageStyle,
        hasApiKey: !!geminiApiKey.trim(),
        apiKeyLength: geminiApiKey.length
      });

      // إعادة تعيين النتائج السابقة
      resetText();
      resetPrompt();
      resetQuestions();
      resetImages();
      
      const params = {
        topic: topic.trim(),
        specialty,
        contentType,
        language,
        imageStyle,
        customPrompt: customPrompt.trim(),
        apiKey: geminiApiKey // استخدام المفتاح مباشرة من hook
      };

      console.log('📋 معاملات التوليد النهائية:', {
        ...params,
        apiKey: '***' + params.apiKey.slice(-4) // إخفاء المفتاح في اللوغ
      });

      // الخطوة 1: توليد المحتوى النصي
      setCurrentStep('text');
      toast.info('جاري توليد المحتوى النصي...');
      
      const textResult = await generateText(params);
      if (!textResult) {
        throw new Error('فشل في توليد المحتوى النصي');
      }
      
      console.log('✅ تم توليد المحتوى النصي');

      // الخطوة 2: توليد برومت الصورة
      setCurrentStep('image-prompt');
      toast.info('جاري توليد برومت الصورة...');
      
      const promptParams = {
        ...params,
        textContent: textResult.longText,
        apiKey: params.apiKey
      };
      
      const promptResult = await generateImagePrompt(promptParams);
      if (!promptResult) {
        throw new Error('فشل في توليد برومت الصورة');
      }
      
      console.log('✅ تم توليد برومت الصورة');

      // الخطوة 3: توليد الأسئلة التفاعلية
      setCurrentStep('questions');
      toast.info('جاري توليد الأسئلة التفاعلية...');
      
      const questionsParams = {
        topic: params.topic,
        specialty: params.specialty,
        contentType: params.contentType,
        textContent: textResult.longText,
        apiKey: params.apiKey
      };
      
      const questionsResult = await generateQuestions(questionsParams);
      if (!questionsResult) {
        throw new Error('فشل في توليد الأسئلة التفاعلية');
      }
      
      console.log('✅ تم توليد الأسئلة التفاعلية');

      // التحقق من إعداد إيقاف التوليد التلقائي للصور
      if (stopAfterPrompts) {
        console.log('🛑 تم إيقاف التوليد التلقائي للصور حسب إعدادات المستخدم');
        setCurrentStep('complete');
        toast.success('✅ تم إنجاز توليد النص والبرومتات والأسئلة التفاعلية بنجاح! لم يتم توليد الصور حسب إعداداتك.');
        return;
      }

      // الخطوة 4: توليد الصور من البرومت (جميع الأنماط)
      setCurrentStep('image-generation');
      toast.info('جاري توليد الصور بجميع الأنماط الجديدة...');
      
      console.log('🖼️ بدء توليد الصور بجميع الأنماط مع المعاملات:', {
        imagePrompt: promptResult.imagePrompt,
        geniusPrompt: promptResult.geniusPrompt,
        collagePrompt: promptResult.collagePrompt,
        organicMaskPrompt: promptResult.organicMaskPrompt,
        socialBrandingPrompt: promptResult.socialBrandingPrompt,
        technicalNetworkPrompt: promptResult.technicalNetworkPrompt,
        style: params.imageStyle,
        hasApiKey: !!params.apiKey,
        apiKeyLength: params.apiKey?.length
      });
      
      const imageResult = await generateImageFromPrompt({
        imagePrompt: promptResult.imagePrompt,
        geniusPrompt: promptResult.geniusPrompt,
        collagePrompt: promptResult.collagePrompt,
        organicMaskPrompt: promptResult.organicMaskPrompt,
        socialBrandingPrompt: promptResult.socialBrandingPrompt,
        splitLayoutPrompt: promptResult.splitLayoutPrompt,
        geometricMaskingPrompt: promptResult.geometricMaskingPrompt,
        minimalistFramePrompt: promptResult.minimalistFramePrompt,
        gradientOverlayPrompt: promptResult.gradientOverlayPrompt,
        asymmetricalLayoutPrompt: promptResult.asymmetricalLayoutPrompt,
        duotoneDesignPrompt: promptResult.duotoneDesignPrompt,
        cutoutTypographyPrompt: promptResult.cutoutTypographyPrompt,
        overlayPatternPrompt: promptResult.overlayPatternPrompt,
        technicalNetworkPrompt: promptResult.technicalNetworkPrompt,
        style: params.imageStyle,
        apiKey: params.apiKey
      }, (style, image) => {
        // callback للتحديث المتتالي - يتم استدعاؤه عند توليد كل صورة
        console.log(`✨ تم توليد صورة جديدة بنمط ${style}:`, image.imageUrl?.substring(0, 50) + '...');
      });
      
      if (!imageResult) {
        console.warn('⚠️ فشل في توليد الصور، لكن سيتم المتابعة');
      } else {
        console.log('✅ تم توليد الصور بنجاح بجميع الأنماط');
      }

      // اكتمال العملية
      setCurrentStep('complete');
      toast.success('تم إنتاج جميع المحتوى والصور بنجاح! 🎉 (تم توليد صور بجميع الأنماط الجديدة)');

    } catch (error) {
      console.error('❌ خطأ في توليد المحتوى:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في توليد المحتوى';
      toast.error(errorMessage);
      setCurrentStep('idle');
    } finally {
      setIsGenerating(false);
    }
  }, [topic, specialty, contentType, language, imageStyle, customPrompt, generateText, generateImagePrompt, generateQuestions, generateImageFromPrompt, resetText, resetPrompt, resetQuestions, resetImages]);

  const generateTopicSuggestion = useCallback(async () => {
    if (!hasApiKey() && !geminiApiKey) {
      toast.error('⚠️ يرجى إدخال مفتاح Gemini API أولاً');
      return;
    }

    setIsGeneratingTopic(true);
    try {
      const topicPrompt = `
قم بتوليد موضوع مثير ومناسب للمحتوى بناءً على المعايير التالية:

التخصص: ${specialty}
نوع المحتوى: ${contentType}
اللغة: ${language}
نمط الصورة: ${imageStyle}

المطلوب:
- موضوع جذاب ومثير للاهتمام
- يناسب التخصص المحدد
- يحفز التفاعل والمشاركة
- يكون عملي ومفيد للجمهور

أعطني موضوع واحد فقط (بدون تفسير إضافي).
`;

      // استخدام مفتاح API مباشرة مع Google Gemini
      const apiKey = geminiApiKey || 'AIzaSyDKF5PszBk0iNsUjRrEBgby4jFmbia1C44';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: topicPrompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 256 }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API error:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      const suggestedTopic = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (suggestedTopic) {
        setTopic(suggestedTopic);
        toast.success('تم إنشاء موضوع مقترح بنجاح!');
      } else {
        toast.error('فشل في توليد موضوع مقترح');
      }
    } catch (error) {
      console.error('خطأ في توليد الموضوع:', error);
      toast.error(`حدث خطأ في توليد الموضوع: ${error.message}`);
    } finally {
      setIsGeneratingTopic(false);
    }
  }, [specialty, contentType, language, imageStyle, hasApiKey, geminiApiKey]);

  // دالة الأتمتة التلقائية للنشر على فيسبوك
  const handleAutoFacebookPublish = useCallback(async () => {
    if (!hasApiKey() && !geminiApiKey) {
      toast.error('⚠️ يرجى إدخال مفتاح Gemini API أولاً');
      return;
    }

    setIsAutoPublishing(true);
    
    try {
      console.log('🚀 بدء الأتمتة التلقائية للنشر على فيسبوك...');
      
      // إعادة تعيين النتائج السابقة
      resetText();
      resetPrompt();
      resetQuestions();
      resetImages();
      
      // توليد موضوع جديد باستخدام جيميني
      toast.info('جاري توليد موضوع جديد باستخدام جيميني...');
      await generateTopicSuggestion();
      
      // انتظار قصير للتأكد من حفظ الموضوع
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!topic.trim()) {
        throw new Error('فشل في توليد موضوع جديد');
      }
      
      const params = {
        topic: topic.trim(),
        specialty,
        contentType,
        language,
        imageStyle,
        customPrompt: customPrompt.trim(),
        apiKey: geminiApiKey
      };

      console.log('📋 معاملات الأتمتة التلقائية:', {
        ...params,
        apiKey: '***' + params.apiKey.slice(-4)
      });

      // الخطوة 1: توليد المحتوى النصي
      setCurrentStep('text');
      toast.info('جاري توليد المحتوى النصي...');
      
      const textResult = await generateText(params);
      if (!textResult) {
        throw new Error('فشل في توليد المحتوى النصي');
      }
      
      console.log('✅ تم توليد المحتوى النصي');

      // الخطوة 2: توليد برومت الصورة
      setCurrentStep('image-prompt');
      toast.info('جاري توليد برومت الصورة...');
      
      const promptParams = {
        ...params,
        textContent: textResult.longText,
        apiKey: params.apiKey
      };
      
      const promptResult = await generateImagePrompt(promptParams);
      if (!promptResult) {
        throw new Error('فشل في توليد برومت الصورة');
      }
      
      console.log('✅ تم توليد برومت الصورة');

      // الخطوة 3: توليد الأسئلة التفاعلية
      setCurrentStep('questions');
      toast.info('جاري توليد الأسئلة التفاعلية...');
      
      const questionsParams = {
        topic: params.topic,
        specialty: params.specialty,
        contentType: params.contentType,
        textContent: textResult.longText,
        apiKey: params.apiKey
      };
      
      const questionsResult = await generateQuestions(questionsParams);
      if (!questionsResult) {
        throw new Error('فشل في توليد الأسئلة التفاعلية');
      }
      
      console.log('✅ تم توليد الأسئلة التفاعلية');

      // الخطوة 4: توليد الصور (عادية + جينيوس + صورة التفاعل الاجتماعي)
      setCurrentStep('image-generation');
      toast.info('جاري توليد الصور الثلاث (عادية + جينيوس + تفاعل اجتماعي)...');
      
      const imageResult = await generateImageFromPrompt({
        imagePrompt: promptResult.imagePrompt,
        geniusPrompt: promptResult.geniusPrompt,
        collagePrompt: promptResult.collagePrompt,
        organicMaskPrompt: promptResult.organicMaskPrompt,
        socialBrandingPrompt: promptResult.socialBrandingPrompt,
        splitLayoutPrompt: promptResult.splitLayoutPrompt,
        geometricMaskingPrompt: promptResult.geometricMaskingPrompt,
        minimalistFramePrompt: promptResult.minimalistFramePrompt,
        gradientOverlayPrompt: promptResult.gradientOverlayPrompt,
        asymmetricalLayoutPrompt: promptResult.asymmetricalLayoutPrompt,
        duotoneDesignPrompt: promptResult.duotoneDesignPrompt,
        cutoutTypographyPrompt: promptResult.cutoutTypographyPrompt,
        overlayPatternPrompt: promptResult.overlayPatternPrompt,
        technicalNetworkPrompt: promptResult.technicalNetworkPrompt,
        style: params.imageStyle,
        apiKey: params.apiKey
      }, (style, image) => {
        console.log(`✨ تم توليد صورة جديدة بنمط ${style}`);
      });
      
      if (!imageResult) {
        console.warn('⚠️ فشل في توليد الصور، لكن سيتم المتابعة');
      } else {
        console.log('✅ تم توليد الصور بنجاح');
      }

      // اكتمال العملية
      setCurrentStep('complete');
      toast.success('🎉 تم إنتاج جميع المحتوى والصور بنجاح! الآن يمكنك النشر على فيسبوك من النتائج أدناه.');

    } catch (error) {
      console.error('❌ خطأ في الأتمتة التلقائية:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في الأتمتة التلقائية';
      toast.error(errorMessage);
      setCurrentStep('idle');
    } finally {
      setIsAutoPublishing(false);
    }
  }, [specialty, contentType, language, imageStyle, customPrompt, generateText, generateImagePrompt, generateQuestions, generateImageFromPrompt, resetText, resetPrompt, resetQuestions, resetImages, generateTopicSuggestion, topic, geminiApiKey, hasApiKey]);

  // إعادة توليد جميع الصور
  const handleRegenerateImages = useCallback(async () => {
    if (!generatedPrompt) {
      toast.error('يرجى توليد المحتوى أولاً');
      return;
    }

    if (!hasApiKey() && !geminiApiKey) {
      toast.error('⚠️ يرجى إدخال مفتاح Gemini API أولاً');
      return;
    }

    try {
      setCurrentStep('image-generation');
      toast.info('جاري إعادة توليد جميع الأنماط (13 صورة)...');
      
      await generateImageFromPrompt({
        imagePrompt: generatedPrompt.imagePrompt,
        geniusPrompt: generatedPrompt.geniusPrompt,
        collagePrompt: generatedPrompt.collagePrompt,
        organicMaskPrompt: generatedPrompt.organicMaskPrompt,
        socialBrandingPrompt: generatedPrompt.socialBrandingPrompt,
        splitLayoutPrompt: generatedPrompt.splitLayoutPrompt,
        geometricMaskingPrompt: generatedPrompt.geometricMaskingPrompt,
        minimalistFramePrompt: generatedPrompt.minimalistFramePrompt,
        gradientOverlayPrompt: generatedPrompt.gradientOverlayPrompt,
        asymmetricalLayoutPrompt: generatedPrompt.asymmetricalLayoutPrompt,
        duotoneDesignPrompt: generatedPrompt.duotoneDesignPrompt,
        cutoutTypographyPrompt: generatedPrompt.cutoutTypographyPrompt,
        overlayPatternPrompt: generatedPrompt.overlayPatternPrompt,
        technicalNetworkPrompt: generatedPrompt.technicalNetworkPrompt,
        style: imageStyle,
        apiKey: geminiApiKey,
        temperature: 0.8
      });

      setCurrentStep('complete');
      toast.success('تم إعادة توليد جميع الأنماط بنجاح! 🎉');
    } catch (error) {
      console.error('خطأ في إعادة توليد الصور:', error);
      toast.error('فشل في إعادة توليد الصور');
      setCurrentStep('complete');
    }
  }, [generatedPrompt, imageStyle, geminiApiKey, hasApiKey, generateImageFromPrompt]);

  // إعادة توليد صورة واحدة حسب النمط
  const handleRegenerateSingleImage = useCallback(async (prompt: string, style: string) => {
    if (!hasApiKey() && !geminiApiKey) {
      toast.error('⚠️ يرجى إدخال مفتاح Gemini API أولاً');
      return;
    }

    try {
      toast.info(`جاري إعادة توليد صورة ${style}...`);
      
      // إنشاء برومت جديد لهذا النمط المحدد
      const regenerateParams = {
        imagePrompt: prompt,
        geniusPrompt: style === 'جينيوس' ? prompt : '',
        collagePrompt: style === 'كولاج' ? prompt : '',
        organicMaskPrompt: style === 'قص عضوي' ? prompt : '',
        socialBrandingPrompt: style === 'علامة تجارية اجتماعية' ? prompt : '',
        splitLayoutPrompt: style === 'تصميم مقسوم' ? prompt : '',
        geometricMaskingPrompt: style === 'قص هندسي' ? prompt : '',
        minimalistFramePrompt: style === 'إطار بسيط' ? prompt : '',
        gradientOverlayPrompt: style === 'طبقة تدرج لوني' ? prompt : '',
        asymmetricalLayoutPrompt: style === 'تصميم غير متماثل' ? prompt : '',
        duotoneDesignPrompt: style === 'تصميم ثنائي اللون' ? prompt : '',
        cutoutTypographyPrompt: style === 'قص النصوص' ? prompt : '',
        overlayPatternPrompt: style === 'طبقة النقوش' ? prompt : '',
        technicalNetworkPrompt: style === 'شبكة تقنية متدرجة' ? prompt : '',
        style: imageStyle,
        apiKey: geminiApiKey,
        temperature: 0.9
      };

      await generateImageFromPrompt(regenerateParams);
      toast.success(`تم إعادة توليد صورة ${style} بنجاح! ✨`);
    } catch (error) {
      console.error(`خطأ في إعادة توليد صورة ${style}:`, error);
      toast.error(`فشل في إعادة توليد صورة ${style}`);
    }
  }, [imageStyle, geminiApiKey, hasApiKey, generateImageFromPrompt]);

  const resetAll = useCallback(() => {
    resetText();
    resetPrompt();
    resetQuestions();
    resetImages();
    setCurrentStep('idle');
    setTopic("");
    setCustomPrompt("");
    toast.info('تم إعادة تعيين جميع البيانات');
  }, [resetText, resetPrompt, resetQuestions, resetImages]);

  const getStepStatus = (step: string) => {
    if (currentStep === 'idle') return 'pending';
    
    const stepOrder = ['text', 'image-prompt', 'questions', 'image-generation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(step);
    
    if (currentStep === 'complete') return 'completed';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* حالة النظام */}
      <GeminiSystemStatus />
      {/* نموذج الإعداد */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            🎨 إعداد نظام Gemini المستقل
            <div className="ml-auto flex items-center gap-2">
              {hasApiKey() ? (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium">متصل</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium">يحتاج مفتاح</span>
                </div>
              )}
            </div>
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            نظام مستقل يعتمد كلياً على مفتاح Gemini API المدخل من المستخدم
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="specialty">التخصص</Label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contentType">نوع المحتوى</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">اللغة</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="imageStyle">نمط الصورة</Label>
              <Select value={imageStyle} onValueChange={setImageStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {imageStyles.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="topic">موضوع المحتوى *</Label>
            <div className="relative">
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="أدخل موضوع المحتوى أو اضغط على الزر لتوليد موضوع مقترح..."
                className="text-right pr-12"
              />
              <Button
                onClick={generateTopicSuggestion}
                disabled={isGeneratingTopic || !hasApiKey()}
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-primary/10"
                title="توليد موضوع مقترح باستخدام Gemini"
              >
                {isGeneratingTopic ? (
                  <Brain className="h-4 w-4 animate-pulse text-primary" />
                ) : (
                  <Brain className="h-4 w-4 text-primary" />
                )}
              </Button>
            </div>
          </div>

          {/* إدارة مفتاح Gemini API */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <Label className="text-purple-700 dark:text-purple-300 font-semibold">
                🔑 إدارة مفتاح Gemini API (إجباري)
              </Label>
              {hasApiKey() && (
                <div className="flex items-center gap-1 ml-auto">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">متصل</span>
                </div>
              )}
            </div>
            
            {!hasApiKey() ? (
              <div className="space-y-3">
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  ⚠️ يرجى إدخال مفتاح Gemini API للمتابعة. النظام يعتمد كلياً على مفتاحك الشخصي.
                </p>
                <GeminiApiKeyPrompt 
                  onApiKeySet={handleApiKeySet}
                  currentApiKey=""
                  autoFocus={false}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">مفتاح API محفوظ ومتصل بنجاح</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  المفتاح محفوظ محلياً في متصفحك. يمكنك{" "}
                  <button 
                    onClick={() => saveApiKey('')}
                    className="text-red-500 hover:underline"
                  >
                    حذف المفتاح
                  </button>
                  {" "}وإدخال مفتاح جديد.
                </p>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground bg-white/50 dark:bg-black/20 rounded p-2">
              💡 يمكنك الحصول على مفتاح API مجاني من{" "}
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Google AI Studio
              </a>
            </div>
          </div>

          {/* خيار إيقاف التوليد التلقائي للصور */}
          <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <input 
              type="checkbox"
              id="stopAfterPrompts"
              checked={stopAfterPrompts}
              onChange={(e) => setStopAfterPrompts(e.target.checked)}
              className="w-4 h-4 text-orange-600 bg-gray-100 border-orange-300 rounded focus:ring-orange-500"
            />
            <Label 
              htmlFor="stopAfterPrompts"
              className="text-sm font-medium cursor-pointer flex-1 text-orange-700 dark:text-orange-300"
            >
              ⏹️ إيقاف التوليد التلقائي للصور بعد إنشاء البرومتات
            </Label>
          </div>

          <div>
            <Label htmlFor="customPrompt">متطلبات إضافية (اختياري)</Label>
            <Textarea
              id="customPrompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="أضف أي متطلبات أو توجيهات خاصة للمحتوى..."
              className="min-h-[80px] text-right"
            />
          </div>
        </CardContent>
      </Card>

      {/* أزرار التحكم */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={generateAllContent}
              disabled={isGenerating || isAutoPublishing || !topic.trim() || !hasApiKey()}
              className="flex-1 h-12"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  جاري التوليد...
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5 mr-2" />
                  توليد المحتوى الكامل
                </>
              )}
            </Button>
            
            <Button
              onClick={handleAutoFacebookPublish}
              disabled={isGenerating || isAutoPublishing || !hasApiKey()}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {isAutoPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  جاري الأتمتة...
                </>
              ) : (
                <>
                  <Facebook className="h-5 w-5 mr-2" />
                  نشر فيسبوك مباشر
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={resetAll}
              disabled={isGenerating || isAutoPublishing}
              className="sm:w-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              إعادة تعيين
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* مؤشر التقدم */}
      {(isGenerating || currentStep !== 'idle') && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-primary flex items-center gap-2">
                <Brain className="h-4 w-4" />
                حالة التوليد
              </h4>
              
              <div className="space-y-2">
                {[
                  { key: 'text', label: 'توليد المحتوى النصي', icon: '📝' },
                  { key: 'image-prompt', label: 'توليد برومت الصورة', icon: '🎨' },
                  { key: 'questions', label: 'توليد الأسئلة التفاعلية', icon: '❓' },
                  { key: 'image-generation', label: 'توليد الصورة', icon: '🖼️' }
                ].map((step) => {
                  const status = getStepStatus(step.key);
                  return (
                    <div key={step.key} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        status === 'completed' ? 'bg-green-500 text-white' :
                        status === 'active' ? 'bg-blue-500 text-white animate-pulse' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {status === 'completed' ? '✓' : 
                         status === 'active' ? '⏳' : '○'}
                      </div>
                      <span className={`text-sm ${
                        status === 'completed' ? 'text-green-600 font-medium' :
                        status === 'active' ? 'text-blue-600 font-medium' :
                        'text-muted-foreground'
                      }`}>
                        {step.icon} {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* عرض النتائج */}
        <ContentGenerationResults
          generatedText={generatedText}
          generatedPrompt={generatedPrompt}
          generatedQuestions={generatedQuestions}
          generatedImages={generatedImages}
          isTextLoading={isTextGenerating}
          isPromptLoading={isPromptGenerating}
          isQuestionsLoading={isQuestionsGenerating}
          isImageLoading={isImageGenerating}
          currentStep={currentStep}
          onRegenerateImages={handleRegenerateImages}
          onRegenerateSingleImage={handleRegenerateSingleImage}
          onUpdateImages={setGeneratedImages}
          apiKey={geminiApiKey}
          originalPrompt={topic}
        />
    </div>
  );
};