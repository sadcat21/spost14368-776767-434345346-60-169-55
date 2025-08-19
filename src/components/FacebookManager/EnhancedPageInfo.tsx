import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Info, 
  RefreshCw, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Camera, 
  AlertTriangle, 
  MessageCircle, 
  Calendar, 
  Link, 
  Shield, 
  FileText,
  Heart,
  Users,
  TrendingUp,
  Star,
  Activity,
  Eye,
  Share2
} from "lucide-react";
import { toast } from "sonner";
import { formatShortDateInArabic } from "@/utils/dateUtils";

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
}

interface PageData {
  name: string;
  about?: string;
  description?: string;
  phone?: string;
  whatsapp_number?: string;
  website?: string;
  emails?: string[];
  location?: {
    city?: string;
    country?: string;
    street?: string;
  };
  picture?: {
    data: {
      url: string;
    };
  };
  cover?: {
    source: string;
  };
  category: string;
  fan_count?: number;
  followers_count?: number;
  id: string;
  link?: string;
  username?: string;
  verification_status?: string;
  posts?: {
    data: Array<{
      id: string;
      message?: string;
      created_time: string;
      story?: string;
      likes?: { summary?: { total_count: number } };
      comments?: { summary?: { total_count: number } };
      shares?: { count: number };
    }>;
  };
}

interface PageInfoProps {
  selectedPage: FacebookPage;
}

const EnhancedPageInfo = ({ selectedPage }: PageInfoProps) => {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchPageInfo = async () => {
    if (!selectedPage?.access_token) {
      toast.error("رمز الوصول مفقود");
      return;
    }

    setIsLoading(true);
    try {
      const fields = [
        'id', 'name', 'about', 'description', 'phone', 'whatsapp_number',
        'website', 'emails', 'location', 'picture', 'cover', 'category',
        'fan_count', 'followers_count', 'link', 'username', 'verification_status'
      ].join(',');

      const pageResponse = await fetch(
        `https://graph.facebook.com/v18.0/${selectedPage.id}?fields=${fields}&access_token=${selectedPage.access_token}`
      );

      if (!pageResponse.ok) {
        throw new Error(`خطأ في API: ${pageResponse.status}`);
      }

      const pageInfo = await pageResponse.json();

      const postsResponse = await fetch(
        `https://graph.facebook.com/v18.0/${selectedPage.id}/posts?fields=id,message,created_time,story,likes.summary(true),comments.summary(true),shares&limit=10&access_token=${selectedPage.access_token}`
      );

      let posts = null;
      if (postsResponse.ok) {
        posts = await postsResponse.json();
      }

      setPageData({
        ...pageInfo,
        posts: posts
      });

      toast.success("تم تحديث بيانات الصفحة بنجاح");
    } catch (error) {
      console.error('خطأ في جلب بيانات الصفحة:', error);
      toast.error("فشل في جلب بيانات الصفحة");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPage) {
      fetchPageInfo();
    }
  }, [selectedPage]);

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: Info },
    { id: 'posts', label: 'المنشورات', icon: MessageCircle },
    { id: 'analytics', label: 'الإحصائيات', icon: TrendingUp },
  ];

  const renderTabContent = () => {
    if (!pageData) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Page Header */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/5 border border-primary/20">
              {pageData.cover?.source && (
                <div className="absolute inset-0 opacity-20">
                  <img 
                    src={pageData.cover.source} 
                    alt="Page Cover" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="relative p-6">
                <div className="flex items-start gap-4">
                  {pageData.picture?.data?.url && (
                    <div className="relative">
                      <img 
                        src={pageData.picture.data.url} 
                        alt={pageData.name}
                        className="w-20 h-20 rounded-full border-4 border-primary/20 shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full border-2 border-background flex items-center justify-center">
                        {pageData.verification_status === 'verified' ? (
                          <Shield className="w-3 h-3 text-accent-foreground" />
                        ) : (
                          <Star className="w-3 h-3 text-accent-foreground" />
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold text-foreground">{pageData.name}</h2>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {pageData.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {pageData.fan_count?.toLocaleString() || 0} متابع
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">نشط</span>
                      </div>
                    </div>
                    
                    {pageData.about && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {pageData.about}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Phone className="w-5 h-5 text-primary" />
                    معلومات الاتصال
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pageData.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{pageData.phone}</span>
                    </div>
                  )}
                  {pageData.whatsapp_number && (
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{pageData.whatsapp_number}</span>
                    </div>
                  )}
                  {pageData.emails && pageData.emails.length > 0 && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{pageData.emails[0]}</span>
                    </div>
                  )}
                  {pageData.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={pageData.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {pageData.website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                    الموقع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pageData.location ? (
                    <div className="space-y-2">
                      {pageData.location.city && (
                        <p className="text-sm"><span className="font-medium">المدينة:</span> {pageData.location.city}</p>
                      )}
                      {pageData.location.country && (
                        <p className="text-sm"><span className="font-medium">البلد:</span> {pageData.location.country}</p>
                      )}
                      {pageData.location.street && (
                        <p className="text-sm"><span className="font-medium">الشارع:</span> {pageData.location.street}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">لا توجد معلومات موقع متاحة</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );

      case 'posts':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {pageData.posts?.data?.length ? (
              <div className="grid gap-4">
                {pageData.posts.data.slice(0, 5).map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/20 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-primary" />
                            <span className="text-xs text-muted-foreground">
                              {formatShortDateInArabic(post.created_time)}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            منشور
                          </Badge>
                        </div>
                        
                        {post.message && (
                          <p className="text-sm mb-3 leading-relaxed">
                            {post.message.length > 200 
                              ? `${post.message.substring(0, 200)}...` 
                              : post.message
                            }
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{post.likes?.summary?.total_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{post.comments?.summary?.total_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="w-3 h-3" />
                            <span>{post.shares?.count || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد منشورات متاحة</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        );

      case 'analytics':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-foreground">
                    {pageData.fan_count?.toLocaleString() || 0}
                  </h3>
                  <p className="text-sm text-muted-foreground">إجمالي المتابعين</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                <CardContent className="p-6 text-center">
                  <MessageCircle className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-foreground">
                    {pageData.posts?.data?.length || 0}
                  </h3>
                  <p className="text-sm text-muted-foreground">المنشورات الأخيرة</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardContent className="p-6 text-center">
                  <Activity className="w-8 h-8 text-accent mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-foreground">نشط</h3>
                  <p className="text-sm text-muted-foreground">حالة الصفحة</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (!selectedPage) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">يرجى اختيار صفحة فيسبوك أولاً</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Info className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">بيانات الصفحة</h2>
            <p className="text-sm text-muted-foreground">معلومات شاملة عن الصفحة</p>
          </div>
        </motion.div>

        <Button
          onClick={fetchPageInfo}
          disabled={isLoading}
          size="sm"
          className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          تحديث
        </Button>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {renderTabContent()}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedPageInfo;