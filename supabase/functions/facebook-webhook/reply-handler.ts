// Auto-reply functionality separated from message handler
import { supabase, FACEBOOK_GRAPH_URL } from './config.ts';
import { generateIntelligentReply } from './ai-generator.ts';
import { resolveImagesFromTextLinks } from './image-utils.ts';
import { logPageEvent, updatePageEventStatus } from './database.ts';
import { resolvePostIdForComment, likeComment, fetchPostDetails } from './post-utils.ts';

export async function processAutoReply(data: any, type: 'message' | 'comment') {
  try {
    console.log('🤖 Processing intelligent auto-reply for:', type, data);
    
    const messageText = type === 'message' ? data.message_text : data.comment_text;
    
    if (!messageText || messageText.trim().length === 0) {
      console.log('❌ Empty message text, skipping auto-reply');
      return;
    }

    // Enrich metadata (page_name and comment permalink) then log event
    let metadata: any = {};
    try {
      const { data: pInfo } = await supabase
        .from('facebook_pages')
        .select('page_name, access_token')
        .eq('page_id', data.page_id)
        .eq('is_active', true)
        .single();
      if (pInfo?.page_name) metadata.page_name = pInfo.page_name;
      if (type === 'comment' && data.comment_id && pInfo?.access_token) {
        const linkRes = await fetch(`${FACEBOOK_GRAPH_URL}/${data.comment_id}?fields=permalink_url&access_token=${pInfo.access_token}`);
        const linkJson = await linkRes.json();
        if (!linkJson?.error && linkJson?.permalink_url) {
          metadata.comment_permalink = linkJson.permalink_url;
        }
      }
    } catch (e) {
      console.warn('⚠️ Failed to enrich event metadata:', e);
    }

    await logPageEvent({
      event_type: type,
      page_id: data.page_id,
      post_id: data.post_id,
      comment_id: type === 'comment' ? data.comment_id : null,
      message_id: type === 'message' ? data.message_id : null,
      user_id: type === 'message' ? data.sender_id : data.commenter_id,
      user_name: type === 'message' ? data.sender_name : data.commenter_name,
      content: messageText,
      status: 'pending',
      metadata
    });

    // Generate intelligent reply using AI with timeout and fallback
    const aiReply = await Promise.race([
      generateIntelligentReply(data, type),
      new Promise<string | null>((resolve) => setTimeout(() => resolve(null), 8000)),
    ]) as string | null;

    let finalReply = aiReply;

    if (!finalReply) {
      console.log('ℹ️ AI reply unavailable, attempting keyword-based fallback...');
      try {
        finalReply = await getFallbackAutoReply(data, type);
      } catch (e) {
        console.warn('⚠️ Fallback generation failed:', e);
      }
    }

    if (finalReply) {
      console.log('🎯 Selected reply:', finalReply);
      
      // Send auto-reply
      await sendAutoReply(data, finalReply, type);
      
      // Update the record as replied
      const updateTable = type === 'message' ? 'facebook_messages' : 'facebook_comments';
      const updateColumn = type === 'message' ? 'message_id' : 'comment_id';
      const updatePayload = type === 'message'
        ? { replied: true, reply_text: finalReply }
        : { is_replied: true, reply_text: finalReply };
      
      await supabase
        .from(updateTable)
        .update(updatePayload)
        .eq(updateColumn, type === 'message' ? data.message_id : data.comment_id);

      // Update event status
      await updatePageEventStatus(data, 'success', finalReply);
      
      console.log('✅ Auto-reply sent successfully');
    } else {
      console.log('❌ Failed to generate any reply (AI and fallback)');
      await updatePageEventStatus(data, 'failed', 'تعذّر توليد رد تلقائي حالياً');
    }
  } catch (error) {
    console.error('❌ Error processing auto-reply:', error);
    await updatePageEventStatus(data, 'failed', error.message);
  }
}

export async function sendAutoReply(data: any, replyMessage: string, type: 'message' | 'comment') {
  try {
    // Get page access token
    const { data: pageData, error } = await supabase
      .from('facebook_pages')
      .select('access_token')
      .eq('page_id', data.page_id)
      .eq('is_active', true)
      .single();

    if (error || !pageData) {
      console.error('Page access token not found:', error);
      return;
    }

    const accessToken = pageData.access_token;

    if (type === 'message') {
      await sendMessageReply(data, replyMessage, accessToken);
    } else if (type === 'comment') {
      await sendCommentReply(data, replyMessage, accessToken);
    }
  } catch (error) {
    console.error('Error sending auto-reply:', error);
    throw error;
  }
}

async function getFallbackAutoReply(data: any, type: 'message' | 'comment'): Promise<string | null> {
  try {
    const text = (type === 'message' ? data.message_text : data.comment_text) || '';
    const { data: rules, error } = await supabase
      .from('auto_replies')
      .select('reply_message, trigger_keywords, priority')
      .eq('page_id', data.page_id)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) {
      console.warn('⚠️ Could not fetch auto_replies:', error);
      return null;
    }

    if (rules && rules.length) {
      const lowered = text.toLowerCase();
      for (const r of rules as any[]) {
        const keywords: string[] = Array.isArray(r.trigger_keywords) ? r.trigger_keywords : [];
        if (keywords.some((kw) => kw && lowered.includes(String(kw).toLowerCase()))) {
          console.log('✅ Matched fallback rule by keyword');
          return r.reply_message as string;
        }
      }
    }

    // Generic default fallback (Arabic polite response)
    if (text && text.length > 0) {
      return 'شكرًا لتواصلك معنا! سنعود إليك بتفاصيل أكثر قريبًا. لمزيد من المعلومات أو الحجز يُمكنك مراسلتنا على الخاص 💬🙏';
    }

    return null;
  } catch (e) {
    console.warn('⚠️ getFallbackAutoReply error:', e);
    return null;
  }
}

