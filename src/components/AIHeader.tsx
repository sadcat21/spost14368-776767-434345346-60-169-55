import { Brain, Bell, Search, User, Zap, Settings, Filter, Copy, Check, Palette, Database, RefreshCw, LogOut, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { getCurrentTimeInArabic } from "@/utils/dateUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { useFacebook } from "@/contexts/FacebookContext";
import { useFacebookAuth } from "@/hooks/useFacebookAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import AuthButton from "@/components/AuthButton";

interface AIHeaderProps {
  copySettings?: {
    mainTabs: boolean;
    subTabs: boolean;
    buttons: boolean;
    menus: boolean;
    cards: boolean;
    badges: boolean;
    textControls: boolean;
    imageControls: boolean;
    analytics: boolean;
    socialPosts: boolean;
    notifications: boolean;
    tooltips: boolean;
    popups: boolean;
    sliders: boolean;
    forms: boolean;
    livePreview: boolean;
    opacity: number;
  };
  onCopySettingsChange?: (settings: any) => void;
  onLogoClick?: () => void;
}

const AIHeader = ({ copySettings, onCopySettingsChange, onLogoClick }: AIHeaderProps) => {
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
    livePreview: true,
    opacity: 50
  };

  const handleCopySettingChange = (setting: string, checked: boolean) => {
    if (onCopySettingsChange) {
      onCopySettingsChange({
        ...safeCopySettings,
        [setting]: checked
      });
    }
  };

  const handleOpacityChange = (value: number[]) => {
    if (onCopySettingsChange) {
      onCopySettingsChange({
        ...safeCopySettings,
        opacity: value[0]
      });
    }
  };

  // Get Facebook connection status and data from context
  const { 
    isConnected: isFacebookConnected, 
    selectedPage: facebookSelectedPage,
    userInfo: facebookUser,
    pages: facebookPages,
    handlePageSelect,
    disconnectFromFacebook
  } = useFacebook();

  // Facebook authentication hook
  const { quickLogin, loading: authLoading } = useFacebookAuth();

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    }
  };

  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* المنطقة اليسرى - اللوجو والمعلومات */}
          <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
            {/* اللوجو */}
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 cursor-pointer flex-shrink-0"
              onClick={handleLogoClick}
            >
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">DIAGNO</span>
            </Button>

            {/* حالة الـ AI - منطقة مخصصة */}
            <div className="hidden lg:flex items-center">
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 animate-neural-glow text-xs flex-shrink-0">
                <Zap className="h-3 w-3 ml-1" />
                <span>AI نشط</span>
              </Badge>
            </div>

            {/* معلومات الوقت للشاشات الكبيرة فقط */}
            <div className="hidden xl:flex items-center text-xs text-muted-foreground">
              <span>{getCurrentTimeInArabic()}</span>
            </div>
          </div>

          {/* المنطقة الوسطى - البحث */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="البحث في المحتوى والتحليلات..."
                className="pl-10 glass-effect border-primary/20 focus:border-primary/50 text-sm h-9"
              />
            </div>
          </div>

          {/* المنطقة اليمنى - الأدوات والمستخدم */}
          <div className="flex items-center gap-2 flex-shrink-0">
            
            {/* قائمة الصفحات المنسدلة لفيسبوك */}
            {isFacebookConnected && (
              <div className="hidden lg:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Facebook className="h-4 w-4 text-blue-600" />
                      {facebookSelectedPage ? (
                        <div className="flex items-center gap-2">
                          {facebookSelectedPage.picture?.data?.url && (
                            <img 
                              src={facebookSelectedPage.picture.data.url} 
                              alt={facebookSelectedPage.name}
                              className="w-5 h-5 rounded-full"
                            />
                          )}
                          <span className="text-sm">{facebookSelectedPage.name}</span>
                        </div>
                      ) : 'اختر صفحة'}
                    </Button>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent align="end" className="w-64 bg-background/95 backdrop-blur-sm border-border/50 z-50">
                    <DropdownMenuLabel className="text-center">
                      الصفحات المتصلة ({facebookPages.length})
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {facebookPages.map((page) => (
                      <DropdownMenuItem
                        key={page.id}
                        onClick={() => handlePageSelect(page)}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        {page.picture?.data?.url && (
                          <img 
                            src={page.picture.data.url} 
                            alt={page.name}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        
                        <div className="flex-1">
                          <div className="font-medium">{page.name}</div>
                          <div className="text-xs text-muted-foreground">{page.category}</div>
                        </div>
                        
                        {facebookSelectedPage?.id === page.id && (
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        )}
                      </DropdownMenuItem>
                    ))}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={disconnectFromFacebook}
                      className="text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      قطع الاتصال
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            
            {/* Copy Filter Settings - أداة مرشح النسخ */}
            <div className="hidden lg:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                    <Filter className="h-3.5 w-3.5" />
                    <Copy className="h-3 w-3" />
                    <span>مرشح النسخ</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto bg-background/95 backdrop-blur-sm border-border/50 z-50" align="end">
                <DropdownMenuLabel className="text-right text-sm font-bold mb-2">
                  اختر العناصر لإظهار أيقونة النسخ
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* قسم التبويبات والقوائم */}
                <div className="px-2 py-1">
                  <p className="text-xs font-medium text-muted-foreground mb-2 text-right">التبويبات والقوائم</p>
                  <DropdownMenuCheckboxItem
                    checked={safeCopySettings.mainTabs}
                    onCheckedChange={(checked) => handleCopySettingChange('mainTabs', checked)}
                    className="text-right"
                  >
                    التبويبات الرئيسية
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={safeCopySettings.subTabs}
                    onCheckedChange={(checked) => handleCopySettingChange('subTabs', checked)}
                    className="text-right"
                  >
                    التبويبات الفرعية
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={safeCopySettings.menus}
                    onCheckedChange={(checked) => handleCopySettingChange('menus', checked)}
                    className="text-right"
                  >
                    القوائم المنسدلة
                  </DropdownMenuCheckboxItem>
                </div>
                
                <DropdownMenuSeparator />
                
                {/* قسم الأزرار والعناصر التفاعلية */}
                <div className="px-2 py-1">
                  <p className="text-xs font-medium text-muted-foreground mb-2 text-right">العناصر التفاعلية</p>
                  <DropdownMenuCheckboxItem
                    checked={safeCopySettings.buttons}
                    onCheckedChange={(checked) => handleCopySettingChange('buttons', checked)}
                    className="text-right"
                  >
                    الأزرار
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={safeCopySettings.sliders}
                    onCheckedChange={(checked) => handleCopySettingChange('sliders', checked)}
                    className="text-right"
                  >
                    أشرطة التمرير
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={safeCopySettings.forms}
                    onCheckedChange={(checked) => handleCopySettingChange('forms', checked)}
                    className="text-right"
                  >
                    النماذج
                  </DropdownMenuCheckboxItem>
                </div>
                
                <DropdownMenuSeparator />
                
                {/* قسم البطاقات والمحتوى */}
                <div className="px-2 py-1">
                  <p className="text-xs font-medium text-muted-foreground mb-2 text-right">البطاقات والمحتوى</p>
                  <DropdownMenuCheckboxItem
                    checked={safeCopySettings.cards}
                    onCheckedChange={(checked) => handleCopySettingChange('cards', checked)}
                    className="text-right"
                  >
                    البطاقات
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={safeCopySettings.badges}
                    onCheckedChange={(checked) => handleCopySettingChange('badges', checked)}
                    className="text-right"
                  >
                    الشارات
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={safeCopySettings.socialPosts}
                    onCheckedChange={(checked) => handleCopySettingChange('socialPosts', checked)}
                    className="text-right"
                  >
                    المنشورات الاجتماعية
                  </DropdownMenuCheckboxItem>
                </div>
                
                <DropdownMenuSeparator />
                
                {/* قسم التحكم والتحليلات */}
                <div className="px-2 py-1">
                  <p className="text-xs font-medium text-muted-foreground mb-2 text-right">التحكم والتحليلات</p>
                  <DropdownMenuCheckboxItem
                    checked={safeCopySettings.textControls}
                    onCheckedChange={(checked) => handleCopySettingChange('textControls', checked)}
                    className="text-right"
                  >
                    أدوات النص
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={safeCopySettings.imageControls}
                    onCheckedChange={(checked) => handleCopySettingChange('imageControls', checked)}
                    className="text-right"
                  >
                    أدوات الصور
                  </DropdownMenuCheckboxItem>
                   <DropdownMenuCheckboxItem
                     checked={safeCopySettings.analytics}
                     onCheckedChange={(checked) => handleCopySettingChange('analytics', checked)}
                     className="text-right"
                   >
                     التحليلات والإحصائيات
                   </DropdownMenuCheckboxItem>
                   <DropdownMenuCheckboxItem
                     checked={safeCopySettings.livePreview}
                     onCheckedChange={(checked) => handleCopySettingChange('livePreview', checked)}
                     className="text-right"
                   >
                     المعاينة المباشرة
                   </DropdownMenuCheckboxItem>
                 </div>
                 
                 <DropdownMenuSeparator />
                
                {/* قسم التنبيهات والواجهة */}
                <div className="px-2 py-1">
                  <p className="text-xs font-medium text-muted-foreground mb-2 text-right">التنبيهات والواجهة</p>
                  <DropdownMenuCheckboxItem
                    checked={safeCopySettings.notifications}
                    onCheckedChange={(checked) => handleCopySettingChange('notifications', checked)}
                    className="text-right"
                  >
                    التنبيهات
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={safeCopySettings.tooltips}
                    onCheckedChange={(checked) => handleCopySettingChange('tooltips', checked)}
                    className="text-right"
                  >
                    التلميحات
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={safeCopySettings.popups}
                    onCheckedChange={(checked) => handleCopySettingChange('popups', checked)}
                    className="text-right"
                  >
                    النوافذ المنبثقة
                  </DropdownMenuCheckboxItem>
                </div>
                
                <DropdownMenuSeparator />
                
                {/* سلايدر الشفافية */}
                <div className="px-3 py-2">
                  <DropdownMenuLabel className="text-right text-xs font-medium mb-2 flex items-center gap-2">
                    <Palette className="h-3 w-3" />
                    شفافية أزرار النسخ: {safeCopySettings.opacity}%
                  </DropdownMenuLabel>
                  <Slider
                    value={[safeCopySettings.opacity]}
                    onValueChange={handleOpacityChange}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>مخفي</span>
                    <span>واضح</span>
                  </div>
                </div>
              </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Notifications */}
            <div className="relative group mr-6">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full"></span>
              </Button>
              {/* أيقونة نسخ للأزرار */}
              {safeCopySettings.buttons && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -left-7 top-1/2 -translate-y-1/2 h-5 w-5 p-0 transition-all duration-200 hover:bg-muted/20 hover:scale-110 copy-button z-40"
                  style={{ 
                    opacity: safeCopySettings.opacity / 100,
                    background: `hsl(var(--muted) / ${safeCopySettings.opacity / 100 * 0.1})`,
                    borderColor: `hsl(var(--muted-foreground) / ${safeCopySettings.opacity / 100 * 0.3})`,
                    border: '1px solid'
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.background = `hsl(var(--muted) / 0.2)`;
                    e.currentTarget.style.borderColor = `hsl(var(--muted-foreground) / 0.5)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = `${safeCopySettings.opacity / 100}`;
                    e.currentTarget.style.background = `hsl(var(--muted) / ${safeCopySettings.opacity / 100 * 0.1})`;
                    e.currentTarget.style.borderColor = `hsl(var(--muted-foreground) / ${safeCopySettings.opacity / 100 * 0.3})`;
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const buttonInfo = {
                      id: "notifications-button",
                      label: "زر التنبيهات",
                      description: "زر عرض التنبيهات والإشعارات",
                      badge: "Notification Button",
                      icon: Bell
                    };
                    
                    const infoText = `رمزه في الكود: AIHeader
المكون: AIHeader`;
                    
                    navigator.clipboard.writeText(infoText).then(() => {
                      e.currentTarget.classList.add('copied');
                      setTimeout(() => {
                        e.currentTarget.classList.remove('copied');
                      }, 600);
                      
                      const notification = document.createElement('div');
                      notification.textContent = '✅ تم نسخ معلومات الزر';
                      notification.className = 'fixed top-4 right-4 bg-accent text-accent-foreground px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
                      document.body.appendChild(notification);
                      
                      setTimeout(() => {
                        notification.remove();
                      }, 2000);
                    });
                  }}
                >
                  <Copy className="h-2.5 w-2.5 text-muted-foreground" />
                </Button>
              )}
            </div>


            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={facebookUser?.picture?.data?.url || "/placeholder-user.jpg"} 
                      alt={facebookUser?.name || "المستخدم"} 
                    />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      {facebookUser?.name?.charAt(0) || "م"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass-effect" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {facebookUser?.name || "مدير المحتوى"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {facebookSelectedPage ? `${facebookSelectedPage.name} - ${facebookSelectedPage.category}` : "manager@socialforge.ai"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>الملف الشخصي</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>الإعدادات</span>
                </DropdownMenuItem>
                
                {/* زر قطع الاتصال بالفيسبوك */}
                {isFacebookConnected && (
                  <DropdownMenuItem
                    onClick={disconnectFromFacebook}
                    className="cursor-pointer bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 border border-red-500/20 text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>قطع الاتصال بالفيسبوك</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AIHeader;