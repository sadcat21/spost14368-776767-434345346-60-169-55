// Facebook Webhook v2 - Advanced AI-powered comment and message handler
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ====== Configuration ======
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAGE_ACCESS_TOKEN = Deno.env.get('PAGE_ACCESS_TOKEN');
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const VERIFY_TOKEN = Deno.env.get('FACEBOOK_WEBHOOK_VERIFY_TOKEN') || 'facebook_webhook_verify_token_123';

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const FACEBOOK_GRAPH_URL = 'https://graph.facebook.com/v19.0';

// ====== Utility Functions ======
async function callGemini(prompt: string, imageData?: { mimeType: string; data: string }): Promise<string> {
  try {
    const parts: any[] = [{ text: prompt }];
    if (imageData) {
      parts.push({
        inline_data: {
          mime_type: imageData.mimeType,
          data: imageData.data
        }
      });
    }

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 300,
        }
      })
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error('Gemini API error:', error);
    return "";
  }
}

function isImageQuestion(text: string): boolean {
  const imageKeywords = [
    'صورة', 'صوره', 'الصورة', 'في الصورة', 'بالصورة',
    'لون', 'ألوان', 'اللون', 'الألوان',
    'مكتوب', 'نص', 'كلمة', 'كلمات', 'عبارة',
    'شكل', 'أشكال', 'يظهر', 'موجود', 'أرى', 'ترى',
    'ماذا', 'وش', 'ايش', 'شو', 'أيه', 'اقرأ', 'اقرا'
  ];
  
  const hasImageKeyword = imageKeywords.some(keyword => 
    text.toLowerCase().includes(keyword)
  );
  
  const isQuestion = text.includes("؟") || text.startsWith("ما") || 
                   text.startsWith("ماذا") || text.startsWith("أين");
  
  return hasImageKeyword && isQuestion;
}

async function isOffensiveContent(text: string): Promise<boolean> {
  const prompt = `
قم بتحليل النص التالي وحدد إذا كان يحتوي على:
- إساءة أو سب
- اتهام بالخداع أو النصب
- كلام بذيء أو غير لائق
- تهديد أو تحريض

النص: "${text}"

أجب بـ "نعم" إذا كان يحتوي على أي من هذه الأمور، أو "لا" إذا كان مقبولاً.
`;
  
  const result = await callGemini(prompt);
  return result.trim().toLowerCase().startsWith("نعم");
}

function hasExplicitPostReference(text: string): boolean {
  const postKeywords = [
    'المنشور', 'نشركم', 'ما نشرتم', 'نشرتكم', 
    'المقال', 'ما كتبتم', 'البوست', 'المكتوب'
  ];
  return postKeywords.some(keyword => text.includes(keyword));
}

// ====== Facebook API Functions ======
async function getPageInfo(): Promise<{ name: string; id: string; phone?: string }> {
  try {
    const response = await fetch(
      `${FACEBOOK_GRAPH_URL}/me?fields=name,id,phone&access_token=${PAGE_ACCESS_TOKEN}`
    );
    const data = await response.json();
    return {
      name: data.name || "صفحتنا",
      id: data.id || "",
      phone: data.phone || ""
    };
  } catch (error) {
    console.error('Error getting page info:', error);
    return { name: "صفحتنا", id: "" };
  }
}

async function getPostDetails(postId: string): Promise<{ message?: string; imageUrl?: string }> {
  try {
    // Get post text and image
    const response = await fetch(
      `${FACEBOOK_GRAPH_URL}/${postId}?fields=message,full_picture,attachments{media}&access_token=${PAGE_ACCESS_TOKEN}`
    );
    const data = await response.json();
    
    let imageUrl = null;
    
    // Try to get image from full_picture
    if (data.full_picture && !data.full_picture.includes("fb_icon_325x325")) {
      imageUrl = data.full_picture;
    }
    
    // Try to get image from attachments
    if (!imageUrl && data.attachments?.data?.[0]?.media?.image?.src) {
      imageUrl = data.attachments.data[0].media.image.src;
    }
    
    return {
      message: data.message || "",
      imageUrl: imageUrl || undefined
    };
  } catch (error) {
    console.error('Error getting post details:', error);
    return { message: "" };
  }
}

