import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreditsInfo {
  available: boolean;
  remaining: number;
  total: number;
  used: number;
}

export const useCreditsManager = () => {
  const [isLoading, setIsLoading] = useState(false);

  // التحقق من الكريدت المتاح
  const checkCredits = useCallback(async (): Promise<CreditsInfo | null> => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('يجب تسجيل الدخول أولاً');
        return null;
      }

      // البحث عن اشتراك المستخدم النشط
      const { data: subscription, error } = await supabase
        .from('automation_subscriptions')
        .select('credits_remaining, credits_total, credits_used, automation_active, subscription_end')
        .eq('user_id', user.id)
        .eq('automation_active', true)
        .gt('subscription_end', new Date().toISOString())
        .single();

      if (error) {
        console.error('خطأ في جلب معلومات الاشتراك:', error);
        // إنشاء اشتراك افتراضي للمستخدم الجديد
        const newSubscription = {
          user_id: user.id,
          page_id: 'default',
          page_name: 'حساب افتراضي',
          page_access_token: 'default_token',
          credits_total: 50,
          credits_remaining: 50,
          credits_used: 0,
          automation_active: true,
          subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        const { data: created, error: createError } = await supabase
          .from('automation_subscriptions')
          .insert(newSubscription)
          .select()
          .single();

        if (createError) {
          console.error('خطأ في إنشاء الاشتراك:', createError);
          return { available: false, remaining: 0, total: 0, used: 0 };
        }

        return {
          available: true,
          remaining: created.credits_remaining,
          total: created.credits_total,
          used: created.credits_used
        };
      }

      return {
        available: subscription.credits_remaining > 0,
        remaining: subscription.credits_remaining,
        total: subscription.credits_total,
        used: subscription.credits_used
      };

    } catch (error) {
      console.error('خطأ في التحقق من الكريدت:', error);
      toast.error('فشل في التحقق من الكريدت');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // استهلاك كريدت
  const consumeCredits = useCallback(async (amount: number = 1): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('يجب تسجيل الدخول أولاً');
        return false;
      }

      // استخدام دالة قاعدة البيانات المحدثة
      const { data, error } = await supabase.rpc('deduct_credits', {
        p_custom_page_token: user.id, // استخدام user_id كـ token مؤقتاً
        p_credits_to_deduct: amount
      });

      if (error || !data) {
        console.error('فشل في خصم الكريدت:', error);
        toast.error('لا يوجد كريدت كافي');
        return false;
      }

      console.log(`✅ تم خصم ${amount} كريدت بنجاح`);
      return true;

    } catch (error) {
      console.error('خطأ في استهلاك الكريدت:', error);
      toast.error('فشل في استهلاك الكريدت');
      return false;
    }
  }, []);

  return {
    checkCredits,
    consumeCredits,
    isLoading
  };
};