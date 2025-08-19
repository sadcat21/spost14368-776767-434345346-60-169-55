import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// مفاتيح Gemini API مع نظام التبديل
const GEMINI_API_KEYS = [
  "AIzaSyCoE0wSdHRAVvjU6Dllx6XmxMAMG409sSk",
  "AIzaSyDqGwN1PbfdH1lMPd_PM-h-nUlbVvDT-1U",
  "AIzaSyAHMJKhRgLbgOLXhUHWdea6hhsn1cuuW6U",
  "AIzaSyDL4YJrqxqsvvi_kGg0q0GdrEQbOKCt_oI",
  "AIzaSyCl1LfzT-uRryPFF4nujkvjBVHCXalyzgY",
  "AIzaSyCGLL88zVZjJtzod4Z-ONvFXKZiGVM3Wm4",
  "AIzaSyBrlikXYs8kgzvzZmc69R3waQdcOGI08qI",
  "AIzaSyCdU4U-dW8Tfe9763CO0AL1u2WLFj0zNu8",
  "AIzaSyCjlGbUV5K7PhZvJY7Mmehx7PH-juxmxn0",
  "AIzaSyCmZivJpY6e9WJQRc80NH1P0fHcjJNZy80",
  "AIzaSyB-pMGCSj9yzjsM1hN24CmzsKWHBS0rNJ8",
  "AIzaSyBDiCnl8l17wkFmrl3dV56dKm16DQElaC0",
  "AIzaSyDJcPPoJKtwltBAB5TzskaN0hUIIi3nszU",
  "AIzaSyA-uzh4RA0Sb4k1NmNqE_fpIX2YHvBy-KI",
  "AIzaSyAchPA9UJhTVrivthVY7eQtAm5udJ8ilxA",
  "AIzaSyDxRdDIYa9KSQwP2BJFA1bvshe3_OWKPRs",
  "AIzaSyDnFbX3IOQiCRncMMMD5PcCiaDzV1DGqBM",
  "AIzaSyDNgCnIo5yoU7RTIh7jyDmXQBk60Iirw5U",
  "AIzaSyDKF5PszBk0iNsUjRrEBgby4jFmbia1C44",
  "AIzaSyCHIHwj3i_WM3HXpI8XwAodrBBMPj5SbXQ",
  "AIzaSyBZok28uf_cZsCknA3N7yUcYtDmznRvUG0",
  "AIzaSyD51vrO0vj4-WKANNgbzrbJPh7nPnPhsMM",
  "AIzaSyCLqikA8e0gJ-4gTLH4QG8uaBT4hPW6HSU",
  "AIzaSyD5JsmtJdOFOxn0zY6HYYwy95VmzGUmNt8",
  "AIzaSyAujZ8JJXkOkMyZ373RfcTZVjmFCuiM40k",
  "AIzaSyAy2Ks8NBoVCtZ6vFwNpsdnYEDSZ-o1jq0",
  "AIzaSyDFu3ZVPw2mJtkelci3carHUO0MKJgmHPY",
  "AIzaSyD9XuFuht-FoLRBUGidQgqG3mnm546rJYs",
  "AIzaSyDTSm9MoPs91UCWYYp7qy76qyUgzdh3VXc",
  "AIzaSyDxOpke9DTgOAnNBQtP7rGNKdytrkd-gic"
]

// مؤشر المفتاح الحالي
let currentKeyIndex = 0

// دالة للحصول على المفتاح الحالي
function getCurrentApiKey() {
  return GEMINI_API_KEYS[currentKeyIndex]
}

// دالة للانتقال للمفتاح التالي
function rotateToNextKey() {
  // نقل المفتاح الحالي إلى نهاية المصفوفة
  const currentKey = GEMINI_API_KEYS.splice(currentKeyIndex, 1)[0]
  GEMINI_API_KEYS.push(currentKey)
  
  // إذا كنا في النهاية، ارجع للبداية
  if (currentKeyIndex >= GEMINI_API_KEYS.length) {
    currentKeyIndex = 0
  }
  
  console.log(`🔄 تم تبديل المفتاح إلى: ${getCurrentApiKey().substring(0, 20)}...`)
}

