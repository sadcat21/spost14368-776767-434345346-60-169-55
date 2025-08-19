import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Settings, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { AccessTokenDialog } from './AccessTokenDialog';

export const AdvancedWebhookManager = () => {
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [showTokenDialog, setShowTokenDialog] = useState(false);

  const handleAdvancedSetup = async (pageId: string, accessToken: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('facebook-setup', {
        body: {
          action: 'setup_advanced_webhook',
          pageId,
          accessToken
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('تم إعداد الويب هوك المتقدم بنجاح');
        await loadWebhookSubscriptions();
      } else {
        toast.error(data.error || 'فشل في إعداد الويب هوك');
      }
    } catch (error: any) {
      console.error('Advanced webhook setup error:', error);
      toast.error(error.message || 'حدث خطأ أثناء إعداد الويب هوك');
    } finally {
      setLoading(false);
    }
  };

  const handleGetSubscriptions = async (pageId: string, accessToken: string) => {
    if (!pageId || !accessToken) {
      toast.error('معرف الصفحة والـ Access Token مطلوبان');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Fetching subscriptions for page:', pageId);
      
      const { data, error } = await supabase.functions.invoke('facebook-setup', {
        body: {
          action: 'get_webhook_subscriptions',
          pageId: pageId,
          accessToken: accessToken
        }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'فشل في استدعاء الدالة');
      }

      if (data?.success) {
        setSubscriptions(data.subscriptions || []);
        toast.success('تم تحديث معلومات الاشتراكات');
      } else {
        console.error('Function returned error:', data);
        toast.error(data?.error || 'فشل في الحصول على الاشتراكات');
      }
    } catch (error: any) {
      console.error('Get subscriptions error:', error);
      toast.error(error.message || 'حدث خطأ أثناء جلب الاشتراكات');
    } finally {
      setLoading(false);
    }
  };

  const fixPageSubscriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('facebook-setup', {
        body: {
          action: 'fix_page_subscriptions'
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message || 'تم إصلاح اشتراكات الصفحات بنجاح');
        await loadWebhookSubscriptions();
      } else {
        toast.error(data.error || 'فشل في إصلاح الاشتراكات');
      }
    } catch (error: any) {
      console.error('Fix page subscriptions error:', error);
      toast.error(error.message || 'حدث خطأ أثناء إصلاح الاشتراكات');
    } finally {
      setLoading(false);
    }
  };

  const processUnprocessedEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('facebook-webhook-v2', {
        body: {
          action: 'reprocess_events'
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`تم إعادة معالجة ${data.processedCount || 0} حدث`);
      } else {
        toast.error('فشل في إعادة معالجة الأحداث');
      }
    } catch (error: any) {
      console.error('Process events error:', error);
      toast.error(error.message || 'حدث خطأ أثناء معالجة الأحداث');
    } finally {
      setLoading(false);
    }
  };

  const loadPages = async () => {
    try {
      // البحث في api_keys أولاً
      const { data: apiData, error: apiError } = await supabase
        .from('api_keys')
        .select('key_value')
        .eq('key_name', 'FACEBOOK_ACCESS_TOKEN')
        .eq('user_id', '00000000-0000-0000-0000-000000000000')
        .single();

      if (apiError || !apiData?.key_value) {
        setShowTokenDialog(true);
        return;
      }

      const { data, error } = await supabase
        .from('facebook_pages')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setPages(data || []);
    } catch (error: any) {
      console.error('Load pages error:', error);
      toast.error('فشل في تحميل الصفحات');
    }
  };

  const loadWebhookSubscriptions = async () => {
    if (pages.length === 0) return;
    
    const allSubscriptions = [];
    for (const page of pages) {
      try {
        const { data, error } = await supabase.functions.invoke('facebook-setup', {
          body: {
            action: 'get_webhook_subscriptions',
            pageId: page.page_id,
            accessToken: page.access_token
          }
        });

        if (data?.success && data.subscriptions) {
          allSubscriptions.push({
            page_id: page.page_id,
            page_name: page.page_name,
            subscriptions: data.subscriptions
          });
        }
      } catch (error) {
        console.error(`Failed to get subscriptions for ${page.page_name}:`, error);
      }
    }
    setSubscriptions(allSubscriptions);
  };

  React.useEffect(() => {
    loadPages();
  }, []);

  React.useEffect(() => {
    if (pages.length > 0) {
      loadWebhookSubscriptions();
    }
  }, [pages]);

  const recommendedFields = [
    'messages', 'messaging_postbacks', 'messaging_optins', 'messaging_referrals',
    'message_deliveries', 'message_reads', 'feed', 'mention', 'name', 'picture',
    'category', 'description', 'conversations', 'branded_camera', 'feature_access_list',
    'inbox_labels', 'page_backed_instagram_accounts', 'videos'
  ];

  return (
    <div className="space-y-6">
      {/* تعليمات إعادة التكوين */}
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" />
            مشكلة عدم ظهور محتوى التعليقات
          </CardTitle>
          <CardDescription className="text-orange-700">
            المشكلة: فيسبوك يرسل إشعارات عامة بدون تفاصيل التعليق
          </CardDescription>
        </CardHeader>
        <CardContent className="text-orange-700 space-y-3">
          <p><strong>السبب:</strong> إعدادات الويب هوك لا تطلب الحقول المطلوبة</p>
          <p><strong>الحل:</strong> إعادة تكوين الاشتراك لطلب جميع الحقول المتاحة</p>
          
          <div className="bg-white/50 p-3 rounded-lg">
            <p className="font-semibold mb-2">الحقول المطلوبة:</p>
            <div className="flex flex-wrap gap-1">
              {recommendedFields.map(field => (
                <Badge key={field} variant="outline" className="text-xs">
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* إعداد متقدم للصفحات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إعداد الويب هوك المتقدم
          </CardTitle>
          <CardDescription>
            إعادة تكوين الويب هوك لجميع الصفحات مع الحقول الكاملة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pages.length === 0 ? (
            <p className="text-muted-foreground">لا توجد صفحات محفوظة</p>
          ) : (
            <div className="space-y-3">
              {pages.map(page => (
                <div key={page.page_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{page.page_name}</h4>
                    <p className="text-sm text-muted-foreground">ID: {page.page_id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGetSubscriptions(page.page_id, page.access_token)}
                      disabled={loading}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      فحص الاشتراكات
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAdvancedSetup(page.page_id, page.access_token)}
                      disabled={loading}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      إعداد متقدم
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t space-y-3">
            <Button
              onClick={processUnprocessedEvents}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              🔄 إعادة معالجة الأحداث غير المعالجة
            </Button>
            
            <Button
              onClick={fixPageSubscriptions}
              disabled={loading || pages.length === 0}
              className="w-full"
              variant="destructive"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Settings className="h-4 w-4 mr-2" />
              )}
              🔧 إصلاح مشكلة استقبال الأحداث من object: user
            </Button>
            
            <Button
              onClick={() => pages.forEach(page => 
                handleAdvancedSetup(page.page_id, page.access_token)
              )}
              disabled={loading || pages.length === 0}
              className="w-full"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Settings className="h-4 w-4 mr-2" />
              )}
              إعداد الويب هوك المتقدم لجميع الصفحات
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* عرض الاشتراكات الحالية */}
      {subscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>الاشتراكات الحالية</CardTitle>
            <CardDescription>
              حالة اشتراكات الويب هوك لكل صفحة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptions.map((pageSubscription, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">{pageSubscription.page_name}</h4>
                  
                  {pageSubscription.subscriptions && pageSubscription.subscriptions.length > 0 ? (
                    <div className="space-y-2">
                      {pageSubscription.subscriptions.map((sub: any, subIndex: number) => (
                        <div key={subIndex} className="bg-muted/50 p-3 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="font-medium">تطبيق: {sub.id}</span>
                          </div>
                          
                          {sub.subscribed_fields && (
                            <div>
                              <p className="text-sm font-medium mb-1">الحقول المشترك بها:</p>
                              <div className="flex flex-wrap gap-1">
                                {(() => {
                                  // تحقق من نوع البيانات وتحويلها إلى مصفوفة
                                  let fields: string[] = [];
                                  
                                  if (typeof sub.subscribed_fields === 'string') {
                                    fields = sub.subscribed_fields.split(',');
                                  } else if (Array.isArray(sub.subscribed_fields)) {
                                    fields = sub.subscribed_fields;
                                  } else {
                                    fields = [sub.subscribed_fields?.toString() || ''];
                                  }
                                  
                                  return fields.map((field: string) => (
                                    <Badge 
                                      key={field} 
                                      variant={recommendedFields.includes(field.trim()) ? "default" : "secondary"}
                                      className="text-xs"
                                    >
                                      {field.trim()}
                                    </Badge>
                                  ));
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-600">
                      <XCircle className="h-4 w-4" />
                      <span>لا توجد اشتراكات نشطة</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* تعليمات إضافية */}
      <Card>
        <CardHeader>
          <CardTitle>خطوات حل المشكلة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
            <p>تشغيل الإعداد المتقدم لجميع الصفحات</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
            <p>التأكد من أن جميع الحقول المطلوبة مشتركة</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
            <p>اختبار الويب هوك بتعليق جديد</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
            <p>مراجعة سجلات الويب هوك للتأكد من وصول البيانات الكاملة</p>
          </div>
        </CardContent>
      </Card>
      
      <AccessTokenDialog 
        open={showTokenDialog} 
        onClose={() => setShowTokenDialog(false)} 
      />
    </div>
  );
};