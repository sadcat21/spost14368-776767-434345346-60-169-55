// Reprocessing unprocessed webhook events
import { supabase, corsHeaders } from './config.ts';

// Main entry processor that routes to specific handlers
export async function processEntry(entry: any) {
  console.log('Processing entry:', JSON.stringify(entry, null, 2));

  // Process messaging events
  if (entry.messaging) {
    const { processMessagingEvent } = await import('./message-handler.ts');
    for (const event of entry.messaging) {
      await processMessagingEvent(event);
    }
  }

  // Process feed events (comments) - new format with detailed data
  if (entry.changes) {
    const { processFeedEvent } = await import('./message-handler.ts');
    for (const change of entry.changes) {
      if (change.field === 'feed' && change.value) {
        await processFeedEvent(change.value, entry.id);
      }
    }
  }

  // Handle general feed changes (when Facebook sends minimal data)
  // This happens when object is "user" with changed_fields
  if (entry.changed_fields && entry.changed_fields.includes('feed')) {
    console.log('✅ General feed change detected for entry:', entry.id);
    console.log('Changed fields:', entry.changed_fields);
    
    // Try to find the corresponding page ID and fetch comments
    const { handleGeneralFeedChange } = await import('./feed-handler.ts');
    await handleGeneralFeedChange(entry);
  } else {
    console.log('❌ No changed_fields found or feed not in changed_fields');
    console.log('Entry structure:', JSON.stringify(entry, null, 2));
  }
}

// Page entry processor (wrapper)
export async function processPageEntry(entry: any) {
  console.log('🔄 Processing page entry:', entry.id);
  await processEntry(entry);
}

// User entry processor (wrapper)
export async function processUserEntry(entry: any) {
  console.log('🔄 Processing user entry:', entry.id);
  console.log('📋 User entry details:', JSON.stringify(entry, null, 2));
  
  // تسجيل الحدث للمراجعة
  console.log('⚠️ Received user webhook - this should be page webhook');
  console.log('🔍 Entry ID:', entry.id);
  console.log('🔍 Changed fields:', entry.changed_fields);
  
  // معالجة التغييرات في الخلاصة
  if (entry.changed_fields && entry.changed_fields.includes('feed')) {
    console.log('📢 Feed change detected in user webhook');
    const { handleGeneralFeedChange } = await import('./feed-handler.ts');
    await handleGeneralFeedChange(entry);
  }
}

// إعادة معالجة الأحداث غير المعالجة
export async function reprocessUnprocessedEvents() {
  try {
    console.log('🔄 Reprocessing unprocessed events...');
    
    // جلب الأحداث غير المعالجة
    const { data: unprocessedEvents, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('webhook_type', 'facebook')
      .eq('processed', false)
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) {
      console.error('❌ Error fetching unprocessed events:', error);
      throw error;
    }

    if (!unprocessedEvents || unprocessedEvents.length === 0) {
      console.log('✅ No unprocessed events found');
      return new Response(JSON.stringify({
        success: true,
        processedCount: 0,
        message: 'لا توجد أحداث غير معالجة'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📊 Found ${unprocessedEvents.length} unprocessed events`);
    let processedCount = 0;

    for (const event of unprocessedEvents) {
      try {
        console.log(`🔄 Reprocessing event: ${event.id}`);
        
        const eventData = event.event_data;
        if (eventData && eventData.entry) {
          for (const entry of eventData.entry) {
            if (eventData.object === 'page') {
              await processPageEntry(entry);
            } else if (eventData.object === 'user') {
              await processUserEntry(entry);
            }
          }
        }

        // تحديث حالة المعالجة
        await supabase
          .from('webhook_logs')
          .update({ processed: true })
          .eq('id', event.id);
        
        processedCount++;
        console.log(`✅ Successfully reprocessed event: ${event.id}`);
        
      } catch (eventError) {
        console.error(`❌ Error reprocessing event ${event.id}:`, eventError);
        
        // تحديث رسالة الخطأ
        await supabase
          .from('webhook_logs')
          .update({ 
            error_message: eventError.message,
            processed: false 
          })
          .eq('id', event.id);
      }
    }

    console.log(`✅ Reprocessing complete: ${processedCount}/${unprocessedEvents.length} events processed`);

    return new Response(JSON.stringify({
      success: true,
      processedCount,
      totalEvents: unprocessedEvents.length,
      message: `تم إعادة معالجة ${processedCount} من أصل ${unprocessedEvents.length} حدث`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in reprocessUnprocessedEvents:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}