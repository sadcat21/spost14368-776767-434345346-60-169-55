import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Facebook, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  Settings,
  Users,
  Webhook,
  Info,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface FacebookPage {
  id: string;
  name: string;
  category?: string;
  access_token: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
}

const FacebookSetupPage = () => {
  const [userAccessToken, setUserAccessToken] = useState('');
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'token',
      title: 'إضافة User Access Token',
      description: 'أدخل user access token من Facebook Developer',
      status: 'pending'
    },
    {
      id: 'pages',
      title: 'جلب الصفحات',
      description: 'عرض جميع الصفحات المتاحة',
      status: 'pending'
    },
    {
      id: 'select',
      title: 'اختيار الصفحات',
      description: 'تحديد الصفحات المراد ربطها',
      status: 'pending'
    },
    {
      id: 'webhook',
      title: 'إعداد Webhook',
      description: 'ربط الصفحات بالـ webhook تلقائياً',
      status: 'pending'
    }
  ]);

  const updateStepStatus = (stepId: string, status: SetupStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const getStatusIcon = (status: SetupStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const fetchPages = async () => {
    if (!userAccessToken.trim()) {
      toast.error('يرجى إدخال User Access Token أولاً');
      return;
    }

    updateStepStatus('pages', 'loading');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('facebook-setup', {
        body: {
          action: 'get_user_pages',
          userAccessToken: userAccessToken.trim()
        }
      });

      if (error) {
        throw error;
      }

      if (data.success && data.pages) {
        setPages(data.pages);
        updateStepStatus('token', 'completed');
        updateStepStatus('pages', 'completed');
        updateStepStatus('select', 'pending');
        toast.success(`تم جلب ${data.pages.length} صفحة بنجاح`);
      } else {
        throw new Error(data.error || 'فشل في جلب الصفحات');
      }
    } catch (error: any) {
      console.error('خطأ في جلب الصفحات:', error);
      updateStepStatus('pages', 'error');
      toast.error('خطأ في جلب الصفحات: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const setupWebhook = async () => {
    if (selectedPages.size === 0) {
      toast.error('يرجى اختيار صفحة واحدة على الأقل');
      return;
    }

    updateStepStatus('webhook', 'loading');
    setLoading(true);

    try {
      // حفظ الصفحات المختارة في قاعدة البيانات
      const selectedPagesData = pages.filter(page => selectedPages.has(page.id));
      
      for (const page of selectedPagesData) {
        const { error: insertError } = await supabase
          .from('facebook_pages')
          .upsert({
            page_id: page.id,
            page_name: page.name,
            access_token: page.access_token,
            category: page.category,
            picture_url: page.picture?.data?.url,
            is_active: true
          }, {
            onConflict: 'page_id'
          });

        if (insertError) {
          throw insertError;
        }
      }

      // إعداد webhook للصفحات
      const { data, error } = await supabase.functions.invoke('facebook-setup', {
        body: {
          action: 'setup_webhook_for_pages',
          pageIds: Array.from(selectedPages)
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        updateStepStatus('select', 'completed');
        updateStepStatus('webhook', 'completed');
        toast.success('تم إعداد الـ webhook بنجاح لجميع الصفحات المختارة');
      } else {
        throw new Error(data.error || 'فشل في إعداد الـ webhook');
      }
    } catch (error: any) {
      console.error('خطأ في إعداد الـ webhook:', error);
      updateStepStatus('webhook', 'error');
      toast.error('خطأ في إعداد الـ webhook: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageSelection = (pageId: string, selected: boolean) => {
    const newSelection = new Set(selectedPages);
    if (selected) {
      newSelection.add(pageId);
    } else {
      newSelection.delete(pageId);
    }
    setSelectedPages(newSelection);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* عنوان الصفحة */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Facebook className="h-8 w-8 text-blue-600" />
          إعداد Facebook تلقائياً
        </h1>
        <p className="text-muted-foreground">
          قم بربط صفحات فيسبوك بالـ webhook بخطوات بسيطة
        </p>
      </div>

      {/* خطوات الإعداد */}
      <Card>
        <CardHeader>
          <CardTitle>خطوات الإعداد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3 p-4 rounded-lg border">
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* إدخال User Access Token */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            User Access Token
          </CardTitle>
          <CardDescription>
            أدخل User Access Token من Facebook Developer Console
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">User Access Token</Label>
            <Input
              id="token"
              type="password"
              value={userAccessToken}
              onChange={(e) => setUserAccessToken(e.target.value)}
              placeholder="أدخل User Access Token هنا..."
              className="font-mono"
            />
          </div>
          
          <Button 
            onClick={fetchPages} 
            disabled={loading || !userAccessToken.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                جاري جلب الصفحات...
              </>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                جلب الصفحات
              </>
            )}
          </Button>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>كيفية الحصول على User Access Token:</strong>
              <ol className="mt-2 space-y-1 text-sm list-decimal list-inside">
                <li>اذهب إلى Graph API Explorer</li>
                <li>اختر تطبيقك</li>
                <li>أضف الأذونات: pages_read_engagement, pages_manage_metadata</li>
                <li>انسخ الـ token</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* عرض الصفحات */}
      {pages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              الصفحات المتاحة ({pages.length})
            </CardTitle>
            <CardDescription>
              اختر الصفحات التي تريد ربطها بالـ webhook
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {pages.map((page) => (
                <div key={page.id} className="flex items-center space-x-3 space-x-reverse p-4 rounded-lg border">
                  <Checkbox
                    id={`page-${page.id}`}
                    checked={selectedPages.has(page.id)}
                    onCheckedChange={(checked) => handlePageSelection(page.id, checked as boolean)}
                  />
                  {page.picture?.data?.url && (
                    <img
                      src={page.picture.data.url}
                      alt={page.name}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <label 
                      htmlFor={`page-${page.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {page.name}
                    </label>
                    {page.category && (
                      <p className="text-sm text-muted-foreground">{page.category}</p>
                    )}
                    <p className="text-xs text-muted-foreground">ID: {page.id}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                تم اختيار {selectedPages.size} من {pages.length} صفحة
              </p>
              <Button 
                onClick={setupWebhook}
                disabled={loading || selectedPages.size === 0}
                className="w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    جاري الإعداد...
                  </>
                ) : (
                  <>
                    <Webhook className="h-4 w-4 mr-2" />
                    إعداد Webhook ({selectedPages.size})
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* روابط مفيدة */}
      <Card>
        <CardHeader>
          <CardTitle>روابط مفيدة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <a
              href="https://developers.facebook.com/tools/explorer/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Graph API Explorer</span>
            </a>
            <a
              href="https://developers.facebook.com/docs/permissions/reference"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Facebook Permissions Reference</span>
            </a>
            <a
              href="https://developers.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Meta for Developers</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacebookSetupPage;