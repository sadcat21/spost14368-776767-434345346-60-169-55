import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle, XCircle, Loader2, RefreshCw, Trash2, Check, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDateInArabic } from '@/utils/dateUtils';

interface ConnectedPage {
  page_id: string;
  page_name: string;
  page_category: string;
  page_picture_url?: string;
  access_token: string;
  webhook_status: 'active' | 'inactive' | 'error' | 'unknown';
  last_activity?: string;
  created_at: string;
}

interface DisconnectStatus {
  pageId: string;
  pageName: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export const ConnectedPagesManager = () => {
  const [connectedPages, setConnectedPages] = useState<ConnectedPage[]>([]);
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set());
  const [disconnectStatuses, setDisconnectStatuses] = useState<DisconnectStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const fetchConnectedPages = async () => {
    setIsLoading(true);
    try {
      console.log('📞 Starting fetchConnectedPages...');
      
      const { data, error } = await supabase.functions.invoke('facebook-setup', {
        body: {
          action: 'get_connected_pages'
        }
      });

      console.log('📡 Edge Function response:', { data, error });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(`خطأ في استدعاء Edge Function: ${error.message}`);
      }

      if (!data) {
        console.error('❌ No data received from Edge Function');
        throw new Error('لم يتم استلام بيانات من الخادم');
      }

      if (data.success) {
        console.log('✅ Successfully fetched pages:', data.pages?.length || 0);
        setConnectedPages(data.pages || []);
        setSelectedPageIds(new Set()); // إعادة تعيين التحديد
        toast.success(`تم جلب ${data.pages?.length || 0} صفحة بنجاح`);
      } else {
        console.error('❌ Edge Function returned success: false', data);
        throw new Error(data.error || 'فشل في جلب الصفحات المتصلة');
      }
    } catch (error: any) {
      console.error('💥 Error in fetchConnectedPages:', error);
      const errorMessage = error.message || 'خطأ غير معروف';
      toast.error(`خطأ في جلب الصفحات المتصلة: ${errorMessage}`);
      setConnectedPages([]); // تفريغ القائمة في حالة الخطأ
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectedPages();
  }, []);

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
    if (selectedPageIds.size === connectedPages.length) {
      setSelectedPageIds(new Set());
    } else {
      setSelectedPageIds(new Set(connectedPages.map(page => page.page_id)));
    }
  };

  const disconnectSelectedPages = async () => {
    if (selectedPageIds.size === 0) {
      toast.error('يرجى اختيار صفحة واحدة على الأقل');
      return;
    }

    const selectedPages = connectedPages.filter(page => selectedPageIds.has(page.page_id));
    setIsDisconnecting(true);
    
    const statuses: DisconnectStatus[] = selectedPages.map(page => ({
      pageId: page.page_id,
      pageName: page.page_name,
      status: 'pending'
    }));
    setDisconnectStatuses(statuses);

    for (const page of selectedPages) {
      try {
        const { data, error } = await supabase.functions.invoke('facebook-setup', {
          body: {
            action: 'disconnect_page',
            pageId: page.page_id
          }
        });

        if (error) {
          throw new Error(`خطأ في قطع الاتصال: ${error.message}`);
        }

        if (data.success) {
          setDisconnectStatuses(prev => prev.map(status => 
            status.pageId === page.page_id 
              ? { ...status, status: 'success', message: 'تم قطع الاتصال بنجاح' }
              : status
          ));
        } else {
          throw new Error(data.error || 'فشل في قطع الاتصال');
        }

      } catch (error: any) {
        console.error(`Error disconnecting page ${page.page_id}:`, error);
        setDisconnectStatuses(prev => prev.map(status => 
          status.pageId === page.page_id 
            ? { ...status, status: 'error', message: error.message }
            : status
        ));
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsDisconnecting(false);
    toast.success(`تم الانتهاء من قطع الاتصال لـ ${selectedPages.length} صفحة`);
    
    // إعادة جلب الصفحات المتصلة
    setTimeout(() => {
      fetchConnectedPages();
      setDisconnectStatuses([]);
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">نشط</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">غير نشط</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">خطأ</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">غير محدد</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDateInArabic(dateString, true);
    } catch {
      return 'تاريخ غير صحيح';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>الصفحات المتصلة بالويب هوك</CardTitle>
              <CardDescription>
                إدارة الصفحات المتصلة حاليًا بنظام الويب هوك
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchConnectedPages}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="mr-2">جارِ جلب الصفحات...</span>
            </div>
          ) : connectedPages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
              <p className="text-lg font-medium mb-2">لا توجد صفحات متصلة</p>
              <p className="text-sm">لم يتم العثور على أي صفحات متصلة بنظام الويب هوك</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  إجمالي الصفحات المتصلة: {connectedPages.length}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  {selectedPageIds.size === connectedPages.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                </Button>
              </div>

              <div className="grid gap-3">
                {connectedPages.map((page) => (
                  <div key={page.page_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        checked={selectedPageIds.has(page.page_id)}
                        onCheckedChange={(checked) => handlePageSelection(page.page_id, checked as boolean)}
                        className="ml-3"
                      />
                      {page.page_picture_url && (
                        <img 
                          src={page.page_picture_url} 
                          alt={page.page_name}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{page.page_name}</p>
                          {getStatusBadge(page.webhook_status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{page.page_category}</p>
                        <p className="text-xs text-muted-foreground">
                          متصل منذ: {formatDate(page.created_at)}
                        </p>
                        {page.last_activity && (
                          <p className="text-xs text-muted-foreground">
                            آخر نشاط: {formatDate(page.last_activity)}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono">{page.page_id}</Badge>
                  </div>
                ))}
              </div>

              {selectedPageIds.size > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      تم اختيار {selectedPageIds.size} من أصل {connectedPages.length} صفحة
                    </p>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive"
                        disabled={isDisconnecting}
                        className="w-full"
                        size="lg"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        قطع الاتصال للصفحات المختارة ({selectedPageIds.size})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد قطع الاتصال</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من قطع الاتصال للصفحات المختارة؟ سيؤدي ذلك إلى:
                          <br />• إزالة الويب هوك من الصفحات
                          <br />• حذف رموز الوصول المحفوظة
                          <br />• توقف الرد على التعليقات والرسائل
                          <br /><br />
                          <strong>عدد الصفحات المختارة: {selectedPageIds.size}</strong>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={disconnectSelectedPages} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          تأكيد قطع الاتصال
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {disconnectStatuses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>حالة قطع الاتصال</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {disconnectStatuses.map((status) => (
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
    </div>
  );
};