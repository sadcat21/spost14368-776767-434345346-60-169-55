import { useState, useCallback } from 'react';
import { geminiApiManager } from '@/utils/geminiApiManager';
import { toast } from 'sonner';
import type { FacebookPage } from '@/contexts/FacebookContext';

interface AutoConfigRequest {
  pageCategory: string;
  pageName: string;
  topic?: string;
}

interface AutoConfigResponse {
  specialty: string;
  contentType: string;
  language: string;
  imageStyle: string;
  suggestedTopic?: string;
  longText: string;
  shortText: string;
  reasoning: {
    specialty: string;
    contentType: string;
    imageStyle: string;
  };
}

export const useGeminiAutoConfiguration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAutoConfig = useCallback(async (
    page: FacebookPage, 
    userTopic?: string
  ): Promise<AutoConfigResponse | null> => {
    setIsGenerating(true);
    
    try {
      const prompt = `
أنت خبير في التسويق الرقمي والمحتوى. بناءً على صفحة الفيسبوك التالية، اقترح أفضل إعدادات للمحتوى:

**معلومات الصفحة:**
- اسم الصفحة: ${page.name}
- تصنيف الصفحة: ${page.category}
${userTopic ? `- الموضوع المطلوب: ${userTopic}` : ''}

**مطلوب منك اقتراح:**

1. **التخصص الأنسب** من هذه الخيارات:
   - طب, تقنية, تعليم, تسويق, صحة, طعام, سفر, موضة, رياضة, فن, عقارات, سيارات

2. **نوع المحتوى الأنسب** من هذه الخيارات:
   - منشور, إعلان, تعليمي, نصائح, قصة, عرض

3. **اللغة المناسبة** من هذه الخيارات:
   - ar (العربية), en (English), ar-en (عربي - إنجليزي)

4. **نمط الصورة المناسب** من هذه الخيارات:
   - احترافي, ملون, بسيط, عصري, فني

${!userTopic ? '5. **اقتراح موضوع** مناسب للصفحة' : ''}

6. **توليد نص طويل**: نص تفصيلي للمنشور (200-300 كلمة)
7. **توليد نص قصير**: نص مختصر للمنشور (50-80 كلمة)

**تنسيق الإجابة (JSON فقط):**
\`\`\`json
{
  "specialty": "القيمة المختارة",
  "contentType": "القيمة المختارة", 
  "language": "القيمة المختارة",
  "imageStyle": "القيمة المختارة",
  ${!userTopic ? '"suggestedTopic": "موضوع مقترح",' : ''}
  "longText": "نص طويل تفصيلي للمنشور مناسب للموضوع وتصنيف الصفحة",
  "shortText": "نص قصير مختصر للمنشور",
  "reasoning": {
    "specialty": "سبب اختيار هذا التخصص",
    "contentType": "سبب اختيار نوع المحتوى",
    "imageStyle": "سبب اختيار نمط الصورة"
  }
}
\`\`\`

**مهم:** يجب أن تكون القيم المختارة من القوائم المحددة أعلاه بالضبط.
`;

      const response = await geminiApiManager.makeRequest(
        geminiApiManager.getApiUrl(),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
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

      const config: AutoConfigResponse = JSON.parse(jsonMatch[1]);
      
      // التحقق من صحة القيم
      const validSpecialties = ['طب', 'تقنية', 'تعليم', 'تسويق', 'صحة', 'طعام', 'سفر', 'موضة', 'رياضة', 'فن', 'عقارات', 'سيارات'];
      const validContentTypes = ['منشور', 'إعلان', 'تعليمي', 'نصائح', 'قصة', 'عرض'];
      const validLanguages = ['ar', 'en', 'ar-en'];
      const validImageStyles = ['احترافي', 'ملون', 'بسيط', 'عصري', 'فني'];

      if (!validSpecialties.includes(config.specialty)) {
        config.specialty = 'تسويق'; // افتراضي
      }
      if (!validContentTypes.includes(config.contentType)) {
        config.contentType = 'منشور'; // افتراضي
      }
      if (!validLanguages.includes(config.language)) {
        config.language = 'ar'; // افتراضي
      }
      if (!validImageStyles.includes(config.imageStyle)) {
        config.imageStyle = 'احترافي'; // افتراضي
      }

      console.log('تم إنتاج تكوين تلقائي من Gemini:', config);
      return config;

    } catch (error) {
      console.error('خطأ في إنتاج التكوين التلقائي:', error);
      toast.error('حدث خطأ في إنتاج التكوين التلقائي');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateAutoConfig,
    isGenerating
  };
};