// Facebook post and comment utilities
import { supabase } from './config.ts';

// Fetch post details including content and images with enhanced image discovery
export async function fetchPostDetails(postId: string, pageId: string) {
  try {
    const { data: pageData, error } = await supabase
      .from('facebook_pages')
      .select('access_token')
      .eq('page_id', pageId)
      .eq('is_active', true)
      .single();

    if (error || !pageData) {
      console.error('❌ Page access token not found:', error);
      return { content: '', images: [] };
    }

    const accessToken = pageData.access_token;
    
    // Enhanced fields to get all possible image sources
    const url = `https://graph.facebook.com/v19.0/${postId}?fields=id,message,full_picture,object_id,type,attachments{media,type,url,subattachments{media,type,url}},photos.limit(10){images,source},images,source&access_token=${accessToken}`;
    
    console.log('🔍 Fetching post details with enhanced image discovery');
    const response = await fetch(url);
    const postData = await response.json();
    
    if (postData.error) {
      console.error('❌ Error fetching post details:', postData.error);
      return { content: '', images: [] };
    }

    const content = postData.message || '';
    const images = [];
    
    // 1. Add main post image if available
    if (postData.full_picture) {
      images.push(postData.full_picture);
      console.log('📷 Found full_picture:', postData.full_picture);
    }
    
    // 2. Check attachments for images (including albums)
    if (postData.attachments?.data) {
      for (const attachment of postData.attachments.data) {
        // Consider any attachment with an image, not only type 'photo'
        if (attachment.media?.image?.src) {
          images.push(attachment.media.image.src);
          console.log('📷 Found attachment image (type: ' + (attachment.type || 'unknown') + '):', attachment.media.image.src);
        }
        
        // Check subattachments (for albums)
        if (attachment.subattachments?.data) {
          for (const subAttachment of attachment.subattachments.data) {
            if (subAttachment.media?.image?.src) {
              images.push(subAttachment.media.image.src);
              console.log('📷 Found subattachment image:', subAttachment.media.image.src);
            }
          }
        }
      }
    }
    
    // 3. Check photos field (alternative source)
    if (postData.photos?.data) {
      for (const photo of postData.photos.data) {
        if (photo.source) {
          images.push(photo.source);
          console.log('📷 Found photo source:', photo.source);
        } else if (photo.images && photo.images.length > 0) {
          // Use the first/highest quality image
          images.push(photo.images[0].source);
          console.log('📷 Found photo from images array:', photo.images[0].source);
        }
      }
    }
    
    // Remove duplicates and filter out invalid URLs
    let uniqueImages = [...new Set(images)].filter(img => img && img.startsWith('http'));
    
    // Fallback: if no images found but object_id exists (e.g., photo node), fetch its images
    if (uniqueImages.length === 0 && postData.object_id) {
      try {
        const altUrl = `https://graph.facebook.com/v19.0/${postData.object_id}?fields=full_picture,images,source&access_token=${accessToken}`;
        console.log('🔁 Trying fallback fetch for object_id:', postData.object_id);
        const altRes = await fetch(altUrl);
        const altData = await altRes.json();
        if (!altData.error) {
          if (altData.full_picture) images.push(altData.full_picture);
          if (altData.source) images.push(altData.source);
          if (Array.isArray(altData.images) && altData.images.length > 0) {
            images.push(altData.images[0].source);
          }
          uniqueImages = [...new Set(images)].filter(img => img && img.startsWith('http'));
        } else {
          console.warn('⚠️ Fallback fetch returned error:', altData.error);
        }
      } catch (fbErr) {
        console.warn('⚠️ Fallback fetch failed:', fbErr);
      }
    }

    // Extra fallback: dedicated attachments endpoint sometimes returns images when inline fields don't
    if (uniqueImages.length === 0) {
      try {
        const attachUrl = `https://graph.facebook.com/v19.0/${postId}/attachments?fields=media,subattachments,media_type,description,target&access_token=${accessToken}`;
        console.log('🔁 Trying attachments endpoint for images');
        const attachRes = await fetch(attachUrl);
        const attachData = await attachRes.json();
        if (!attachData.error && Array.isArray(attachData.data)) {
          for (const att of attachData.data) {
            if (att.media?.image?.src) {
              images.push(att.media.image.src);
            }
            if (att.subattachments?.data) {
              for (const sub of att.subattachments.data) {
                if (sub.media?.image?.src) {
                  images.push(sub.media.image.src);
                }
              }
            }
          }
          uniqueImages = [...new Set(images)].filter((u) => u && u.startsWith('http'));
        } else if (attachData.error) {
          console.warn('⚠️ Attachments endpoint error:', attachData.error);
        }
      } catch (e) {
        console.warn('⚠️ Failed fetching attachments endpoint:', e);
      }
    }
    
    console.log(`✅ Post details fetched: content=${!!content}, images=${uniqueImages.length}`);
    console.log('🖼️ Found images:', uniqueImages);
    
    return { 
      content, 
      images: uniqueImages,
      // Keep imageUrl for backward compatibility
      imageUrl: uniqueImages.length > 0 ? uniqueImages[0] : ''
    };
    
  } catch (error) {
    console.error('❌ Error fetching post details:', error);
    return { content: '', images: [] };
  }
}

// Resolve post ID from a comment ID
export async function resolvePostIdForComment(commentId: string, pageId: string) {
  try {
    const { data: pageData, error } = await supabase
      .from('facebook_pages')
      .select('access_token')
      .eq('page_id', pageId)
      .eq('is_active', true)
      .single();

    if (error || !pageData) {
      console.error('❌ Page access token not found while resolving postId:', error);
      return null;
    }

    const accessToken = pageData.access_token;
    const url = `https://graph.facebook.com/v19.0/${commentId}?fields=object,permalink_url,parent&access_token=${accessToken}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error('❌ Error resolving postId for comment:', data.error);
      return null;
    }

    if (data.object?.id) {
      console.log('🔗 Resolved post id via object.id:', data.object.id);
      return data.object.id;
    }

    if (data.permalink_url) {
      const match = data.permalink_url.match(/\/posts\/(\d+)/);
      if (match) {
        const postOnlyId = match[1];
        const combined = `${pageId}_${postOnlyId}`;
        console.log('🔗 Resolved post id via permalink:', combined);
        return combined;
      }
    }

    console.warn('⚠️ Could not resolve post id for comment:', commentId);
    return null;
  } catch (err) {
    console.error('❌ Exception resolving postId for comment:', err);
    return null;
  }
}

// Like a comment after replying
export async function likeComment(commentId: string, accessToken: string) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${commentId}/likes`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: accessToken
        })
      }
    );

    const result = await response.json();
    if (result.error) {
      console.error('❌ Error liking comment:', result.error);
    } else {
      console.log('✅ Comment liked successfully');
    }
  } catch (error) {
    console.error('❌ Error liking comment:', error);
  }
}
