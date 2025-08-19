import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, LogIn, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GmailAuthManagerProps {
  onAuthSuccess: (emailData: any) => void;
}

export const GmailAuthManager = ({ onAuthSuccess }: GmailAuthManagerProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [emailStats, setEmailStats] = useState({
    total: 0,
    unread: 0,
    sent: 0
  });

  const CLIENT_ID = "692107022359-q3551kdeumtl9lcfme81rq4sqisoc7u8.apps.googleusercontent.com";
  const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

  useEffect(() => {
    // Check for authorization code in URL (OAuth callback)
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        setIsLoading(true);
        try {
          // استخدام Supabase Edge Function لتبديل الكود بـ token
          const { data, error } = await supabase.functions.invoke('google-oauth', {
            body: {
              code: code,
              redirect_uri: `${window.location.origin}/gmail-callback`
            }
          });

          if (error) throw error;

          // حفظ المعلومات
          localStorage.setItem('gmail_access_token', data.access_token);
          localStorage.setItem('gmail_user_email', data.user.email);
          localStorage.setItem('gmail_refresh_token', data.refresh_token || '');
          
          setIsAuthenticated(true);
          setUserEmail(data.user.email);
          
          // جلب بيانات Gmail الحقيقية
          await fetchEmailData(data.access_token);
          
          // تنظيف URL
          window.history.replaceState(null, '', '/gmail-details');
          toast.success("تم تسجيل الدخول بنجاح");
          
        } catch (error) {
          console.error('OAuth callback error:', error);
          toast.error("فشل في معالجة تسجيل الدخول");
          window.history.replaceState(null, '', '/gmail-details');
        } finally {
          setIsLoading(false);
        }
      }
    };

    // Check if user is already authenticated
    const checkAuthStatus = () => {
      const token = localStorage.getItem('gmail_access_token');
      const email = localStorage.getItem('gmail_user_email');
      
      if (token && email) {
        setIsAuthenticated(true);
        setUserEmail(email);
        fetchEmailData(token);
      }
    };

    handleAuthCallback();
    checkAuthStatus();
  }, []);


  const signIn = async () => {
    setIsLoading(true);
    
    try {
      // استخدام authorization code flow مع Supabase Edge Function
      const redirectUri = `${window.location.origin}/gmail-callback`;
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(SCOPES)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;

      // فتح صفحة التصريح في نفس النافذة
      window.location.href = authUrl;

    } catch (error) {
      console.error('Gmail auth error:', error);
      toast.error("فشل في تسجيل الدخول");
      setIsLoading(false);
    }
  };

  const fetchEmailData = async (accessToken: string) => {
    try {
      console.log('Fetching Gmail data with token:', accessToken.substring(0, 10) + '...');
      
      // Fetch user profile with proper error handling
      const profileResponse = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/profile',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('Profile API Error:', profileResponse.status, errorText);
        throw new Error(`Gmail API Error: ${profileResponse.status}`);
      }
      
      const profile = await profileResponse.json();
      console.log('Gmail Profile:', profile);
      
      // Fetch unread messages count
      const unreadResponse = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=1',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      let unreadCount = 0;
      if (unreadResponse.ok) {
        const unreadData = await unreadResponse.json();
        unreadCount = unreadData.resultSizeEstimate || 0;
      }

      // Fetch sent messages count
      const sentResponse = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=in:sent&maxResults=1',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      let sentCount = 0;
      if (sentResponse.ok) {
        const sentData = await sentResponse.json();
        sentCount = sentData.resultSizeEstimate || 0;
      }
      
      // Calculate real stats from API response
      const stats = {
        total: profile.messagesTotal || 0,
        unread: unreadCount,
        sent: sentCount
      };
      
      console.log('Gmail Stats:', stats);
      setEmailStats(stats);
      
      // Pass real data to parent component
      onAuthSuccess({
        email: userEmail,
        profile,
        stats,
        isAuthenticated: true
      });
      
      toast.success("تم جلب بيانات Gmail بنجاح");
      
    } catch (error) {
      console.error('Error fetching Gmail data:', error);
      toast.error(`فشل في جلب بيانات البريد الإلكتروني: ${error.message}`);
      
      // Fallback to dummy data if API fails
      const fallbackStats = {
        total: 0,
        unread: 0,
        sent: 0
      };
      
      setEmailStats(fallbackStats);
      onAuthSuccess({
        email: userEmail,
        profile: null,
        stats: fallbackStats,
        isAuthenticated: true
      });
    }
  };

  const signOut = () => {
    localStorage.removeItem('gmail_access_token');
    localStorage.removeItem('gmail_user_email');
    setIsAuthenticated(false);
    setUserEmail(null);
    setEmailStats({ total: 0, unread: 0, sent: 0 });
    
    onAuthSuccess({
      isAuthenticated: false,
      email: null,
      stats: { total: 0, unread: 0, sent: 0 }
    });
    
    toast.success("تم تسجيل الخروج بنجاح");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Gmail Authentication
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isAuthenticated ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              قم بتسجيل الدخول لعرض بيانات Gmail الحقيقية
            </p>
            <Button 
              onClick={signIn} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  تسجيل الدخول بـ Gmail
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{userEmail}</p>
                <Badge variant="outline" className="text-xs">
                  متصل
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {emailStats.total.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">إجمالي</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">
                  {emailStats.unread.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">غير مقروء</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {emailStats.sent.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">مرسل</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};