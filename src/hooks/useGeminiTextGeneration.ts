import { useState, useCallback } from 'react';
import { geminiApiManager } from '@/utils/geminiApiManager';
import { toast } from 'sonner';

interface TextGenerationParams {
  topic: string;
  specialty: string;
  contentType: string;
  language: string;
  customPrompt?: string;
  apiKey?: string;
}

interface GeneratedText {
  longText: string;
  shortText: string;
  hashtags: string[];
}

export const useGeminiTextGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState<GeneratedText | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateText = useCallback(async (params: TextGenerationParams): Promise<GeneratedText | null> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const contentPrompt = `
أنت كاتب محتوى محترف متخصص في إنشاء محتوى تسويقي جذاب ومؤثر.

**معلومات المحتوى:**
- الموضوع: "${params.topic}"
- التخصص: ${params.specialty}
- نوع المحتوى: ${params.contentType}
- اللغة: ${params.language}
${params.customPrompt ? `- متطلبات إضافية: ${params.customPrompt}` : ''}

**المطلوب منك إنشاء:**

1. **نص طويل (250-350 كلمة)**: 
   - مناسب للمنشور الرئيسي على فيسبوك
   - جذاب ومحفز للتفاعل
   - يحتوي على دعوة واضحة للعمل

2. **نص قصير (60-100 كلمة)**:
   - ملخص مؤثر ومختصر
   - مناسب للتعليقات أو المشاركات السريعة
   - يحافظ على جوهر الرسالة

3. **هاشتاغات (5-7 هاشتاغات)**:
   - مناسبة للموضوع والتخصص
   - متنوعة بين عامة ومتخصصة
   - تزيد من الوصول والتفاعل

**تنسيق الإجابة (JSON فقط):**
\`\`\`json
{
  "longText": "النص الطويل المفصل هنا...",
  "shortText": "النص القصير المختصر هنا...",
  "hashtags": ["#هاشتاج1", "#هاشتاج2", "#هاشتاج3", "#هاشتاج4", "#هاشتاج5"]
}
\`\`\`

**مهم:** 
- استخدم أسلوب جذاب ومناسب للجمهور العربي
- اجعل المحتوى محفز للتفاعل والمشاركة
- تأكد من صحة الهاشتاغات باللغة العربية والإنجليزية
`;

      const response = await geminiApiManager.makeRequest(
        geminiApiManager.getApiUrl(),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: contentPrompt }] }],
            generationConfig: { 
              temperature: 0.8, 
              maxOutputTokens: 1500,
              topP: 0.95,
              topK: 40
            }
          })
        },
        params.apiKey // تمرير API key المخصص
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`خطأ من Gemini API: ${errorData.error?.message || 'خطأ غير معروف'}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('لم يتم تلقي رد من Gemini');
      }

      // استخراج JSON من النص
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch) {
        throw new Error('تنسيق الإجابة غير صحيح من Gemini');
      }

      const result: GeneratedText = JSON.parse(jsonMatch[1]);
      
      // التحقق من صحة البيانات
      if (!result.longText || !result.shortText || !result.hashtags) {
        throw new Error('بيانات غير مكتملة من Gemini');
      }

      setGeneratedText(result);
      console.log('✅ تم توليد المحتوى النصي بنجاح:', result);
      return result;

    } catch (error) {
      console.error('❌ خطأ في توليد المحتوى النصي:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في توليد المحتوى النصي';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const resetText = useCallback(() => {
    setGeneratedText(null);
    setError(null);
  }, []);

  return {
    generateText,
    resetText,
    isGenerating,
    generatedText,
    error
  };
};