import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const FacebookWebhookFlowDiagram = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>مخطط تدفق أحداث Webhook فيسبوك</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-auto">
          <div className="min-w-[800px] p-4 bg-muted/50 rounded-lg">
            <div className="text-center text-sm text-muted-foreground mb-4">
              مخطط تدفق Webhook فيسبوك - من التعليق إلى الرد التلقائي
            </div>
            
            {/* مخطط مبسط بـ HTML/CSS */}
            <div className="space-y-6">
              {/* المرحلة الأولى */}
              <div className="flex items-center justify-center">
                <div className="bg-blue-100 p-4 rounded-lg text-center min-w-[200px]">
                  <div className="text-2xl mb-2">👤</div>
                  <div className="font-medium">مستخدم يضع تعليق</div>
                  <div className="text-sm text-muted-foreground">على منشور الصفحة</div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="text-2xl">⬇️</div>
              </div>
              
              {/* المرحلة الثانية */}
              <div className="flex items-center justify-center">
                <div className="bg-purple-100 p-4 rounded-lg text-center min-w-[200px]">
                  <div className="text-2xl mb-2">📱</div>
                  <div className="font-medium">فيسبوك يرصد الحدث</div>
                  <div className="text-sm text-muted-foreground">comment event</div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="text-2xl">⬇️</div>
              </div>
              
              {/* تحقق الاشتراك */}
              <div className="flex items-center justify-center">
                <div className="bg-yellow-100 p-4 rounded-lg text-center min-w-[200px]">
                  <div className="text-2xl mb-2">🔍</div>
                  <div className="font-medium">هل الصفحة مشتركة؟</div>
                  <div className="text-sm text-muted-foreground">في Webhook</div>
                </div>
              </div>
              
              {/* تفرع */}
              <div className="flex items-center justify-around">
                <div className="bg-green-100 p-4 rounded-lg text-center flex-1 mx-2">
                  <div className="text-2xl mb-2">📡</div>
                  <div className="font-medium">نعم: إرسال POST</div>
                  <div className="text-sm text-muted-foreground">إلى Callback URL</div>
                </div>
                <div className="bg-red-100 p-4 rounded-lg text-center flex-1 mx-2">
                  <div className="text-2xl mb-2">❌</div>
                  <div className="font-medium">لا: لا إشعار</div>
                  <div className="text-sm text-muted-foreground">انتهاء العملية</div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="text-2xl">⬇️</div>
              </div>
              
              {/* التحقق الأمني */}
              <div className="flex items-center justify-center">
                <div className="bg-indigo-100 p-4 rounded-lg text-center min-w-[200px]">
                  <div className="text-2xl mb-2">🔐</div>
                  <div className="font-medium">التحقق الأمني</div>
                  <div className="text-sm text-muted-foreground">Verify Token والتوقيع</div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="text-2xl">⬇️</div>
              </div>
              
              {/* استقبال البيانات */}
              <div className="flex items-center justify-center">
                <div className="bg-orange-100 p-4 rounded-lg text-center min-w-[200px]">
                  <div className="text-2xl mb-2">📨</div>
                  <div className="font-medium">استقبال بيانات التعليق</div>
                  <div className="text-sm text-muted-foreground">comment_id, message, user_id</div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="text-2xl">⬇️</div>
              </div>
              
              {/* تحليل المحتوى */}
              <div className="flex items-center justify-center">
                <div className="bg-pink-100 p-4 rounded-lg text-center min-w-[200px]">
                  <div className="text-2xl mb-2">🧠</div>
                  <div className="font-medium">تحليل نص التعليق</div>
                  <div className="text-sm text-muted-foreground">AI/الكلمات المفتاحية</div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="text-2xl">⬇️</div>
              </div>
              
              {/* النتيجة النهائية */}
              <div className="flex items-center justify-around">
                <div className="bg-green-100 p-4 rounded-lg text-center flex-1 mx-2">
                  <div className="text-2xl mb-2">🚀</div>
                  <div className="font-medium">رد تلقائي</div>
                  <div className="text-sm text-muted-foreground">إرسال عبر Graph API</div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg text-center flex-1 mx-2">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-medium">حفظ للمراجعة</div>
                  <div className="text-sm text-muted-foreground">في قاعدة البيانات</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <h3 className="font-semibold">شرح المراحل الرئيسية:</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">🔹 استقبال الحدث</h4>
              <p className="text-sm text-muted-foreground">
                عندما يضع مستخدم تعليق، يرسل فيسبوك إشعار فوري إلى الـ Webhook المحدد
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-purple-600">🔹 التحقق الأمني</h4>
              <p className="text-sm text-muted-foreground">
                التأكد من صحة الطلب باستخدام Verify Token والتوقيع المشفر
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">🔹 تحليل المحتوى</h4>
              <p className="text-sm text-muted-foreground">
                فحص نص التعليق للبحث عن كلمات مفتاحية أو استخدام الذكاء الاصطناعي
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-orange-600">🔹 الرد التلقائي</h4>
              <p className="text-sm text-muted-foreground">
                إرسال رد مناسب أو حفظ التعليق للمراجعة اليدوية
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};