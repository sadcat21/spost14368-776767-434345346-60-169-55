import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Facebook, Key, User, Shield, CheckCircle, AlertTriangle, Info, LogIn, RefreshCw, Database } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserInfo {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

interface AuthenticationManagerProps {
  onAuthSuccess: (token: string, pages: FacebookPage[], userInfo?: UserInfo) => void;
  onDisconnect: () => void;
  isConnected: boolean;
  currentToken?: string;
}

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export const AuthenticationManager = ({ 
  onAuthSuccess, 
  onDisconnect, 
  isConnected, 
  currentToken 
}: AuthenticationManagerProps) => {
  const [manualToken, setManualToken] = useState(currentToken || "");
  const [pageToken, setPageToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [pageTokenValid, setPageTokenValid] = useState<boolean | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [pageInfo, setPageInfo] = useState<FacebookPage | null>(null);
  const [fbLoading, setFbLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [authMethod, setAuthMethod] = useState<'manual' | 'facebook' | 'page' | null>(null);

  // Load Facebook SDK
  useEffect(() => {
    if (!window.FB && !document.getElementById('facebook-jssdk')) {
      window.fbAsyncInit = function() {
        window.FB.init({
          appId: '1234567890', // Replace with your Facebook App ID
          cookie: true,
          xfbml: true,
          version: 'v19.0'
        });
        setSdkLoaded(true);
      };

      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/ar_AR/sdk.js';
      document.body.appendChild(script);
    } else if (window.FB) {
      setSdkLoaded(true);
    }
  }, []);

  // Load saved user info
  useEffect(() => {
    const savedUserInfo = localStorage.getItem("facebook_user_info");
    const savedAuthMethod = localStorage.getItem("facebook_auth_method");
    
    if (savedUserInfo) {
      setUserInfo(JSON.parse(savedUserInfo));
    }
    
    if (savedAuthMethod) {
      setAuthMethod(savedAuthMethod as 'manual' | 'facebook' | 'page');
    }
  }, []);

  const validateToken = async (token: string) => {
    if (!token.trim()) {
      toast.error("يرجى إدخال التوكن أولاً");
      return false;
    }

    setValidatingToken(true);
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/me?access_token=${token}&fields=id,name,email,picture`
      );
      
      const data = await response.json();
      
      if (data.error) {
        setTokenValid(false);
        toast.error("التوكن غير صالح: " + data.error.message);
        return false;
      }

      setTokenValid(true);
      setUserInfo(data);
      toast.success("✅ تم التحقق من التوكن بنجاح");
      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      setTokenValid(false);
      toast.error("فشل في التحقق من التوكن");
      return false;
    } finally {
      setValidatingToken(false);
    }
  };

  const validatePageToken = async (token: string) => {
    if (!token.trim()) {
      toast.error("يرجى إدخال توكن الصفحة أولاً");
      return false;
    }

    setValidatingToken(true);
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/me?access_token=${token}&fields=id,name,category,picture`
      );
      
      const data = await response.json();
      
      if (data.error) {
        setPageTokenValid(false);
        toast.error("توكن الصفحة غير صالح: " + data.error.message);
        return false;
      }

      setPageTokenValid(true);
      setPageInfo({
        id: data.id,
        name: data.name,
        access_token: token,
        category: data.category || "صفحة",
        picture: data.picture
      });
      toast.success("✅ تم التحقق من توكن الصفحة بنجاح");
      return true;
    } catch (error) {
      console.error("Page token validation error:", error);
      setPageTokenValid(false);
      toast.error("فشل في التحقق من توكن الصفحة");
      return false;
    } finally {
      setValidatingToken(false);
    }
  };

  const connectWithPageToken = async () => {
    if (!pageToken.trim()) {
      toast.error("يرجى إدخال توكن الصفحة أولاً");
      return;
    }

    const isValid = await validatePageToken(pageToken);
    if (!isValid || !pageInfo) return;

    setLoading(true);
    try {
      // Save auth method and page info
      setAuthMethod('page');
      localStorage.setItem("facebook_auth_method", 'page');
      localStorage.setItem("facebook_user_info", JSON.stringify(pageInfo));

      // Create a pages array with single page
      const pages = [pageInfo];
      
      onAuthSuccess(pageToken, pages);
      toast.success("تم الاتصال بالصفحة بنجاح!");
    } catch (error) {
      console.error("Page token connection error:", error);
      toast.error("فشل في الاتصال: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const connectWithManualToken = async () => {
    if (!manualToken.trim()) {
      toast.error("يرجى إدخال التوكن أولاً");
      return;
    }

    const isValid = await validateToken(manualToken);
    if (!isValid) return;

    setLoading(true);
    try {
      // Get user's pages
      const response = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${manualToken}&fields=id,name,access_token,category,picture`
      );
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      if (!data.data || data.data.length === 0) {
        toast.error("لا توجد صفحات متاحة للإدارة");
        return;
      }

      // Save auth method and user info
      setAuthMethod('manual');
      localStorage.setItem("facebook_auth_method", 'manual');
      if (userInfo) {
        localStorage.setItem("facebook_user_info", JSON.stringify(userInfo));
      }

      onAuthSuccess(manualToken, data.data, userInfo || undefined);
      toast.success(`تم الاتصال بنجاح! تم العثور على ${data.data.length} صفحة`);
    } catch (error) {
      console.error("Manual token connection error:", error);
      toast.error("فشل في الاتصال: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const detectTokenType = async (token: string): Promise<'user' | 'page' | null> => {
    try {
      // First try to get user info (this works for user tokens)
      const userResponse = await fetch(
        `https://graph.facebook.com/v19.0/me?access_token=${token}&fields=id,name,email`
      );
      const userData = await userResponse.json();

      if (!userData.error) {
        // If no error, it's a user token
        return 'user';
      }

      // If failed, try to get page info (this works for page tokens)
      const pageResponse = await fetch(
        `https://graph.facebook.com/v19.0/me?access_token=${token}&fields=id,name,category`
      );
      const pageData = await pageResponse.json();

      if (!pageData.error) {
        // If no error, it's a page token
        return 'page';
      }

      return null;
    } catch (error) {
      console.error("Token detection error:", error);
      return null;
    }
  };

  const connectWithAnyToken = async (token: string, isManualEntry: boolean = false) => {
    if (!token.trim()) {
      toast.error("يرجى إدخال التوكن أولاً");
      return;
    }

    setLoading(true);
    try {
      // Detect token type
      const tokenType = await detectTokenType(token);
      
      if (!tokenType) {
        throw new Error("التوكن غير صالح أو منتهي الصلاحية");
      }

      if (tokenType === 'user') {
        // Handle user token
        const userResponse = await fetch(
          `https://graph.facebook.com/v19.0/me?access_token=${token}&fields=id,name,email,picture`
        );
        const userData = await userResponse.json();
        
        if (userData.error) {
          throw new Error(userData.error.message);
        }

        setUserInfo(userData);
        setTokenValid(true);

        // Get user's pages
        const pagesResponse = await fetch(
          `https://graph.facebook.com/v19.0/me/accounts?access_token=${token}&fields=id,name,access_token,category,picture`
        );
        const pagesData = await pagesResponse.json();

        if (pagesData.error) {
          throw new Error(pagesData.error.message);
        }

        const pages = pagesData.data || [];
        
        // Save auth method and user info
        const method = isManualEntry ? 'manual' : 'facebook';
        setAuthMethod(method);
        localStorage.setItem("facebook_auth_method", method);
        localStorage.setItem("facebook_user_info", JSON.stringify(userData));

        onAuthSuccess(token, pages, userData);
        toast.success(`تم الاتصال كمستخدم بنجاح! تم العثور على ${pages.length} صفحة`);

      } else if (tokenType === 'page') {
        // Handle page token
        const pageResponse = await fetch(
          `https://graph.facebook.com/v19.0/me?access_token=${token}&fields=id,name,category,picture`
        );
        const pageData = await pageResponse.json();
        
        if (pageData.error) {
          throw new Error(pageData.error.message);
        }

        const pageInfo: FacebookPage = {
          id: pageData.id,
          name: pageData.name,
          access_token: token,
          category: pageData.category || "صفحة",
          picture: pageData.picture
        };

        setPageInfo(pageInfo);
        setPageTokenValid(true);

        // Save auth method and page info
        setAuthMethod('page');
        localStorage.setItem("facebook_auth_method", 'page');
        localStorage.setItem("facebook_user_info", JSON.stringify(pageInfo));

        onAuthSuccess(token, [pageInfo]);
        toast.success("تم الاتصال كصفحة بنجاح!");
      }

    } catch (error) {
      console.error("Token connection error:", error);
      toast.error("فشل في الاتصال: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const connectWithFacebook = () => {
    if (!sdkLoaded || !window.FB) {
      toast.error("جاري تحميل Facebook SDK...");
      return;
    }

    setFbLoading(true);
    
    // إنشاء state آمن للـ OAuth
    const state = window.crypto ? crypto.randomUUID() : `oauth_login_${Date.now()}`;
    localStorage.setItem('facebook_oauth_state', state);
    
    window.FB.login((response: any) => {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        
        // Get user info and pages
        window.FB.api('/me', { fields: 'id,name,email,picture' }, async (userResponse: any) => {
          setUserInfo(userResponse);
          
          // Get pages
          window.FB.api('/me/accounts', { fields: 'id,name,access_token,category,picture' }, (pagesResponse: any) => {
            setFbLoading(false);
            
            if (pagesResponse.error) {
              toast.error("فشل في جلب الصفحات: " + pagesResponse.error.message);
              return;
            }

            if (!pagesResponse.data || pagesResponse.data.length === 0) {
              toast.error("لا توجد صفحات متاحة للإدارة");
              return;
            }

            // Save auth method and user info
            setAuthMethod('facebook');
            localStorage.setItem("facebook_auth_method", 'facebook');
            localStorage.setItem("facebook_user_info", JSON.stringify(userResponse));

            onAuthSuccess(accessToken, pagesResponse.data, userResponse);
            toast.success(`تم تسجيل الدخول بنجاح! تم العثور على ${pagesResponse.data.length} صفحة`);
          });
        });
      } else {
        setFbLoading(false);
        toast.error("تم إلغاء تسجيل الدخول");
      }
    }, {
      scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,public_profile,email',
      return_scopes: true
    });
  };

  // تم نقل وظيفة الاتصال إلى FacebookPagesCard كمدخل وحيد

  const handleDisconnect = () => {
    if (authMethod === 'facebook' && window.FB) {
      window.FB.logout();
    }
    
    setManualToken("");
    setPageToken("");
    setTokenValid(null);
    setPageTokenValid(null);
    setUserInfo(null);
    setPageInfo(null);
    setAuthMethod(null);
    localStorage.removeItem("facebook_auth_method");
    localStorage.removeItem("facebook_user_info");
    
    onDisconnect();
  };

  if (isConnected) {
    return (
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              حالة الاتصال
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                متصل
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={handleDisconnect}>
              قطع الاتصال
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(userInfo || pageInfo) && (
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Avatar>
                <AvatarImage src={userInfo?.picture?.data?.url || pageInfo?.picture?.data?.url} />
                <AvatarFallback>
                  {authMethod === 'page' ? <Facebook className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{userInfo?.name || pageInfo?.name}</p>
                {userInfo?.email && (
                  <p className="text-sm text-muted-foreground">{userInfo.email}</p>
                )}
                {pageInfo?.category && (
                  <p className="text-sm text-muted-foreground">{pageInfo.category}</p>
                )}
                <Badge variant="outline" className="text-xs mt-1">
                  {authMethod === 'facebook' ? 'تسجيل دخول Facebook' : 
                   authMethod === 'page' ? 'توكن الصفحة' : 'توكن المستخدم'}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Facebook className="h-5 w-5" />
          ربط فيسبوك
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* توجيه لاستخدام FacebookPagesCard كمدخل وحيد */}
        <Alert className="border-amber-200 bg-amber-50">
          <Facebook className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="space-y-2">
              <h4 className="font-semibold">الاتصال بفيسبوك</h4>
              <p>تم توحيد نقطة الاتصال بفيسبوك من خلال بطاقة "صفحات فيسبوك" في الشريط الجانبي.</p>
              <p className="text-sm">يرجى استخدام تلك البطاقة للاتصال وإدارة صفحاتك.</p>
            </div>
          </AlertDescription>
        </Alert>

        {/* زر فيسبوك */}
        <div className="mb-6">
          <Button 
            onClick={connectWithFacebook}
            disabled={!sdkLoaded || fbLoading}
            variant="default"
            size="lg"
            className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-elegant transition-all duration-300 hover:scale-105"
          >
            {fbLoading ? (
              <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
            ) : (
              <Facebook className="h-5 w-5 mr-3" />
            )}
            <span className="text-lg">دخول بفيسبوك</span>
          </Button>
          
          <Alert className="border-blue-200 bg-blue-50">
            <Facebook className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              📱 دخول مباشر عبر حسابك في فيسبوك
            </AlertDescription>
          </Alert>
        </div>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 text-muted-foreground font-medium">أو اختر طريقة متقدمة</span>
          </div>
        </div>

        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            اختر إحدى الطرق الثلاث للاتصال بفيسبوك. يمكنك تسجيل الدخول، أو إدخال توكن المستخدم، أو إدخال توكن الصفحة مباشرة.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="facebook" className="flex items-center gap-1 text-xs">
              <LogIn className="h-3 w-3" />
              تسجيل دخول Facebook
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-1 text-xs">
              <User className="h-3 w-3" />
              دخول مستخدم
            </TabsTrigger>
            <TabsTrigger value="page" className="flex items-center gap-1 text-xs">
              <Key className="h-3 w-3" />
              دخول صفحة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-right">
                المهام المتاحة: إدارة الصفحات، قراءة التفاعل، النشر
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>رمز الوصول (User Access Token)</Label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="أدخل رمز الوصول الخاص بك"
                  value={manualToken}
                  onChange={(e) => {
                    setManualToken(e.target.value);
                    setTokenValid(null);
                  }}
                  className="flex-1"
                />
              </div>
              
              {tokenValid === true && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ✅ التوكن صالح ومتاح للاستخدام
                  </AlertDescription>
                </Alert>
              )}
              
              {tokenValid === false && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    ❌ التوكن غير صالح أو منتهي الصلاحية
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Button 
              onClick={() => connectWithAnyToken(manualToken, true)}
              disabled={loading || !manualToken.trim()}
              className="w-full"
            >
              {loading ? "جاري الاتصال..." : "اتصال تلقائي (مستخدم أو صفحة)"}
            </Button>
          </TabsContent>

          <TabsContent value="facebook" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-right">
                المهام المتاحة: إدارة الصفحات، قراءة التفاعل، النشر، والوصول للملف الشخصي.
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-right">
                🚧 لا زال قيد التطوير
              </AlertDescription>
            </Alert>

            <Button 
              disabled={true}
              className="w-full bg-gray-300 text-gray-500 cursor-not-allowed"
            >
              <Facebook className="h-4 w-4 mr-2" />
              تسجيل الدخول باستخدام فيسبوك (قيد التطوير)
            </Button>

            {userInfo && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={userInfo.picture?.data?.url} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{userInfo.name}</p>
                    {userInfo.email && (
                      <p className="text-sm text-muted-foreground">{userInfo.email}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="page" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-right">
                المهام المتاحة: النشر والإدارة المباشرة لصفحة واحدة فقط.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>رمز الوصول للصفحة (Page Access Token)</Label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="أدخل رمز الوصول الخاص بالصفحة"
                  value={pageToken}
                  onChange={(e) => {
                    setPageToken(e.target.value);
                    setPageTokenValid(null);
                  }}
                  className="flex-1"
                />
              </div>
              
              {pageTokenValid === true && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ✅ توكن الصفحة صالح ومتاح للاستخدام
                  </AlertDescription>
                </Alert>
              )}
              
              {pageTokenValid === false && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    ❌ توكن الصفحة غير صالح أو منتهي الصلاحية
                  </AlertDescription>
                </Alert>
              )}

              {pageInfo && pageTokenValid && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={pageInfo.picture?.data?.url} />
                      <AvatarFallback>
                        <Facebook className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{pageInfo.name}</p>
                      <p className="text-sm text-muted-foreground">{pageInfo.category}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        ID: {pageInfo.id}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button 
              onClick={() => connectWithAnyToken(pageToken, false)}
              disabled={loading || !pageToken.trim()}
              className="w-full"
            >
              {loading ? "جاري الاتصال..." : "اتصال تلقائي (مستخدم أو صفحة)"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};