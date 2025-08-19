import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Loader2, Info, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DirectFacebookSetup } from './DirectFacebookSetup';
import { ConnectedPagesManager } from './ConnectedPagesManager';

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

export const PagesWebhookSetup = () => {
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
      const { data, error } = await supabase.functions.invoke('facebook-setup', {
        body: {
          action: 'get_page_info',
          accessToken: accessToken.trim()
        }
      });

      console.log('Facebook setup response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`خطأ في استدعاء Edge Function: ${error.message}`);
      }

      if (data.success) {
        setPages(data.pages);
        setSelectedPageIds(new Set()); // إعادة تعيين التحديد
        toast.success(`تم العثور على ${data.pages.length} صفحة`);
      } else {
        throw new Error(data.error || 'فشل في جلب الصفحات');
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
      // إلغاء تحديد الكل
      setSelectedPageIds(new Set());
    } else {
      // تحديد الكل
      setSelectedPageIds(new Set(pages.map(page => page.id)));
    }
  };

  const setupWebhooksForSelectedPages = async () => {
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
        // حفظ معلومات الصفحة وتوكن الوصول
        const { data: saveData, error: saveError } = await supabase.functions.invoke('facebook-setup', {
          body: {
            action: 'save_access_token',
            pageId: page.id,
            accessToken: page.access_token,
            pageInfo: {
              name: page.name,
              category: page.category,
              picture: page.picture
            }
          }
        });

        console.log('Save token response:', { saveData, saveError });

        if (saveError) {
          console.error('Save token error:', saveError);
          throw new Error(`خطأ في حفظ التوكن: ${saveError.message}`);
        }

        if (!saveData.success) {
          throw new Error(saveData.error || 'فشل في حفظ معلومات الصفحة');
        }

        // إعداد الويب هوك للصفحة
        console.log(`Starting webhook setup for page: ${page.id} (${page.name})`);
        
        const { data: webhookData, error: webhookError } = await supabase.functions.invoke('facebook-setup', {
          body: {
            action: 'setup_webhook',
            pageId: page.id,
            accessToken: page.access_token
          }
        });

        console.log('Webhook setup full response:', { 
          data: webhookData, 
          error: webhookError,
          pageId: page.id,
          pageName: page.name 
        });

        if (webhookError) {
          console.error('Webhook setup Supabase error:', webhookError);
          console.error('Error details:', {
            message: webhookError.message,
            status: webhookError.status,
            statusText: webhookError.statusText,
            body: webhookError.body
          });
          throw new Error(`خطأ في إعداد الويب هوك: ${webhookError.message || 'خطأ غير محدد'}`);
        }

        if (webhookData.success) {
          setWebhookStatuses(prev => prev.map(status => 
            status.pageId === page.id 
              ? { ...status, status: 'success', message: 'تم إعداد الويب هوك بنجاح' }
              : status
          ));
        } else {
          throw new Error(webhookData.error || 'فشل في إعداد الويب هوك');
        }

      } catch (error: any) {
        console.error(`Error setting up webhook for page ${page.id}:`, error);
        setWebhookStatuses(prev => prev.map(status => 
          status.pageId === page.id 
            ? { ...status, status: 'error', message: error.message }
            : status
        ));
      }

      // انتظار قصير بين الطلبات لتجنب rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsSettingUpWebhooks(false);
    toast.success(`تم الانتهاء من إعداد الويب هوك لـ ${selectedPages.length} صفحة`);
  };

  return (
    <Tabs defaultValue="manage" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="manage">إدارة الصفحات المتصلة</TabsTrigger>
        <TabsTrigger value="direct">الإعداد المباشر (موصى به)</TabsTrigger>
        <TabsTrigger value="edge">عبر Edge Function</TabsTrigger>
      </TabsList>
      
      <TabsContent value="manage">
        <ConnectedPagesManager />
      </TabsContent>
      
      <TabsContent value="direct">
        <DirectFacebookSetup />
      </TabsContent>
      
      <TabsContent value="edge" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>إعداد الويب هوك للصفحات المختارة</CardTitle>
            <CardDescription>
              أدخل رمز الوصول لفيسبوك لجلب الصفحات واختر التي تريد إعداد الويب هوك لها
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
                    اختر الصفحات التي تريد إعداد الويب هوك لها
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
                    onClick={setupWebhooksForSelectedPages}
                    disabled={isSettingUpWebhooks}
                    className="w-full"
                    size="lg"
                  >
                    {isSettingUpWebhooks ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جارِ إعداد الويب هوك...
                      </>
                    ) : (
                      `إعداد الويب هوك للصفحات المختارة (${selectedPageIds.size})`
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
              <CardTitle>حالة إعداد الويب هوك</CardTitle>
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
                <p className="font-medium text-blue-900">معلومات مهمة:</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• يمكنك اختيار الصفحات التي تريد إعداد الويب هوك لها فقط</li>
                  <li>• سيتم حفظ رمز الوصول لكل صفحة مختارة في قاعدة البيانات</li>
                  <li>• سيتم إعداد الويب هوك للاستماع للرسائل والتعليقات</li>
                  <li>• يمكنك متابعة الرسائل الواردة في لوحة التحكم</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};