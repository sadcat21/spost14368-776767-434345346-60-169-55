import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createGeminiKeyManager } from '../_shared/apiKeyRotation.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { type, settings, description, prompt: userPrompt, topic } = requestData;
    
    console.log(`💡 بدء توليد الاقتراحات - النوع: ${type}`)
    
    // إنشاء مدير دوران المفاتيح
    const keyManager = createGeminiKeyManager()
    console.log(`📊 إحصائيات المفاتيح:`, keyManager.getStats())

    let prompt = '';
    
    if (type === 'suggest_name_description') {
      // اقتراح اسم ووصف للنموذج حسب الإعدادات
      prompt = `أنت خبير في التصميم وتدرجات الألوان. بناءً على إعدادات التدرج التالية، اقترح اسماً مناسباً باللغة العربية ووصفاً قصيراً لهذا النموذج:

إعدادات التدرج:
- نوع التدرج: ${settings.gradient_type === 'linear' ? 'خطي' : settings.gradient_type === 'radial' ? 'دائري' : 'مخروطي'}
- اللون الأول: ${settings.first_color} (شفافية: ${settings.first_color_opacity}%)
- اللون الثاني: ${settings.second_color} (شفافية: ${settings.second_color_opacity}%)
- زاوية التدرج: ${settings.gradient_angle}°
- الشفافية العامة: ${settings.global_opacity}%
- استخدام التوقفات الحادة: ${settings.use_sharp_stops ? 'نعم' : 'لا'}

يرجى تقديم:
1. اسم مناسب وجذاب للنموذج (لا يزيد عن 30 حرف)
2. وصف قصير يشرح خصائص هذا التدرج (لا يزيد عن 100 حرف)

قدم الاجابة بصيغة JSON:
{
  "name": "الاسم المقترح",
  "description": "الوصف المقترح"
}`;

    } else if (type === 'suggest_smart_settings') {
      // اقتراح إعدادات ذكية
      const context = description || 'تدرج عام للطبقة العلوية';
      prompt = `أنت خبير في التصميم وتدرجات الألوان. اقترح إعدادات تدرج مناسبة وجميلة للسياق التالي: "${context}"

يرجى اقتراح إعدادات تدرج تشمل:
- نوع التدرج (linear, radial, conic)
- لونين أساسيين مع كودات hex
- زاوية التدرج
- نسب الشفافية
- مواضع الألوان
- إعدادات أخرى مناسبة

قدم الاجابة بصيغة JSON مع التفسير:
{
  "settings": {
    "gradient_type": "نوع التدرج",
    "first_color": "#كود_اللون_الأول", 
    "first_color_opacity": عدد_الشفافية,
    "first_color_position": موضع_اللون_الأول,
    "second_color": "#كود_اللون_الثاني",
    "second_color_opacity": عدد_الشفافية,
    "second_color_position": موضع_اللون_الثاني,
    "gradient_angle": زاوية_التدرج,
    "center_x": 50,
    "center_y": 50,
    "gradient_size": 100,
    "use_sharp_stops": true_or_false,
    "global_opacity": الشفافية_العامة,
    "blend_mode": "normal"
  },
  "explanation": "تفسير سبب اختيار هذه الإعدادات"
}`;
    } else if (type === 'generate_smart_prompt') {
      // توليد برومت ذكي مخصص
      prompt = userPrompt || `أنت خبير في تصميم البرومتات لتوليد الصور. قم بإنشاء برومت احترافي مفصل حول موضوع "${topic}".`;
    }

    // استخدام نظام دوران المفاتيح
    const response = await keyManager.makeGeminiRequest(
      'gemini-pro',
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // محاولة استخراج JSON من النص
    let result;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = { text: generatedText };
      }
    } catch (e) {
      result = { text: generatedText };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gemini-suggestions function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});