import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Facebook setup function called, method:', req.method);
    
    let body;
    try {
      body = await req.json();
      console.log('Request body:', body);
    } catch (e) {
      console.error('Failed to parse JSON body:', e);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, ...params } = body;
    console.log('Action:', action, 'Params:', params);

    switch (action) {
      case 'setup_webhook':
        return await setupWebhook(params);
      case 'save_access_token':
        return await saveAccessToken(params);
      case 'get_page_info':
        return await getPageInfo(params);
      case 'test_webhook':
        return await testWebhook(params);
      case 'subscribe_all_pages':
        return await subscribeAllPages();
      case 'test_tokens':
        return await testTokens();
      case 'manage_auto_replies':
        return await manageAutoReplies(params);
      case 'setup_advanced_webhook':
        return await setupAdvancedWebhook(params);
      case 'configure_webhook_fields':
        return await configureWebhookFields(params);
      case 'get_webhook_subscriptions':
        return await getWebhookSubscriptions(params);
      case 'fix_page_subscriptions':
        return await fixPageSubscriptions();
      case 'get_connected_pages':
        return await getConnectedPages();
      case 'disconnect_page':
        return await disconnectPage(params);
      case 'get_user_pages':
        return await getUserPages(params.userAccessToken);
      case 'setup_webhook_for_pages':
        return await setupWebhookForPages(params.pageIds);
      default:
        console.error('Invalid action received:', action);
        return new Response(JSON.stringify({ 
          error: `Invalid action: ${action}`,
          success: false,
          availableActions: ['setup_webhook', 'save_access_token', 'get_page_info', 'test_webhook', 'subscribe_all_pages', 'test_tokens', 'manage_auto_replies', 'setup_advanced_webhook', 'configure_webhook_fields', 'get_webhook_subscriptions', 'fix_page_subscriptions', 'get_connected_pages', 'disconnect_page']
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Setup error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function setupWebhook({ pageId, accessToken }: { pageId: string; accessToken: string }) {
  try {
    const webhookUrl = `${supabaseUrl}/functions/v1/facebook-webhook`;
    const verifyToken = 'facebook_webhook_verify_token_123';

    console.log(`Setting up webhook for page ${pageId}`);

    // First, check page permissions
    const permissionsResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/permissions?access_token=${accessToken}`
    );
    const permissionsData = await permissionsResponse.json();
    console.log('Available permissions:', permissionsData);

    // Subscribe to webhooks with feed events (for comments) and messages
    const subscribeUrl = `https://graph.facebook.com/v19.0/${pageId}/subscribed_apps`;
    
    console.log(`🔔 Subscribing page ${pageId} to webhooks with FEED events...`);
    
    // Use POST method with form data - subscribe to both feed and messages
    const subscribeResponse = await fetch(subscribeUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `access_token=${accessToken}&subscribed_fields=feed,messages`
    });

    const subscribeResult = await subscribeResponse.json();
    console.log('Subscription result for', pageId, ':', subscribeResult);

    if (subscribeResult.error) {
      console.error('Subscription failed:', subscribeResult.error);
      
      // If pages_manage_metadata permission is missing, provide helpful error
      if (subscribeResult.error.code === 200 && subscribeResult.error.message.includes('pages_manage_metadata')) {
        return new Response(JSON.stringify({
          success: false,
          error: 'صلاحية pages_manage_metadata مطلوبة لإعداد الويب هوك',
          permissionNeeded: 'pages_manage_metadata',
          message: 'يرجى إعادة الحصول على Access Token مع الصلاحيات المطلوبة'
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Webhook subscription failed: ${subscribeResult.error.message}`);
    }

    console.log('Webhook subscription successful for page:', pageId);

    return new Response(JSON.stringify({
      success: true,
      message: 'تم إعداد الويب هوك بنجاح',
      webhookUrl: webhookUrl,
      verifyToken: verifyToken,
      subscriptionResult: subscribeResult,
      pageId: pageId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook setup error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      pageId: pageId
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function saveAccessToken({ pageId, accessToken, pageInfo }: { 
  pageId: string; 
  accessToken: string; 
  pageInfo?: any;
}) {
  try {
    const defaultUserId = "00000000-0000-0000-0000-000000000000";

    // Save page information
    const pageData = {
      user_id: defaultUserId,
      page_id: pageId,
      page_name: pageInfo?.name || 'Facebook Page',
      access_token: accessToken,
      is_active: true,
      category: pageInfo?.category || '',
      picture_url: pageInfo?.picture?.data?.url || ''
    };

    const { error: pageError } = await supabase
      .from('facebook_pages')
      .upsert(pageData, { onConflict: 'user_id,page_id' });

    if (pageError) {
      throw new Error(`Failed to save page data: ${pageError.message}`);
    }

    // Also save as API key for compatibility
    const apiKeyData = {
      user_id: defaultUserId,
      key_name: 'FACEBOOK_ACCESS_TOKEN',
      key_value: accessToken
    };

    const { error: apiError } = await supabase
      .from('api_keys')
      .upsert(apiKeyData, { onConflict: 'user_id,key_name' });

    if (apiError) {
      console.warn('API key save warning:', apiError.message);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Access token saved successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Save token error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function getPageInfo({ accessToken }: { accessToken: string }) {
  try {
    console.log('Getting page info with token...');
    
    // First check if this is a user token or page token
    const tokenInfoResponse = await fetch(
      `https://graph.facebook.com/v19.0/me?access_token=${accessToken}&fields=id,name,email`
    );
    const tokenInfo = await tokenInfoResponse.json();
    
    console.log('Token info response:', tokenInfo);

    if (tokenInfo.error) {
      console.error('Token validation failed:', tokenInfo.error);
      throw new Error(`Invalid access token: ${tokenInfo.error.message}`);
    }

    // Try to get pages if this is a user token
    let pagesData = { data: [] };
    try {
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}&fields=id,name,access_token,category,picture`
      );
      const pagesResult = await pagesResponse.json();
      
      if (pagesResult.error) {
        console.log('Cannot fetch pages (might be page token):', pagesResult.error.message);
        // If this fails, it might be a page token, so we'll just return empty pages
        pagesData = { data: [] };
      } else {
        pagesData = pagesResult;
      }
    } catch (pagesError) {
      console.log('Pages fetch failed, continuing without pages:', pagesError);
      pagesData = { data: [] };
    }

    return new Response(JSON.stringify({
      success: true,
      pages: pagesData.data || [],
      user: tokenInfo
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Get page info error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function testWebhook({ pageId }: { pageId: string }) {
  try {
    // Create a test webhook log entry
    const testData = {
      webhook_type: 'facebook_test',
      page_id: pageId,
      event_data: {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Test webhook connection'
      },
      processed: true
    };

    const { error } = await supabase
      .from('webhook_logs')
      .insert(testData);

    if (error) {
      throw new Error(`Test webhook failed: ${error.message}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Test webhook completed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Test webhook error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function subscribeAllPages() {
  try {
    console.log('Starting subscribeAllPages function...');
    
    const { data: pages, error } = await supabase
      .from('facebook_pages')
      .select('page_id, access_token, page_name')
      .eq('is_active', true);

    console.log('Database query result:', { pages: pages?.length, error });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    if (!pages || pages.length === 0) {
      console.log('No pages found in database');
      return new Response(JSON.stringify({ 
        success: true, 
        results: [],
        message: 'لا توجد صفحات نشطة للإعداد',
        summary: {
          total: 0,
          successful: 0,
          failed: 0
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${pages.length} pages to process`);
    const results = [];
    
    for (const page of pages) {
      console.log(`Processing page: ${page.page_name} (${page.page_id})`);
      
      try {
        if (!page.access_token) {
          console.log(`No access token for page ${page.page_name}`);
          results.push({
            page_id: page.page_id,
            page_name: page.page_name,
            success: false,
            error: 'لا يوجد access token'
          });
          continue;
        }

        // Subscribe to feed events (for comments) and messages
        const subscribeUrl = `https://graph.facebook.com/v19.0/${page.page_id}/subscribed_apps`;
        console.log(`Making subscription request to: ${subscribeUrl}`);
        console.log(`🔔 Subscribing to feed events for page: ${page.page_name}`);
        
        const response = await fetch(subscribeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `access_token=${page.access_token}&subscribed_fields=feed,messages`
        });

        console.log(`Response status for ${page.page_name}: ${response.status}`);
        
        const result = await response.json();
        console.log(`Subscription result for ${page.page_name}:`, result);
        
        const isSuccess = response.ok && !result.error;
        results.push({
          page_id: page.page_id,
          page_name: page.page_name,
          success: isSuccess,
          result,
          error: result.error ? result.error.message : null
        });
        
      } catch (pageError) {
        console.error(`Error subscribing page ${page.page_name}:`, pageError);
        results.push({
          page_id: page.page_id,
          page_name: page.page_name,
          success: false,
          error: pageError.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Subscription complete: ${successCount} success, ${failCount} failed`);

    return new Response(JSON.stringify({ 
      success: true, 
      results,
      message: `تم بنجاح: ${successCount}، فشل: ${failCount} من أصل ${results.length} صفحة`,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failCount
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Subscribe all pages error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function testTokens() {
  try {
    const { data: pages, error } = await supabase
      .from('facebook_pages')
      .select('page_id, access_token, page_name')
      .eq('is_active', true);

    if (error) throw error;

    const results = [];
    for (const page of pages) {
      try {
        // Test token by making a simple API call
        const response = await fetch(
          `https://graph.facebook.com/v19.0/${page.page_id}?access_token=${page.access_token}&fields=id,name`
        );

        const result = await response.json();
        
        results.push({
          page_id: page.page_id,
          page_name: page.page_name,
          valid: response.ok && !result.error,
          error: result.error ? result.error.message : null,
          result
        });
      } catch (pageError) {
        results.push({
          page_id: page.page_id,
          page_name: page.page_name,
          valid: false,
          error: pageError.message
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      results
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Test tokens error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function manageAutoReplies({ action: subAction, ...params }: {
  action: 'create' | 'update' | 'delete' | 'list';
  [key: string]: any;
}) {
  try {
    switch (subAction) {
      case 'create':
        const { error: createError } = await supabase
          .from('auto_replies')
          .insert({
            page_id: params.pageId,
            trigger_keywords: params.keywords || [],
            reply_message: params.message,
            reply_type: params.type || 'message',
            is_active: true,
            priority: params.priority || 1
          });

        if (createError) throw createError;
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Auto-reply rule created'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'list':
        const { data, error: listError } = await supabase
          .from('auto_replies')
          .select('*')
          .eq('page_id', params.pageId)
          .order('priority', { ascending: false });

        if (listError) throw listError;

        return new Response(JSON.stringify({
          success: true,
          autoReplies: data || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'update':
        const { error: updateError } = await supabase
          .from('auto_replies')
          .update({
            trigger_keywords: params.keywords,
            reply_message: params.message,
            is_active: params.isActive,
            priority: params.priority
          })
          .eq('id', params.id);

        if (updateError) throw updateError;

        return new Response(JSON.stringify({
          success: true,
          message: 'Auto-reply rule updated'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'delete':
        const { error: deleteError } = await supabase
          .from('auto_replies')
          .delete()
          .eq('id', params.id);

        if (deleteError) throw deleteError;

        return new Response(JSON.stringify({
          success: true,
          message: 'Auto-reply rule deleted'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error('Invalid auto-reply action');
    }
  } catch (error) {
    console.error('Auto-reply management error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function setupAdvancedWebhook({ pageId, accessToken }: { pageId: string; accessToken: string }) {
  try {
    console.log('🚀 Setting up advanced webhook for page:', pageId);
    
    // الحصول على جميع الحقول المتاحة للاشتراك (محدثة حسب Facebook API v19.0)
    const allFields = [
      'messages',
      'messaging_postbacks', 
      'messaging_optins',
      'messaging_referrals',
      'message_deliveries',
      'message_reads',
      'messaging_payments',
      'messaging_pre_checkouts',
      'messaging_checkout_updates',
      'messaging_account_linking',
      'messaging_policy_enforcement',
      'standby',
      'messaging_handovers',
      'messaging_customer_information',
      'feed',
      'mention',
      'name',
      'picture',
      'category',
      'description',
      'conversations',
      'feature_access_list',
      'inbox_labels',
      'videos'
    ];

    const subscribeUrl = `https://graph.facebook.com/v19.0/${pageId}/subscribed_apps`;
    console.log(`Making advanced subscription request to: ${subscribeUrl}`);
    
    const response = await fetch(subscribeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `access_token=${accessToken}&subscribed_fields=${allFields.join(',')}`
    });

    const result = await response.json();
    console.log('Advanced subscription result:', result);
    
    if (result.error) {
      console.error('Advanced subscription failed:', result.error);
      throw new Error(`Advanced webhook subscription failed: ${result.error.message}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'تم إعداد الويب هوك المتقدم بنجاح مع جميع الحقول',
      subscribedFields: allFields,
      result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Advanced webhook setup error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      pageId: pageId
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function configureWebhookFields({ pageId, accessToken }: { pageId: string; accessToken: string }) {
  try {
    // الحصول على معلومات الاشتراك الحالي
    const response = await fetch(`https://graph.facebook.com/v19.0/${pageId}/subscribed_apps?access_token=${accessToken}`);
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return new Response(JSON.stringify({
      success: true,
      currentSubscriptions: result.data,
      recommendedFields: [
        'messages', 'messaging_postbacks', 'messaging_optins', 'messaging_referrals',
        'message_deliveries', 'message_reads', 'feed', 'mention', 'name', 'picture',
        'category', 'description', 'conversations', 'feature_access_list',
        'inbox_labels', 'videos'
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Configure webhook fields error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function getWebhookSubscriptions({ pageId, accessToken }: { pageId: string; accessToken: string }) {
  try {
    console.log('🔍 Getting webhook subscriptions for page:', pageId);
    
    if (!pageId || !accessToken) {
      throw new Error('pageId and accessToken are required');
    }
    
    const url = `https://graph.facebook.com/v19.0/${pageId}/subscribed_apps?access_token=${accessToken}`;
    console.log('📡 Making request to:', url);
    
    const response = await fetch(url);
    console.log('📊 Response status:', response.status);
    
    const result = await response.json();
    console.log('📋 Response data:', JSON.stringify(result, null, 2));
    
    if (result.error) {
      console.error('❌ Facebook API error:', result.error);
      throw new Error(`Facebook API error: ${result.error.message} (Code: ${result.error.code})`);
    }
    
    console.log('✅ Subscriptions retrieved successfully');
    return new Response(JSON.stringify({
      success: true,
      subscriptions: result.data || [],
      pageId: pageId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('💥 Get webhook subscriptions error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      pageId: pageId || 'unknown'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function fixPageSubscriptions() {
  try {
    console.log('🔧 Starting page subscription fix process...');
    
    // الحصول على جميع الصفحات النشطة
    const { data: pages, error } = await supabase
      .from('facebook_pages')
      .select('page_id, access_token, page_name')
      .eq('is_active', true);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    if (!pages || pages.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'لا توجد صفحات للإصلاح',
        results: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`🔍 Found ${pages.length} pages to fix`);
    const results = [];

    for (const page of pages) {
      console.log(`🔧 Processing page: ${page.page_name} (${page.page_id})`);
      
      try {
        // التحقق من نوع التوكن أولاً
        const tokenTestUrl = `https://graph.facebook.com/v19.0/me?access_token=${page.access_token}&fields=id,name`;
        const tokenResponse = await fetch(tokenTestUrl);
        const tokenInfo = await tokenResponse.json();
        
        console.log(`Token info for ${page.page_name}:`, tokenInfo);
        
        if (tokenInfo.error) {
          results.push({
            page_id: page.page_id,
            page_name: page.page_name,
            success: false,
            error: `Token invalid: ${tokenInfo.error.message}`,
            tokenType: 'invalid'
          });
          continue;
        }

        // إلغاء الاشتراك الحالي أولاً
        console.log(`📤 Unsubscribing page ${page.page_name} first...`);
        const unsubscribeUrl = `https://graph.facebook.com/v19.0/${page.page_id}/subscribed_apps`;
        const unsubscribeResponse = await fetch(unsubscribeUrl, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `access_token=${page.access_token}`
        });

        const unsubscribeResult = await unsubscribeResponse.json();
        console.log(`Unsubscribe result for ${page.page_name}:`, unsubscribeResult);

        // إعادة الاشتراك مع الحقول الصحيحة
        console.log(`📩 Re-subscribing page ${page.page_name} with correct fields...`);
        const subscribeUrl = `https://graph.facebook.com/v19.0/${page.page_id}/subscribed_apps`;
        const subscribeResponse = await fetch(subscribeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `access_token=${page.access_token}&subscribed_fields=feed,messages,messaging_postbacks,messaging_optins,message_deliveries,message_reads`
        });

        const subscribeResult = await subscribeResponse.json();
        console.log(`Subscribe result for ${page.page_name}:`, subscribeResult);

        if (subscribeResult.error) {
          results.push({
            page_id: page.page_id,
            page_name: page.page_name,
            success: false,
            error: subscribeResult.error.message,
            tokenType: tokenInfo.id === page.page_id ? 'page' : 'user',
            unsubscribeResult,
            subscribeResult
          });
        } else {
          results.push({
            page_id: page.page_id,
            page_name: page.page_name,
            success: true,
            message: 'تم إصلاح الاشتراك بنجاح',
            tokenType: tokenInfo.id === page.page_id ? 'page' : 'user',
            unsubscribeResult,
            subscribeResult
          });
        }

      } catch (pageError) {
        console.error(`Error fixing page ${page.page_name}:`, pageError);
        results.push({
          page_id: page.page_id,
          page_name: page.page_name,
          success: false,
          error: pageError.message,
          tokenType: 'unknown'
        });
      }

      // انتظار قصير بين العمليات
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`✅ Fix complete: ${successCount} success, ${failCount} failed`);

    return new Response(JSON.stringify({
      success: true,
      message: `تم إصلاح ${successCount} صفحة، فشل في ${failCount} صفحة`,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failCount
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Fix page subscriptions error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function getConnectedPages() {
  try {
    console.log('🔍 Getting connected pages...');
    
    // تحقق من اتصال قاعدة البيانات أولاً
    console.log('Supabase URL:', supabaseUrl ? 'Available' : 'Missing');
    console.log('Supabase Key:', supabaseKey ? 'Available' : 'Missing');
    
    const { data: pages, error } = await supabase
      .from('facebook_pages')
      .select('page_id, page_name, category, picture_url, access_token, is_active, created_at, updated_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    console.log('Database query result:', { 
      pagesCount: pages?.length || 0, 
      error: error?.message || 'No error',
      hasPages: !!pages 
    });

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Database query failed: ${error.message}`);
    }

    console.log(`Found ${pages?.length || 0} connected pages`);
    
    // إذا لم توجد صفحات، أرجع فوراً
    if (!pages || pages.length === 0) {
      console.log('No pages found, returning empty result');
      return new Response(JSON.stringify({
        success: true,
        pages: [],
        total: 0,
        message: 'لا توجد صفحات متصلة'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // تحقق من حالة الويب هوك لكل صفحة
    const pagesWithStatus = [];
    console.log(`Processing ${pages.length} pages for status check...`);
    
    for (const page of pages || []) {
      console.log(`Processing page: ${page.page_name} (${page.page_id})`);
      try {
        // اختبار صحة التوكن
        console.log(`Testing token for page ${page.page_name}...`);
        const tokenResponse = await fetch(
          `https://graph.facebook.com/v19.0/${page.page_id}?access_token=${page.access_token}&fields=id,name`
        );
        const tokenResult = await tokenResponse.json();
        console.log(`Token test result for ${page.page_name}:`, { status: tokenResponse.status, hasError: !!tokenResult.error });
        
        // التحقق من حالة الاشتراك
        console.log(`Checking subscription for page ${page.page_name}...`);
        const subscriptionResponse = await fetch(
          `https://graph.facebook.com/v19.0/${page.page_id}/subscribed_apps?access_token=${page.access_token}`
        );
        const subscriptionResult = await subscriptionResponse.json();
        console.log(`Subscription check result for ${page.page_name}:`, { status: subscriptionResponse.status, dataLength: subscriptionResult.data?.length || 0 });
        
        let webhookStatus = 'unknown';
        if (tokenResult.error) {
          webhookStatus = 'error';
        } else if (subscriptionResult.data && subscriptionResult.data.length > 0) {
          webhookStatus = 'active';
        } else {
          webhookStatus = 'inactive';
        }
        
        pagesWithStatus.push({
          page_id: page.page_id,
          page_name: page.page_name,
          page_category: page.category,
          page_picture_url: page.picture_url,
          access_token: page.access_token,
          webhook_status: webhookStatus,
          created_at: page.created_at,
          last_activity: page.updated_at
        });
        
      } catch (pageError) {
        console.error(`Error checking page ${page.page_name}:`, pageError.message);
        pagesWithStatus.push({
          page_id: page.page_id,
          page_name: page.page_name,
          page_category: page.category,
          page_picture_url: page.picture_url,
          access_token: page.access_token,
          webhook_status: 'error',
          created_at: page.created_at,
          last_activity: page.updated_at
        });
      }
      
      // انتظار قصير بين الطلبات
      await new Promise(resolve => setTimeout(resolve, 200)); // تقليل الوقت إلى 200ms
    }

    console.log(`Processed ${pagesWithStatus.length} pages successfully`);

    return new Response(JSON.stringify({
      success: true,
      pages: pagesWithStatus,
      total: pagesWithStatus.length,
      message: `تم جلب ${pagesWithStatus.length} صفحة بنجاح`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Get connected pages error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function disconnectPage({ pageId }: { pageId: string }) {
  try {
    console.log(`🔌 Disconnecting page: ${pageId}`);
    
    if (!pageId) {
      throw new Error('pageId is required');
    }
    
    // الحصول على معلومات الصفحة أولاً
    const { data: pageData, error: fetchError } = await supabase
      .from('facebook_pages')
      .select('page_id, page_name, access_token')
      .eq('page_id', pageId)
      .eq('is_active', true)
      .single();

    if (fetchError) {
      console.error('Error fetching page data:', fetchError);
      throw new Error(`لا يمكن العثور على الصفحة: ${fetchError.message}`);
    }

    if (!pageData) {
      throw new Error('الصفحة غير موجودة أو غير نشطة');
    }

    // إلغاء الاشتراك في الويب هوك من فيسبوك
    try {
      const unsubscribeUrl = `https://graph.facebook.com/v19.0/${pageId}/subscribed_apps`;
      console.log(`📤 Unsubscribing from webhook: ${unsubscribeUrl}`);
      
      const unsubscribeResponse = await fetch(unsubscribeUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `access_token=${pageData.access_token}`
      });

      const unsubscribeResult = await unsubscribeResponse.json();
      console.log('Unsubscribe result:', unsubscribeResult);
      
      if (unsubscribeResult.error) {
        console.warn('Webhook unsubscription failed, but continuing with database cleanup:', unsubscribeResult.error);
      }
    } catch (webhookError) {
      console.warn('Failed to unsubscribe webhook, but continuing with database cleanup:', webhookError);
    }

    // تعطيل الصفحة في قاعدة البيانات
    const { error: updateError } = await supabase
      .from('facebook_pages')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('page_id', pageId);

    if (updateError) {
      console.error('Error updating page status:', updateError);
      throw new Error(`فشل في تحديث حالة الصفحة: ${updateError.message}`);
    }

    // حذف مفاتيح API المرتبطة إذا وجدت
    try {
      const { error: apiKeyError } = await supabase
        .from('api_keys')
        .delete()
        .eq('key_value', pageData.access_token);

      if (apiKeyError) {
        console.warn('Failed to delete API key:', apiKeyError);
      }
    } catch (apiKeyError) {
      console.warn('Error while deleting API key:', apiKeyError);
    }

    console.log(`✅ Successfully disconnected page: ${pageData.page_name} (${pageId})`);

    return new Response(JSON.stringify({
      success: true,
      message: `تم قطع الاتصال بنجاح للصفحة: ${pageData.page_name}`,
      pageId: pageId,
      pageName: pageData.page_name
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Disconnect page error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false,
      pageId: pageId || 'unknown'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function getUserPages(userAccessToken: string) {
  console.log('👤 Getting user pages with access token...');
  
  try {
    const url = `https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}&fields=id,name,category,access_token,picture`;
    console.log('📡 Making request to get user pages');
    
    const response = await fetch(url);
    console.log('📊 Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    console.log('📋 Found pages:', data.data?.length || 0);
    
    return new Response(JSON.stringify({ 
      success: true, 
      pages: data.data || []
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error getting user pages:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function setupWebhookForPages(pageIds: string[]) {
  console.log('🔧 Setting up webhook for pages:', pageIds);
  
  try {
    // جلب معلومات الصفحات من قاعدة البيانات
    const { data: pages, error: dbError } = await supabase
      .from('facebook_pages')
      .select('page_id, page_name, access_token')
      .in('page_id', pageIds)
      .eq('is_active', true);

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    if (!pages || pages.length === 0) {
      throw new Error('No pages found in database');
    }

    console.log(`📄 Found ${pages.length} pages in database`);

    const results = [];
    
    for (const page of pages) {
      try {
        console.log(`🔗 Setting up webhook for page: ${page.page_name} (${page.page_id})`);
        
        // إعداد webhook للصفحة
        const webhookUrl = `https://graph.facebook.com/v19.0/${page.page_id}/subscribed_apps`;
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `subscribed_fields=feed,comments,mention&access_token=${page.access_token}`
        });

        if (webhookResponse.ok) {
          const webhookResult = await webhookResponse.json();
          console.log(`✅ Webhook setup successful for ${page.page_name}`);
          results.push({
            pageId: page.page_id,
            pageName: page.page_name,
            success: true,
            result: webhookResult
          });
        } else {
          const errorData = await webhookResponse.json();
          console.error(`❌ Webhook setup failed for ${page.page_name}:`, errorData);
          results.push({
            pageId: page.page_id,
            pageName: page.page_name,
            success: false,
            error: errorData.error?.message || 'Unknown error'
          });
        }
      } catch (error) {
        console.error(`❌ Error setting up webhook for ${page.page_name}:`, error);
        results.push({
          pageId: page.page_id,
          pageName: page.page_name,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`🎯 Webhook setup complete: ${successCount} success, ${failureCount} failed`);

    return new Response(JSON.stringify({ 
      success: true,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error setting up webhooks:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}