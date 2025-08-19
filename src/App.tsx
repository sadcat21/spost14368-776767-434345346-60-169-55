import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GeneratedContentProvider } from "@/contexts/GeneratedContentContext";
import { FacebookProvider } from "@/contexts/FacebookContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DesignControlsPage from "./pages/DesignControlsPage";
import TextControlsPage from "./pages/TextControlsPage";
import OverlayControlsPage from "./pages/OverlayControlsPage";
import BackgroundControlsPage from "./pages/BackgroundControlsPage";
import AIFeaturesPage from "./pages/AIFeaturesPage";
import SmartContentControlsPage from "./pages/SmartContentControlsPage";
import ManagementPanelPage from "./pages/ManagementPanelPage";
import ArchitecturePage from "./pages/ArchitecturePage";
import GmailDetailsPage from "./pages/GmailDetailsPage";
import GmailCallbackPage from "./pages/GmailCallbackPage";
import GmailOAuthCallbackPage from "./pages/GmailOAuthCallbackPage";
import WebhookPage from "./pages/WebhookPage";
import WebhookSetupPage from "./pages/WebhookSetupPage";
import EventsPage from "./pages/EventsPage";
import GeminiImagePage from "./pages/GeminiImagePage";
import GeminiContentPage from "./pages/GeminiContentPage";
import AIToolsPage from "./pages/AIToolsPage";
import BatchImageGenerationPage from "./pages/BatchImageGenerationPage";
import AutomatedPublishingPage from "./pages/AutomatedPublishingPage";
import AutomatedImagePublishingPage from "./pages/AutomatedImagePublishingPage";
import FacebookManagementPage from "./pages/FacebookManagementPage";
import FacebookOAuthCallbackPage from "./pages/FacebookOAuthCallbackPage";
import SPostPage from "./pages/SPostPage";
import AuthPage from "./pages/AuthPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <FacebookProvider>
        <GeneratedContentProvider>
          <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/design-controls" element={<DesignControlsPage />} />
            <Route path="/text-controls" element={<TextControlsPage />} />
            <Route path="/overlay-controls" element={<OverlayControlsPage />} />
            <Route path="/background-controls" element={<BackgroundControlsPage />} />
            <Route path="/ai-features" element={<AIFeaturesPage />} />
            <Route path="/smart-content-controls" element={<SmartContentControlsPage />} />
            <Route path="/management-panel" element={<ManagementPanelPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/gmail-details" element={<GmailDetailsPage />} />
            <Route path="/gmail-callback" element={<GmailOAuthCallbackPage />} />
            <Route path="/webhook" element={<WebhookPage />} />
            <Route path="/webhook-setup" element={<WebhookSetupPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/gemini-image" element={<GeminiImagePage />} />
            <Route path="/gemini-content" element={<GeminiContentPage />} />
            <Route path="/ai-tools" element={<AIToolsPage />} />
            <Route path="/batch-generation" element={<BatchImageGenerationPage />} />
            <Route path="/automated-publishing" element={<AutomatedPublishingPage />} />
            <Route path="/automated-image-publishing" element={<AutomatedImagePublishingPage />} />
            <Route path="/facebook-management" element={<FacebookManagementPage />} />
            <Route path="/facebook-oauth-callback" element={<FacebookOAuthCallbackPage />} />
            <Route path="/spost" element={<SPostPage />} />
            <Route path="/auth" element={<AuthPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
          </TooltipProvider>
        </GeneratedContentProvider>
      </FacebookProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
