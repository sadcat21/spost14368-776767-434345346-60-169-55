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
    const { imageData, imageMimeType, imageUrl, prompt, action = "analyze", postContent, userDescription, overlaySettings, analysisType, language } = await req.json();
    
    console.log(`🔍 بدء تحليل الصورة - النوع: ${action}`)
    
    // إنشاء مدير دوران المفاتيح
    const keyManager = createGeminiKeyManager()
    console.log(`📊 إحصائيات المفاتيح:`, keyManager.getStats())

    let finalImageData = imageData;
    let finalImageMimeType = imageMimeType;

    // If imageUrl is provided instead of imageData, convert it
    if (!imageData && imageUrl) {
      console.log('🔄 تحويل رابط الصورة إلى base64...');
      try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }
        
        const imageBuffer = await imageResponse.arrayBuffer();
        
        // Convert to base64 efficiently
        const uint8Array = new Uint8Array(imageBuffer);
        let binary = '';
        const chunkSize = 0x8000; // 32KB chunks
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          binary += String.fromCharCode(...uint8Array.subarray(i, i + chunkSize));
        }
        const base64Image = btoa(binary);
        
        // Determine MIME type from response headers or URL
        finalImageMimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
        if (!finalImageMimeType.startsWith('image/')) {
          finalImageMimeType = 'image/jpeg'; // Default fallback
        }
        
        finalImageData = base64Image;
        console.log(`✅ تم تحويل الصورة: ${finalImageMimeType}, حجم: ${imageBuffer.byteLength} بايت`);
      } catch (error) {
        console.error('❌ خطأ في تحويل الصورة:', error);
        throw new Error(`فشل في معالجة رابط الصورة: ${error.message}`);
      }
    }

    if (!finalImageData || !finalImageMimeType) {
      throw new Error('Image data and mime type are required');
    }

    let enhancedPrompt = '';
    
    if (action === "analyze") {
      if (analysisType === "marketing") {
        enhancedPrompt = `
        أنت خبير في التسويق وتحليل الصور التسويقية. حلل هذه الصورة بشكل متقدم للأغراض التسويقية:
        
        ${prompt || 'حلل محتوى هذه الصورة تسويقياً'}
        
        قدم تحليل شامل يتضمن:
        
        {
          "description": "وصف مفصل للصورة ومحتواها",
          "category": "تصنيف نوع المحتوى (منتج، خدمة، طعام، موضة، إلخ)",
          "keywords": ["كلمة1", "كلمة2", "كلمة3"],
          "marketingAngle": "الزاوية التسويقية الأفضل لهذه الصورة",
          "confidence": 95,
          "colors": {
            "primary": ["اللون الرئيسي", "#hex"],
            "secondary": ["اللون الثانوي", "#hex"],
            "accent": ["لون مكمل", "#hex"]
          },
          "emotions": ["المشاعر التي تثيرها الصورة"],
          "targetAudience": "الجمهور المستهدف المثالي",
          "strengths": ["نقاط القوة في الصورة"],
          "improvements": ["اقتراحات للتحسين"],
          "brandingOpportunities": ["فرص التسويق والعلامة التجارية"]
        }
        
        رد بصيغة JSON صحيحة باللغة العربية.
        `;
      } else {
        enhancedPrompt = `
        أنت خبير في تحليل الصور. حلل هذه الصورة بالتفصيل:
        
        ${prompt || 'حلل محتوى هذه الصورة'}
        
        يرجى تقديم:
        1. وصف شامل للصورة
        2. العناصر الرئيسية والألوان
        3. المزاج والطابع العام
        4. أي تفاصيل مهمة أو ملاحظات
        
        رد باللغة العربية بشكل مفصل ومفيد.
        `;
      }
    } else if (action === "answer") {
      enhancedPrompt = `
      أنت مساعد ذكي للرد على أسئلة العملاء حول المنشورات.
      
      محتوى المنشور: ${postContent || 'منشور على فيسبوك'}
      سؤال العميل: ${prompt}
      
      بناءً على الصورة المرفقة، قدم إجابة مفيدة ومهذبة عن السؤال.
      إذا كان السؤال عن السعر أو المكان أو التفاصيل، حاول الإجابة بناءً على ما تراه في الصورة أو اطلب التواصل المباشر.
      
      رد باللغة العربية بشكل احترافي ومفيد لخدمة العملاء.
      `;
    } else if (action === "edit") {
      enhancedPrompt = `
      عدل هذه الصورة بناءً على الطلب التالي:
      ${prompt}
      
      أرجع الصورة المعدلة مع وصف للتعديلات التي تمت.
      `;
    } else if (action === "overlay") {
      enhancedPrompt = `
      أنت خبير في تصميم الجرافيك وتحليل الصور. قم بتحليل الصورة المرفقة واقتراح أفضل تصميم للطبقة العلوية (overlay).

      السياق المطلوب: ${userDescription || 'تصميم طبقة علوية مناسبة للصورة'}
      
      الإعدادات الحالية: ${overlaySettings ? JSON.stringify(overlaySettings, null, 2) : 'لا توجد إعدادات حالية'}

      يرجى تحليل الصورة وتقديم:
      
      1. تحليل شامل للصورة:
         - الألوان الرئيسية والثانوية
         - التركيب والعناصر الموجودة
         - المزاج العام والطابع
         - المناطق الفارغة المناسبة للنص
         - نقاط التركيز البصري

      2. اقتراح تدرج مناسب للطبقة العلوية:
         - نوع التدرج (خطي، دائري، مخروطي)
         - ألوان متناسقة مع الصورة
         - شفافية مناسبة
         - اتجاه وموضع التدرج

      3. اقتراحات النص واللوغو:
         - أفضل المواضع للنص
         - ألوان النص للحصول على أفضل تباين
         - حجم النص المناسب
         - موضع اللوغو الأمثل

      قدم النتيجة بصيغة JSON صحيحة:
      {
        "analysis": "تحليل مفصل شامل للصورة ومحتواها والألوان والتركيب",
        "settings": {
          "gradient_type": "linear",
          "first_color": "#000000",
          "first_color_opacity": 70,
          "first_color_position": 0,
          "second_color": "#ffffff",
          "second_color_opacity": 30,
          "second_color_position": 100,
          "gradient_angle": 135,
          "center_x": 50,
          "center_y": 50,
          "gradient_size": 100,
          "use_sharp_stops": false,
          "global_opacity": 60,
          "blend_mode": "normal"
        },
        "explanation": "تفسير مفصل لسبب اختيار هذه الإعدادات",
        "textPlacement": {
          "position": "وصف تفصيلي لأفضل مكان للنص مع المبررات",
          "color": "#ffffff",
          "fontSize": "large"
        },
        "logoPlacement": {
          "position": "وصف تفصيلي لأفضل مكان للوغو مع المبررات",
          "opacity": 80,
          "size": "medium"
        }
      }

      ملاحظات مهمة:
      - احرص على ترك مساحة كافية للنص واللوغو
      - تأكد من عدم حجب العناصر المهمة في الصورة
      - استخدم ألوان متناسقة مع لوحة ألوان الصورة
      - اهدف إلى تعزيز الصورة وليس طغيان الطبقة العلوية عليها
      - قدم تفسير واضح لكل اختيار
      `;
    }

    // إرسال الطلب إلى Gemini مع نظام دوران المفاتيح
    const requestBody = {
      contents: [{
        parts: [
          { text: enhancedPrompt },
          {
            inlineData: {
              mimeType: finalImageMimeType,
              data: finalImageData
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
    };

    // استخدام نموذج يدعم الصور والنص مع نظام دوران المفاتيح
    const response = await keyManager.makeGeminiRequest(
      'gemini-2.0-flash',
      requestBody
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    // محاولة استخراج صورة إذا كانت موجودة (للتعديل)
    let editedImageData = null;
    if (action === "edit" && data.candidates[0].content.parts.length > 1) {
      const imagePart = data.candidates[0].content.parts.find(part => part.inlineData);
      if (imagePart) {
        editedImageData = imagePart.inlineData.data;
      }
    }
    
    let result;
    
    if (action === "overlay") {
      // معالجة خاصة لـ overlay analysis
      try {
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
          
          // التأكد من وجود الحقول المطلوبة
          if (!result.analysis) {
            result.analysis = 'تم تحليل الصورة بنجاح';
          }
          if (!result.settings) {
            result.settings = {
              gradient_type: "linear",
              first_color: "#000000",
              first_color_opacity: 70,
              second_color: "#ffffff",
              second_color_opacity: 30,
              global_opacity: 60
            };
          }
          if (!result.explanation) {
            result.explanation = 'تم إنتاج إعدادات افتراضية مناسبة';
          }
        } else {
          result = { 
            analysis: generatedText,
            text: generatedText,
            settings: {
              gradient_type: "linear",
              first_color: "#000000",
              first_color_opacity: 70,
              second_color: "#ffffff", 
              second_color_opacity: 30,
              global_opacity: 60
            },
            explanation: 'تم إنتاج نتائج من التحليل النصي'
          };
        }
      } catch (e) {
        result = { 
          analysis: generatedText,
          text: generatedText,
          error: 'Failed to parse JSON response',
          settings: {
            gradient_type: "linear",
            first_color: "#000000",
            first_color_opacity: 70,
            second_color: "#ffffff",
            second_color_opacity: 30,
            global_opacity: 60
          }
        };
      }
    } else if (action === "analyze" && analysisType === "marketing") {
      // معالجة خاصة للتحليل التسويقي
      try {
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const marketingData = JSON.parse(jsonMatch[0]);
          result = {
            ...marketingData,
            text: generatedText,
            action: action,
            success: true
          };
        } else {
          // Fallback if JSON parsing fails
          result = {
            description: generatedText,
            category: "عام",
            keywords: [],
            marketingAngle: "تسويق عام",
            confidence: 70,
            text: generatedText,
            action: action,
            success: true
          };
        }
      } catch (e) {
        result = {
          description: generatedText,
          category: "عام",
          keywords: [],
          marketingAngle: "تسويق عام",
          confidence: 70,
          text: generatedText,
          action: action,
          success: true,
          error: 'Failed to parse JSON response'
        };
      }
    } else {
      // معالجة عادية للأنواع الأخرى
      result = {
        text: generatedText,
        action: action,
        success: true,
        editedImage: editedImageData
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gemini-image-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred', 
        details: error.message,
        text: 'حدث خطأ أثناء تحليل الصورة. يرجى المحاولة مرة أخرى.',
        analysis: 'حدث خطأ أثناء تحليل الصورة. يرجى المحاولة مرة أخرى.',
        success: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});