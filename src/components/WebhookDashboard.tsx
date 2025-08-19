import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Loader2, AlertTriangle, Eye, Settings, MessageSquare, Webhook, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface WebhookStatus {
  isConfigured: boolean;
  isReceivingEvents: boolean;
  lastEventTime?: string;
  connectedPagesCount: number;
  recentEvents: number;
  errorCount: number;
}

export const WebhookDashboard = () => {
  const navigate = useNavigate();
  const [webhookStatus, setWebhookStatus] = useState<WebhookStatus>({
    isConfigured: false,
    isReceivingEvents: false,
    connectedPagesCount: 0,
    recentEvents: 0,
    errorCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  const checkWebhookStatus = async () => {
    try {
      setLoading(true);
      
      // فحص الصفحات المتصلة
      const { data: pages, error: pagesError } = await supabase
        .from('facebook_pages')
        .select('*')
        .eq('is_active', true);

      if (pagesError) {
        console.error('Error fetching pages:', pagesError);
      }

      // فحص الأحداث الأخيرة (آخر 24 ساعة)
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data: recentLogs, error: logsError } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('webhook_type', 'facebook')
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (logsError) {
        console.error('Error fetching logs:', logsError);
      }

      // فحص آخر حدث
      const { data: lastEvent, error: lastEventError } = await supabase
        .from('webhook_logs')
        .select('created_at')
        .eq('webhook_type', 'facebook')
        .order('created_at', { ascending: false })
        .limit(1);

      if (lastEventError) {
        console.error('Error fetching last event:', lastEventError);
      }

      // حساب الأخطاء الأخيرة
      const errorLogs = recentLogs?.filter(log => {
        const eventData = log.event_data as any;
        return eventData?.error || !log.processed;
      }) || [];

      setWebhookStatus({
        isConfigured: (pages?.length || 0) > 0,
        isReceivingEvents: (recentLogs?.length || 0) > 0,
        lastEventTime: lastEvent?.[0]?.created_at,
        connectedPagesCount: pages?.length || 0,
        recentEvents: recentLogs?.length || 0,
        errorCount: errorLogs.length
      });

      setRecentLogs(recentLogs || []);

    } catch (error) {
      console.error('Error checking webhook status:', error);
      toast.error('خطأ في فحص حالة الويب هوك');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkWebhookStatus();
    // تحديث كل 30 ثانية
    const interval = setInterval(checkWebhookStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'تاريخ غير صحيح';
    }
  };

  const getStatusColor = () => {
    if (!webhookStatus.isConfigured) return 'red';
    if (!webhookStatus.isReceivingEvents) return 'yellow';
    return 'green';
  };

  const getStatusMessage = () => {
    if (!webhookStatus.isConfigured) {
      return 'لم يتم تكوين الويب هوك بعد';
    }
    if (!webhookStatus.isReceivingEvents) {
      return 'تم التكوين ولكن لا توجد أحداث حديثة';
    }
    return 'يعمل بشكل طبيعي';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>جارِ فحص حالة الويب هوك...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* حالة الويب هوك الرئيسية */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Webhook className="h-6 w-6" />
              <div>
                <CardTitle>حالة الويب هوك</CardTitle>
                <CardDescription>مراقبة الأحداث والردود التلقائية</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge 
                variant={getStatusColor() === 'green' ? 'default' : getStatusColor() === 'yellow' ? 'secondary' : 'destructive'}
                className="text-sm"
              >
                {getStatusMessage()}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={checkWebhookStatus}
                disabled={loading}
              >
                <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{webhookStatus.connectedPagesCount}</div>
              <div className="text-sm text-muted-foreground">صفحة متصلة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{webhookStatus.recentEvents}</div>
              <div className="text-sm text-muted-foreground">حدث خلال 24 ساعة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{webhookStatus.errorCount}</div>
              <div className="text-sm text-muted-foreground">خطأ حديث</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">آخر حدث</div>
              <div className="text-xs text-muted-foreground">
                {webhookStatus.lastEventTime 
                  ? formatDate(webhookStatus.lastEventTime)
                  : 'لا توجد أحداث'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الإرشادات والحلول */}
      <Tabs defaultValue="troubleshooting" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="troubleshooting">استكشاف الأخطاء</TabsTrigger>
          <TabsTrigger value="management">إدارة الويب هوك</TabsTrigger>
          <TabsTrigger value="logs">سجل الأحداث</TabsTrigger>
        </TabsList>

        <TabsContent value="troubleshooting" className="space-y-4">
          {!webhookStatus.isConfigured && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">لم يتم تكوين الويب هوك بعد</p>
                  <p className="text-sm">يجب أولاً تكوين الويب هوك لبدء استقبال التعليقات والرسائل.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/webhook')}
                    className="mt-2"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    إعداد الويب هوك الآن
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {webhookStatus.isConfigured && !webhookStatus.isReceivingEvents && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">لا توجد أحداث حديثة</p>
                  <p className="text-sm">الويب هوك مُكوّن ولكن لم نستقبل أي أحداث خلال الـ 24 ساعة الماضية.</p>
                  <div className="space-y-1 text-sm">
                    <p>• تأكد من أن الصفحة تستقبل تعليقات أو رسائل</p>
                    <p>• تحقق من صحة access tokens</p>
                    <p>• راجع إعدادات الويب هوك في فيسبوك</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {webhookStatus.errorCount > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">توجد أخطاء في معالجة الأحداث</p>
                  <p className="text-sm">تم اكتشاف {webhookStatus.errorCount} خطأ في الأحداث الأخيرة.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/webhook')}
                    className="mt-2"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    راجع الإعدادات
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {webhookStatus.isConfigured && webhookStatus.isReceivingEvents && webhookStatus.errorCount === 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium text-green-700">الويب هوك يعمل بشكل طبيعي! ✨</p>
                <p className="text-sm">يتم استقبال الأحداث ومعالجتها بنجاح.</p>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">أدوات الإدارة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/webhook')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  إعدادات الويب هوك المتقدمة
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/webhook')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  إدارة الصفحات المتصلة
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/events')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  مراجعة الأحداث والردود
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الأحداث الأخيرة</CardTitle>
              <CardDescription>آخر 10 أحداث خلال 24 ساعة</CardDescription>
            </CardHeader>
            <CardContent>
              {recentLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد أحداث حديثة</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentLogs.map((log, index) => (
                    <div key={log.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {log.processed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-medium text-sm">
                            {log.event_data?.verb === 'add' ? 'تعليق جديد' : 
                             log.event_data?.message ? 'رسالة خاصة' : 'حدث'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(log.created_at)}
                        </p>
                      </div>
                      <Badge variant={log.processed ? "default" : "destructive"} className="text-xs">
                        {log.processed ? 'تم المعالجة' : 'خطأ'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};