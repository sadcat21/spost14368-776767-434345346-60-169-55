import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock, Zap, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useFacebook } from "@/contexts/FacebookContext";

export const TestCronJobButton: React.FC = () => {
  const { selectedPage, isConnected } = useFacebook();
  const [isCreating, setIsCreating] = useState(false);
  const [cronJobId, setCronJobId] = useState<string | null>(null);
  const [lastTest, setLastTest] = useState<string | null>(null);

  const createTestCronJob = async () => {
    if (!selectedPage || !isConnected) {
      toast.error("يرجى الاتصال بصفحة فيسبوك أولاً");
      return;
    }

    setIsCreating(true);
    
    try {
      // البحث عن automation subscription للصفحة المختارة
      const { data: existingAutomation, error: fetchError } = await supabase
        .from('automation_subscriptions')
        .select('custom_page_token')
        .eq('page_id', selectedPage.id)
        .eq('page_name', selectedPage.name)
        .single();

      let pageToken = existingAutomation?.custom_page_token;

      // إذا لم يوجد automation، ننشئ واحد جديد
      if (!existingAutomation || fetchError) {
        console.log('🔄 إنشاء automation subscription جديد للصفحة...');
        
        const { data: newAutomation, error: insertError } = await supabase
          .from('automation_subscriptions')
          .insert({
            page_id: selectedPage.id,
            page_name: selectedPage.name,
            page_access_token: selectedPage.access_token,
            user_id: 'test-user',
            content_type: 'mixed',
            automation_active: true,
            credits_remaining: 100,
            credits_total: 100,
            posts_per_day: 1,
            execution_times: ['09:00']
          })
          .select('custom_page_token')
          .single();

        if (insertError || !newAutomation) {
          throw new Error('فشل في إنشاء automation subscription');
        }

        pageToken = newAutomation.custom_page_token;
        console.log('✅ تم إنشاء automation subscription جديد');
      }

      // إنشاء cron job للاختبار كل ساعة
      const cronJobData = {
        action: 'create',
        automation_data: {
          page_name: selectedPage.name
        }
      };

      console.log('🔄 إنشاء cron job للاختبار للصفحة:', selectedPage.name);
      console.log('📋 بيانات الكرون جوب:', cronJobData);
      
      const { data, error } = await supabase.functions.invoke('test-cron-automation', {
        body: cronJobData
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success && data?.cronjob_id) {
        setCronJobId(data.cronjob_id);
        setLastTest(new Date().toLocaleString('ar-SA'));
        
        toast.success("تم إنشاء cron job للاختبار بنجاح! ✅", {
          description: `معرف المهمة: ${data.cronjob_id} | جدولة: كل ساعة`
        });
        
        console.log('✅ تم إنشاء cron job للاختبار:', data);
      } else {
        throw new Error('فشل في إنشاء cron job');
      }
      
    } catch (error) {
      console.error('❌ خطأ في إنشاء cron job للاختبار:', error);
      toast.error("فشل في إنشاء cron job للاختبار", {
        description: error.message
      });
    } finally {
      setIsCreating(false);
    }
  };

  const deleteTestCronJob = async () => {
    if (!cronJobId) return;
    
    setIsCreating(true);
    
    try {
      const deleteData = {
        action: 'delete',
        automation_data: {
          cronjob_id: cronJobId
        }
      };

      console.log('🗑️ حذف cron job للاختبار...');
      
      const { data, error } = await supabase.functions.invoke('test-cron-automation', {
        body: deleteData
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        setCronJobId(null);
        setLastTest(null);
        
        toast.success("تم حذف cron job للاختبار بنجاح! 🗑️");
        
        console.log('✅ تم حذف cron job للاختبار');
      } else {
        throw new Error('فشل في حذف cron job');
      }
      
    } catch (error) {
      console.error('❌ خطأ في حذف cron job للاختبار:', error);
      toast.error("فشل في حذف cron job للاختبار", {
        description: error.message
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
          <Clock className="h-5 w-5" />
          اختبار Cron Job
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-orange-100/50 dark:bg-orange-900/20 rounded-lg">
          <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-orange-800 dark:text-orange-200">
            <p className="font-medium mb-1">اختبار الأتمتة الذكية الشاملة</p>
            <p>ينشئ مهمة كل ساعة لجميع الصفحات النشطة مع نفس منطق الأتمتة الكاملة</p>
            {selectedPage && (
              <p className="text-xs mt-1 font-medium">
                الصفحة المختارة: {selectedPage.name}
              </p>
            )}
          </div>
        </div>

        {cronJobId && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                نشط
              </Badge>
              <span className="text-sm text-muted-foreground">
                معرف المهمة: {cronJobId}
              </span>
            </div>
            {lastTest && (
              <p className="text-xs text-muted-foreground">
                آخر إنشاء: {lastTest}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {!cronJobId ? (
            <Button
              onClick={createTestCronJob}
              disabled={isCreating || !isConnected || !selectedPage}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  اختبار الأتمتة الذكية الشاملة
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={deleteTestCronJob}
              disabled={isCreating}
              variant="destructive"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                "حذف مهمة الاختبار"
              )}
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border-l-4 border-yellow-400">
          ⚠️ تذكر حذف مهمة الاختبار بعد الانتهاء - ستقوم بنفس الأتمتة الذكية الشاملة كل ساعة
        </div>

        {!isConnected && (
          <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded border-l-4 border-red-400">
            ⚠️ يجب الاتصال بصفحة فيسبوك أولاً
          </div>
        )}
      </CardContent>
    </Card>
  );
};