async function getLastPost(): Promise<string> {
  try {
    const response = await fetch(
      `${FACEBOOK_GRAPH_URL}/me/posts?limit=1&fields=message&access_token=${PAGE_ACCESS_TOKEN}`
    );
    const data = await response.json();
    return data.data?.[0]?.message || "";
  } catch (error) {
    console.error('Error getting last post:', error);
    return "";
  }
}

async function hideComment(commentId: string): Promise<void> {
  try {
    await fetch(
      `${FACEBOOK_GRAPH_URL}/${commentId}/?is_hidden=true&access_token=${PAGE_ACCESS_TOKEN}`,
      { method: "POST" }
    );
    console.log(`Hidden comment: ${commentId}`);
  } catch (error) {
    console.error('Error hiding comment:', error);
  }
}

async function replyToComment(commentId: string, message: string, attachmentUrl?: string): Promise<void> {
  try {
    const body = new URLSearchParams();
    body.set('message', message);
    body.set('access_token', PAGE_ACCESS_TOKEN);
    
    if (attachmentUrl) {
      // Validate image URL first
      try {
        const imageCheck = await fetch(attachmentUrl, { method: 'HEAD' });
        if (imageCheck.ok) {
          body.set('attachment_url', attachmentUrl);
          console.log('🖼️ Adding image attachment to reply');
        } else {
          console.log('⚠️ Image URL validation failed, sending text-only');
        }
      } catch (imgError) {
        console.log('⚠️ Image validation error, sending text-only:', imgError);
      }
    }
    
    const response = await fetch(`${FACEBOOK_GRAPH_URL}/${commentId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body
    });
    
    const result = await response.json();
    
    // Log detailed response for debugging
    console.log('📋 Facebook API Response Status:', response.status);
    console.log('📋 Facebook API Response:', JSON.stringify(result, null, 2));
    
    if (result.error) {
      console.error('❌ Error replying to comment:', result.error);
      console.error('❌ Error Code:', result.error.code);
      console.error('❌ Error Type:', result.error.type);
      console.error('❌ Error Message:', result.error.message);
      
      if (result.error.error_subcode) {
        console.error('❌ Error Subcode:', result.error.error_subcode);
      }
      if (result.error.fbtrace_id) {
        console.error('❌ FB Trace ID:', result.error.fbtrace_id);
      }
      
      // If image attachment failed, try text-only
      if (attachmentUrl) {
        console.log('🔄 Retrying without image attachment...');
        const textOnlyBody = new URLSearchParams();
        textOnlyBody.set('message', message);
        textOnlyBody.set('access_token', PAGE_ACCESS_TOKEN);
        
        const retryResponse = await fetch(`${FACEBOOK_GRAPH_URL}/${commentId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: textOnlyBody
        });
        
        const retryResult = await retryResponse.json();
        console.log('📋 Retry Response Status:', retryResponse.status);
        console.log('📋 Retry Response:', JSON.stringify(retryResult, null, 2));
        
        if (retryResult.error) {
          console.error('❌ Retry also failed:', retryResult.error);
          throw new Error(`Facebook API Error: ${retryResult.error.message} (Code: ${retryResult.error.code})`);
        } else {
          console.log('✅ Comment reply sent successfully (text only after retry)');
          console.log('✅ Reply ID:', retryResult.id);
        }
      } else {
        throw new Error(`Facebook API Error: ${result.error.message} (Code: ${result.error.code})`);
      }
    } else {
      const status = attachmentUrl ? 'with image attachment' : 'text only';
      console.log(`✅ Comment reply sent successfully (${status})`);
      console.log('✅ Reply ID:', result.id);
      console.log('✅ Reply URL:', `https://facebook.com/${result.id}`);
    }
    
    console.log(`Replied to comment: ${commentId}`);
  } catch (error) {
    console.error('Error replying to comment:', error);
    throw error;
  }
}

