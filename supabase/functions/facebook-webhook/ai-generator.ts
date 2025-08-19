// AI-powered reply generation with image analysis
import { GEMINI_API_KEY, GEMINI_API_URL } from './config.ts';
import { fetchPostDetails, resolvePostIdForComment } from './post-utils.ts';
import { resolveImagesFromTextLinks } from './image-utils.ts';
import { generateSmartHashtags, generateContextHashtags } from './hashtag-generator.ts';

// Enhanced AI-powered reply generation with image analysis
export async function generateIntelligentReply(data: any, type: 'message' | 'comment') {
  try {
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not configured in Supabase secrets');
      return null;
    }

    const messageText = type === 'message' ? data.message_text : data.comment_text;
    
    // Resolve post id from comment if needed
    if (!data.post_id && type === 'comment' && data.comment_id) {
      const resolved = await resolvePostIdForComment(data.comment_id, data.page_id);
      if (resolved) {
        data.post_id = resolved;
        console.log('🔗 Resolved post_id inside AI generator:', resolved);
      }
    }
    
    // Get post content and images if available
    let postContent = '';
    let availableImages: string[] = [];
    
    if (data.post_id) {
      const postData = await fetchPostDetails(data.post_id, data.page_id);
      postContent = postData.content || '';
      availableImages = postData.images || [];
    }
    
    // Additionally, resolve any Facebook photo links in the user's text
    try {
      const linkImages = await resolveImagesFromTextLinks(messageText, data.page_id);
      if (linkImages.length > 0) {
        const set = new Set([...(availableImages || []), ...linkImages]);
        availableImages = Array.from(set);
      }
    } catch (_) {}

    console.log(`📊 Post analysis: content=${!!postContent}, images=${availableImages.length}`);
    
    // تحديد ما إذا كان السؤال متعلق بالصورة
    const imageRelatedKeywords = [
      'صورة', 'صوره', 'الصورة', 'في الصورة', 'بالصورة',
      'لون', 'ألوان', 'اللون', 'الألوان',
      'مكتوب', 'نص', 'كلمة', 'كلمات', 'عبارة',
      'شكل', 'أشكال', 'يظهر', 'موجود', 'أرى', 'ترى',
      'ماذا', 'وش', 'ايش', 'شو', 'أيه',
      'اقرأ', 'اقرا', 'قراءة'
    ];
    
    const isImageQuestion = imageRelatedKeywords.some(keyword => 
      messageText.toLowerCase().includes(keyword)
    );

    console.log(`🔍 Question analysis: isImageQuestion=${isImageQuestion}, availableImages=${availableImages.length}`);

    // Create enhanced prompt based on question type
    let prompt = '';
    let hasImageToAnalyze = false;

    if (isImageQuestion && availableImages.length > 0) {
      // سؤال متعلق بالصورة والصورة متوفرة
      hasImageToAnalyze = true;
      prompt = `أنت مساعد ذكي مرح ومتخصص في تحليل الصور والرد على الأسئلة المتعلقة بها.

المستخدم يسأل عن الصورة المرفقة:
"${messageText}"

إرشادات مهمة:
- حلل الصورة المرفقة بدقة واكتب وصف مفصل وواضح
- إذا سأل عن نص في الصورة، اقرأه بوضوح ودقة
- إذا سأل عن الألوان، حددها بدقة واذكر تناسقها
- إذا سأل عن العناصر الموجودة، وصفها بالتفصيل الممتع
- اكتب بأسلوب ودود وحيوي مع إضافة ايموجيهات مناسبة 😊🎨✨
- كن مختصراً ومفيداً (حوالي 60-100 كلمة)
- أضف ايموجيهات تعبر عن المحتوى والمشاعر 🌟💫🎯
- أضف 2-3 هاشتاغات مناسبة في نهاية الرد

قدم إجابة دقيقة ومرحة عن الصورة مع ايموجيهات وهاشتاغات:`;

    } else if (isImageQuestion && availableImages.length === 0) {
      // سؤال متعلق بالصورة لكن لا توجد صورة
      prompt = `المستخدم يسأل عن صورة لكن لا توجد صورة مرفقة بالمنشور.

سؤال المستخدم:
"${messageText}"

رد بأدب وحيوية أنه لا توجد صورة في المنشور وأنك تحتاج لصورة للإجابة على سؤاله.
أضف ايموجيهات مناسبة 😅📸🔍 وهاشتاغات مثل #استفسار #مساعدة #تفاعل`;

    } else {
      // سؤال عادي غير متعلق بالصورة
      prompt = `أنت مساعد ذكي ومرح متخصص في الرد على تعليقات ورسائل فيسبوك.

محتوى المنشور:
${postContent || 'محتوى المنشور غير متاح'}

${type === 'comment' ? 'تعليق' : 'رسالة'} المستخدم:
"${messageText}"

إرشادات مهمة:
- ركز على محتوى المنشور النصي
- اكتب بأسلوب ودود وحيوي مع ايموجيهات مناسبة 😊✨🌟
- كن مختصراً ومفيداً (حوالي 50-80 كلمة)
- إذا لم تجد المعلومة المطلوبة، اطلب التواصل المباشر بأدب مع ايموجيهات 📞💬
- أضف ايموجيهات تعبر عن المشاعر والمحتوى حسب السياق
- أضف 2-3 هاشتاغات مناسبة في نهاية الرد
- استخدم ايموجيهات مثل: 😊🌟✨💙🙏👍🎯📞💬🔥❤️

قدم رداً حيوياً ومرحاً مع ايموجيهات وهاشتاغات:`;

    }

    const requestBody: any = {
      contents: [{
        parts: [
          {
            text: prompt
          }
        ]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 300,
      }
    };

    // Add first available image to request if it's an image question and images are available
    if (hasImageToAnalyze && availableImages.length > 0) {
      try {
        console.log(`🖼️ Adding image for analysis: ${availableImages[0]}`);
        const imageResponse = await fetch(availableImages[0]);
        if (imageResponse.ok) {
          // Detect mime type from headers or infer from URL
          let mimeType = imageResponse.headers.get('content-type') || '';
          if (!mimeType.startsWith('image/')) {
            const urlLower = availableImages[0].toLowerCase();
            if (urlLower.endsWith('.png')) mimeType = 'image/png';
            else if (urlLower.endsWith('.webp')) mimeType = 'image/webp';
            else if (urlLower.endsWith('.gif')) mimeType = 'image/gif';
            else mimeType = 'image/jpeg';
          }

          const imageBuffer = await imageResponse.arrayBuffer();
          const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

          requestBody.contents[0].parts.push({
            inlineData: {
              mimeType,
              data: base64Image,
            }
          });

          console.log(`✅ Added image to Gemini request for analysis (mime: ${mimeType}, size: ${imageBuffer.byteLength} bytes)`);
        } else {
          console.warn('⚠️ Failed to fetch image, status:', imageResponse.status);
        }
      } catch (imageError) {
        console.warn('⚠️ Failed to fetch image for analysis:', imageError);
      }
    }

    try {
      const response = await fetch(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API error:', response.status, errorText);
        return null;
      }

      const result = await response.json();
      if (result.candidates && result.candidates[0] && result.candidates[0].content) {
        let generatedReply = result.candidates[0].content.parts[0].text.trim();
        
        console.log('🤖 Raw AI reply before hashtags:', generatedReply);
        console.log('🤖 Message text for hashtags:', messageText);
        console.log('🤖 Post content for hashtags:', postContent);
        
        // إضافة هاشتاغات ذكية دائماً
        console.log('📝 Adding smart hashtags to reply...');
        const smartHashtags = generateSmartHashtags(messageText, type, postContent);
        const contextHashtags = postContent ? generateContextHashtags(postContent) : [];
        const allHashtags = [...new Set([...smartHashtags, ...contextHashtags])].slice(0, 3);
        
        console.log('🏷️ Smart hashtags generated:', smartHashtags);
        console.log('🏷️ Context hashtags generated:', contextHashtags);
        console.log('🏷️ All hashtags combined:', allHashtags);
        
        if (allHashtags.length > 0) {
          // إزالة أي هاشتاغات موجودة مسبقاً من الرد
          const replyWithoutHashtags = generatedReply.replace(/#[\u0600-\u06FF\w]+/g, '').trim();
          generatedReply = replyWithoutHashtags + '\n\n' + allHashtags.join(' ');
          console.log('✅ Final reply with hashtags:', generatedReply);
        } else {
          console.log('⚠️ No hashtags generated');
        }
        
        console.log('✅ Generated intelligent reply:', generatedReply);
        return generatedReply;
      }

      return null;
    } catch (error) {
      console.error('❌ Error calling Gemini API:', error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error generating intelligent reply:', error);
    return null;
  }
}