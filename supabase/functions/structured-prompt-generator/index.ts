import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StructuredPrompt {
  subject: string;
  characters: Array<{
    name: string;
    description: string;
    pose: string;
    expression: string;
  }>;
  background: {
    environment: string;
    details: string;
  };
  style: {
    art: string;
    inspiration: string;
    textures: string;
  };
  mood: string;
  lighting: {
    type: string;
    direction: string;
    effects: string;
  };
  colors: {
    palette: string[];
    dominant: string;
  };
  camera: {
    angle: string;
    lens: string;
    focus: string;
  };
  text_overlay: {
    enabled: boolean;
    content: string;
    font: string;
    size: string;
    color: string;
    position: string;
    style: string;
  };
  composition: {
    rule_of_thirds: boolean;
    symmetry: string;
    balance: string;
  };
  output: {
    resolution: string;
    format: string;
    quality: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, content, specialty, style = "modern" } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found');
    }

    if (!topic || !content) {
      throw new Error('Topic and content are required');
    }

    console.log(`🎨 Generating structured prompt for topic: ${topic}`);

    const structuredPromptRequest = `أنت خبير في إنشاء البرومتات المفصلة للذكاء الاصطناعي. بناءً على:

الموضوع: "${topic}"
التخصص: "${specialty || 'عام'}"  
المحتوى: "${content}"
الأسلوب المطلوب: "${style}"

قم بإنشاء برومت منظم بصيغة JSON مع التأكد من:

✅ التوافق التام مع القيم الإسلامية والحشمة
✅ تجنب العنف والمحتوى غير المناسب
✅ ألوان متناسقة وجذابة
✅ جودة بصرية عالية مناسبة لوسائل التواصل
✅ تجنب الرموز الدينية المخالفة
✅ عدم إظهار النساء بملابس كاشفة
✅ تجنب المحتوى السياسي الحساس

تنسيق JSON المطلوب:
{
  "subject": "وصف الموضوع الرئيسي للصورة باللغة الإنجليزية",
  "characters": [
    {
      "name": "اسم الشخصية الرئيسية",
      "description": "وصف مفصل مناسب وحشيم",
      "pose": "الوضعية والحركة المناسبة",
      "expression": "التعبير والمشاعر الإيجابية"
    }
  ],
  "background": {
    "environment": "البيئة المحيطة المناسبة",
    "details": "تفاصيل إضافية جميلة"
  },
  "style": {
    "art": "الأسلوب الفني العصري",
    "inspiration": "مصدر إلهام مناسب",
    "textures": "الملمس والنسيج الجذاب"
  },
  "mood": "المزاج الإيجابي",
  "lighting": {
    "type": "نوع الإضاءة الطبيعية",
    "direction": "اتجاه الضوء المناسب",
    "effects": "تأثيرات ضوئية جميلة"
  },
  "colors": {
    "palette": ["قائمة بالألوان الجذابة"],
    "dominant": "اللون المهيمن الجميل"
  },
  "camera": {
    "angle": "زاوية احترافية",
    "lens": "نوع عدسة مناسب",
    "focus": "نقطة تركيز واضحة"
  },
  "text_overlay": {
    "enabled": false,
    "content": "",
    "font": "",
    "size": "",
    "color": "",
    "position": "",
    "style": ""
  },
  "composition": {
    "rule_of_thirds": true,
    "symmetry": "نوع التماثل المناسب",
    "balance": "التوازن البصري المثالي"
  },
  "output": {
    "resolution": "1024x1024",
    "format": "png",
    "quality": "high"
  }
}

أعطني JSON كامل ومفصل باللغة الإنجليزية مع مراعاة جميع المعايير المذكورة أعلاه:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: structuredPromptRequest
            }]
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // استخراج JSON من النص
    let structuredPrompt: StructuredPrompt;
    let finalPrompt: string;
    
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        structuredPrompt = JSON.parse(jsonMatch[0]);
        finalPrompt = convertStructuredPromptToText(structuredPrompt);
        
        console.log('✅ تم إنشاء البرومت المنظم بنجاح');
      } else {
        throw new Error('لم يتم العثور على JSON صالح');
      }
    } catch (e) {
      console.error('خطأ في تحليل JSON:', e);
      // برومت احتياطي
      structuredPrompt = createFallbackPrompt(topic, specialty);
      finalPrompt = convertStructuredPromptToText(structuredPrompt);
    }

    return new Response(JSON.stringify({
      structuredPrompt,
      finalPrompt,
      metadata: {
        topic,
        specialty,
        style,
        generatedAt: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in structured-prompt-generator function:', error);
    return new Response(
      JSON.stringify({ error: 'حدث خطأ غير متوقع', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// تحويل البرومت المنظم إلى نص إنجليزي
function convertStructuredPromptToText(structured: StructuredPrompt): string {
  const parts = [];
  
  // الموضوع الرئيسي
  if (structured.subject) {
    parts.push(structured.subject);
  }
  
  // الشخصيات
  if (structured.characters && structured.characters.length > 0) {
    structured.characters.forEach((char) => {
      if (char.description) parts.push(char.description);
      if (char.pose) parts.push(char.pose);
      if (char.expression) parts.push(char.expression);
    });
  }
  
  // الخلفية
  if (structured.background) {
    if (structured.background.environment) parts.push(structured.background.environment);
    if (structured.background.details) parts.push(structured.background.details);
  }
  
  // الأسلوب
  if (structured.style) {
    if (structured.style.art) parts.push(structured.style.art);
    if (structured.style.inspiration) parts.push(`inspired by ${structured.style.inspiration}`);
    if (structured.style.textures) parts.push(structured.style.textures);
  }
  
  // المزاج
  if (structured.mood) {
    parts.push(`${structured.mood} mood`);
  }
  
  // الإضاءة
  if (structured.lighting) {
    if (structured.lighting.type) parts.push(structured.lighting.type);
    if (structured.lighting.direction) parts.push(structured.lighting.direction);
    if (structured.lighting.effects) parts.push(structured.lighting.effects);
  }
  
  // الألوان
  if (structured.colors) {
    if (structured.colors.palette && structured.colors.palette.length > 0) {
      parts.push(`color palette: ${structured.colors.palette.join(', ')}`);
    }
    if (structured.colors.dominant) {
      parts.push(`dominated by ${structured.colors.dominant}`);
    }
  }
  
  // الكاميرا
  if (structured.camera) {
    if (structured.camera.angle) parts.push(structured.camera.angle);
    if (structured.camera.lens) parts.push(structured.camera.lens);
    if (structured.camera.focus) parts.push(structured.camera.focus);
  }
  
  // التكوين
  if (structured.composition) {
    if (structured.composition.rule_of_thirds) parts.push('rule of thirds composition');
    if (structured.composition.symmetry) parts.push(structured.composition.symmetry);
    if (structured.composition.balance) parts.push(structured.composition.balance);
  }
  
  // إضافات للجودة
  parts.push('high quality', 'professional', 'sharp details', 'vibrant colors', 'social media ready');
  
  return parts.filter(Boolean).join(', ');
}

// إنشاء برومت احتياطي
function createFallbackPrompt(topic: string, specialty?: string): StructuredPrompt {
  return {
    subject: `Professional illustration for ${specialty || 'general'} content about ${topic}`,
    characters: [{
      name: "Main Subject",
      description: "Professional and appropriate representation",
      pose: "Natural and confident stance",
      expression: "Positive and engaging"
    }],
    background: {
      environment: "Clean and modern setting",
      details: "Minimal and focused background elements"
    },
    style: {
      art: "Modern digital illustration",
      inspiration: "Contemporary design trends",
      textures: "Smooth and polished finish"
    },
    mood: "Professional and positive",
    lighting: {
      type: "Natural daylight",
      direction: "Soft frontal lighting",
      effects: "Gentle shadows and highlights"
    },
    colors: {
      palette: ["blue", "white", "gray", "green"],
      dominant: "Professional blue tones"
    },
    camera: {
      angle: "Eye level perspective",
      lens: "Standard focal length",
      focus: "Sharp focus on main subject"
    },
    text_overlay: {
      enabled: false,
      content: "",
      font: "",
      size: "",
      color: "",
      position: "",
      style: ""
    },
    composition: {
      rule_of_thirds: true,
      symmetry: "Balanced asymmetry",
      balance: "Well-balanced composition"
    },
    output: {
      resolution: "1024x1024",
      format: "png",
      quality: "high"
    }
  };
}