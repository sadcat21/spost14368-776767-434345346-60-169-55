import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AIDashboard from "@/components/AIDashboard";
import AIHeader from "@/components/AIHeader";
import AISidebar from "@/components/AISidebar";
import AIAnalytics from "@/components/AIAnalytics";
import NeuralBackground from "@/components/NeuralBackground";
import { ContentGenerator } from "@/components/ContentGenerator";
import { EnhancedAutomationEngine } from "@/components/EnhancedAutomationEngine";
import { FacebookContent } from "@/components/FacebookContent";
import { FacebookInteraction } from "@/components/FacebookInteraction";
import { FacebookAnalytics } from "@/components/FacebookAnalytics";
import { FacebookSettings } from "@/components/FacebookSettings";
import { WebhookDashboard } from "@/components/WebhookDashboard";
import { ContentPreview } from "@/components/ContentPreview";
import { LogoSettings } from "@/components/LogoCustomizer";
import { GlobalContentCanvas } from "@/components/GlobalContentCanvas";
import { NewGeminiContentEngine } from "@/components/NewGeminiContentEngine";
import { SimpleGeminiContentEngine } from "@/components/SimpleGeminiContentEngine";
import { GeminiQuickContentEngine } from "@/components/GeminiQuickContentEngine";
import { AutomatedFacebookPublisher } from "@/components/AutomatedFacebookPublisher";

import { Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import all pages
import SmartContentPage from "@/pages/SmartContentPage";
import ContentCreationPage from "@/pages/ContentCreationPage";
import ManagementPage from "@/pages/ManagementPage";
import VideoPage from "@/pages/VideoPage";
import PublishingPage from "@/pages/PublishingPage";
import TreesPage from "@/pages/TreesPage";
import DesignControlsPage from "@/pages/DesignControlsPage";
import TextControlsPage from "@/pages/TextControlsPage";
import OverlayControlsPage from "@/pages/OverlayControlsPage";
import BackgroundControlsPage from "@/pages/BackgroundControlsPage";
import AIFeaturesPage from "@/pages/AIFeaturesPage";
import SmartContentControlsPage from "@/pages/SmartContentControlsPage";
import ManagementPanelPage from "@/pages/ManagementPanelPage";
import ContentInfoTab from "@/components/ContentInfoTab";
import ContentElementsCopyButtons from "@/components/ContentElementsCopyButtons";
import ContentCreationElementsCopy from "@/components/ContentCreationElementsCopy";
import AIDashboardElementsCopy from "@/components/AIDashboardElementsCopy";
import ComponentsInfoTab from "@/components/ComponentsInfoTab";
import AutomationComponentsTab from "@/components/AutomationComponentsTab";
import GeminiVisionIntegrationPage from "@/pages/GeminiVisionIntegrationPage";
import AnalyzerPage from "@/pages/AnalyzerPage";
import ArchitecturePage from "@/pages/ArchitecturePage";
import FacebookSetupPage from "@/pages/FacebookSetupPage";
import GeminiContentPage from "@/pages/GeminiContentPage";
import { SidebarLogoManager } from "@/components/SidebarLogoManager";
import FacebookDashboard from "@/components/FacebookDashboard";

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

interface CopySettings {
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
}

const AppContent = () => {
  const navigate = useNavigate();
  const [selectedPage, setSelectedPage] = useState("dashboard");
  const [logoSettings, setLogoSettings] = useState<LogoSettings | undefined>(undefined);
  
  // إعدادات مرشح النسخ
  const [copySettings, setCopySettings] = useState<CopySettings>({
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
  });

  const [showOldInterface, setShowOldInterface] = useState(false);
  const [connectedFacebookPage, setConnectedFacebookPage] = useState<FacebookPage | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const savedAccessToken = localStorage.getItem("facebook_access_token");
    if (savedAccessToken) {
      setAccessToken(savedAccessToken);
    }

    // Event handlers setup
    const handleNavigateToFacebook = () => setSelectedPage("facebook-content");
    const handleNavigateToFacebookAnalytics = () => setSelectedPage("facebook-analytics");
    const handleNavigateToContentInfo = () => setSelectedPage("content-info");
    const handleNavigateToContent = () => setSelectedPage("content");
    const handleNavigateToAnalyzer = () => setSelectedPage("analyzer-tab");
    const handleNavigateToGeminiVision = () => setSelectedPage("gemini-vision-integration");
    const handleNavigateToAutomation = () => setSelectedPage("gemini-quick-content");
    const handleNavigateToGmailDetails = () => navigate("/gmail-details");
    const handleNavigateToRoute = (event: Event) => {
      const custom = event as CustomEvent<{ route: string }>;
      if (custom.detail?.route) {
        navigate(custom.detail.route);
      }
    };

    window.addEventListener('navigateToFacebook', handleNavigateToFacebook);
    window.addEventListener('navigateToFacebookAnalytics', handleNavigateToFacebookAnalytics);
    window.addEventListener('navigateToContentInfo', handleNavigateToContentInfo);
    window.addEventListener('navigateToContent', handleNavigateToContent);
    window.addEventListener('navigateToAnalyzer', handleNavigateToAnalyzer);
    window.addEventListener('navigateToGeminiVision', handleNavigateToGeminiVision);
    window.addEventListener('navigateToAutomation', handleNavigateToAutomation);
    window.addEventListener('navigateToGmailDetails', handleNavigateToGmailDetails);
    window.addEventListener('navigateToRoute', handleNavigateToRoute);
    
    return () => {
      window.removeEventListener('navigateToFacebook', handleNavigateToFacebook);
      window.removeEventListener('navigateToFacebookAnalytics', handleNavigateToFacebookAnalytics);
      window.removeEventListener('navigateToContentInfo', handleNavigateToContentInfo);
      window.removeEventListener('navigateToContent', handleNavigateToContent);
      window.removeEventListener('navigateToAnalyzer', handleNavigateToAnalyzer);
      window.removeEventListener('navigateToGeminiVision', handleNavigateToGeminiVision);
      window.removeEventListener('navigateToAutomation', handleNavigateToAutomation);
      window.removeEventListener('navigateToGmailDetails', handleNavigateToGmailDetails);
      window.removeEventListener('navigateToRoute', handleNavigateToRoute);
    };
  }, [navigate]);

  useEffect(() => {
    console.log("📄 Page view: / (Index)");
    window.dispatchEvent(new CustomEvent('page:view', { detail: { path: '/', ts: Date.now() } }));
  }, []);

  if (showOldInterface) {
    return (
      <div className="min-h-screen bg-background">
        <ContentGenerator />
      </div>
    );
  }

  const renderContent = () => {
    switch (selectedPage) {
      case "management":
        return <ManagementPage copySettings={copySettings} />;
      case "video":
        return <VideoPage />;
      case "publishing":
        return <PublishingPage />;
      case "trees":
        return <TreesPage />;
      case "content":
        return <ContentGenerator />;
      case "smart-content":
        return <SmartContentPage />;
      case "design-controls":
        return <DesignControlsPage copySettings={copySettings} />;
      case "text-controls":
        return <TextControlsPage copySettings={copySettings} />;
      case "overlay-controls":
        return <OverlayControlsPage copySettings={copySettings} />;
      case "background-controls":
        return <BackgroundControlsPage copySettings={copySettings} />;
      case "ai-features":
        return <AIFeaturesPage copySettings={copySettings} />;
      case "smart-content-controls":
        return <SmartContentControlsPage copySettings={copySettings} />;
      case "management-panel":
        return <ManagementPanelPage copySettings={copySettings} />;
      case "facebook-content":
        return <FacebookContent copySettings={copySettings} />;
      case "facebook-interaction":
        return <FacebookInteraction copySettings={copySettings} />;
      case "facebook-analytics":
        return <FacebookAnalytics copySettings={copySettings} />;
      case "facebook-settings":
        return <FacebookSettings copySettings={copySettings} />;
      case "webhook-settings":
        navigate("/webhook");
        return <div className="p-6"><h2 className="text-2xl font-bold">جارِ توجيهك إلى إعدادات الويب هوك...</h2></div>;
      case "webhook-dashboard":
        return <WebhookDashboard />;
      case "analytics":
        return <AIAnalytics selectedPage={connectedFacebookPage} />;
      case "content-info":
        return <ContentInfoTab />;
      case "copy-elements":
        return <ContentElementsCopyButtons />;
      case "content-creation-copy":
        return <ContentCreationElementsCopy />;
      case "ai-dashboard-copy":
        return <AIDashboardElementsCopy />;
      case "gemini-vision-integration":
        return <GeminiVisionIntegrationPage />;
      case "analyzer-tab":
        return <AnalyzerPage />;
      case "logo-tab":
        return <SidebarLogoManager />;
      case "live-preview":
        return (
          <div className="p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold">المعاينة المباشرة</h2>
              <p className="text-muted-foreground">معاينة التغييرات في الوقت الفعلي</p>
            </div>
            {copySettings.livePreview && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ContentPreview 
                    title="معاينة المحتوى المباشرة"
                    className="w-full"
                    compact={false}
                    showDeviceToggle={false}
                    autoRefresh={true}
                  />
                  <ContentPreview 
                    title="نموذج المحتوى"
                    className="w-full"
                    compact={false}
                    showDeviceToggle={false}
                    autoRefresh={false}
                  />
                </div>
              </div>
            )}
          </div>
        );
      case "architecture":
        return <ArchitecturePage />;
      case "components-info":
        return <ComponentsInfoTab />;
      case "automation-components":
        return <AutomationComponentsTab />;
      case "facebook-setup":
        return <FacebookSetupPage />;
      case "gemini-content":
        return <GeminiContentPage />;
      case "automation":
        return (
          <div className="p-6 space-y-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  الأوتوميشن الذكي
                </h2>
                <p className="text-muted-foreground text-lg mt-2">
                  توليد المحتوى والصور تلقائياً بواسطة الذكاء الاصطناعي مع عرض النتائج التفاعلية
                </p>
              </div>
              <button
                onClick={() => setSelectedPage("automation-components")}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all duration-300 flex items-center gap-2 shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                معلومات المكونات
              </button>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  🚀 محرك جينيوس الإبداعي
                </h3>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">الأحدث</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">المحرك الأكثر تطوراً لتوليد المحتوى الإبداعي بتقنيات الذكاء الاصطناعي المتقدمة</p>
              <EnhancedAutomationEngine className="w-full max-w-4xl" />
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ✨ نظام توليد المحتوى السريع - Gemini
                </h3>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">جديد</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">نظام متطور لتوليد المحتوى والصور باستخدام تقنيات Gemini الحديثة مع الأتمتة الذكية</p>
              <div className="flex justify-center">
                <Button
                  onClick={() => setSelectedPage("gemini-full")}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  size="lg"
                >
                  <Bot className="h-5 w-5" />
                  <Sparkles className="h-4 w-4" />
                  🎨 نظام توليد المحتوى السريع - Gemini
                </Button>
              </div>
            </div>
          </div>
        );
      case "gemini-quick-content":
        return (
          <div className="p-6 space-y-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  🎨 نظام توليد المحتوى السريع - Gemini
                </h2>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">جديد</span>
              </div>
              <p className="text-muted-foreground text-lg">
                نظام متطور لتوليد المحتوى والصور باستخدام تقنيات Gemini الحديثة
              </p>
            </div>
            
            {/* إضافة زر للتبديل بين النسختين */}
            <div className="flex gap-2 mb-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedPage("gemini-simple")}
              >
                النسخة المبسطة (للاختبار)
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/gemini-image")}
              >
                🎨 مولد الصور الذكي
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/batch-generation")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600"
              >
                ⚡ التوليد المتعدد - دفعة واحدة
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedPage("automated-publishing")}
                className="bg-gradient-to-r from-blue-600 to-green-500 text-white border-none hover:from-blue-700 hover:to-green-600"
              >
                🚀 أتمتة النشر على فيسبوك
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/automated-image-publishing")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600"
              >
                🎨 تعديل الصور والنشر
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/facebook-management")}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none hover:from-blue-600 hover:to-purple-600"
              >
                📱 إدارة فيسبوك الشاملة
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedPage("gemini-full")}
              >
                النسخة الكاملة
              </Button>
            </div>
            
            <GeminiQuickContentEngine />
          </div>
        );
      case "gemini-simple":
        return (
          <div className="p-6 space-y-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-500">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  🧪 نسخة الاختبار البسيطة
                </h2>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">اختبار</span>
              </div>
              <p className="text-muted-foreground text-lg">
                نسخة مبسطة للتأكد من عمل جميع المكونات
              </p>
            </div>
            
            <div className="flex gap-2 mb-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedPage("gemini-quick-content")}
              >
                العودة للنسخة الكاملة
              </Button>
            </div>
            
            <SimpleGeminiContentEngine />
          </div>
        );
      case "gemini-full":
        return (
          <div className="p-6 space-y-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  🎨 النسخة الكاملة - نظام Gemini المتقدم
                </h2>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">متقدم</span>
              </div>
              <p className="text-muted-foreground text-lg">
                النظام الكامل مع جميع الميزات المتقدمة
              </p>
            </div>
            
            <div className="flex gap-2 mb-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedPage("gemini-quick-content")}
              >
                العودة للصفحة الرئيسية
              </Button>
            </div>
            
            <NewGeminiContentEngine />
          </div>
        );
      case "facebook-dashboard":
        return <FacebookDashboard />;
      case "automated-publishing":
        return (
          <div className="p-6 space-y-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-green-500">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                  🚀 أتمتة النشر على فيسبوك
                </h2>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">جديد</span>
              </div>
              <p className="text-muted-foreground text-lg">
                توليد المحتوى والصور والنشر التلقائي بالذكاء الاصطناعي
              </p>
            </div>
            <AutomatedFacebookPublisher />
          </div>
        );
      case "dashboard":
      default:
        return <AIDashboard accessToken={accessToken} copySettings={copySettings} />;
    }
  };

  return (
    <div className="min-h-screen bg-background bg-neural-pattern relative">
      <NeuralBackground />
      <div className="relative z-10">
        <AIHeader 
          copySettings={copySettings}
          onCopySettingsChange={setCopySettings}
          onLogoClick={() => setSelectedPage("dashboard")}
        />
        <div className="flex">
          <AISidebar 
            selectedPage={selectedPage} 
            onPageChange={setSelectedPage}
            copySettings={copySettings}
          />
          <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)]">
            {renderContent()}
          </main>
        </div>
        
        {/* ContentCanvas عالمي مخفي للمعاينة المباشرة */}
        <GlobalContentCanvas logoSettings={logoSettings} />
      </div>
    </div>
  );
};

export default AppContent;