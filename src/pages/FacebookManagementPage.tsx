import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Facebook, 
  User, 
  Settings, 
  MessageSquare, 
  BarChart3, 
  Webhook, 
  Shield,
  Globe,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useFacebook } from '@/contexts/FacebookContext';
import { useFacebookAuth } from '@/hooks/useFacebookAuth';
import { PageSelector } from '@/components/FacebookManager/PageSelector';
import { DirectFacebookSetup } from '@/components/FacebookManager/DirectFacebookSetup';
import { FacebookManager } from '@/components/FacebookManager';
import { FacebookSettings } from '@/components/FacebookSettings';
import { FacebookAnalytics } from '@/components/FacebookAnalytics';
import { FacebookWebhookManager } from '@/components/FacebookWebhookManager';
import FacebookOAuthSettings from '@/components/FacebookOAuthSettings';

const FacebookManagementPage = () => {
  const { 
    isConnected, 
    pages, 
    selectedPage, 
    userInfo, 
    handlePageSelect,
    disconnectFromFacebook 
  } = useFacebook();
  
  const { quickLogin, demoLogin, loading } = useFacebookAuth();
  
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // محاولة الاتصال التلقائي عند تحميل الصفحة
    if (!isConnected && !loading) {
      quickLogin();
    }
  }, []);

  const handleQuickLogin = async () => {
    const success = await quickLogin();
    if (success) {
      toast.success('تم الاتصال بفيسبوك بنجاح!');
    }
  };

  const handleDemoLogin = async () => {
    const success = await demoLogin();
    if (success) {
      toast.success('تم تسجيل الدخول التجريبي بنجاح!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-blue-500 rounded-full">
              <Facebook className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">إدارة فيسبوك الشاملة</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            نظام إدارة متكامل لصفحات فيسبوك مع جميع الميزات المتقدمة
          </p>
        </div>

        {/* Connection Status */}
        <Card className="border-2 border-dashed border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-4">
              {isConnected ? (
                <>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div className="text-center">
                    <p className="text-lg font-semibold text-green-700">متصل بفيسبوك</p>
                    <p className="text-sm text-gray-600">
                      {pages.length} صفحة متاحة • الصفحة المحددة: {selectedPage?.name || 'لا توجد'}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={disconnectFromFacebook}
                    className="text-red-600 hover:text-red-700"
                  >
                    قطع الاتصال
                  </Button>
                </>
              ) : (
                <>
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                  <div className="text-center">
                    <p className="text-lg font-semibold text-yellow-700">غير متصل بفيسبوك</p>
                    <p className="text-sm text-gray-600">يجب الاتصال بفيسبوك للوصول إلى الميزات</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleQuickLogin}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      اتصال سريع
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleDemoLogin}
                      disabled={loading}
                    >
                      دخول تجريبي
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">الإعداد</span>
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">الصفحات</span>
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">الإدارة</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">التحليلات</span>
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              <span className="hidden sm:inline">الويب هوك</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <User className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{pages.length}</p>
                      <p className="text-xs text-muted-foreground">الصفحات المتصلة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{isConnected ? 'متصل' : 'غير متصل'}</p>
                      <p className="text-xs text-muted-foreground">حالة الاتصال</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">آمن</p>
                      <p className="text-xs text-muted-foreground">الأمان</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">فعال</p>
                      <p className="text-xs text-muted-foreground">النشاط</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Info */}
            {userInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>معلومات المستخدم</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <img 
                      src={userInfo.picture?.data?.url} 
                      alt={userInfo.name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">{userInfo.name}</h3>
                      <p className="text-gray-600">{userInfo.email}</p>
                      <Badge variant="outline" className="mt-2">
                        ID: {userInfo.id}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Connected Pages Overview */}
            {pages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>الصفحات المتصلة</CardTitle>
                  <CardDescription>
                    جميع صفحات فيسبوك المتصلة بالنظام
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pages.map((page) => (
                      <Card 
                        key={page.id} 
                        className={`cursor-pointer transition-all ${selectedPage?.id === page.id ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => handlePageSelect(page)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={page.picture?.data?.url} 
                              alt={page.name}
                              className="w-12 h-12 rounded-full"
                            />
                            <div className="flex-1">
                              <p className="font-semibold truncate">{page.name}</p>
                              <p className="text-sm text-gray-600">{page.category}</p>
                              {selectedPage?.id === page.id && (
                                <Badge variant="default" className="mt-1">محدد</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعداد الاتصال بفيسبوك</CardTitle>
                <CardDescription>
                  إضافة صفحات فيسبوك جديدة وإعداد الاتصال
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <FacebookOAuthSettings />
                  <DirectFacebookSetup />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages" className="space-y-6">
            {isConnected ? (
              <PageSelector
                accessToken={selectedPage?.access_token || ''}
                onPageSelect={handlePageSelect}
                selectedPage={selectedPage || undefined}
              />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600">يجب الاتصال بفيسبوك أولاً لعرض الصفحات</p>
                  <Button onClick={handleQuickLogin} className="mt-4">
                    الاتصال بفيسبوك
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            {isConnected && selectedPage ? (
              <div className="space-y-6">
                <FacebookManager />
                <FacebookSettings />
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600">يجب اختيار صفحة للوصول إلى ميزات الإدارة</p>
                  {!isConnected && (
                    <Button onClick={handleQuickLogin} className="mt-4">
                      الاتصال بفيسبوك
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {isConnected && selectedPage ? (
              <FacebookAnalytics />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600">يجب اختيار صفحة لعرض التحليلات</p>
                  {!isConnected && (
                    <Button onClick={handleQuickLogin} className="mt-4">
                      الاتصال بفيسبوك
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            {isConnected ? (
              <FacebookWebhookManager />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600">يجب الاتصال بفيسبوك لإدارة الويب هوك</p>
                  <Button onClick={handleQuickLogin} className="mt-4">
                    الاتصال بفيسبوك
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FacebookManagementPage;