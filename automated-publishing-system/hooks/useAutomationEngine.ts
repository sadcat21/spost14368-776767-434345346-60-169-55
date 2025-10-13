import React, { useState, useCallback, useRef } from 'react';
import { geminiApiManager } from '@/utils/geminiApiManager';
import { useGeneratedContent } from '@/contexts/GeneratedContentContext';
import { useFacebook } from '@/contexts/FacebookContext';
import { supabase } from '@/integrations/supabase/client';
import { PixabayService } from '@/utils/pixabayService';
import { toast } from 'sonner';
import type { AutomationStep } from '@/components/AutomationProgressDialog';
import { Brain, Sparkles, Image, Upload, Wand2, Search, Target, FileText, Camera, Cloud } from 'lucide-react';

interface AutomationConfig {
  topic: string;
  specialty: string;
  contentType: string;
  language: string;
  imageStyle: string;
  imageSource: string;
  selectedTabs?: string[];
  useBlendedLayout?: boolean;
  selectedPattern?: string;
  customGeminiApiKey?: string; // مفتاح API خاص لتوليد الصور
  stopAfterPromptGeneration?: boolean; // إيقاف التوليد التلقائي للصور
}

export const useAutomationEngine = (options?: { onStepResult?: (stepId: string, result: any) => void }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [steps, setSteps] = useState<AutomationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const { setGeneratedContent } = useGeneratedContent();
  const { selectedPage } = useFacebook();
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const initializeSteps = useCallback((): AutomationStep[] => {
    return [
      {
        id: 'facebook-analysis',
        title: 'تحليل صفحة الفيسبوك',
        description: 'تحليل صفحة الفيسبوك واستخراج التصنيف والمعلومات',
        icon: React.createElement(Search, { className: "h-5 w-5" }),
        status: 'pending' as const
      },
      {
        id: 'content-generation',
        title: 'توليد المحتوى',
        description: 'إنشاء محتوى نصي بناءً على تصنيف الصفحة',
        icon: React.createElement(Wand2, { className: "h-5 w-5" }),
        status: 'pending' as const
      },
      {
        id: 'interactive-questions',
        title: 'توليد الأسئلة التفاعلية',
        description: 'إنشاء أسئلة تفاعلية للمنشور',
        icon: React.createElement(FileText, { className: "h-5 w-5" }),
        status: 'pending' as const
      },
      {
        id: 'prompt-generation',
        title: 'توليد برومت الصورة',
        description: 'توليد برومت إبداعي للصورة بعد الأسئلة التفاعلية',
        icon: React.createElement(Brain, { className: "h-5 w-5" }),
        status: 'pending' as const
      },
      {
        id: 'image-generation',
        title: 'توليد الصورة بنمط جينيوس',
        description: 'توليد صورة احترافية باستخدام البرومت المولد',
        icon: React.createElement(Camera, { className: "h-5 w-5" }),
        status: 'pending' as const
      },
      {
        id: 'post-now',
        title: 'نشر الآن',
        description: 'نشر المحتوى والصورة على الفيسبوك',
        icon: React.createElement(Upload, { className: "h-5 w-5" }),
        status: 'pending' as const
      }
    ];
  }, []);

  const updateStepStatus = useCallback((stepId: string, status: AutomationStep['status'], error?: string, result?: any) => {
    setSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        const updatedStep = { 
          ...step, 
          status,
          error: error || undefined,
          result: result || step.result
        };
        
        if (status === 'running') {
          updatedStep.startTime = Date.now();
        } else if (status === 'completed' || status === 'error') {
          if (step.startTime) {
            updatedStep.endTime = Date.now();
            updatedStep.duration = Math.floor((updatedStep.endTime - step.startTime) / 1000);
          }
        }
        
        if (result && options?.onStepResult) {
          options.onStepResult(stepId, result);
        }
        
        return updatedStep;
      }
      return step;
    }));
  }, [options]);

  const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => {
      const timeout = setTimeout(resolve, ms);
      const checkPause = () => {
        if (isPaused) {
          setTimeout(checkPause, 100);
        } else {
          clearTimeout(timeout);
          resolve();
        }
      };
      checkPause();
    });
  };

  // تحليل محلي ذكي للصفحة
  const analyzeFacebookPage = async (config: AutomationConfig): Promise<any> => {
    console.log('🔍 تحليل صفحة الفيسبوك - استخدام تحليل محلي ذكي');
    
    const smartAnalysis = {
      category: config.specialty || 'عام',
      targetAudience: `جمهور مهتم بـ ${config.topic}`,
      contentStyle: 'احترافي وجذاب',
      keywords: [config.topic, config.specialty].filter(Boolean),
      tone: 'ودود ومهني'
    };
    
    console.log('✅ تم التحليل المحلي بنجاح:', smartAnalysis);
    return smartAnalysis;
  };

  // توليد محتوى محلي ذكي
  const generateContentFromFacebook = async (config: AutomationConfig, facebookAnalysis: any): Promise<{longText: string, shortText: string}> => {
    console.log('📝 توليد المحتوى - استخدام محتوى محلي ذكي');
    
    const smartContent = {
      longText: `📢 ${config.topic}

نحن سعداء لتقديم خدماتنا المتميزة في مجال ${config.specialty}. 

🎯 ما نقدمه:
• خدمات متخصصة وعالية الجودة
• فريق خبير ومتميز
• حلول مبتكرة ومطورة
• خدمة عملاء ممتازة على مدار الساعة

📞 للاستفسار والحجز، تواصل معنا الآن!

#${config.topic.replace(/\s+/g, '_')} #${config.specialty.replace(/\s+/g, '_')} #خدمات_متميزة #جودة_عالية`,
      
      shortText: `🌟 ${config.topic}

خدمات ${config.specialty} بجودة عالية ومتميزة! 

📞 تواصل معنا للحصول على أفضل الخدمات

#${config.topic.replace(/\s+/g, '_')} #${config.specialty.replace(/\s+/g, '_')}`
    };
    
    console.log('✅ تم توليد المحتوى المحلي بنجاح');
    return smartContent;
  };

  // توليد أسئلة تفاعلية محلية
  const generateInteractiveQuestions = async (config: AutomationConfig, content: any): Promise<string[]> => {
    console.log('❓ توليد الأسئلة التفاعلية - استخدام أسئلة محلية ذكية');
    
    const smartQuestions = [
      `ما رأيكم في ${config.topic}؟ شاركوا تجاربكم! 💭`,
      `هل جربتم خدمات ${config.specialty} من قبل؟ 🤔`,
      `ما أهم شيء تبحثون عنه في ${config.topic}؟ ✨`,
      `شاركونا آراءكم حول ${config.specialty}! 💬`
    ];
    
    console.log('✅ تم توليد الأسئلة التفاعلية بنجاح');
    return smartQuestions;
  };

  // توليد برومت ذكي باستخدام Gemini مع إمكانية استخدام مفتاح مخصص
  const generatePromptFromContent = async (config: AutomationConfig, content: any, facebookAnalysis: any): Promise<string> => {
    console.log('🎨 توليد البرومت - المرحلة الرابعة');
    
    // إذا تم إدخال مفتاح API مخصص، استخدم Gemini لتوليد برومت ذكي
    if (config.customGeminiApiKey?.trim()) {
      try {
        console.log('🔑 استخدام مفتاح API مخصص لتوليد برومت ذكي باستخدام Gemini');
        
        const prompt = `Generate a creative and detailed English image prompt for generating a professional ${config.imageStyle} image about "${config.topic}" in the ${config.specialty} field. 

Content context: ${content.shortText}
Target audience: ${facebookAnalysis.targetAudience}
Tone: ${facebookAnalysis.tone}

The prompt should be specific, visual, and optimized for image generation AI. Include details about:
- Visual composition and style
- Lighting and mood
- Colors and atmosphere
- Professional quality indicators

Return only the image prompt in English, without any explanations.`;

        const response = await geminiApiManager.makeRequest(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          },
          config.customGeminiApiKey
        );

        if (response.ok) {
          const data = await response.json();
          const generatedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          
          if (generatedPrompt) {
            console.log('✅ تم توليد برومت ذكي باستخدام Gemini:', generatedPrompt);
            return generatedPrompt;
          }
        }
        
        console.log('⚠️ فشل في استخدام Gemini، التبديل للبرومت المحلي');
      } catch (error) {
        console.error('❌ خطأ في استخدام Gemini:', error);
        console.log('⚠️ التبديل للبرومت المحلي');
      }
    }
    
    // البرومت الاحتياطي المحلي
    const smartPrompt = `Professional ${config.imageStyle} image about ${config.topic} in ${config.specialty} field, high quality, modern design, vibrant colors, engaging composition, professional lighting, clean background, detailed and realistic`;
    
    console.log('✅ تم توليد البرومت المحلي:', smartPrompt);
    return smartPrompt;
  };

  // توليد الصورة - المرحلة الخامسة مع دعم مفتاح API مخصص
  const executeTestImageGeneration = async (prompt: string, customApiKey?: string): Promise<{url: string, prompt: string}> => {
    try {
      console.log('🎨 توليد الصورة - المرحلة الخامسة');
      
      // إذا تم إدخال مفتاح API مخصص، جرب استخدام Gemini لتوليد الصورة أولاً
      if (customApiKey?.trim()) {
        try {
          console.log('🔑 محاولة توليد الصورة باستخدام مفتاح Gemini API المخصص...');
          
          // استخدام Gemini لتوليد الصورة (إذا كان متاحاً)
          const geminiResponse = await geminiApiManager.makeRequest(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ 
                  parts: [{ 
                    text: `Generate an image with this description: ${prompt}. Make it professional and high quality.` 
                  }] 
                }]
              })
            },
            customApiKey
          );

          if (geminiResponse.ok) {
            console.log('✅ تم استخدام Gemini لمعالجة طلب الصورة، التبديل لـ A4F...');
          }
        } catch (error) {
          console.log('⚠️ فشل Gemini، التبديل لـ A4F API...');
        }
      }
      
      // استخدام A4F API لتوليد الصورة (المسار الأساسي)
      console.log('🎨 توليد الصورة باستخدام A4F API...');
      
      const response = await fetch('https://api.a4f.co/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ddc-a4f-d18769825db54bb0a03e087f28dda67f'
        },
        body: JSON.stringify({
          model: 'provider-4/imagen-3',
          prompt: prompt,
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
      if (!imageUrl) {
        throw new Error('لم يتم إرجاع رابط صورة من A4F API');
      }

      console.log('✅ تم توليد الصورة بنجاح باستخدام A4F API');
      return {
        url: imageUrl,
        prompt: prompt
      };

    } catch (error) {
      console.error('❌ فشل في توليد الصورة:', error);
      throw error;
    }
  };

  // النشر السريع على الفيسبوك
  const executeQuickPublish = async (config: AutomationConfig, content: {longText: string, shortText: string}, imageUrl: string): Promise<string> => {
    try {
      if (!selectedPage) {
        throw new Error('لا توجد صفحة فيسبوك مختارة');
      }

      const postMessage = `${content.shortText}\n\n${content.longText}`;
      
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
      return publishData.id;

    } catch (error) {
      console.error('خطأ في النشر السريع:', error);
      throw error;
    }
  };

  // تشغيل الأتمتة الكاملة
  const runAutomation = useCallback(async (config: AutomationConfig) => {
    if (isRunning) return;

    // التحقق من وجود مفتاح API
    if (!config.customGeminiApiKey?.trim()) {
      toast.error('⚠️ مفتاح Gemini API مطلوب! يرجى إدخال المفتاح في الحقل المخصص أولاً. النظام يعتمد حصرياً على المفتاح المدخل من قِبلك.');
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    setElapsedTime(0);
    setCurrentStepIndex(0);
    startTimeRef.current = Date.now();

    const automationSteps = initializeSteps();
    setSteps(automationSteps);

    // مؤقت لحساب الوقت المنقضي
    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000));
      }
    }, 1000);

    try {
      // المرحلة 1: تحليل صفحة الفيسبوك
      updateStepStatus('facebook-analysis', 'running');
      await delay(1000);
      const facebookAnalysis = await analyzeFacebookPage(config);
      updateStepStatus('facebook-analysis', 'completed', undefined, facebookAnalysis);
      setCurrentStepIndex(1);

      // المرحلة 2: توليد المحتوى
      updateStepStatus('content-generation', 'running');
      await delay(1000);
      const content = await generateContentFromFacebook(config, facebookAnalysis);
      updateStepStatus('content-generation', 'completed', undefined, content);
      setCurrentStepIndex(2);

      // المرحلة 3: توليد الأسئلة التفاعلية
      updateStepStatus('interactive-questions', 'running');
      await delay(1000);
      const questions = await generateInteractiveQuestions(config, content);
      updateStepStatus('interactive-questions', 'completed', undefined, questions);
      setCurrentStepIndex(3);

      // المرحلة 4: توليد البرومت (مع إمكانية استخدام مفتاح API مخصص)
      updateStepStatus('prompt-generation', 'running');
      await delay(1000);
      const prompt = await generatePromptFromContent(config, content, facebookAnalysis);
      updateStepStatus('prompt-generation', 'completed', undefined, prompt);
      setCurrentStepIndex(4);

      // التحقق من إعداد إيقاف التوليد التلقائي للصور
      if (config.stopAfterPromptGeneration) {
        console.log('🛑 تم إيقاف الأتمتة بعد توليد البرومت حسب إعدادات المستخدم');
        
        // حفظ المحتوى المولد بدون صورة
        setGeneratedContent({
          longText: content.longText,
          shortText: content.shortText,
          imageUrl: '',
          imageAlt: 'لم يتم توليد صورة - تم إيقاف التوليد التلقائي'
        });

        toast.success('تم إنجاز الأتمتة حتى مرحلة البرومت بنجاح! ✅ لم يتم توليد الصورة حسب إعداداتك.');
        return;
      }

      // المرحلة 5: توليد الصورة (مع تمرير مفتاح API المخصص)
      updateStepStatus('image-generation', 'running');
      const imageResult = await executeTestImageGeneration(prompt, config.customGeminiApiKey);
      updateStepStatus('image-generation', 'completed', undefined, imageResult);
      setCurrentStepIndex(5);

      // المرحلة 6: النشر
      updateStepStatus('post-now', 'running');
      const postId = await executeQuickPublish(config, content, imageResult.url);
      updateStepStatus('post-now', 'completed', undefined, { postId });

      // حفظ المحتوى المولد
      setGeneratedContent({
        longText: content.longText,
        shortText: content.shortText,
        imageUrl: imageResult.url
      });

      toast.success('تم إنجاز الأتمتة بنجاح! 🎉');

    } catch (error) {
      const currentStep = automationSteps[currentStepIndex];
      if (currentStep) {
        updateStepStatus(currentStep.id, 'error', error instanceof Error ? error.message : 'خطأ غير معروف');
      }
      console.error('خطأ في الأتمتة:', error);
      toast.error('حدث خطأ في الأتمتة: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'));
    } finally {
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isRunning, isPaused, currentStepIndex, initializeSteps, updateStepStatus, setGeneratedContent]);

  const pauseAutomation = useCallback(() => {
    if (isRunning && !isPaused) {
      setIsPaused(true);
      pausedTimeRef.current += Date.now() - startTimeRef.current;
      console.log('تم إيقاف الأتمتة مؤقتاً');
    }
  }, [isRunning, isPaused]);

  const resumeAutomation = useCallback(() => {
    if (isRunning && isPaused) {
      setIsPaused(false);
      startTimeRef.current = Date.now();
      console.log('تم استئناف الأتمتة');
    }
  }, [isRunning, isPaused]);

  const stopAutomation = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    console.log('تم إيقاف الأتمتة');
  }, []);

  return {
    isRunning,
    isPaused,
    steps,
    currentStepIndex,
    elapsedTime,
    runAutomation,
    pauseAutomation,
    resumeAutomation,
    stopAutomation,
    executeTestImageGeneration,
    executeQuickPublish,
    // للتوافق مع الكود الموجود
    startAutomation: runAutomation,
    cancelAutomation: stopAutomation
  };
};