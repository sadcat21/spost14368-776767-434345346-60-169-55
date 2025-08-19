import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  Users, 
  BarChart3, 
  MessageSquare, 
  Heart, 
  Share2, 
  Eye,
  RefreshCw,
  Clock,
  ArrowUp,
  ArrowDown,
  Activity,
  Radio
} from "lucide-react";
import { useFacebookData } from "@/hooks/useFacebookData";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { formatShortDateInArabic, convertArabicToEnglishNumbers } from "@/utils/dateUtils";

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

interface RealTimeAnalyticsProps {
  selectedPage: FacebookPage;
}

export const RealTimeAnalytics = ({ selectedPage }: RealTimeAnalyticsProps) => {
  const { insights, posts, unreadMessages, loading, error, refreshData } = useFacebookData(selectedPage);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);
  const [previousData, setPreviousData] = useState<{
    fans: number;
    posts: number;
    engagement: number;
    messages: number;
  }>({ fans: 0, posts: 0, engagement: 0, messages: 0 });

  const [pageImages, setPageImages] = useState<{cover: string | null, profilePicture: string | null}>({
    cover: null,
    profilePicture: null
  });

  const fetchPageCoverAndProfile = async (page: FacebookPage) => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${page.id}?` +
        `fields=cover,picture.type(large)&` +
        `access_token=${page.access_token}`
      );
      const data = await response.json();
      return {
        cover: data.cover?.source || null,
        profilePicture: data.picture?.data?.url || page.picture?.data?.url || null
      };
    } catch (error) {
      console.error('Error fetching page images:', error);
      return { cover: null, profilePicture: null };
    }
  };

  useEffect(() => {
    if (selectedPage) {
      fetchPageCoverAndProfile(selectedPage).then(setPageImages);
    }
  }, [selectedPage]);

  // حفظ البيانات السابقة لمقارنة التغييرات
  useEffect(() => {
    if (insights || posts) {
      const currentData = {
        fans: insights?.page_fans || 0,
        posts: posts?.length || 0,
        engagement: getTotalEngagement(),
        messages: unreadMessages || 0
      };
      
      // حفظ البيانات السابقة فقط إذا كانت مختلفة
      if (JSON.stringify(currentData) !== JSON.stringify(previousData)) {
        setPreviousData(currentData);
      }
    }
  }, [insights, posts, unreadMessages]);

  // Auto-refresh كل 60 ثانية
  useEffect(() => {
    if (!isAutoRefreshEnabled || !selectedPage) return;

    const interval = setInterval(() => {
      refreshData();
      toast.success("تم تحديث البيانات تلقائياً", {
        duration: 2000,
        position: "bottom-right"
      });
    }, 60000); // 60 ثانية

    return () => clearInterval(interval);
  }, [isAutoRefreshEnabled, selectedPage, refreshData]);

  useEffect(() => {
    if (!loading) {
      setLastRefresh(new Date());
    }
  }, [loading]);

  // دالة لحساب التغيير
  const getChangeIndicator = (current: number, previous: number) => {
    if (current > previous) {
      return { icon: ArrowUp, color: "text-green-600", trend: "up" };
    } else if (current < previous) {
      return { icon: ArrowDown, color: "text-red-600", trend: "down" };
    }
    return { icon: Activity, color: "text-muted-foreground", trend: "stable" };
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return "0";
    return convertArabicToEnglishNumbers(num.toLocaleString('en-US'));
  };

  const calculateEngagement = () => {
    if (!posts || posts.length === 0 || !insights?.page_fans) return 0;
    
    const totalEngagement = posts.reduce((sum, post) => {
      const likes = post.likes?.summary.total_count || 0;
      const comments = post.comments?.summary.total_count || 0;
      const shares = post.shares?.count || 0;
      return sum + likes + comments + shares;
    }, 0);

    return ((totalEngagement / insights.page_fans) * 100).toFixed(2);
  };

  const getTopPerformingPost = () => {
    if (!posts || posts.length === 0) return null;
    
    return posts.reduce((best, current) => {
      const currentEngagement = (current.likes?.summary.total_count || 0) +
                               (current.comments?.summary.total_count || 0) +
                               (current.shares?.count || 0);
      const bestEngagement = (best?.likes?.summary.total_count || 0) +
                             (best?.comments?.summary.total_count || 0) +
                             (best?.shares?.count || 0);
      
      return currentEngagement > bestEngagement ? current : best;
    }) || null;
  };

  const getTotalEngagement = () => {
    if (!posts || posts.length === 0) return 0;
    
    return posts.reduce((sum, post) => {
      const likes = post.likes?.summary.total_count || 0;
      const comments = post.comments?.summary.total_count || 0;
      const shares = post.shares?.count || 0;
      return sum + likes + comments + shares;
    }, 0);
  };

  const topPost = getTopPerformingPost();

  return (
    <div className="space-y-6">
      {/* Header with Page Cover */}
      <div className="relative overflow-hidden rounded-xl mb-6">
        {/* صورة الغلاف كخلفية */}
        {pageImages.cover && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${pageImages.cover})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          </div>
        )}
        
        {/* محتوى الـ Header */}
        <div className="relative z-10 p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* صورة البروفيل */}
              <div className="relative">
                {pageImages.profilePicture ? (
                  <img 
                    src={pageImages.profilePicture} 
                    alt={selectedPage.name}
                    className="w-20 h-20 rounded-full border-4 border-white/20 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center border-4 border-white/20">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                )}
                <div className="absolute -top-1 -right-1">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-white">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-ping absolute"></div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  {selectedPage.name}
                  <Badge variant="outline" className="bg-green-500/20 text-green-100 border-green-400/30">
                    <Radio className="h-3 w-3 mr-1 animate-pulse" />
                    مباشر
                  </Badge>
                </h2>
                <p className="text-white/80 text-lg">
                  {selectedPage.category} - التحديث التلقائي كل دقيقة
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-white/90 flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2">
                <Clock className="h-4 w-4" />
                آخر تحديث: {lastRefresh.toLocaleTimeString('ar-EG')}
              </div>
              <Button 
                variant={isAutoRefreshEnabled ? "default" : "outline"}
                size="sm" 
                onClick={() => setIsAutoRefreshEnabled(!isAutoRefreshEnabled)}
                className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Activity className={`h-4 w-4 ${isAutoRefreshEnabled ? 'animate-pulse' : ''}`} />
                {isAutoRefreshEnabled ? 'إيقاف' : 'تشغيل'} التحديث التلقائي
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                تحديث يدوي
              </Button>
            </div>
          </div>
        </div>
      </div>
      {error && (
        <Card className="border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <BarChart3 className="h-4 w-4" />
              <span>خطأ في جلب البيانات: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* متابعين */}
        <Card className={`glass-effect border-primary/20 hover:border-primary/40 transition-all duration-300 ${loading ? 'animate-pulse' : 'hover:scale-105'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Users className="h-8 w-8 text-primary" />
              <div className="flex items-center gap-1">
                {(() => {
                  const change = getChangeIndicator(insights?.page_fans || 0, previousData.fans);
                  const IconComponent = change.icon;
                  return (
                    <div className="flex items-center gap-1">
                      <IconComponent className={`h-4 w-4 ${change.color} animate-bounce`} />
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        مباشر
                      </Badge>
                    </div>
                  );
                })()}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-primary animate-fade-in">
              {formatNumber(insights?.page_fans)}
            </h3>
            <p className="text-sm text-muted-foreground">المتابعين</p>
            <p className="text-xs text-muted-foreground mt-1">{selectedPage.category}</p>
          </CardContent>
        </Card>

        {/* منشورات */}
        <Card className={`glass-effect border-accent/20 hover:border-accent/40 transition-all duration-300 ${loading ? 'animate-pulse' : 'hover:scale-105'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <MessageSquare className="h-8 w-8 text-foreground" />
              <div className="flex items-center gap-1">
                {(() => {
                  const change = getChangeIndicator(posts?.length || 0, previousData.posts);
                  const IconComponent = change.icon;
                  return <IconComponent className={`h-4 w-4 ${change.color} animate-bounce`} />;
                })()}
                <Badge variant="outline" className="text-xs">
                  حديث
                </Badge>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground animate-fade-in">
              {posts?.length || 0}
            </h3>
            <p className="text-sm text-muted-foreground">إجمالي المنشورات</p>
          </CardContent>
        </Card>

        {/* التفاعل */}
        <Card className={`glass-effect border-secondary/20 hover:border-secondary/40 transition-all duration-300 ${loading ? 'animate-pulse' : 'hover:scale-105'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="h-8 w-8 text-secondary" />
              <div className="flex items-center gap-1">
                {(() => {
                  const current = getTotalEngagement();
                  const change = getChangeIndicator(current, previousData.engagement);
                  const IconComponent = change.icon;
                  return <IconComponent className={`h-4 w-4 ${change.color} animate-bounce`} />;
                })()}
                <Badge variant="outline" className="text-xs">
                  محسوب
                </Badge>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-secondary animate-fade-in">
              {calculateEngagement()}%
            </h3>
            <p className="text-sm text-muted-foreground">متوسط التفاعل اليومي</p>
          </CardContent>
        </Card>

        {/* أعلى منشور */}
        <Card className={`glass-effect border-orange-200 hover:border-orange-300 transition-all duration-300 ${loading ? 'animate-pulse' : 'hover:scale-105'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Heart className="h-8 w-8 text-orange-600" />
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-orange-600 animate-bounce" />
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600">
                  أعلى منشور
                </Badge>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-orange-600 animate-fade-in">
              {topPost ? (
                (topPost.likes?.summary.total_count || 0) +
                (topPost.comments?.summary.total_count || 0) +
                (topPost.shares?.count || 0)
              ) : 0}
            </h3>
            <p className="text-sm text-muted-foreground">أعلى منشور تفاعلاً</p>
          </CardContent>
        </Card>

        {/* إجمالي التفاعلات */}
        <Card className={`glass-effect border-green-200 hover:border-green-300 transition-all duration-300 ${loading ? 'animate-pulse' : 'hover:scale-105'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="flex items-center gap-1">
                {(() => {
                  const current = getTotalEngagement();
                  const change = getChangeIndicator(current, previousData.engagement);
                  const IconComponent = change.icon;
                  return <IconComponent className={`h-4 w-4 ${change.color} animate-bounce`} />;
                })()}
                <Badge variant="outline" className="text-xs bg-green-50 text-green-600">
                  إجمالي
                </Badge>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-green-600 animate-fade-in">
              {formatNumber(getTotalEngagement())}
            </h3>
            <p className="text-sm text-muted-foreground">إجمالي التفاعلات</p>
          </CardContent>
        </Card>
      </div>

      {/* Messages & Live Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* رسائل جديدة */}
        <Card className={`glass-effect border-blue-200 hover:border-blue-300 transition-all duration-300 ${loading ? 'animate-pulse' : 'hover:scale-105'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div className="flex items-center gap-1">
                {(() => {
                  const change = getChangeIndicator(unreadMessages || 0, previousData.messages);
                  const IconComponent = change.icon;
                  return <IconComponent className={`h-4 w-4 ${change.color} animate-bounce`} />;
                })()}
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600">
                  رسائل جديدة
                </Badge>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-blue-600 animate-fade-in">
              {formatNumber(unreadMessages || 0)}
            </h3>
            <p className="text-sm text-muted-foreground">رسائل غير مقروءة</p>
          </CardContent>
        </Card>

        {/* حالة مباشرة */}
        <Card className="glass-effect border-purple-200 hover:border-purple-300 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Radio className="h-8 w-8 text-purple-600 animate-pulse" />
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600">
                حالة مباشرة
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-purple-600">
              {isAutoRefreshEnabled ? 'نشط' : 'معطل'}
            </h3>
            <p className="text-sm text-muted-foreground">
              التحديث التلقائي كل {isAutoRefreshEnabled ? '60 ثانية' : 'معطل'}
            </p>
          </CardContent>
        </Card>

        {/* آخر نشاط */}
        <Card className="glass-effect border-indigo-200 hover:border-indigo-300 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Clock className="h-8 w-8 text-indigo-600" />
              <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-600">
                آخر نشاط
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-indigo-600">
              {posts && posts.length > 0 
                ? formatShortDateInArabic(posts[0].created_time)
                : 'لا يوجد'
              }
            </h3>
            <p className="text-sm text-muted-foreground">
              آخر منشور في الصفحة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts Performance */}
        <Card className="glass-effect border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              أداء المنشورات الحديثة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-2 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="space-y-4">
                {posts.slice(0, 5).map((post, index) => (
                  <div key={post.id} className="p-3 rounded-lg bg-muted/20 border border-muted/40 hover:bg-muted/30 transition-all duration-200">
                    <div className="flex gap-3">
                      {/* صورة المنشور */}
                      <div className="flex-shrink-0">
                        {post.full_picture || post.picture ? (
                          <img 
                            src={post.full_picture || post.picture} 
                            alt="صورة المنشور"
                            className="w-16 h-16 rounded-lg object-cover shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-primary flex items-center justify-center">
                            <MessageSquare className="h-6 w-6 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      
                      {/* محتوى المنشور */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-medium line-clamp-2 flex-1">
                            {post.message || "منشور بدون نص"}
                          </p>
                          <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                            #{index + 1}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-red-500" />
                            <span className="font-medium">{post.likes?.summary.total_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3 text-blue-500" />
                            <span className="font-medium">{post.comments?.summary.total_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="h-3 w-3 text-green-500" />
                            <span className="font-medium">{post.shares?.count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 mr-auto">
                            <Clock className="h-3 w-3" />
                            <span>{formatShortDateInArabic(post.created_time)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد منشورات حديثة</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Post */}
        <Card className="glass-effect border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              أفضل منشور أداءً
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            ) : topPost ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <p className="text-sm mb-3 line-clamp-3">
                    {topPost.message || "منشور بدون نص"}
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-accent">
                        {topPost.likes?.summary.total_count || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">إعجابات</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-primary">
                        {topPost.comments?.summary.total_count || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">تعليقات</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-secondary">
                        {topPost.shares?.count || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">مشاركات</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    تاريخ النشر: {formatShortDateInArabic(topPost.created_time)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد بيانات أداء متاحة</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};