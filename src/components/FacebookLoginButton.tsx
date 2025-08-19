import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Facebook, 
  LogIn, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import { useFacebook } from '@/contexts/FacebookContext';
import { useFacebookAuth } from '@/hooks/useFacebookAuth';

interface FacebookLoginButtonProps {
  variant?: 'default' | 'outline' | 'card';
  size?: 'sm' | 'default' | 'lg';
  showStatus?: boolean;
  className?: string;
}

export const FacebookLoginButton: React.FC<FacebookLoginButtonProps> = ({
  variant = 'default',
  size = 'default',
  showStatus = true,
  className = ''
}) => {
  const { 
    isConnected, 
    pages, 
    selectedPage, 
    userInfo, 
    disconnectFromFacebook 
  } = useFacebook();
  
  const { quickLogin, demoLogin, loading } = useFacebookAuth();

  const handleQuickLogin = async () => {
    try {
      const success = await quickLogin();
      if (success) {
        toast.success('تم الاتصال بفيسبوك بنجاح!');
      }
    } catch (error) {
      toast.error('فشل في الاتصال بفيسبوك');
    }
  };

  const handleDemoLogin = async () => {
    try {
      const success = await demoLogin();
      if (success) {
        toast.success('تم تسجيل الدخول التجريبي بنجاح!');
      }
    } catch (error) {
      toast.error('فشل في الدخول التجريبي');
    }
  };

  const handleDisconnect = () => {
    disconnectFromFacebook();
    toast.success('تم قطع الاتصال بفيسبوك');
  };

  if (variant === 'card') {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5 text-blue-600" />
            اتصال فيسبوك
          </CardTitle>
          <CardDescription>
            {isConnected 
              ? 'أنت متصل بفيسبوك ويمكنك إدارة صفحاتك'
              : 'قم بالاتصال بفيسبوك للوصول إلى صفحاتك وإدارتها'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected ? (
            <div className="space-y-4">
              {/* User Info */}
              {userInfo && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900">{userInfo.name}</p>
                    <p className="text-sm text-green-700">{userInfo.email}</p>
                  </div>
                  {userInfo.picture?.data?.url && (
                    <img 
                      src={userInfo.picture.data.url} 
                      alt={userInfo.name}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                </div>
              )}

              {/* Pages Info */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {pages.length} صفحة متصلة
                  </span>
                </div>
                {selectedPage && (
                  <Badge variant="outline" className="text-blue-700">
                    المحددة: {selectedPage.name}
                  </Badge>
                )}
              </div>

              {/* Disconnect Button */}
              <Button 
                variant="outline" 
                onClick={handleDisconnect}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                قطع الاتصال
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Status */}
              {showStatus && (
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-900">غير متصل بفيسبوك</span>
                </div>
              )}

              {/* Login Buttons */}
              <div className="space-y-2">
                <Button 
                  onClick={handleQuickLogin}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size={size}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      جاري الاتصال...
                    </>
                  ) : (
                    <>
                      <Facebook className="h-4 w-4 mr-2" />
                      اتصال سريع بفيسبوك
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="w-full"
                  size={size}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  دخول تجريبي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Regular button variant
  if (isConnected) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="outline" className="text-green-700 border-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          متصل ({pages.length} صفحة)
        </Badge>
        <Button 
          variant="outline" 
          size={size}
          onClick={handleDisconnect}
          className="text-red-600 hover:text-red-700"
        >
          قطع الاتصال
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button 
        variant={variant}
        size={size}
        onClick={handleQuickLogin}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            جاري الاتصال...
          </>
        ) : (
          <>
            <Facebook className="h-4 w-4 mr-2" />
            الاتصال بفيسبوك
          </>
        )}
      </Button>
      
      {!loading && (
        <Button 
          variant="outline"
          size={size}
          onClick={handleDemoLogin}
        >
          <LogIn className="h-4 w-4 mr-2" />
          تجريبي
        </Button>
      )}
    </div>
  );
};

export default FacebookLoginButton;