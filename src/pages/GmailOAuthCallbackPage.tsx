import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useOAuthCallback } from '@/hooks/useOAuthCallback';

const GmailOAuthCallbackPage = () => {
  const navigate = useNavigate();

  const handleGoogleOAuthCallback = async (code: string, state: string) => {
    try {
      console.log('معالجة Gmail OAuth callback...');
      
      // استخدام Supabase Edge Function لتبديل الكود بـ token
      const { data, error } = await supabase.functions.invoke('google-oauth', {
        body: {
          code: code,
          redirect_uri: `${window.location.origin}/gmail-callback`
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        throw new Error(error.message || 'فشل في تسجيل الدخول');
      }

      console.log('تم الحصول على بيانات Gmail بنجاح:', data);

      // حفظ المعلومات
      localStorage.setItem('gmail_access_token', data.access_token);
      localStorage.setItem('gmail_user_email', data.user.email);
      localStorage.setItem('gmail_user_name', data.user.name || data.user.email);
      if (data.refresh_token) {
        localStorage.setItem('gmail_refresh_token', data.refresh_token);
      }

      // تسجيل الدخول في Supabase
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.user.email,
        password: data.user.id // استخدام Google ID كرقم سري مؤقت
      });

      // إذا فشل تسجيل الدخول، قم بإنشاء حساب جديد
      if (authError) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: data.user.email,
          password: data.user.id,
          options: {
            data: {
              display_name: data.user.name,
              provider: 'google',
              picture: data.user.picture
            }
          }
        });

        if (signUpError) {
          console.warn('فشل في إنشاء حساب جديد:', signUpError);
          // متابعة بدون تسجيل في Supabase
        }
      }

      // إرسال رسالة نجاح للنافذة الأم
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_OAUTH_SUCCESS',
          data: {
            user: data.user,
            accessToken: data.access_token
          }
        }, window.location.origin);
        window.close();
      } else {
        // إذا لم تكن نافذة منبثقة، توجه مباشرة
        toast.success('تم تسجيل الدخول عبر Gmail بنجاح!');
        navigate('/');
      }

    } catch (error: any) {
      console.error('Gmail OAuth callback error:', error);
      
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_OAUTH_ERROR',
          error: error.message || 'فشل في تسجيل الدخول عبر Gmail'
        }, window.location.origin);
        window.close();
      } else {
        toast.error(`خطأ في تسجيل الدخول: ${error.message}`);
        navigate('/auth');
      }
    }
  };

  const handleError = (error: string) => {
    console.error('Gmail OAuth error:', error);
    toast.error(error);
  };

  // استخدام hook للتعامل مع OAuth callback
  useOAuthCallback({
    provider: 'google',
    onSuccess: handleGoogleOAuthCallback,
    onError: handleError,
    successRedirectPath: '/',
    errorRedirectPath: '/auth'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <Mail className="h-12 w-12 text-blue-600" />
            <h2 className="text-xl font-semibold">معالجة تسجيل الدخول</h2>
            <p className="text-muted-foreground">
              جاري معالجة تسجيل الدخول عبر Gmail...
            </p>
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">يرجى الانتظار...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GmailOAuthCallbackPage;