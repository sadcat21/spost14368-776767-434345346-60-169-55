import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get API keys - use both Supabase secret and fallback keys
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

// Updated fallback API keys (removed suspended keys)
const FALLBACK_API_KEYS = [
  'AIzaSyCoE0wSdHRAVvjUfEZ0gYGAOPl-Aj-5zOE',
  'AIzaSyDKF5PszBk0iNsUjRrEBgby4jFmbia1C44', 
  'AIzaSyAQFdTwDHyj7LB7wZmVT3pA8Dl1cF-GqGk',
  'AIzaSyCtC7D4Qc8nXa-qV8Eo9uNrV-d4FpJ9w5Y',
  'AIzaSyBvWX9rKFtGhJq2L8mN3pR5sT7uV9wX1zA',
  'AIzaSyC8dF2gH4jK6lM8nP9qR1sT3uV5wX7yZbC'
];

// Combine all available keys
const ALL_API_KEYS = GEMINI_API_KEY ? [GEMINI_API_KEY, ...FALLBACK_API_KEYS] : FALLBACK_API_KEYS;

let currentKeyIndex = 0;
const suspendedKeys = new Set<string>();

// Helper function to make API request with robust error handling and key rotation
async function makeGeminiRequest(url: string, body: any, maxRetries = 8): Promise<Response> {
  console.log('📊 إحصائيات المفاتيح:', {
    totalKeys: ALL_API_KEYS.length,
    suspendedCount: suspendedKeys.size,
    currentKeyIndex,
    currentKey: ALL_API_KEYS[currentKeyIndex]?.substring(0, 20) + '...'
  });
  
  for (let attempt = 0; attempt < maxRetries && attempt < ALL_API_KEYS.length; attempt++) {
    // Skip suspended keys
    while (suspendedKeys.has(ALL_API_KEYS[currentKeyIndex]) && attempt < ALL_API_KEYS.length) {
      console.log(`⏭️ تم تخطي المفتاح المعلق: ${ALL_API_KEYS[currentKeyIndex].substring(0, 20)}...`);
      currentKeyIndex = (currentKeyIndex + 1) % ALL_API_KEYS.length;
      attempt++;
    }
    
    if (attempt >= ALL_API_KEYS.length) {
      break;
    }
    
    const apiKey = ALL_API_KEYS[currentKeyIndex];
    console.log(`🔑 محاولة ${attempt + 1}/${maxRetries} باستخدام مفتاح ${currentKeyIndex + 1}/${ALL_API_KEYS.length}`);
    
    try {
      const response = await fetch(`${url}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        console.log(`✅ نجح الطلب باستخدام المفتاح ${currentKeyIndex + 1}/${ALL_API_KEYS.length}`);
        return response;
      }
      
      const errorText = await response.text();
      console.error(`❌ خطأ في المحاولة ${attempt + 1}:`, response.status, errorText.substring(0, 200));
      
      // Handle suspended keys specifically
      if (errorText.includes('CONSUMER_SUSPENDED') || errorText.includes('has been suspended')) {
        console.log(`🚫 تم تعليق المفتاح: ${apiKey.substring(0, 20)}...`);
        suspendedKeys.add(apiKey);
        currentKeyIndex = (currentKeyIndex + 1) % ALL_API_KEYS.length;
        continue;
      }
      
      // Handle quota/rate limit errors by switching to next key
      if (response.status === 429 || response.status === 403 || 
          errorText.includes('QUOTA_EXCEEDED') || errorText.includes('quota exceeded')) {
        console.log(`🔄 تم التبديل إلى المفتاح رقم ${(currentKeyIndex + 1) % ALL_API_KEYS.length + 1}/${ALL_API_KEYS.length}`);
        currentKeyIndex = (currentKeyIndex + 1) % ALL_API_KEYS.length;
        continue;
      }
      
      // For other errors, don't retry with same key
      throw new Error(`HTTP ${response.status}: ${errorText}`);
      
    } catch (error) {
      console.error(`❌ خطأ في المحاولة ${attempt + 1}:`, error);
      
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      // Switch to next key for any error
      currentKeyIndex = (currentKeyIndex + 1) % ALL_API_KEYS.length;
    }
  }
  
  throw new Error('فشل في جميع محاولات استخدام مفاتيح API');
}

// Helper: map Arabic/unknown categories and goals to supported keys
function normalizeCategory(input: string | undefined): string {
  if (!input) return 'product';
  const raw = (input + '').toLowerCase();
  // Quick Arabic mappings
  if (/[\u0600-\u06FF]/.test(raw)) { // Arabic chars
    if (raw.includes('طعام') || raw.includes('غذائ') || raw.includes('مطعم')) return 'food';
    if (raw.includes('منتج')) return 'product';
    if (raw.includes('شخص') || raw.includes('وجه') || raw.includes('بشر')) return 'person';
    if (raw.includes('طبيعة') || raw.includes('منظر')) return 'nature';
    if (raw.includes('تقني') || raw.includes('تكنولوج')) return 'technology';
    if (raw.includes('موض') || raw.includes('ازياء') || raw.includes('أزياء')) return 'fashion';
    if (raw.includes('سيار') || raw.includes('سيارة') || raw.includes('مركبة')) return 'automotive';
    if (raw.includes('أعمال') || raw.includes('شركة') || raw.includes('عمل')) return 'business';
    if (raw.includes('نمط') || raw.includes('حياة')) return 'lifestyle';
  }
  // English/fallback heuristics
  if (raw.includes('food')) return 'food';
  if (raw.includes('product')) return 'product';
  if (raw.includes('person') || raw.includes('portrait')) return 'person';
  if (raw.includes('nature') || raw.includes('landscape')) return 'nature';
  if (raw.includes('tech')) return 'technology';
  if (raw.includes('fashion')) return 'fashion';
  if (raw.includes('auto') || raw.includes('car')) return 'automotive';
  if (raw.includes('business') || raw.includes('corporate')) return 'business';
  if (raw.includes('lifestyle')) return 'lifestyle';
  return 'product';
}

function normalizeGoal(input: string | undefined): string {
  if (!input) return 'engagement';
  const raw = (input + '').toLowerCase();
  if (/[\u0600-\u06FF]/.test(raw)) {
    if (raw.includes('تفاعل')) return 'engagement';
    if (raw.includes('وعي')) return 'awareness';
    if (raw.includes('مبيعات') || raw.includes('بيع')) return 'sales';
    if (raw.includes('عملاء') || raw.includes('محتم')) return 'leads';
    if (raw.includes('مجتمع')) return 'community';
  }
  if (raw.includes('engage')) return 'engagement';
  if (raw.includes('aware')) return 'awareness';
  if (raw.includes('sale') || raw.includes('purchase')) return 'sales';
  if (raw.includes('lead')) return 'leads';
  if (raw.includes('community')) return 'community';
  return 'engagement';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🎬 Starting gemini-image-edit-prompt function...');
  
  try {
    const body = await req.json();
    console.log('📥 Request body keys:', Object.keys(body));
    
    const { 
      imageData,
      imageAnalysis, 
      textContent, 
      marketingGoal, 
      language = 'arabic'
    } = body;

    console.log('🔍 Input validation:');
    console.log('- imageAnalysis exists:', !!imageAnalysis);
    console.log('- textContent exists:', !!textContent);
    console.log('- marketingGoal exists:', !!marketingGoal);
    console.log('- imageData exists:', !!imageData);

    if (!imageAnalysis || !textContent || !marketingGoal) {
      const missingFields = [];
      if (!imageAnalysis) missingFields.push('imageAnalysis');
      if (!textContent) missingFields.push('textContent');
      if (!marketingGoal) missingFields.push('marketingGoal');
      
      console.error('❌ Missing required fields:', missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    console.log('🎨 Generating image edit prompt with Gemini Vision...');
    console.log('Image category (raw):', imageAnalysis.category);
    console.log('Marketing goal (raw):', marketingGoal);
    console.log('Has image data:', !!imageData);

    const normalizedCategory = normalizeCategory(imageAnalysis.category);
    const normalizedGoal = normalizeGoal(marketingGoal);

    // Create specialized prompt based on image category and marketing goal
    const categoryEnhancements: Record<string, string> = {
      'product': 'Add professional product photography lighting, clean background, premium presentation, commercial quality',
      'food': 'Enhance colors to look more appetizing, add warm lighting, fresh appearance, restaurant-quality presentation',
      'person': 'Professional portrait lighting, clean background, confident pose, business-ready appearance',
      'nature': 'Enhance natural colors, improve lighting, scenic composition, travel-magazine quality',
      'technology': 'Modern tech aesthetic, clean lines, futuristic elements, high-tech appearance',
      'fashion': 'Fashion photography style, professional lighting, stylish composition, magazine-quality',
      'automotive': 'Showroom lighting, sleek appearance, premium automotive photography style',
      'business': 'Professional corporate aesthetic, clean and modern, business-appropriate presentation',
      'lifestyle': 'Aspirational lifestyle imagery, warm and inviting, premium living aesthetic'
    };

    const goalEnhancements: Record<string, string> = {
      'engagement': 'Make it more eye-catching and shareable, vibrant colors, attention-grabbing composition',
      'awareness': 'Create memorable brand impression, clean professional look, brand-consistent styling',
      'sales': 'Add urgency and desire, premium quality appearance, purchase-motivating presentation',
      'leads': 'Professional and trustworthy appearance, credible business presentation',
      'community': 'Warm and welcoming atmosphere, inclusive and friendly presentation'
    };

    const safeKeywords = Array.isArray(imageAnalysis.keywords)
      ? imageAnalysis.keywords
      : (typeof imageAnalysis.keywords === 'string' && imageAnalysis.keywords.trim().length > 0
        ? [imageAnalysis.keywords]
        : []);

    // Create content parts for the request
    const contentParts: any[] = [];

    // Add image first if available
    if (imageData) {
      contentParts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageData
        }
      });
    }

    // Add text prompt
    contentParts.push({
      text: `You are an expert in image editing and visual marketing. ${imageData ? 'Looking at this image,' : 'Based on the image analysis provided,'} create a detailed and precise image editing prompt that will transform it into a compelling marketing visual.

Current Image Analysis:
- Category: ${imageAnalysis.category}
- Description: ${imageAnalysis.description || ''}
- Marketing Angle: ${imageAnalysis.marketingAngle || ''}
- Keywords: ${safeKeywords.join(', ')}

Marketing Content to Align With:
"${textContent}"

Marketing Goal: ${marketingGoal}

Create a detailed image editing prompt that includes:

1. **Visual Style**: ${categoryEnhancements[normalizedCategory] || 'Professional commercial photography style'}

2. **Marketing Enhancement**: ${goalEnhancements[normalizedGoal] || 'Professional marketing presentation'}

3. **Technical Specifications**:
   - Improved lighting and contrast
   - Enhanced color saturation
   - Professional composition
   - High-resolution appearance
   - Commercial photography quality

4. **Content Alignment**:
   - Visual elements that support the text content
   - Mood that matches the marketing message
   - Style consistent with the target audience

5. **Platform Optimization**:
   - Social media friendly composition
   - Eye-catching for Facebook/Instagram feeds
   - Professional appearance for business use

The editing prompt should be:
- Specific and actionable
- Focused on marketing effectiveness
- Technically precise
- Aligned with the written content
- Optimized for social media engagement

Generate a comprehensive image editing prompt (in English, as this is for technical use):`
    });

    const requestPayload = {
      contents: [{
        parts: contentParts
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 500,
      }
    };

    // Use the improved API rotation system
    const response = await makeGeminiRequest(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
      requestPayload
    );

    const data = await response.json();

    console.log('🧪 Validating API response structure...');
    if (!data.candidates || !data.candidates[0]) {
      console.error('❌ Invalid API response structure:', JSON.stringify(data, null, 2));
      throw new Error('No edit prompt generated by Gemini API - invalid response structure');
    }

    const editPrompt = data.candidates[0].content.parts[0].text;
    console.log('✅ Image edit prompt generated successfully with Gemini Vision');
    console.log('📏 Edit prompt length:', editPrompt?.length || 0);

    return new Response(JSON.stringify({
      editPrompt: (editPrompt || '').trim(),
      imageCategory: imageAnalysis.category,
      normalizedCategory,
      marketingGoal,
      normalizedGoal,
      language,
      technical: {
        categoryEnhancement: categoryEnhancements[normalizedCategory],
        goalEnhancement: goalEnhancements[normalizedGoal]
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('💥 Fatal error in gemini-image-edit-prompt function:', error);
    console.error('🔍 Error details:', {
      message: error?.message,
      stack: error?.stack?.substring(0, 500),
      name: error?.name
    });
    
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Failed to generate image edit prompt',
        details: 'Please check your input parameters and try again',
        errorType: error?.name || 'UnknownError'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
