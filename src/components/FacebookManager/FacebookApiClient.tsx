import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface FacebookApiClientProps {
  onTokenReady?: (token: string) => void;
}

export const FacebookApiClient = ({ onTokenReady }: FacebookApiClientProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // الحصول على access token من جدول api_keys
  const getFacebookAccessToken = async () => {
    setLoading(true);
    try {
      console.log('محاولة جلب Facebook access token من قاعدة البيانات...');
      
      // البحث عن التوكن الافتراضي أولاً
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('key_name', 'FACEBOOK_ACCESS_TOKEN')
        .eq('user_id', '00000000-0000-0000-0000-000000000000');

      console.log('نتيجة البحث:', { data, error });

      if (error) {
        console.error('Error fetching Facebook access token:', error);
        toast.error(`خطأ في قاعدة البيانات: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.log('لم يتم العثور على أي بيانات في جدول api_keys');
        toast.error('لم يتم العثور على Facebook access token في قاعدة البيانات. يرجى إضافة التوكن في جدول api_keys بـ key_name = "FACEBOOK_ACCESS_TOKEN"');
        return;
      }

      const tokenRecord = data[0];
      console.log('تم العثور على التوكن:', { 
        key_name: tokenRecord.key_name,
        key_value: tokenRecord.key_value ? 'موجود' : 'غير موجود',
        user_id: tokenRecord.user_id 
      });

      if (!tokenRecord.key_value) {
        toast.error('التوكن موجود ولكن قيمة key_value فارغة');
        return;
      }

      setAccessToken(tokenRecord.key_value);
      onTokenReady?.(tokenRecord.key_value);
      
      // التحقق من صحة التوكن
      await validateToken(tokenRecord.key_value);
      
      toast.success('تم جلب Facebook access token بنجاح');
    } catch (error) {
      console.error('Error fetching Facebook access token:', error);
      toast.error(`خطأ في جلب access token: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // التحقق من صحة التوكن
  const validateToken = async (token: string) => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/me?access_token=${token}`
      );
      
      const data = await response.json();
      
      if (data.error) {
        setTokenValid(false);
        toast.error('التوكن غير صالح أو منتهي الصلاحية');
      } else {
        setTokenValid(true);
        toast.success(`التوكن صالح - مرحباً ${data.name}`);
      }
    } catch (error) {
      console.error('Error validating token:', error);
      setTokenValid(false);
      toast.error('فشل في التحقق من صحة التوكن');
    }
  };

  // تحديث التوكن في قاعدة البيانات
  const updateTokenInDatabase = async (newToken: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .upsert({
          key_name: 'FACEBOOK_ACCESS_TOKEN',
          key_value: newToken,
          user_id: '00000000-0000-0000-0000-000000000000' // UUID افتراضي للمشاركة
        });

      if (error) {
        console.error('Error updating token:', error);
        toast.error('فشل في تحديث التوكن في قاعدة البيانات');
        return false;
      }

      toast.success('تم تحديث التوكن في قاعدة البيانات');
      return true;
    } catch (error) {
      console.error('Error updating token:', error);
      toast.error('خطأ في تحديث التوكن');
      return false;
    }
  };

  // تحميل التوكن عند البدء
  useEffect(() => {
    getFacebookAccessToken();
  }, []);

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Key className="h-5 w-5" />
          Facebook API Client
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            سيتم استخدام Facebook Access Token المحفوظ في قاعدة البيانات
          </AlertDescription>
        </Alert>
        
        {/* حالة التوكن */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">حالة Access Token:</span>
          <div className="flex items-center gap-2">
            {accessToken && (
              <Badge variant="outline" className="font-mono text-xs">
                {`${accessToken.substring(0, 10)}...`}
              </Badge>
            )}
            {tokenValid === true && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                صالح
              </Badge>
            )}
            {tokenValid === false && (
              <Badge variant="destructive">
                غير صالح
              </Badge>
            )}
            {tokenValid === null && accessToken && (
              <Badge variant="outline">
                لم يتم التحقق
              </Badge>
            )}
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-2">
          <Button 
            onClick={getFacebookAccessToken}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {loading ? "جاري التحميل..." : "إعادة تحميل التوكن"}
          </Button>
          
          {accessToken && (
            <Button 
              variant="outline"
              onClick={() => validateToken(accessToken)}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              التحقق من صحة التوكن
            </Button>
          )}
        </div>

        {/* تحذير في حالة عدم وجود توكن */}
        {!accessToken && !loading && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              لم يتم العثور على Facebook Access Token. تأكد من إضافته في جدول api_keys
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};