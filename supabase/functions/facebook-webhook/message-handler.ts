// Message processing logic
import { supabase } from './config.ts';
import { processAutoReply } from './reply-handler.ts';
import { resolvePostIdForComment } from './post-utils.ts';

export async function processMessagingEvent(event: any) {
  console.log('Processing messaging event:', event);

  // Handle incoming messages
  if (event.message && !event.message.is_echo) {
    const messageData = {
      message_id: event.message.mid,
      page_id: event.recipient.id,
      sender_id: event.sender.id,
      message_text: event.message.text || '',
      message_type: 'text',
      is_read: false,
      replied: false
    };

    // Save message to database
    const { error } = await supabase
      .from('facebook_messages')
      .upsert(messageData, { onConflict: 'message_id' });

    if (error) {
      console.error('Error saving message:', error);
    } else {
      console.log('Message saved successfully');
      // Process auto-reply
      await processAutoReply(messageData, 'message');
    }
  }
}

export async function processFeedEvent(feedData: any, pageId: string) {
  console.log('Processing feed event:', JSON.stringify(feedData, null, 2));

  // Handle comments - check for both formats
  if (feedData.item === 'comment') {
    // Extract data from webhook - supporting both formats
    const commentData = {
      comment_id: feedData.comment_id,
      post_id: feedData.post_id,
      page_id: pageId,
      commenter_id: feedData.sender_id || feedData.from?.id || 'unknown',
      commenter_name: feedData.from?.name || 'Unknown',
      comment_text: feedData.message || '',
      parent_comment_id: feedData.parent_id || null,
      is_replied: false,
      webhook_data: feedData // Store the full webhook data for reference
    };

    console.log('📝 Comment data extracted:', JSON.stringify(commentData, null, 2));

    // Ensure we have post_id; resolve from comment if missing
    if ((!commentData.post_id || commentData.post_id === '') && commentData.comment_id) {
      const resolved = await resolvePostIdForComment(commentData.comment_id, pageId);
      if (resolved) {
        commentData.post_id = resolved;
        console.log('🔗 post_id resolved for comment:', resolved);
      } else {
        console.warn('⚠️ post_id missing and could not be resolved for comment:', commentData.comment_id);
      }
    }

    // Save comment to database
    const { error } = await supabase
      .from('facebook_comments')
      .upsert(commentData, { onConflict: 'comment_id' });

    if (error) {
      console.error('Error saving comment:', error);
    } else {
      console.log('Comment saved successfully');
      // Process auto-reply immediately without delay
      console.log('🚀 Processing auto-reply immediately for comment:', commentData.comment_id);
      await processAutoReply(commentData, 'comment');
    }
  } else {
    console.log('❌ Not a comment event or missing required fields:', JSON.stringify(feedData, null, 2));
  }
}
