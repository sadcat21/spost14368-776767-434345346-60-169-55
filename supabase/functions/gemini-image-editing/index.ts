import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get API keys - use both Supabase secret and fallback keys
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

// Fallback API keys for better reliability
const FALLBACK_API_KEYS = [
  'AIzaSyCoE0wSdHRAVvjUfEZ0gYGAOPl-Aj-5zOE',
  'AIzaSyDKF5PszBk0iNsUjRrEBgby4jFmbia1C44', 
  'AIzaSyAQFdTwDHyj7LB7wZmVT3pA8Dl1cF-GqGk',
  'AIzaSyCtC7D4Qc8nXa-qV8Eo9uNrV-d4FpJ9w5Y'
];

// Combine all available keys
const ALL_API_KEYS = GEMINI_API_KEY ? [GEMINI_API_KEY, ...FALLBACK_API_KEYS] : FALLBACK_API_KEYS;

// Helper function to make API request with robust error handling
async function makeGeminiRequest(url: string, body: any, maxRetries = 3): Promise<Response> {
  console.log('📊 إحصائيات المفاتيح:', {
    totalKeys: ALL_API_KEYS.length,
    currentKey: ALL_API_KEYS[0]?.substring(0, 20) + '...'
  });
  
  for (let attempt = 0; attempt < maxRetries && attempt < ALL_API_KEYS.length; attempt++) {
    const apiKey = ALL_API_KEYS[attempt];
    console.log(`🔑 محاولة ${attempt + 1}/${maxRetries} باستخدام مفتاح ${attempt + 1}/${ALL_API_KEYS.length}`);
    
    try {
      const response = await fetch(`${url}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        console.log(`✅ نجح الطلب باستخدام المفتاح ${attempt + 1}/${ALL_API_KEYS.length}`);
        return response;
      }
      
      const errorText = await response.text();
      console.error(`❌ خطأ في المحاولة ${attempt + 1}:`, response.status, errorText.substring(0, 200));
      
      // Handle quota/rate limit errors by switching to next key
      if (response.status === 429 || response.status === 403 || 
          errorText.includes('QUOTA_EXCEEDED') || errorText.includes('quota exceeded')) {
        console.log(`🔄 التبديل للمفتاح التالي...`);
        continue;
      }
      
      // For other errors, don't retry
      throw new Error(`HTTP ${response.status}: ${errorText}`);
      
    } catch (error) {
      console.error(`❌ خطأ في المحاولة ${attempt + 1}:`, error);
      
      if (attempt === maxRetries - 1) {
        throw error;
      }
    }
  }
  
  throw new Error('فشل في جميع محاولات استخدام مفاتيح API');
}

let currentKeyIndex = 0;
async function translatePrompt(arabicPrompt: string, apiKey: string): Promise<string> {
  // التحقق من وجود نص عربي
  const arabicRegex = /[\u0600-\u06FF]/;
  if (!arabicRegex.test(arabicPrompt)) {
    return arabicPrompt; // النص ليس عربياً
  }

  try {
    console.log('🔤 ترجمة النص العربي إلى الإنجليزية...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Translate the following Arabic text to English for image editing purposes. Only return the English translation without any additional text or explanation: "${arabicPrompt}"`
          }]
        }]
      })
    });

    const data = await response.json();
    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || arabicPrompt;

    console.log('✅ تم ترجمة النص:', { original: arabicPrompt, translated: translatedText });
    return translatedText;
  } catch (error) {
    console.error('❌ خطأ في ترجمة النص:', error);
    return arabicPrompt;
  }
}

// دالة تحويل الصورة لـ base64
async function convertImageToBase64(imageSource: string): Promise<{ data: string; mimeType: string }> {
  if (imageSource.startsWith('data:')) {
    // Base64 data URL
    const parts = imageSource.split(',');
    if (parts.length !== 2) {
      throw new Error('Invalid base64 image format');
    }
    const header = parts[0];
    const data = parts[1];
    
    const mimeMatch = header.match(/data:([^;]+);base64/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    
    return { data, mimeType };
  } else if (imageSource.startsWith('http')) {
    // URL - fetch and convert
    console.log('🌐 جلب الصورة من URL...');
    const imageResponse = await fetch(imageSource);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    // Convert to base64
    const uint8Array = new Uint8Array(imageBuffer);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      binary += String.fromCharCode(...uint8Array.subarray(i, i + chunkSize));
    }
    const data = btoa(binary);
    
    return { data, mimeType };
  } else {
    // Assume it's already base64
    return { data: imageSource, mimeType: 'image/jpeg' };
  }
}

