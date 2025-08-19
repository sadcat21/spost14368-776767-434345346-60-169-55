import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Copy, 
  ExternalLink,
  Settings,
  Webhook,
  MessageSquare,
  ArrowRight,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface WebhookSetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'error';
  action?: () => void;
}

export const FacebookWebhookSetup = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [verifyToken, setVerifyToken] = useState('facebook_webhook_verify_token_123');
  const [steps, setSteps] = useState<WebhookSetupStep[]>([
    {
      id: 'meta-setup',
      title: 'إعداد Webhook في Meta Developer',
      description: 'إضافة Callback URL و Verify Token',
      status: 'pending'
    },
    {
      id: 'subscription',
      title: 'الاشتراك في أحداث الصفحة',
      description: 'تفعيل feed و comments events',
      status: 'pending'
    },
    {
      id: 'permissions',
      title: 'إضافة الأذونات اللازمة',
      description: 'pages_read_engagement, pages_manage_metadata',
      status: 'pending'
    },
    {
      id: 'page-link',
      title: 'ربط الصفحة بالتطبيق',
      description: 'إضافة الصفحة من إعدادات فيسبوك',
      status: 'pending'
    },
    {
      id: 'access-token',
      title: 'إنشاء Page Access Token',
      description: 'توليد وحفظ رمز الوصول للصفحة',
      status: 'pending'
    },
    {
      id: 'test',
      title: 'اختبار الـ Webhook',
      description: 'تجربة استقبال الأحداث',
      status: 'pending'
    }
  ]);

  const generateWebhookUrl = () => {
    const url = 'https://msrtbumkztdwtoqysykf.supabase.co/functions/v1/facebook-webhook-v2';
    setWebhookUrl(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ النص');
  };

  const testWebhook = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('facebook-webhook-v2', {
        body: { test: true }
      });

      if (error) {
        toast.error('فشل في اختبار الـ Webhook');
        return;
      }

      toast.success('الـ Webhook يعمل بشكل صحيح');
      updateStepStatus('test', 'completed');
    } catch (error) {
      toast.error('خطأ في الاتصال');
    }
  };

  const updateStepStatus = (stepId: string, status: 'pending' | 'completed' | 'error') => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* عنوان الصفحة */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Webhook className="h-8 w-8" />
          إعداد Webhook تعليقات فيسبوك
        </h1>
        <p className="text-muted-foreground">
          تأكد من وصول أي تعليق جديد على منشورات صفحتك فورًا
        </p>
      </div>

      {/* مخطط التدفق */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            مسار الحدث من التعليق إلى الرد التلقائي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-block p-4 bg-blue-50 rounded-lg">
                <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium">مستخدم يضع تعليق</p>
                <p className="text-sm text-muted-foreground">على منشور الصفحة</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
            
            <div className="text-center">
              <div className="inline-block p-4 bg-purple-50 rounded-lg">
                <Settings className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium">فيسبوك يرسل إشعار</p>
                <p className="text-sm text-muted-foreground">إلى Webhook URL</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
            
            <div className="text-center">
              <div className="inline-block p-4 bg-green-50 rounded-lg">
                <Webhook className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium">الأداة تستقبل الحدث</p>
                <p className="text-sm text-muted-foreground">وتعالج التعليق</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
            
            <div className="text-center">
              <div className="inline-block p-4 bg-orange-50 rounded-lg">
                <MessageSquare className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="font-medium">رد تلقائي</p>
                <p className="text-sm text-muted-foreground">حسب الكلمات المفتاحية</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* معلومات الـ Webhook */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات الـ Webhook</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Callback URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                value={webhookUrl || 'اضغط على "توليد URL" للحصول على الرابط'}
                readOnly
                className="flex-1"
              />
              <Button onClick={generateWebhookUrl} variant="outline">
                توليد URL
              </Button>
              {webhookUrl && (
                <Button 
                  onClick={() => copyToClipboard(webhookUrl)}
                  variant="outline"
                  size="icon"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verify-token">Verify Token</Label>
            <div className="flex gap-2">
              <Input
                id="verify-token"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => copyToClipboard(verifyToken)}
                variant="outline"
                size="icon"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button onClick={testWebhook} className="w-full">
            اختبار الـ Webhook
          </Button>
        </CardContent>
      </Card>

      {/* خطوات الإعداد */}
      <Card>
        <CardHeader>
          <CardTitle>خطوات الإعداد</CardTitle>
          <CardDescription>
            اتبع هذه الخطوات لإعداد Webhook تعليقات فيسبوك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-3 p-4 rounded-lg border">
                <div className="flex-shrink-0">
                  {getStatusIcon(step.status)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{index + 1}</Badge>
                    <h3 className="font-medium">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStepStatus(step.id, 'completed')}
                  disabled={step.status === 'completed'}
                >
                  {step.status === 'completed' ? 'مكتمل' : 'تم'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* الروابط المهمة */}
      <Card>
        <CardHeader>
          <CardTitle>روابط مهمة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <a
              href="https://developers.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Meta for Developers</span>
            </a>
            <a
              href="https://developers.facebook.com/tools/explorer/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Graph API Explorer</span>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* تحذيرات مهمة */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>ملاحظات مهمة:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• فيسبوك لا يرسل أحداث التعليقات في المجموعات الخاصة</li>
            <li>• التعليقات في البث المباشر غير العام لا تصل</li>
            <li>• بعض المستخدمين قد يمنعون التطبيقات من الوصول لتعليقاتهم</li>
            <li>• تأكد أن المنشور عام وليس من شخص آخر</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};