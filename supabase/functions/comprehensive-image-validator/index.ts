import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  violations: string[];
  warnings: string[];
  recommendation: string;
  analysisDetails: {
    contentAlignment: boolean;
    visualIntegrity: boolean;
    islamicCompliance: boolean;
    modesty: boolean;
    imageQuality: boolean;
    textQuality: boolean;
    violenceCheck: boolean;
    politicalContent: boolean;
    misinformation: boolean;
    copyright: boolean;
    disgusting: boolean;
    facebookPolicy: boolean;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, postContent = "", context = "" } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    console.log(`🔍 Validating image: ${imageUrl}`);
    console.log(`📝 Post content: ${postContent.substring(0, 100)}...`);

    // Convert image URL to base64 (fixed for large images)
    let imageData: string;
    let imageMimeType: string;
    
    try {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      }
      
      const imageBuffer = await imageResponse.arrayBuffer();
      
      // Convert to base64 without stack overflow
      const uint8Array = new Uint8Array(imageBuffer);
      let binary = '';
      const chunkSize = 0x8000; // 32KB chunks
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        binary += String.fromCharCode(...uint8Array.subarray(i, i + chunkSize));
      }
      const base64Image = btoa(binary);
      
      imageMimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
      if (!imageMimeType.startsWith('image/')) {
        imageMimeType = 'image/jpeg';
      }
      
      imageData = base64Image;
      console.log(`✅ Image processed: ${imageMimeType}, size: ${imageBuffer.byteLength} bytes`);
    } catch (error) {
      console.error('❌ Error processing image:', error);
      throw new Error(`Failed to process image: ${error.message}`);
    }

    // Comprehensive validation prompt with STRICT Arabic text checking
    const validationPrompt = `أنت خبير متخصص في فحص وتقييم الصور قبل النشر على فيسبوك. قم بتحليل الصورة المرفقة بدقة عالية جداً وصرامة شديدة بناءً على المعايير التالية:

محتوى المنشور المرفق: "${postContent}"
السياق: "${context}"

معايير التقييم الصارمة والمشددة:

🔴 **فحص النصوص العربية - رفض فوري للأخطاء** 🔴
- ارفض أي صورة تحتوي على كلمات عربية مشوهة أو غير صحيحة مثل "ألقهوآ" أو "عيضدرامرضد"
- ارفض النصوص التي تحتوي على كلمات لا معنى لها أو غير موجودة في اللغة العربية
- ارفض الأخطاء الإملائية الفادحة والواضحة
- ارفض الكلمات المدمجة بطريقة خاطئة أو المكتوبة بشكل عكسي
- ارفض النصوص المقلوبة أو المعكوسة أو المتداخلة
- ارفض الخطوط العربية المكسرة أو غير الواضحة أو المقطعة
- فحص دقيق للتأكد من أن كل كلمة عربية لها معنى صحيح ومفهوم
- ارفض النصوص التي تبدو وكأنها ترجمة آلية خاطئة
- ارفض أي نص عربي يحتوي على رموز أو أحرف غريبة أو مشوهة
- كن صارماً جداً: إذا وجدت أي شك في صحة النص العربي، ارفض الصورة فوراً

1. التوافق مع النص والسياق:
- هل تتطابق عناصر الصورة مع محتوى النص؟
- هل توجد عناصر مضللة أو لا علاقة لها بالسياق؟

2. سلامة العناصر البصرية:
- هل توجد تشوهات واضحة (أيادي زائدة، وجوه مشوهة، أرجل غير طبيعية)؟
- هل توجد أخطاء منطقية (ظلال غير منطقية، أشياء معلقة)؟

3. الالتزام بالقيم الإسلامية:
- هل توجد رموز دينية مخالفة (صليب، بوذا، نجمة داوود)؟
- هل توجد تماثيل أو رموز أسطورية مخالفة؟
- هل توجد مشاهد عبادات غير إسلامية؟

4. الحشمة واللباس:
- هل توجد نساء بملابس كاشفة؟
- هل تبرز الصورة تفاصيل الجسد بشكل مثير؟

5. جودة ودقة الصورة:
- هل الصورة واضحة وعالية الدقة؟
- هل الإضاءة والألوان متناسقة؟

6. منع العنف:
- هل توجد مشاهد دموية أو عنف؟
- هل توجد أسلحة في سياق غير آمن؟

7. المحتوى السياسي:
- هل توجد شخصيات سياسية جدلية؟
- هل توجد رموز سياسية حساسة؟

8. التضليل البصري:
- هل تبدو الصورة مفبركة أو مضللة؟
- هل توحي بحقائق غير صحيحة؟

9. الحقوق والعلامات التجارية:
- هل توجد شعارات أو علامات تجارية محمية؟

10. المحتوى المقزز:
- هل توجد مناظر مقززة أو مرفوضة؟

11. سياسات فيسبوك:
- هل المحتوى متوافق مع سياسات فيسبوك؟

**تعليمات مهمة جداً**:
- إذا كانت هناك أي نصوص عربية في الصورة، فحصها بدقة شديدة جداً
- إذا وجدت أي كلمة عربية غير صحيحة أو مشوهة أو لا معنى لها، ارفض الصورة فوراً
- كن صارماً جداً في فحص جودة النصوص العربية
- إذا لم تكن متأكداً 100% من صحة كلمة عربية، ارفض الصورة
- أعط درجة 0 لأي صورة تحتوي على نصوص عربية خاطئة

قم بالرد بتنسيق JSON دقيق:
{
  "isValid": true/false,
  "score": رقم من 0-100,
  "violations": ["قائمة بالمخالفات الموجودة"],
  "warnings": ["قائمة بالتحذيرات"],
  "recommendation": "التوصية النهائية",
  "analysisDetails": {
    "contentAlignment": true/false,
    "visualIntegrity": true/false,
    "islamicCompliance": true/false,
    "modesty": true/false,
    "imageQuality": true/false,
    "textQuality": true/false,
    "violenceCheck": true/false,
    "politicalContent": true/false,
    "misinformation": true/false,
    "copyright": true/false,
    "disgusting": true/false,
    "facebookPolicy": true/false
  },
  "imageDescription": "وصف مختصر للصورة",
  "confidence": رقم من 0-100
}

كن صارماً في التقييم وأعط درجة منخفضة للصور التي تحتوي على أي مخالفات.`;

    // Send request to Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: validationPrompt
              },
              {
                inlineData: {
                  mimeType: imageMimeType,
                  data: imageData
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1, // Very low for consistent validation
            topK: 20,
            topP: 0.7,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No validation result from Gemini API');
    }
    
    const validationText = data.candidates[0].content.parts[0].text;
    console.log('🤖 Raw Gemini validation response:', validationText);

    // Parse JSON from response
    let validationResult: ValidationResult;
    try {
      const jsonMatch = validationText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Ensure all required fields exist
        validationResult = {
          isValid: parsed.isValid || false,
          score: Math.max(0, Math.min(100, parsed.score || 0)),
          violations: Array.isArray(parsed.violations) ? parsed.violations : [],
          warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
          recommendation: parsed.recommendation || "يُنصح بمراجعة الصورة قبل النشر",
          analysisDetails: {
            contentAlignment: parsed.analysisDetails?.contentAlignment || false,
            visualIntegrity: parsed.analysisDetails?.visualIntegrity || false,
            islamicCompliance: parsed.analysisDetails?.islamicCompliance || false,
            modesty: parsed.analysisDetails?.modesty || false,
            imageQuality: parsed.analysisDetails?.imageQuality || false,
            textQuality: parsed.analysisDetails?.textQuality || false,
            violenceCheck: parsed.analysisDetails?.violenceCheck || false,
            politicalContent: parsed.analysisDetails?.politicalContent || false,
            misinformation: parsed.analysisDetails?.misinformation || false,
            copyright: parsed.analysisDetails?.copyright || false,
            disgusting: parsed.analysisDetails?.disgusting || false,
            facebookPolicy: parsed.analysisDetails?.facebookPolicy || false,
          },
          imageDescription: parsed.imageDescription || "تم تحليل الصورة",
          confidence: Math.max(0, Math.min(100, parsed.confidence || 70))
        };

        // Additional logic: mark as invalid if score is too low
        if (validationResult.score < 70) {
          validationResult.isValid = false;
        }

        // Add automatic violations based on failed checks
        if (!validationResult.analysisDetails.islamicCompliance) {
          validationResult.violations.push("مخالفة للقيم الإسلامية");
        }
        if (!validationResult.analysisDetails.modesty) {
          validationResult.violations.push("مخالفة لمعايير الحشمة");
        }
        if (!validationResult.analysisDetails.facebookPolicy) {
          validationResult.violations.push("مخالفة لسياسات فيسبوك");
        }

      } else {
        // Fallback if JSON parsing fails
        validationResult = {
          isValid: false,
          score: 30,
          violations: ["فشل في تحليل الصورة بشكل صحيح"],
          warnings: ["لم يتم التحليل بالشكل المطلوب"],
          recommendation: "يُنصح بمراجعة الصورة يدوياً قبل النشر",
          analysisDetails: {
            contentAlignment: false,
            visualIntegrity: false,
            islamicCompliance: false,
            modesty: false,
            imageQuality: false,
            textQuality: false,
            violenceCheck: false,
            politicalContent: false,
            misinformation: false,
            copyright: false,
            disgusting: false,
            facebookPolicy: false,
          },
          imageDescription: "فشل في تحليل الصورة",
          confidence: 30
        };
      }
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      validationResult = {
        isValid: false,
        score: 0,
        violations: ["خطأ في تحليل نتائج الفحص"],
        warnings: ["فشل في معالجة استجابة النظام"],
        recommendation: "يجب مراجعة الصورة يدوياً",
        analysisDetails: {
          contentAlignment: false,
          visualIntegrity: false,
          islamicCompliance: false,
          modesty: false,
          imageQuality: false,
          textQuality: false,
          violenceCheck: false,
          politicalContent: false,
          misinformation: false,
          copyright: false,
          disgusting: false,
          facebookPolicy: false,
        },
        imageDescription: "فشل في التحليل",
        confidence: 0
      };
    }

    console.log('✅ Final validation result:', JSON.stringify({
      isValid: validationResult.isValid,
      score: validationResult.score,
      violations: validationResult.violations.length,
      confidence: validationResult.confidence
    }));

    return new Response(JSON.stringify(validationResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in comprehensive-image-validator function:', error);
    
    const errorResult: ValidationResult = {
      isValid: false,
      score: 0,
      violations: [`خطأ في النظام: ${error.message}`],
      warnings: ["تعذر إجراء الفحص الشامل"],
      recommendation: "يجب مراجعة الصورة يدوياً قبل النشر",
      analysisDetails: {
        contentAlignment: false,
        visualIntegrity: false,
        islamicCompliance: false,
        modesty: false,
        imageQuality: false,
        textQuality: false,
        violenceCheck: false,
        politicalContent: false,
        misinformation: false,
        copyright: false,
        disgusting: false,
        facebookPolicy: false,
      },
      imageDescription: "فشل في التحليل",
      confidence: 0
    };

    return new Response(JSON.stringify(errorResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 500 
    });
  }
});