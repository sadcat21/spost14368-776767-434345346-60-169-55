import { useState, useCallback } from 'react';
import { geminiApiManager } from '@/utils/geminiApiManager';
import { toast } from 'sonner';

interface ImagePromptParams {
  topic: string;
  specialty: string;
  contentType: string;
  imageStyle: string;
  textContent?: string;
  apiKey?: string;
}

interface GeneratedImagePrompt {
  imagePrompt: string;
  geniusPrompt: string; // برومت النمط جينيوس
  collagePrompt: string; // برومت تصميم الكولاج
  organicMaskPrompt: string; // برومت القص العضوي
  socialBrandingPrompt: string; // برومت العلامة التجارية الاجتماعية
  splitLayoutPrompt: string; // برومت التصميم المقسوم
  geometricMaskingPrompt: string; // برومت القص الهندسي
  minimalistFramePrompt: string; // برومت الإطار البسيط
  gradientOverlayPrompt: string; // برومت طبقة التدرج اللوني
  asymmetricalLayoutPrompt: string; // برومت التصميم غير المتماثل
  duotoneDesignPrompt: string; // برومت التصميم ثنائي اللون
  cutoutTypographyPrompt: string; // برومت قص النصوص
  overlayPatternPrompt: string; // برومت طبقة النقوش
  technicalNetworkPrompt: string; // برومت الشبكة التقنية المتدرجة
  style: string;
  elements: string[];
  mood: string;
  composition: string;
}

export const useGeminiImagePrompt = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedImagePrompt | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateImagePrompt = useCallback(async (params: ImagePromptParams): Promise<GeneratedImagePrompt | null> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const promptText = `
أنت خبير في إنشاء وصوفات دقيقة ومفصلة لتوليد الصور باستخدام الذكاء الاصطناعي (Imagen).

**معلومات المشروع:**
- الموضوع: "${params.topic}"
- التخصص: ${params.specialty}
- نوع المحتوى: ${params.contentType}
- نمط الصورة المطلوب: ${params.imageStyle}

**المحتوى النصي المولد (يجب ربط الصور به):**
${params.textContent ? `"${params.textContent.slice(0, 800)}..."` : 'لم يتم توفير محتوى نصي'}

**مهم جداً: يجب أن تكون جميع برومتات الصور مرتبطة ومتناسقة مع المحتوى النصي أعلاه**

**المطلوب منك إنشاء برومتات صور ترتبط مباشرة بالمحتوى النصي:**

1. **وصف مفصل للصورة (Image Prompt)**:
   - يجب أن يعكس الفكرة الرئيسية من المحتوى النصي
   - وصف دقيق باللغة الإنجليزية مرتبط بالنص
   - يتضمن العناصر المذكورة في المحتوى النصي
   - مناسب لتوليد صورة تدعم وتوضح النص المكتوب

2. **برومت النمط جينيوس (Genius Prompt)**:
   - تصميم إبداعي يدعم المحتوى النصي بصرياً
   - ربط العناصر الفنية بالأفكار الموجودة في النص
   - إبداع مرتبط بموضوع وأهداف المحتوى المكتوب

3. **برومت تصميم الكولاج (Collage Layout Prompt)**:
   - وصف لتصميم كولاج باللغة الإنجليزية
   - ترتيب متعدد الصور في تركيبة فنية
   - توزيع متوازن للعناصر مع إطارات وفراغات
   - مناسب عندما يكون هناك أكثر من صورة واحدة

4. **برومت القص العضوي (Organic Shape Masking Prompt)**:
   - وصف لقص الصور بأشكال طبيعية غير منتظمة
   - استخدام منحنيات وأشكال عضوية متدفقة
   - حدود ناعمة وانسيابية بدلاً من الحدود المستقيمة
   - تأثيرات بصرية فنية وطبيعية

5. **برومت العلامة التجارية الاجتماعية (Social Media Branding Prompt)**:

تصميم مخصص للنشر على منصات التواصل الاجتماعي مع الحفاظ على هوية العلامة التجارية

أبعاد مثالية للاستخدام على فيسبوك، إنستغرام، وتويتر

بدون أي نصوص أو حروف داخل التصميم، مع توفير مساحات فارغة أو مناطق مهيأة لإضافة النصوص لاحقاً

عناصر الهوية البصرية مثل الألوان، الأنماط، والأيقونات المميزة للعلامة

خلفية أو مشهد إبداعي يعكس موضوع وتخصص المحتوى

تركيز على الإخراج الفني الجذاب الذي يحفّز المشاركة والتفاعل

تجنّب الموكاب والصور الإعلانية الجاهزة، والاكتفاء بمشهد فني جاهز للنشر

استخدام التوازن بين العناصر البصرية لخلق إحساس بالاحترافية والانسيابية

6. **برومت التصميم المقسوم (Split Layout Prompt)**:
   - تقسيم المساحة إلى قسمين أو أكثر (عموديًا أو أفقيًا)
   - أحد الأقسام للصورة والآخر للنص أو الرسوميات
   - توازن بصري بين الأقسام المختلفة
   - تصميم نظيف ومنظم مع خطوط فاصلة واضحة

7. **برومت القص الهندسي (Geometric Masking Prompt)**:
   - استخدام أشكال هندسية لقص أجزاء من الصور
   - دوائر، مربعات، مثلثات أو مضلعات منتظمة
   - تأثيرات بصرية حديثة ومعاصرة
   - توزيع متوازن للأشكال الهندسية في التصميم

8. **برومت الإطار البسيط (Minimalist Frame Prompt)**:
   - إبقاء الصورة كاملة مع إطار ملون أو مساحة فارغة
   - تصميم بسيط وأنيق بجانب الصورة للمحتوى النصي
   - استخدام المساحات البيضاء بذكاء
   - تركيز على البساطة والوضوح

9. **برومت طبقة التدرج اللوني (Gradient Overlay Prompt)**:
   - إضافة تدرج لوني نصف شفاف فوق الصورة أو بجانبها
   - دمج النصوص بشكل متناسق مع التدرج
   - ألوان متدرجة تتماشى مع موضوع الصورة
   - تأثيرات بصرية ناعمة وجذابة

10. **برومت التصميم غير المتماثل (Asymmetrical Layout Prompt)**:
    - توزيع العناصر بشكل غير متوازن عمدًا
    - خلق ديناميكية وحركة في التصميم
    - استخدام التباين والتوازن البصري الحديث
    - تصميم جريء ومبتكر يجذب الانتباه

11. **برومت التصميم ثنائي اللون (Duotone Design Prompt)**:
    - جعل الصورة أو جزء منها بلونين فقط
    - ألوان تتماشى مع الهوية البصرية
    - تأثيرات بصرية عصرية وجذابة
    - تركيز على التباين اللوني المؤثر

12. **برومت قص النصوص (Cutout Typography Prompt)**:
    - كتابة نصوص كـ "قناع" يُظهر الصورة بداخل الحروف
    - تايبوغرافي إبداعي مع الصورة كخلفية للنص
    - حروف كبيرة وواضحة مملوءة بالصورة
    - تأثيرات بصرية مبتكرة ولافتة للنظر

13. **برومت طبقة النقوش (Overlay Pattern Prompt)**:
     - إضافة أشكال أو خطوط أو نقوش شفافة فوق الصورة
     - أنماط هندسية أو طبيعية تضفي لمسة فنية
     - طبقات شفافة لا تحجب الصورة الأساسية
     - توازن بين النقش والصورة الأصلية

14. **برومت الشبكة التقنية المتدرجة (Technical Network Gradient Prompt)**:
     - خلفية بتدرجات لونية من الأزرق إلى الأخضر والأبيض
     - شبكة من الخطوط والنقاط المترابطة تُظهر التقنية والترابط
     - أشكال هندسية منحنية وانسيابية تشبه الموجات
     - مساحات بيضاء واسعة مخصصة لإضافة النصوص والمحتوى
     - تصميم احترافي ونظيف مناسب للمؤسسات والشركات التقنية
     - تأثيرات ضوئية خفيفة وشفافة تضفي عمقاً للتصميم
     - شعور بالحداثة والتطور التكنولوجي
     - تناسق لوني متدرج يخلق إحساساً بالانسيابية والحركة

15. **تفاصيل النمط (Style Details)**:
   - وصف النمط الفني المطلوب
   - نوع التصوير أو الرسم
   - المزاج البصري العام

15. **العناصر الأساسية (Key Elements)**:
   - قائمة بالعناصر المهمة في الصورة
   - الكائنات والأشخاص والخلفيات

16. **المزاج العام (Mood)**:
   - الشعور والانطباع المطلوب
   - الطاقة والعاطفة المراد نقلها

17. **التركيب (Composition)**:
   - ترتيب العناصر في الصورة
   - زاوية التصوير والتأطير

**تنسيق الإجابة (JSON فقط):**
\`\`\`json
{
  "imagePrompt": "Professional detailed English description for AI image generation...",
  "geniusPrompt": "Creative genius-style English prompt with free artistic design and innovative elements...",
  "collagePrompt": "Collage layout design prompt with multiple image arrangement and creative composition...",
  "organicMaskPrompt": "Organic shape masking prompt with natural curves and flowing boundaries...",
"socialBrandingPrompt": "Creative social media branding template optimized for Facebook, Instagram, and Twitter dimensions, featuring brand identity colors, patterns, and signature elements, with no text or lettering included, but containing visually balanced empty spaces for later text placement. The scene should be artistic, engaging, and directly connected to the topic and specialty, avoiding any device mockups, and delivering a high-quality, ready-to-publish visual composition."
  "splitLayoutPrompt": "Split layout design prompt with divided sections for image and text elements...",
  "geometricMaskingPrompt": "Geometric masking prompt with circles, squares, triangles and polygon shapes...",
  "minimalistFramePrompt": "Minimalist frame design prompt with clean borders and white space for text...",
  "gradientOverlayPrompt": "Gradient overlay design prompt with semi-transparent color gradients over images...",
  "asymmetricalLayoutPrompt": "Asymmetrical layout prompt with intentionally unbalanced element distribution...",
  "duotoneDesignPrompt": "Duotone design prompt with two-color image treatment and brand consistency...",
  "cutoutTypographyPrompt": "Cutout typography prompt with text as mask showing image inside letters...",
  "overlayPatternPrompt": "Overlay pattern design prompt with transparent shapes and artistic elements over image...",
  "technicalNetworkPrompt": "Technical network gradient design with blue to green color gradients, interconnected nodes and lines forming a technological network pattern, curved geometric shapes resembling flowing waves, ample white space areas for text placement, professional and clean design suitable for tech companies and institutions, subtle light effects and transparency for depth, modern technological advancement feel, harmonious gradient colors creating smooth flow and movement, high-quality 4K professional background",
  "style": "وصف النمط الفني المطلوب",
  "elements": ["عنصر 1", "عنصر 2", "عنصر 3", "عنصر 4"],
  "mood": "وصف المزاج والطاقة المطلوبة",
  "composition": "وصف التركيب والتأطير"
}
\`\`\`

**مهم:** 
- اجعل الوصف الإنجليزي مفصل وتقني لأفضل نتائج من Imagen
- برومت جينيوس يجب أن يكون إبداعي وحر مع تصميم متنوع
- تأكد من مناسبة الصورة للثقافة العربية
- استخدم كلمات مفتاحية قوية لجودة عالية مثل: "high quality", "professional", "4K", "detailed"
- في النمط جينيوس، اجعل التصميم مرن وإبداعي مع ألوان متنوعة
`;

      const response = await geminiApiManager.makeRequest(
        geminiApiManager.getApiUrl(),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { 
              temperature: 0.9, 
              maxOutputTokens: 2500, // زيادة الحد لاستيعاب كل البرومتات
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

      const result: GeneratedImagePrompt = JSON.parse(jsonMatch[1]);
      
      // التحقق من صحة البيانات
      if (!result.imagePrompt || !result.geniusPrompt || !result.collagePrompt || 
          !result.organicMaskPrompt || !result.socialBrandingPrompt || 
          !result.splitLayoutPrompt || !result.geometricMaskingPrompt ||
          !result.minimalistFramePrompt || !result.gradientOverlayPrompt ||
          !result.asymmetricalLayoutPrompt || !result.duotoneDesignPrompt ||
          !result.cutoutTypographyPrompt || !result.overlayPatternPrompt ||
          !result.technicalNetworkPrompt || !result.style || !result.elements) {
        throw new Error('بيانات غير مكتملة من Gemini');
      }

      setGeneratedPrompt(result);
      console.log('✅ تم توليد برومت الصورة بنجاح:', result);
      return result;

    } catch (error) {
      console.error('❌ خطأ في توليد برومت الصورة:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في توليد برومت الصورة';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const resetPrompt = useCallback(() => {
    setGeneratedPrompt(null);
    setError(null);
  }, []);

  return {
    generateImagePrompt,
    resetPrompt,
    isGenerating,
    generatedPrompt,
    error
  };
};
