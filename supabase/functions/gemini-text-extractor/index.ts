import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createGeminiKeyManager } from '../_shared/apiKeyRotation.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageData, contentType } = await req.json()
    
    if (!imageData) {
      return new Response(
        JSON.stringify({ error: 'يجب توفير بيانات الصورة' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('📄 بدء استخراج النص من الصورة')
    
    // إنشاء مدير دوران المفاتيح
    const keyManager = createGeminiKeyManager()
    console.log('📊 إحصائيات المفاتيح:', keyManager.getStats())

    // استخراج النص من الصورة مع نظام دوران المفاتيح
    const extractResponse = await keyManager.makeGeminiRequest(
      'gemini-1.5-flash',
      {
        contents: [{
          parts: [
            {
              text: "استخرج النص الموجود في هذه الصورة واكتبه بشكل مختصر ومفيد باللغة العربية. ركز على المعلومات المهمة فقط."
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageData
              }
            }
          ]
        }]
      }
    )

    if (!extractResponse.ok) {
      const errorText = await extractResponse.text()
      console.error("Gemini API Error:", errorText)
      return new Response(
        JSON.stringify({ error: `خطأ في API: ${extractResponse.status}` }),
        { status: extractResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const extractData = await extractResponse.json()
    
    if (!extractData.candidates || !extractData.candidates[0]?.content?.parts?.[0]?.text) {
      return new Response(
        JSON.stringify({ error: "استجابة غير صحيحة من Gemini AI" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const rawText = extractData.candidates[0].content.parts[0].text

    // تحويل إلى مارك دون
    const getContentTypeLabel = (type: string) => {
      const types = {
        "information": "معلومة",
        "quiz": "كويز", 
        "question": "سؤال",
        "story": "قصة",
        "tip": "نصيحة",
        "fact": "حقيقة",
        "quote": "اقتباس"
      }
      return types[type as keyof typeof types] || "معلومة"
    }

    const markdownResponse = await keyManager.makeGeminiRequest(
      'gemini-2.0-flash',
      {
        contents: [{
          parts: [{
            text: `حول هذا النص إلى صيغة مارك دون منسقة كـ${getContentTypeLabel(contentType)}:

"${rawText}"

استخدم التنسيق المناسب:
- للمعلومة: استخدم عناوين وقوائم منظمة
- للكويز: استخدم أسئلة مرقمة مع خيارات
- للسؤال: استخدم تنسيق سؤال وجواب
- للقصة: استخدم فقرات منظمة
- للنصيحة: استخدم نقاط وقوائم
- للحقيقة: استخدم تنسيق واضح ومميز
- للاقتباس: استخدم تنسيق الاقتباس

اجعل النص جذاباً وسهل القراءة باللغة العربية.`
          }]
        }]
      }
    )

    let markdownText = rawText
    if (markdownResponse.ok) {
      const markdownData = await markdownResponse.json()
      if (markdownData.candidates && markdownData.candidates[0]?.content?.parts?.[0]?.text) {
        markdownText = markdownData.candidates[0].content.parts[0].text
      }
    }

    return new Response(
      JSON.stringify({ 
        extractedText: rawText,
        markdownText: markdownText,
        success: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'حدث خطأ في الخدمة' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})