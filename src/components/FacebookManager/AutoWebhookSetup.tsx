import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, AlertCircle, Zap, RefreshCw, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PageStatus {
  pageId: string;
  pageName: string;
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
  hasToken?: boolean;
  tokenValid?: boolean;
  permissionError?: boolean;
}

export const AutoWebhookSetup = () => {
  const [pages, setPages] = useState<PageStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSetupRunning, setIsSetupRunning] = useState(false);
  const [summary, setSummary] = useState<{total: number, successful: number, failed: number} | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('facebook_pages')
        .select('page_id, page_name, access_token')
        .eq('is_active', true);

      if (error) throw error;

      const pageStatuses: PageStatus[] = (data || []).map(page => ({
        pageId: page.page_id,
        pageName: page.page_name,
        status: 'idle',
        hasToken: !!page.access_token
      }));

      setPages(pageStatuses);
      setSummary(null);
    } catch (error: any) {
      console.error('Error fetching pages:', error);
      toast.error(`خطأ في جلب الصفحات: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const setupAllWebhooks = async () => {
    setIsSetupRunning(true);
    
    // Mark all pages as processing
    setPages(prev => prev.map(page => ({
      ...page,
      status: 'processing',
      message: 'جاري إعداد الويب هوك...'
    })));
    
    try {
      console.log('🚀 بدء إعداد الويب هوك...');
      console.log('📋 الصفحات المراد إعدادها:', pages.map(p => ({ id: p.pageId, name: p.pageName })));
      
      const { data, error } = await supabase.functions.invoke('facebook-setup', {
        body: {
          action: 'subscribe_all_pages'
        }
      });

      console.log('📡 استجابة Edge Function:', { data, error });
      console.log('📊 حالة الاستجابة:', { success: data?.success, hasResults: !!data?.results });

      if (error) {
        console.error('❌ خطأ في Edge Function:', error);
        throw new Error(`Edge Function Error: ${error.message || error}`);
      }

      if (data.success) {
        // Update page statuses based on results
        const results = data.results || [];
        const updatedPages: PageStatus[] = pages.map(page => {
          const result = results.find((r: any) => r.page_id === page.pageId);
          if (result) {
            const permissionError = result.error && result.error.includes('pages_manage_metadata');
            return {
              ...page,
              status: result.success ? 'success' as const : 'error' as const,
              message: result.success ? 'تم إعداد الويب هوك بنجاح' : (result.error || 'فشل الإعداد'),
              permissionError
            };
          }
          return {
            ...page,
            status: 'error' as const,
            message: 'لم يتم العثور على نتيجة'
          };
        });
        
        setPages(updatedPages);
        setSummary(data.summary);
        
        if (data.summary.successful > 0) {
          toast.success(`${data.message} - نجح: ${data.summary.successful}، فشل: ${data.summary.failed}`);
        } else {
          toast.error(`فشل في إعداد جميع الصفحات. يرجى التحقق من الصلاحيات.`);
        }
      } else {
        throw new Error(data.error || 'فشل في إعداد الويب هوك');
      }
    } catch (error: any) {
      console.error('Setup error:', error);
      setPages(prev => prev.map(page => ({
        ...page,
        status: 'error',
        message: error.message
      })));
      toast.error(`خطأ في إعداد الويب هوك: ${error.message}`);
    } finally {
      setIsSetupRunning(false);
    }
  };

  const testTokens = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('facebook-setup', {
        body: {
          action: 'test_tokens'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        const results = data.results || [];
        const updatedPages: PageStatus[] = pages.map(page => {
          const result = results.find((r: any) => r.page_id === page.pageId);
          if (result) {
            return {
              ...page,
              status: result.valid ? 'success' as const : 'error' as const,
              message: result.valid ? 'التوكن صالح' : (result.error || 'التوكن غير صالح'),
              hasToken: !!page.hasToken,
              tokenValid: result.valid
            };
          }
          return page;
        });
        
        setPages(updatedPages);
        const validCount = results.filter((r: any) => r.valid).length;
        const invalidCount = results.filter((r: any) => !r.valid).length;
        toast.success(`اختبار التوكنات مكتمل - صالح: ${validCount}، غير صالح: ${invalidCount}`);
      }
    } catch (error: any) {
      console.error('Test error:', error);
      toast.error(`خطأ في اختبار التوكنات: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (page: PageStatus) => {
    if (!page.hasToken) {
      return <Badge variant="destructive">لا يوجد توكن</Badge>;
    }

    if (page.permissionError) {
      return <Badge variant="destructive">نقص صلاحيات</Badge>;
    }
    
    switch (page.status) {
      case 'success':
        return <Badge variant="default">نجح</Badge>;
      case 'error':
        return <Badge variant="destructive">فشل</Badge>;
      case 'processing':
        return <Badge variant="secondary">جاري المعالجة</Badge>;
      default:
        return <Badge variant="outline">في الانتظار</Badge>;
    }
  };

  const hasPermissionIssues = pages.some(page => page.permissionError);
  const hasTokenIssues = pages.some(page => !page.hasToken || page.tokenValid === false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            إعداد الويب هوك التلقائي
          </CardTitle>
          <CardDescription>
            إعداد تلقائي للويب هوك لجميع الصفحات المحفوظة لاستقبال الرسائل والتعليقات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={setupAllWebhooks}
              disabled={isSetupRunning || pages.length === 0}
              className="flex-1"
            >
              {isSetupRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جارِ إعداد الويب هوك...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  إعداد الويب هوك لجميع الصفحات
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={testTokens}
              disabled={isLoading || pages.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  اختبار
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  اختبار التوكنات
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={fetchPages}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  تحديث
                </>
              )}
            </Button>
          </div>
          
          {pages.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد صفحات محفوظة. يرجى إضافة صفحات أولاً من خلال قسم "الإعداد المباشر".
            </div>
          )}

          {summary && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
                <div className="text-sm text-muted-foreground">إجمالي الصفحات</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.successful}</div>
                <div className="text-sm text-muted-foreground">نجح</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                <div className="text-sm text-muted-foreground">فشل</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {pages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>حالة الصفحات ({pages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pages.map((page) => (
                <div 
                  key={page.pageId} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(page.status)}
                    <div>
                      <p className="font-medium">{page.pageName}</p>
                      <p className="text-sm text-muted-foreground">{page.pageId}</p>
                      {page.message && (
                        <p className={`text-sm mt-1 ${
                          page.status === 'error' ? 'text-red-600' : 
                          page.status === 'success' ? 'text-green-600' : 
                          'text-muted-foreground'
                        }`}>
                          {page.message}
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(page)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(hasPermissionIssues || hasTokenIssues) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm">
              <p className="font-medium text-red-900">تنبيهات هامة:</p>
              <ul className="space-y-1 text-red-800">
                {hasPermissionIssues && (
                  <li>• يوجد صفحات تحتاج صلاحية pages_manage_metadata لإعداد الويب هوك</li>
                )}
                {hasTokenIssues && (
                  <li>• يوجد صفحات بدون توكنات صالحة</li>
                )}
                <li>• يرجى الحصول على Access Token جديد مع جميع الصلاحيات المطلوبة</li>
                <li>• استخدم قسم "الإعداد المباشر" لإعداد الصفحات مع الصلاحيات الصحيحة</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <p className="font-medium text-blue-900">معلومات الإعداد:</p>
            <ul className="space-y-1 text-blue-800">
              <li>• يتم إعداد الويب هوك للرسائل فقط لتجنب مشاكل الصلاحيات</li>
              <li>• الصلاحيات المطلوبة: pages_manage_metadata, pages_messaging</li>
              <li>• في حالة فشل الإعداد، استخدم "الإعداد المباشر" للحصول على صلاحيات جديدة</li>
              <li>• يمكن اختبار صحة التوكنات قبل إعداد الويب هوك</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};