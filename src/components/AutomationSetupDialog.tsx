import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Facebook, User, CreditCard, Calendar, Settings, Zap, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFacebookUser } from '@/hooks/useFacebookUser';
import { useFacebook } from '@/contexts/FacebookContext';

interface AutomationSubscription {
  id: string;
  page_id: string;
  page_name: string;
  followers_count: number;
  automation_active: boolean;
  credits_total: number;
  credits_used: number;
  credits_remaining: number;
  subscription_start: string;
  subscription_end: string;
  posts_per_day: number;
  content_type: string;
  execution_times: string[];
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  picture: { data: { url: string } };
}

interface AutomationSetupDialogProps {
  page: FacebookPage;
  subscription?: AutomationSubscription;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AutomationSetupDialog = ({ 
  page, 
  subscription, 
  open, 
  onOpenChange, 
  onSuccess 
}: AutomationSetupDialogProps) => {
  const { currentUser, loginOrCreateUser } = useFacebookUser();
  const { userInfo, userAccessToken } = useFacebook();
  const [loading, setLoading] = useState(false);
  const [postsPerDay, setPostsPerDay] = useState(subscription?.posts_per_day || 1);
  const [contentType, setContentType] = useState(subscription?.content_type || 'mixed');
  const [executionTimes, setExecutionTimes] = useState<string[]>(
    subscription?.execution_times || ['09:00', '15:00', '21:00']
  );
  const [scheduleType, setScheduleType] = useState<'simple' | 'advanced'>('simple');
  const [cronExpression, setCronExpression] = useState('0 9,15,21 * * *');
  const [weekDays, setWeekDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]); // الأحد إلى السبت
  const [monthDays, setMonthDays] = useState<number[]>([]);
  const [months, setMonths] = useState<number[]>([]);
  const [automationActive, setAutomationActive] = useState(subscription?.automation_active || false);

  const creditsRemaining = subscription?.credits_remaining || 10;
  const isNewSubscription = !subscription;

