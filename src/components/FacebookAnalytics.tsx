import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Facebook, 
  BarChart3, 
  Brain, 
  Info, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  Zap,
  Database,
  Sparkles,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { PageAnalytics } from "./FacebookManager/PageAnalytics";
import { EnhancedAnalyzer } from "./FacebookManager/EnhancedAnalyzer";
import { PageInfo } from "./FacebookManager/PageInfo";
import { RealTimeAnalytics } from "./FacebookManager/RealTimeAnalytics";
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

interface FacebookAnalyticsProps {
  copySettings?: CopySettings;
}

export const FacebookAnalytics = ({ copySettings }: FacebookAnalyticsProps) => {
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
              للوصول إلى التحليلات وبيانات الصفحة، يجب عليك الاتصال بحساب فيسبوك أولاً من بطاقة "صفحات فيسبوك" في الشريط الجانبي.
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
    <div className="space-y-3">
      {/* Compact Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-primary/20 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 opacity-50" />
          <CardHeader className="relative pb-3">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center gap-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
                  <Facebook className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    تحليلات فيسبوك
                  </CardTitle>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-green-500/10 to-green-600/10 text-green-600 border-green-500/20 text-xs px-2 py-0.5"
                    >
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
                      متصل
                    </Badge>
                    <Badge variant="outline" className="text-xs text-muted-foreground px-2 py-0.5">
                      FB Analytics
                    </Badge>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={disconnectFromFacebook}
                  className="border-destructive/20 text-destructive hover:bg-destructive/10 h-8 px-3 text-xs"
                >
                  قطع الاتصال
                </Button>
              </motion.div>
            </div>
          </CardHeader>
          <CardContent className="relative pt-0 pb-4">
            <PageSelector
              accessToken={userAccessToken}
              onPageSelect={handlePageSelect}
              selectedPage={selectedPage}
              copySettings={copySettings}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Analytics Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Tabs defaultValue="realtime" className="w-full" onValueChange={(tab) => {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('refreshFacebookData'));
          }, 100);
        }}>
          {/* Compact Tab Navigation */}
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-lg blur-sm" />
            <div className="relative bg-card/80 backdrop-blur-md rounded-lg p-1.5 border border-primary/10 shadow-md">
              <TabsList className="w-full bg-transparent gap-1 grid grid-cols-2 lg:grid-cols-4 h-auto">
                {[
                  {
                    value: "realtime",
                    icon: Activity,
                    label: "الوقت الفعلي",
                    gradient: "from-green-500 to-emerald-600"
                  },
                  {
                    value: "analytics", 
                    icon: BarChart3,
                    label: "التحليلات",
                    gradient: "from-blue-500 to-cyan-600"
                  },
                  {
                    value: "enhanced",
                    icon: Brain,
                    label: "التحليل الذكي",
                    gradient: "from-purple-500 to-violet-600"
                  },
                  {
                    value: "info",
                    icon: Database,
                    label: "بيانات الصفحة",
                    gradient: "from-orange-500 to-red-600"
                  }
                ].map((tab, index) => {
                  const IconComponent = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.value}
                      value={tab.value}
                      className="group relative flex flex-col items-center gap-1.5 p-2 rounded-md 
                        bg-gradient-to-br from-background/60 to-muted/20 border border-border/50
                        hover:from-accent/20 hover:to-accent/10 hover:border-accent/30
                        data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                        data-[state=active]:border-primary/50 data-[state=active]:shadow-md
                        transition-all duration-300 hover:scale-[1.02] hover:shadow-sm"
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                      >
                        <div className={`p-1.5 rounded-md bg-gradient-to-br ${tab.gradient} shadow-md 
                          group-data-[state=active]:shadow-lg group-data-[state=active]:scale-105 
                          transition-all duration-300`}>
                          <IconComponent className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full opacity-0 
                          group-data-[state=active]:opacity-100 transition-opacity duration-300">
                          <div className="w-full h-full bg-accent rounded-full animate-ping" />
                        </div>
                      </motion.div>
                      
                      <div className="text-center">
                        <div className="font-medium text-xs leading-tight">
                          {tab.label}
                        </div>
                      </div>
                      
                      {/* Active indicator */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 
                        bg-gradient-to-r from-primary to-secondary rounded-full
                        opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300" />
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
          </div>
          
          {/* Enhanced Tab Content with Animations */}
          <AnimatePresence mode="wait">
            <TabsContent value="realtime" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {selectedPage ? (
                  <div className="relative">
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-green-500 rounded-full animate-pulse opacity-60" />
                    <RealTimeAnalytics selectedPage={selectedPage} />
                  </div>
                ) : (
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                    <CardContent className="p-8 text-center">
                      <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">يرجى اختيار صفحة فيسبوك للمتابعة</p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {selectedPage ? (
                  <div className="relative">
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse opacity-60" />
                    <PageAnalytics selectedPage={selectedPage} />
                  </div>
                ) : (
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                    <CardContent className="p-8 text-center">
                      <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">يرجى اختيار صفحة فيسبوك للمتابعة</p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>
            
            <TabsContent value="enhanced" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {selectedPage ? (
                  <div className="space-y-4">
                    <Card className="bg-gradient-to-br from-purple-500/5 via-violet-500/5 to-purple-600/5 border-purple-500/20 shadow-lg">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg">
                            <Brain className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">المحلل الذكي المتقدم</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant="secondary" 
                                className="bg-gradient-to-r from-purple-500/10 to-violet-600/10 text-purple-600 border-purple-500/20"
                              >
                                <Sparkles className="w-3 h-3 mr-1" />
                                ذكاء اصطناعي
                              </Badge>
                              <Badge 
                                variant="secondary" 
                                className="bg-gradient-to-r from-green-500/10 to-green-600/10 text-green-600 border-green-500/20"
                              >
                                جاهز للاستخدام
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="relative">
                          <div className="absolute -top-2 -left-2 w-4 h-4 bg-purple-500 rounded-full animate-pulse opacity-60" />
                          <EnhancedAnalyzer selectedPage={selectedPage} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                    <CardContent className="p-8 text-center">
                      <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">يرجى اختيار صفحة فيسبوك للمتابعة</p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>
            
            <TabsContent value="info" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {selectedPage ? (
                  <div className="relative">
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-orange-500 rounded-full animate-pulse opacity-60" />
                    <PageInfo selectedPage={selectedPage} />
                  </div>
                ) : (
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                    <CardContent className="p-8 text-center">
                      <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">يرجى اختيار صفحة فيسبوك للمتابعة</p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  );
};