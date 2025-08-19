import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Facebook, Key, Sparkles, Settings, Copy } from "lucide-react";
import { TokenManager } from "./FacebookManager/TokenManager";
import { TokenValidator } from "./FacebookManager/TokenValidator";
import { AuthenticationManager } from "./FacebookManager/AuthenticationManager";
import { Features } from "./FacebookManager/Features";
import { CopySettings } from "@/types/copySettings";
import { getCurrentTimeInArabic } from "@/utils/dateUtils";

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

interface FacebookSettingsProps {
  copySettings?: CopySettings;
}

// وظيفة نسخ معلومات العنصر
const copyElementInfo = (element: any, copySettings: any, buttonElement?: HTMLElement) => {
  if (!copySettings) return;
  
  const elementInfo = {
    id: element.id,
    label: element.label,
    description: element.description,
    badge: element.badge,
    type: element.type || "settings-element",
    timestamp: new Date().toISOString()
  };
  
  const infoText = `رمزه في الكود: FacebookSettings
المكون: FacebookSettings`;
  
  navigator.clipboard.writeText(infoText).then(() => {
    // إضافة تأثير بصري عند النسخ
    if (buttonElement) {
      buttonElement.classList.add('copied');
      setTimeout(() => {
        buttonElement.classList.remove('copied');
      }, 600);
    }
    
    // عرض إشعار مؤقت
    const notification = document.createElement('div');
    notification.textContent = '✅ تم النسخ بنجاح';
    notification.className = 'fixed top-4 right-4 bg-accent text-accent-foreground px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 2000);
    
    console.log("تم نسخ معلومات العنصر:", elementInfo);
  }).catch((err) => {
    console.error("فشل في نسخ المعلومات:", err);
    
    // إشعار خطأ
    const errorNotification = document.createElement('div');
    errorNotification.textContent = '❌ فشل في النسخ';
    errorNotification.className = 'fixed top-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
    document.body.appendChild(errorNotification);
    
    setTimeout(() => {
      errorNotification.remove();
    }, 2000);
  });
};