async function sendPrivateMessage(userId: string, messageText: string): Promise<void> {
  try {
    await fetch(`${FACEBOOK_GRAPH_URL}/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: userId },
        message: { text: messageText }
      })
    });
    
    console.log(`Sent private message to: ${userId}`);
  } catch (error) {
    console.error('Error sending private message:', error);
  }
}

async function sendPrivateCard(userId: string, title: string, subtitle: string, imageUrl?: string): Promise<void> {
  try {
    const element: any = {
      title,
      subtitle
    };
    
    if (imageUrl) {
      element.image_url = imageUrl;
    }
    
    await fetch(`${FACEBOOK_GRAPH_URL}/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: userId },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements: [element]
            }
          }
        }
      })
    });
    
    console.log(`Sent private card to: ${userId}`);
  } catch (error) {
    console.error('Error sending private card:', error);
  }
}

// ====== AI Response Generators ======
async function generateCommentReply(comment: string, postText: string): Promise<string> {
  const prompt = `
أنت مساعد ذكي ومرح لصفحة فيسبوك. علق أحد المستخدمين التعليق التالي:
"${comment}"

نص المنشور الأصلي:
"${postText}"

اكتب رداً مهذباً وودياً ومرحاً:
- استخدم إيموجيهات مناسبة 😊✨🌟
- اجعل الرد قصير ومفيد (30-60 كلمة)
- كن إيجابياً ومتفاعلاً
- أضف هاشتاغ أو اثنين مناسبين
`;
  
  return await callGemini(prompt);
}

async function generatePrivateReply(comment: string): Promise<string> {
  const prompt = `
اكتب رسالة خاصة مهذبة ومتوسطة الطول (20-50 كلمة) للرد على هذا التعليق:
"${comment}"

شجع المستخدم على التفاعل الإيجابي بطريقة غير مباشرة واستخدم إيموجيهات مناسبة.
`;
  
  const fullReply = await callGemini(prompt);
  return fullReply.trim().split(/\s+/).slice(0, 50).join(" ");
}

async function generateOffensiveReply(commentText: string): Promise<string> {
  const prompt = `
تم تصنيف التعليق التالي على أنه مسيء أو غير مناسب:
"${commentText}"

اكتب رسالة خاصة مهذبة ومتوازنة (20-50 كلمة) توضح:
- أنه تم إخفاء التعليق
- نرحب بالتصحيح والتفاعل الإيجابي
- نحترم جميع الآراء المهذبة
- استخدم إيموجيهات مناسبة

كن مهذباً وودوداً رغم الموقف.
`;
  
  const fullReply = await callGemini(prompt);
  return fullReply.trim().split(/\s+/).slice(0, 50).join(" ");
}

