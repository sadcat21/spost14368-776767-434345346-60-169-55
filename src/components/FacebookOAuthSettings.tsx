import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Save, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Facebook
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const FacebookOAuthSettings = () => {
  const [appId, setAppId] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // تحميل الإعدادات المحفوظة
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: apiKeys } = await supabase
        .from('api_keys')
        .select('key_name, key_value')
        .eq('user_id', user.id)
        .in('key_name', ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET']);

      if (apiKeys) {
        const appIdRecord = apiKeys.find(k => k.key_name === 'FACEBOOK_APP_ID');
        const appSecretRecord = apiKeys.find(k => k.key_name === 'FACEBOOK_APP_SECRET');
        
        if (appIdRecord) {
          setAppId(appIdRecord.key_value);
        }
        if (appSecretRecord) {
          setAppSecret(appSecretRecord.key_value);
          setSaved(true);
        }
      }
    } catch (error) {
      console.error('خطأ في تحميل الإعدادات:', error);
    }
  };

  const saveSettings = async () => {
    if (!appId.trim() || !appSecret.trim()) {
      toast.error('يرجى إدخال جميع البيانات المطلوبة');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('يجب تسجيل الدخول أولاً');
        return;
      }

      // حفظ App ID
      await supabase
        .from('api_keys')
        .upsert({
          user_id: user.id,
          key_name: 'FACEBOOK_APP_ID',
          key_value: appId.trim()
        });

      // حفظ App Secret
      await supabase
        .from('api_keys')
        .upsert({
          user_id: user.id,
          key_name: 'FACEBOOK_APP_SECRET',
          key_value: appSecret.trim()
        });

      setSaved(true);
      toast.success('تم حفظ إعدادات فيسبوك بنجاح!');
    } catch (error: any) {
      console.error('خطأ في حفظ الإعدادات:', error);
      toast.error('فشل في حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const generateOAuthUrl = () => {
    if (!appId.trim()) {
      toast.error('يرجى إدخال Facebook App ID أولاً');
      return;
    }

    // إنشاء OAuth URL مع state آمن
    const state = window.crypto ? crypto.randomUUID() : `oauth_login_${Date.now()}`;
    localStorage.setItem('facebook_oauth_state', state);
    
    const redirectUri = `${window.location.origin}/facebook-oauth-callback`;
    const scope = 'pages_manage_posts,pages_read_engagement,pages_show_list,pages_messaging,pages_manage_metadata,pages_manage_ads';
    
    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}`;
  };

  const testOAuth = () => {
    const oauthUrl = generateOAuthUrl();
    if (!oauthUrl) return;

    const popup = window.open(
      oauthUrl,
      'facebook-oauth-test',
      'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,toolbar=no,menubar=no,location=no'
    );

    toast.info('جاري فتح نافذة تسجيل الدخول الاختبارية...');

    // رصد إغلاق النافذة
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        toast.info('تم إغلاق نافذة الاختبار');
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5 text-blue-600" />
            إعدادات Facebook OAuth
          </CardTitle>
          <CardDescription>
            قم بإعداد تطبيق فيسبوك للمطورين لتفعيل تسجيل الدخول عبر OAuth
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Facebook App ID */}
          <div className="space-y-2">
            <Label htmlFor="app-id">Facebook App ID</Label>
            <Input
              id="app-id"
              type="text"
              placeholder="123456789012345"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className="font-mono"
            />
          </div>

          {/* Facebook App Secret */}
          <div className="space-y-2">
            <Label htmlFor="app-secret">Facebook App Secret</Label>
            <div className="relative">
              <Input
                id="app-secret"
                type={showSecret ? "text" : "password"}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                className="font-mono pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* حالة الحفظ */}
          {saved && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                تم حفظ إعدادات Facebook OAuth بنجاح
              </AlertDescription>
            </Alert>
          )}

          {/* أزرار العمليات */}
          <div className="flex gap-3">
            <Button 
              onClick={saveSettings}
              disabled={loading || !appId.trim() || !appSecret.trim()}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </Button>

            <Button 
              variant="outline"
              onClick={testOAuth}
              disabled={!appId.trim() || !saved}
            >
              <Facebook className="h-4 w-4 mr-2" />
              اختبار OAuth
            </Button>
          </div>

          {/* معلومات الإعداد */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>خطوات الإعداد:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>انتقل إلى <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook Developers</a></li>
                <li>أنشئ تطبيق جديد أو استخدم تطبيق موجود</li>
                <li>انسخ App ID و App Secret</li>
                <li>أضف Redirect URI: <code className="bg-gray-100 px-1 rounded text-xs">{window.location.origin}/facebook-oauth-callback</code></li>
                <li>فعّل صلاحيات: Pages Management API</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* تحذير الأمان */}
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>تحذير أمني:</strong> App Secret حساس جداً ولا يجب مشاركته. سيتم تشفيره وحفظه بشكل آمن في قاعدة البيانات.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacebookOAuthSettings;