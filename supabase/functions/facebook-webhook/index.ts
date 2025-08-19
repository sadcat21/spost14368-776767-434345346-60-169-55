// Main Facebook webhook handler - refactored for modularity v2.1
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Configuration constants
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VERIFY_TOKEN = 'facebook_webhook_verify_token_123';

serve(async (req) => {
  console.log('🚀 Facebook webhook called:', req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS request handled');
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  console.log('📍 Processing request to:', url.toString());
  
  try {
    // Handle webhook verification (GET request)
    if (req.method === 'GET') {
      // Handle webhook verification
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ Webhook verified successfully');
        return new Response(challenge, { 
          status: 200,
          headers: corsHeaders 
        });
      }

      // Handle test requests
      if (url.searchParams.get('test') === 'true') {
        console.log('🧪 Test request received');
        return new Response(JSON.stringify({ 
          status: 'success', 
          message: 'Facebook webhook is working!',
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Handle manual comment check
      if (url.searchParams.get('check_comments') === 'true') {
        console.log('🔍 Manual comment check requested');
        try {
          const { handleGeneralFeedChange } = await import('./feed-handler.ts');
          
          // Simulate a feed change event
          const simulatedEntry = {
            id: 'manual_check',
            changed_fields: ['feed'],
            time: Math.floor(Date.now() / 1000)
          };
          
          await handleGeneralFeedChange(simulatedEntry);
          
          return new Response(JSON.stringify({ 
            status: 'success', 
            message: 'تم فحص التعليقات يدوياً',
            timestamp: new Date().toISOString()
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error('❌ Error in manual check:', error);
          return new Response(JSON.stringify({ 
            status: 'error', 
            message: 'خطأ في فحص التعليقات',
            error: error.message
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // Default verification failure
      console.log('❌ Webhook verification failed');
      return new Response('Forbidden', { 
        status: 403,
        headers: corsHeaders 
      });
    }

    // Handle webhook events (POST request)
    if (req.method === 'POST') {
      console.log('📨 POST request received');
      try {
        const body = await req.json();
        console.log('📩 Request body parsed successfully');
        
        // التحقق من وجود action لإعادة معالجة الأحداث
        if (body.action === 'reprocess_events') {
          const { reprocessUnprocessedEvents } = await import('./reprocess.ts');
          return await reprocessUnprocessedEvents();
        }
        
        console.log('📩 Received webhook:', JSON.stringify(body, null, 2));
        
        // التحقق من نوع الويب هوك
        if (body.object === 'page') {
          console.log('✅ Page webhook received');
          // معالجة أحداث الصفحة
          const { processPageEntry } = await import('./reprocess.ts');
          for (const entry of body.entry || []) {
            await processPageEntry(entry);
          }
        } else if (body.object === 'user') {
          console.log('⚠️ User webhook received - handling as general feed change');
          // معالجة أحداث المستخدم (التي تأتي عندما يكون التوكن user token)
          const { processUserEntry } = await import('./reprocess.ts');
          for (const entry of body.entry || []) {
            await processUserEntry(entry);
          }
        } else {
          console.log('❓ Unknown webhook object type:', body.object);
        }

        // حفظ سجل الويب هوك
        try {
          const { saveWebhookLog } = await import('./database.ts');
          await saveWebhookLog(body, true);
        } catch (dbError) {
          console.error('⚠️ Warning - could not save webhook log:', dbError);
        }

        console.log('✅ Webhook processed successfully');
        return new Response('EVENT_RECEIVED', { 
          status: 200,
          headers: corsHeaders 
        });
      } catch (error) {
        console.error('❌ Error processing webhook:', error);
        console.error('❌ Error details:', error.message, error.stack);
        
        // حفظ سجل الخطأ
        try {
          const bodyText = await req.text();
          const { saveWebhookLog } = await import('./database.ts');
          await saveWebhookLog(
            { error: error.message, body: bodyText }, 
            false, 
            error.message
          );
        } catch (logError) {
          console.error('❌ Error saving error log:', logError);
        }

        return new Response(JSON.stringify({
          error: 'Processing failed',
          message: error.message
        }), { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('❌ Webhook main error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});