import { useState, useEffect } from "react";
import { 
  Brain, 
  BarChart3, 
  Calendar, 
  MessageSquare, 
  Users, 
  Zap, 
  Settings,
  TrendingUp,
  Target,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  MessageCircle,
  Facebook,
  Shapes,
  Type,
  Layers,
  Bot,
  Video,
  Trees,
  FileEdit,
  Image,
  Eye,
  Database,
  Wand2,
  Link,
  Copy,
  Building,
  ChevronDown,
  RefreshCw,
  FileCode,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { useFacebook } from "@/contexts/FacebookContext";
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

interface AISidebarProps {
  selectedPage: string;
  onPageChange: (page: string) => void;
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
}

const AISidebar = ({ selectedPage, onPageChange, copySettings }: AISidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // بدء في الوضع المختصر
  const [isManagementExpanded, setIsManagementExpanded] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [isCopyElementsExpanded, setIsCopyElementsExpanded] = useState(false);
  const [isInteractingWithDropdown, setIsInteractingWithDropdown] = useState(false); // حالة التفاعل مع القوائم المنسدلة
  const [sidebarRef, setSidebarRef] = useState<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // إضافة وظائف إدارة صفحات فيسبوك
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [currentUser, setCurrentUser] = useState<FacebookUser | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFacebookPage, setSelectedFacebookPage] = useState<FacebookPage | null>(null);

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

  // تحقق من الاتصال بفيسبوك والصفحات المحفوظة
  useEffect(() => {
    const savedToken = localStorage.getItem("facebook_user_token");
    const savedPages = localStorage.getItem("facebook_pages");
    const savedSelectedPage = localStorage.getItem("facebook_selected_page");
    const savedUserInfo = localStorage.getItem("facebook_user_info");
    
    if (savedToken && savedPages) {
      const parsedPages = JSON.parse(savedPages);
      setPages(parsedPages);
      setIsConnected(true);
      
      if (savedUserInfo) {
        setCurrentUser(JSON.parse(savedUserInfo));
      }
      
      if (savedSelectedPage) {
        const foundPage = parsedPages.find((p: FacebookPage) => p.id === savedSelectedPage);
        if (foundPage) {
          setSelectedFacebookPage(foundPage);
        }
      }
    }
  }, []);

  // إضافة event listener للنقر خارج السايدبار
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef && !sidebarRef.contains(event.target as Node) && !isCollapsed) {
        // التحقق من عدم وجود تفاعل نشط مع القوائم المنسدلة
        if (!isInteractingWithDropdown && !isManagementExpanded && !isContentExpanded) {
          setIsCollapsed(true);
        }
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isCollapsed) {
        if (!isInteractingWithDropdown && !isManagementExpanded) {
          setIsCollapsed(true);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isCollapsed, isInteractingWithDropdown, isManagementExpanded, sidebarRef]);

  // إضافة مستمع للأحداث المخصصة لتبديل التبويبات
  useEffect(() => {
    const handleSwitchTab = (event: CustomEvent) => {
      const { tabId } = event.detail;
      if (tabId === 'facebook-content') {
        onPageChange(tabId);
        toast.success('تم الانتقال إلى تبويب نشر فيسبوك');
      }
    };

    window.addEventListener('switch-to-tab', handleSwitchTab as EventListener);
    
    return () => {
      window.removeEventListener('switch-to-tab', handleSwitchTab as EventListener);
    };
  }, [onPageChange]);

  // استخدام دوال Context بدلاً من الدوال المحلية
  const facebookContext = useFacebook();
  const { disconnectFromFacebook } = facebookContext;

  const handlePageSelect = (page: FacebookPage) => {
    setSelectedFacebookPage(page);
    localStorage.setItem("facebook_selected_page", page.id);
    toast.success(`تم اختيار صفحة: ${page.name}`);
  };

  // وظيفة نسخ معلومات العنصر
  const copyElementInfo = (element: any, isSubTab: boolean = false, buttonElement?: HTMLElement) => {
    const elementInfo = {
      id: element.id,
      label: element.label,
      description: element.description,
      badge: element.badge,
      type: isSubTab ? "management-subtab" : "main-tab",
      icon: element.icon.name || element.icon.displayName || "Icon",
      timestamp: new Date().toISOString()
    };
    
    const infoText = `رمزه في الكود: ${element.id}
المكون: ${element.label}
الوصف: ${element.description}
النوع: ${isSubTab ? 'تبويب فرعي' : 'تبويب رئيسي'}
الأيقونة: ${elementInfo.icon}
التصنيف: ${element.badge || 'بدون تصنيف'}
مكان الكود: AISidebar.tsx`;
    
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

  // التبويبات الفرعية للمحتوى
  const contentSubTabs = [
    {
      id: "content",
      label: "المولد القديم",
      icon: RefreshCw,
      badge: "قديم",
      description: "مولد المحتوى الأصلي"
    },
    {
      id: "analyzer-tab",
      label: "المحلل",
      icon: Settings,
      badge: "محلل",
      description: "تحليل المحتوى والصور"
    },
    {
      id: "content-info",
      label: "معلومات المحتوى",
      icon: Eye,
      badge: "معلومات",
      description: "عرض تفاصيل المحتوى"
    },
    {
      id: "logo-tab",
      label: "الشعار الجانبي",
      icon: Building,
      badge: "شعار جانبي",
      description: "تبويب إنشاء وتحرير الشعار الجانبي"
    },
    {
      id: "live-preview",
      label: "المعاينة المباشرة",
      icon: Eye,
      badge: "معاينة",
      description: "معاينة مباشرة للتغييرات"
    }
  ];

  // التبويبات الفرعية لنسخ العناصر
  const copyElementsSubTabs = [
    {
      id: "copy-elements",
      label: "نسخ العناصر العامة",
      icon: Copy,
      badge: "عام",
      description: "نسخ جميع عناصر الواجهة العامة"
    },
    {
      id: "content-creation-copy",
      label: "عناصر إنشاء المحتوى",
      icon: MessageSquare,
      badge: "محتوى",
      description: "نسخ عناصر إنشاء المحتوى المتخصصة"
    },
    {
      id: "ai-dashboard-copy",
      label: "عناصر الذكاء الاصطناعي",
      icon: Brain,
      badge: "ذكي",
      description: "نسخ عناصر ومكونات لوحة الذكاء الاصطناعي"
    }
  ];

  // التبويبات الفرعية للإدارة
  const managementSubTabs = [
    {
      id: "design-controls",
      label: "التصميم والأشكال",
      icon: Shapes,
      badge: "تصميم",
      description: "إعدادات الأشكال، التخطيط، والمواضع"
    },
    {
      id: "text-controls",
      label: "النص والشفافية",
      icon: Type,
      badge: "نص",
      description: "تحكم شامل في النص، الموضع، والشفافية"
    },
    {
      id: "overlay-controls",
      label: "طبقات",
      icon: Layers,
      badge: "طبقات",
      description: "طبقات الألوان، الخلفية، والحدود المتطورة"
    },
    {
      id: "background-controls",
      label: "خلفية الصورة",
      icon: Image,
      badge: "خلفية",
      description: "تأثيرات وتحسينات خلفية الصورة"
    },
    {
      id: "ai-features",
      label: "الذكاء الاصطناعي",
      icon: Wand2,
      badge: "AI",
      description: "تحليل الصور واقتراحات التصميم الذكية"
    },
    {
      id: "smart-content-controls",
      label: "المحتوى الذكي",
      icon: Eye,
      badge: "ذكي",
      description: "إدارة المحتوى الذكي ومعاينة المنصات مع التحليل المتقدم"
    },
    {
      id: "management-panel",
      label: "الإدارة العامة",
      icon: Database,
      badge: "إدارة",
      description: "إدارة الإعدادات، التصدير، والاستيراد"
    },
    {
      id: "live-preview",
      label: "المعاينة المباشرة",
      icon: Eye,
      badge: "معاينة",
      description: "معاينة مباشرة للتغييرات"
    }
  ];

  const menuItems = [
    {
      id: "dashboard",
      label: "لوحة التحكم",
      icon: BarChart3,
      badge: null,
      description: "نظرة عامة على الأداء"
    },
    {
      id: "content-creation",
      label: "المحتوى",
      icon: MessageSquare,
      badge: "محتوى",
      description: "إنشاء وتحرير المحتوى"
    },
    {
      id: "management",
      label: "الإدارة",
      icon: FileEdit,
      badge: "إدارة",
      description: "الإعدادات المتقدمة"
    },
    {
      id: "video",
      label: "فيديو",
      icon: Video,
      badge: "فيديو",
      description: "رفع ومعالجة الفيديو"
    },
    {
      id: "publishing",
      label: "النشر",
      icon: Send,
      badge: "نشر",
      description: "النشر والجدولة"
    },
    {
      id: "trees",
      label: "الأشجار",
      icon: Trees,
      badge: "هياكل",
      description: "إدارة الهياكل"
    },
    {
      id: "smart-content",
      label: "المحتوى الذكي",
      icon: Bot,
      badge: "ذكي",
      description: "محتوى مُولد بالذكاء الاصطناعي"
    },
    {
      id: "automation",
      label: "أوتوماشن ذكي",
      icon: Zap,
      badge: "تلقائي",
      description: "توليد تلقائي للمحتوى والصور"
    },
    {
      id: "gemini-content",
      label: "🎨 نظام Gemini",
      icon: Sparkles,
      badge: "جديد",
      description: "نظام توليد المحتوى السريع - Gemini مستقل"
    },
    {
      id: "ai-tools",
      label: "الذكاء الاصطناعي",
      icon: Brain,
      badge: "AI",
      description: "تحليل ذكي واقتراحات"
    },
    {
      id: "facebook-content",
      label: "نشر فيسبوك",
      icon: Send,
      badge: "FB",
      description: "النشر والجدولة"
    },
    {
      id: "facebook-interaction",
      label: "تفاعل فيسبوك",
      icon: MessageCircle,
      badge: "FB",
      description: "التعليقات والرسائل"
    },
    {
      id: "facebook-analytics",
      label: "تحليلات فيسبوك",
      icon: TrendingUp,
      badge: "FB",
      description: "تحليلات وبيانات حقيقية"
    },
    {
      id: "analytics",
      label: "التحليلات العامة",
      icon: Users,
      badge: "عام",
      description: "تحليلات مدعومة بالذكاء الاصطناعي"
    },
    {
      id: "facebook-dashboard",
      label: "لوحة فيسبوك",
      icon: Facebook,
      badge: "FB",
      description: "إدارة فيسبوك الشاملة"
    },
    {
      id: "facebook-settings",
      label: "إعدادات فيسبوك",
      icon: Settings,
      badge: "FB",
      description: "الاتصال والإعدادات"
    },
    {
      id: "webhook-settings",
      label: "إعدادات الويب هوك",
      icon: Settings,
      badge: "متقدم",
      description: "إدارة شاملة للويب هوك والردود التلقائية",
    },
    {
      id: "facebook-setup",
      label: "إعداد Facebook تلقائي",
      icon: Facebook,
      badge: "جديد",
      description: "ربط صفحات فيسبوك بالـ webhook تلقائياً",
      isLink: true,
      href: "/webhook"
    },
    {
      id: "webhook-dashboard",
      label: "لوحة تحكم الويب هوك",
      icon: Eye,
      badge: "مراقبة",
      description: "مراقبة الأحداث واستكشاف الأخطاء"
    },
    {
      id: "gemini-vision-integration",
      label: "تكامل Gemini Vision",
      icon: Eye,
      badge: "AI",
      description: "تكامل مع Gemini Vision لتحليل الصور"
    },
    {
      id: "gmail-details",
      label: "تفاصيل Gmail",
      icon: Mail,
      badge: "Gmail",
      description: "إدارة وتحليل بيانات البريد الإلكتروني"
    },
    {
      id: "architecture",
      label: "المخطط المعماري",
      icon: Building,
      badge: "C4",
      description: "مخططات C4 للبنية المعمارية للنظام"
    },
    {
      id: "copy-elements",
      label: "نسخ العناصر",
      icon: Copy,
      badge: "نسخ",
      description: "أزرار نسخ معلومات جميع العناصر"
    },
    {
      id: "components-info",
      label: "دليل المكونات",
      icon: FileCode,
      badge: "دليل",
      description: "معلومات شاملة عن جميع مكونات التطبيق مع أمثلة الأكواد"
    },
  ];

  return (
    <div 
      ref={setSidebarRef}
      className={cn(
        "border-r border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300 h-[calc(100vh-4rem)] overflow-y-auto",
        isCollapsed ? "w-16" : "w-64"
      )}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => {
        // تأخير صغير للسماح بالتفاعل مع القوائم المنسدلة
        setTimeout(() => {
          // عدم التصغير إذا كانت أي من القوائم مفتوحة أو إذا كان هناك تفاعل مع القوائم المنسدلة
          if (!isManagementExpanded && !isContentExpanded && !isCopyElementsExpanded && !isInteractingWithDropdown) {
            setIsCollapsed(true);
          }
        }, 200); // تأخير 200ms للسماح بالانتقال إلى القائمة المنسدلة
      }}
    >
      <div className="p-4">
        {/* Collapse Toggle */}
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* AI Status Card */}
        {!isCollapsed && (
          <div className="space-y-4 mb-6">
            {/* بطاقة محرك الذكاء الاصطناعي */}
            <div className="relative group">
              <Card className="glass-effect border-purple-200 bg-purple-50/50 dark:bg-purple-950/30 dark:border-purple-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-primary">
                      <Brain className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">محرك الذكاء الاصطناعي</h3>
                      <p className="text-xs text-muted-foreground">يعمل بكامل طاقته</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>الاستخدام اليومي</span>
                      <span className="text-accent font-medium">847/1000</span>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-2">
                      <div className="bg-gradient-primary h-2 rounded-full" style={{ width: "84.7%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* أيقونة نسخ المعلومات للبطاقة */}
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
                    const infoText = `رمزه في الكود: AISidebar
المكون: AISidebar`;
                    
                    navigator.clipboard.writeText(infoText);
                    copyElementInfo({
                      id: "ai-status-card",
                      label: "بطاقة محرك الذكاء الاصطناعي",
                      description: "عرض حالة الذكاء الاصطناعي والاستخدام اليومي",
                      badge: "AI Card",
                      icon: Brain
                    }, false, e.currentTarget);
                  }}
                >
                  <Copy className="h-3 w-3 text-primary" />
                </Button>
              )}
            </div>

          </div>
        )}

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            // التحقق من وجود التبويبات الفرعية للمحتوى
            if (item.id === "content-creation") {
              return (
                <Collapsible 
                  key={item.id}
                  open={isContentExpanded} 
                  onOpenChange={setIsContentExpanded}
                >
                  <CollapsibleTrigger asChild>
                    <div className="group relative">
                      <Button
                        variant={selectedPage === item.id ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start text-right",
                          selectedPage === item.id 
                            ? "bg-gradient-primary text-primary-foreground shadow-glow" 
                            : "hover:bg-muted/50",
                          isCollapsed ? "px-2" : "px-3"
                        )}
                        onClick={() => {
                          // إذا لم تكن مفتوحة، افتحها وافتح المولد القديم بشكل افتراضي
                          if (!isContentExpanded) {
                            setIsContentExpanded(true);
                            onPageChange("content"); // فتح تبويب المولد القديم بشكل افتراضي
                          } else {
                            setIsContentExpanded(false);
                          }
                        }}
                      >
                        <item.icon className={cn("h-4 w-4", !isCollapsed && "ml-3")} />
                        {!isCollapsed && (
                          <>
                            <div className="flex-1 text-right">
                              <div className="font-medium">{item.label}</div>
                              <div className="text-xs opacity-70">{item.description}</div>
                            </div>
                            {item.badge && (
                              <Badge 
                                variant="secondary" 
                                className={cn(
                                  "text-xs px-2 py-0",
                                  item.badge === "محتوى" && "bg-blue-100 text-blue-800"
                                )}
                              >
                                {item.badge}
                              </Badge>
                            )}
                            <ChevronRight className={cn(
                              "h-3 w-3 transition-transform duration-200",
                              isContentExpanded && "rotate-90"
                            )} />
                          </>
                        )}
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  
                  {/* التبويبات الفرعية للمحتوى */}
                  <CollapsibleContent className="space-y-1 mt-1 ml-4">
                    {contentSubTabs.map((subTab) => (
                      <div key={subTab.id} className="group relative">
                        <Button
                          variant={selectedPage === subTab.id ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "w-full justify-start text-right",
                            selectedPage === subTab.id 
                              ? "bg-gradient-primary text-primary-foreground shadow-glow" 
                              : "hover:bg-muted/50",
                            "text-xs"
                          )}
                          onClick={() => onPageChange(subTab.id)}
                        >
                          <subTab.icon className="h-3 w-3 ml-2" />
                          <div className="flex-1 text-right">
                            <div className="font-medium">{subTab.label}</div>
                          </div>
                          {subTab.badge && (
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "text-xs px-1 py-0",
                                subTab.badge === "محلل" && "bg-orange-100 text-orange-800",
                                subTab.badge === "إنشاء" && "bg-green-100 text-green-800",
                                subTab.badge === "معلومات" && "bg-blue-100 text-blue-800",
                                subTab.badge === "معاينة" && "bg-purple-100 text-purple-800"
                              )}
                            >
                              {subTab.badge}
                            </Badge>
                          )}
                        </Button>
                        {/* أيقونة نسخ المعلومات للتبويبات الفرعية */}
                        {safeCopySettings.subTabs && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute left-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0 transition-all duration-200 hover:bg-primary/20 hover:scale-110 copy-button"
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
                              const infoText = `رمزه في الكود: ${subTab.id}
المكون: ${subTab.label}
الوصف: ${subTab.description}
النوع: التبويب الفرعي`;
                              
                              navigator.clipboard.writeText(infoText);
                              copyElementInfo(subTab, true, e.currentTarget);
                            }}
                          >
                            <Copy className="h-2.5 w-2.5 text-primary" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            // التحقق من وجود التبويبات الفرعية لنسخ العناصر
            if (item.id === "copy-elements") {
              return (
                <Collapsible 
                  key={item.id}
                  open={isCopyElementsExpanded} 
                  onOpenChange={setIsCopyElementsExpanded}
                >
                  <CollapsibleTrigger asChild>
                    <div className="group relative">
                      <Button
                        variant={selectedPage === item.id ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start text-right",
                          selectedPage === item.id 
                            ? "bg-gradient-primary text-primary-foreground shadow-glow" 
                            : "hover:bg-muted/50",
                          isCollapsed ? "px-2" : "px-3"
                        )}
                        onClick={() => {
                          onPageChange(item.id);
                          setIsCopyElementsExpanded(!isCopyElementsExpanded);
                        }}
                      >
                        <item.icon className={cn("h-4 w-4", !isCollapsed && "ml-3")} />
                        {!isCollapsed && (
                          <>
                            <div className="flex-1 text-right">
                              <div className="font-medium">{item.label}</div>
                              <div className="text-xs opacity-70">{item.description}</div>
                            </div>
                            {item.badge && (
                              <Badge 
                                variant="secondary" 
                                className={cn(
                                  "text-xs px-2 py-0",
                                  item.badge === "نسخ" && "bg-orange-100 text-orange-800"
                                )}
                              >
                                {item.badge}
                              </Badge>
                            )}
                            <ChevronRight className={cn(
                              "h-3 w-3 transition-transform duration-200",
                              isCopyElementsExpanded && "rotate-90"
                            )} />
                          </>
                        )}
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  
                  {/* التبويبات الفرعية لنسخ العناصر */}
                  <CollapsibleContent className="space-y-1 mt-1 ml-4">
                    {copyElementsSubTabs.map((subTab) => (
                      <div key={subTab.id} className="group relative">
                        <Button
                          variant={selectedPage === subTab.id ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "w-full justify-start text-right",
                            selectedPage === subTab.id 
                              ? "bg-gradient-primary text-primary-foreground shadow-glow" 
                              : "hover:bg-muted/50",
                            "text-xs"
                          )}
                          onClick={() => onPageChange(subTab.id)}
                        >
                          <subTab.icon className="h-3 w-3 ml-2" />
                          <div className="flex-1 text-right">
                            <div className="font-medium">{subTab.label}</div>
                          </div>
                          {subTab.badge && (
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "text-xs px-1 py-0",
                                subTab.badge === "عام" && "bg-gray-100 text-gray-800",
                                subTab.badge === "محتوى" && "bg-blue-100 text-blue-800"
                              )}
                            >
                              {subTab.badge}
                            </Badge>
                          )}
                        </Button>
                        {/* أيقونة نسخ المعلومات للتبويبات الفرعية */}
                        {safeCopySettings.subTabs && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute left-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0 transition-all duration-200 hover:bg-primary/20 hover:scale-110 copy-button"
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
                              copyElementInfo(subTab, true, e.currentTarget);
                            }}
                          >
                            <Copy className="h-2.5 w-2.5 text-primary" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            // التحقق من وجود التبويبات الفرعية للإدارة
            if (item.id === "management") {
              return (
                <Collapsible 
                  key={item.id}
                  open={isManagementExpanded} 
                  onOpenChange={setIsManagementExpanded}
                >
                  <CollapsibleTrigger asChild>
                    <div className="group relative">
                      <Button
                        variant={selectedPage === item.id ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start text-right",
                          selectedPage === item.id 
                            ? "bg-gradient-primary text-primary-foreground shadow-glow" 
                            : "hover:bg-muted/50",
                          isCollapsed ? "px-2" : "px-3"
                        )}
                        onClick={() => {
                          onPageChange(item.id);
                          setIsManagementExpanded(!isManagementExpanded);
                        }}
                      >
                        <item.icon className={cn("h-4 w-4", !isCollapsed && "ml-3")} />
                        {!isCollapsed && (
                          <>
                            <div className="flex-1 text-right">
                              <div className="font-medium">{item.label}</div>
                              <div className="text-xs opacity-70">{item.description}</div>
                            </div>
                            {item.badge && (
                              <Badge 
                                variant="secondary" 
                                className={cn(
                                  "text-xs px-2 py-0",
                                  item.badge === "AI" && "bg-accent/20 text-accent",
                                  item.badge === "Pro" && "bg-secondary/20 text-secondary",
                                  item.badge === "جديد" && "bg-primary/20 text-primary",
                                  item.badge === "FB" && "bg-blue-100 text-blue-800",
                                  item.badge === "إدارة" && "bg-primary/20 text-primary"
                                )}
                              >
                                {item.badge}
                              </Badge>
                            )}
                            <ChevronRight className={cn(
                              "h-3 w-3 transition-transform duration-200",
                              isManagementExpanded && "rotate-90"
                            )} />
                          </>
                        )}
                      </Button>
                      {/* أيقونة نسخ المعلومات */}
                      {!isCollapsed && safeCopySettings.mainTabs && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 transition-all duration-200 hover:bg-accent/20 hover:scale-110 copy-button"
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
                            const infoText = `رمزه في الكود: ${item.id}
المكون: ${item.label}
الوصف: ${item.description}
النوع: تبويب رئيسي
الأيقونة: ${item.icon.name || item.icon.displayName || 'Icon'}
التصنيف: ${item.badge || 'بدون تصنيف'}
مكان الكود: AISidebar.tsx`;
                            
                            navigator.clipboard.writeText(infoText);
                            copyElementInfo(item, false, e.currentTarget);
                          }}
                        >
                          <Copy className="h-3 w-3 text-accent" />
                        </Button>
                      )}
                    </div>
                  </CollapsibleTrigger>
                  
                  {/* التبويبات الفرعية للإدارة */}
                  <CollapsibleContent className="space-y-1 mt-1 ml-4">
                    {managementSubTabs.map((subTab) => (
                      <div key={subTab.id} className="group relative">
                        <Button
                          variant={selectedPage === subTab.id ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "w-full justify-start text-right",
                            selectedPage === subTab.id 
                              ? "bg-gradient-primary text-primary-foreground shadow-glow" 
                              : "hover:bg-muted/50",
                            "text-xs"
                          )}
                          onClick={() => onPageChange(subTab.id)}
                        >
                          <subTab.icon className="h-3 w-3 ml-2" />
                          <div className="flex-1 text-right">
                            <div className="font-medium">{subTab.label}</div>
                          </div>
                          {subTab.badge && (
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "text-xs px-1 py-0",
                                subTab.badge === "AI" && "bg-accent/20 text-accent",
                                subTab.badge === "تصميم" && "bg-blue-100 text-blue-800",
                                subTab.badge === "نص" && "bg-green-100 text-green-800",
                                subTab.badge === "طبقات" && "bg-purple-100 text-purple-800",
                                subTab.badge === "خلفية" && "bg-yellow-100 text-yellow-800",
                                 subTab.badge === "ذكي" && "bg-accent/20 text-accent",
                                 subTab.badge === "إدارة" && "bg-primary/20 text-primary",
                                 subTab.badge === "معاينة" && "bg-purple-100 text-purple-800"
                              )}
                            >
                              {subTab.badge}
                            </Badge>
                          )}
                        </Button>
                        {/* أيقونة نسخ المعلومات للتبويبات الفرعية */}
                        {safeCopySettings.subTabs && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute left-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0 transition-all duration-200 hover:bg-primary/20 hover:scale-110 copy-button"
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
                              const infoText = `رمزه في الكود: ${subTab.id}
المكون: ${subTab.label}
الوصف: ${subTab.description}
النوع: تبويب فرعي إدارة
الأيقونة: ${subTab.icon.name || subTab.icon.displayName || 'Icon'}
التصنيف: ${subTab.badge || 'بدون تصنيف'}
مكان الكود: AISidebar.tsx`;
                              
                              navigator.clipboard.writeText(infoText);
                              copyElementInfo(subTab, true, e.currentTarget);
                            }}
                          >
                            <Copy className="h-2.5 w-2.5 text-primary" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            }
            
            // التصميم المخصص لتبويبة الأتمتة الذكية
            if (item.id === "automation") {
              return (
                <div key={item.id} className="group relative mb-2">
                  <div className="relative overflow-hidden rounded-xl">
                    {/* خلفية متحركة متدرجة */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 animate-smart-glow opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-400/10 to-red-400/10" />
                    
                    {/* تأثيرات جسيمات متحركة */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-2 left-4 w-1 h-1 bg-yellow-400/60 rounded-full animate-smart-particle" style={{ animationDelay: '0s' }} />
                      <div className="absolute top-6 right-6 w-0.5 h-0.5 bg-orange-400/60 rounded-full animate-smart-particle" style={{ animationDelay: '0.5s' }} />
                      <div className="absolute bottom-3 left-8 w-1.5 h-1.5 bg-red-400/40 rounded-full animate-smart-particle" style={{ animationDelay: '1s' }} />
                      <div className="absolute bottom-6 right-4 w-1 h-1 bg-yellow-500/50 rounded-full animate-smart-particle" style={{ animationDelay: '1.5s' }} />
                    </div>
                    
                    <Button
                      variant={selectedPage === item.id ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start text-right relative z-10 border-0 bg-transparent",
                        selectedPage === item.id 
                          ? "bg-gradient-to-r from-yellow-500/30 via-orange-500/30 to-red-500/30 text-white font-bold shadow-2xl backdrop-blur-sm" 
                          : "hover:bg-gradient-to-r hover:from-yellow-400/20 hover:via-orange-400/20 hover:to-red-400/20 hover:backdrop-blur-sm hover:text-orange-800 dark:hover:text-orange-200",
                        isCollapsed ? "px-2 py-4" : "px-4 py-4"
                      )}
                      onClick={() => {
                        console.log(`Navigating to: ${item.id}`);
                        onPageChange(item.id);
                      }}
                    >
                      {/* أيقونة متطورة مع تأثيرات */}
                      <div className={cn("relative", !isCollapsed && "ml-3")}>
                        <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ai-pulse" />
                        <item.icon className={cn(
                          "h-5 w-5 relative z-10 transition-all duration-300",
                          selectedPage === item.id 
                            ? "text-white drop-shadow-lg animate-pulse" 
                            : "text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 group-hover:scale-110"
                        )} />
                        {/* شرارة صغيرة حول الأيقونة */}
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400/80 rounded-full animate-ping" />
                      </div>
                      
                      {!isCollapsed && (
                        <>
                          <div className="flex-1 text-right">
                            <div className={cn(
                              "font-bold text-sm transition-all duration-300",
                              selectedPage === item.id 
                                ? "text-white drop-shadow-md" 
                                : "text-orange-700 dark:text-orange-300 group-hover:text-orange-800 dark:group-hover:text-orange-200"
                            )}>
                              {item.label}
                            </div>
                            <div className={cn(
                              "text-xs transition-all duration-300",
                              selectedPage === item.id 
                                ? "text-white/90 drop-shadow-sm" 
                                : "text-orange-600/80 dark:text-orange-400/80 group-hover:text-orange-700/90 dark:group-hover:text-orange-300/90"
                            )}>
                              {item.description}
                            </div>
                          </div>
                          
                          {item.badge && (
                            <div className="relative">
                              <Badge 
                                variant="secondary" 
                                className={cn(
                                  "text-xs px-3 py-1 font-semibold transition-all duration-300 border-0",
                                  selectedPage === item.id
                                    ? "bg-white/20 text-white backdrop-blur-sm shadow-lg animate-pulse"
                                    : "bg-gradient-to-r from-yellow-400/90 to-orange-500/90 text-white shadow-md hover:shadow-lg hover:scale-105"
                                )}
                              >
                                <Zap className="w-3 h-3 mr-1" />
                                {item.badge}
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
                                      id: `badge-${item.id}`,
                                      label: `شارة ${item.badge}`,
                                      description: `شارة تصنيف للعنصر ${item.label}`,
                                      badge: item.badge,
                                      icon: item.icon
                                    }, false, e.currentTarget);
                                  }}
                                >
                                  <Copy className="h-2 w-2 text-secondary" />
                                </Button>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </Button>
                    
                    {/* تأثير الوهج الخارجي */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10" />
                  </div>
                  
                  {/* أيقونة نسخ المعلومات للأتمتة الذكية */}
                  {!isCollapsed && safeCopySettings.mainTabs && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 transition-all duration-200 hover:bg-orange/20 hover:scale-110 copy-button z-20"
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
                        const infoText = `رمزه في الكود: ${item.id}
المكون: ${item.label}
الوصف: ${item.description}
النوع: تبويب رئيسي
الأيقونة: ${item.icon.name || item.icon.displayName || 'Icon'}
التصنيف: ${item.badge || 'بدون تصنيف'}
مكان الكود: AISidebar.tsx`;
                        
                        navigator.clipboard.writeText(infoText);
                        copyElementInfo(item, false, e.currentTarget);
                      }}
                    >
                      <Copy className="h-3 w-3 text-accent" />
                    </Button>
                  )}
                </div>
              );
            }
            
            // التصميم المخصص لتبويبة Gmail
            if (item.id === "gmail-details") {
              return (
                <div key={item.id} className="group relative mb-2">
                  <div className="relative overflow-hidden rounded-xl">
                    {/* خلفية متحركة متدرجة للGmail */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 via-red-500/20 to-red-600/20 animate-smart-glow opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-red-400/10 to-pink-400/10" />
                    
                    {/* تأثيرات جسيمات متحركة للGmail */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-2 left-4 w-1 h-1 bg-red-400/60 rounded-full animate-smart-particle" style={{ animationDelay: '0s' }} />
                      <div className="absolute top-6 right-6 w-0.5 h-0.5 bg-pink-400/60 rounded-full animate-smart-particle" style={{ animationDelay: '0.5s' }} />
                      <div className="absolute bottom-3 left-8 w-1.5 h-1.5 bg-red-500/40 rounded-full animate-smart-particle" style={{ animationDelay: '1s' }} />
                      <div className="absolute bottom-6 right-4 w-1 h-1 bg-red-600/50 rounded-full animate-smart-particle" style={{ animationDelay: '1.5s' }} />
                    </div>
                    
                    <Button
                      variant={selectedPage === item.id ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start text-right relative z-10 border-0 bg-transparent",
                        selectedPage === item.id 
                          ? "text-white" 
                          : "text-foreground hover:text-white hover:bg-red-500/20",
                        isCollapsed ? "px-2" : "px-3"
                      )}
                      onClick={() => {
                        console.log(`Navigating to Gmail: ${item.id}`);
                        // فتح صفحة Gmail مباشرة
                        navigate("/gmail-details");
                      }}
                    >
                      <item.icon className={cn(
                        "h-4 w-4 drop-shadow-sm",
                        !isCollapsed && "ml-3",
                        selectedPage === item.id ? "text-white" : "text-red-500"
                      )} />
                      {!isCollapsed && (
                        <>
                          <div className="flex-1 text-right">
                            <div className="font-bold drop-shadow-sm">{item.label}</div>
                            <div className="text-xs opacity-80 drop-shadow-sm">{item.description}</div>
                          </div>
                          {item.badge && (
                            <div className="relative">
                              <Badge 
                                variant="secondary" 
                                className={cn(
                                  "text-xs px-2 py-0 relative z-10 shadow-md",
                                  selectedPage === item.id
                                    ? "bg-white/20 text-white backdrop-blur-sm shadow-lg animate-pulse"
                                    : "bg-gradient-to-r from-red-400/90 to-red-500/90 text-white shadow-md hover:shadow-lg hover:scale-105"
                                )}
                              >
                                <Mail className="w-3 h-3 mr-1" />
                                {item.badge}
                              </Badge>
                            </div>
                          )}
                        </>
                      )}
                    </Button>
                    
                    {/* تأثير الوهج الخارجي للGmail */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 via-red-500/10 to-red-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10" />
                  </div>
                  
                  {/* أيقونة نسخ المعلومات للGmail */}
                  {!isCollapsed && safeCopySettings.mainTabs && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 transition-all duration-200 hover:bg-red/20 hover:scale-110 copy-button z-20"
                      style={{ 
                        opacity: safeCopySettings.opacity / 100,
                        background: `hsl(var(--destructive) / ${safeCopySettings.opacity / 100 * 0.1})`,
                        borderColor: `hsl(var(--destructive) / ${safeCopySettings.opacity / 100 * 0.3})`,
                        border: '1px solid'
                      } as React.CSSProperties}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.background = `hsl(var(--destructive) / 0.2)`;
                        e.currentTarget.style.borderColor = `hsl(var(--destructive) / 0.5)`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = `${safeCopySettings.opacity / 100}`;
                        e.currentTarget.style.background = `hsl(var(--destructive) / ${safeCopySettings.opacity / 100 * 0.1})`;
                        e.currentTarget.style.borderColor = `hsl(var(--destructive) / ${safeCopySettings.opacity / 100 * 0.3})`;
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const infoText = `رمزه في الكود: ${item.id}
المكون: ${item.label}
الوصف: ${item.description}
النوع: تبويب رئيسي
الأيقونة: ${item.icon.name || item.icon.displayName || 'Icon'}
التصنيف: ${item.badge || 'بدون تصنيف'}
مكان الكود: AISidebar.tsx`;
                        
                        navigator.clipboard.writeText(infoText);
                        copyElementInfo(item, false, e.currentTarget);
                      }}
                    >
                      <Copy className="h-3 w-3 text-destructive" />
                    </Button>
                  )}
                </div>
              );
            }
            
            // باقي العناصر العادية
            return (
              <div key={item.id} className="group relative">
                <Button
                  variant={selectedPage === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start text-right",
                    selectedPage === item.id 
                      ? "bg-gradient-primary text-primary-foreground shadow-glow" 
                      : "hover:bg-muted/50",
                    isCollapsed ? "px-2" : "px-3"
                  )}
                   onClick={() => {
                     console.log(`Navigating to: ${item.id}`);
                     if (item.isLink && item.href) {
                       navigate(item.href);
                     } else {
                       onPageChange(item.id);
                     }
                   }}
                >
                  <item.icon className={cn("h-4 w-4", !isCollapsed && "ml-3")} />
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 text-right">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs opacity-70">{item.description}</div>
                      </div>
                      {item.badge && (
                        <div className="relative">
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs px-2 py-0",
                               item.badge === "AI" && "bg-accent/20 text-accent",
                               item.badge === "Pro" && "bg-secondary/20 text-secondary",
                               item.badge === "جديد" && "bg-primary/20 text-primary",
                               item.badge === "FB" && "bg-blue-100 text-blue-800",
                               item.badge === "Gmail" && "bg-red-100 text-red-800"
                            )}
                          >
                            {item.badge}
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
                                  id: `badge-${item.id}`,
                                  label: `شارة ${item.badge}`,
                                  description: `شارة تصنيف للعنصر ${item.label}`,
                                  badge: item.badge,
                                  icon: item.icon
                                }, false, e.currentTarget);
                              }}
                            >
                              <Copy className="h-2 w-2 text-secondary" />
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </Button>
                {/* أيقونة نسخ المعلومات للعناصر العادية */}
                {!isCollapsed && safeCopySettings.mainTabs && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 transition-all duration-200 hover:bg-accent/20 hover:scale-110 copy-button"
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
                      const infoText = `رمزه في الكود: ${item.id}
المكون: ${item.label}
الوصف: ${item.description}
النوع: تبويب رئيسي
الأيقونة: ${item.icon.name || item.icon.displayName || 'Icon'}
التصنيف: ${item.badge || 'بدون تصنيف'}
مكان الكود: AISidebar.tsx`;
                      
                      navigator.clipboard.writeText(infoText);
                      copyElementInfo(item, false, e.currentTarget);
                    }}
                  >
                    <Copy className="h-3 w-3 text-accent" />
                  </Button>
                )}
              </div>
            );
          })}
        </nav>

        {/* AI Suggestions */}
        {!isCollapsed && (
          <div className="relative group">
            <Card className="mt-6 glass-effect border-accent/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <h3 className="font-semibold text-sm">اقتراحات ذكية</h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
                    <p className="font-medium text-accent mb-1">وقت النشر الأمثل</p>
                    <p className="text-muted-foreground">انشر في 3:30 مساءً لتحقيق أقصى تفاعل</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/10">
                    <p className="font-medium text-secondary mb-1">نوع المحتوى</p>
                    <p className="text-muted-foreground">المحتوى المرئي يحقق +67% تفاعل</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* أيقونة نسخ المعلومات للبطاقات */}
            {safeCopySettings.cards && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-2 h-6 w-6 p-0 transition-all duration-200 hover:bg-accent/20 hover:scale-110 copy-button"
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
                    id: "ai-suggestions-card",
                    label: "بطاقة الاقتراحات الذكية",
                    description: "عرض اقتراحات الذكاء الاصطناعي للنشر والمحتوى",
                    badge: "AI Suggestions",
                    icon: Sparkles
                  }, false, e.currentTarget);
                }}
              >
                <Copy className="h-3 w-3 text-accent" />
              </Button>
            )}
          </div>
        )}

        {/* Settings */}
        <div className="mt-8 relative group">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isCollapsed ? "px-2" : "px-3"
            )}
          >
            <Settings className={cn("h-4 w-4", !isCollapsed && "ml-3")} />
            {!isCollapsed && <span>الإعدادات</span>}
          </Button>
          {/* أيقونة نسخ المعلومات للأزرار */}
          {!isCollapsed && safeCopySettings.buttons && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 transition-all duration-200 hover:bg-muted/20 hover:scale-110 copy-button"
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
                copyElementInfo({
                  id: "settings-button",
                  label: "زر الإعدادات",
                  description: "زر للوصول إلى إعدادات التطبيق",
                  badge: "Button",
                  icon: Settings
                }, false, e.currentTarget);
              }}
            >
              <Copy className="h-3 w-3 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISidebar;