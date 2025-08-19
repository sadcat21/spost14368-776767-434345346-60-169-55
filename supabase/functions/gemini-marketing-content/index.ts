import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createGeminiKeyManager } from "../_shared/apiKeyRotation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      imageAnalysis, 
      targetAudience, 
      marketingGoal, 
      language = 'arabic',
      customInstructions = ''
    } = await req.json();

    if (!imageAnalysis || !targetAudience || !marketingGoal) {
      throw new Error('Image analysis, target audience, and marketing goal are required');
    }

    console.log('📝 توليد المحتوى التسويقي المحسن...');
    console.log('تصنيف الصورة:', imageAnalysis.category);
    console.log('الجمهور المستهدف:', targetAudience);
    console.log('الهدف التسويقي:', marketingGoal);
    console.log('اللغة:', language);
    
    // إنشاء مدير المفاتيح مع دوران تلقائي
    const keyManager = createGeminiKeyManager();
    console.log('📊 إحصائيات المفاتيح:', keyManager.getStats());

    // إنشاء محتوى تسويقي محسن بناءً على تحليل الصورة المعمق
    let enhancedPrompt = '';
    
    // تحليل المكونات والفوائد من الكلمات المفتاحية
    const keywordAnalysis = imageAnalysis.keywords ? 
      `المكونات المحتملة: ${imageAnalysis.keywords.slice(0, 5).join('، ')}` : 
      'لا توجد كلمات مفتاحية محددة';
    
    // تحسين المعلومات للتسويق
    const marketingContext = `
التحليل التسويقي للصورة:
- الوصف التفصيلي: ${imageAnalysis.description}
- التصنيف: ${imageAnalysis.category}
- الزاوية التسويقية: ${imageAnalysis.marketingAngle}
- ${keywordAnalysis}
- نسبة دقة التحليل: ${imageAnalysis.confidence}%
- العناصر البصرية المؤثرة: ${imageAnalysis.visualElements || 'محددة تلقائياً'}
`;
    
    if (language === 'arabic') {
      enhancedPrompt = `أنت خبير تسويق رقمي متخصص في المنتجات والخدمات. مهمتك إنشاء محتوى تسويقي قوي ومؤثر باللغة العربية.

${marketingContext}

معلومات الاستهداف:
- الجمهور المستهدف: ${targetAudience}
- الهدف التسويقي: ${marketingGoal}
${customInstructions ? `- متطلبات خاصة: ${customInstructions}` : ''}

المطلوب إنشاء محتوى تسويقي يتضمن:

1. **عنوان رئيسي قوي** (10-15 كلمة):
   - يركز على الفائدة الأساسية للمنتج/الخدمة
   - يستخدم كلمات تحفيزية وجذابة
   - يناسب الجمهور المستهدف

2. **نص تسويقي محسن** (60-100 كلمة):
   - يبرز المزايا الفريدة والفوائد
   - يستخدم الكلمات المفتاحية بذكاء
   - يخاطب احتياجات الجمهور المحددة
   - يبني الثقة والمصداقية

3. **دعوة للعمل قوية ومحددة**:
   - واضحة ومباشرة
   - تحفز على الفعل الفوري
   - مناسبة للهدف التسويقي

4. **الإيموجي المناسبة** (2-4 فقط):
   - تدعم الرسالة التسويقية
   - جذابة وملائمة للمحتوى

ضوابط المحتوى:
✅ يركز على فوائد المنتج/الخدمة المستنتجة من الصورة
✅ يستخدم لغة تسويقية احترافية ومقنعة
✅ يناسب منصات التواصل الاجتماعي
✅ يحقق التوازن بين الإقناع والمصداقية
✅ يستفيد من عناصر التحليل البصري للصورة`;

    } else if (language === 'english') {
      enhancedPrompt = `You are an expert digital marketer specializing in product and service marketing. Create powerful and impactful marketing content in English.

${marketingContext}

Targeting Information:
- Target Audience: ${targetAudience}
- Marketing Goal: ${marketingGoal}
${customInstructions ? `- Special Requirements: ${customInstructions}` : ''}

Create enhanced marketing content that includes:

1. **Powerful Main Headline** (10-15 words):
   - Focuses on core product/service benefit
   - Uses compelling and attractive words
   - Suitable for target audience

2. **Enhanced Marketing Copy** (60-100 words):
   - Highlights unique advantages and benefits
   - Uses keywords intelligently
   - Addresses specific audience needs
   - Builds trust and credibility

3. **Strong and Specific Call-to-Action**:
   - Clear and direct
   - Encourages immediate action
   - Suitable for marketing goal

4. **Appropriate Emojis** (2-4 only):
   - Support marketing message
   - Attractive and content-appropriate

Content Guidelines:
✅ Focuses on product/service benefits derived from image analysis
✅ Uses professional and persuasive marketing language
✅ Suitable for social media platforms
✅ Balances persuasion with credibility
✅ Leverages visual analysis elements of the image`;

    } else if (language.includes('tifinagh')) {
      // Handle Amazigh languages with Tifinagh script
      const languageName = {
        'kabyle_tifinagh': 'Taqbaylit (Kabyle)',
        'chaoui_tifinagh': 'Tacawit (Chaoui)',
        'tuareg_tifinagh': 'Tamashek (Tuareg)',
        'mozabit_tifinagh': 'Tumzabt (Mozabite)',
        'chenoui_tifinagh': 'Tacenwit (Chenoui)'
      }[language] || 'Tamazight';

      enhancedPrompt = `You are an expert in Amazigh marketing and ${languageName} language. Create engaging marketing content using Tifinagh script.

${marketingContext}

Target Audience: ${targetAudience}
Marketing Goal: ${marketingGoal}

${customInstructions ? `Additional Instructions: ${customInstructions}` : ''}

Create marketing content in ${languageName} using Tifinagh script that includes:
1. Attention-grabbing headline in Tifinagh
2. Compelling marketing text (40-60 words in Tifinagh)
3. Call-to-action in Tifinagh
4. Appropriate cultural context
5. Modern marketing approach while respecting traditional values

Note: Use authentic Tifinagh script (ⵜⵉⴼⵉⵏⴰⵖ) and ensure cultural appropriateness.`;
    }

    // استخدام نظام دوران المفاتيح لطلب Gemini API
    console.log('🚀 إرسال طلب Gemini API مع دوران المفاتيح...');
    
    const payload = {
      contents: [{
        parts: [{
          text: enhancedPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 600,
      }
    };

    const response = await keyManager.makeGeminiRequest('gemini-2.0-flash-exp', payload);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No content generated by Gemini API');
    }
    
    const content = data.candidates[0].content.parts[0].text;
    console.log('✅ Marketing content generated successfully');

    return new Response(JSON.stringify({
      content: content.trim(),
      language: language,
      targetAudience: targetAudience,
      marketingGoal: marketingGoal,
      imageCategory: imageAnalysis.category,
      confidence: imageAnalysis.confidence
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gemini-marketing-content function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate marketing content',
        details: 'Please check your input parameters and try again'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});