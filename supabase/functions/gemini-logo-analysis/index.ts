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
    const { imageUrl, analysisType, prompt } = await req.json()
    
    if (!imageUrl) {
      throw new Error('يرجى تقديم رابط الصورة')
    }

    console.log(`🔍 بدء تحليل الشعار - النوع: ${analysisType}`)
    
    // إنشاء مدير دوران المفاتيح
    const keyManager = createGeminiKeyManager()
    console.log(`📊 إحصائيات المفاتيح:`, keyManager.getStats())

    // تحويل الصورة إلى base64
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))
    
    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: imageResponse.headers.get('content-type') || 'image/jpeg',
              data: base64Image
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      }
    }

    // استخدام نظام دوران المفاتيح
    const geminiResponse = await keyManager.makeGeminiRequest(
      'gemini-1.5-flash',
      requestBody
    )

    if (!geminiResponse.ok) {
      throw new Error(`خطأ في Gemini API: ${geminiResponse.status}`)
    }

    const result = await geminiResponse.json()
    const analysisText = result.candidates?.[0]?.content?.parts?.[0]?.text

    if (!analysisText) {
      throw new Error('لم يتم الحصول على تحليل من Gemini')
    }

    // تحليل النص وتحويله إلى بيانات منظمة
    let structuredAnalysis = {}
    
    if (analysisType === 'logo') {
      // تحليل الشعار
      structuredAnalysis = {
        colors: {
          dominant: extractColors(analysisText),
          complementary: [],
          contrast: extractContrast(analysisText)
        },
        shape: {
          type: extractShapeType(analysisText),
          aspectRatio: 1,
          hasTransparency: analysisText.includes('شفاف') || analysisText.includes('transparent')
        },
        characteristics: {
          style: extractStyle(analysisText),
          complexity: extractComplexity(analysisText),
          readability: extractReadability(analysisText)
        }
      }
    } else if (analysisType === 'background') {
      // تحليل الصورة الأساسية
      structuredAnalysis = {
        safeZones: extractSafeZones(analysisText),
        colorProfile: {
          dominant: extractColors(analysisText),
          brightness: extractBrightness(analysisText),
          contrast: []
        },
        composition: {
          focusAreas: extractFocusAreas(analysisText),
          emptySpaces: extractEmptySpaces(analysisText),
          visualWeight: extractVisualWeight(analysisText)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: structuredAnalysis,
        rawText: analysisText 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('خطأ في تحليل الصورة:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

// دوال مساعدة لاستخراج البيانات من النص
function extractColors(text: string): string[] {
  const colorMatches = text.match(/#[0-9A-Fa-f]{6}/g) || []
  return colorMatches.length > 0 ? colorMatches : ['#000000', '#FFFFFF']
}

function extractContrast(text: string): 'high' | 'medium' | 'low' {
  if (text.includes('عالي') || text.includes('high')) return 'high'
  if (text.includes('منخفض') || text.includes('low')) return 'low'
  return 'medium'
}

function extractShapeType(text: string): 'circular' | 'rectangular' | 'complex' | 'text-based' {
  if (text.includes('دائري') || text.includes('circle')) return 'circular'
  if (text.includes('مستطيل') || text.includes('rectangle')) return 'rectangular'
  if (text.includes('نص') || text.includes('text')) return 'text-based'
  return 'complex'
}

function extractStyle(text: string): string {
  if (text.includes('حديث') || text.includes('modern')) return 'حديث'
  if (text.includes('كلاسيكي') || text.includes('classic')) return 'كلاسيكي'
  if (text.includes('بسيط') || text.includes('simple')) return 'بسيط'
  return 'متنوع'
}

function extractComplexity(text: string): 'simple' | 'moderate' | 'complex' {
  if (text.includes('بسيط') || text.includes('simple')) return 'simple'
  if (text.includes('معقد') || text.includes('complex')) return 'complex'
  return 'moderate'
}

function extractReadability(text: string): 'high' | 'medium' | 'low' {
  if (text.includes('واضح') || text.includes('readable')) return 'high'
  if (text.includes('صعب') || text.includes('difficult')) return 'low'
  return 'medium'
}

function extractSafeZones(text: string): Array<{position: string, confidence: number, reason: string}> {
  const zones = [
    { position: 'top-right', confidence: 0.8, reason: 'منطقة آمنة تقليدية' },
    { position: 'top-left', confidence: 0.7, reason: 'مناسبة للقراءة من اليسار' },
    { position: 'bottom-right', confidence: 0.6, reason: 'أقل تداخل مع المحتوى' },
    { position: 'bottom-left', confidence: 0.5, reason: 'موضع بديل' }
  ]
  
  // تحليل النص لتحديد المناطق الأفضل
  if (text.includes('يمين') || text.includes('right')) {
    zones[0].confidence += 0.1
    zones[2].confidence += 0.1
  }
  
  if (text.includes('أعلى') || text.includes('top')) {
    zones[0].confidence += 0.1
    zones[1].confidence += 0.1
  }
  
  return zones.sort((a, b) => b.confidence - a.confidence)
}

function extractBrightness(text: string): 'dark' | 'medium' | 'bright' {
  if (text.includes('مظلم') || text.includes('dark')) return 'dark'
  if (text.includes('مشرق') || text.includes('bright')) return 'bright'
  return 'medium'
}

function extractFocusAreas(text: string): string[] {
  const areas = []
  if (text.includes('وسط') || text.includes('center')) areas.push('center')
  if (text.includes('أعلى') || text.includes('top')) areas.push('top')
  if (text.includes('أسفل') || text.includes('bottom')) areas.push('bottom')
  return areas.length > 0 ? areas : ['center']
}

function extractEmptySpaces(text: string): string[] {
  const spaces = []
  if (text.includes('زاوية') || text.includes('corner')) spaces.push('corners')
  if (text.includes('حافة') || text.includes('edge')) spaces.push('edges')
  if (text.includes('فراغ') || text.includes('empty')) spaces.push('center')
  return spaces.length > 0 ? spaces : ['corners']
}

function extractVisualWeight(text: string): string {
  if (text.includes('ثقيل') || text.includes('heavy')) return 'heavy'
  if (text.includes('خفيف') || text.includes('light')) return 'light'
  return 'medium'
}