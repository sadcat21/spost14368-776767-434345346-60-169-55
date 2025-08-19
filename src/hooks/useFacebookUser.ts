import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FacebookUser {
  id: string;
  facebook_id: string;
  facebook_name: string;
  facebook_email?: string;
  facebook_picture_url?: string;
  access_token?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export const useFacebookUser = () => {
  const [currentUser, setCurrentUser] = useState<FacebookUser | null>(null);
  const [loading, setLoading] = useState(true);

  // تسجيل دخول أو إنشاء مستخدم جديد باستخدام معلومات فيسبوك
  const loginOrCreateUser = async (facebookData: {
    id: string;
    name: string;
    email?: string;
    picture?: { data: { url: string } };
  }, accessToken: string) => {
    try {
      console.log('محاولة تسجيل دخول المستخدم:', facebookData.name);
      
      // البحث عن المستخدم الموجود
      const { data: existingUser, error: fetchError } = await supabase
        .from('facebook_users')
        .select('*')
        .eq('facebook_id', facebookData.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let user: FacebookUser;

      if (existingUser) {
        // تحديث معلومات المستخدم الموجود
        const { data: updatedUser, error: updateError } = await supabase
          .from('facebook_users')
          .update({
            facebook_name: facebookData.name,
            facebook_email: facebookData.email,
            facebook_picture_url: facebookData.picture?.data?.url,
            access_token: accessToken,
            last_login: new Date().toISOString()
          })
          .eq('facebook_id', facebookData.id)
          .select()
          .single();

        if (updateError) throw updateError;
        user = updatedUser;
        console.log('تم تحديث المستخدم الموجود:', user.facebook_name);
      } else {
        // إنشاء مستخدم جديد
        const { data: newUser, error: insertError } = await supabase
          .from('facebook_users')
          .insert({
            facebook_id: facebookData.id,
            facebook_name: facebookData.name,
            facebook_email: facebookData.email,
            facebook_picture_url: facebookData.picture?.data?.url,
            access_token: accessToken
          })
          .select()
          .single();

        if (insertError) throw insertError;
        user = newUser;
        console.log('تم إنشاء مستخدم جديد:', user.facebook_name);
      }

      setCurrentUser(user);
      
      // حفظ معرف المستخدم في localStorage للجلسة
      localStorage.setItem('facebook_user_id', user.id);
      
      return user;
    } catch (error) {
      console.error('خطأ في تسجيل دخول المستخدم:', error);
      throw error;
    }
  };

  // تسجيل خروج المستخدم
  const logout = async () => {
    setCurrentUser(null);
    localStorage.removeItem('facebook_user_id');
    localStorage.removeItem('facebook_access_token');
    console.log('تم تسجيل خروج المستخدم');
  };

  // استرداد المستخدم من الجلسة المحفوظة
  const restoreSession = async () => {
    console.log('بدء استرداد الجلسة...');
    const savedUserId = localStorage.getItem('facebook_user_id');
    console.log('معرف المستخدم المحفوظ:', savedUserId);
    
    if (!savedUserId) {
      console.log('لا يوجد معرف مستخدم محفوظ');
      setLoading(false);
      return;
    }

    try {
      console.log('جلب بيانات المستخدم من قاعدة البيانات...');
      const { data: user, error } = await supabase
        .from('facebook_users')
        .select('*')
        .eq('id', savedUserId)
        .single();

      if (error) {
        console.warn('فشل استرداد الجلسة:', error);
        localStorage.removeItem('facebook_user_id');
      } else {
        setCurrentUser(user);
        console.log('تم استرداد الجلسة للمستخدم:', user.facebook_name);
      }
    } catch (error) {
      console.error('خطأ في استرداد الجلسة:', error);
      localStorage.removeItem('facebook_user_id');
    } finally {
      console.log('انتهاء استرداد الجلسة، تعيين loading = false');
      setLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  return {
    currentUser,
    loading,
    loginOrCreateUser,
    logout,
    isLoggedIn: !!currentUser
  };
};