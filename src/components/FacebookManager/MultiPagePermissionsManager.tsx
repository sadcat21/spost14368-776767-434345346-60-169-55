import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Globe,
  MessageSquare,
  Eye,
  Edit,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { useFacebook } from '@/contexts/FacebookContext';

interface PagePermission {
  permission: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'granted' | 'missing' | 'pending';
}

interface PagePermissionsStatus {
  pageId: string;
  pageName: string;
  permissions: PagePermission[];
  webhookStatus: 'connected' | 'disconnected' | 'error';
  accessToken: string;
}

const REQUIRED_PERMISSIONS = [
  {
    permission: 'pages_show_list',
    name: 'عرض قائمة الصفحات',
    description: 'الوصول إلى قائمة الصفحات المدارة',
    icon: <Eye className="h-4 w-4" />
  },
  {
    permission: 'pages_read_engagement',
    name: 'قراءة التفاعل',
    description: 'قراءة التعليقات والإعجابات',
    icon: <MessageSquare className="h-4 w-4" />
  },
  {
    permission: 'pages_manage_metadata',
    name: 'إدارة البيانات الوصفية',
    description: 'ضبط Webhook والإعدادات',
    icon: <Settings className="h-4 w-4" />
  },
  {
    permission: 'pages_manage_posts',
    name: 'إدارة المنشورات',
    description: 'إنشاء وتعديل المنشورات',
    icon: <Edit className="h-4 w-4" />
  },
  {
    permission: 'pages_manage_engagement',
    name: 'إدارة التفاعل',
    description: 'الرد على التعليقات والرسائل',
    icon: <Send className="h-4 w-4" />
  },
  {
    permission: 'pages_messaging',
    name: 'المراسلة',
    description: 'استقبال وإرسال الرسائل',
    icon: <MessageSquare className="h-4 w-4" />
  },
  {
    permission: 'pages_read_user_content',
    name: 'قراءة محتوى المستخدمين',
    description: 'قراءة الرسائل الواردة من المستخدمين',
    icon: <Globe className="h-4 w-4" />
  }
];

