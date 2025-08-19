import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, MessageSquare, Shield, Phone, Settings } from "lucide-react";
import { toast } from "sonner";
import { FacebookWebhookManager } from '@/components/FacebookWebhookManager';
import { PagesWebhookSetup } from "@/components/FacebookManager/PagesWebhookSetup";
import { MultiPagePermissionsManager } from "@/components/FacebookManager/MultiPagePermissionsManager";
import { AutoWebhookSetup } from "@/components/FacebookManager/AutoWebhookSetup";
import { AdvancedWebhookManager } from "@/components/FacebookManager/AdvancedWebhookManager";
import { WebhookTester } from "@/components/WebhookTester";
import { WebhookDashboard } from "@/components/WebhookDashboard";
import EventsNavigationButton from "@/components/EventsNavigationButton";

const WebhookPage = () => {
  const [isActive, setIsActive] = useState(false);

  const webhookCode = `const PAGE_ACCESS_TOKEN = "<PAGE_ACCESS_TOKEN>";
const GEMINI_API_KEY = "<GEMINI_API_KEY>";
const GEMINI_API_URL = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=\${GEMINI_API_KEY}\`;

async function callGemini(prompt) {
  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function isOffensiveAI(text) {
  const prompt = \`هل النص التالي يحتوي على إساءة أو كلام بذيء؟ أجب بـ "نعم" أو "لا".\\n"\${text}"\`;
  const result = await callGemini(prompt);
  return result.trim().startsWith("نعم");
}

function hasExplicitPostReference(text) {
  const keywords = ["المنشور", "نشركم", "ما نشرتم", "نشرتكم", "المقال", "ما كتبتم", "البوست"];
  return keywords.some(keyword => text.includes(keyword));
}

async function getPageInfo() {
  const res = await fetch(\`https://graph.facebook.com/v19.0/me?fields=name,id,phone&access_token=\${PAGE_ACCESS_TOKEN}\`);
  const data = await res.json();
  return {
    name: data.name || "صفحتنا",
    id: data.id || "",
    phone: data.phone || ""
  };
}

async function getLastPost() {
  const res = await fetch(\`https://graph.facebook.com/v19.0/me/posts?limit=1&fields=message,full_picture,description,story&access_token=\${PAGE_ACCESS_TOKEN}\`);
  const data = await res.json();
  return {
    message: data.data?.[0]?.message || data.data?.[0]?.description || data.data?.[0]?.story || "محتوى المنشور غير متاح",
    image: data.data?.[0]?.full_picture || ""
  };
}

// إضافة دالة للحصول على محتوى منشور محدد
async function getPostContent(postId) {
  try {
    const res = await fetch(\`https://graph.facebook.com/v19.0/\${postId}?fields=message,description,story,full_picture,name&access_token=\${PAGE_ACCESS_TOKEN}\`);
    const data = await res.json();
    
    // البحث عن أي محتوى متاح
    const content = data.message || 
                   data.description || 
                   data.story || 
                   data.name || 
                   "لم يتم العثور على محتوى للمنشور";
    
    return {
      message: content,
      image: data.full_picture || ""
    };
  } catch (error) {
    console.error("خطأ في الحصول على محتوى المنشور:", error);
    return {
      message: "فشل في الحصول على محتوى المنشور",
      image: ""
    };
  }
}

async function generatePrivateReply(comment) {
  const prompt = \`اكتب رداً مهذباً على هذا التعليق مع إيموجي، يتراوح طوله بين 20 و50 كلمة، ويجب أن يكون الرد كاملاً دون تقطيع:\\n"\${comment}"\`;
  const fullReply = await callGemini(prompt);
  return fullReply.trim().split(/\\s+/).slice(0, 50).join(" ");
}

async function generateCommentReply(comment, postText) {
  const prompt = \`علق أحد المستخدمين: "\${comment}"\\nنص المنشور: "\${postText}"\\nاكتب رداً مهذباً وودياً بإيموجي.\`;
  return await callGemini(prompt);
}

async function generateOffensiveReply(commentText) {
  const prompt = \`تم تصنيف التعليق التالي على أنه مسيء:\\n"\${commentText}"\\nاكتب رداً مهذباً برسالة خاصة يوضح أنه تم إخفاء التعليق ويمكنه التواصل معنا إذا كان هناك خطأ. استخدم إيموجي.\`;
  return await callGemini(prompt);
}

async function hideComment(commentId) {
  await fetch(\`https://graph.facebook.com/v19.0/\${commentId}\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_hidden: true, access_token: PAGE_ACCESS_TOKEN })
  });
}

async function deleteComment(commentId) {
  await fetch(\`https://graph.facebook.com/v19.0/\${commentId}\`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: PAGE_ACCESS_TOKEN })
  });
}

async function replyToComment(commentId, message) {
  await fetch(\`https://graph.facebook.com/v19.0/\${commentId}/comments\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, access_token: PAGE_ACCESS_TOKEN })
  });
}

async function sendPrivateReplyCard(userId, commentText, postImage, phone) {
  const elements = [{
    title: "💬 وصلنا تعليقك",
    subtitle: \`🗨️ "\${commentText}"\`,
    image_url: postImage || "https://www.facebook.com/images/fb_icon_325x325.png"
  }];

  const buttons = [];
  if (phone) {
    buttons.push({
      type: "phone_number",
      title: "📞 اتصل بنا",
      payload: phone
    });
  }

  if (buttons.length > 0) {
    elements[0].buttons = buttons;
  }

  await fetch(\`https://graph.facebook.com/v19.0/me/messages?access_token=\${PAGE_ACCESS_TOKEN}\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: userId },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements
          }
        }
      }
    })
  });
}

async function sendPrivateOffensiveNotice(userId, commentText, phone) {
  const reply = await generateOffensiveReply(commentText);
  await fetch(\`https://graph.facebook.com/v19.0/me/messages?access_token=\${PAGE_ACCESS_TOKEN}\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: userId },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: reply,
            buttons: phone ? [{
              type: "phone_number",
              title: "📞 اتصل بنا",
              payload: phone
            }] : []
          }
        }
      }
    })
  });
}

async function sendPrivateMessage(userId, messageText) {
  await fetch(\`https://graph.facebook.com/v19.0/me/messages?access_token=\${PAGE_ACCESS_TOKEN}\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: userId },
      message: { text: messageText }
    })
  });
}

export default {
  async fetch(request) {
    const { searchParams } = new URL(request.url);
    const VERIFY_TOKEN = "lovable_verify_token";

    if (request.method === "GET") {
      const mode = searchParams.get("hub.mode");
      const token = searchParams.get("hub.verify_token");
      const challenge = searchParams.get("hub.challenge");
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        return new Response(challenge, { status: 200 });
      }
      return new Response("Forbidden", { status: 403 });
    }

    if (request.method === "POST") {
      const body = await request.json();
      const { name: pageName, id: pageId, phone } = await getPageInfo();
      const lastPost = await getLastPost();

      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === "feed" && change.value?.comment_id && change.value.verb === "add") {
            const commentId = change.value.comment_id;
            const commentText = change.value.message || change.value.comment || "";
            const postId = change.value.post_id;
            const fromId = change.value.from?.id;
            if (fromId === pageId) continue;

            const offensive = await isOffensiveAI(commentText);
            if (offensive) {
              // حذف التعليق المسيء نهائياً
              await deleteComment(commentId);
              await sendPrivateOffensiveNotice(fromId, commentText, phone);
              continue;
            }

            // تحسين الحصول على محتوى المنشور
            const postContent = await getPostContent(postId);
            const postText = postContent.message;
            const postImage = postContent.image;

            const reply = await generateCommentReply(commentText, postText);
            await replyToComment(commentId, reply);

            // إرسال كارت خاص مع صورة المنشور وزر الهاتف
            await sendPrivateReplyCard(fromId, commentText, postImage, phone);
            const privateReply = await generatePrivateReply(commentText);
            await sendPrivateMessage(fromId, privateReply);
          }
        }

        for (const msg of entry.messaging || []) {
          const senderId = msg.sender?.id;
          const messageText = msg.message?.text;
          if (senderId && messageText) {
            const offensive = await isOffensiveAI(messageText);
            if (!offensive) {
              const isAboutPost = hasExplicitPostReference(messageText);
              const smartReply = await callGemini(
                isAboutPost
                  ? \`الرسالة التالية تتعلق بمنشور:\\n"\${messageText}"\\nاكتب رداً مهذباً بإيموجي مستندًا إلى المنشور:\\n"\${lastPost.message}"\`
                  : \`اكتب رداً مهذباً مختصراً بإيموجي على الرسالة:\\n"\${messageText}"\\naسم الصفحة هو \${pageName}\`
              );
              await sendPrivateMessage(senderId, smartReply);
            }
          }
        }
      }

      return new Response("✅ Event received", { status: 200 });
    }

    return new Response("Method Not Allowed", { status: 405 });
  }
};`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookCode);
    toast.success("تم نسخ كود الويبهوك");
  };

  const toggleWebhook = () => {
    setIsActive(!isActive);
    toast.success(isActive ? "تم إيقاف الويبهوك" : "تم تفعيل الويبهوك");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              إعدادات الويب هوك المتقدمة
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            نظام متكامل لإدارة ويب هوك فيسبوك والردود التلقائية والصلاحيات
          </p>
          <div className="flex justify-center mt-4">
            <EventsNavigationButton />
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>
            <TabsTrigger value="setup">الإعداد التلقائي</TabsTrigger>
            <TabsTrigger value="permissions">إدارة الصلاحيات</TabsTrigger>
            <TabsTrigger value="manual">الإعداد اليدوي</TabsTrigger>
            <TabsTrigger value="testing">اختبار الويب هوك</TabsTrigger>
            <TabsTrigger value="legacy-code">الكود القديم</TabsTrigger>
          </TabsList>

          {/* لوحة التحكم */}
          <TabsContent value="dashboard" className="space-y-6">
            <WebhookDashboard />
          </TabsContent>

          {/* الإعداد التلقائي */}
          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  إعداد الويب هوك التلقائي
                </CardTitle>
                <CardDescription>
                  إعداد سريع وتلقائي للويب هوك لجميع الصفحات مع الردود الذكية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AutoWebhookSetup />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-orange-600" />
                  حل مشكلة عدم ظهور محتوى التعليقات
                </CardTitle>
                <CardDescription>
                  إعادة تكوين الويب هوك لطلب تفاصيل كاملة للتعليقات والرسائل
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancedWebhookManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* إدارة الصلاحيات */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  إدارة صلاحيات الصفحات
                </CardTitle>
                <CardDescription>
                  التحقق من صلاحيات جميع الصفحات وإدارتها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MultiPagePermissionsManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* الإعداد اليدوي */}
          <TabsContent value="manual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  الإعداد اليدوي للويب هوك
                </CardTitle>
                <CardDescription>
                  إعداد الويب هوك يدوياً مع التحكم الكامل في الإعدادات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PagesWebhookSetup />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مدير الويب هوك المتقدم</CardTitle>
                <CardDescription>
                  نظام إدارة شامل للويب هوك مع جميع الميزات المتقدمة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FacebookWebhookManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* اختبار الويب هوك */}
          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  اختبار الويب هوك
                </CardTitle>
                <CardDescription>
                  اختبار استقبال ومعالجة الأحداث لاستكشاف مشاكل عدم الرد على التعليقات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WebhookTester />
              </CardContent>
            </Card>
          </TabsContent>

          {/* الكود القديم */}
          <TabsContent value="legacy-code" className="space-y-6">
            {/* Status Card */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    <CardTitle>حالة الويبهوك</CardTitle>
                  </div>
                  <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "نشط" : "معطل"}
                  </Badge>
                </div>
                <CardDescription>
                  إدارة الويبهوك للرد التلقائي على التعليقات والرسائل (النسخة القديمة)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button 
                    onClick={toggleWebhook}
                    variant={isActive ? "destructive" : "default"}
                    className="flex-1"
                  >
                    {isActive ? "إيقاف الويبهوك" : "تفعيل الويبهوك"}
                  </Button>
                  <Button onClick={copyToClipboard} variant="outline">
                    نسخ الكود
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-lg">تصفية المحتوى</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• كشف التعليقات المسيئة بالذكاء الاصطناعي</li>
                    <li>• حذف التعليقات المسيئة نهائياً</li>
                    <li>• إرسال تنبيه مهذب للمستخدم</li>
                    <li>• إضافة زر للتواصل المباشر</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">الردود الذكية</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• رد تلقائي على التعليقات</li>
                    <li>• رسائل خاصة مخصصة</li>
                    <li>• إرفاق صورة المنشور</li>
                    <li>• تغيير النص إلى "وصلنا تعليقك"</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-purple-500" />
                    <CardTitle className="text-lg">التواصل المباشر</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• زر الاتصال المباشر</li>
                    <li>• كروت تفاعلية في الرسائل</li>
                    <li>• معلومات الصفحة التلقائية</li>
                    <li>• ردود مناسبة للسياق</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Code Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  كود الويبهوك المطور
                </CardTitle>
                <CardDescription>
                  الكود محدث لحل المشاكل المطلوبة: حذف التعليقات المسيئة، إضافة صورة المنشور وزر الهاتف، وتغيير نص الرسالة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {webhookCode}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="text-amber-800">تعليمات التطبيق</CardTitle>
              </CardHeader>
              <CardContent className="text-amber-700 space-y-2">
                <p><strong>التحديثات المطبقة:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>تم تغيير "شكراً لتعليقك" إلى "وصلنا تعليقك"</li>
                  <li>تم إضافة إرفاق صورة المنشور في الرسائل الخاصة</li>
                  <li>تم إضافة زر الهاتف للتواصل المباشر</li>
                  <li>تم تغيير إخفاء التعليق إلى حذف نهائي للتعليقات المسيئة</li>
                  <li>تم إضافة استخراج صورة المنشور من Graph API</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WebhookPage;