async function sendMessageReply(data: any, replyMessage: string, accessToken: string) {
  const messageUrl = `${FACEBOOK_GRAPH_URL}/me/messages`;
  const messageBody = {
    recipient: { id: data.sender_id },
    message: { text: replyMessage }
  };

  const response = await fetch(`${messageUrl}?access_token=${accessToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messageBody)
  });

  const result = await response.json();
  if (result.error) {
    console.error('Error sending message reply:', result.error);
    throw new Error(`Facebook API Error: ${result.error.message}`);
  } else {
    console.log('Message reply sent successfully');
  }
}

async function sendCommentReply(data: any, replyMessage: string, accessToken: string) {
  const commentUrl = `${FACEBOOK_GRAPH_URL}/${data.comment_id}/comments`;
  
  let postImageUrl: string | undefined;
  
  try {
    // Resolve post_id if missing
    if (!data.post_id && data.comment_id) {
      const resolved = await resolvePostIdForComment(data.comment_id, data.page_id);
      if (resolved) {
        data.post_id = resolved;
        console.log('✅ Post ID resolved:', resolved);
      }
    }

    if (data.post_id) {
      const details = await fetchPostDetails(data.post_id, data.page_id);
      if (details?.images?.length) {
        postImageUrl = details.images[0];
        console.log('🖼️ Using image from fetchPostDetails:', postImageUrl);
      }
    }

    if (!postImageUrl) {
      const linkImages = await resolveImagesFromTextLinks(data.comment_text || '', data.page_id);
      if (linkImages.length > 0) {
        postImageUrl = linkImages[0];
        console.log('🖼️ Using image from text links:', postImageUrl);
      }
    }
  } catch (e) {
    console.error('❌ Error fetching post image:', e);
  }

  // Send comment reply with immediate processing
  let hadAttachment = false;
  const buildBody = (withAttachment: boolean) => {
    const sp = new URLSearchParams();
    sp.set('message', replyMessage);
    if (withAttachment && postImageUrl && postImageUrl.length > 10) {
      sp.set('attachment_url', postImageUrl);
      hadAttachment = true;
    }
    return sp;
  };

  // Always try to include image if available (validated above)
  if (postImageUrl && postImageUrl.length > 10) {
    try {
      const imageCheck = await fetch(postImageUrl, { method: 'HEAD' });
      if (!imageCheck.ok) {
        console.log('⚠️ Image URL validation failed, will send text-only');
        hadAttachment = false;
      }
    } catch (imgError) {
      console.log('⚠️ Image validation error, will send text-only:', imgError);
      hadAttachment = false;
    }
  }

  console.log('📤 Sending comment reply', hadAttachment ? '(with attachment)' : '(text only)');

  let response = await fetch(`${commentUrl}?access_token=${accessToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: buildBody(hadAttachment)
  });

  let result = await response.json();
  
  // Log detailed response for debugging
  console.log('📋 Facebook API Response Status:', response.status);
  console.log('📋 Facebook API Response:', JSON.stringify(result, null, 2));
  
  if (result.error) {
    console.error('❌ Error sending comment reply:', result.error);
    console.error('❌ Error Code:', result.error.code);
    console.error('❌ Error Type:', result.error.type);
    console.error('❌ Error Message:', result.error.message);
    
    // Log additional error details
    if (result.error.error_subcode) {
      console.error('❌ Error Subcode:', result.error.error_subcode);
    }
    if (result.error.fbtrace_id) {
      console.error('❌ FB Trace ID:', result.error.fbtrace_id);
    }

    // If image attachment failed or any error occurred, try text-only
    if (hadAttachment) {
      console.log('🔄 Retrying without image attachment...');

      response = await fetch(`${commentUrl}?access_token=${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: buildBody(false)
      });

      result = await response.json();
      console.log('📋 Retry Response Status:', response.status);
      console.log('📋 Retry Response:', JSON.stringify(result, null, 2));
      
      if (result.error) {
        console.error('❌ Retry also failed:', result.error);
        throw new Error(`Facebook API Error: ${result.error.message} (Code: ${result.error.code})`);
      } else {
        console.log('✅ Comment reply sent successfully (text only after retry)');
        console.log('✅ Reply ID:', result.id);
      }
    } else {
      throw new Error(`Facebook API Error: ${result.error.message} (Code: ${result.error.code})`);
    }
  } else {
    const status = hadAttachment ? 'with image attachment' : 'text only';
    console.log(`✅ Comment reply sent successfully (${status})`);
    console.log('✅ Reply ID:', result.id);
    console.log('✅ Reply URL:', `https://facebook.com/${result.id}`);
  }

  // Like the original comment after replying
  await likeComment(data.comment_id, accessToken);
}