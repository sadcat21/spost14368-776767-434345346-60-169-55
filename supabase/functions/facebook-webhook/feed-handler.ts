// Feed and general webhook change handlers
import { supabase, FACEBOOK_GRAPH_URL } from './config.ts';
import { processAutoReply } from './reply-handler.ts';

export async function handleGeneralFeedChange(entry: any) {
  try {
    console.log('🔄 Handling general feed change for entry:', entry.id);
    console.log('📊 Entry data:', JSON.stringify(entry, null, 2));
    
    // Get all active pages to check for new comments
    const { data: userPages, error } = await supabase
      .from('facebook_pages')
      .select('page_id, page_name, access_token')
      .eq('is_active', true);

    if (error) {
      console.error('❌ Error fetching active pages:', error);
      return;
    }

    if (!userPages || userPages.length === 0) {
      console.log('⚠️ No active pages found in database');
      return;
    }

    console.log(`✅ Found ${userPages.length} active pages to check for comments`);
    
    // Check each page for new comments when feed changes
    let totalNewComments = 0;
    for (const page of userPages) {
      console.log(`🔍 Checking page: ${page.page_name} (${page.page_id})`);
      const newComments = await fetchLatestComments(page.page_id);
      totalNewComments += newComments || 0;
    }
    
    console.log(`📊 Total new comments found: ${totalNewComments}`);

  } catch (error) {
    console.error('❌ Error handling general feed change:', error);
  }
}

export async function fetchLatestComments(pageId: string) {
  try {
    console.log('🔍 Fetching latest comments for page:', pageId);
    
    // Get page access token
    const { data: pageData, error } = await supabase
      .from('facebook_pages')
      .select('access_token, page_name')
      .eq('page_id', pageId)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !pageData) {
      console.error('❌ Page not found or not active:', pageId);
      return 0;
    }

    const accessToken = pageData.access_token;
    console.log(`✅ Checking comments for: ${pageData.page_name}`);

    // Fetch recent posts for this page (last 10 posts)
    const postsUrl = `${FACEBOOK_GRAPH_URL}/${pageId}/posts`;
    console.log('📡 Fetching recent posts...');
    
    const postsResponse = await fetch(`${postsUrl}?access_token=${accessToken}&limit=10&fields=id,created_time,message`);
    const postsData = await postsResponse.json();

    if (postsData.error) {
      console.error('❌ Error fetching posts:', postsData.error);
      return 0;
    }

    if (!postsData.data || postsData.data.length === 0) {
      console.log('📭 No posts found for this page');
      return 0;
    }

    console.log(`📋 Found ${postsData.data.length} recent posts`);

    // For each recent post, check for new comments
    let totalNewComments = 0;
    for (const post of postsData.data) {
      const newComments = await fetchPostComments(post.id, pageId, accessToken);
      totalNewComments += newComments || 0;
    }

    return totalNewComments;

  } catch (error) {
    console.error('❌ Error fetching latest comments:', error);
    return 0;
  }
}

export async function fetchPostComments(postId: string, pageId: string, accessToken: string) {
  try {
    console.log(`💬 Checking comments for post: ${postId}`);
    
    // Fetch comments for this post
    const commentsUrl = `${FACEBOOK_GRAPH_URL}/${postId}/comments`;
    const commentsResponse = await fetch(`${commentsUrl}?access_token=${accessToken}&fields=id,message,from,created_time,parent&limit=20&order=chronological`);
    const commentsData = await commentsResponse.json();

    if (commentsData.error) {
      console.error('❌ Error fetching comments:', commentsData.error);
      return 0;
    }

    if (!commentsData.data || commentsData.data.length === 0) {
      console.log(`📭 No comments found for post: ${postId}`);
      return 0;
    }

    console.log(`💬 Found ${commentsData.data.length} comments for post: ${postId}`);

    let newCommentsCount = 0;
    
    // Process each comment
    for (const comment of commentsData.data) {
      const commentData = {
        comment_id: comment.id,
        post_id: postId,
        page_id: pageId,
        commenter_id: comment.from?.id || 'unknown',
        commenter_name: comment.from?.name || 'Unknown',
        comment_text: comment.message || '',
        parent_comment_id: comment.parent?.id || null,
        is_replied: false
      };

      console.log(`📝 Processing comment: ${comment.id} from ${commentData.commenter_name}`);

      // Check if comment already exists
      const { data: existingComment } = await supabase
        .from('facebook_comments')
        .select('id')
        .eq('comment_id', comment.id)
        .maybeSingle();

      if (!existingComment) {
        // Save new comment to database
        const { error } = await supabase
          .from('facebook_comments')
          .insert(commentData);

        if (error) {
          console.error('❌ Error saving comment:', error);
        } else {
          console.log(`✅ New comment saved: ${comment.id}`);
          newCommentsCount++;
          
          // Process auto-reply for new comment
          console.log('🤖 Processing auto-reply...');
          await processAutoReply(commentData, 'comment');
        }
      } else {
        console.log(`⏭️ Comment already exists: ${comment.id}`);
      }
    }

    console.log(`📊 Post ${postId}: ${newCommentsCount} new comments processed`);
    return newCommentsCount;

  } catch (error) {
    console.error('❌ Error fetching post comments:', error);
    return 0;
  }
}