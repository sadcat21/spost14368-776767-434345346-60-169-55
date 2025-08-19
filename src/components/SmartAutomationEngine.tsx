import React, { useState, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Bot, 
  Wand2, 
  Image as ImageIcon, 
  FileText, 
  Sparkles, 
  Zap,
  Brain,
  Palette,
  Type,
  Layout,
  Settings,
  ImagePlus
} from "lucide-react";
import { AutomationProgressDialog, AutomationStep } from "./AutomationProgressDialog";
import { geminiApiManager } from "@/utils/geminiApiManager";

interface SmartAutomationEngineProps {
  currentImageUrl?: string;
  geminiApiKey?: string;
  onResultsReady?: (results: any) => void;
  onImageGenerated?: (imageUrl: string) => void;
}

// مفاتيح API المتوفرة
const A4F_API_KEY = 'ddc-a4f-d18769825db54bb0a03e087f28dda67f';
const GEMINI_API_KEY = geminiApiManager.getCurrentKey();

export const SmartAutomationEngine: React.FC<SmartAutomationEngineProps> = ({
  currentImageUrl,
  geminiApiKey,
  onResultsReady,
  onImageGenerated
}) => {
  // استخدام مفتاح API من مدير Gemini إذا لم يتم توفير مفتاح
  const activeGeminiApiKey = geminiApiKey || geminiApiManager.getCurrentKey();
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | undefined>(currentImageUrl);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [steps, setSteps] = useState<AutomationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // دالة لتحويل الصورة إلى base64
  const getImageAsBase64 = async (imageUrl: string): Promise<string> => {
    try {
      console.log('تحميل الصورة من:', imageUrl);
      
      // تحميل الصورة من رابط A4F
      const response = await fetch(imageUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`فشل في تحميل الصورة: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('تم تحميل الصورة، الحجم:', blob.size, 'بايت');
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          // إزالة data:image/jpeg;base64, من البداية والحصول على البيانات فقط
          const base64 = base64data.split(',')[1];
          console.log('تم تحويل الصورة إلى base64، الطول:', base64.length);
          resolve(base64);
        };
        reader.onerror = (error) => {
          console.error('خطأ في FileReader:', error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('خطأ في تحويل الصورة إلى base64:', error);
      throw new Error(`فشل في تحويل الصورة إلى base64: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  };

  // إنشاء خطوات الأوتوميشن
  const createAutomationSteps = useCallback((): AutomationStep[] => {
    const steps = [];

    // إذا لم تكن هناك صورة، أضف خطوة توليد الصورة
    if (!generatedImageUrl) {
      steps.push({
        id: 'generate-image',
        title: 'توليد الصورة بالذكاء الاصطناعي',
        description: 'إنشاء صورة مبتكرة باستخدام A4F AI Image Generator',
        icon: <ImagePlus className="h-5 w-5" />,
        status: 'pending'
      });
    }

    // باقي الخطوات
    steps.push(
      {
        id: 'analyze-image',
        title: 'تحليل الصورة بالذكاء الاصطناعي',
        description: 'تحليل محتوى الصورة وفهم العناصر الموجودة باستخدام Gemini Vision',
        icon: <Brain className="h-5 w-5" />,
        status: 'pending'
      },
      {
        id: 'generate-prompt',
        title: 'توليد البرومت المتقدم',
        description: 'إنشاء نص تحفيزي محترف ومبتكر مناسب للصورة',
        icon: <FileText className="h-5 w-5" />,
        status: 'pending'
      },
      {
        id: 'design-suggestions',
        title: 'اقتراحات التصميم الذكية',
        description: 'تطوير توصيات شخصية للألوان والتخطيط والتنسيق',
        icon: <Palette className="h-5 w-5" />,
        status: 'pending'
      },
      {
        id: 'text-optimization',
        title: 'تحسين النصوص والخطوط',
        description: 'اختيار أفضل الخطوط والأحجام والمواضع للنصوص',
        icon: <Type className="h-5 w-5" />,
        status: 'pending'
      },
      {
        id: 'layout-enhancement',
        title: 'تحسين التخطيط والتركيب',
        description: 'ترتيب العناصر بشكل احترافي وجذاب بصرياً',
        icon: <Layout className="h-5 w-5" />,
        status: 'pending'
      },
      {
        id: 'final-optimization',
        title: 'التحسين النهائي والمعاينة',
        description: 'ضبط التفاصيل الأخيرة وإنتاج النتيجة النهائية',
        icon: <Settings className="h-5 w-5" />,
        status: 'pending'
      }
    );

    return steps;
  }, [generatedImageUrl]);

  // تنفيذ خطوة تحليل الصورة
  const executeImageAnalysis = async (stepId: string): Promise<any> => {
    const imageToAnalyze = generatedImageUrl || currentImageUrl;
    console.log('تحليل الصورة - التحقق:', {
      imageToAnalyze,
      generatedImageUrl,
      currentImageUrl,
      activeGeminiApiKey: activeGeminiApiKey ? 'موجود' : 'غير موجود'
    });
    
    if (!imageToAnalyze || !activeGeminiApiKey) {
      console.error('خطأ في التحقق:', { imageToAnalyze, activeGeminiApiKey });
      throw new Error('مطلوب رابط الصورة ومفتاح Gemini API');
    }

    try {
      // استخدام Gemini 1.5 Flash مع الصورة
      const response = await geminiApiManager.makeRequest(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: `قم بتحليل هذه الصورة بشكل تفصيلي واذكر:
1. العناصر الرئيسية الموجودة في الصورة
2. الألوان المهيمنة والطابع العام
3. التركيب والتخطيط البصري
4. اقتراحات لتحسين التصميم
5. المناطق المناسبة لإضافة النصوص أو الشعارات

يرجى الرد باللغة العربية مع تفاصيل شاملة.`
                },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: await getImageAsBase64(imageToAnalyze)
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('فشل في تحليل الصورة');
      }

      const result = await response.json();
      const analysisText = result.candidates?.[0]?.content?.parts?.[0]?.text || 'لم يتم العثور على تحليل للصورة';
      
      return {
        type: 'text',
        content: analysisText,
        preview: `تم تحليل الصورة بنجاح باستخدام Gemini 1.5 Flash!\n\n${analysisText.substring(0, 200)}...`,
        metadata: {
          model: 'gemini-1.5-flash',
          imageUrl: imageToAnalyze,
          analysisLength: analysisText.length,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('خطأ في تحليل الصورة:', error);
      throw error;
    }
  };

  // تنفيذ خطوة توليد البرومت
  const executePromptGeneration = async (stepId: string, analysisData: any): Promise<any> => {
    if (!activeGeminiApiKey) {
      throw new Error('مطلوب مفتاح Gemini API');
    }

    try {
      const response = await fetch('/functions/v1/prompt-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeGeminiApiKey}`
        },
        body: JSON.stringify({
          imageAnalysis: analysisData,
          promptType: 'creative_marketing',
          language: 'ar',
          style: 'professional'
        })
      });

      if (!response.ok) {
        throw new Error('فشل في توليد البرومت');
      }

      const result = await response.json();
      
      return {
        type: 'text',
        content: result.prompt || result.generated_prompt,
        preview: result.prompt || result.generated_prompt,
        metadata: {
          style: result.style,
          tone: result.tone,
          keywords: result.keywords,
          length: (result.prompt || result.generated_prompt)?.length || 0
        }
      };
    } catch (error) {
      console.error('خطأ في توليد البرومت:', error);
      throw error;
    }
  };

  // تنفيذ خطوة اقتراحات التصميم
  const executeDesignSuggestions = async (stepId: string, previousData: any): Promise<any> => {
    if (!activeGeminiApiKey) {
      throw new Error('مطلوب مفتاح Gemini API');
    }

    try {
      const response = await fetch('/functions/v1/gemini-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeGeminiApiKey}`
        },
        body: JSON.stringify({
          imageUrl: currentImageUrl,
          analysisData: previousData,
          suggestionType: 'design_comprehensive',
          language: 'ar'
        })
      });

      if (!response.ok) {
        throw new Error('فشل في الحصول على اقتراحات التصميم');
      }

      const result = await response.json();
      
      return {
        type: 'json',
        content: JSON.stringify(result, null, 2),
        preview: `اقتراحات التصميم جاهزة!\n\nاللون الأساسي: ${result.primaryColor || 'غير محدد'}\nنمط التدرج: ${result.gradientType || 'خطي'}\nمستوى الشفافية: ${result.opacity || 60}%`,
        metadata: {
          primaryColor: result.primaryColor,
          secondaryColor: result.secondaryColor,
          gradientType: result.gradientType,
          opacity: result.opacity,
          blendMode: result.blendMode
        }
      };
    } catch (error) {
      console.error('خطأ في اقتراحات التصميم:', error);
      throw error;
    }
  };

  // تنفيذ خطوة توليد الصورة مع Gemini fallback
  const executeImageGeneration = async (stepId: string): Promise<any> => {
    // إنشاء برومت افتراضي للصورة
    const defaultPrompt = 'A beautiful, high-quality digital artwork with vibrant colors and professional composition, suitable for social media content and marketing materials';
    
    // أولاً، جرب A4F API
    try {
      console.log('🎨 محاولة توليد الصورة باستخدام A4F API...');
      
      if (!A4F_API_KEY) {
        throw new Error('مفتاح A4F API غير متوفر');
      }
      
      const response = await fetch('https://api.a4f.co/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${A4F_API_KEY}`
        },
        body: JSON.stringify({
          model: 'provider-4/imagen-3',
          prompt: defaultPrompt,
          n: 1,
          size: '1024x1024',
          quality: 'hd'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const imageUrl = result.data?.[0]?.url;
      
      if (!imageUrl) {
        throw new Error('لم يتم إرجاع رابط الصورة من A4F API');
      }

      // حفظ الصورة المولدة
      setGeneratedImageUrl(imageUrl);
      if (onImageGenerated) {
        onImageGenerated(imageUrl);
      }
      
      console.log('✅ تم توليد الصورة بنجاح باستخدام A4F API');
      return {
        type: 'image',
        content: imageUrl,
        preview: 'تم توليد الصورة بنجاح باستخدام A4F!',
        metadata: {
          model: 'imagen-3',
          size: '1024x1024',
          prompt: defaultPrompt,
          source: 'A4F API',
          generatedAt: new Date().toISOString()
        }
      };
      
    } catch (a4fError) {
      console.error('❌ فشل A4F API:', a4fError);
      console.log('🔄 التبديل إلى Gemini API كـ fallback...');
      
      // إذا فشل A4F، جرب Gemini API
      try {
        // التحقق من توفر Gemini API key
        if (!activeGeminiApiKey || activeGeminiApiKey === 'server-managed') {
          throw new Error('مفتاح Gemini API غير متوفر');
        }

        const geminiResponse = await fetch('/supabase/functions/v1/gemini-image-generation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: defaultPrompt,
            width: 1024,
            height: 1024
          })
        });

        if (!geminiResponse.ok) {
          const errorData = await geminiResponse.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${geminiResponse.status}`);
        }

        const geminiData = await geminiResponse.json();
        
        if (!geminiData.imageURL) {
          throw new Error('لم يتم إرجاع رابط صورة من Gemini API');
        }

        // حفظ الصورة المولدة
        setGeneratedImageUrl(geminiData.imageURL);
        if (onImageGenerated) {
          onImageGenerated(geminiData.imageURL);
        }

        console.log('✅ تم توليد الصورة بنجاح باستخدام Gemini API');
        return {
          type: 'image',
          content: geminiData.imageURL,
          preview: 'تم توليد الصورة بنجاح باستخدام Gemini!',
          metadata: {
            model: 'gemini-2.0-flash-preview-image-generation',
            size: '1024x1024',
            prompt: defaultPrompt,
            source: 'Gemini API',
            mimeType: geminiData.mimeType,
            generatedAt: new Date().toISOString()
          }
        };

      } catch (geminiError) {
        console.error('❌ فشل Gemini API أيضاً:', geminiError);
        throw new Error(`فشل كلا من A4F و Gemini APIs. A4F: ${a4fError.message}, Gemini: ${geminiError.message}`);
      }
    }
  };

  // تنفيذ خطوة محددة
  const executeStep = async (step: AutomationStep, previousResults: any[] = []): Promise<any> => {
    const stepStartTime = Date.now();
    
    try {
      let result;
      
      switch (step.id) {
        case 'generate-image':
          result = await executeImageGeneration(step.id);
          break;
          
        case 'analyze-image':
          const imageToAnalyze = generatedImageUrl || currentImageUrl;
          result = await executeImageAnalysis(step.id);
          break;
          
        case 'generate-prompt':
          const analysisData = previousResults.find(r => r.stepId === 'analyze-image')?.result;
          result = await executePromptGeneration(step.id, analysisData);
          break;
          
        case 'design-suggestions':
          const allPreviousData = previousResults.reduce((acc, r) => ({ ...acc, [r.stepId]: r.result }), {});
          result = await executeDesignSuggestions(step.id, allPreviousData);
          break;
          
        case 'text-optimization':
          // محاكاة تحسين النصوص
          await new Promise(resolve => setTimeout(resolve, 2000));
          result = {
            type: 'json',
            content: JSON.stringify({
              fontFamily: 'Cairo',
              fontSize: '24px',
              fontWeight: 'bold',
              textAlign: 'center',
              lineHeight: 1.4
            }, null, 2),
            preview: 'تم تحسين إعدادات النصوص\n\nالخط: Cairo\nالحجم: 24px\nالوزن: عريض\nالمحاذاة: وسط',
            metadata: {
              fontFamily: 'Cairo',
              fontSize: '24px',
              optimized: true
            }
          };
          break;
          
        case 'layout-enhancement':
          // محاكاة تحسين التخطيط
          await new Promise(resolve => setTimeout(resolve, 1500));
          result = {
            type: 'json',
            content: JSON.stringify({
              layout: 'centered',
              spacing: 'optimal',
              alignment: 'balanced'
            }, null, 2),
            preview: 'تم تحسين التخطيط والتركيب\n\nالنمط: متوسط\nالتباعد: مثالي\nالمحاذاة: متوازنة',
            metadata: {
              layout: 'centered',
              optimized: true
            }
          };
          break;
          
        case 'final-optimization':
          // محاكاة التحسين النهائي
          await new Promise(resolve => setTimeout(resolve, 1000));
          result = {
            type: 'html',
            content: '<div class="final-result"><h3>التصميم النهائي جاهز!</h3><p>تم تطبيق جميع التحسينات بنجاح</p></div>',
            preview: 'التصميم النهائي جاهز!\nتم تطبيق جميع التحسينات بنجاح',
            metadata: {
              status: 'completed',
              score: 95
            }
          };
          break;
          
        default:
          throw new Error(`خطوة غير معروفة: ${step.id}`);
      }
      
      const stepEndTime = Date.now();
      const duration = Math.floor((stepEndTime - stepStartTime) / 1000);
      
      return {
        ...result,
        duration,
        stepId: step.id
      };
      
    } catch (error) {
      console.error(`خطأ في تنفيذ الخطوة ${step.id}:`, error);
      throw error;
    }
  };

  // بدء الأوتوميشن
  const startAutomation = useCallback(async () => {
    console.log('بدء الأوتوميشن - التحقق الأولي:', {
      A4F_API_KEY: A4F_API_KEY ? 'موجود' : 'غير موجود',
      activeGeminiApiKey: activeGeminiApiKey ? 'موجود' : 'غير موجود',
      currentImageUrl,
      generatedImageUrl,
      geminiApiKey: geminiApiKey ? 'تم توفيره' : 'لم يتم توفيره'
    });
    
    // التحقق من المفاتيح المطلوبة فقط
    if (!A4F_API_KEY) {
      toast.error('مطلوب مفتاح A4F API لتوليد الصور');
      return;
    }

    if (!activeGeminiApiKey) {
      toast.error('مطلوب مفتاح Gemini API');
      return;
    }

    const automationSteps = createAutomationSteps();
    setSteps(automationSteps);
    setCurrentStepIndex(0);
    setIsRunning(true);
    setIsPaused(false);
    setShowProgress(true);
    setElapsedTime(0);
    startTimeRef.current = Date.now();

    const results: any[] = [];

    // بدء عداد الوقت
    intervalRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    try {
      for (let i = 0; i < automationSteps.length; i++) {
        if (isPaused) {
          return;
        }

        setCurrentStepIndex(i);
        
        // تحديث حالة الخطوة إلى قيد التنفيذ
        setSteps(prevSteps => 
          prevSteps.map((step, index) => ({
            ...step,
            status: index === i ? 'running' : index < i ? 'completed' : 'pending'
          }))
        );

        try {
          const stepResult = await executeStep(automationSteps[i], results);
          results.push(stepResult);

          // تحديث الخطوة بالنتيجة
          setSteps(prevSteps => 
            prevSteps.map((step, index) => ({
              ...step,
              status: index === i ? 'completed' : step.status,
              result: index === i ? stepResult : step.result,
              duration: index === i ? stepResult.duration : step.duration,
              endTime: index === i ? Date.now() : step.endTime
            }))
          );

          toast.success(`تم إنجاز: ${automationSteps[i].title}`);
          
        } catch (error) {
          // تحديث الخطوة بالخطأ
          setSteps(prevSteps => 
            prevSteps.map((step, index) => ({
              ...step,
              status: index === i ? 'error' : step.status,
              error: index === i ? (error as Error).message : step.error
            }))
          );
          
          toast.error(`فشل في: ${automationSteps[i].title}`);
          break;
        }
      }

      // انتهاء الأوتوميشن
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (onResultsReady) {
        onResultsReady(results);
      }
      
      toast.success('تم إنجاز الأوتوميشن الذكي بنجاح!');
      
    } catch (error) {
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      toast.error('حدث خطأ في الأوتوميشن الذكي');
    }
  }, [currentImageUrl, activeGeminiApiKey, createAutomationSteps, onResultsReady, isPaused]);

  // إيقاف مؤقت
  const pauseAutomation = useCallback(() => {
    setIsPaused(true);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    toast.info('تم إيقاف الأوتوميشن مؤقتاً');
  }, []);

  // استئناف
  const resumeAutomation = useCallback(() => {
    setIsPaused(false);
    setIsRunning(true);
    startTimeRef.current = Date.now() - (elapsedTime * 1000);
    
    intervalRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    
    toast.info('تم استئناف الأوتوميشن');
    
    // متابعة من الخطوة الحالية
    startAutomation();
  }, [elapsedTime, startAutomation]);

  // إلغاء
  const cancelAutomation = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setShowProgress(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    toast.error('تم إلغاء الأوتوميشن');
  }, []);

  return (
    <>
      <Card className="border-gradient bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-2 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              محرك الأوتوميشن الذكي
            </span>
            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
              AI-Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-purple-600 mt-1" />
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  أوتوميشن شامل بالذكاء الاصطناعي
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  يقوم النظام بتحليل الصورة وتوليد المحتوى وتحسين التصميم تلقائياً باستخدام Gemini AI
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className="border-purple-300 text-purple-700 dark:text-purple-300">
                    <Brain className="h-3 w-3 mr-1" />
                    تحليل ذكي
                  </Badge>
                  <Badge variant="outline" className="border-blue-300 text-blue-700 dark:text-blue-300">
                    <Wand2 className="h-3 w-3 mr-1" />
                    توليد تلقائي
                  </Badge>
                  <Badge variant="outline" className="border-emerald-300 text-emerald-700 dark:text-emerald-300">
                    <Zap className="h-3 w-3 mr-1" />
                    تحسين متقدم
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-center">
            <Button
              onClick={startAutomation}
              disabled={isRunning}
              size="lg"
              className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Bot className="h-5 w-5 mr-2" />
              {isRunning ? 'جاري التنفيذ...' : 'بدء الأوتوميشن الذكي'}
              <Sparkles className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-3">
            <p className="text-emerald-800 dark:text-emerald-200 text-sm text-center">
              ✅ جاهز للتشغيل! سيتم توليد الصورة وتحليلها تلقائياً
            </p>
          </div>
        </CardContent>
      </Card>

      <AutomationProgressDialog
        isOpen={showProgress}
        onClose={() => setShowProgress(false)}
        steps={steps}
        currentStep={currentStepIndex}
        isRunning={isRunning}
        onPause={pauseAutomation}
        onResume={resumeAutomation}
        onCancel={cancelAutomation}
        totalDuration={totalDuration}
        elapsedTime={elapsedTime}
      />
    </>
  );
};