export const MultiPagePermissionsManager = () => {
  const { pages, userAccessToken } = useFacebook();
  const [pagesStatus, setPagesStatus] = useState<PagePermissionsStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(false);

  // فحص صلاحيات جميع الصفحات
  const checkAllPagesPermissions = async () => {
    if (!userAccessToken || pages.length === 0) {
      toast.error('يجب الاتصال بفيسبوك أولاً');
      return;
    }

    setCheckingPermissions(true);
    const newPagesStatus: PagePermissionsStatus[] = [];

    try {
      for (const page of pages) {
        const pagePermissions = await checkPagePermissions(page.id, page.access_token);
        const webhookStatus = await checkWebhookStatus(page.id, page.access_token);
        
        newPagesStatus.push({
          pageId: page.id,
          pageName: page.name,
          permissions: pagePermissions,
          webhookStatus,
          accessToken: page.access_token
        });
      }

      setPagesStatus(newPagesStatus);
      toast.success('تم فحص صلاحيات جميع الصفحات');
    } catch (error) {
      console.error('خطأ في فحص الصلاحيات:', error);
      toast.error('خطأ في فحص الصلاحيات');
    } finally {
      setCheckingPermissions(false);
    }
  };

  // فحص صلاحيات صفحة واحدة
  const checkPagePermissions = async (pageId: string, pageAccessToken: string): Promise<PagePermission[]> => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}?access_token=${pageAccessToken}&fields=permissions`
      );
      
      const data = await response.json();
      
      if (data.error) {
        console.error('خطأ في فحص صلاحيات الصفحة:', data.error);
        return REQUIRED_PERMISSIONS.map(perm => ({
          ...perm,
          status: 'missing' as const
        }));
      }

      const grantedPermissions = data.permissions?.data || [];
      
      return REQUIRED_PERMISSIONS.map(requiredPerm => {
        const granted = grantedPermissions.find(
          (p: any) => p.permission === requiredPerm.permission && p.status === 'granted'
        );
        
        return {
          ...requiredPerm,
          status: granted ? 'granted' as const : 'missing' as const
        };
      });
    } catch (error) {
      console.error('خطأ في فحص الصلاحيات:', error);
      return REQUIRED_PERMISSIONS.map(perm => ({
        ...perm,
        status: 'missing' as const
      }));
    }
  };

  // فحص حالة Webhook
  const checkWebhookStatus = async (pageId: string, pageAccessToken: string): Promise<'connected' | 'disconnected' | 'error'> => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/subscribed_apps?access_token=${pageAccessToken}`
      );
      
      const data = await response.json();
      
      if (data.error) {
        return 'error';
      }

      const isSubscribed = data.data && data.data.length > 0;
      return isSubscribed ? 'connected' : 'disconnected';
    } catch (error) {
      console.error('خطأ في فحص Webhook:', error);
      return 'error';
    }
  };

  // إعداد Webhook لصفحة
  const setupWebhookForPage = async (pageId: string, pageAccessToken: string) => {
    setLoading(true);
    try {
      // اشتراك التطبيق بالصفحة
      const subscribeResponse = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/subscribed_apps`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${pageAccessToken}`
          }
        }
      );

      if (!subscribeResponse.ok) {
        throw new Error('فشل في اشتراك التطبيق');
      }

      // تحديد الحقول المطلوبة
      const fieldsResponse = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,message_deliveries,message_reads,feed,comments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${pageAccessToken}`
          }
        }
      );

      if (!fieldsResponse.ok) {
        throw new Error('فشل في تحديد الحقول المطلوبة');
      }

      toast.success('تم إعداد Webhook بنجاح');
      await checkAllPagesPermissions(); // إعادة فحص الحالة
    } catch (error) {
      console.error('خطأ في إعداد Webhook:', error);
      toast.error('فشل في إعداد Webhook');
    } finally {
      setLoading(false);
    }
  };

  // طلب صلاحيات إضافية
  const requestAdditionalPermissions = () => {
    const permissions = REQUIRED_PERMISSIONS.map(p => p.permission).join(',');
    const redirectUri = encodeURIComponent(window.location.origin);
    
    // يجب استبدال APP_ID بالقيمة الفعلية
    const appId = '1184403590157230'; // المقدم من المستخدم
    
    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${permissions}&response_type=code&auth_type=rerequest`;
    
    window.open(authUrl, '_blank');
  };

  // إعداد جميع الصفحات تلقائياً
  const setupAllPages = async () => {
    setLoading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const pageStatus of pagesStatus) {
        try {
          await setupWebhookForPage(pageStatus.pageId, pageStatus.accessToken);
          successCount++;
        } catch (error) {
          console.error(`فشل إعداد الصفحة ${pageStatus.pageName}:`, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`تم إعداد ${successCount} صفحة بنجاح`);
      }
      if (failCount > 0) {
        toast.error(`فشل إعداد ${failCount} صفحة`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pages.length > 0 && userAccessToken) {
      checkAllPagesPermissions();
    }
  }, [pages, userAccessToken]);

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Shield className="h-5 w-5" />
          إدارة الصلاحيات المتعددة للصفحات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* أزرار التحكم الرئيسية */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={checkAllPagesPermissions}
            disabled={checkingPermissions || !userAccessToken}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {checkingPermissions ? "جاري الفحص..." : "فحص الصلاحيات"}
          </Button>
          
          <Button 
            variant="outline"
            onClick={requestAdditionalPermissions}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            طلب صلاحيات إضافية
          </Button>

          <Button 
            variant="secondary"
            onClick={setupAllPages}
            disabled={loading || pagesStatus.length === 0}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {loading ? "جاري الإعداد..." : "إعداد جميع الصفحات"}
          </Button>
        </div>

        {/* معلومات الصلاحيات المطلوبة */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            الصلاحيات المطلوبة: pages_show_list, pages_read_engagement, pages_manage_metadata, 
            pages_manage_posts, pages_manage_engagement, pages_messaging, pages_read_user_content
          </AlertDescription>
        </Alert>

        {/* عرض حالة كل صفحة */}
        {pagesStatus.length > 0 ? (
          <div className="space-y-4">
            {pagesStatus.map((pageStatus) => (
              <Card key={pageStatus.pageId} className="border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{pageStatus.pageName}</span>
                    <div className="flex items-center gap-2">
                      {/* حالة Webhook */}
                      <Badge 
                        variant={
                          pageStatus.webhookStatus === 'connected' ? 'secondary' : 
                          pageStatus.webhookStatus === 'error' ? 'destructive' : 'outline'
                        }
                        className={
                          pageStatus.webhookStatus === 'connected' ? 'bg-green-100 text-green-800' : ''
                        }
                      >
                        Webhook: {
                          pageStatus.webhookStatus === 'connected' ? 'متصل' :
                          pageStatus.webhookStatus === 'error' ? 'خطأ' : 'غير متصل'
                        }
                      </Badge>
                      
                      {/* إعداد Webhook فردي */}
                      {pageStatus.webhookStatus !== 'connected' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setupWebhookForPage(pageStatus.pageId, pageStatus.accessToken)}
                          disabled={loading}
                        >
                          إعداد Webhook
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pageStatus.permissions.map((permission) => (
                      <div 
                        key={permission.permission}
                        className="flex items-center gap-2 p-2 rounded-md border"
                      >
                        {permission.icon}
                        <div className="flex-1">
                          <div className="text-sm font-medium">{permission.name}</div>
                          <div className="text-xs text-muted-foreground">{permission.description}</div>
                        </div>
                        {permission.status === 'granted' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              لم يتم العثور على صفحات. يرجى الاتصال بفيسبوك أولاً.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};