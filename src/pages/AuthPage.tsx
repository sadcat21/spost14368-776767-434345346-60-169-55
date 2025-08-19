import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { OAuthStateManager } from '@/utils/oauthStateManager';
import { FacebookLoginSection } from '@/components/FacebookLoginSection';

// المكونات الجديدة للواجهة المحسنة
import { SpostLogo } from '@/components/AuthComponents/SpostLogo';
import { AnimatedBackground } from '@/components/AuthComponents/AnimatedBackground';
import { SocialLoginButtons } from '@/components/AuthComponents/SocialLoginButtons';
import { SmartFeatureCards } from '@/components/AuthComponents/SmartFeatureCards';
import { ThemeToggle } from '@/components/AuthComponents/ThemeToggle';


const AuthPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // التحقق من حالة المصادقة
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // التحقق من بيانات فيسبوك في localStorage
      const facebookToken = localStorage.getItem("facebook_user_token");
      const selectedPageId = localStorage.getItem("facebook_selected_page");
      
      if (session && facebookToken && selectedPageId) {
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);

  // تسجيل الدخول عبر Gmail OAuth
  const handleGoogleOAuth = async () => {
    try {
      setLoading(true);
      
      const CLIENT_ID = "692107022359-q3551kdeumtl9lcfme81rq4sqisoc7u8.apps.googleusercontent.com";
      const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly openid email profile';
      
      // إنشاء OAuth state آمن
      const state = OAuthStateManager.generateState('google');
      
      const redirectUri = `${window.location.origin}/gmail-callback`;
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(SCOPES)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${state}`;

      // فتح نافذة منبثقة لـ OAuth
      const popup = window.open(
        authUrl,
        'google-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,toolbar=no,menubar=no,location=no'
      );

      if (!popup) {
        toast.error('تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة وإعادة المحاولة');
        return;
      }

      // الاستماع لرسائل من النافذة المنبثقة
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
          popup.close();
          window.removeEventListener('message', messageListener);
          toast.success('تم تسجيل الدخول عبر Gmail بنجاح!');
          navigate('/');
        } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
          popup.close();
          window.removeEventListener('message', messageListener);
          toast.error(`خطأ في تسجيل الدخول: ${event.data.error}`);
          setLoading(false);
        }
      };

      window.addEventListener('message', messageListener);

      // التحقق من إغلاق النافذة
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          setLoading(false);
        }
      }, 1000);

      toast.info('جاري فتح نافذة تسجيل الدخول عبر Gmail...');
    } catch (error) {
      console.error('Google OAuth error:', error);
      toast.error('خطأ في تسجيل الدخول عبر Gmail');
      setLoading(false);
    }
  };

  // تسجيل الدخول عبر Facebook OAuth
  const handleFacebookOAuth = async () => {
    try {
      setLoading(true);
      
      // الحصول على Facebook App ID من Supabase Secrets أو قاعدة البيانات
      const appId = '1184403590157230';
      
      if (!appId) {
        toast.error('يجب إعداد Facebook App ID أولاً');
        return;
      }

      // إنشاء OAuth state آمن باستخدام OAuthStateManager
      const state = OAuthStateManager.generateState('facebook');
      
      // إنشاء رابط OAuth
      const redirectUri = `${window.location.origin}/facebook-oauth-callback`;
      const scope = 'pages_manage_posts,pages_read_engagement,pages_show_list,pages_messaging,pages_manage_metadata';
      const facebookOAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}`;

      // فتح نافذة منبثقة لـ OAuth
      const popup = window.open(
        facebookOAuthUrl,
        'facebook-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,toolbar=no,menubar=no,location=no'
      );

      if (!popup) {
        toast.error('تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة وإعادة المحاولة');
        return;
      }

      // الاستماع لرسائل من النافذة المنبثقة
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'FACEBOOK_OAUTH_SUCCESS') {
          popup.close();
          window.removeEventListener('message', messageListener);
          toast.success('تم تسجيل الدخول عبر Facebook بنجاح!');
          navigate('/');
        }
      };

      window.addEventListener('message', messageListener);

      // التحقق من إغلاق النافذة
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          setLoading(false);
        }
      }, 1000);

      toast.info('جاري فتح نافذة تسجيل الدخول عبر Facebook...');
    } catch (error) {
      console.error('Facebook OAuth error:', error);
      toast.error('خطأ في تسجيل الدخول عبر Facebook');
      setLoading(false);
    }
  };

  // إذا كان المستخدم متصل بالفيسبوك ولكن لم يختر صفحة بعد
  const facebookToken = localStorage.getItem("facebook_user_token");
  const facebookPages = localStorage.getItem("facebook_pages");
  const selectedPageId = localStorage.getItem("facebook_selected_page");
  
  if (facebookToken && facebookPages && !selectedPageId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <FacebookLoginSection onLoginSuccess={() => navigate('/')} />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-background via-background/95 to-background relative overflow-hidden flex">
      {/* الخلفية المتحركة */}
      <AnimatedBackground />
      
      {/* زر تبديل الثيم */}
      <ThemeToggle />
      
      {/* القسم الجانبي - البطاقات الذكية */}
      <SmartFeatureCards />
      
      {/* قسم تسجيل الدخول */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <Card className="w-full max-w-lg glass-effect border-white/10 shadow-2xl">
          <CardContent className="p-6">
            {/* شعار البرنامج */}
            <SpostLogo />
            
            {/* أزرار تسجيل الدخول الاجتماعي */}
            <div className="mb-6">
              <SocialLoginButtons 
                onFacebookLogin={handleFacebookOAuth}
                onGoogleLogin={handleGoogleOAuth}
                loading={loading}
              />
            </div>
            
            {/* معلومات إضافية */}
            <div className="text-center text-sm text-muted-foreground">
              <p>اختر طريقة تسجيل الدخول المفضلة لديك</p>
              <p className="mt-1 text-xs">جميع البيانات محمية ومشفرة 100%</p>
            </div>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;