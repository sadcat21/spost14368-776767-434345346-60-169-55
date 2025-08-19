import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, LogOut, Facebook } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFacebook } from '@/contexts/FacebookContext';
import { OAuthStateManager } from '@/utils/oauthStateManager';
import FacebookPagesDropdown from './FacebookPagesDropdown';

const AuthButton = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isConnected, disconnectFromFacebook, handleAuthSuccess, userInfo, pages, selectedPage } = useFacebook();

  useEffect(() => {
    // التحقق من حالة المصادقة
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    checkAuth();

    // الاستماع لتغييرات المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('خطأ في تسجيل الخروج');
        return;
      }
      toast.success('تم تسجيل الخروج بنجاح');
      navigate('/auth');
    } catch (error) {
      toast.error('خطأ في تسجيل الخروج');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookOAuth = async () => {
    try {
      setLoading(true);
      
      const appId = '1184403590157230';
      
      if (!appId) {
        toast.error('يجب إعداد Facebook App ID أولاً');
        return;
      }

      // إنشاء OAuth state آمن باستخدام OAuthStateManager
      const state = OAuthStateManager.generateState('facebook');
      
      const redirectUri = `${window.location.origin}/facebook-oauth-callback`;
      const scope = 'pages_manage_posts,pages_read_engagement,pages_show_list,pages_messaging,pages_manage_metadata';
      const facebookOAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}`;

      const popup = window.open(
        facebookOAuthUrl,
        'facebook-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,toolbar=no,menubar=no,location=no'
      );

      if (!popup) {
        toast.error('تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة وإعادة المحاولة');
        return;
      }

      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'FACEBOOK_OAUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener('message', messageListener);
          
          // تحديث Context بالبيانات الجديدة
          if (event.data.data) {
            const { accessToken, pages, user } = event.data.data;
            handleAuthSuccess(accessToken, pages, user);
            toast.success('تم تسجيل الدخول عبر Facebook بنجاح!');
          }
          
          setLoading(false);
        } else if (event.data.type === 'FACEBOOK_OAUTH_ERROR') {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener('message', messageListener);
          
          toast.error(`خطأ في تسجيل الدخول: ${event.data.error}`);
          setLoading(false);
        }
      };

      window.addEventListener('message', messageListener);

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

  // إذا كان متصل بفيسبوك، أظهر حالة الاتصال مع التفاصيل
  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        {/* معلومات المستخدم */}
        {userInfo && (
          <div className="flex items-center gap-2">
            {userInfo.picture?.data?.url && (
              <img 
                src={userInfo.picture.data.url} 
                alt={userInfo.name}
                className="w-8 h-8 rounded-full border-2 border-green-500"
              />
            )}
            <div className="text-sm">
              <div className="font-medium text-green-600">{userInfo.name}</div>
              <div className="text-xs text-muted-foreground">
                {pages.length} صفحة متصلة
                {selectedPage && ` • ${selectedPage.name}`}
              </div>
            </div>
          </div>
        )}
        
        {/* قائمة الصفحات */}
        <FacebookPagesDropdown />
        
        {/* زر قطع الاتصال */}
        <Button 
          onClick={disconnectFromFacebook}
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700"
        >
          <LogOut className="h-4 w-4 mr-2" />
          قطع الاتصال
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button 
          onClick={handleFacebookOAuth}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </Button>
        <Button 
          onClick={() => navigate('/auth')}
          variant="outline"
          size="sm"
        >
          <User className="h-4 w-4 mr-2" />
          تسجيل الدخول
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        مرحباً، {user.user_metadata?.display_name || user.email}
      </span>
      <Button 
        onClick={handleSignOut}
        disabled={loading}
        variant="outline"
        size="sm"
      >
        <LogOut className="h-4 w-4 mr-2" />
        خروج
      </Button>
    </div>
  );
};

export default AuthButton;