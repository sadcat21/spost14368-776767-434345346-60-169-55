import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFacebook } from '@/contexts/FacebookContext';
import { toast } from 'sonner';
import { OAuthStateManager } from '@/utils/oauthStateManager';

interface FacebookTokenData {
  id: string;
  user_id: string;
  user_access_token: string;
  token_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useFacebookAuth = () => {
  const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState<FacebookTokenData | null>(null);
  const { setUserAccessToken, setIsConnected, handleAuthSuccess, handlePageSelect } = useFacebook();

  // استرجاع Access Token من قاعدة البيانات
  const getTokenFromDatabase = async () => {
    try {
      setLoading(true);
      
      // الحصول على المستخدم الحالي (اختياري للـ Facebook OAuth)
      const { data: { user } } = await supabase.auth.getUser();
      
      // إذا لم يكن هناك مستخدم، نحاول البحث في البيانات الافتراضية
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';

      // البحث عن Token في جدول facebook_pages للحصول على access_token
      const { data, error } = await supabase
        .from('facebook_pages')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('خطأ في استرجاع Token:', error);
        toast.error('خطأ في استرجاع بيانات فيسبوك');
        return null;
      }

      if (data) {
        // تحويل البيانات إلى التنسيق المطلوب
        const tokenData: FacebookTokenData = {
          id: data.id,
          user_id: data.user_id || '',
          user_access_token: data.access_token,
          token_expires_at: data.updated_at,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        setTokenData(tokenData);
        return data.access_token;
      }

      return null;
    } catch (error) {
      console.error('خطأ غير متوقع:', error);
      toast.error('خطأ غير متوقع');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // حفظ Token في قاعدة البيانات
  const saveTokenToDatabase = async (token: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // استخدام user id إذا متوفر، وإلا استخدام الافتراضي
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';

      // حفظ في جدول facebook_pages
      const { error } = await supabase
        .from('facebook_pages')
        .upsert({
          user_id: userId,
          access_token: token,
          page_id: 'user_token',
          page_name: 'User Access Token',
          is_active: true
        });

      if (error) {
        console.error('خطأ في حفظ Token:', error);
        toast.error('خطأ في حفظ بيانات فيسبوك');
        return false;
      }

      toast.success('تم حفظ معلومات فيسبوك بنجاح');
      return true;
    } catch (error) {
      console.error('خطأ غير متوقع:', error);
      return false;
    }
  };

  // دخول سريع باستخدام التوكن المحفوظ (نفس آلية دخول افتراضي سريع)
  const quickLogin = async () => {
    try {
      setLoading(true);
      
      // استخدام المعرف الافتراضي كما في FacebookPagesCard
      const defaultUserId = "00000000-0000-0000-0000-000000000000";
      
      // البحث عن access_token في جدول api_keys للمستخدم الافتراضي
      const { data: apiKeys, error: apiKeysError } = await supabase
        .from('api_keys')
        .select('key_name, key_value')
        .eq('user_id', defaultUserId)
        .eq('key_name', 'FACEBOOK_ACCESS_TOKEN')
        .limit(1);

      if (!apiKeysError && apiKeys && apiKeys.length > 0) {
        const apiKey = apiKeys[0];
        const defaultToken = apiKey.key_value;
        
        if (defaultToken) {
          // محاولة استخدام التوكن
          const response = await fetch(
            `https://graph.facebook.com/v19.0/me?access_token=${defaultToken}&fields=id,name,email,picture`
          );
          const userData = await response.json();
          
            if (!userData.error) {
              // الحصول على الصفحات
              const pagesResponse = await fetch(
                `https://graph.facebook.com/v19.0/me/accounts?access_token=${defaultToken}&fields=id,name,access_token,category,picture`
              );
              const pagesData = await pagesResponse.json();
              
              if (!pagesData.error && pagesData.data) {
                // استخدام Context للحفظ
                handleAuthSuccess(defaultToken, pagesData.data, userData);
                setIsConnected(true);
                
                // اختيار أول صفحة تلقائياً كبيانات افتراضية
                if (pagesData.data.length > 0) {
                  const firstPage = pagesData.data[0];
                  handlePageSelect(firstPage);
                  toast.success(`تم الاتصال الافتراضي بنجاح! تم اختيار صفحة: ${firstPage.name}`);
                } else {
                  toast.success(`تم الاتصال الافتراضي بنجاح! تم العثور على ${pagesData.data.length} صفحة`);
                }
                return true;
              }
            }
        }
      }

      // إذا لم نجد في api_keys، نبحث في facebook_pages
      const { data: facebookPages, error: pagesError } = await supabase
        .from('facebook_pages')
        .select('access_token, page_id')
        .eq('user_id', defaultUserId)
        .eq('is_active', true)
        .limit(1);

      if (!pagesError && facebookPages && facebookPages.length > 0) {
        const savedPage = facebookPages[0];
        const defaultToken = savedPage.access_token;
        
        if (defaultToken) {
          // محاولة استخدام التوكن
          const response = await fetch(
            `https://graph.facebook.com/v19.0/me?access_token=${defaultToken}&fields=id,name,category,picture`
          );
          const pageData = await response.json();
          
          if (!pageData.error) {
            const pageInfo = {
              id: pageData.id,
              name: pageData.name,
              access_token: defaultToken,
              category: pageData.category || "صفحة",
              picture: pageData.picture
            };
            
            // استخدام Context للحفظ
            handleAuthSuccess(defaultToken, [pageInfo], pageInfo as any);
            setIsConnected(true);
            
            // اختيار الصفحة تلقائياً كبيانات افتراضية
            handlePageSelect(pageInfo as any);
            toast.success(`تم الاتصال الافتراضي بالصفحة بنجاح! تم اختيار: ${pageInfo.name}`);
            return true;
          }
        }
      }

      // إذا لم نجد أي توكنات في الطرق السابقة، نحاول الطريقة الأصلية
      const savedToken = await getTokenFromDatabase();
      
      if (!savedToken) {
        toast.error('لم يتم العثور على معلومات فيسبوك محفوظة أو في قاعدة البيانات الافتراضية');
        return false;
      }

      // الحصول على صفحات فيسبوك باستخدام التوكن
      const pagesData = await fetchUserPages(savedToken);
      
      if (pagesData && pagesData.length > 0) {
        setUserAccessToken(savedToken);
        handleAuthSuccess(savedToken, pagesData);
        setIsConnected(true);
        
        // اختيار أول صفحة تلقائياً كبيانات افتراضية
        handlePageSelect(pagesData[0]);
        toast.success(`تم تسجيل الدخول بنجاح وتم اختيار صفحة: ${pagesData[0].name}`);
        return true;
      } else {
        toast.error('لم يتم العثور على صفحات فيسبوك');
        return false;
      }
    } catch (error) {
      console.error('خطأ في الدخول السريع:', error);
      toast.error('خطأ في تسجيل الدخول');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // فتح OAuth الرسمي لفيسبوك عبر نافذة منبثقة
  const startFacebookOAuth = async () => {
    try {
      setLoading(true);

      const appId = '1184403590157230';
      if (!appId) {
        toast.error('يجب إعداد Facebook App ID أولاً');
        return false;
      }

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
        setLoading(false);
        return false;
      }

      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data.type === 'FACEBOOK_OAUTH_SUCCESS') {
          popup.close();
          window.removeEventListener('message', messageListener);

          if (event.data.data) {
            const { accessToken, pages, user } = event.data.data;
            handleAuthSuccess(accessToken, pages, user);
            setIsConnected(true);
          }

          toast.success('تم تسجيل الدخول عبر Facebook بنجاح!');
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
      return true;
    } catch (error) {
      console.error('Facebook OAuth error:', error);
      toast.error('خطأ في تسجيل الدخول عبر Facebook');
      setLoading(false);
      return false;
    }
  };

  // دخول تجريبي للاختبار السريع
  const demoLogin = async () => {
    try {
      setLoading(true);
      
      // تسجيل دخول المستخدم التجريبي
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'demo@facebook.test',
        password: 'demo123456'
      });

      if (authError) {
        console.error('خطأ في تسجيل الدخول التجريبي:', authError);
        toast.error('خطأ في تسجيل الدخول التجريبي');
        return false;
      }

      // الانتظار قليلاً لضمان تحديث الجلسة
      await new Promise(resolve => setTimeout(resolve, 1000));

      // استرجاع التوكن التجريبي
      const demoToken = await getTokenFromDatabase();
      
      if (demoToken) {
        // إنشاء بيانات تجريبية للصفحات
        const demoPages = [
          {
            id: 'demo_page_1',
            name: 'صفحة تجريبية - مطعم الأصالة',
            access_token: demoToken,
            category: 'مطعم',
            picture: { data: { url: 'https://picsum.photos/100/100?random=1' } }
          },
          {
            id: 'demo_page_2', 
            name: 'صفحة تجريبية - متجر الإلكترونيات',
            access_token: demoToken,
            category: 'متجر إلكترونيات',
            picture: { data: { url: 'https://picsum.photos/100/100?random=2' } }
          }
        ];

        setUserAccessToken(demoToken);
        handleAuthSuccess(demoToken, demoPages);
        setIsConnected(true);
        
        // اختيار أول صفحة تجريبية تلقائياً كبيانات افتراضية
        handlePageSelect(demoPages[0]);
        toast.success(`تم تسجيل الدخول التجريبي بنجاح وتم اختيار: ${demoPages[0].name}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('خطأ في الدخول التجريبي:', error);
      toast.error('خطأ في تسجيل الدخول التجريبي');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // استرجاع صفحات المستخدم من فيسبوك
  const fetchUserPages = async (userToken: string) => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${userToken}&fields=id,name,access_token,category,picture{url}`
      );
      
      const data = await response.json();
      
      if (data.error) {
        console.error('خطأ من Facebook API:', data.error);
        return null;
      }
      
      return data.data || [];
    } catch (error) {
      console.error('خطأ في استرجاع الصفحات:', error);
      return null;
    }
  };

  // تحديث تلقائي للتوكن عند تحميل الكومبوننت
  useEffect(() => {
    const checkSavedToken = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await getTokenFromDatabase();
      }
    };
    
    checkSavedToken();
  }, []);

  return {
    loading,
    tokenData,
    getTokenFromDatabase,
    saveTokenToDatabase,
    quickLogin,
    startFacebookOAuth,
    demoLogin,
    fetchUserPages
  };
};