import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Facebook, MessageSquare, MessageCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { CommentManager } from "./FacebookManager/CommentManager";
import { MessengerManager } from "./FacebookManager/MessengerManager";
import { PageSelector } from "./FacebookManager/PageSelector";
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

interface FacebookInteractionProps {
  copySettings?: CopySettings;
}

export const FacebookInteraction = ({ copySettings }: FacebookInteractionProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
  const [userAccessToken, setUserAccessToken] = useState("");

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

  const handlePageSelect = (page: FacebookPage) => {
    setSelectedPage(page);
    localStorage.setItem("facebook_selected_page", page.id);
    toast.success("تم اختيار الصفحة بنجاح");
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
              للوصول إلى ميزات إدارة التعليقات والرسائل، يجب عليك الاتصال بحساب فيسبوك أولاً من قسم "إعدادات الفيسبوك".
            </p>
            <Button variant="outline" onClick={() => window.location.href = "#facebook-settings"}>
              الذهاب إلى إعدادات الفيسبوك
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Selector */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Facebook className="h-5 w-5" />
              إدارة التفاعل - فيسبوك
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

      {/* Interaction Management Tabs */}
      <Tabs defaultValue="comments" className="w-full" onValueChange={(tab) => {
        // تحديث البيانات عند الانتقال بين التبويبات
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('refreshFacebookData'));
        }, 100);
      }}>
        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-1 mb-4">
          <TabsList className="w-full bg-transparent gap-1 flex justify-center">
            <TabsTrigger 
              value="comments" 
              className="px-6 py-2 flex items-center gap-2 bg-background/60 border border-border/50 
                hover:bg-accent/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                transition-all duration-200 hover:scale-105"
            >
              <MessageSquare className="h-4 w-4" />
              إدارة التعليقات
            </TabsTrigger>

            <TabsTrigger 
              value="messages" 
              className="px-6 py-2 flex items-center gap-2 bg-background/60 border border-border/50 
                hover:bg-accent/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                transition-all duration-200 hover:scale-105"
            >
              <MessageCircle className="h-4 w-4" />
              إدارة الرسائل
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="comments">
          {selectedPage ? (
            <CommentManager selectedPage={selectedPage} />
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
        
        <TabsContent value="messages">
          {selectedPage ? (
            <MessengerManager selectedPage={selectedPage} />
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