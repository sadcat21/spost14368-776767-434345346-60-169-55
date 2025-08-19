import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, XCircle, Loader2, Info, Check, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

interface WebhookStatus {
  pageId: string;
  pageName: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export const DirectFacebookSetup = () => {
  const [accessToken, setAccessToken] = useState('');
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set());
  const [webhookStatuses, setWebhookStatuses] = useState<WebhookStatus[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [isSettingUpWebhooks, setIsSettingUpWebhooks] = useState(false);

  const fetchPages = async () => {
    if (!accessToken.trim()) {
      toast.error('يرجى إدخال رمز الوصول');
      return;
    }

    setIsLoadingPages(true);
    try {
      // استدعاء Facebook API مباشرة
      const response = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken.trim()}&fields=id,name,access_token,category,picture`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.error) {
        throw new Error(`Facebook API Error: ${data.error.message}`);
      }

      if (data.data && Array.isArray(data.data)) {
        setPages(data.data);
        setSelectedPageIds(new Set());
        toast.success(`تم العثور على ${data.data.length} صفحة`);
      } else {
        throw new Error('لم يتم العثور على صفحات');
      }
    } catch (error: any) {
      console.error('Error fetching pages:', error);
      toast.error(`خطأ في جلب الصفحات: ${error.message}`);
    } finally {
      setIsLoadingPages(false);
    }
  };

  const handlePageSelection = (pageId: string, checked: boolean) => {
    const newSelection = new Set(selectedPageIds);
    if (checked) {
      newSelection.add(pageId);
    } else {
      newSelection.delete(pageId);
    }
    setSelectedPageIds(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedPageIds.size === pages.length) {
      setSelectedPageIds(new Set());
    } else {
      setSelectedPageIds(new Set(pages.map(page => page.id)));
    }
  };

  const setupWebhooksDirectly = async () => {
    if (selectedPageIds.size === 0) {
      toast.error('يرجى اختيار صفحة واحدة على الأقل');
      return;
    }

    const selectedPages = pages.filter(page => selectedPageIds.has(page.id));
    setIsSettingUpWebhooks(true);
    
    const statuses: WebhookStatus[] = selectedPages.map(page => ({
      pageId: page.id,
      pageName: page.name,
      status: 'pending'
    }));
    setWebhookStatuses(statuses);

    for (const page of selectedPages) {
      try {
        // حفظ معلومات الصفحة في قاعدة البيانات مباشرة
        const defaultUserId = "00000000-0000-0000-0000-000000000000";
        
        const pageData = {
          user_id: defaultUserId,
          page_id: page.id,
          page_name: page.name,
          access_token: page.access_token,
          is_active: true,
          category: page.category,
          picture_url: page.picture?.data?.url || ''
        };

        const { error: pageError } = await supabase
          .from('facebook_pages')
          .upsert(pageData, { onConflict: 'user_id,page_id' });

        if (pageError) {
          throw new Error(`فشل في حفظ بيانات الصفحة: ${pageError.message}`);
        }

        // محاولة إعداد الويب هوك عبر Facebook API مباشرة
        const subscribeUrl = `https://graph.facebook.com/v19.0/${page.id}/subscribed_apps`;
        const subscribeResponse = await fetch(`${subscribeUrl}?access_token=${page.access_token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscribed_fields: ['messages', 'messaging_postbacks']
          })
        });

        const subscribeResult = await subscribeResponse.json();

        if (subscribeResult.error) {
          // إذا فشل الويب هوك، لا نعتبر هذا خطأ مانع
          console.warn(`Webhook subscription failed for ${page.name}:`, subscribeResult.error);
          setWebhookStatuses(prev => prev.map(status => 
            status.pageId === page.id 
              ? { 
                  ...status, 
                  status: 'success', 
                  message: `تم حفظ الصفحة بنجاح (الويب هوك يتطلب إعدادات إضافية)`
                }
              : status
          ));
        } else {
          setWebhookStatuses(prev => prev.map(status => 
            status.pageId === page.id 
              ? { ...status, status: 'success', message: 'تم إعداد الصفحة والويب هوك بنجاح' }
              : status
          ));
        }

      } catch (error: any) {
        console.error(`Error setting up page ${page.id}:`, error);
        setWebhookStatuses(prev => prev.map(status => 
          status.pageId === page.id 
            ? { ...status, status: 'error', message: error.message }
            : status
        ));
      }

      // انتظار قصير بين الطلبات
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsSettingUpWebhooks(false);
    toast.success(`تم الانتهاء من إعداد ${selectedPages.length} صفحة`);
  };

  const addSinglePage = async () => {
    if (!accessToken.trim()) {
      toast.error('يرجى إدخال رمز الوصول');
      return;
    }

    setIsLoadingPages(true);
    try {
      // جلب معلومات الصفحة من Facebook API
      const response = await fetch(
        `https://graph.facebook.com/v19.0/me?access_token=${accessToken.trim()}&fields=id,name,category,picture`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const pageData = await response.json();

      if (pageData.error) {
        throw new Error(`Facebook API Error: ${pageData.error.message}`);
      }

      // حفظ الصفحة في قاعدة البيانات
      const defaultUserId = "00000000-0000-0000-0000-000000000000";
      
      const pageRecord = {
        user_id: defaultUserId,
        page_id: pageData.id,
        page_name: pageData.name,
        access_token: accessToken.trim(),
        is_active: true,
        category: pageData.category || 'Unknown',
        picture_url: pageData.picture?.data?.url || ''
      };

      const { error: pageError } = await supabase
        .from('facebook_pages')
        .upsert(pageRecord, { onConflict: 'user_id,page_id' });

      if (pageError) {
        throw new Error(`فشل في حفظ بيانات الصفحة: ${pageError.message}`);
      }

      // إعداد الويب هوك
      const subscribeUrl = `https://graph.facebook.com/v19.0/${pageData.id}/subscribed_apps`;
      const subscribeResponse = await fetch(`${subscribeUrl}?access_token=${accessToken.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscribed_fields: ['messages', 'messaging_postbacks', 'feed']
        })
      });

      const subscribeResult = await subscribeResponse.json();

      if (subscribeResult.error) {
        console.warn(`Webhook subscription warning:`, subscribeResult.error);
        toast.success(`تم إضافة الصفحة: ${pageData.name} (الويب هوك يتطلب إعدادات إضافية)`);
      } else {
        toast.success(`تم إضافة الصفحة بنجاح: ${pageData.name}`);
      }

      // مسح النموذج
      setAccessToken('');
      
    } catch (error: any) {
      console.error('Error adding page:', error);
      toast.error(`خطأ في إضافة الصفحة: ${error.message}`);
    } finally {
      setIsLoadingPages(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-green-900">إضافة صفحة فيسبوك</p>
              <p className="text-green-800">
                أدخل رمز الوصول (Page Access Token) لإضافة الصفحة وإعداد الويب هوك تلقائياً
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إضافة صفحة جديدة</CardTitle>
          <CardDescription>
            أدخل رمز الوصول لصفحة فيسبوك لإضافتها للتطبيق
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="page-access-token">رمز الوصول للصفحة (Page Access Token)</Label>
            <Input
              id="page-access-token"
              type="text"
              placeholder="EAAQ1NXNDE64BP..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              يجب أن يكون هذا Page Access Token وليس User Access Token
            </p>
          </div>
          
          <Button 
            onClick={addSinglePage} 
            disabled={isLoadingPages || !accessToken.trim()}
            className="w-full"
          >
            {isLoadingPages ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جارِ إضافة الصفحة...
              </>
            ) : (
              'إضافة الصفحة'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-yellow-900">إعداد متقدم (للمطورين)</p>
              <p className="text-yellow-800">
                يمكنك استخدام الخيارات أدناه لجلب عدة صفحات من User Access Token
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إعداد مباشر للصفحات</CardTitle>
          <CardDescription>
            أدخل رمز الوصول لفيسبوك لجلب الصفحات وحفظها في قاعدة البيانات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access-token">رمز الوصول لفيسبوك</Label>
            <Input
              id="access-token"
              type="text"
              placeholder="EAAQ1NXNDE64BP..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          
          <Button 
            onClick={fetchPages} 
            disabled={isLoadingPages || !accessToken.trim()}
            className="w-full"
          >
            {isLoadingPages ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جارِ جلب الصفحات...
              </>
            ) : (
              'جلب الصفحات'
            )}
          </Button>
        </CardContent>
      </Card>

      {pages.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>الصفحات المتاحة ({pages.length})</CardTitle>
                <CardDescription>
                  اختر الصفحات التي تريد حفظها في قاعدة البيانات
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                {selectedPageIds.size === pages.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {pages.map((page) => (
                <div key={page.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedPageIds.has(page.id)}
                      onCheckedChange={(checked) => handlePageSelection(page.id, checked as boolean)}
                      className="ml-3"
                    />
                    {page.picture?.data?.url && (
                      <img 
                        src={page.picture.data.url} 
                        alt={page.name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium">{page.name}</p>
                      <p className="text-sm text-muted-foreground">{page.category}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{page.id}</Badge>
                </div>
              ))}
            </div>

            {selectedPageIds.size > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    تم اختيار {selectedPageIds.size} من أصل {pages.length} صفحة
                  </p>
                </div>
                
                <Button 
                  onClick={setupWebhooksDirectly}
                  disabled={isSettingUpWebhooks}
                  className="w-full"
                  size="lg"
                >
                  {isSettingUpWebhooks ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جارِ حفظ الصفحات...
                    </>
                  ) : (
                    `حفظ الصفحات المختارة (${selectedPageIds.size})`
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {webhookStatuses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>حالة حفظ الصفحات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {webhookStatuses.map((status) => (
                <div key={status.pageId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{status.pageName}</p>
                    {status.message && (
                      <p className="text-sm text-muted-foreground">{status.message}</p>
                    )}
                  </div>
                  <div className="flex items-center">
                    {status.status === 'pending' && (
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                    )}
                    {status.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {status.status === 'error' && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-blue-900">ملاحظات مهمة:</p>
              <ul className="space-y-1 text-blue-800">
                <li>• سيتم حفظ معلومات الصفحات ورموز الوصول في قاعدة البيانات</li>
                <li>• الويب هوك قد يتطلب إعدادات إضافية في Facebook Developer Console</li>
                <li>• هذا الحل المؤقت يتجنب مشاكل Edge Functions</li>
                <li>• يمكنك استخدام الصفحات المحفوظة في ميزات أخرى</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};