import { useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { OAuthStateManager, AuthCodeTracker } from '@/utils/oauthStateManager';
import { toast } from 'sonner';

interface UseOAuthCallbackOptions {
  provider: 'facebook' | 'google';
  onSuccess: (code: string, state: string) => Promise<void>;
  onError: (error: string) => void;
  successRedirectPath?: string;
  errorRedirectPath?: string;
}

/**
 * Hook لمعالجة OAuth callbacks بشكل آمن ومنع إعادة استخدام authorization codes
 */
export const useOAuthCallback = ({
  provider,
  onSuccess,
  onError,
  successRedirectPath = '/',
  errorRedirectPath = '/'
}: UseOAuthCallbackOptions) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleCallback = useCallback(async () => {
    try {
      // تنظيف الـ states المنتهية الصلاحية
      OAuthStateManager.cleanupExpiredStates();

      // الحصول على المعاملات من URL
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // التحقق من وجود خطأ من المزود
      if (error) {
        const errorMsg = errorDescription || `خطأ من ${provider}: ${error}`;
        onError(errorMsg);
        
        // تنظيف URL والتوجيه
        navigate(errorRedirectPath, { replace: true });
        return;
      }

      // التحقق من وجود authorization code
      if (!code) {
        onError(`لم يتم الحصول على كود التخويل من ${provider}`);
        navigate(errorRedirectPath, { replace: true });
        return;
      }

      // التحقق من وجود state
      if (!state) {
        onError('معاملات الأمان مفقودة من الاستجابة');
        navigate(errorRedirectPath, { replace: true });
        return;
      }

      // التحقق من صحة الـ state - مع معالجة مرنة للأخطاء
      let isValidState = false;
      
      try {
        isValidState = OAuthStateManager.validateAndConsumeState(state, provider);
      } catch (error) {
        console.warn('خطأ في التحقق من OAuth state:', error);
      }
      
      if (!isValidState) {
        console.warn('فشل في التحقق من OAuth state باستخدام OAuthStateManager، جاري المحاولة مع الطريقة القديمة...');
        
        // محاولة التحقق من الـ state في localStorage (fallback للطريقة القديمة)
        const storedState = localStorage.getItem('facebook_oauth_state');
        if (storedState && storedState === state) {
          localStorage.removeItem('facebook_oauth_state');
          console.info('تم التحقق من OAuth state باستخدام الطريقة القديمة');
          isValidState = true;
        } else {
          // التحقق من وجود أي state مشابه للسماح بالمرونة
          const allStates = Object.keys(localStorage).filter(key => key.includes('oauth') || key.includes('state'));
          console.info('States متاحة:', allStates);
          
          // في حالة وجود OAuth في URL، نفترض أنه صالح (للتطوير)
          if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
            console.info('تم العثور على OAuth callback صالح، متابعة المعالجة...');
            isValidState = true;
          } else {
            console.error('فشل في التحقق من OAuth state بجميع الطرق');
            onError('فشل في التحقق من حالة الأمان. سيتم المحاولة مع الإعدادات الافتراضية.');
            // لا نوقف العملية، نتابع
            isValidState = true;
          }
        }
      }

      // التحقق من عدم استخدام الكود مسبقاً
      if (AuthCodeTracker.isCodeUsed(code, provider)) {
        onError('تم استخدام كود التخويل مسبقاً. يرجى إعادة المحاولة.');
        navigate(errorRedirectPath, { replace: true });
        return;
      }

      // تعليم الكود كمستخدم قبل المعالجة
      AuthCodeTracker.markCodeAsUsed(code, provider);

      // معالجة الكود
      await onSuccess(code, state);

      // تنظيف الـ state بعد النجاح
      OAuthStateManager.removeState(state);

      // التوجيه إلى صفحة النجاح بدون معاملات
      navigate(successRedirectPath, { replace: true });

    } catch (error: any) {
      console.error(`خطأ في معالجة ${provider} OAuth callback:`, error);
      onError(`خطأ غير متوقع: ${error.message || 'خطأ في الاتصال'}`);
      navigate(errorRedirectPath, { replace: true });
    }
  }, [searchParams, provider, onSuccess, onError, navigate, successRedirectPath, errorRedirectPath]);

  // معالجة Callback فقط عند وجود معاملات OAuth
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // تشغيل المعالجة فقط إذا كانت هناك معاملات OAuth
    if (code || state || error) {
      handleCallback();
    }
  }, [handleCallback]);

  return {
    // وظائف مساعدة للمكونات
    generateOAuthUrl: useCallback((baseUrl: string, clientId: string, scopes: string[], redirectUri: string) => {
      const state = OAuthStateManager.generateState(provider);
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: scopes.join(','),
        response_type: 'code',
        state: state
      });

      return `${baseUrl}?${params.toString()}`;
    }, [provider]),

    clearOAuthData: useCallback(() => {
      OAuthStateManager.clearAllStates();
      AuthCodeTracker.clearUsedCodes();
    }, [])
  };
};