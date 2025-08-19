import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GmailDetailsTab } from "@/components/GmailDetailsTab";
import { GmailAuthManager } from "@/components/GmailAuthManager";
import { toast } from "sonner";

const GmailDetailsPage = () => {
  const navigate = useNavigate();
  const [gmailData, setGmailData] = useState<any>(null);

  useEffect(() => {
    // Check for existing Gmail authentication
    const token = localStorage.getItem('gmail_access_token');
    const email = localStorage.getItem('gmail_user_email');
    
    if (token && email) {
      setGmailData({
        isAuthenticated: true,
        email: email,
        stats: {
          total: parseInt(localStorage.getItem('gmail_total') || '0'),
          unread: parseInt(localStorage.getItem('gmail_unread') || '0'),
          sent: parseInt(localStorage.getItem('gmail_sent') || '0')
        }
      });
    }
  }, []);

  const handleAuthChange = (data: any) => {
    setGmailData(data);
    if (data.isAuthenticated) {
      // Store stats in localStorage for persistence
      localStorage.setItem('gmail_total', data.stats.total.toString());
      localStorage.setItem('gmail_unread', data.stats.unread.toString());
      localStorage.setItem('gmail_sent', data.stats.sent.toString());
    } else {
      // Clear stored data
      localStorage.removeItem('gmail_total');
      localStorage.removeItem('gmail_unread');
      localStorage.removeItem('gmail_sent');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>العودة</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Mail className="h-6 w-6 text-red-500" />
                <h1 className="text-2xl font-bold">تفاصيل Gmail</h1>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!gmailData?.isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <GmailAuthManager onAuthSuccess={handleAuthChange} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GmailDetailsTab 
              gmailData={gmailData} 
              onAuthChange={handleAuthChange} 
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GmailDetailsPage;