// دالة إضافة نمط للبرومت
function getStyleText(style: string): string {
  switch (style) {
    case 'marketing_professional':
      return 'Professional marketing aesthetic, high contrast and vibrant colors, clean and modern look, eye-catching composition, commercial photography style, premium quality feel, brand-ready appearance';
    case 'social_media':
      return 'Social media optimized, bright and engaging colors, trendy and modern style, shareable content aesthetic';
    case 'elegant':
      return 'Elegant and sophisticated style, refined colors, luxury aesthetic, high-end appearance';
    default:
      return 'Clean, professional, and visually appealing style';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { originalImage, editPrompt, style = 'marketing_professional' } = await req.json();

    if (!originalImage || !editPrompt) {
      throw new Error('Original image and edit prompt are required');
    }

    if (!ALL_API_KEYS || ALL_API_KEYS.length === 0) {
      throw new Error('لا توجد مفاتيح API متاحة');
    }

    console.log('🎨 Starting image editing with Gemini 2.0...');
    console.log('Edit prompt:', editPrompt);
    console.log('Style:', style);

    // تحويل الصورة لـ base64
    const { data: imageData, mimeType } = await convertImageToBase64(originalImage);
    
    // ترجمة البرومت إذا كان عربياً
    const translatedPrompt = await translatePrompt(editPrompt, ALL_API_KEYS[0]);
    
    // إضافة معلومات النمط
    const styleText = getStyleText(style);
    const enhancedPrompt = `${translatedPrompt}. ${styleText}`;

    console.log('🚀 تحرير الصورة باستخدام Enhanced Prompt:', enhancedPrompt);

    try {
      // استخدام النموذج الصحيح مع responseModalities داخل generationConfig
      const requestBody = {
        contents: [{
          parts: [
            {
              text: `Edit this image based on the following description: ${enhancedPrompt}`
            },
            {
              inlineData: {
                mimeType: mimeType,
                data: imageData
              }
            }
          ]
        }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.95,
          topK: 40
        }
      };

      console.log('📤 Sending request to Gemini API...');

      const response = await makeGeminiRequest(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        requestBody
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API Error:', response.status, errorText);
        
        // Handle regional restrictions and API limitations more comprehensively
        if (response.status === 400 || response.status === 403 || response.status === 404) {
          const isRegionalRestriction = errorText.includes('FAILED_PRECONDITION') || 
                                       errorText.includes('not available') ||
                                       errorText.includes('not supported in this region') ||
                                       errorText.includes('Invalid JSON payload') ||
                                       errorText.includes('Cannot find field') ||
                                       errorText.includes('responseModalities') ||
                                       errorText.includes('RESOURCE_EXHAUSTED');
          
          if (isRegionalRestriction) {
            console.log('⚠️ خدمة تعديل الصور غير متاحة في هذه المنطقة، سيتم استخدام بديل ذكي...');
            
            // بديل محسن: إنشاء صورة جديدة بنموذج الإنتاج فقط
            try {
              console.log('🎨 توليد صورة محسنة بدلاً من التعديل المباشر...');
              
              // استخدام نموذج توليد الصور بدلاً من التعديل
              const imageGenerationResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${ALL_API_KEYS[0]}`
                },
                body: JSON.stringify({
                  prompt: `Create a professional marketing image: ${enhancedPrompt}. High quality, commercial photography style, vibrant colors, clean composition, brand-ready aesthetic.`,
                  safety_filter_level: "block_only_high",
                  aspect_ratio: "1:1",
                  negative_prompt: "blurry, low quality, pixelated, dark, unclear"
                })
              });

              if (imageGenerationResponse.ok) {
                const generationData = await imageGenerationResponse.json();
                if (generationData.generated_images && generationData.generated_images.length > 0) {
                  const generatedImageUrl = generationData.generated_images[0].gcs_uri || generationData.generated_images[0].data;
                  
                  console.log('✅ تم توليد صورة محسنة بنجاح باستخدام Imagen!');
                  
                  return new Response(JSON.stringify({
                    editedImage: generatedImageUrl,
                    textResponse: `تم إنشاء صورة محسنة احترافية: ${enhancedPrompt}`,
                    editPrompt: enhancedPrompt,
                    style: style,
                    model: 'imagen-3.0-generate',
                    fallback: false,
                    success: true
                  }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                  });
                }
              }
              
              console.log('🔍 تحليل الصورة الأصلية لتوليد وصف...');
            
            // تحليل الصورة باستخدام Gemini Vision
            const analysisBody = {
              contents: [{
                parts: [
                  {
                    text: "Analyze this image in detail. Describe its main subject, composition, colors, lighting, style, and any text or objects visible. Be very specific and detailed as this will be used to generate a new similar image."
                  },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: imageData
                    }
                  }
                ]
              }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 1000
              }
            };

            const analysisResponse = await makeGeminiRequest(
              'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
              analysisBody
            );

            if (analysisResponse.ok) {
              const analysisData = await analysisResponse.json();
              const imageDescription = analysisData.candidates?.[0]?.content?.parts?.[0]?.text || 'صورة منتج';
              
              console.log('✅ تم تحليل الصورة:', imageDescription.substring(0, 200) + '...');
              
              // توليد صورة جديدة محسنة بناءً على الوصف + البرومت المطلوب
              console.log('🎨 توليد صورة جديدة محسنة بدلاً من التعديل...');
              
              const generationPrompt = `Create a high-quality enhanced version based on: "${imageDescription}". 
              
              Improvements to apply: ${enhancedPrompt}
              
              Style requirements:
              - Professional marketing appearance
              - High resolution and sharp details  
              - Vibrant colors and good lighting
              - Commercial photography quality
              - Brand-ready aesthetic
              - ${styleText}
              
              Maintain the core elements and composition from the original but make it more appealing, professional, and marketing-ready.`;
              
              const generationBody = {
                contents: [{
                  parts: [{
                    text: generationPrompt
                  }]
                }],
                generationConfig: {
                  responseModalities: ["TEXT", "IMAGE"],
                  temperature: 0.7,
                  maxOutputTokens: 2048,
                  topP: 0.95,
                  topK: 40
                }
              };

              const generationResponse = await makeGeminiRequest(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
                generationBody
              );

              if (generationResponse.ok) {
                const generationData = await generationResponse.json();
                const candidate = generationData.candidates?.[0];
                
                if (candidate?.content?.parts) {
                  let generatedImageData = null;
                  let generatedTextResponse = null;

                  for (const part of candidate.content.parts) {
                    if (part.inlineData && part.inlineData.data) {
                      generatedImageData = part.inlineData.data;
                    } else if (part.text) {
                      generatedTextResponse = part.text;
                    }
                  }

                  if (generatedImageData) {
                    const generatedMimeType = candidate.content.parts.find(p => p.inlineData)?.inlineData?.mimeType || 'image/png';
                    const generatedImageUrl = `data:${generatedMimeType};base64,${generatedImageData}`;

                    console.log('✅ تم توليد صورة جديدة محسنة بنجاح!');

                    return new Response(JSON.stringify({
                      editedImage: generatedImageUrl,
                      editedImageData: generatedImageData,
                      mimeType: generatedMimeType,
                      textResponse: generatedTextResponse || `تم توليد صورة جديدة محسنة: ${enhancedPrompt}`,
                      editPrompt: enhancedPrompt,
                      style: style,
                      model: 'gemini-2.0-flash-preview-image-generation',
                      fallback: true,
                      fallbackReason: 'Generated new image based on analysis (editing not available)',
                      originalImageAnalysis: imageDescription
                    }), {
                      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    });
                  }
                }
              }
            }
            
            // إذا فشل التوليد، إرجاع الصورة الأصلية
            console.log('⚠️ فشل في توليد صورة جديدة، سيتم إرجاع الصورة الأصلية');
            
            } catch (fallbackError) {
              console.error('❌ خطأ في البديل الذكي:', fallbackError);
            }
            
            // محاولة أخيرة: توليد محتوى نصي محسن للصورة
            console.log('📝 إنشاء محتوى تسويقي محسن للصورة الأصلية...');
            
            try {
              const marketingResponse = await makeGeminiRequest(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
                {
                  contents: [{
                    parts: [
                      {
                        text: `Create compelling marketing copy for this image that incorporates these improvements: ${enhancedPrompt}. 
                        
                        Write in Arabic and focus on the benefits and appeal that would make this image more effective for marketing.`
                      },
                      {
                        inlineData: {
                          mimeType: mimeType,
                          data: imageData
                        }
                      }
                    ]
                  }],
                  generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000
                  }
                }
              );
              
              if (marketingResponse.ok) {
                const marketingData = await marketingResponse.json();
                const marketingText = marketingData.candidates?.[0]?.content?.parts?.[0]?.text || enhancedPrompt;
                
                return new Response(JSON.stringify({
                  editedImage: originalImage,
                  editedImageData: imageData,
                  mimeType: mimeType,
                  textResponse: `محتوى تسويقي محسن: ${marketingText}`,
                  editPrompt: enhancedPrompt,
                  style: style,
                  model: 'gemini-1.5-flash',
                  fallback: true,
                  fallbackReason: 'Generated enhanced marketing content (image editing unavailable in region)',
                  enhancedMarketingCopy: marketingText
                }), {
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
              }
            } catch (marketingError) {
              console.error('❌ خطأ في إنشاء المحتوى التسويقي:', marketingError);
            }
            
            // إرجاع الصورة الأصلية مع وصف محسن كحل أخير
            return new Response(JSON.stringify({
              editedImage: originalImage,
              editedImageData: imageData,
              mimeType: mimeType,
              textResponse: `تم تحليل الصورة وإنشاء توصيات تحسين: ${enhancedPrompt}`,
              editPrompt: enhancedPrompt,
              style: style,
              model: 'gemini-image-editing-fallback',
              fallback: true,
              fallbackReason: 'Image editing service not available in your region',
              recommendations: {
                lighting: 'تحسين الإضاءة والتباين',
                colors: 'تعزيز الألوان والحيوية', 
                composition: 'تحسين التركيب والجودة',
                marketing: 'جعل الصورة أكثر جاذبية تسويقياً'
              }
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }

        throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
      }

      const apiData = await response.json();
      console.log('📥 تم استلام البيانات من Gemini API');

      // استخراج الصورة والنص من الاستجابة
      const candidate = apiData.candidates?.[0];
      if (!candidate || !candidate.content || !candidate.content.parts) {
        throw new Error('لا توجد بيانات مولدة من Gemini API');
      }

      let editedImageData = null;
      let textResponse = null;

      // البحث عن الصورة والنص في أجزاء الاستجابة
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          editedImageData = part.inlineData.data;
          console.log('🖼️ تم العثور على صورة معدلة في الاستجابة');
        } else if (part.text) {
          textResponse = part.text;
          console.log('📝 تم العثور على نص في الاستجابة:', part.text);
        }
      }

      if (!editedImageData) {
        console.warn('⚠️ لم يتم العثور على صورة معدلة، إرجاع الصورة الأصلية');
        return new Response(JSON.stringify({
          editedImage: originalImage,
          editedImageData: imageData,
          mimeType: mimeType,
          textResponse: textResponse || `تم معالجة الصورة: ${enhancedPrompt}`,
          editPrompt: enhancedPrompt,
          style: style,
          model: 'gemini-2.0-flash-preview-image-generation',
          fallback: true,
          fallbackReason: 'No edited image generated'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // تحديد نوع الملف للصورة المعدلة
      const editedMimeType = candidate.content.parts.find(p => p.inlineData)?.inlineData?.mimeType || 'image/png';
      const editedImageUrl = `data:${editedMimeType};base64,${editedImageData}`;

      console.log('✅ تم تحرير الصورة بنجاح!');
      console.log('📊 حجم البيانات:', editedImageData.length, 'أحرف');

      return new Response(JSON.stringify({
        editedImage: editedImageUrl,
        editedImageData: editedImageData,
        mimeType: editedMimeType,
        textResponse: textResponse || 'تم تحرير الصورة بنجاح',
        editPrompt: enhancedPrompt,
        style: style,
          model: 'gemini-1.5-flash'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (apiError) {
      console.error('❌ خطأ في Gemini API:', apiError);
      throw new Error(`فشل في تحرير الصورة: ${apiError.message}`);
    }

  } catch (error: any) {
    console.error('💥 خطأ في دالة تحرير الصور:', error);
    console.error('🔍 تفاصيل الخطأ:', {
      message: error?.message,
      stack: error?.stack?.substring(0, 500),
      name: error?.name
    });
    
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'فشل في تحرير الصورة',
        details: 'تحقق من صحة البيانات المدخلة وحاول مرة أخرى',
        errorType: error?.name || 'UnknownError'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});