// Helper function to make Gemini API requests مع نظام تبديل المفاتيح
async function makeGeminiRequest(prompt: string, config: any, retries?: number): Promise<any> {
  const maxRetries = retries || GEMINI_API_KEYS.length
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const currentKey = getCurrentApiKey()
      console.log(`🔄 Gemini API attempt ${attempt}/${maxRetries} using key: ${currentKey.substring(0, 20)}...`)
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${currentKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: config
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Gemini API error ${response.status}: ${errorText}`)
        
        // أكواد الأخطاء التي تستدعي تبديل المفتاح
        const errorCodes = [429, 503, 500, 502, 504, 400]
        if (errorCodes.includes(response.status) && attempt < maxRetries) {
          console.log(`⏳ خطأ ${response.status} - سيتم تبديل المفتاح...`)
          await new Promise(resolve => setTimeout(resolve, 500))
          rotateToNextKey()
          continue
        }
        
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log(`✅ Gemini API request successful on attempt ${attempt}`)
      return data
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message)
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500))
        rotateToNextKey()
        continue
      }
    }
  }
  
  throw new Error(`فشل في تنفيذ طلب Gemini بعد ${maxRetries} محاولات. آخر خطأ: ${lastError?.message || 'غير معروف'}`)
}

// توليد إعدادات المحتوى العشوائية
async function generateRandomSettings() {
  console.log('🎲 توليد إعدادات المحتوى العشوائية...')
  
  const specialties = [
    { value: "طب", label: "طبي" },
    { value: "تقنية", label: "تقنية ومعلومات" },
    { value: "تعليم", label: "تعليمي" },
    { value: "تسويق", label: "تسويق ومبيعات" },
    { value: "صحة", label: "صحة ولياقة" },
    { value: "طعام", label: "طعام ومطاعم" },
    { value: "سفر", label: "سفر وسياحة" },
    { value: "موضة", label: "موضة وجمال" },
    { value: "رياضة", label: "رياضة" },
    { value: "فن", label: "فن وثقافة" }
  ]

  const contentTypes = [
    { value: "منشور", label: "منشور تسويقي" },
    { value: "إعلان", label: "إعلان ترويجي" },
    { value: "تعليمي", label: "محتوى تعليمي" },
    { value: "نصائح", label: "نصائح ومعلومات" },
    { value: "قصة", label: "قصة نجاح" },
    { value: "عرض", label: "عرض خاص" }
  ]

  const topicsBySpecialty = {
    "طب": ["آخر التطورات في علاج السرطان", "نصائح للوقاية من أمراض القلب", "فوائد الفيتامينات الطبيعية", "تقنيات جديدة في الجراحة"],
    "تقنية": ["الذكاء الاصطناعي في المستقبل", "أمن المعلومات والحماية الرقمية", "تطبيقات الهواتف المبتكرة", "التطوير البرمجي الحديث"],
    "تعليم": ["طرق التعلم الحديثة", "التعليم الإلكتروني التفاعلي", "تطوير مهارات الطلاب", "استراتيجيات التدريس الفعالة"],
    "تسويق": ["استراتيجيات التسويق الرقمي", "بناء العلامة التجارية", "التسويق عبر وسائل التواصل", "تحليل سلوك المستهلك"],
    "صحة": ["التغذية الصحية المتوازنة", "تمارين اللياقة البدنية", "الصحة النفسية والعقلية", "عادات يومية صحية"],
    "طعام": ["وصفات الطبخ الشهية", "أسرار المطبخ العربي", "الأكلات الصحية والمفيدة", "تقديم الطعام بطريقة جذابة"],
    "سفر": ["وجهات سياحية مذهلة", "نصائح السفر والتوفير", "معالم تاريخية مهمة", "تجارب سفر لا تُنسى"],
    "موضة": ["أحدث صيحات الموضة", "تنسيق الألوان والأزياء", "موضة الشتاء الأنيقة", "اكسسوارات عصرية مميزة"],
    "رياضة": ["تمارين بناء العضلات", "رياضات جديدة ومثيرة", "نصائح اللياقة البدنية", "البطولات الرياضية العالمية"],
    "فن": ["الفن التشكيلي المعاصر", "تاريخ الفن والثقافة", "ورش الرسم والإبداع", "معارض فنية مميزة"]
  }

  const randomSpecialty = specialties[Math.floor(Math.random() * specialties.length)]
  const randomContentType = contentTypes[Math.floor(Math.random() * contentTypes.length)]
  const specialtyTopics = topicsBySpecialty[randomSpecialty.value] || ["موضوع مثير ومفيد"]
  const randomTopic = specialtyTopics[Math.floor(Math.random() * specialtyTopics.length)]

  return {
    specialty: randomSpecialty.value,
    contentType: randomContentType.value,
    topic: randomTopic
  }
}

// توليد موضوع بالذكاء الاصطناعي
async function generateTopicWithAI(specialty: string, contentType: string) {
  console.log('🎯 توليد موضوع بالذكاء الاصطناعي...')
  
  const topicPrompt = `قم بتوليد موضوع مثير ومناسب للمحتوى بناءً على المعايير التالية:

التخصص: ${specialty}
نوع المحتوى: ${contentType}

المطلوب:
- موضوع جذاب ومثير للاهتمام
- يناسب التخصص المحدد
- يحفز التفاعل والمشاركة
- يكون عملي ومفيد للجمهور

أعطني موضوع واحد فقط (بدون تفسير إضافي).`

  const data = await makeGeminiRequest(topicPrompt, { temperature: 0.9, maxOutputTokens: 256 })
  const generatedTopic = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  
  if (!generatedTopic) {
    throw new Error('لم يتم إنشاء موضوع')
  }

  return generatedTopic
}

// توليد المحتوى النصي
async function generateTextContent(topic: string, specialty: string, contentType: string) {
  console.log('📝 توليد المحتوى النصي...')
  
  const textPrompt = `أنت خبير في كتابة المحتوى التسويقي الإبداعي والجذاب على فيسبوك. 
اكتب محتوى ${contentType} في مجال ${specialty} حول الموضوع: "${topic}"

⚠️ تعليمات مهمة جداً:
🚫 لا تستخدم أي تنسيق markdown مثل ** أو __ أو # 
✅ استخدم النص العادي فقط مع الرموز التعبيرية

المطلوب:
🎯 نص إبداعي وجذاب يلفت الانتباه فوراً
🌟 استخدام 15-20 رمز تعبيري متنوع وذكي في النص
✨ كلمات قوية ومؤثرة تثير المشاعر والفضول
🔥 فقرات قصيرة (2-3 أسطر لكل فقرة)
💫 عبارات تفاعلية تشجع التعليق والمشاركة
⭐ دعوة قوية للعمل في النهاية
📝 طول مناسب: 200-300 كلمة
🏷️ إنهاء النص بـ 5-7 هاشتاغات مناسبة

📋 التنسيق المطلوب:
- ابدأ بجملة جذابة مع رموز تعبيرية
- قسم النص إلى 3-4 فقرات قصيرة
- استخدم رموز تعبيرية في بداية كل فقرة
- أنهي بدعوة للعمل مع رموز تعبيرية
- أضف 5-7 هاشتاغات في السطر الأخير

اكتب المحتوى مباشرة بالتنسيق المطلوب.`

  const data = await makeGeminiRequest(textPrompt, { temperature: 0.7, maxOutputTokens: 1024 })
  let textContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  
  if (!textContent) {
    throw new Error('لم يتم إنشاء محتوى نصي')
  }

  // إزالة تنسيق Markdown والحفاظ على الرموز التعبيرية والهاشتاغات
  textContent = textContent
    .replace(/\*\*(.*?)\*\*/g, '$1')  // إزالة ** النص **
    .replace(/\*(.*?)\*/g, '$1')      // إزالة * النص *
    .replace(/_(.*?)_/g, '$1')        // إزالة _ النص _
    .replace(/__(.*?)__/g, '$1')      // إزالة __ النص __
    .replace(/^\s*#+\s*/gm, '')       // إزالة عناوين markdown
    .replace(/^\s*[\*\-\+]\s*/gm, '') // إزالة نقاط markdown
    .replace(/^\s*\d+\.\s*/gm, '')    // إزالة ترقيم markdown
    .trim()

  return textContent
}

// توليد الأسئلة التفاعلية
async function generateInteractiveQuestions(topic: string, textContent: string) {
  console.log('❓ توليد الأسئلة التفاعلية...')
  
  const questionsPrompt = `بناءً على الموضوع: "${topic}" والمحتوى: "${textContent}"

قم بإنشاء 3 أسئلة تفاعلية:
- تحفز التفاعل والنقاش
- مناسبة للجمهور المستهدف
- قصيرة وواضحة
- تشجع على المشاركة

اكتب كل سؤال في سطر منفصل.`

  const data = await makeGeminiRequest(questionsPrompt, { temperature: 0.8, maxOutputTokens: 512 })
  const questionsText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  
  if (!questionsText) {
    throw new Error('لم يتم إنشاء أسئلة تفاعلية')
  }

  // تقسيم الأسئلة
  const questions = questionsText
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
    .filter(question => question.length > 5)
    .slice(0, 3)

  return questions
}

// توليد برومت الصورة المنظم JSON
async function generateStructuredImagePrompt(topic: string, textContent: string, specialty: string) {
  console.log('🎨 توليد برومت الصورة المنظم...')
  
  const promptsPrompt = `أنت خبير في إنشاء البرومتات المفصلة للذكاء الاصطناعي. بناءً على:

الموضوع: "${topic}"
التخصص: "${specialty}"  
المحتوى: "${textContent}"

قم بإنشاء برومت منظم بصيغة JSON كالتالي:

{
  "subject": "وصف الموضوع الرئيسي للصورة",
  "characters": [
    {
      "name": "الشخصية الرئيسية",
      "description": "وصف مفصل للشخصية",
      "pose": "الوضعية والحركة",
      "expression": "التعبير والمشاعر"
    }
  ],
  "background": {
    "environment": "البيئة المحيطة",
    "details": "التفاصيل الإضافية"
  },
  "style": {
    "art": "الأسلوب الفني",
    "inspiration": "مصدر الإلهام",
    "textures": "الملمس والنسيج"
  },
  "mood": "المزاج العام",
  "lighting": {
    "type": "نوع الإضاءة",
    "direction": "اتجاه الضوء",
    "effects": "التأثيرات الضوئية"
  },
  "colors": {
    "palette": ["الألوان المستخدمة"],
    "dominant": "اللون المهيمن"
  },
  "camera": {
    "angle": "زاوية الكاميرا",
    "lens": "نوع العدسة",
    "focus": "نقطة التركيز"
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
    "symmetry": "نوع التماثل",
    "balance": "التوازن البصري"
  },
  "output": {
    "resolution": "1024x1024",
    "format": "png",
    "quality": "high"
  }
}

تأكد من:
- التوافق مع القيم الإسلامية والحشمة
- جودة بصرية عالية ومناسبة للنشر على فيسبوك
- ألوان جذابة ومتناسقة
- تجنب العناصر المثيرة للجدل أو غير المناسبة

أعطني JSON كامل ومفصل:`

  const data = await makeGeminiRequest(promptsPrompt, { temperature: 0.7, maxOutputTokens: 1024 })
  let jsonResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  
  if (!jsonResponse) {
    throw new Error('لم يتم إنشاء برومت الصورة المنظم')
  }

  // استخراج JSON من النص
  try {
    const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const structuredPrompt = JSON.parse(jsonMatch[0])
      
      // تحويل JSON إلى نص برومت إنجليزي
      const finalPrompt = convertStructuredPromptToText(structuredPrompt)
      
      return {
        structuredPrompt,
        finalPrompt
      }
    } else {
      throw new Error('لم يتم العثور على JSON صالح')
    }
  } catch (error) {
    console.error('خطأ في تحليل JSON:', error)
    // برومت احتياطي
    const fallbackPrompt = `Professional image for ${specialty} content about ${topic}, high quality, modern style, appropriate for social media, clean composition, suitable lighting, attractive colors`
    return {
      structuredPrompt: null,
      finalPrompt: fallbackPrompt
    }
  }
}

// تحويل البرومت المنظم إلى نص إنجليزي
function convertStructuredPromptToText(structured: any): string {
  const parts = []
  
  // الموضوع الرئيسي
  if (structured.subject) {
    parts.push(structured.subject)
  }
  
  // الشخصيات
  if (structured.characters && structured.characters.length > 0) {
    structured.characters.forEach((char: any) => {
      if (char.description) parts.push(char.description)
      if (char.pose) parts.push(char.pose)
      if (char.expression) parts.push(char.expression)
    })
  }
  
  // الخلفية
  if (structured.background) {
    if (structured.background.environment) parts.push(structured.background.environment)
    if (structured.background.details) parts.push(structured.background.details)
  }
  
  // الأسلوب
  if (structured.style) {
    if (structured.style.art) parts.push(structured.style.art)
    if (structured.style.inspiration) parts.push(`inspired by ${structured.style.inspiration}`)
    if (structured.style.textures) parts.push(structured.style.textures)
  }
  
  // المزاج
  if (structured.mood) {
    parts.push(`${structured.mood} mood`)
  }
  
  // الإضاءة
  if (structured.lighting) {
    if (structured.lighting.type) parts.push(structured.lighting.type)
    if (structured.lighting.direction) parts.push(structured.lighting.direction)
    if (structured.lighting.effects) parts.push(structured.lighting.effects)
  }
  
  // الألوان
  if (structured.colors) {
    if (structured.colors.palette && structured.colors.palette.length > 0) {
      parts.push(`color palette: ${structured.colors.palette.join(', ')}`)
    }
    if (structured.colors.dominant) {
      parts.push(`dominated by ${structured.colors.dominant}`)
    }
  }
  
  // الكاميرا
  if (structured.camera) {
    if (structured.camera.angle) parts.push(structured.camera.angle)
    if (structured.camera.lens) parts.push(structured.camera.lens)
    if (structured.camera.focus) parts.push(structured.camera.focus)
  }
  
  // التكوين
  if (structured.composition) {
    if (structured.composition.rule_of_thirds) parts.push('rule of thirds composition')
    if (structured.composition.symmetry) parts.push(structured.composition.symmetry)
    if (structured.composition.balance) parts.push(structured.composition.balance)
  }
  
  // الجودة والتنسيق
  parts.push('high quality', 'professional photography', 'sharp details', 'vibrant colors')
  
  return parts.filter(Boolean).join(', ')
}

// تحليل ملاءمة الصورة الشامل مع فحص دقيق
async function analyzeImageContentSuitability(imageUrl: string, textContent: string, topic: string) {
  console.log('🔍 تحليل ملاءمة الصورة للمحتوى بالذكاء الاصطناعي...')
  
  try {
    // استدعاء edge function المحدث للفحص الشامل
    const analysisResponse = await fetch(`${supabaseUrl}/functions/v1/comprehensive-image-validator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        imageUrl: imageUrl,
        postContent: textContent,
        context: `تحليل شامل لصورة الموضوع: ${topic}`
      })
    })

    if (!analysisResponse.ok) {
      console.warn('⚠️ فشل في تحليل الصورة، سيتم المتابعة بدون تحليل')
      return {
        isAppropriate: undefined,
        isRelevant: undefined,
        overallScore: undefined,
        confidence: 50,
        analysis: 'لم يتم إجراء تحليل مفصل للصورة',
        suggestions: []
      }
    }

    const validationResult = await analysisResponse.json()
    console.log('📊 نتائج التحليل:', {
      isValid: validationResult.isValid,
      score: validationResult.score,
      violations: validationResult.violations,
      confidence: validationResult.confidence
    })

    return {
      isAppropriate: validationResult.isValid && validationResult.score >= 70,
      isRelevant: validationResult.analysisDetails?.contentAlignment || false,
      overallScore: validationResult.score,
      confidence: validationResult.confidence,
      analysis: validationResult.imageDescription || 'تم تحليل الصورة بنجاح',
      violations: validationResult.violations || [],
      warnings: validationResult.warnings || [],
      analysisDetails: validationResult.analysisDetails,
      suggestions: validationResult.violations.length > 0 ? 
        ['الصورة تحتوي على مخالفات، يُنصح بإعادة التوليد'] : 
        ['الصورة مناسبة للنشر']
    }
  } catch (error) {
    console.error('❌ خطأ في تحليل الصورة:', error)
    return {
      isAppropriate: undefined,
      isRelevant: undefined,
      overallScore: undefined,
      confidence: 30,
      analysis: 'حدث خطأ أثناء تحليل الصورة، تم قبولها كخيار افتراضي',
      suggestions: ['يُنصح بمراجعة الصورة يدوياً']
    }
  }
}

