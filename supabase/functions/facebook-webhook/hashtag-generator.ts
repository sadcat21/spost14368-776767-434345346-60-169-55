// Smart hashtag generation for auto-replies
export function generateSmartHashtags(messageText: string, type: 'message' | 'comment', postContent?: string): string[] {
  console.log('🏷️ Generating hashtags for message:', messageText.substring(0, 50) + '...');
  
  const baseHashtags = ['#تفاعل', '#مساعدة', '#خدمة_العملاء'];
  const hashtags: string[] = [];
  
  // تحليل نوع السؤال وإضافة هاشتاغات مناسبة
  const messageTextLower = messageText.toLowerCase();
  
  // هاشتاغات للأسئلة المتعلقة بالمنتجات والخدمات
  if (messageTextLower.includes('سعر') || messageTextLower.includes('تكلفة') || messageTextLower.includes('ثمن')) {
    hashtags.push('#أسعار', '#معلومات');
  }
  
  if (messageTextLower.includes('توصيل') || messageTextLower.includes('شحن') || messageTextLower.includes('وصول')) {
    hashtags.push('#توصيل', '#شحن');
  }
  
  if (messageTextLower.includes('جودة') || messageTextLower.includes('نوعية') || messageTextLower.includes('مواصفات')) {
    hashtags.push('#جودة', '#مواصفات');
  }
  
  if (messageTextLower.includes('موعد') || messageTextLower.includes('وقت') || messageTextLower.includes('متى')) {
    hashtags.push('#مواعيد', '#توقيت');
  }
  
  if (messageTextLower.includes('متوفر') || messageTextLower.includes('موجود') || messageTextLower.includes('نفذ')) {
    hashtags.push('#توفر', '#مخزون');
  }
  
  // هاشتاغات للشكر والإطراء
  if (messageTextLower.includes('شكر') || messageTextLower.includes('ممتاز') || messageTextLower.includes('رائع')) {
    hashtags.push('#شكراً', '#تقدير');
  }
  
  // هاشتاغات للاستفسارات العامة
  if (messageTextLower.includes('كيف') || messageTextLower.includes('طريقة') || messageTextLower.includes('أسلوب')) {
    hashtags.push('#طريقة', '#شرح');
  }
  
  // هاشتاغات للمتابعة
  if (messageTextLower.includes('متابعة') || messageTextLower.includes('تابع') || messageTextLower.includes('جديد')) {
    hashtags.push('#متابعة', '#جديد');
  }
  
  // هاشتاغات للصور والتصميم
  if (messageTextLower.includes('صورة') || messageTextLower.includes('تصميم') || messageTextLower.includes('لون')) {
    hashtags.push('#تصميم', '#إبداع');
  }
  
  // إضافة هاشتاغ أساسي إذا لم يتم العثور على أي هاشتاغ محدد
  if (hashtags.length === 0) {
    hashtags.push('#استفسار');
  }
  
  // إضافة هاشتاغ الدعم دائماً
  hashtags.push('#دعم');
  
  console.log('✅ Generated hashtags:', hashtags);
  
  // إرجاع أول 3 هاشتاغات لتجنب الإفراط
  return hashtags.slice(0, 3);
}

// Generate context-aware hashtags based on post content
export function generateContextHashtags(postContent: string): string[] {
  console.log('🏷️ Generating context hashtags for post:', postContent.substring(0, 50) + '...');
  
  const hashtags: string[] = [];
  const postLower = postContent.toLowerCase();
  
  // تحليل محتوى المنشور
  if (postLower.includes('عرض') || postLower.includes('تخفيض') || postLower.includes('خصم')) {
    hashtags.push('#عروض', '#تخفيضات');
  }
  
  if (postLower.includes('جديد') || postLower.includes('إطلاق') || postLower.includes('منتج')) {
    hashtags.push('#جديد', '#منتجات');
  }
  
  if (postLower.includes('حدث') || postLower.includes('فعالية') || postLower.includes('مؤتمر')) {
    hashtags.push('#أحداث', '#فعاليات');
  }
  
  console.log('✅ Generated context hashtags:', hashtags);
  
  return hashtags.slice(0, 2);
}