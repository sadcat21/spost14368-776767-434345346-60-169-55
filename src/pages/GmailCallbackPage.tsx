import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const GmailCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // التحقق من وجود authorization code في URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      // الانتقال إلى صفحة Gmail مع رسالة خطأ
      navigate('/gmail-details?error=' + encodeURIComponent(error));
      return;
    }

    if (code) {
      // الانتقال إلى صفحة Gmail Details مع الكود
      navigate('/gmail-details?' + window.location.search);
    } else {
      // لا يوجد كود، انتقال مباشر
      navigate('/gmail-details');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <h2 className="text-xl font-semibold">جاري معالجة تسجيل الدخول...</h2>
        <p className="text-muted-foreground">يرجى الانتظار بينما نقوم بتجهيز حسابك</p>
      </div>
    </div>
  );
};

export default GmailCallbackPage;