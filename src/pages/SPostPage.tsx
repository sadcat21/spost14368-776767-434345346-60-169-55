import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Facebook, 
  Settings, 
  Users, 
  CreditCard, 
  Calendar, 
  Clock, 
  Target,
  User,
  PlayCircle,
  PauseCircle,
  Trash2,
  Plus,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { FacebookLoginSection } from "@/components/FacebookLoginSection";
import { useFacebook } from "@/contexts/FacebookContext";
import { AutomationSetupDialog } from "@/components/AutomationSetupDialog";
import { CronJobHistoryButton } from "@/components/CronJobHistoryButton";
import { supabase } from "@/integrations/supabase/client";
import type { FacebookPage } from "@/contexts/FacebookContext";

interface AutomationSubscription {
  id: string;
  pageId: string;
  pageName: string;
  creditsTotal: number;
  creditsUsed: number;
  creditsRemaining: number;
  automationActive: boolean;
  postsPerDay: number;
  postsPerWeek: number;
  executionTimes: string[];
  subscriptionEnd: string | null;
  contentType: string;
}


export default function SPostPage() {
  const { pages, userInfo, isConnected } = useFacebook();
  const [subscriptions, setSubscriptions] = useState<AutomationSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
  const [showSetupDialog, setShowSetupDialog] = useState(false);

  const initializeFromStorage = () => {
    const savedToken = localStorage.getItem('facebook_access_token');
    if (savedToken) {
      console.log('تم استرداد التوكن من localStorage');
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadData();
    }
  }, [isConnected]);

  const loadData = async () => {
    try {
      console.log('بدء تحميل البيانات...');
      setLoading(true);
      
      // تحقق من تسجيل الدخول أولاً
      if (!userInfo) {
        console.log('المستخدم غير مسجل الدخول');
        setLoading(false);
        return;
      }
      
      console.log('المستخدم الحالي:', userInfo.name);
      
      // جلب اشتراكات الأتمتة للمستخدم الحالي
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('automation_subscriptions')
        .select('*')
        .eq('facebook_user_id', userInfo.id)
        .order('created_at', { ascending: false });

      if (subscriptionsError) {
        console.error('خطأ في جلب الاشتراكات:', subscriptionsError);
      } else {
        console.log('تم جلب الاشتراكات:', subscriptionsData?.length || 0);
      }

      // تحويل البيانات لصيغة مناسبة للعرض
      const formattedSubscriptions: AutomationSubscription[] = (subscriptionsData || []).map(sub => ({
        id: sub.id,
        pageId: sub.page_id,
        pageName: sub.page_name,
        creditsTotal: sub.credits_total || 0,
        creditsUsed: sub.credits_used || 0,
        creditsRemaining: sub.credits_remaining || 0,
        automationActive: sub.automation_active || false,
        postsPerDay: sub.posts_per_day || 1,
        postsPerWeek: sub.posts_per_week || 7,
        executionTimes: Array.isArray(sub.execution_times) 
          ? (sub.execution_times as string[]) 
          : ["09:00", "15:00", "21:00"],
        subscriptionEnd: sub.subscription_end || null,
        contentType: sub.content_type || 'mixed'
      }));

      setSubscriptions(formattedSubscriptions);

      // استخدام الصفحات من FacebookContext
      console.log('استخدام الصفحات من FacebookContext:', pages.length);


    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
      toast.error('خطأ في تحميل البيانات');
    } finally {
      console.log('انتهاء تحميل البيانات، تعيين loading = false');
      setLoading(false);
    }
  };

  // الاشتراك في تحديثات الرصيد والأتمتة لحظياً
  useEffect(() => {
    if (!userInfo) return;

    const channel = supabase
      .channel('realtime:automation_subscriptions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'automation_subscriptions', filter: `facebook_user_id=eq.${userInfo.id}` },
        (payload) => {
          console.log('📡 Realtime update for automation_subscriptions:', payload);
          // أعد تحميل البيانات لإظهار الرصيد والحالة المحدثة فوراً
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userInfo]);

  const saveAutomationSettings = async (pageId: string, settings: Partial<AutomationSubscription>) => {
    try {
      if (!userInfo) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }
      
      // لا نغير loading state لتجنب الوميض
      
      // البحث عن الاشتراك الموجود
      const existingSubscription = subscriptions.find(sub => sub.pageId === pageId);
      const page = pages.find(p => p.id === pageId);
      
      if (!page) {
        toast.error("الصفحة غير موجودة");
        return;
      }

      // الحصول على user_id من auth أو إنشاء مستخدم ضيف
      let { data: { user } } = await supabase.auth.getUser();
      
      // إذا لم يكن هناك مستخدم مسجل دخول، أنشئ جلسة ضيف
      if (!user) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: `guest_${userInfo.id}@temp.com`,
          password: `temp_${userInfo.id}_${Date.now()}`,
          options: {
            data: {
              facebook_id: userInfo.id,
              facebook_name: userInfo.name,
              is_guest: true
            }
          }
        });
        
        if (signUpError) {
          console.error('خطأ في إنشاء مستخدم ضيف:', signUpError);
          toast.error("خطأ في تهيئة النظام");
          return;
        }
        
        user = signUpData.user;
      }
      
      const subscriptionData = {
        page_id: pageId,
        page_name: page.name,
        page_access_token: page.access_token,
        user_id: user.id, // استخدام auth.uid()
        facebook_user_id: userInfo.id, // Facebook ID كنص منفصل
        credits_total: settings.creditsTotal || 10,
        credits_used: settings.creditsUsed || 0,
        credits_remaining: settings.creditsRemaining || 10,
        automation_active: settings.automationActive || false,
        posts_per_day: settings.postsPerDay || 1,
        posts_per_week: settings.postsPerWeek || 7,
        execution_times: settings.executionTimes || ["09:00", "15:00", "21:00"],
        content_type: settings.contentType || 'mixed',
        subscription_end: settings.subscriptionEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      let result;
      if (existingSubscription) {
        // تحديث الاشتراك الموجود
        result = await supabase
          .from('automation_subscriptions')
          .update(subscriptionData)
          .eq('id', existingSubscription.id)
          .select()
          .single();

        if (result.error) {
          console.error('خطأ في تحديث الاشتراك:', result.error);
          toast.error('خطأ في تحديث الاشتراك: ' + result.error.message);
          return;
        }

        // تحديث الحالة محلياً بدلاً من إعادة تحميل البيانات
        setSubscriptions(prev => prev.map(sub => 
          sub.id === existingSubscription.id 
            ? { ...sub, ...settings }
            : sub
        ));
        
        toast.success('تم تحديث إعدادات الأتمتة بنجاح');
      } else {
        // إنشاء اشتراك جديد
        result = await supabase
          .from('automation_subscriptions')
          .insert(subscriptionData)
          .select()
          .single();

        if (result.error) {
          console.error('خطأ في إنشاء الاشتراك:', result.error);
          toast.error('خطأ في إنشاء الاشتراك: ' + result.error.message);
          return;
        }

        // إضافة الاشتراك الجديد للحالة محلياً
        const newSubscription: AutomationSubscription = {
          id: result.data.id,
          pageId: pageId,
          pageName: page.name,
          creditsTotal: settings.creditsTotal || 10,
          creditsUsed: settings.creditsUsed || 0,
          creditsRemaining: settings.creditsRemaining || 10,
          automationActive: settings.automationActive || false,
          postsPerDay: settings.postsPerDay || 1,
          postsPerWeek: settings.postsPerWeek || 7,
          executionTimes: settings.executionTimes || ["09:00", "15:00", "21:00"],
          subscriptionEnd: settings.subscriptionEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          contentType: settings.contentType || 'mixed'
        };
        
        setSubscriptions(prev => [...prev, newSubscription]);
        toast.success('تم إنشاء اشتراك الأتمتة بنجاح');
      }

    } catch (error) {
      console.error('خطأ في حفظ إعدادات الأتمتة:', error);
      toast.error('خطأ في حفظ إعدادات الأتمتة');
    }
  };

  const getPageSubscription = (pageId: string) => {
    return subscriptions.find(sub => sub.pageId === pageId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Settings className="h-12 w-12" />
                <Facebook className="h-6 w-6 absolute -bottom-1 -right-1 bg-white text-blue-600 rounded-full p-1" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">إعداد الأتمتة</h1>
                <p className="text-white/90 mt-1">
                  إدارة صفحات فيسبوك وإعداد النشر التلقائي
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => window.location.href = '/'}
            >
              العودة للرئيسية
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Facebook Login Section */}
        {!isConnected && (
          <div className="mb-8">
            <FacebookLoginSection onLoginSuccess={() => {}} />
          </div>
        )}

        {/* User Info Section */}
        {isConnected && userInfo && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {userInfo.picture?.data?.url && (
                    <img 
                      src={userInfo.picture.data.url} 
                      alt={userInfo.name}
                      className="w-12 h-12 rounded-full border-2 border-primary/20"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">مرحباً، {userInfo.name}</h3>
                    <p className="text-sm text-muted-foreground">{userInfo.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pages Management */}
        {isConnected && pages.length > 0 && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Facebook className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold">الصفحات المرتبطة</h3>
                  <p className="text-2xl font-bold text-primary">{pages.length}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold">الأتمتة النشطة</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {subscriptions.filter(sub => sub.automationActive).length}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <CreditCard className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <h3 className="font-semibold">إجمالي الكريديت</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {subscriptions.reduce((total, sub) => total + sub.creditsRemaining, 0)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold">المنشورات اليوم</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {subscriptions.filter(sub => sub.automationActive).reduce((total, sub) => total + sub.postsPerDay, 0)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Pages List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Facebook className="h-6 w-6 text-blue-600" />
                صفحات فيسبوك المرتبطة
              </h2>
              
              {pages.map((page) => {
                const subscription = getPageSubscription(page.id);
                
                return (
                  <Card key={page.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Page Image */}
                          {page.picture?.data?.url && (
                            <img 
                              src={page.picture.data.url} 
                              alt={page.name}
                              className="w-16 h-16 rounded-full border-2 border-primary/20"
                            />
                          )}
                          
                          {/* Page Info */}
                          <div>
                            <h3 className="text-xl font-semibold">{page.name}</h3>
                            <p className="text-muted-foreground flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {page.category}
                            </p>
                            
                            {subscription && (
                              <div className="flex items-center gap-4 mt-2">
                                <Badge variant={subscription.automationActive ? "default" : "secondary"}>
                                  {subscription.automationActive ? "نشط" : "متوقف"}
                                </Badge>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <CreditCard className="h-4 w-4" />
                                  {subscription.creditsRemaining} كريديت متبقي
                                </span>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {subscription.postsPerDay} منشور/يوم
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                          <Button
                             onClick={() => {
                               setSelectedPage(page as FacebookPage);
                               setShowSetupDialog(true);
                             }}
                            variant="default"
                            size="sm"
                            className="flex items-center gap-2"
                            disabled={loading}
                          >
                            <Settings className="h-4 w-4" />
                            إعداد الأتمتة
                          </Button>
                          
                          {subscription?.automationActive && (
                            <Button
                              onClick={() => {
                                const newSettings: Partial<AutomationSubscription> = {
                                  automationActive: false
                                };
                                saveAutomationSettings(page.id, newSettings);
                              }}
                              variant="secondary"
                              size="sm"
                              className="flex items-center gap-2"
                              disabled={loading}
                            >
                              <PauseCircle className="h-4 w-4" />
                              إيقاف الأتمتة
                            </Button>
                          )}
                          
                          <CronJobHistoryButton
                            pageId={page.id}
                            pageName={page.name}
                            cronjobId={subscription?.id}
                          />
                        </div>
                      </div>

                      {/* Subscription Details */}
                      {subscription && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">الكريديت المستخدم:</span>
                              <div className="font-semibold">{subscription.creditsUsed}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">إجمالي الكريديت:</span>
                              <div className="font-semibold">{subscription.creditsTotal}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">نوع المحتوى:</span>
                              <div className="font-semibold">{subscription.contentType}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">أوقات النشر:</span>
                              <div className="font-semibold">{subscription.executionTimes.join(', ')}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* No pages message */}
        {isConnected && pages.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Facebook className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد صفحات فيسبوك مرتبطة</h3>
              <p className="text-muted-foreground mb-4">
                يرجى ربط صفحات فيسبوك أولاً لتتمكن من إعداد الأتمتة
              </p>
              <Button onClick={() => window.location.href = '/'}>
                العودة للصفحة الرئيسية
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Automation Setup Dialog */}
        {selectedPage && (
          <AutomationSetupDialog
            page={{
              ...selectedPage,
              picture: selectedPage.picture || { data: { url: '' } }
            }}
            subscription={getPageSubscription(selectedPage.id) ? {
              id: getPageSubscription(selectedPage.id)!.id,
              page_id: selectedPage.id,
              page_name: selectedPage.name,
              followers_count: 0,
              automation_active: getPageSubscription(selectedPage.id)!.automationActive,
              credits_total: getPageSubscription(selectedPage.id)!.creditsTotal,
              credits_used: getPageSubscription(selectedPage.id)!.creditsUsed,
              credits_remaining: getPageSubscription(selectedPage.id)!.creditsRemaining,
              subscription_start: new Date().toISOString(),
              subscription_end: getPageSubscription(selectedPage.id)!.subscriptionEnd || new Date().toISOString(),
              posts_per_day: getPageSubscription(selectedPage.id)!.postsPerDay,
              content_type: getPageSubscription(selectedPage.id)!.contentType,
              execution_times: getPageSubscription(selectedPage.id)!.executionTimes
            } : undefined}
            open={showSetupDialog}
            onOpenChange={setShowSetupDialog}
            onSuccess={() => {
              setShowSetupDialog(false);
              loadData(); // إعادة تحميل البيانات بعد النجاح
            }}
          />
        )}
      </div>
    </div>
  );
}