// تقييم ملاءمة الصورة للمحتوى
function evaluateImageSuitability(analysisData: any, textContent: string, topic: string) {
  let overallScore = 0
  let isAppropriate = true
  let isRelevant = false
  let confidence = 70
  const suggestions = []

  try {
    const imageDescription = analysisData.imageDescription?.toLowerCase() || ''
    const extractedText = analysisData.extractedInfo?.text?.join(' ').toLowerCase() || ''
    const topicLower = topic.toLowerCase()
    const contentLower = textContent.toLowerCase()

    // 1. فحص الملاءمة (عدم وجود محتوى غير مناسب)
    const inappropriateKeywords = [
      'عنف', 'violence', 'دم', 'blood', 'إباحي', 'nude', 'عاري',
      'مخدرات', 'drugs', 'كحول', 'alcohol', 'سلاح', 'weapon'
    ]
    
    const hasInappropriateContent = inappropriateKeywords.some(keyword => 
      imageDescription.includes(keyword) || extractedText.includes(keyword)
    )
    
    if (hasInappropriateContent) {
      isAppropriate = false
      overallScore -= 50
      suggestions.push('الصورة تحتوي على محتوى غير مناسب')
    } else {
      overallScore += 30
    }

    // 2. فحص الصلة بالموضوع
    const topicKeywords = extractTopicKeywords(topic)
    const contentKeywords = extractContentKeywords(textContent)
    const allRelevantKeywords = [...topicKeywords, ...contentKeywords]

    let relevanceMatches = 0
    allRelevantKeywords.forEach(keyword => {
      if (imageDescription.includes(keyword) || extractedText.includes(keyword)) {
        relevanceMatches++
        overallScore += 10
      }
    })

    if (relevanceMatches > 0) {
      isRelevant = true
      confidence += 20
    }

    // 3. فحص جودة الصورة (نص واضح، تركيب جيد)
    if (extractedText.length > 0) {
      overallScore += 15
      suggestions.push('الصورة تحتوي على نص مفيد')
    }

    // 4. التقييم النهائي
    if (overallScore < 40) {
      suggestions.push('الصورة قد لا تكون مناسبة للمحتوى')
    } else if (overallScore > 80) {
      suggestions.push('الصورة مناسبة جداً للمحتوى')
    }

    return {
      isAppropriate,
      isRelevant,
      overallScore: Math.max(0, Math.min(100, overallScore)),
      confidence: Math.max(30, Math.min(100, confidence)),
      suggestions
    }
  } catch (error) {
    console.error('خطأ في تقييم ملاءمة الصورة:', error)
    return {
      isAppropriate: true,
      isRelevant: false,
      overallScore: 50,
      confidence: 30,
      suggestions: ['حدث خطأ في التقييم']
    }
  }
}

// استخراج الكلمات المفتاحية من الموضوع
function extractTopicKeywords(topic: string): string[] {
  const keywords = []
  const topicLower = topic.toLowerCase()
  
  // كلمات مفتاحية عامة
  if (topicLower.includes('طب') || topicLower.includes('صحة')) {
    keywords.push('doctor', 'medical', 'health', 'طبيب', 'صحة', 'علاج', 'دواء')
  }
  if (topicLower.includes('تقنية') || topicLower.includes('تكنولوجيا')) {
    keywords.push('technology', 'computer', 'digital', 'تقنية', 'حاسوب', 'رقمي')
  }
  if (topicLower.includes('طعام') || topicLower.includes('طبخ')) {
    keywords.push('food', 'cooking', 'recipe', 'طعام', 'طبخ', 'وصفة')
  }
  if (topicLower.includes('رياضة') || topicLower.includes('لياقة')) {
    keywords.push('sport', 'fitness', 'exercise', 'رياضة', 'لياقة', 'تمرين')
  }
  
  return keywords
}

// استخراج الكلمات المفتاحية من المحتوى
function extractContentKeywords(content: string): string[] {
  const keywords = []
  const contentLower = content.toLowerCase()
  
  // البحث عن كلمات مفتاحية في النص
  const commonKeywords = [
    'منتج', 'خدمة', 'عرض', 'تخفيض', 'جودة', 'مميز', 'جديد', 'حصري',
    'product', 'service', 'offer', 'quality', 'premium', 'new', 'exclusive'
  ]
  
  commonKeywords.forEach(keyword => {
    if (contentLower.includes(keyword)) {
      keywords.push(keyword)
    }
  })
  
  return keywords
}

