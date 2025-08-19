import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { createGeminiKeyManager } from '../_shared/apiKeyRotation.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { content } = await req.json()

    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: 'المحتوى مطلوب' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('💡 بدء توليد الأسئلة التفاعلية')
    
    // إنشاء مدير دوران المفاتيح
    const keyManager = createGeminiKeyManager()
    console.log('📊 إحصائيات المفاتيح:', keyManager.getStats())

    const prompt = `بناءً على المحتوى التالي، ولّد 5 أشكال بصرية تفاعلية متنوعة لتشجيع التفاعل والمناقشة. يجب أن تكون الأشكال:

الأشكال المطلوبة:
1. **مساحة التعبير**: دعوة للمشاركة مع إيموجي جذاب
2. **استطلاع رأي مصغر**: خيارات مرقمة للاختيار
3. **تحدي سريع**: مهمة أو سؤال قصير مع جائزة معنوية
4. **مناقشة موجهة**: سؤال عميق حول تجربة شخصية
5. **قائمة تفاعلية**: خيارات متعددة للاختيار مع رموز

المحتوى المطلوب تحليله وإنشاء أشكال بصرية له:
${content}

قدم النتيجة في تنسيق JSON صالح بالضبط كالتالي:
{
  "questions": [
    "🎤 مساحتك للتعبير:\n✨ شاركنا قصتك أو رأيك 👇\n🧠 [سؤال مخصص حسب المحتوى]؟\n💬 رأيك قد يلهم غيرك!\n\n🟢 التعليق الأول المميز سيُثبّت 🧷",
    
    "📊 أي نوع من [موضوع المحتوى] أثّر فيك أكثر؟\n1️⃣ [خيار أول]؟\n2️⃣ [خيار ثاني]؟\n3️⃣ [خيار ثالث]؟\n🗳️ اكتب رقم الخيار أو رأيك الحرّ بالتعليقات!",
    
    "🔍 تحدي سريع:\n🕒 في 10 كلمات أو أقل... [تحدي مخصص حسب المحتوى]!\n🎁 نُثبّت أفضل إجابة اليوم!",
    
    "💭 سؤال عميق:\n[سؤال مخصص يتطلب تجربة شخصية حسب المحتوى]\n🤝 شاركنا تجربتك الشخصية!",
    
    "⚡ اختر الأنسب لك:\n🅰️ [خيار أول]\n🅱️ [خيار ثاني]  \n🆎 [خيار ثالث]\n📝 أو اكتب اختيارك الخاص في التعليقات!"
  ]
}`

    console.log('إرسال الطلب إلى Gemini API مع نظام دوران المفاتيح...')

    // Call Gemini API with key rotation
    const response = await keyManager.makeGeminiRequest('gemini-2.0-flash', {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      throw new Error(`Gemini API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log('Gemini API response:', data)

    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const generatedText = data.candidates[0].content.parts[0].text
      
      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const questionsData = JSON.parse(jsonMatch[0])
          if (questionsData.questions && Array.isArray(questionsData.questions)) {
            return new Response(
              JSON.stringify({ 
                success: true,
                questions: questionsData.questions,
                rawResponse: generatedText
              }),
              { 
                status: 200, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
        } catch (parseError) {
          console.error('JSON parsing error:', parseError)
        }
      }
      
      // Fallback: try to extract questions from plain text
      const lines = generatedText.split('\n').filter(line => line.trim())
      const questions = lines
        .filter(line => /^\d+\.|^-|\?|🤔|💬|💡|⭐|📈|❓|👇/.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
        .filter(q => q.length > 0)
        .slice(0, 7)

      if (questions.length > 0) {
        return new Response(
          JSON.stringify({ 
            success: true,
            questions: questions,
            rawResponse: generatedText,
            fallback: true
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    throw new Error('No valid questions generated')

  } catch (error) {
    console.error('Error generating questions:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate interactive questions',
        details: 'Please check your Gemini API key and try again'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})