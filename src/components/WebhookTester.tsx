import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Send, TestTube, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

export const WebhookTester = () => {
  const [testType, setTestType] = useState<'comment' | 'message'>('comment');
  const [testData, setTestData] = useState({
    pageId: '',
    postId: '',
    commentText: 'تجربة تعليق للاختبار',
    userId: '12345',
    messageText: 'رسالة اختبار'
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const simulateWebhookEvent = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      let webhookBody;

      if (testType === 'comment') {
        // محاكاة حدث تعليق
        webhookBody = {
          object: 'page',
          entry: [{
            id: testData.pageId || '12345',
            time: Date.now(),
            changes: [{
              field: 'feed',
              value: {
                verb: 'add',
                comment_id: `${testData.postId}_${Date.now()}`,
                post_id: testData.postId || '67890',
                message: testData.commentText,
                from: {
                  id: testData.userId || '54321',
                  name: 'مستخدم اختبار'
                },
                created_time: new Date().toISOString()
              }
            }]
          }]
        };
      } else {
        // محاكاة حدث رسالة
        webhookBody = {
          object: 'page',
          entry: [{
            id: testData.pageId || '12345',
            time: Date.now(),
            messaging: [{
              sender: {
                id: testData.userId || '54321'
              },
              recipient: {
                id: testData.pageId || '12345'
              },
              timestamp: Date.now(),
              message: {
                text: testData.messageText
              }
            }]
          }]
        };
      }

      console.log('إرسال البيانات التجريبية:', webhookBody);

      // إرسال البيانات إلى ويب هوك فيسبوك
      const { data, error } = await supabase.functions.invoke('facebook-webhook-v2', {
        body: webhookBody
      });

      console.log('نتيجة الاختبار:', { data, error });

      if (error) {
        throw new Error(`خطأ في استدعاء الويب هوك: ${error.message}`);
      }

      setTestResult({
        success: true,
        message: 'تم إرسال الحدث التجريبي بنجاح',
        details: data
      });

      toast.success('تم إرسال الحدث التجريبي');

    } catch (error: any) {
      console.error('خطأ في اختبار الويب هوك:', error);
      setTestResult({
        success: false,
        message: `فشل في الاختبار: ${error.message}`,
        details: error
      });
      toast.error('فشل في اختبار الويب هوك');
    } finally {
      setTesting(false);
    }
  };

  const testReprocessing = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('facebook-webhook-v2', {
        body: {
          action: 'reprocess_events'
        }
      });

      if (error) {
        throw new Error(`خطأ في إعادة المعالجة: ${error.message}`);
      }

      setTestResult({
        success: true,
        message: 'تم تشغيل إعادة معالجة الأحداث',
        details: data
      });

      toast.success('تم تشغيل إعادة المعالجة');

    } catch (error: any) {
      console.error('خطأ في إعادة المعالجة:', error);
      setTestResult({
        success: false,
        message: `فشل في إعادة المعالجة: ${error.message}`
      });
      toast.error('فشل في إعادة المعالجة');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            اختبار الويب هوك
          </CardTitle>
          <CardDescription>
            اختبار استقبال ومعالجة أحداث فيسبوك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* نوع الاختبار */}
          <div className="space-y-2">
            <Label>نوع الاختبار</Label>
            <div className="flex gap-2">
              <Button
                variant={testType === 'comment' ? 'default' : 'outline'}
                onClick={() => setTestType('comment')}
                size="sm"
              >
                تعليق
              </Button>
              <Button
                variant={testType === 'message' ? 'default' : 'outline'}
                onClick={() => setTestType('message')}
                size="sm"
              >
                رسالة خاصة
              </Button>
            </div>
          </div>

          {/* إعدادات الاختبار */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="pageId">معرف الصفحة</Label>
              <Input
                id="pageId"
                placeholder="معرف صفحة فيسبوك"
                value={testData.pageId}
                onChange={(e) => setTestData({ ...testData, pageId: e.target.value })}
              />
            </div>

            {testType === 'comment' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="postId">معرف المنشور</Label>
                  <Input
                    id="postId"
                    placeholder="معرف المنشور"
                    value={testData.postId}
                    onChange={(e) => setTestData({ ...testData, postId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commentText">نص التعليق</Label>
                  <Textarea
                    id="commentText"
                    placeholder="أدخل نص التعليق التجريبي"
                    value={testData.commentText}
                    onChange={(e) => setTestData({ ...testData, commentText: e.target.value })}
                  />
                </div>
              </>
            )}

            {testType === 'message' && (
              <div className="space-y-2">
                <Label htmlFor="messageText">نص الرسالة</Label>
                <Textarea
                  id="messageText"
                  placeholder="أدخل نص الرسالة التجريبية"
                  value={testData.messageText}
                  onChange={(e) => setTestData({ ...testData, messageText: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="userId">معرف المستخدم</Label>
              <Input
                id="userId"
                placeholder="معرف المستخدم المرسل"
                value={testData.userId}
                onChange={(e) => setTestData({ ...testData, userId: e.target.value })}
              />
            </div>
          </div>

          {/* أزرار الاختبار */}
          <div className="flex gap-2">
            <Button
              onClick={simulateWebhookEvent}
              disabled={testing}
              className="flex-1"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جارِ الاختبار...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  إرسال حدث تجريبي
                </>
              )}
            </Button>
            
            <Button
              onClick={testReprocessing}
              disabled={testing}
              variant="outline"
            >
              إعادة معالجة الأحداث
            </Button>
          </div>

          {/* نتيجة الاختبار */}
          {testResult && (
            <Alert variant={testResult.success ? "default" : "destructive"}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">{testResult.message}</p>
                  {testResult.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer">عرض التفاصيل</summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                        {JSON.stringify(testResult.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* نصائح الاختبار */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">نصائح لاختبار الويب هوك</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium">استخدم بيانات حقيقية</p>
                <p className="text-muted-foreground">استخدم معرفات صفحات ومنشورات حقيقية للحصول على نتائج دقيقة</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">راقب السجلات</p>
                <p className="text-muted-foreground">تحقق من سجل الأحداث لمعرفة ما إذا تم استقبال ومعالجة الحدث</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">اختبر أنواع مختلفة</p>
                <p className="text-muted-foreground">اختبر كل من التعليقات والرسائل الخاصة للتأكد من عمل جميع الوظائف</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};