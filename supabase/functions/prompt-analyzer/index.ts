import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, language = 'ar' } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found');
    }

    const analysisPrompt = `أنت خبير في تحليل النصوص والبرومتات. قم بتحليل البرومت التالي واستخراج جميع المتغيرات والعناصر القابلة للتخصيص:

"${prompt}"

يرجى تحديد:
1. المتغيرات الرئيسية (الألوان، الأشكال، الأحجام، المواضع، الخطوط، إلخ)
2. لكل متغير، قدم 10-15 خيار مختلف ومتنوع
3. اقتراحات لتحسين البرومت

قدم النتيجة بصيغة JSON التالية:
{
  "variables": [
    {
      "name": "اسم المتغير",
      "type": "نوع المتغير (color, shape, size, position, font, style, etc.)",
      "description": "وصف المتغير",
      "options": [
        {
          "value": "القيمة",
          "label": "التسمية",
          "description": "وصف الخيار"
        }
      ]
    }
  ],
  "suggestions": [
    "اقتراح لتحسين البرومت"
  ],
  "enhanced_prompt": "البرومت المحسن مع المتغيرات المستخرجة"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: analysisPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // استخراج JSON من النص
    let result;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = { 
          error: "Failed to parse JSON",
          raw_text: generatedText 
        };
      }
    } catch (e) {
      result = { 
        error: "JSON parsing error",
        raw_text: generatedText 
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in prompt-analyzer function:', error);
    return new Response(
      JSON.stringify({ error: 'حدث خطأ غير متوقع', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});