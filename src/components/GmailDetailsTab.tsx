import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  User, 
  Calendar, 
  Settings, 
  BarChart3, 
  MessageSquare, 
  Archive,
  Star,
  Send,
  Inbox,
  Clock,
  Globe,
  Shield,
  RefreshCw,
  LogOut
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface GmailDetailsTabProps {
  gmailData: any;
  onAuthChange: (data: any) => void;
}

export const GmailDetailsTab = ({ gmailData, onAuthChange }: GmailDetailsTabProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [additionalStats, setAdditionalStats] = useState({
    storageUsed: 0,
    storageTotal: 15, // GB
    todayEmails: 0,
    weeklyAverage: 0
  });

  useEffect(() => {
    // محاكاة بيانات إضافية
    setAdditionalStats({
      storageUsed: Math.floor(Math.random() * 10) + 2,
      storageTotal: 15,
      todayEmails: Math.floor(Math.random() * 20) + 5,
      weeklyAverage: Math.floor(Math.random() * 50) + 20
    });
  }, [gmailData]);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem('gmail_access_token');
      if (token) {
        // محاكاة تحديث البيانات
        setTimeout(() => {
          setAdditionalStats(prev => ({
            ...prev,
            todayEmails: Math.floor(Math.random() * 20) + 5,
            weeklyAverage: Math.floor(Math.random() * 50) + 20
          }));
          setIsRefreshing(false);
          toast.success("تم تحديث البيانات بنجاح");
        }, 2000);
      }
    } catch (error) {
      setIsRefreshing(false);
      toast.error("فشل في تحديث البيانات");
    }
  };

  const signOut = () => {
    localStorage.removeItem('gmail_access_token');
    localStorage.removeItem('gmail_user_email');
    onAuthChange({
      isAuthenticated: false,
      email: null,
      stats: { total: 0, unread: 0, sent: 0 }
    });
    toast.success("تم تسجيل الخروج بنجاح");
  };

  if (!gmailData?.isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Mail className="h-16 w-16 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-muted-foreground">
          لم يتم تسجيل الدخول إلى Gmail
        </h3>
        <p className="text-sm text-muted-foreground text-center">
          يرجى تسجيل الدخول أولاً لعرض تفاصيل Gmail
        </p>
      </div>
    );
  }

  const storagePercentage = (additionalStats.storageUsed / additionalStats.storageTotal) * 100;

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(gmailData.email)}&background=dc2626&color=fff`}
              alt="Gmail Profile" 
            />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{gmailData.email}</h2>
            <Badge variant="outline" className="mt-1">
              <Mail className="h-3 w-3 mr-1" />
              متصل
            </Badge>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-1" />
            خروج
          </Button>
        </div>
      </motion.div>

      <Separator />

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الرسائل</CardTitle>
              <Inbox className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {gmailData.stats.total.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                جميع الرسائل المحفوظة
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">غير مقروءة</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {gmailData.stats.unread.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                تحتاج للمراجعة
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مرسلة</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {gmailData.stats.sent.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                الرسائل المرسلة
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">اليوم</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {additionalStats.todayEmails}
              </div>
              <p className="text-xs text-muted-foreground">
                رسائل اليوم
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Storage and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Archive className="h-5 w-5" />
                <span>مساحة التخزين</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>المستخدم</span>
                  <span>{additionalStats.storageUsed} GB من {additionalStats.storageTotal} GB</span>
                </div>
                <Progress value={storagePercentage} className="h-2" />
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>رسائل البريد:</span>
                  <span>{(additionalStats.storageUsed * 0.7).toFixed(1)} GB</span>
                </div>
                <div className="flex justify-between">
                  <span>المرفقات:</span>
                  <span>{(additionalStats.storageUsed * 0.2).toFixed(1)} GB</span>
                </div>
                <div className="flex justify-between">
                  <span>أخرى:</span>
                  <span>{(additionalStats.storageUsed * 0.1).toFixed(1)} GB</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>تحليلات الاستخدام</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">متوسط أسبوعي</span>
                  <Badge variant="secondary">
                    {additionalStats.weeklyAverage} رسالة
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">معدل القراءة</span>
                  <Badge variant="outline">
                    {Math.round((1 - gmailData.stats.unread / gmailData.stats.total) * 100)}%
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">نشاط الإرسال</span>
                  <Badge variant="outline">
                    {Math.round((gmailData.stats.sent / gmailData.stats.total) * 100)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Account Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>معلومات الحساب</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">البريد الإلكتروني:</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  {gmailData.email}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">حالة الأمان:</span>
                </div>
                <Badge variant="outline" className="ml-6">
                  <Shield className="h-3 w-3 mr-1" />
                  آمن
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">الخدمة:</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  Gmail API v1
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};