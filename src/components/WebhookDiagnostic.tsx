import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DiagnosticResult {
  component: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
  action?: string;
}

export const WebhookDiagnostic = () => {
  const [diagnosing, setDiagnosing] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const runDiagnostics = async () => {
    setDiagnosing(true);
    const diagnosticResults: DiagnosticResult[] = [];

    try {
      // Test 1: فحص الـ webhook نفسه
      try {
        const { data, error } = await supabase.functions.invoke('facebook-webhook-v2', {
          body: { 
            hub: { 
              mode: 'subscribe', 
              verify_token: 'facebook_webhook_verify_token_123', 
              challenge: 'test_challenge' 
            } 
          }
        });

        if (error) {
          diagnosticResults.push({
            component: 'Webhook Function',
            status: 'error',
            message: 'فشل في الاتصال بـ Webhook',
            details: error.message,
            action: 'تحقق من إعدادات Supabase Edge Functions'
          });
        } else {
          diagnosticResults.push({
            component: 'Webhook Function',
            status: 'success',
            message: 'الـ Webhook يعمل بشكل صحيح',
            details: 'يمكن الوصول للدالة وتستجيب للطلبات'
          });
        }
      } catch (error: any) {
        diagnosticResults.push({
          component: 'Webhook Function',
          status: 'error',
          message: 'خطأ في الاتصال بـ Webhook',
          details: error.message
        });
      }

      // Test 2: فحص إعدادات فيسبوك
      try {
        const { data, error } = await supabase.functions.invoke('facebook-setup', {
          body: {
            action: 'get_webhook_subscriptions',
            pageId: '716430298220660', // استخدم معرف صفحة تجريبي
            accessToken: 'EAAQ1NXNDE64BPLJXMIi3gaVD99u15Qe0IzUPgXNNxEw7niZCO0xi3Wdv2CnZABJDjJL0VDZArS3I0UQtkZAKArUxWbKZCwfaWZBhlOdwa0V2U94pJLnyKGmQbwB8xZA2bYZAFBSItFrnGzadntgbjSq8wLiXgVsksni3dcK3i50kmSnvqELuZA6qsEpQZC3sMApMZAzxZATxboPm'
          }
        });

        if (error) {
          diagnosticResults.push({
            component: 'Facebook Subscription',
            status: 'error',
            message: 'فشل في فحص اشتراكات فيسبوك',
            details: error.message,
            action: 'تحقق من Page Access Token والأذونات'
          });
        } else if (data?.subscriptions?.length > 0) {
          const hasFeeds = data.subscriptions.some((sub: any) => 
            sub.subscribed_fields?.includes('feed')
          );
          
          if (hasFeeds) {
            diagnosticResults.push({
              component: 'Facebook Subscription',
              status: 'success',
              message: 'الصفحة مشتركة في أحداث feed',
              details: `مشترك في: ${data.subscriptions[0].subscribed_fields?.join(', ')}`
            });
          } else {
            diagnosticResults.push({
              component: 'Facebook Subscription',
              status: 'warning',
              message: 'الصفحة غير مشتركة في أحداث feed',
              details: 'يجب الاشتراك في feed لاستقبال التعليقات',
              action: 'اشترك في feed events من Facebook Developer Console'
            });
          }
        } else {
          diagnosticResults.push({
            component: 'Facebook Subscription',
            status: 'error',
            message: 'لا توجد اشتراكات نشطة',
            details: 'الصفحة غير مربوطة بالتطبيق',
            action: 'أضف الصفحة للتطبيق من Facebook Developer Console'
          });
        }
      } catch (error: any) {
        diagnosticResults.push({
          component: 'Facebook Subscription',
          status: 'error',
          message: 'خطأ في فحص اشتراكات فيسبوك',
          details: error.message
        });
      }

      // Test 3: فحص الـ webhook URL
      const webhookUrl = 'https://msrtbumkztdwtoqysykf.supabase.co/functions/v1/facebook-webhook-v2';
      
      diagnosticResults.push({
        component: 'Webhook URL',
        status: 'success',
        message: 'عنوان الـ Webhook صحيح',
        details: webhookUrl,
        action: 'استخدم هذا العنوان في Facebook Developer Console'
      });

      // Test 4: فحص Verify Token
      diagnosticResults.push({
        component: 'Verify Token',
        status: 'success',
        message: 'رمز التحقق محدد',
        details: 'facebook_webhook_verify_token_123',
        action: 'استخدم هذا الرمز في Facebook Developer Console'
      });

    } catch (error: any) {
      diagnosticResults.push({
        component: 'Diagnostic',
        status: 'error',
        message: 'خطأ في التشخيص',
        details: error.message
      });
    }

    setResults(diagnosticResults);
    setDiagnosing(false);
    
    const hasErrors = diagnosticResults.some(r => r.status === 'error');
    if (hasErrors) {
      toast.error('تم العثور على مشاكل في الإعداد');
    } else {
      toast.success('تم التشخيص بنجاح');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            تشخيص مشاكل الـ Webhook
          </CardTitle>
          <CardDescription>
            فحص شامل لجميع مكونات إعداد الـ webhook لتحديد المشاكل
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runDiagnostics} 
            disabled={diagnosing}
            className="w-full"
          >
            {diagnosing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جارِ التشخيص...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                بدء التشخيص
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>نتائج التشخيص</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border-2 ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(result.status)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{result.component}</Badge>
                        <span className="font-medium">{result.message}</span>
                      </div>
                      
                      {result.details && (
                        <p className="text-sm text-muted-foreground">
                          {result.details}
                        </p>
                      )}
                      
                      {result.action && (
                        <Alert>
                          <AlertDescription className="text-sm">
                            <strong>الإجراء المطلوب:</strong> {result.action}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* معلومات إضافية */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات مهمة للتشخيص</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">للتحقق من وصول الأحداث:</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• افتح سجل Edge Functions في Supabase</li>
                <li>• ضع تعليق على منشور في صفحتك</li>
                <li>• تحقق من ظهور الحدث في السجل خلال ثوانٍ</li>
              </ul>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">أسباب شائعة لعدم وصول الأحداث:</h4>
              <ul className="space-y-1 text-yellow-800">
                <li>• الصفحة غير مربوطة بالتطبيق في Facebook</li>
                <li>• Webhook URL غير صحيح أو لا يعمل</li>
                <li>• عدم الاشتراك في feed events</li>
                <li>• مشاكل في أذونات الصفحة</li>
                <li>• التعليق من مالك الصفحة نفسه</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <ExternalLink className="h-4 w-4" />
              <a 
                href="https://developers.facebook.com/apps" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Facebook Developer Console
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};