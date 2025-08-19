
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Facebook, MessageSquare, MessageCircle, Send, Key, BarChart3, Clock, Info, Sparkles, Brain, Shield, Webhook } from "lucide-react";
import { toast } from "sonner";
import { useFacebook } from "@/contexts/FacebookContext";
import { DirectPublisher } from "./FacebookManager/DirectPublisher";
import { CommentManager } from "./FacebookManager/CommentManager";
import { MessengerManager } from "./FacebookManager/MessengerManager";
import { TokenManager } from "./FacebookManager/TokenManager";
import { PageAnalytics } from "./FacebookManager/PageAnalytics";
import { ScheduledPostsManager } from "./FacebookManager/ScheduledPostsManager";
import { TokenValidator } from "./FacebookManager/TokenValidator";
import { PageInfo } from "./FacebookManager/PageInfo";
import { Features } from "./FacebookManager/Features";
import { EnhancedPageSelector } from "./FacebookManager/EnhancedPageSelector";
import { EnhancedAnalyzer } from "./FacebookManager/EnhancedAnalyzer";
import { AuthenticationManager } from "./FacebookManager/AuthenticationManager";
import { RealTimeAnalytics } from "./FacebookManager/RealTimeAnalytics";
import { MultiPagePermissionsManager } from "./FacebookManager/MultiPagePermissionsManager";
import { AutoWebhookSetup } from "./FacebookManager/AutoWebhookSetup";
import { WebhookTester } from "./FacebookManager/WebhookTester";

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

interface FacebookManagerProps {
  generatedContent?: {
    longText: string;
    shortText: string;
    imageUrl: string;
    imageAlt?: string;
    originalImageUrl?: string;
    uploadedImageUrl?: string;
  } | null;
  isCompactView?: boolean;
  isPreviewVisible?: boolean;
}

