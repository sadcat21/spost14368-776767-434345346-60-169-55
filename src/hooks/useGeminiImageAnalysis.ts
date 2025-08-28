import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { createGeminiKeyManager } from '@/utils/apiKeyRotationManager';
import { useCreditsManager } from './useCreditsManager';

interface ImageAnalysisParams {
  imageData: string; // base64 string
  mimeType: string;
  analysisPrompt?: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

interface ImageAnalysisResult {
  description: string;
  insights: string[];
  colors: string[];
  composition: string;
  mood: string;
  technicalDetails: string;
}

export const useGeminiImageAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { checkCredits, consumeCredits } = useCreditsManager();

  // تحليل الصورة باستخدام Gemini Vision API
  const analyzeImage = useCallback(async (params: ImageAnalysisParams): Promise<ImageAnalysisResult | null> => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // التحقق من الكريدت أولاً
      console.log('🔍 التحقق من الكريدت المتاح...');
      const creditsInfo = await checkCredits();
      
      if (!creditsInfo || !creditsInfo.available) {
        const errorMsg = 'لا يوجد كريدت كافي لتحليل الصورة';
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      }

      console.log(`💳 كريدت متاح: ${creditsInfo.remaining}/${creditsInfo.total}`);
      console.log('👁️ بدء تحليل الصورة باستخدام Gemini Vision...');
      
      // إنشاء مدير دوران المفاتيح
      const keyManager = createGeminiKeyManager();
      console.log('🔑 استخدام نظام دوران المفاتيح التلقائي لتحليل الصور');
      
      // البرومت الافتراضي لتحليل الصورة
      const defaultPrompt = params.analysisPrompt || `
قم بتحليل هذه الصورة بالتفصيل وقدم الآتي:

1. **وصف مفصل للصورة**: وصف شامل ودقيق لكل ما تراه في الصورة
2. **الرؤى والملاحظات المهمة**: أهم النقاط والعناصر التي تجذب الانتباه
3. **الألوان السائدة**: الألوان الرئيسية والثانوية في الصورة
4. **التركيب والتصميم**: كيفية ترتيب العناصر والتوازن البصري
5. **المزاج والجو العام**: الشعور والانطباع الذي تنقله الصورة
6. **التفاصيل التقنية**: جودة الصورة، الإضاءة، الزوايا، إلخ

اجعل التحليل شاملاً ومفيداً للمحتوى الإبداعي والتسويقي.
`;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: defaultPrompt
              },
              {
                inlineData: {
                  mimeType: params.mimeType,
                  data: params.imageData
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: params.temperature || 0.3,
          maxOutputTokens: params.maxOutputTokens || 2048,
          topP: 0.95,
          topK: 40
        }
      };

      // استخدام مدير دوران المفاتيح لتنفيذ الطلب
      const response = await keyManager.makeRequest({
        url: `https://generativelanguage.googleapis.com/v1beta/models/${params.model || 'gemini-2.0-flash-exp'}:generateContent`,
        apiKeyParam: 'key',
        options: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini Vision API error:', errorText);
        throw new Error(`خطأ من Gemini Vision API: ${response.status} - ${errorText}`);
      }

      const apiData = await response.json();
      console.log('Gemini Vision API response received');

      // استخراج النص من الرد
      const candidate = apiData.candidates?.[0];
      if (!candidate || !candidate.content || !candidate.content.parts) {
        throw new Error('لم يتم تلقي تحليل من Gemini Vision API');
      }

      const analysisText = candidate.content.parts
        .filter((part: any) => part.text)
        .map((part: any) => part.text)
        .join('\n');

      if (!analysisText) {
        throw new Error('لم يتم تلقي تحليل نصي من Gemini Vision API');
      }

      // تحليل النص وتقسيمه إلى أقسام
      const result = parseAnalysisResponse(analysisText);
      
      // خصم الكريدت بعد نجاح التحليل
      const creditConsumed = await consumeCredits(2); // خصم 2 كريدت لتحليل الصورة
      if (!creditConsumed) {
        console.warn('⚠️ فشل في خصم الكريدت لكن التحليل تم بنجاح');
      }
      
      setAnalysisResult(result);
      console.log('✅ تم تحليل الصورة بنجاح باستخدام Gemini Vision');
      toast.success('تم تحليل الصورة بنجاح!');
      return result;

    } catch (error) {
      console.error('❌ خطأ في تحليل الصورة:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في تحليل الصورة';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // تحليل الصورة المولدة فقط للحصول على وصف
  const generateImageDescription = useCallback(async (imageData: string, mimeType: string): Promise<string | null> => {
    try {
      console.log('📝 توليد وصف للصورة المولدة...');
      
      const keyManager = createGeminiKeyManager();
      
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `قم بكتابة وصف موجز ودقيق لهذه الصورة باللغة العربية. اجعل الوصف واضحاً ومناسباً للاستخدام كعنوان أو تسمية للصورة. لا تتجاوز 100 كلمة.`
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: imageData
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 200,
          topP: 0.95,
          topK: 40
        }
      };

      const response = await keyManager.makeRequest({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`,
        apiKeyParam: 'key',
        options: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      });

      if (!response.ok) {
        console.warn('فشل في توليد وصف الصورة:', response.status);
        return null;
      }

      const apiData = await response.json();
      const candidate = apiData.candidates?.[0];
      
      if (candidate?.content?.parts?.[0]?.text) {
        const description = candidate.content.parts[0].text.trim();
        console.log('✅ تم توليد وصف الصورة:', description);
        return description;
      }

      return null;
    } catch (error) {
      console.error('خطأ في توليد وصف الصورة:', error);
      return null;
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setAnalysisResult(null);
    setError(null);
  }, []);

  return {
    analyzeImage,
    generateImageDescription,
    resetAnalysis,
    isAnalyzing,
    analysisResult,
    error
  };
};

// دالة لتحليل النص وتقسيمه إلى أقسام
function parseAnalysisResponse(text: string): ImageAnalysisResult {
  const lines = text.split('\n').filter(line => line.trim());
  
  let description = '';
  let insights: string[] = [];
  let colors: string[] = [];
  let composition = '';
  let mood = '';
  let technicalDetails = '';
  
  let currentSection = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // تحديد القسم الحالي
    if (trimmedLine.includes('وصف') || trimmedLine.includes('الصورة')) {
      currentSection = 'description';
      continue;
    } else if (trimmedLine.includes('رؤى') || trimmedLine.includes('ملاحظات')) {
      currentSection = 'insights';
      continue;
    } else if (trimmedLine.includes('ألوان') || trimmedLine.includes('اللون')) {
      currentSection = 'colors';
      continue;
    } else if (trimmedLine.includes('تركيب') || trimmedLine.includes('تصميم')) {
      currentSection = 'composition';
      continue;
    } else if (trimmedLine.includes('مزاج') || trimmedLine.includes('جو')) {
      currentSection = 'mood';
      continue;
    } else if (trimmedLine.includes('تقنية') || trimmedLine.includes('تفاصيل')) {
      currentSection = 'technicalDetails';
      continue;
    }
    
    // إضافة المحتوى للقسم المناسب
    if (trimmedLine && !trimmedLine.startsWith('#') && !trimmedLine.startsWith('*')) {
      switch (currentSection) {
        case 'description':
          description += (description ? ' ' : '') + trimmedLine;
          break;
        case 'insights':
          if (trimmedLine.startsWith('-') || trimmedLine.match(/^\d+\./)) {
            insights.push(trimmedLine.replace(/^[-\d.]\s*/, ''));
          } else {
            insights.push(trimmedLine);
          }
          break;
        case 'colors':
          const colorMatches = trimmedLine.match(/([أ-ي\w]+)/g);
          if (colorMatches) {
            colors.push(...colorMatches);
          }
          break;
        case 'composition':
          composition += (composition ? ' ' : '') + trimmedLine;
          break;
        case 'mood':
          mood += (mood ? ' ' : '') + trimmedLine;
          break;
        case 'technicalDetails':
          technicalDetails += (technicalDetails ? ' ' : '') + trimmedLine;
          break;
        default:
          // إذا لم يتم تحديد قسم، أضف إلى الوصف
          description += (description ? ' ' : '') + trimmedLine;
      }
    }
  }
  
  // إذا لم يتم العثور على أقسام محددة، استخدم النص كله كوصف
  if (!description && !insights.length && !colors.length) {
    description = text;
  }
  
  return {
    description: description || 'تم تحليل الصورة بنجاح',
    insights: insights.length ? insights : ['تحتوي الصورة على عناصر مثيرة للاهتمام'],
    colors: colors.length ? [...new Set(colors)] : ['متنوع'],
    composition: composition || 'تصميم متوازن',
    mood: mood || 'إيجابي',
    technicalDetails: technicalDetails || 'جودة جيدة'
  };
}