export const FacebookSettings = ({ copySettings }: FacebookSettingsProps) => {
  // توفير قيم افتراضية للحماية من الأخطاء
  const safeCopySettings = copySettings || {
    mainTabs: true,
    subTabs: true,
    buttons: false,
    menus: false,
    cards: false,
    badges: false,
    textControls: false,
    imageControls: false,
    analytics: false,
    socialPosts: false,
    notifications: false,
    tooltips: false,
    popups: false,
    sliders: false,
    forms: false,
    opacity: 50
  };
  const [isConnected, setIsConnected] = useState(false);
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
  const [userAccessToken, setUserAccessToken] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Check if already connected on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem("facebook_user_token");
    const savedPages = localStorage.getItem("facebook_pages");
    const savedSelectedPage = localStorage.getItem("facebook_selected_page");
    const savedUserInfo = localStorage.getItem("facebook_user_info");
    
    if (savedToken && savedPages) {
      setUserAccessToken(savedToken);
      const parsedPages = JSON.parse(savedPages);
      setPages(parsedPages);
      setIsConnected(true);
      
      if (savedUserInfo) {
        setUserInfo(JSON.parse(savedUserInfo));
      }
      
      if (savedSelectedPage) {
        const foundPage = parsedPages.find((p: FacebookPage) => p.id === savedSelectedPage);
        if (foundPage) {
          setSelectedPage(foundPage);
        }
      }
    }
  }, []);

  const handleAuthSuccess = (token: string, pagesData: FacebookPage[], userData?: UserInfo) => {
    setUserAccessToken(token);
    setPages(pagesData);
    setIsConnected(true);
    
    if (userData) {
      setUserInfo(userData);
    }
    
    // Save to localStorage
    localStorage.setItem("facebook_user_token", token);
    localStorage.setItem("facebook_pages", JSON.stringify(pagesData));
    
    if (userData) {
      localStorage.setItem("facebook_user_info", JSON.stringify(userData));
    }
  };

  const disconnectFromFacebook = () => {
    setIsConnected(false);
    setPages([]);
    setSelectedPage(null);
    setUserAccessToken("");
    setUserInfo(null);
    localStorage.removeItem("facebook_user_token");
    localStorage.removeItem("facebook_pages");
    localStorage.removeItem("facebook_selected_page");
    localStorage.removeItem("facebook_user_info");
    localStorage.removeItem("facebook_auth_method");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative group">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Facebook className="h-5 w-5" />
              إعدادات فيسبوك
              {isConnected && (
                <div className="relative">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    متصل
                  </Badge>
                  {/* أيقونة نسخ للشارات */}
                  {safeCopySettings.badges && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -left-6 top-1/2 -translate-y-1/2 h-4 w-4 p-0 transition-all duration-200 hover:bg-secondary/20 hover:scale-110 copy-button"
                      style={{ 
                        opacity: safeCopySettings.opacity / 100,
                        background: `hsl(var(--secondary) / ${safeCopySettings.opacity / 100 * 0.1})`,
                        borderColor: `hsl(var(--secondary) / ${safeCopySettings.opacity / 100 * 0.3})`,
                        border: '1px solid'
                      } as React.CSSProperties}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.background = `hsl(var(--secondary) / 0.2)`;
                        e.currentTarget.style.borderColor = `hsl(var(--secondary) / 0.5)`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = `${safeCopySettings.opacity / 100}`;
                        e.currentTarget.style.background = `hsl(var(--secondary) / ${safeCopySettings.opacity / 100 * 0.1})`;
                        e.currentTarget.style.borderColor = `hsl(var(--secondary) / ${safeCopySettings.opacity / 100 * 0.3})`;
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        copyElementInfo({
                          id: "facebook-connection-badge",
                          label: "شارة الاتصال بفيسبوك",
                          description: "شارة تظهر حالة الاتصال بفيسبوك",
                          badge: "متصل",
                          type: "connection-badge"
                        }, safeCopySettings, e.currentTarget);
                      }}
                    >
                      <Copy className="h-2 w-2 text-secondary" />
                    </Button>
                  )}
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              إدارة الاتصال والإعدادات المتعلقة بفيسبوك
            </p>
          </CardContent>
        </Card>
        {/* أيقونة نسخ للبطاقة */}
        {safeCopySettings.cards && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-2 h-6 w-6 p-0 transition-all duration-200 hover:bg-primary/20 hover:scale-110 copy-button"
            style={{ 
              opacity: safeCopySettings.opacity / 100,
              background: `hsl(var(--primary) / ${safeCopySettings.opacity / 100 * 0.1})`,
              borderColor: `hsl(var(--primary) / ${safeCopySettings.opacity / 100 * 0.3})`,
              border: '1px solid'
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.background = `hsl(var(--primary) / 0.2)`;
              e.currentTarget.style.borderColor = `hsl(var(--primary) / 0.5)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = `${safeCopySettings.opacity / 100}`;
              e.currentTarget.style.background = `hsl(var(--primary) / ${safeCopySettings.opacity / 100 * 0.1})`;
              e.currentTarget.style.borderColor = `hsl(var(--primary) / ${safeCopySettings.opacity / 100 * 0.3})`;
            }}
            onClick={(e) => {
              e.stopPropagation();
              copyElementInfo({
                id: "facebook-settings-header",
                label: "بطاقة رأس إعدادات فيسبوك",
                description: "بطاقة تحتوي على عنوان ووصف إعدادات فيسبوك",
                badge: "Header Card",
                type: "header-card"
              }, safeCopySettings, e.currentTarget);
            }}
          >
            <Copy className="h-3 w-3 text-primary" />
          </Button>
        )}
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="connection" className="w-full">
        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-1 mb-4 relative">
          <TabsList className="w-full bg-transparent gap-1 grid grid-cols-2 md:grid-cols-4">
            <div className="relative group">
              <TabsTrigger 
                value="connection" 
                className="px-4 py-2 flex items-center gap-2 bg-background/60 border border-border/50 
                  hover:bg-accent/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                  transition-all duration-200 hover:scale-105"
              >
                <Facebook className="h-4 w-4" />
                <span className="hidden sm:inline">الاتصال</span>
              </TabsTrigger>
              {safeCopySettings.mainTabs && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0 transition-all duration-200 hover:bg-accent/20 hover:scale-110 copy-button"
                  style={{ 
                    opacity: safeCopySettings.opacity / 100,
                    background: `hsl(var(--accent) / ${safeCopySettings.opacity / 100 * 0.1})`,
                    borderColor: `hsl(var(--accent) / ${safeCopySettings.opacity / 100 * 0.3})`,
                    border: '1px solid'
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.background = `hsl(var(--accent) / 0.2)`;
                    e.currentTarget.style.borderColor = `hsl(var(--accent) / 0.5)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = `${safeCopySettings.opacity / 100}`;
                    e.currentTarget.style.background = `hsl(var(--accent) / ${safeCopySettings.opacity / 100 * 0.1})`;
                    e.currentTarget.style.borderColor = `hsl(var(--accent) / ${safeCopySettings.opacity / 100 * 0.3})`;
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyElementInfo({
                      id: "connection-tab",
                      label: "تبويب الاتصال",
                      description: "تبويب إدارة الاتصال بفيسبوك",
                      badge: "Connection",
                      type: "main-tab"
                    }, safeCopySettings, e.currentTarget);
                  }}
                >
                  <Copy className="h-2.5 w-2.5 text-accent" />
                </Button>
              )}
            </div>

            <div className="relative group">
              <TabsTrigger 
                value="tokens" 
                className="px-4 py-2 flex items-center gap-2 bg-background/60 border border-border/50 
                  hover:bg-accent/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                  transition-all duration-200 hover:scale-105"
              >
                <Key className="h-4 w-4" />
                <span className="hidden sm:inline">التوكنات</span>
              </TabsTrigger>
              {safeCopySettings.mainTabs && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0 transition-all duration-200 hover:bg-accent/20 hover:scale-110 copy-button"
                  style={{ 
                    opacity: safeCopySettings.opacity / 100,
                    background: `hsl(var(--accent) / ${safeCopySettings.opacity / 100 * 0.1})`,
                    borderColor: `hsl(var(--accent) / ${safeCopySettings.opacity / 100 * 0.3})`,
                    border: '1px solid'
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.background = `hsl(var(--accent) / 0.2)`;
                    e.currentTarget.style.borderColor = `hsl(var(--accent) / 0.5)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = `${safeCopySettings.opacity / 100}`;
                    e.currentTarget.style.background = `hsl(var(--accent) / ${safeCopySettings.opacity / 100 * 0.1})`;
                    e.currentTarget.style.borderColor = `hsl(var(--accent) / ${safeCopySettings.opacity / 100 * 0.3})`;
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyElementInfo({
                      id: "tokens-tab",
                      label: "تبويب التوكنات",
                      description: "تبويب إدارة توكنات فيسبوك",
                      badge: "Tokens",
                      type: "main-tab"
                    }, safeCopySettings, e.currentTarget);
                  }}
                >
                  <Copy className="h-2.5 w-2.5 text-accent" />
                </Button>
              )}
            </div>

            <div className="relative group">
              <TabsTrigger 
                value="features" 
                className="px-4 py-2 flex items-center gap-2 bg-background/60 border border-border/50 
                  hover:bg-accent/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                  transition-all duration-200 hover:scale-105"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">الميزات</span>
              </TabsTrigger>
              {safeCopySettings.mainTabs && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0 transition-all duration-200 hover:bg-accent/20 hover:scale-110 copy-button"
                  style={{ 
                    opacity: safeCopySettings.opacity / 100,
                    background: `hsl(var(--accent) / ${safeCopySettings.opacity / 100 * 0.1})`,
                    borderColor: `hsl(var(--accent) / ${safeCopySettings.opacity / 100 * 0.3})`,
                    border: '1px solid'
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.background = `hsl(var(--accent) / 0.2)`;
                    e.currentTarget.style.borderColor = `hsl(var(--accent) / 0.5)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = `${safeCopySettings.opacity / 100}`;
                    e.currentTarget.style.background = `hsl(var(--accent) / ${safeCopySettings.opacity / 100 * 0.1})`;
                    e.currentTarget.style.borderColor = `hsl(var(--accent) / ${safeCopySettings.opacity / 100 * 0.3})`;
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyElementInfo({
                      id: "features-tab",
                      label: "تبويب الميزات",
                      description: "تبويب ميزات فيسبوك المتقدمة",
                      badge: "Features",
                      type: "main-tab"
                    }, safeCopySettings, e.currentTarget);
                  }}
                >
                  <Copy className="h-2.5 w-2.5 text-accent" />
                </Button>
              )}
            </div>

            <div className="relative group">
              <TabsTrigger 
                value="advanced" 
                className="px-4 py-2 flex items-center gap-2 bg-background/60 border border-border/50 
                  hover:bg-accent/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                  transition-all duration-200 hover:scale-105"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">متقدم</span>
              </TabsTrigger>
              {safeCopySettings.mainTabs && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0 transition-all duration-200 hover:bg-accent/20 hover:scale-110 copy-button"
                  style={{ 
                    opacity: safeCopySettings.opacity / 100,
                    background: `hsl(var(--accent) / ${safeCopySettings.opacity / 100 * 0.1})`,
                    borderColor: `hsl(var(--accent) / ${safeCopySettings.opacity / 100 * 0.3})`,
                    border: '1px solid'
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.background = `hsl(var(--accent) / 0.2)`;
                    e.currentTarget.style.borderColor = `hsl(var(--accent) / 0.5)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = `${safeCopySettings.opacity / 100}`;
                    e.currentTarget.style.background = `hsl(var(--accent) / ${safeCopySettings.opacity / 100 * 0.1})`;
                    e.currentTarget.style.borderColor = `hsl(var(--accent) / ${safeCopySettings.opacity / 100 * 0.3})`;
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyElementInfo({
                      id: "advanced-tab",
                      label: "تبويب الإعدادات المتقدمة",
                      description: "تبويب الإعدادات المتقدمة لفيسبوك",
                      badge: "Advanced",
                      type: "main-tab"
                    }, safeCopySettings, e.currentTarget);
                  }}
                >
                  <Copy className="h-2.5 w-2.5 text-accent" />
                </Button>
              )}
            </div>
          </TabsList>
        </div>
        
        <TabsContent value="connection">
          {/* توجيه لاستخدام بطاقة صفحات فيسبوك كمدخل وحيد */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Facebook className="h-5 w-5" />
                تم توحيد نقطة الاتصال
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="border-primary/30 bg-primary/5">
                  <Facebook className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-primary/90">
                    <div className="space-y-2">
                      <h4 className="font-semibold">المدخل الموحد للاتصال بفيسبوك</h4>
                      <p>تم نقل جميع وظائف الاتصال بفيسبوك إلى <strong>"بطاقة صفحات فيسبوك"</strong> في الشريط الجانبي لتوحيد تجربة المستخدم.</p>
                    </div>
                  </AlertDescription>
                </Alert>
                
                <div className="bg-white rounded-lg p-4 border border-primary/20">
                  <h5 className="font-semibold text-primary mb-2">✨ المزايا الجديدة:</h5>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      مدخل وحيد لجميع خدمات فيسبوك
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      تجربة أبسط وأوضح للمستخدم
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      عرض مباشر لحالة الاتصال والصفحات
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      دخول افتراضي سريع من قاعدة البيانات
                    </li>
                  </ul>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    للاتصال أو إدارة صفحات فيسبوك، توجه إلى الشريط الجانبي ↗️
                  </p>
                  <Badge variant="outline" className="px-4 py-2 text-primary border-primary/30">
                    📋 بطاقة صفحات فيسبوك - المدخل الوحيد
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tokens">
          <div className="space-y-6">
            {selectedPage && (
              <TokenValidator 
                selectedPage={selectedPage}
                onTokenExpired={disconnectFromFacebook}
              />
            )}
            <TokenManager />
          </div>
        </TabsContent>
        
        <TabsContent value="features">
          <Features />
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Settings className="h-5 w-5" />
                الإعدادات المتقدمة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  إعدادات متقدمة لإدارة الاتصال والأمان
                </p>
                
                {/* Connection Status */}
                <div className="p-4 rounded-lg bg-muted/20 border border-muted/40">
                  <h4 className="font-semibold mb-2">حالة الاتصال</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>حالة التوكن:</span>
                      <Badge variant={isConnected ? "secondary" : "destructive"} className={isConnected ? "bg-green-100 text-green-800" : ""}>
                        {isConnected ? "متصل" : "غير متصل"}
                      </Badge>
                    </div>
                    {userInfo && (
                      <div className="flex justify-between">
                        <span>المستخدم:</span>
                        <span className="text-sm">{userInfo.name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>عدد الصفحات:</span>
                      <span className="text-sm">{pages.length}</span>
                    </div>
                  </div>
                </div>

                {/* Data Management */}
                <div className="p-4 rounded-lg bg-muted/20 border border-muted/40">
                  <h4 className="font-semibold mb-2">إدارة البيانات</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    إدارة البيانات المحفوظة محلياً
                  </p>
                  <div className="space-y-2 text-sm">
                    <div>• تخزين التوكنات محلياً في المتصفح</div>
                    <div>• حفظ معلومات الصفحات المختارة</div>
                    <div>• تذكر آخر صفحة مستخدمة</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};