// توليد الصورة باستخدام A4F API مع التحليل
async function generateImage(imagePrompt: string, textContent: string, topic: string) {
  console.log('🖼️ توليد الصورة مع التحليل الذكي...')
  
  let attempts = 0
  const maxAttempts = 3
  
  while (attempts < maxAttempts) {
    attempts++
    console.log(`🔄 محاولة توليد الصورة ${attempts}/${maxAttempts}`)
    
    try {
      const response = await fetch('https://api.a4f.co/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ddc-a4f-d18769825db54bb0a03e087f28dda67f'
        },
        body: JSON.stringify({
          model: 'provider-4/imagen-3',
          prompt: imagePrompt,
          n: 1,
          size: "1024x1024"
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error.message || data.error)
      }

      const imageUrl = data.data?.[0]?.url
      if (!imageUrl) {
        throw new Error('لم يتم إرجاع رابط صورة من A4F API')
      }

      // تحليل ملاءمة الصورة للمحتوى
      console.log('🔍 تحليل ملاءمة الصورة للمحتوى...')
      const analysisResult = await analyzeImageContentSuitability(imageUrl, textContent, topic)
      
      console.log('📊 نتائج التحليل:', {
        isAppropriate: analysisResult.isAppropriate,
        isRelevant: analysisResult.isRelevant,
        overallScore: analysisResult.overallScore,
        confidence: analysisResult.confidence
      })

      // تقييم جودة الصورة
      if (!analysisResult.isAppropriate) {
        console.log('❌ الصورة غير مناسبة، إعادة التوليد...')
        if (attempts < maxAttempts) {
          // تعديل الـ prompt لتجنب المحتوى غير المناسب
          imagePrompt += ", family-friendly, appropriate content, safe for work"
          continue
        }
      }
      
      if (analysisResult.overallScore < 40 && attempts < maxAttempts) {
        console.log('⚠️ درجة ملاءمة منخفضة، إعادة التوليد...')
        // تحسين الـ prompt
        imagePrompt += `, ${topic}, relevant to content`
        continue
      }

      return {
        imageUrl,
        analysis: analysisResult
      }
    } catch (error) {
      console.error(`❌ فشل في المحاولة ${attempts}:`, error)
      if (attempts >= maxAttempts) {
        throw error
      }
      
      // تأخير قبل المحاولة التالية
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  throw new Error('فشل في توليد صورة مناسبة بعد عدة محاولات')
}

// نشر المحتوى على فيسبوك
async function publishToFacebook(pageAccessToken: string, postData: any) {
  console.log('📱 نشر المحتوى على فيسبوك...')
  
  try {
    const formData = new FormData()
    formData.append('message', postData.textContent)
    formData.append('url', postData.imageUrl)
    formData.append('access_token', pageAccessToken)

    const response = await fetch(`https://graph.facebook.com/v19.0/me/photos`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'فشل في النشر على فيسبوك')
    }

    const data = await response.json()
    return { success: true, postId: data.id }
  } catch (error) {
    console.error('❌ خطأ في النشر على فيسبوك:', error)
    return { success: false, error: error.message }
  }
}

// إضافة التعليقات التفاعلية
async function addInteractiveComments(postId: string, pageAccessToken: string, questions: string[]) {
  console.log('💬 إضافة التعليقات التفاعلية...')
  
  try {
    for (const question of questions) {
      const commentResponse = await fetch(`https://graph.facebook.com/v19.0/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          access_token: pageAccessToken
        })
      })

      if (!commentResponse.ok) {
        console.error('فشل في إضافة تعليق:', await commentResponse.text())
      } else {
        console.log('✅ تم إضافة تعليق تفاعلي')
      }

      // تأخير بين التعليقات
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  } catch (error) {
    console.error('❌ خطأ في إضافة التعليقات:', error)
  }
}

// الدالة الرئيسية للأتمتة الكاملة
async function runFullAutomation(automation: any) {
  console.log('🤖 بدء أتمتة توليد المحتوى الذكية الشاملة...')
  
  try {
    // المرحلة 1: توليد إعدادات المحتوى العشوائية
    console.log('🎲 المرحلة 1: توليد إعدادات المحتوى العشوائية...')
    const settings = await generateRandomSettings()
    console.log('✅ تم توليد الإعدادات:', JSON.stringify(settings, null, 2))

    // المرحلة 2: توليد موضوع المحتوى بالذكاء الاصطناعي
    console.log('🎯 المرحلة 2: توليد موضوع المحتوى بالذكاء الاصطناعي...')
    const topic = await generateTopicWithAI(settings.specialty, settings.contentType)
    console.log('✅ تم توليد الموضوع:', `"${topic}"`)

    // المرحلة 3: توليد المحتوى النصي
    console.log('📝 المرحلة 3: توليد المحتوى النصي...')
    const textContent = await generateTextContent(topic, settings.specialty, settings.contentType)
    console.log('✅ تم توليد المحتوى النصي')

    // المرحلة 4: توليد الأسئلة التفاعلية
    console.log('❓ المرحلة 4: توليد الأسئلة التفاعلية...')
    const questions = await generateInteractiveQuestions(topic, textContent)
    console.log('✅ تم توليد الأسئلة التفاعلية:', JSON.stringify(questions, null, 2))

    // المرحلة 5: توليد برومت الصورة المنظم
    console.log('🎨 المرحلة 5: توليد برومت الصورة المنظم...')
    const promptResult = await generateStructuredImagePrompt(topic, textContent, settings.specialty)
    const imagePrompt = promptResult.finalPrompt
    console.log('✅ تم توليد برومت الصورة المنظم')
    console.log('📋 البرومت المنظم:', JSON.stringify(promptResult.structuredPrompt, null, 2))

    // المرحلة 6: توليد الصورة مع التحليل الذكي للملاءمة
    console.log('🖼️ المرحلة 6: توليد الصورة مع التحليل الذكي للملاءمة...')
    const imageResult = await generateImage(imagePrompt, textContent, topic)
    const imageUrl = imageResult.imageUrl
    const imageAnalysis = imageResult.analysis
    console.log('✅ تم توليد الصورة مع التحليل:', imageUrl)
    console.log('📊 نتائج تحليل الصورة:', {
      isAppropriate: imageAnalysis.isAppropriate,
      overallScore: imageAnalysis.overallScore,
      confidence: imageAnalysis.confidence
    })

    // المرحلة 7: نشر المنشور على فيسبوك
    console.log('📱 المرحلة 7: نشر المنشور على فيسبوك...')
    const publishResult = await publishToFacebook(automation.page_access_token, {
      textContent,
      imageUrl
    })

    if (publishResult.success) {
      console.log('✅ تم نشر المنشور بنجاح، ID:', publishResult.postId)

      // المرحلة 8: إضافة التعليقات التفاعلية
      console.log('💬 المرحلة 8: إضافة التعليقات التفاعلية...')
      await addInteractiveComments(publishResult.postId, automation.page_access_token, questions)

      return {
        success: true,
        postId: publishResult.postId,
        settings,
        topic,
        textContent,
        questions,
        imageUrl,
        imageAnalysis
      }
    } else {
      throw new Error(publishResult.error || 'فشل في النشر')
    }

  } catch (error) {
    console.error('❌ خطأ في الأتمتة الكاملة:', error)
    throw error
  }
}

// دالة المعالجة في الخلفية
async function processAutomationInBackground(automation: any, body: any) {
  try {
    console.log('🔄 بدء المعالجة في الخلفية...')
    
    // خصم الكريديت قبل التنفيذ
    if (!body?.internal) {
      const creditResult = await supabase.rpc('deduct_credits', { 
        p_custom_page_token: automation.custom_page_token,
        p_credits_to_deduct: 2 
      })

      if (creditResult.error || !creditResult.data) {
        console.error('❌ فشل في خصم الكريديت - توقف الأتمتة')
        return
      }
      console.log('💳 تم خصم 2 كريديت بنجاح')
    } else {
      console.log('📱 طلب داخلي - لن يتم خصم الكريديت')
    }

    // تشغيل الأتمتة الكاملة
    const result = await runFullAutomation(automation)

    console.log('🎉 تم إنجاز الأتمتة الكاملة بنجاح!')
    console.log('✅ Automation executed successfully for page:', automation.page_name)

  } catch (error) {
    console.error('❌ خطأ في المعالجة الخلفية:', error)
  }
}

// الخادم الرئيسي
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 بدء automated-publishing-api...')
    
    const url = new URL(req.url)
    const token = url.searchParams.get('token')

    if (!token) {
      throw new Error('Token parameter is required')
    }

    const cronSecret = Deno.env.get('CRON_SECRET')
    console.log(`🔍 Token received: ${token?.substring(0, 20)}...`)
    console.log(`🔍 CRON_SECRET configured: ${cronSecret ? 'Yes' : 'No'}`)
    console.log(`🔍 CRON_SECRET value: ${cronSecret?.substring(0, 20)}...`)
    console.log(`🔍 Token comparison result: ${token === cronSecret}`)
    
    let triggerType = 'PAGE_TOKEN'
    let subscriptions: any[] = []

    // منطق المصادقة المزدوج
    if (token === cronSecret && cronSecret) {
      // وضع CRON_SECRET - تشغيل عام لجميع الاشتراكات النشطة
      console.log('🔑 تم التحقق من CRON_SECRET - تشغيل عام')
      triggerType = 'CRON_SECRET'
      
      const { data: allSubscriptions, error: fetchError } = await supabase
        .from('automation_subscriptions')
        .select('*')
        .eq('automation_active', true)
        .gt('credits_remaining', 0)
        .gt('subscription_end', new Date().toISOString())

      if (fetchError) {
        console.error('❌ خطأ في جلب الاشتراكات:', fetchError)
        throw new Error('Failed to fetch subscriptions')
      }

      subscriptions = allSubscriptions || []
      console.log(`✅ تم جلب ${subscriptions.length} اشتراكات نشطة`)
      
    } else {
      // وضع PAGE_TOKEN - التحقق من توكن صفحة محددة
      console.log('🔍 التحقق من توكن الصفحة في قاعدة البيانات...')
      
      const { data: automation, error: tokenError } = await supabase
        .from('automation_subscriptions')
        .select('*')
        .eq('custom_page_token', token)
        .eq('automation_active', true)
        .gt('credits_remaining', 0)
        .gt('subscription_end', new Date().toISOString())
        .single()

      if (tokenError || !automation) {
        console.log('❌ Invalid token provided')
        throw new Error('Invalid token')
      }

      subscriptions = [automation]
      console.log('✅ تم التحقق من التوكن بنجاح - صفحة:', automation.page_name)
    }

    console.log(`📅 Automated publishing triggered at: ${new Date().toISOString()}`)

    if (!subscriptions || subscriptions.length === 0) {
      console.log('ℹ️ لا توجد اشتراكات نشطة')
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'No active subscriptions found',
          trigger: triggerType,
          processed_count: 0,
          timestamp: new Date().toISOString()
        }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // إرجاع رد سريع
    const quickResponse = new Response(
      JSON.stringify({ 
        success: true,
        message: `Automation started (${triggerType})`,
        trigger: triggerType,
        active_subscriptions: subscriptions.length,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

    // بدء المعالجة في الخلفية لكل اشتراك
    const backgroundPromises = subscriptions.map(subscription => 
      processAutomationInBackground(subscription, { trigger: triggerType })
    )

    // استخدام EdgeRuntime.waitUntil إن كانت متوفرة، وإلا setTimeout
    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
      EdgeRuntime.waitUntil(Promise.allSettled(backgroundPromises))
    } else {
      // حل احتياطي
      setTimeout(() => {
        Promise.allSettled(backgroundPromises).catch(console.error)
      }, 0)
    }

    return quickResponse

  } catch (error) {
    console.error('Error in automated publishing:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})