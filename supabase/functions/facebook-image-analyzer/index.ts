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
    const { imageUrl, postContent, userComment, analysisType = 'comment' } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    console.log(`Analyzing image: ${imageUrl}`);
    console.log(`Analysis type: ${analysisType}`);

    // Convert image URL to base64
    let imageData: string;
    let imageMimeType: string;
    
    try {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      }
      
      const imageBuffer = await imageResponse.arrayBuffer();
      
      // Fix for large images - convert to base64 without stack overflow
      const uint8Array = new Uint8Array(imageBuffer);
      let binary = '';
      const chunkSize = 0x8000; // 32KB chunks
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        binary += String.fromCharCode(...uint8Array.subarray(i, i + chunkSize));
      }
      const base64Image = btoa(binary);
      
      // Determine MIME type from response headers or URL
      imageMimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
      if (!imageMimeType.startsWith('image/')) {
        imageMimeType = 'image/jpeg'; // Default fallback
      }
      
      imageData = base64Image;
      console.log(`Image processed: ${imageMimeType}, size: ${imageBuffer.byteLength} bytes`);
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error(`Failed to process image: ${error.message}`);
    }

    // Create analysis prompt based on type
    let analysisPrompt: string;
    
    if (analysisType === 'comment') {
      analysisPrompt = `أنت خبير في تحليل الصور وفهم المحتوى البصري. قم بتحليل الصورة المرفقة مع السياق التالي:

محتوى المنشور:
${postContent || "لا يوجد نص للمنشور"}

تعليق/سؤال المستخدم:
${userComment || "لا يوجد تعليق محدد"}

مهمتك:
1. وصف تفصيلي للصورة ومحتواها
2. تحديد العناصر المهمة في الصورة (نصوص، أرقام، عناوين، منتجات، أشخاص، إلخ)
3. استخراج أي معلومات مفيدة (أرقام هاتف، أسعار، عناوين، تواريخ، إلخ)
4. ربط محتوى الصورة بسؤال المستخدم
5. تحديد ما إذا كانت الصورة تحتوي على إجابة لسؤال المستخدم

قدم التحليل بتنسيق JSON واضح:
{
  "hasImage": true,
  "imageDescription": "وصف مفصل للصورة",
  "extractedInfo": {
    "text": ["أي نصوص موجودة في الصورة"],
    "numbers": ["أرقام هاتف، أسعار، إلخ"],
    "locations": ["عناوين أو أماكن"],
    "products": ["منتجات أو خدمات ظاهرة"],
    "dates": ["تواريخ أو أوقات"],
    "other": ["معلومات أخرى مهمة"]
  },
  "relevanceToComment": "كيف ترتبط الصورة بتعليق المستخدم",
  "canAnswerQuestion": true/false,
  "suggestedResponse": "رد مقترح يتضمن معلومات من الصورة",
  "confidence": "نسبة الثقة في التحليل من 1-100"
}`;
    } else {
      // Post analysis
      analysisPrompt = `أنت خبير في تحليل المحتوى البصري وفهم السياق. قم بتحليل الصورة المرفقة:

محتوى المنشور:
${postContent || "لا يوجد نص للمنشور"}

مهمتك:
1. وصف شامل للصورة ومحتواها
2. استخراج جميع المعلومات المهمة (نصوص، أرقام، تفاصيل)
3. تحديد نوع المحتوى (إعلان، منتج، خدمة، إلخ)
4. استخراج معلومات الاتصال إن وجدت

قدم التحليل بتنسيق JSON:
{
  "hasImage": true,
  "imageDescription": "وصف مفصل للصورة",
  "contentType": "نوع المحتوى",
  "extractedInfo": {
    "text": ["نصوص في الصورة"],
    "contacts": ["معلومات اتصال"],
    "prices": ["أسعار"],
    "locations": ["مواقع"],
    "details": ["تفاصيل أخرى مهمة"]
  },
  "mainSubject": "الموضوع الرئيسي للصورة",
  "keywords": ["كلمات مفتاحية"]
}`;
    }

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
                text: analysisPrompt
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
            temperature: 0.3,
            topK: 32,
            topP: 0.8,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No analysis result from Gemini API');
    }
    
    const analysisText = data.candidates[0].content.parts[0].text;
    console.log('Raw Gemini response:', analysisText);

    // Parse JSON from response
    let analysisResult;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
        analysisResult.hasImage = true;
      } else {
        // Fallback if JSON parsing fails
        analysisResult = {
          hasImage: true,
          imageDescription: analysisText,
          extractedInfo: {
            text: [],
            numbers: [],
            locations: [],
            products: [],
            dates: [],
            other: []
          },
          relevanceToComment: "تم تحليل الصورة بنجاح",
          canAnswerQuestion: false,
          suggestedResponse: analysisText,
          confidence: 70
        };
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      analysisResult = {
        hasImage: true,
        imageDescription: analysisText,
        error: 'Failed to parse structured response',
        rawResponse: analysisText,
        extractedInfo: {
          text: [],
          numbers: [],
          locations: [],
          products: [],
          dates: [],
          other: []
        }
      };
    }

    console.log('Final analysis result:', analysisResult);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in facebook-image-analyzer function:', error);
    return new Response(
      JSON.stringify({ 
        hasImage: false,
        error: 'Analysis failed', 
        details: error.message,
        imageDescription: 'فشل في تحليل الصورة. يرجى المحاولة مرة أخرى.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});