import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createGeminiKeyManager } from '../_shared/apiKeyRotation.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 gemini-proxy function called with key rotation');
    
    const { model, payload } = await req.json();
    console.log('📊 Request data:', { model: model || 'undefined', hasPayload: !!payload });

    if (!model || !payload) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: model, payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // إنشاء مدير دوران المفاتيح
    const keyManager = createGeminiKeyManager();
    console.log('📊 Key manager stats:', keyManager.getStats());

    console.log('🌐 Making request to Gemini API with key rotation...');

    // استخدام نظام دوران المفاتيح
    const upstream = await keyManager.makeGeminiRequest(model, payload);

    console.log('📡 Gemini API response:', upstream.status, upstream.statusText);

    if (!upstream.ok) {
      const errorText = await upstream.text();
      console.error('❌ Gemini API error:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Gemini API error',
          status: upstream.status,
          details: errorText
        }),
        { status: upstream.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const text = await upstream.text();
    console.log('✅ Gemini API success');
    
    return new Response(text, {
      status: upstream.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('💥 gemini-proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Unexpected error', 
        details: String(error?.message || error),
        stack: error?.stack || 'No stack trace'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
