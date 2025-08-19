// Database operations for logging and event management
import { supabase } from './config.ts';

// Log page events
export async function logPageEvent(eventData: any) {
  try {
    const { error } = await supabase
      .from('page_events')
      .insert({
        event_type: eventData.event_type,
        page_id: eventData.page_id,
        post_id: eventData.post_id,
        comment_id: eventData.comment_id,
        message_id: eventData.message_id,
        user_id: eventData.user_id,
        user_name: eventData.user_name,
        content: eventData.content,
        status: eventData.status,
        auto_replied: false,
        metadata: eventData.metadata || {}
      });

    if (error) {
      console.error('❌ Error logging page event:', error);
    } else {
      console.log('✅ Page event logged successfully');
    }
  } catch (error) {
    console.error('❌ Error logging page event:', error);
  }
}

// Update page event status
export async function updatePageEventStatus(data: any, status: string, responseContent?: string) {
  try {
    const identifier = data.comment_id || data.message_id;
    if (!identifier) return;

    let query = supabase
      .from('page_events')
      .update({
        status,
        response_content: responseContent,
        auto_replied: status === 'success'
      });

    if (data.comment_id) {
      query = query.eq('comment_id', data.comment_id);
    }
    if (data.message_id) {
      query = query.eq('message_id', data.message_id);
    }

    const { error } = await query;

    if (error) {
      console.error('❌ Error updating page event status:', error);
    }
  } catch (error) {
    console.error('❌ Error updating page event status:', error);
  }
}

// Save webhook logs
export async function saveWebhookLog(webhookData: any, processed: boolean, errorMessage?: string) {
  try {
    const { error } = await supabase
      .from('webhook_logs')
      .insert({
        webhook_type: 'facebook',
        page_id: webhookData.object === 'page' ? webhookData.entry?.[0]?.id : null,
        event_data: webhookData,
        processed,
        error_message: errorMessage
      });

    if (error) {
      console.error('❌ Error saving webhook log:', error);
    } else {
      console.log('✅ Webhook log saved successfully');
    }
  } catch (error) {
    console.error('❌ Error saving webhook log:', error);
  }
}