import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AccessTokenDialog } from './FacebookManager/AccessTokenDialog';
import { 
  Webhook, 
  MessageSquare, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Send,
  Trash2,
  Plus,
  Copy
} from 'lucide-react';

interface AutoReply {
  id: string;
  page_id: string;
  trigger_keywords: string[];
  reply_message: string;
  reply_type: 'message' | 'comment';
  is_active: boolean;
  priority: number;
}

interface WebhookLog {
  id: string;
  webhook_type: string;
  page_id: string;
  event_data: any;
  processed: boolean;
  error_message?: string;
  created_at: string;
}

export const FacebookWebhookManager: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [setupStatus, setSetupStatus] = useState<'idle' | 'setting-up' | 'success' | 'error'>('idle');
  const [autoReplies, setAutoReplies] = useState<AutoReply[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);

  // New auto-reply form
  const [newReply, setNewReply] = useState({
    keywords: '',
    message: '',
    type: 'message' as 'message' | 'comment',
    priority: 1
  });

  useEffect(() => {
    // Set webhook URL and verify token
    const baseUrl = 'https://msrtbumkztdwtoqysykf.supabase.co';
    setWebhookUrl(`${baseUrl}/functions/v1/facebook-webhook-v2`);
    setVerifyToken('facebook_webhook_verify_token_123');
    
    loadAutoReplies();
    loadWebhookLogs();

    // Auto-refresh webhook logs every 10 seconds
    const interval = setInterval(() => {
      loadWebhookLogs();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadAutoReplies = async () => {
    try {  
      // استخدام page_events بدلاً من auto_replies حتى يتم إنشاء الجدول
      const { data, error } = await supabase
        .from('page_events')
        .select('*')
        .eq('event_type', 'auto_reply')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // تحويل البيانات إلى شكل AutoReply مؤقتاً
      const formattedReplies = (data || []).map((item: any) => ({
        id: item.id,
        page_id: item.page_id || 'default',
        trigger_keywords: (typeof item.metadata === 'object' && item.metadata?.keywords) || [],
        reply_message: item.content || '',
        reply_type: (typeof item.metadata === 'object' && item.metadata?.type) || 'message',
        is_active: (typeof item.metadata === 'object' && item.metadata?.enabled) || false,
        priority: 1
      }));
      
      setAutoReplies(formattedReplies);
    } catch (error) {
      console.error('Error loading auto-replies:', error);
      toast.error('فشل في تحميل الردود التلقائية');
    }
  };

  const loadWebhookLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setWebhookLogs(data || []);
    } catch (error) {
      console.error('Error loading webhook logs:', error);
    }
  };

  const setupWebhook = async () => {
    setIsLoading(true);
    setSetupStatus('setting-up');

    try {
      // Get saved access token
      const { data: apiData, error } = await supabase
        .from('api_keys')
        .select('key_value')
        .eq('key_name', 'FACEBOOK_ACCESS_TOKEN')
        .single();

      if (error || !apiData) {
        setShowTokenDialog(true);
        return;
      }

      const accessToken = apiData.key_value;

      // Get page info first
      const setupResponse = await supabase.functions.invoke('facebook-setup', {
        body: {
          action: 'get_page_info',
          accessToken
        }
      });

      if (setupResponse.error) {
        throw new Error(setupResponse.error.message);
      }

      const { pages } = setupResponse.data;
      
      if (!pages || pages.length === 0) {
        throw new Error('لم يتم العثور على صفحات فيسبوك');
      }

      // Setup webhook for first page
      const firstPage = pages[0];
      const webhookResponse = await supabase.functions.invoke('facebook-setup', {
        body: {
          action: 'setup_webhook',
          pageId: firstPage.id,
          accessToken: firstPage.access_token
        }
      });

      if (webhookResponse.error) {
        throw new Error(webhookResponse.error.message);
      }

      setSetupStatus('success');
      toast.success('تم إعداد الويب هوك بنجاح!');
      
      // Test webhook
      await testWebhook(firstPage.id);

    } catch (error: any) {
      console.error('Webhook setup error:', error);
      setSetupStatus('error');
      toast.error(error.message || 'فشل في إعداد الويب هوك');
    } finally {
      setIsLoading(false);
    }
  };

  const testWebhook = async (pageId: string) => {
    try {
      const response = await supabase.functions.invoke('facebook-setup', {
        body: {
          action: 'test_webhook',
          pageId
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('تم اختبار الويب هوك بنجاح');
      loadWebhookLogs();
    } catch (error: any) {
      console.error('Test webhook error:', error);
      toast.error('فشل في اختبار الويب هوك');
    }
  };

  const addAutoReply = async () => {
    if (!newReply.message.trim()) {
      toast.error('يرجى إدخال رسالة الرد');
      return;
    }

    setIsLoading(true);
    try {
      const keywords = newReply.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      const replyData = {
        event_type: 'auto_reply',
        page_id: 'default',
        content: newReply.message,
        metadata: {
          keywords: keywords,
          type: newReply.type,
          enabled: true
        }
      };

      const { error } = await supabase
        .from('page_events')
        .insert(replyData);

      if (error) throw error;

      setNewReply({
        keywords: '',
        message: '',
        type: 'message',
        priority: 1
      });

      toast.success('تم إضافة الرد التلقائي بنجاح');
      loadAutoReplies();
    } catch (error: any) {
      console.error('Error adding auto-reply:', error);
      toast.error('فشل في إضافة الرد التلقائي');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutoReply = async (id: string, isActive: boolean) => {
    try {
      // تحديث في page_events بدلاً من auto_replies
      const autoReply = autoReplies.find(reply => reply.id === id);
      if (!autoReply) return;

      const updatedMetadata = {
        ...(typeof autoReply.reply_message === 'object' ? autoReply.reply_message : {}),
        enabled: isActive
      };

      const { error } = await supabase
        .from('page_events')
        .update({ 
          metadata: updatedMetadata
        })
        .eq('id', id);

      if (error) throw error;
      
      loadAutoReplies();
      toast.success(isActive ? 'تم تفعيل الرد التلقائي' : 'تم إلغاء تفعيل الرد التلقائي');
    } catch (error) {
      toast.error('فشل في تحديث الرد التلقائي');
    }
  };

  const deleteAutoReply = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الرد التلقائي؟')) return;

    try {
      const { error } = await supabase
        .from('page_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      loadAutoReplies();
      toast.success('تم حذف الرد التلقائي');
    } catch (error) {
      toast.error('فشل في حذف الرد التلقائي');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ');
  };

  const subscribeAllPages = async () => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('facebook-setup', {
        body: {
          action: 'subscribe_all_pages'
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { results } = response.data;
      let successCount = 0;
      let failureCount = 0;

      results.forEach((result: any) => {
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
          console.error(`فشل في صفحة ${result.page_name}:`, result.error || result.result);
        }
      });

      if (failureCount > 0) {
        toast.error(`فشل اشتراك ${failureCount} صفحة. السبب المحتمل: انتهاء صلاحية Access Token أو نقص في الصلاحيات`);
      }
      
      if (successCount > 0) {
        toast.success(`تم اشتراك ${successCount} صفحة بنجاح`);
      }
      
    } catch (error: any) {
      console.error('Subscribe all pages error:', error);
      toast.error(error.message || 'فشل في اشتراك الصفحات');
    } finally {
      setIsLoading(false);
    }
  };

  const testTokens = async () => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('facebook-setup', {
        body: {
          action: 'test_tokens'
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { results } = response.data;
      results.forEach((result: any) => {
        if (result.valid) {
          toast.success(`صفحة ${result.page_name}: صحيحة ✅`);
        } else {
          toast.error(`صفحة ${result.page_name}: غير صحيحة ❌ - ${result.error}`);
        }
      });
      
    } catch (error: any) {
      console.error('Test tokens error:', error);
      toast.error(error.message || 'فشل في اختبار الرموز');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-8">
        <Webhook className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">إدارة ويب هوك فيسبوك</h1>
          <p className="text-muted-foreground">إعداد الردود التلقائية والاشعارات</p>
        </div>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">الإعداد</TabsTrigger>
          <TabsTrigger value="auto-replies">الردود التلقائية</TabsTrigger>
          <TabsTrigger value="logs">سجل الأحداث</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                إعداد الويب هوك
              </CardTitle>
              <CardDescription>
                قم بإعداد الويب هوك لاستقبال الاشعارات من فيسبوك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>رابط الويب هوك</Label>
                <div className="flex gap-2">
                  <Input value={webhookUrl} readOnly className="flex-1" />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(webhookUrl)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>رمز التحقق</Label>
                <div className="flex gap-2">
                  <Input value={verifyToken} readOnly className="flex-1" />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(verifyToken)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                {setupStatus === 'success' && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    تم الإعداد بنجاح
                  </Badge>
                )}
                {setupStatus === 'error' && (
                  <Badge variant="destructive">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    فشل في الإعداد
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={setupWebhook}
                  disabled={isLoading || setupStatus === 'setting-up'}
                  className="w-full"
                >
                  {setupStatus === 'setting-up' ? 'جاري الإعداد...' : 'إعداد الويب هوك'}
                </Button>
                
                <Button 
                  onClick={testTokens}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? 'جاري الاختبار...' : 'اختبار صحة رموز الصفحات'}
                </Button>
                
                <Button 
                  onClick={subscribeAllPages}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? 'جاري الاشتراك...' : 'اشتراك جميع الصفحات في الأحداث'}
                </Button>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>ملاحظة:</strong> يجب أن تقوم بإضافة رابط الويب هوك ورمز التحقق في إعدادات تطبيق فيسبوك الخاص بك.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auto-replies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                إضافة رد تلقائي جديد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الكلمات المفتاحية (مفصولة بفاصلة)</Label>
                  <Input
                    value={newReply.keywords}
                    onChange={(e) => setNewReply(prev => ({ ...prev, keywords: e.target.value }))}
                    placeholder="مرحبا، السلام عليكم، معلومات"
                  />
                </div>

                <div className="space-y-2">
                  <Label>نوع الرد</Label>
                  <Select
                    value={newReply.type}
                    onValueChange={(value: 'message' | 'comment') => 
                      setNewReply(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="message">رسالة خاصة</SelectItem>
                      <SelectItem value="comment">رد على تعليق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>رسالة الرد</Label>
                <Textarea
                  value={newReply.message}
                  onChange={(e) => setNewReply(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="شكراً لتواصلك معنا..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>الأولوية (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newReply.priority}
                  onChange={(e) => setNewReply(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                />
              </div>

              <Button onClick={addAutoReply} disabled={isLoading} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                إضافة رد تلقائي
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الردود التلقائية الحالية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {autoReplies.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد ردود تلقائية مضافة بعد
                  </p>
                ) : (
                  autoReplies.map((reply) => (
                    <div key={reply.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={reply.reply_type === 'message' ? 'default' : 'secondary'}>
                            {reply.reply_type === 'message' ? 'رسالة' : 'تعليق'}
                          </Badge>
                          <Badge variant="outline">أولوية {reply.priority}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={reply.is_active}
                            onCheckedChange={(checked) => toggleAutoReply(reply.id, checked)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAutoReply(reply.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <p className="font-medium">الكلمات المفتاحية:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {reply.trigger_keywords.map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="font-medium">رسالة الرد:</p>
                        <p className="text-sm text-muted-foreground mt-1 bg-muted p-2 rounded">
                          {reply.reply_message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                سجل أحداث الويب هوك
              </CardTitle>
              <CardDescription>
                آخر الأحداث المستلمة من فيسبوك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhookLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    لم يتم استلام أي أحداث بعد
                  </p>
                ) : (
                  webhookLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={log.processed ? 'default' : 'secondary'}>
                          {log.webhook_type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleString('ar-SA')}
                        </span>
                      </div>
                      
                      {log.error_message && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{log.error_message}</AlertDescription>
                        </Alert>
                      )}
                      
                      <details className="text-sm">
                        <summary className="cursor-pointer text-muted-foreground">
                          عرض تفاصيل الحدث
                        </summary>
                        <pre className="mt-2 bg-muted p-2 rounded text-xs overflow-auto">
                          {JSON.stringify(log.event_data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات متقدمة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  الإعدادات المتقدمة ستكون متاحة في النسخة القادمة
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AccessTokenDialog 
        open={showTokenDialog} 
        onClose={() => setShowTokenDialog(false)} 
      />
    </div>
  );
};