async function answerImageQuestion(imageUrl: string, question: string): Promise<string> {
  try {
    // Download and convert image to base64
    const imgResponse = await fetch(imageUrl);
    const arrayBuffer = await imgResponse.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    const prompt = `
أنت مساعد ذكي متخصص في تحليل الصور والإجابة على الأسئلة.

سؤال المستخدم عن الصورة:
"${question}"

حلل الصورة المرفقة وأجب على السؤال:
- إذا سأل عن نص في الصورة، اقرأه بدقة
- إذا سأل عن الألوان، حددها بوضوح
- إذا سأل عن العناصر، صفها بالتفصيل
- استخدم إيموجيهات مناسبة 📷✨🎨
- اجعل الرد واضح ومفيد (50-100 كلمة)
`;
    
    return await callGemini(prompt, {
      mimeType: "image/jpeg",
      data: base64Image
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    return "❓ عذراً، لم أتمكن من تحليل الصورة حالياً. يرجى المحاولة مرة أخرى.";
  }
}

// ====== Main Handler Functions ======
async function handleCommentEvent(change: any): Promise<void> {
  const commentId = change.value?.comment_id;
  const commentText = change.value?.message || change.value?.comment || "";
  const postId = change.value?.post_id;
  const fromId = change.value?.from?.id;
  
  if (!commentId || !commentText || !fromId) {
    console.log('Missing required comment data');
    return;
  }
  
  // Get page info
  const pageInfo = await getPageInfo();
  
  // Skip if comment is from the page itself
  if (fromId === pageInfo.id) {
    console.log('Skipping comment from page itself');
    return;
  }
  
  console.log(`Processing comment: ${commentText}`);
  
  // Get post details
  const postDetails = await getPostDetails(postId);
  const defaultImageUrl = "https://www.facebook.com/images/fb_icon_325x325.png";
  
  // Check for offensive content
  if (await isOffensiveContent(commentText)) {
    console.log('Offensive content detected, hiding comment');
    
    await hideComment(commentId);
    
    // Send private notification about hidden comment
    await sendPrivateCard(
      fromId,
      "📩 وصلنا تعليقك",
      `💬 "${commentText.substring(0, 50)}..."`,
      postDetails.imageUrl || defaultImageUrl
    );
    
    const offensiveReply = await generateOffensiveReply(commentText);
    await sendPrivateMessage(fromId, offensiveReply);
    
    // Add contact button if phone available
    if (pageInfo.phone) {
      await sendPrivateMessage(fromId, `📞 للتواصل المباشر: ${pageInfo.phone}`);
    }
    
    return;
  }
  
  // Handle image questions
  if (isImageQuestion(commentText) && postDetails.imageUrl) {
    console.log('Image question detected');
    
    const imageAnswer = await answerImageQuestion(postDetails.imageUrl, commentText);
    await replyToComment(commentId, imageAnswer, postDetails.imageUrl);
    
    await sendPrivateCard(
      fromId,
      "📷 إجابة عن سؤالك حول الصورة",
      `💬 "${commentText.substring(0, 50)}..."`,
      postDetails.imageUrl
    );
    
    return;
  }
  
  // Handle regular comments
  const reply = await generateCommentReply(commentText, postDetails.message || "");
  await replyToComment(commentId, reply);
  
  // Send private thank you
  await sendPrivateCard(
    fromId,
    "❤️ شكراً لتعليقك",
    `💬 "${commentText.substring(0, 50)}..."`,
    postDetails.imageUrl || defaultImageUrl
  );
  
  const privateReply = await generatePrivateReply(commentText);
  await sendPrivateMessage(fromId, privateReply);
}

async function handleMessageEvent(msg: any): Promise<void> {
  const senderId = msg.sender?.id;
  const messageText = msg.message?.text;
  
  if (!senderId || !messageText) {
    console.log('Missing required message data');
    return;
  }
  
  console.log(`Processing message: ${messageText}`);
  
  // Skip offensive messages
  if (await isOffensiveContent(messageText)) {
    console.log('Offensive message detected, skipping');
    return;
  }
  
  // Get page info and last post
  const pageInfo = await getPageInfo();
  const lastPost = await getLastPost();
  
  // Generate smart reply
  const isAboutPost = hasExplicitPostReference(messageText);
  
  const prompt = isAboutPost
    ? `
الرسالة التالية تتعلق بمنشور:
"${messageText}"

اكتب رداً مهذباً ومختصراً مع إيموجيهات، مستنداً إلى المنشور التالي:
"${lastPost}"

اجعل الرد مفيد وودود (30-80 كلمة).
`
    : `
اكتب رداً مهذباً ومختصراً مع إيموجيهات على الرسالة التالية:
"${messageText}"

اسم الصفحة هو "${pageInfo.name}"
اجعل الرد ودود ومفيد (30-80 كلمة).
`;
  
  const smartReply = await callGemini(prompt);
  await sendPrivateMessage(senderId, smartReply);
}

// ====== Main Server Handler ======
serve(async (req) => {
  console.log(`🚀 Facebook Webhook v2 called: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const url = new URL(req.url);
  
  try {
    // Handle Facebook webhook verification (GET request)
    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');
      
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ Webhook verified successfully');
        return new Response(challenge, { status: 200, headers: corsHeaders });
      }
      
      console.log('❌ Webhook verification failed');
      return new Response('Forbidden', { status: 403, headers: corsHeaders });
    }
    
    // Handle webhook events (POST request)
    if (req.method === 'POST') {
      const body = await req.json();
      console.log('📩 Received webhook data:', JSON.stringify(body, null, 2));
      
      // Process entries
      for (const entry of body.entry || []) {
        // Handle feed changes (comments)
        for (const change of entry.changes || []) {
          if (change.field === 'feed' && change.value?.comment_id && change.value.verb === 'add') {
            await handleCommentEvent(change);
          }
        }
        
        // Handle messages
        for (const msg of entry.messaging || []) {
          if (msg.message?.text) {
            await handleMessageEvent(msg);
          }
        }
      }
      
      return new Response('✅ Event received and processed', { 
        status: 200, 
        headers: corsHeaders 
      });
    }
    
    return new Response('Method Not Allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});