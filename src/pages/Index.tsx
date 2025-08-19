import { LivePreviewProvider } from "@/contexts/LivePreviewContext";
import { FacebookProvider } from "@/contexts/FacebookContext";
import AppContent from "@/components/AppContent";
import AuthGuard from "@/components/AuthGuard";

const Index = () => {
  return (
    <FacebookProvider>
      <AuthGuard>
        <LivePreviewProvider>
          <AppContent />
        </LivePreviewProvider>
      </AuthGuard>
    </FacebookProvider>
  );
};

export default Index;