  const handleSaveAutomation = async () => {
    try {
      setLoading(true);

      // تأكيد وجود مستخدم مرتبط بفيسبوك في قاعدة البيانات
      let effectiveUserId = currentUser?.id;

      if (!effectiveUserId) {
        if (userInfo) {
          try {
            const user = await loginOrCreateUser(
              { id: userInfo.id, name: userInfo.name, email: userInfo.email, picture: userInfo.picture as any },
              userAccessToken || page.access_token
            );
            effectiveUserId = user.id;
          } catch (e) {
            toast.error('فشل إنشاء جلسة المستخدم، يرجى المحاولة مرة أخرى');
            return;
          }
        } else {
          toast.error('يجب تسجيل الدخول أولاً');
          return;
        }
      }

      const automationData = {
        user_id: effectiveUserId,
        page_id: page.id,
        page_name: page.name,
        page_access_token: page.access_token,
        followers_count: 0, // يمكن جلبها من Facebook API
        posts_per_day: postsPerDay,
        content_type: contentType,
        execution_times: executionTimes,
        automation_active: automationActive,
        // إعطاء 10 كريديت مجاني للمستخدمين الجدد
        ...(isNewSubscription && {
          credits_total: 10,
          credits_used: 0,
          credits_remaining: 10,
          subscription_start: new Date().toISOString(),
          subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 يوم
        })
      };

      if (subscription) {
        // تحديث الاشتراك الموجود
        const { error } = await supabase
          .from('automation_subscriptions')
          .update(automationData)
          .eq('id', subscription.id);

        if (error) {
          console.error('خطأ في تحديث الأتمتة:', error);
          toast.error('فشل في تحديث إعدادات الأتمتة');
          return;
        }
      } else {
        // إنشاء اشتراك جديد
        const { error } = await supabase
          .from('automation_subscriptions')
          .insert(automationData);

        if (error) {
          console.error('خطأ في إنشاء الأتمتة:', error);
          toast.error('فشل في إنشاء الأتمتة');
          return;
        }
      }

      // إذا تم تفعيل الأتمتة، يجب إنشاء cron job
      if (automationActive && creditsRemaining > 0) {
        await setupCronJob();
      }

      toast.success('تم حفظ إعدادات الأتمتة بنجاح');
      onSuccess();
      onOpenChange(false);

    } catch (error) {
      console.error('خطأ غير متوقع:', error);
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const setupCronJob = async () => {
    try {
      console.log('إعداد مجدولة الأتمتة لصفحة:', page.id);
      
      // الحصول على معرف custom_page_token من قاعدة البيانات
      const { data: subscriptionData, error: fetchError } = await supabase
        .from('automation_subscriptions')
        .select('custom_page_token')
        .eq('page_id', page.id)
        .single();

      if (fetchError || !subscriptionData) {
        console.error('خطأ في جلب معرف الصفحة:', fetchError);
        toast.error('فشل في جلب معرف الصفحة');
        return;
      }

      // استدعاء edge function لإعداد cron job
      const { data, error } = await supabase.functions.invoke('cron-automation', {
        body: {
          action: 'create',
        automation_data: {
          custom_page_token: subscriptionData.custom_page_token,
          page_name: page.name,
          posts_per_day: postsPerDay,
          execution_times: executionTimes,
          content_type: contentType,
          schedule_type: scheduleType,
          cron_expression: scheduleType === 'advanced' ? cronExpression : undefined,
          week_days: scheduleType === 'advanced' ? weekDays : undefined,
          month_days: scheduleType === 'advanced' && monthDays.length > 0 ? monthDays : undefined,
          months: scheduleType === 'advanced' && months.length > 0 ? months : undefined
        }
        }
      });

      if (error) {
        console.error('خطأ في إعداد المجدولة:', error);
        toast.error('فشل في إعداد الجدولة التلقائية');
      } else {
        console.log('تم إعداد المجدولة بنجاح:', data);
        toast.success('تم إعداد الجدولة التلقائية بنجاح على cron-job.org');
      }
    } catch (error) {
      console.error('خطأ في إعداد المجدولة:', error);
      toast.error('فشل في إعداد الجدولة التلقائية');
    }
  };

  const addExecutionTime = () => {
    if (executionTimes.length < 6) {
      setExecutionTimes([...executionTimes, '12:00']);
    }
  };

  const updateExecutionTime = (index: number, time: string) => {
    const newTimes = [...executionTimes];
    newTimes[index] = time;
    setExecutionTimes(newTimes);
  };

  const removeExecutionTime = (index: number) => {
    if (executionTimes.length > 1) {
      setExecutionTimes(executionTimes.filter((_, i) => i !== index));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-6 w-6 text-primary" />
            إعداد الأتمتة - {page.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Page Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Facebook className="h-5 w-5 text-blue-600" />
                معلومات الصفحة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {page.picture?.data?.url && (
                  <img 
                    src={page.picture.data.url} 
                    alt={page.name}
                    className="w-16 h-16 rounded-full border-2 border-primary/20"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold">{page.name}</h3>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {page.category}
                  </p>
                </div>
              </div>

              {/* Credits Information */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    الكريديت المتبقي
                  </span>
                  <Badge variant="secondary" className="text-lg">
                    {creditsRemaining}
                  </Badge>
                </div>

                {subscription && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">إجمالي الكريديت:</span>
                      <span className="font-semibold">{subscription.credits_total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">المستخدم:</span>
                      <span className="font-semibold">{subscription.credits_used}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">ينتهي في:</span>
                      <span className="font-semibold">
                        {new Date(subscription.subscription_end).toLocaleDateString('ar')}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Warning for low credits */}
              {creditsRemaining < 4 && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 text-orange-800 rounded-lg border border-orange-200">
                  <AlertTriangle className="h-5 w-5" />
                  <div className="text-sm">
                    <p className="font-semibold">تحذير: الكريديت منخفض</p>
                    <p>الكريديت المتبقي قد لا يكفي لعدة منشورات</p>
                  </div>
                </div>
              )}

              {isNewSubscription && (
                <div className="p-3 bg-green-50 text-green-800 rounded-lg border border-green-200">
                  <p className="text-sm font-semibold">🎉 مرحباً بك!</p>
                  <p className="text-sm">ستحصل على 10 كريديت مجاني للبدء</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Automation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                إعدادات الأتمتة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Automation Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="automation-active" className="text-base font-semibold">
                    تفعيل الأتمتة
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    تفعيل/إيقاف النشر التلقائي
                  </p>
                </div>
                <Switch
                  id="automation-active"
                  checked={automationActive}
                  onCheckedChange={setAutomationActive}
                  disabled={creditsRemaining === 0}
                />
              </div>

              {/* Posts Per Day */}
              <div className="space-y-2">
                <Label htmlFor="posts-per-day" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  عدد المنشورات باليوم
                </Label>
                <Select value={postsPerDay.toString()} onValueChange={(value) => setPostsPerDay(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">منشور واحد</SelectItem>
                    <SelectItem value="2">منشورين</SelectItem>
                    <SelectItem value="3">3 منشورات</SelectItem>
                    <SelectItem value="4">4 منشورات</SelectItem>
                    <SelectItem value="5">5 منشورات</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Content Type */}
              <div className="space-y-2">
                <Label htmlFor="content-type">نوع المحتوى</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">متنوع (نص + صور)</SelectItem>
                    <SelectItem value="text">نص فقط</SelectItem>
                    <SelectItem value="images">صور فقط</SelectItem>
                    <SelectItem value="promotional">ترويجي</SelectItem>
                    <SelectItem value="educational">تعليمي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Schedule Type Toggle */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  نوع الجدولة
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={scheduleType === 'simple' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setScheduleType('simple')}
                  >
                    بسيط
                  </Button>
                  <Button
                    type="button"
                    variant={scheduleType === 'advanced' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setScheduleType('advanced')}
                  >
                    متقدم
                  </Button>
                </div>
              </div>

              {scheduleType === 'simple' ? (
                /* Simple Execution Times */
                <div className="space-y-3">
                  <Label>أوقات النشر اليومية</Label>
                  <div className="space-y-2">
                    {executionTimes.map((time, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => updateExecutionTime(index, e.target.value)}
                          className="flex-1"
                        />
                        {executionTimes.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeExecutionTime(index)}
                          >
                            حذف
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    {executionTimes.length < 6 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addExecutionTime}
                        className="w-full"
                      >
                        إضافة وقت جديد
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                /* Advanced Schedule Settings */
                <div className="space-y-4">
                  {/* Cron Expression */}
                  <div className="space-y-2">
                    <Label htmlFor="cron-expression">تعبير Cron</Label>
                    <Input
                      id="cron-expression"
                      value={cronExpression}
                      onChange={(e) => setCronExpression(e.target.value)}
                      placeholder="0 9,15,21 * * *"
                    />
                    <p className="text-xs text-muted-foreground">
                      صيغة: دقيقة ساعة يوم_الشهر شهر يوم_الأسبوع
                    </p>
                  </div>

                  {/* Week Days */}
                  <div className="space-y-2">
                    <Label>أيام الأسبوع</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 0, label: 'الأحد' },
                        { value: 1, label: 'الاثنين' },
                        { value: 2, label: 'الثلاثاء' },
                        { value: 3, label: 'الأربعاء' },
                        { value: 4, label: 'الخميس' },
                        { value: 5, label: 'الجمعة' },
                        { value: 6, label: 'السبت' }
                      ].map((day) => (
                        <Button
                          key={day.value}
                          type="button"
                          variant={weekDays.includes(day.value) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setWeekDays(prev => 
                              prev.includes(day.value) 
                                ? prev.filter(d => d !== day.value)
                                : [...prev, day.value]
                            );
                          }}
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Month Days */}
                  <div className="space-y-2">
                    <Label>أيام محددة من الشهر (اختياري)</Label>
                    <Input
                      value={monthDays.join(', ')}
                      onChange={(e) => {
                        const days = e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d) && d >= 1 && d <= 31);
                        setMonthDays(days);
                      }}
                      placeholder="1, 15, 30"
                    />
                    <p className="text-xs text-muted-foreground">
                      أدخل أرقام الأيام مفصولة بفاصلة (1-31)
                    </p>
                  </div>

                  {/* Months */}
                  <div className="space-y-2">
                    <Label>أشهر محددة (اختياري)</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: 1, label: 'يناير' },
                        { value: 2, label: 'فبراير' },
                        { value: 3, label: 'مارس' },
                        { value: 4, label: 'أبريل' },
                        { value: 5, label: 'مايو' },
                        { value: 6, label: 'يونيو' },
                        { value: 7, label: 'يوليو' },
                        { value: 8, label: 'أغسطس' },
                        { value: 9, label: 'سبتمبر' },
                        { value: 10, label: 'أكتوبر' },
                        { value: 11, label: 'نوفمبر' },
                        { value: 12, label: 'ديسمبر' }
                      ].map((month) => (
                        <Button
                          key={month.value}
                          type="button"
                          variant={months.includes(month.value) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setMonths(prev => 
                              prev.includes(month.value) 
                                ? prev.filter(m => m !== month.value)
                                : [...prev, month.value]
                            );
                          }}
                        >
                          {month.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {automationActive && creditsRemaining > 0 ? (
              <span className="text-green-600">✅ الأتمتة جاهزة للتفعيل</span>
            ) : creditsRemaining === 0 ? (
              <span className="text-red-600">❌ لا يوجد كريديت كافي</span>
            ) : (
              <span className="text-orange-600">⏸️ الأتمتة متوقفة</span>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSaveAutomation}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Settings className="h-4 w-4" />
              )}
              حفظ الإعدادات
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};