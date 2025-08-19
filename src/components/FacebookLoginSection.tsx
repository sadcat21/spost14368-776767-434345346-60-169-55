import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Facebook, Zap, Shield, CreditCard } from 'lucide-react';
import { useFacebookAuth } from '@/hooks/useFacebookAuth';

interface FacebookLoginSectionProps {
  onLoginSuccess: () => void;
}

export const FacebookLoginSection = ({ onLoginSuccess }: FacebookLoginSectionProps) => {
  const { quickLogin, startFacebookOAuth, loading } = useFacebookAuth();

  const handleLogin = async () => {
    const success = await quickLogin();
    if (success) {
      onLoginSuccess();
    }
  };

  const handleOAuthLogin = async () => {
    const success = await startFacebookOAuth();
    if (success) {
      onLoginSuccess();
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Facebook className="h-8 w-8 text-blue-600" />
            مرحباً بك في نظام الأتمتة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-lg">
            قم بربط صفحات فيسبوك الخاصة بك لبدء استخدام النشر التلقائي بالذكاء الاصطناعي
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">أتمتة ذكية</h3>
              <p className="text-sm text-muted-foreground">نشر المحتوى والصور تلقائياً</p>
            </div>
            
            <div className="text-center p-4 bg-secondary/5 rounded-lg">
              <CreditCard className="h-8 w-8 text-secondary mx-auto mb-2" />
              <h3 className="font-semibold">10 كريديت مجاني</h3>
              <p className="text-sm text-muted-foreground">ابدأ فوراً بدون دفع</p>
            </div>
            
            <div className="text-center p-4 bg-accent/5 rounded-lg">
              <Shield className="h-8 w-8 text-accent mx-auto mb-2" />
              <h3 className="font-semibold">آمن ومحمي</h3>
              <p className="text-sm text-muted-foreground">بيانات محمية بالكامل</p>
            </div>
          </div>

          {/* Login Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">اختر طريقة الاتصال:</h3>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleLogin}
                disabled={loading}
                size="lg"
                className="flex items-center gap-2"
              >
                <Facebook className="h-5 w-5" />
                دخول سريع (تجريبي)
              </Button>
              
              <Button
                onClick={handleOAuthLogin}
                disabled={loading}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <Facebook className="h-5 w-5 text-blue-600" />
                ربط حساب فيسبوك الرسمي
              </Button>
            </div>
            
            {loading && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                جاري الاتصال...
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-800 mb-2">💡 معلومة مهمة:</p>
            <p className="text-blue-700">
              الدخول السريع يستخدم بيانات تجريبية للاختبار. 
              لربط صفحاتك الحقيقية، استخدم "ربط حساب فيسبوك الرسمي".
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};