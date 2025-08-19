import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Facebook, 
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { useFacebook } from '@/contexts/FacebookContext';
import { useOAuthCallback } from '@/hooks/useOAuthCallback';

const FacebookOAuthCallbackPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { handleAuthSuccess } = useFacebook();
  
  const handleOAuthSuccess = async (code: string, state: string) => {
    setLoading(true);
    
    try {
      console.log('Starting Facebook OAuth token exchange...');
      
      const appId = '1184403590157230';
      const redirectUri = `${window.location.origin}/facebook-oauth-callback`;
      
      // استخدام Facebook client-side SDK بدلاً من server-side لتجنب مشاكل CORS
      const tokenResponse = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=7f871fe6601e884f595ce8bcae6d192d&code=${code}`);
      
      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        throw new Error(`Facebook Token Error: ${tokenData.error.message || tokenData.error}`);
      }
      
      const accessToken = tokenData.access_token;
      console.log('Access token obtained successfully');
      
      // الحصول على معلومات المستخدم والصفحات في نفس الوقت
      const [userResponse, pagesResponse] = await Promise.all([
        fetch(`https://graph.facebook.com/v19.0/me?access_token=${accessToken}&fields=id,name,email,picture.width(100).height(100)`),
        fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}&fields=id,name,access_token,category,picture.width(100).height(100)`)
      ]);
      
      const [userData, pagesData] = await Promise.all([
        userResponse.json(),
        pagesResponse.json()
      ]);
      
      if (userData.error) {
        throw new Error(`User Info Error: ${userData.error.message}`);
      }
      
      if (pagesData.error) {
        throw new Error(`Pages Error: ${pagesData.error.message}`);
      }
      
      console.log('User and pages data retrieved successfully');
      
      const oauthData = {
        accessToken,
        pages: pagesData.data || [],
        user: userData
      };
      
      setSuccess(true);
      
      // إذا كانت نافذة منبثقة، أرسل البيانات للنافذة الأصلية وأغلق فوراً
      if (window.opener && window.opener !== window) {
        console.log('Sending data to parent window and closing popup...');
        
        try {
          // إرسال البيانات للنافذة الأصلية
          window.opener.postMessage({ 
            type: 'FACEBOOK_OAUTH_SUCCESS',
            data: oauthData
          }, window.location.origin);
          
          // إغلاق النافذة فوراً
          setTimeout(() => {
            window.close();
          }, 100);
          
        } catch (error) {
          console.error('Error communicating with parent window:', error);
          // في حالة فشل التواصل، حاول الإغلاق المباشر
          window.close();
        }
      } else {
        // إذا لم تكن نافذة منبثقة، حفظ البيانات محلياً وأعد التوجيه
        console.log('Not a popup window, processing locally...');
        await handleAuthSuccess(accessToken, pagesData.data || [], userData);
        navigate('/', { replace: true });
      }
      
    } catch (error: any) {
      console.error('Facebook OAuth Error:', error);
      setError(error.message || 'حدث خطأ في تسجيل الدخول عبر Facebook');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthError = (errorMessage: string) => {
    setError(errorMessage);
    setLoading(false);
    console.error('OAuth Error:', errorMessage);
    
    // إرسال رسالة خطأ للنافذة الأصلية إذا كانت popup
    if (window.opener && window.opener !== window) {
      try {
        window.opener.postMessage({ 
          type: 'FACEBOOK_OAUTH_ERROR',
          error: errorMessage
        }, window.location.origin);
        
        setTimeout(() => window.close(), 1500);
      } catch (error) {
        window.close();
      }
    } else {
      // إذا لم تكن popup، أعد التوجيه بعد فترة قصيرة
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
    }
  };

  // استخدام hook لمعالجة OAuth callback
  useOAuthCallback({
    provider: 'facebook',
    onSuccess: handleOAuthSuccess,
    onError: handleOAuthError,
    successRedirectPath: '/',
    errorRedirectPath: '/'
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Facebook className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-2xl">تسجيل الدخول عبر فيسبوك</CardTitle>
          </div>
          <CardDescription>
            معالجة بيانات تسجيل الدخول...
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {loading && (
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">جاري معالجة بيانات تسجيل الدخول...</p>
            </div>
          )}
          
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                تم تسجيل الدخول بنجاح! سيتم إغلاق هذه النافذة تلقائياً...
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => window.close()}
                  variant="outline"
                  className="flex-1"
                >
                  إغلاق النافذة
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  العودة للرئيسية
                </Button>
              </div>
            </div>
          )}
          
          {!loading && !success && !error && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                لم يتم العثور على بيانات تسجيل الدخول في الرابط
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FacebookOAuthCallbackPage;