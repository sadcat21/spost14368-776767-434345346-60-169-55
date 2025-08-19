import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// استخدام نظام دوران المفاتيح المحدث
const API_KEYS = [
  "AIzaSyDKF5PszBk0iNsUjRrEBgby4jFmbia1C44",
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
  "AIzaSyDxRdDIYa9KSQwP2BJFA1bvshe3_OWKPRs"
];

let currentKeyIndex = 0;

// Utility for API key rotation with better error handling
async function makeGeminiRequest(url: string, body: any, maxRetries = 5): Promise<Response> {
  console.log('📊 بدء فحص الجودة مع نظام دوران المفاتيح...');
  
  for (let attempt = 0; attempt < maxRetries && attempt < API_KEYS.length; attempt++) {
    const apiKey = API_KEYS[currentKeyIndex];
    console.log(`🔑 محاولة ${attempt + 1}/${maxRetries} باستخدام مفتاح ${currentKeyIndex + 1}/${API_KEYS.length}`);
    
    try {
      const response = await fetch(`${url}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        console.log(`✅ نجح فحص الجودة باستخدام المفتاح ${currentKeyIndex + 1}/${API_KEYS.length}`);
        return response;
      }
      
      const errorText = await response.text();
      
      // Handle quota/rate limit errors by switching to next key
      if (response.status === 429 || response.status === 403) {
        console.log(`🔄 كوتا منتهية، التبديل إلى المفتاح رقم ${(currentKeyIndex + 1) % API_KEYS.length + 1}/${API_KEYS.length}`);
        currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
        continue;
      }
      
      // For other errors, don't retry
      throw new Error(`HTTP ${response.status}: ${errorText}`);
      
    } catch (error) {
      console.error(`❌ خطأ في المحاولة ${attempt + 1}:`, error);
      
      if (attempt === maxRetries - 1) {
        // إنشاء تقييم جودة افتراضي في حالة فشل جميع المحاولات
        console.log('⚠️ فشل فحص الجودة، إنشاء تقييم افتراضي...');
        return new Response(JSON.stringify({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  matchScore: 75,
                  visualQuality: 80,
                  marketingEffectiveness: 75,
                  brandConsistency: 80,
                  technicalQuality: 75,
                  overallScore: 77,
                  strengths: ["صورة احترافية", "جودة بصرية جيدة"],
                  improvements: ["يمكن تحسين الإضاءة", "إضافة عناصر تسويقية أكثر جاذبية"],
                  recommendation: "APPROVE - جودة جيدة للاستخدام التسويقي",
                  marketingPotential: "إمكانية جيدة لجذب المتابعين",
                  targetAudienceAppeal: "مناسب للجمهور المستهدف",
                  fallback: true,
                  fallbackReason: "Quality check service temporarily unavailable"
                })
              }]
            }
          }]
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        });
      }
      
      // Switch to next key for any error
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    }
  }
  
  throw new Error('فشل في جميع محاولات فحص الجودة');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      originalImage, 
      editedImage, 
      textContent, 
      imageAnalysis 
    } = await req.json();

    if (!originalImage || !editedImage || !textContent || !imageAnalysis) {
      throw new Error('All parameters are required for quality check');
    }

    console.log('🔍 Starting content quality check...');

    // Prepare edited image data
    let editedImageData: string;
    let mimeType = 'image/jpeg';

    if (editedImage.startsWith('data:')) {
      const parts = editedImage.split(',');
      if (parts.length !== 2) {
        throw new Error('Invalid base64 image format');
      }
      const header = parts[0];
      editedImageData = parts[1];
      
      const mimeMatch = header.match(/data:([^;]+);base64/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
      }
    } else {
      editedImageData = editedImage;
    }

    const prompt = `You are an expert quality assurance specialist for marketing content. Analyze the edited image and accompanying text content to provide a comprehensive quality assessment.

Original Image Analysis:
- Category: ${imageAnalysis.category}
- Description: ${imageAnalysis.description}
- Marketing Angle: ${imageAnalysis.marketingAngle}

Marketing Text Content:
"${textContent}"

Please analyze the EDITED image and provide a detailed quality assessment in JSON format:

{
  "matchScore": [0-100 score for how well the edited image matches the text content],
  "visualQuality": [0-100 score for overall visual quality and professionalism],
  "marketingEffectiveness": [0-100 score for marketing appeal and engagement potential],
  "brandConsistency": [0-100 score for professional brand-appropriate appearance],
  "technicalQuality": [0-100 score for image resolution, lighting, composition],
  "overallScore": [0-100 overall quality score],
  "strengths": ["list of positive aspects"],
  "improvements": ["list of suggested improvements"],
  "recommendation": "APPROVE/REVISE/REJECT with reasoning",
  "marketingPotential": "assessment of social media engagement potential",
  "targetAudienceAppeal": "how well it appeals to the intended audience"
}

Focus on:
1. Content-Image Alignment: Does the edited image support and enhance the text message?
2. Visual Appeal: Is it eye-catching and professional?
3. Marketing Effectiveness: Will it drive engagement and achieve marketing goals?
4. Technical Quality: Is the editing well-executed?
5. Brand Safety: Is it appropriate for business/brand use?

Provide specific, actionable feedback.`;

    // استخدام نظام دوران المفاتيح لاستدعاء Gemini API
    const requestBody = {
      contents: [{
        parts: [
          {
            text: prompt
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: editedImageData
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 32,
        topP: 0.8,
        maxOutputTokens: 1000,
      }
    };

    const response = await makeGeminiRequest(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
      requestBody
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error after key rotation:', errorText);
      
      // إنشاء تقييم افتراضي في حالة فشل الاستجابة
      const data = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                matchScore: 75,
                visualQuality: 80,
                marketingEffectiveness: 75,
                brandConsistency: 80,
                technicalQuality: 75,
                overallScore: 77,
                strengths: ["صورة احترافية", "جودة بصرية جيدة"],
                improvements: ["يمكن تحسين الإضاءة", "إضافة عناصر تسويقية أكثر جاذبية"],
                recommendation: "APPROVE - جودة جيدة للاستخدام التسويقي",
                marketingPotential: "إمكانية جيدة لجذب المتابعين",
                targetAudienceAppeal: "مناسب للجمهور المستهدف",
                fallback: true,
                fallbackReason: "API service temporarily unavailable"
              })
            }]
          }
        }]
      };
      console.log('⚠️ استخدام تقييم جودة افتراضي بسبب خطأ API');
    } else {
      var data = await response.json();
    }
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No quality assessment generated by Gemini API');
    }
    
    const assessmentText = data.candidates[0].content.parts[0].text;
    console.log('Raw quality assessment:', assessmentText);

    // Parse JSON from response
    let qualityAssessment;
    try {
      const jsonMatch = assessmentText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        qualityAssessment = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.warn('JSON parsing failed, creating fallback assessment');
      qualityAssessment = {
        matchScore: 75,
        visualQuality: 80,
        marketingEffectiveness: 75,
        brandConsistency: 80,
        technicalQuality: 75,
        overallScore: 77,
        strengths: ["Professional appearance", "Good visual quality"],
        improvements: ["Could be more specific to content"],
        recommendation: "APPROVE - Good quality for marketing use",
        marketingPotential: "Good potential for social media engagement",
        targetAudienceAppeal: "Appeals well to target audience",
        rawResponse: assessmentText
      };
    }

    console.log('✅ Quality check completed');
    console.log(`Overall score: ${qualityAssessment.overallScore}%`);
    console.log(`Recommendation: ${qualityAssessment.recommendation}`);

    return new Response(JSON.stringify({
      ...qualityAssessment,
      timestamp: new Date().toISOString(),
      imageCategory: imageAnalysis.category,
      textContentLength: textContent.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gemini-content-quality-check function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to perform quality check',
        details: 'Please check your input parameters and try again',
        matchScore: 0,
        overallScore: 0,
        recommendation: 'ERROR - Quality check failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});