export const FacebookManager = ({ generatedContent, isCompactView = false, isPreviewVisible = false }: FacebookManagerProps) => {
  // Use Facebook context instead of local state
  const {
    isConnected,
    pages,
    selectedPage,
    userAccessToken,
    userInfo,
    handleAuthSuccess,
    disconnectFromFacebook,
    handlePageSelect,
    initializeFromStorage
  } = useFacebook();

  // Initialize from storage on mount
  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  if (!isConnected) {
    return (
      <AuthenticationManager
        onAuthSuccess={handleAuthSuccess}
        onDisconnect={disconnectFromFacebook}
        isConnected={isConnected}
        currentToken={userAccessToken}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Page Selector */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Facebook className="h-5 w-5" />
              إدارة فيسبوك
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
          <EnhancedPageSelector
            accessToken={userAccessToken}
            onPageSelect={handlePageSelect}
            selectedPage={selectedPage}
            isCompactView={isCompactView}
          />
        </CardContent>
      </Card>

      {/* Enhanced Management Tabs */}
      <Tabs defaultValue="features" className="w-full" onValueChange={(tab) => {
        // تحديث الأقسام عند الانتقال بين التبويبات
        if (tab === 'comments' || tab === 'analytics' || tab === 'enhanced-analyzer') {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('refreshFacebookData'));
          }, 100);
        }
      }}>
        <div className={`bg-card/50 backdrop-blur-sm rounded-lg p-1 ${isCompactView ? 'mb-2' : 'mb-4'}`}>
          <TabsList className={`
            w-full bg-transparent gap-1
            ${isCompactView 
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10' 
              : 'flex flex-wrap justify-center'
            }
          `}>
            <TabsTrigger 
              value="features" 
              className={`
                ${isCompactView ? 'min-w-0 px-2 py-1.5' : 'px-4 py-2'} 
                flex items-center gap-2 bg-background/60 border border-border/50 
                hover:bg-accent/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                transition-all duration-200 hover:scale-105
              `}
            >
              <Sparkles className={`${isCompactView ? 'h-3 w-3' : 'h-4 w-4'} flex-shrink-0`} />
              <span className={`${isCompactView ? 'text-xs hidden sm:inline' : 'text-sm'} font-medium`}>
                الميزات
              </span>
            </TabsTrigger>

            <TabsTrigger 
              value="info" 
              className={`
                ${isCompactView ? 'min-w-0 px-2 py-1.5' : 'px-4 py-2'} 
                flex items-center gap-2 bg-background/60 border border-border/50 
                hover:bg-accent/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                transition-all duration-200 hover:scale-105
              `}
            >
              <Info className={`${isCompactView ? 'h-3 w-3' : 'h-4 w-4'} flex-shrink-0`} />
              <span className={`${isCompactView ? 'text-xs hidden sm:inline' : 'text-sm'} font-medium`}>
                بيانات الصفحة
              </span>
            </TabsTrigger>

            <TabsTrigger 
              value="publish" 
              className={`
                ${isCompactView ? 'min-w-0 px-2 py-1.5' : 'px-4 py-2'} 
                flex items-center gap-2 bg-background/60 border border-border/50 
                hover:bg-accent/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                transition-all duration-200 hover:scale-105
              `}
            >
              <Send className={`${isCompactView ? 'h-3 w-3' : 'h-4 w-4'} flex-shrink-0`} />
              <span className={`${isCompactView ? 'text-xs hidden sm:inline' : 'text-sm'} font-medium`}>
                النشر
              </span>
            </TabsTrigger>

            <TabsTrigger 
              value="comments" 
              className={`
                ${isCompactView ? 'min-w-0 px-2 py-1.5' : 'px-4 py-2'} 
                flex items-center gap-2 bg-background/60 border border-border/50 
                hover:bg-accent/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                transition-all duration-200 hover:scale-105
              `}
            >
              <MessageSquare className={`${isCompactView ? 'h-3 w-3' : 'h-4 w-4'} flex-shrink-0`} />
              <span className={`${isCompactView ? 'text-xs hidden sm:inline' : 'text-sm'} font-medium`}>
                التعليقات
              </span>
            </TabsTrigger>

            <TabsTrigger 
              value="messages" 
              className={`
                ${isCompactView ? 'min-w-0 px-2 py-1.5' : 'px-4 py-2'} 
                flex items-center gap-2 bg-background/60 border border-border/50 
                hover:bg-accent/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                transition-all duration-200 hover:scale-105
              `}
            >
              <MessageCircle className={`${isCompactView ? 'h-3 w-3' : 'h-4 w-4'} flex-shrink-0`} />
              <span className={`${isCompactView ? 'text-xs hidden sm:inline' : 'text-sm'} font-medium`}>
                الرسائل
              </span>
            </TabsTrigger>

            <TabsTrigger 
              value="analytics" 
              className={`
                ${isCompactView ? 'min-w-0 px-2 py-1.5' : 'px-4 py-2'} 
                flex items-center gap-2 bg-background/60 border border-border/50 
                hover:bg-accent/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                transition-all duration-200 hover:scale-105
              `}
            >
              <BarChart3 className={`${isCompactView ? 'h-3 w-3' : 'h-4 w-4'} flex-shrink-0`} />
              <span className={`${isCompactView ? 'text-xs hidden sm:inline' : 'text-sm'} font-medium`}>
                التحليلات
              </span>
            </TabsTrigger>

            <TabsTrigger 
              value="enhanced-analyzer" 
              className={`
                ${isCompactView ? 'min-w-0 px-2 py-1.5' : 'px-4 py-2'} 
                flex items-center gap-2 bg-background/60 border border-border/50 
                hover:bg-accent/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                transition-all duration-200 hover:scale-105
              `}
            >
              <Brain className={`${isCompactView ? 'h-3 w-3' : 'h-4 w-4'} flex-shrink-0`} />
              <span className={`${isCompactView ? 'text-xs hidden sm:inline' : 'text-sm'} font-medium`}>
                التحليل المتقدم
              </span>
            </TabsTrigger>

            <TabsTrigger 
              value="scheduled" 
              className={`
                ${isCompactView ? 'min-w-0 px-2 py-1.5' : 'px-4 py-2'} 
                flex items-center gap-2 bg-background/60 border border-border/50 
                hover:bg-accent/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                transition-all duration-200 hover:scale-105
              `}
            >
              <Clock className={`${isCompactView ? 'h-3 w-3' : 'h-4 w-4'} flex-shrink-0`} />
              <span className={`${isCompactView ? 'text-xs hidden sm:inline' : 'text-sm'} font-medium`}>
                المجدولة
              </span>
            </TabsTrigger>

            <TabsTrigger 
              value="tokens" 
              className={`
                ${isCompactView ? 'min-w-0 px-2 py-1.5' : 'px-4 py-2'} 
                flex items-center gap-2 bg-background/60 border border-border/50 
                hover:bg-accent/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                transition-all duration-200 hover:scale-105
              `}
            >
              <Key className={`${isCompactView ? 'h-3 w-3' : 'h-4 w-4'} flex-shrink-0`} />
              <span className={`${isCompactView ? 'text-xs hidden sm:inline' : 'text-sm'} font-medium`}>
                التوكنات
              </span>
            </TabsTrigger>

            <TabsTrigger 
              value="permissions" 
              className={`
                ${isCompactView ? 'min-w-0 px-2 py-1.5' : 'px-4 py-2'} 
                flex items-center gap-2 bg-background/60 border border-border/50 
                hover:bg-accent/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                transition-all duration-200 hover:scale-105
              `}
            >
              <Shield className={`${isCompactView ? 'h-3 w-3' : 'h-4 w-4'} flex-shrink-0`} />
              <span className={`${isCompactView ? 'text-xs hidden sm:inline' : 'text-sm'} font-medium`}>
                الصلاحيات
              </span>
            </TabsTrigger>

            <TabsTrigger 
              value="webhooks" 
              className={`
                ${isCompactView ? 'min-w-0 px-2 py-1.5' : 'px-4 py-2'} 
                flex items-center gap-2 bg-background/60 border border-border/50 
                hover:bg-accent/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                transition-all duration-200 hover:scale-105
              `}
            >
              <Webhook className={`${isCompactView ? 'h-3 w-3' : 'h-4 w-4'} flex-shrink-0`} />
              <span className={`${isCompactView ? 'text-xs hidden sm:inline' : 'text-sm'} font-medium`}>
                Webhooks
              </span>
            </TabsTrigger>

            <TabsTrigger 
              value="auth" 
              className={`
                ${isCompactView ? 'min-w-0 px-2 py-1.5' : 'px-4 py-2'} 
                flex items-center gap-2 bg-background/60 border border-border/50 
                hover:bg-accent/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                transition-all duration-200 hover:scale-105
              `}
            >
              <Facebook className={`${isCompactView ? 'h-3 w-3' : 'h-4 w-4'} flex-shrink-0`} />
              <span className={`${isCompactView ? 'text-xs hidden sm:inline' : 'text-sm'} font-medium`}>
                الاتصال
              </span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="auth">
          <AuthenticationManager
            onAuthSuccess={handleAuthSuccess}
            onDisconnect={disconnectFromFacebook}
            isConnected={isConnected}
            currentToken={userAccessToken}
          />
        </TabsContent>
        
        <TabsContent value="features">
          <Features isCompactView={isCompactView} />
        </TabsContent>
        
        <TabsContent value="info">
          {selectedPage && <PageInfo selectedPage={selectedPage} isCompactView={isCompactView} />}
        </TabsContent>
        
        <TabsContent value="publish">
          {selectedPage && (
            <DirectPublisher 
              selectedPage={selectedPage}
              generatedContent={generatedContent}
            />
          )}
        </TabsContent>
        
        <TabsContent value="comments">
          {selectedPage && <CommentManager selectedPage={selectedPage} />}
        </TabsContent>
        
        <TabsContent value="messages">
          {selectedPage && <MessengerManager selectedPage={selectedPage} />}
        </TabsContent>
        
        <TabsContent value="analytics">
          {selectedPage && (
            <div className="space-y-6">
              <RealTimeAnalytics selectedPage={selectedPage} />
              <PageAnalytics selectedPage={selectedPage} />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="enhanced-analyzer">
          {selectedPage && (
            <div className="space-y-4">
              <Card className="shadow-elegant border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Brain className="h-5 w-5" />
                    المحلل الذكي المتقدم
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      جاهز للاستخدام
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EnhancedAnalyzer
                    selectedPage={selectedPage}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="scheduled">
          {selectedPage && <ScheduledPostsManager selectedPage={selectedPage} />}
        </TabsContent>
        
        <TabsContent value="permissions">
          <MultiPagePermissionsManager />
        </TabsContent>
        
        <TabsContent value="webhooks">
          <div className="space-y-6">
            <AutoWebhookSetup />
            <WebhookTester />
          </div>
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
      </Tabs>
    </div>
  );
};
