// Image processing and Facebook photo utilities
import { supabase } from './config.ts';

// Extract Facebook photo IDs (fbid) from arbitrary text/links
export function extractFacebookPhotoIds(text: string): string[] {
  const ids = new Set<string>();
  if (!text) return [];
  
  // Match fbid=123456...
  const fbidRegex = /[?&]fbid=(\d+)/gi;
  let match;
  while ((match = fbidRegex.exec(text)) !== null) {
    ids.add(match[1]);
  }
  
  // Also match urls like .../photos/<album or page>/<photoId>/...
  const pathIdRegex = /\/photos\/[^\/]+\/(\d+)/gi;
  while ((match = pathIdRegex.exec(text)) !== null) {
    ids.add(match[1]);
  }
  
  return Array.from(ids);
}

// Fetch direct image URLs for given photo IDs using the page access token
export async function fetchImagesForPhotoIds(photoIds: string[], pageId: string): Promise<string[]> {
  if (!photoIds || photoIds.length === 0) return [];
  
  try {
    const { data: pageData, error } = await supabase
      .from('facebook_pages')
      .select('access_token')
      .eq('page_id', pageId)
      .eq('is_active', true)
      .single();

    if (error || !pageData) {
      console.warn('⚠️ Cannot fetch photo images: missing page access token');
      return [];
    }
    
    const accessToken = pageData.access_token;

    const requests = photoIds.map(async (pid) => {
      try {
        const url = `https://graph.facebook.com/v19.0/${pid}?fields=full_picture,images,source&access_token=${accessToken}`;
        const res = await fetch(url);
        const json = await res.json();
        
        if (json?.error) {
          console.warn('⚠️ Photo fetch error:', json.error);
          return [] as string[];
        }
        
        const urls: string[] = [];
        if (json.full_picture) urls.push(json.full_picture);
        if (json.source) urls.push(json.source);
        if (Array.isArray(json.images) && json.images.length > 0) {
          urls.push(json.images[0].source);
        }
        
        return urls.filter(u => typeof u === 'string' && u.startsWith('http'));
      } catch (e) {
        console.warn('⚠️ Photo fetch failed:', e);
        return [] as string[];
      }
    });

    const results = await Promise.all(requests);
    const flat = results.flat();
    return Array.from(new Set(flat));
  } catch (e) {
    console.error('❌ Error in fetchImagesForPhotoIds:', e);
    return [];
  }
}

// Resolve image URLs directly from any Facebook photo links in the text
export async function resolveImagesFromTextLinks(text: string, pageId: string): Promise<string[]> {
  try {
    const photoIds = extractFacebookPhotoIds(text);
    if (photoIds.length === 0) return [];
    
    console.log('🔎 Extracted Facebook photo IDs from text:', photoIds);
    const linkImages = await fetchImagesForPhotoIds(photoIds, pageId);
    console.log('🧩 Images resolved from links:', linkImages);
    
    return linkImages;
  } catch (e) {
    console.warn('⚠️ Failed resolving images from text links:', e);
    return [];
  }
}