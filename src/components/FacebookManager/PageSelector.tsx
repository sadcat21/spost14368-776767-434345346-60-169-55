import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, User, Globe, Building, Copy } from "lucide-react";
import { toast } from "sonner";
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

interface FacebookUser {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

interface PageSelectorProps {
  accessToken: string;
  onPageSelect: (page: FacebookPage) => void;
  selectedPage?: FacebookPage;
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
    opacity: number;
  };
}

export const PageSelector = ({ accessToken, onPageSelect, selectedPage, copySettings }: PageSelectorProps) => {
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [currentUser, setCurrentUser] = useState<FacebookUser | null>(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (accessToken) {
      loadUserInfo();
      loadPages();
    }
  }, [accessToken]);

  const loadUserInfo = async () => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture&access_token=${accessToken}`
      );
      
      const userData = await response.json();
      
      if (userData.error) {
        throw new Error(userData.error.message);
      }

      setCurrentUser(userData);
    } catch (error) {
      console.error("Error loading user info:", error);
      toast.error("فشل في تحميل معلومات المستخدم");
    }
  };

  const loadPages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,category,access_token,picture&access_token=${accessToken}`
      );
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const pagesData = data.data || [];
      setPages(pagesData);
      
      // Auto-select first page if none selected
      if (pagesData.length > 0 && !selectedPage) {
        onPageSelect(pagesData[0]);
      }
      
    } catch (error) {
      console.error("Error loading pages:", error);
      toast.error("فشل في تحميل الصفحات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 arabic-text">
      {/* User Info */}
      {currentUser && (
        <Card className="shadow-elegant border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentUser.picture?.data?.url} alt={currentUser.name} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{currentUser.name}</p>
                {currentUser.email && (
                  <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                )}
              </div>
              <Badge variant="outline" className="mr-auto">
                <Globe className="h-3 w-3 mr-1" />
                متصل بفيسبوك
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Page Selector */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Building className="h-5 w-5" />
            اختيار الصفحة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <p>جاري تحميل الصفحات...</p>
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>لا توجد صفحات متاحة</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative group">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between h-auto p-3"
                      disabled={loading}
                    >
                      {selectedPage ? (
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage 
                              src={selectedPage.picture?.data?.url} 
                              alt={selectedPage.name} 
                            />
                            <AvatarFallback>
                              <Building className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-right">
                            <p className="font-medium">{selectedPage.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedPage.category}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span>اختر صفحة فيسبوك</span>
                      )}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="w-full min-w-[400px] max-h-[300px] overflow-y-auto bg-background border shadow-lg z-50"
                    align="end"
                  >
                    {pages.map((page) => (
                      <DropdownMenuItem
                        key={page.id}
                        onClick={() => onPageSelect(page)}
                        className="p-3 cursor-pointer hover:bg-muted/50 focus:bg-muted"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage 
                              src={page.picture?.data?.url} 
                              alt={page.name}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-primary/10">
                              <Building className="h-5 w-5 text-primary" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 text-right min-w-0">
                            <p className="font-medium truncate">{page.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {page.category}
                              </Badge>
                              {selectedPage?.id === page.id && (
                                <Badge variant="default" className="text-xs">
                                  محدد حالياً
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              ID: {page.id.substring(0, 15)}...
                            </p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* أيقونة نسخ للقوائم المنسدلة */}
                {safeCopySettings.menus && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -left-6 top-1/2 -translate-y-1/2 h-5 w-5 p-0 transition-all duration-200 hover:bg-primary/20 hover:scale-110 copy-button"
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
                      const dropdownInfo = {
                        id: "facebook-page-selector-dropdown",
                        label: "قائمة اختيار صفحات فيسبوك",
                        description: "قائمة منسدلة لاختيار صفحة فيسبوك للإدارة",
                        type: "DropdownMenu",
                        selectedPage: selectedPage?.name || "لم يتم الاختيار",
                        totalPages: pages.length,
                        location: "PageSelector Component"
                      };
                      
                      const infoText = `رمزه في الكود: PageSelector
المكون: PageSelector`;
                      
                      navigator.clipboard.writeText(infoText).then(() => {
                        e.currentTarget.classList.add('copied');
                        setTimeout(() => {
                          e.currentTarget.classList.remove('copied');
                        }, 600);
                        
                        const notification = document.createElement('div');
                        notification.textContent = '✅ تم نسخ معلومات القائمة المنسدلة';
                        notification.className = 'fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
                        document.body.appendChild(notification);
                        
                        setTimeout(() => {
                          notification.remove();
                        }, 2000);
                      });
                    }}
                  >
                    <Copy className="h-2.5 w-2.5 text-primary" />
                  </Button>
                )}
              </div>

              <div className="text-xs text-muted-foreground text-center">
                يتم عرض الصفحات التي لديك صلاحيات إدارتها فقط
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};