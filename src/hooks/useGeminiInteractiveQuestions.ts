import { useState, useCallback } from 'react';
import { geminiApiManager } from '@/utils/geminiApiManager';
import { toast } from 'sonner';

interface InteractiveQuestionsParams {
  topic: string;
  specialty: string;
  contentType: string;
  textContent: string;
  apiKey?: string;
}

interface GeneratedQuestions {
  questions: string[];
  questionTypes: string[];
  engagementTips: string[];
}

export const useGeminiInteractiveQuestions = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestions | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateQuestions = useCallback(async (params: InteractiveQuestionsParams): Promise<GeneratedQuestions | null> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const questionsPrompt = `
أنت خبير في التسويق التفاعلي وإشراك الجمهور على وسائل التواصل الاجتماعي.

**معلومات المحتوى:**
- الموضوع: "${params.topic}"
- التخصص: ${params.specialty}
- نوع المحتوى: ${params.contentType}

**المحتوى النصي المنشور:**
"${params.textContent}"

**المطلوب منك إنشاء 7 أسئلة تفاعلية متنوعة:**

**أنواع الأسئلة المطلوبة:**
1. **سؤال رأي**: يطلب رأي الجمهور الشخصي
2. **سؤال تجربة**: يسأل عن تجارب شخصية
3. **سؤال اختيار**: يقدم خيارات للاختيار بينها
4. **سؤال تحدي**: يتضمن تحدي بسيط أو مسابقة
5. **سؤال نصيحة**: يطلب نصائح من الجمهور
6. **سؤال توقع**: يسأل عن توقعات مستقبلية
7. **سؤال قصة**: يشجع على مشاركة قصص قصيرة

**معايير الأسئلة:**
- محفزة للتفاعل والرد
- مناسبة للثقافة العربية
- مرتبطة بالموضوع والمحتوى
- بسيطة وواضحة
- تشجع على النقاش الإيجابي
- متنوعة في الأسلوب والنبرة

**تنسيق الإجابة (JSON فقط):**
\`\`\`json
{
  "questions": [
    "السؤال الأول هنا؟",
    "السؤال الثاني هنا؟",
    "السؤال الثالث هنا؟",
    "السؤال الرابع هنا؟",
    "السؤال الخامس هنا؟",
    "السؤال السادس هنا؟",
    "السؤال السابع هنا؟"
  ],
  "questionTypes": [
    "رأي",
    "تجربة", 
    "اختيار",
    "تحدي",
    "نصيحة",
    "توقع",
    "قصة"
  ],
  "engagementTips": [
    "نصيحة لزيادة التفاعل 1",
    "نصيحة لزيادة التفاعل 2",
    "نصيحة لزيادة التفاعل 3"
  ]
}
\`\`\`

**مهم:** 
- تأكد من أن كل سؤال يناسب نوعه المحدد
- اجعل الأسئلة قصيرة ومباشرة
- استخدم عبارات تحفيزية مناسبة
- تجنب الأسئلة الحساسة أو المثيرة للجدل
`;

      const response = await geminiApiManager.makeRequest(
        geminiApiManager.getApiUrl(),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: questionsPrompt }] }],
            generationConfig: { 
              temperature: 0.8, 
              maxOutputTokens: 1200,
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

      const result: GeneratedQuestions = JSON.parse(jsonMatch[1]);
      
      // التحقق من صحة البيانات
      if (!result.questions || !Array.isArray(result.questions) || result.questions.length !== 7) {
        throw new Error('عدد الأسئلة غير صحيح - يجب أن يكون 7 أسئلة');
      }

      if (!result.questionTypes || !Array.isArray(result.questionTypes)) {
        throw new Error('أنواع الأسئلة غير محددة');
      }

      setGeneratedQuestions(result);
      console.log('✅ تم توليد الأسئلة التفاعلية بنجاح:', result);
      return result;

    } catch (error) {
      console.error('❌ خطأ في توليد الأسئلة التفاعلية:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في توليد الأسئلة التفاعلية';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const resetQuestions = useCallback(() => {
    setGeneratedQuestions(null);
    setError(null);
  }, []);

  return {
    generateQuestions,
    resetQuestions,
    isGenerating,
    generatedQuestions,
    error
  };
};