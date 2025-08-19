import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Facebook, Send, Clock, AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useGeneratedContent } from "@/contexts/GeneratedContentContext";
import { DirectPublisher } from "./FacebookManager/DirectPublisher";
import { ScheduledPostsManager } from "./FacebookManager/ScheduledPostsManager";
import { AuthenticationManager } from "./FacebookManager/AuthenticationManager";
import { PageSelector } from "./FacebookManager/PageSelector";
import { FacebookPageHeader } from "./FacebookPageHeader";
import { CopySettings } from "@/types/copySettings";

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

interface FacebookContentProps {
  generatedContent?: {
    longText: string;
    shortText: string;
    imageUrl: string;
    imageAlt?: string;
    originalImageUrl?: string;
    uploadedImageUrl?: string;
  } | null;
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

export const FacebookContent = ({ generatedContent, copySettings }: FacebookContentProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
  const [userAccessToken, setUserAccessToken] = useState("");
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [pageDetails, setPageDetails] = useState<any>(null);
  
  // استخدام Context بدلاً من localStorage المحلي
  const { 
    generatedContent: contextContent, 
    clearGeneratedContent: clearContextContent, 
    hasContent 
  } = useGeneratedContent();

  // Check if already connected on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem("facebook_user_token");
    const savedPages = localStorage.getItem("facebook_pages");
    const savedSelectedPage = localStorage.getItem("facebook_selected_page");
    
    if (savedToken && savedPages) {
      setUserAccessToken(savedToken);
      const parsedPages = JSON.parse(savedPages);
      setIsConnected(true);
      
      if (savedSelectedPage) {
        const foundPage = parsedPages.find((p: FacebookPage) => p.id === savedSelectedPage);
        if (foundPage) {
          setSelectedPage(foundPage);
        }
      }
    }
  }, []);

  // عرض إشعار عندما يكون هناك محتوى متاح
  useEffect(() => {
    if (hasContent) {
      toast.info("محتوى محفوظ متاح للنشر", { duration: 2000 });
    }
  }, [hasContent]);

  // تحديث تلقائي كل 60 ثانية
  useEffect(() => {
    if (selectedPage) {
      const interval = setInterval(() => {
        fetchPageDetails(selectedPage);
        toast.info("🔄 تم تحديث البيانات تلقائياً", { duration: 1500 });
      }, 60000); // 60 ثانية

      return () => clearInterval(interval);
    }
  }, [selectedPage]);

  const handlePageSelect = (page: FacebookPage) => {
    setSelectedPage(page);
    localStorage.setItem("facebook_selected_page", page.id);
    toast.success("تم اختيار الصفحة بنجاح");
    
    // جلب تفاصيل الصفحة والمنشورات الأخيرة
    fetchPageDetails(page);
  };

  const fetchPageDetails = async (page: FacebookPage) => {
    try {
      // جلب تفاصيل الصفحة مع صورة الغلاف
      const pageResponse = await fetch(
        `https://graph.facebook.com/v19.0/${page.id}?access_token=${page.access_token}&fields=id,name,category,picture.type(large),cover,fan_count,followers_count`
      );
      const pageData = await pageResponse.json();
      
      if (!pageData.error) {
        setPageDetails(pageData);
      }

      // جلب المنشورات الأخيرة مع الصور
      const postsResponse = await fetch(
        `https://graph.facebook.com/v19.0/${page.id}/posts?access_token=${page.access_token}&fields=id,message,full_picture,attachments,created_time,likes.summary(true),comments.summary(true),shares&limit=6`
      );
      const postsData = await postsResponse.json();
      
      if (!postsData.error && postsData.data) {
        setRecentPosts(postsData.data);
      }
    } catch (error) {
      console.error("Error fetching page details:", error);
    }
  };

  const handleClearGeneratedContent = () => {
    clearContextContent();
    toast.success("تم مسح المحتوى المُولد");
  };

  const disconnectFromFacebook = () => {
    setIsConnected(false);
    setSelectedPage(null);
    setUserAccessToken("");
    localStorage.removeItem("facebook_user_token");
    localStorage.removeItem("facebook_pages");
    localStorage.removeItem("facebook_selected_page");
    localStorage.removeItem("facebook_user_info");
    localStorage.removeItem("facebook_auth_method");
    toast.success("تم قطع الاتصال بفيسبوك");
  };

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <Card className="shadow-elegant border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              يجب الاتصال بفيسبوك أولاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              للوصول إلى ميزات النشر والجدولة، يجب عليك الاتصال بحساب فيسبوك أولاً من بطاقة "صفحات فيسبوك" في الشريط الجانبي.
            </p>
            <Button variant="outline" disabled>
              استخدم بطاقة "صفحات فيسبوك" للاتصال
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Facebook Page Header with Cover Image */}
      {selectedPage && (
        <FacebookPageHeader 
          selectedPage={pageDetails || selectedPage}
          recentPosts={recentPosts}
          copySettings={copySettings}
        />
      )}

      {/* Generated Content Alert */}
      {(contextContent || generatedContent) && (
        <Card className="shadow-elegant border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-accent">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                محتوى مُولد جاهز للنشر
              </div>
              <Button variant="outline" size="sm" onClick={handleClearGeneratedContent}>
                مسح المحتوى
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>النص:</strong> {(contextContent || generatedContent)?.longText?.substring(0, 100)}...
              </p>
              {(contextContent || generatedContent)?.imageUrl && (
                <p className="text-sm text-muted-foreground">
                  <strong>الصورة:</strong> متوفرة ✓
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Page Selector */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Facebook className="h-5 w-5" />
              إدارة المحتوى - فيسبوك
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                متصل
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={disconnectFromFacebook}>
              قطع الاتصال
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PageSelector
            accessToken={userAccessToken}
            onPageSelect={handlePageSelect}
            selectedPage={selectedPage}
            copySettings={copySettings}
          />
        </CardContent>
      </Card>

      {/* Content Management Tabs */}
      <Tabs defaultValue="publish" className="w-full">
        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-1 mb-4">
          <TabsList className="w-full bg-transparent gap-1 flex justify-center">
            <TabsTrigger 
              value="publish" 
              className="px-6 py-2 flex items-center gap-2 bg-background/60 border border-border/50 
                hover:bg-accent/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                transition-all duration-200 hover:scale-105"
            >
              <Send className="h-4 w-4" />
              النشر المباشر
            </TabsTrigger>

            <TabsTrigger 
              value="scheduled" 
              className="px-6 py-2 flex items-center gap-2 bg-background/60 border border-border/50 
                hover:bg-accent/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                transition-all duration-200 hover:scale-105"
            >
              <Clock className="h-4 w-4" />
              المنشورات المجدولة
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="publish">
          {selectedPage ? (
            <DirectPublisher 
              selectedPage={selectedPage}
              generatedContent={contextContent || generatedContent}
            />
          ) : (
            <Card className="shadow-elegant">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  يرجى اختيار صفحة فيسبوك للمتابعة
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="scheduled">
          {selectedPage ? (
            <ScheduledPostsManager selectedPage={selectedPage} />
          ) : (
            <Card className="shadow-elegant">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  يرجى اختيار صفحة فيسبوك للمتابعة
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};