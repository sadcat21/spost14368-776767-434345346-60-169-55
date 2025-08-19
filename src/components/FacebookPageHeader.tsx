import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share, 
  Camera,
  Globe,
  MapPin,
  Calendar,
  Activity,
  Copy,
  ChevronRight,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatShortDateInArabic, getCurrentTimeInArabic } from "@/utils/dateUtils";

interface FacebookPageHeaderProps {
  selectedPage?: {
    id: string;
    name: string;
    category: string;
    picture?: {
      data: {
        url: string;
      };
    };
    cover?: {
      source: string;
    };
    followers_count?: number;
    fan_count?: number;
  };
  recentPosts?: Array<{
    id: string;
    message?: string;
    full_picture?: string;
    attachments?: {
      data: Array<{
        media?: {
          image?: {
            src: string;
          };
        };
      }>;
    };
    created_time: string;
    likes?: {
      summary: {
        total_count: number;
      };
    };
    comments?: {
      summary: {
        total_count: number;
      };
    };
    shares?: {
      count: number;
    };
  }>;
  copySettings?: {
    cards: boolean;
    badges: boolean;
    buttons: boolean;
    socialPosts: boolean;
    opacity: number;
  };
}

export const FacebookPageHeader = ({ 
  selectedPage, 
  recentPosts = [], 
  copySettings 
}: FacebookPageHeaderProps) => {
  const [isActive, setIsActive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // محاكاة تحديث البيانات كل دقيقة
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // محاكاة تغيير حالة النشاط
      setIsActive(Math.random() > 0.3);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!selectedPage) {
    return (
      <Card className="mb-6 border-primary/20">
        <CardContent className="p-6 text-center">
          <div className="h-32 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">اختر صفحة Facebook لعرض تفاصيلها</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const safeCopySettings = copySettings || {
    cards: false,
    badges: false,
    buttons: false,
    socialPosts: false,
    opacity: 50
  };

  return (
    <div className="relative mb-6">
      {/* البطاقة الرئيسية للهيدر */}
      <Card className="overflow-hidden shadow-2xl border-primary/20 relative group">
        {/* خلفية صورة الغلاف مع التدرج */}
        <div className="relative h-48 overflow-hidden">
          {selectedPage.cover?.source ? (
            <>
              <img 
                src={selectedPage.cover.source}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/60 via-primary/40 to-primary/20">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
            </div>
          )}
          
          {/* محتوى الهيدر فوق الخلفية */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end gap-4">
              {/* صورة البروفيل مع مؤشر النشاط */}
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white shadow-xl ring-4 ring-white/20">
                  <AvatarImage 
                    src={selectedPage.picture?.data?.url} 
                    alt={selectedPage.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-2xl font-bold">
                    {selectedPage.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                {/* مؤشر النشاط المباشر */}
                <motion.div 
                  className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white shadow-lg ${
                    isActive ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                  animate={{ 
                    scale: isActive ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: isActive ? Infinity : 0 
                  }}
                >
                  <Activity className="h-3 w-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </motion.div>
              </div>
              
              {/* معلومات الصفحة */}
              <div className="flex-1 text-white min-w-0">
                <h1 className="text-2xl font-bold truncate mb-1">{selectedPage.name}</h1>
                <div className="flex items-center gap-4 text-sm text-white/90">
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <span>{selectedPage.category}</span>
                  </div>
                  {selectedPage.fan_count && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{selectedPage.fan_count.toLocaleString()} متابع</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* قسم آخر المنشورات */}
        <CardContent className="p-6 bg-card/95 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              آخر المنشورات ({recentPosts.length})
            </h2>
            <Badge variant="outline" className={`${isActive ? 'border-green-500 text-green-700 bg-green-50' : 'border-gray-400 text-gray-600'}`}>
              {isActive ? 'نشط الآن' : 'غير متصل'}
            </Badge>
          </div>
          
          {recentPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {recentPosts.slice(0, 6).map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 border-primary/10 hover:border-primary/30">
                      <div className="aspect-square relative overflow-hidden">
                        {post.full_picture || post.attachments?.data?.[0]?.media?.image?.src ? (
                          <img 
                            src={post.full_picture || post.attachments?.data?.[0]?.media?.image?.src}
                            alt="Post"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <MessageCircle className="h-8 w-8 text-primary/50" />
                          </div>
                        )}
                        
                        {/* إحصائيات المنشور */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <div className="flex items-center gap-3 text-white text-xs">
                            {post.likes?.summary?.total_count && (
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                                <span>{post.likes.summary.total_count}</span>
                              </div>
                            )}
                            {post.comments?.summary?.total_count && (
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                <span>{post.comments.summary.total_count}</span>
                              </div>
                            )}
                            {post.shares?.count && (
                              <div className="flex items-center gap-1">
                                <Share className="h-3 w-3" />
                                <span>{post.shares.count}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {post.message && (
                        <CardContent className="p-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {post.message}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-2">
                            {formatShortDateInArabic(post.created_time)}
                          </p>
                        </CardContent>
                      )}
                    </Card>

                    {/* أيقونة نسخ للمنشورات */}
                    {safeCopySettings.socialPosts && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -left-6 top-1/2 -translate-y-1/2 h-5 w-5 p-0 transition-all duration-200 hover:bg-primary/20 hover:scale-110 copy-button opacity-0 group-hover:opacity-100"
                        style={{ 
                          opacity: `${safeCopySettings.opacity / 100}`,
                          background: `hsl(var(--primary) / ${safeCopySettings.opacity / 100 * 0.1})`,
                          borderColor: `hsl(var(--primary) / ${safeCopySettings.opacity / 100 * 0.3})`,
                          border: '1px solid'
                        } as React.CSSProperties}
                        onClick={(e) => {
                          e.stopPropagation();
                          const postInfo = {
                            id: post.id,
                            message: post.message || "منشور بدون نص",
                            created_time: post.created_time,
                            likes: post.likes?.summary?.total_count || 0,
                            comments: post.comments?.summary?.total_count || 0,
                            shares: post.shares?.count || 0
                          };
                          
                          const infoText = `رمزه في الكود: FacebookPageHeader
المكون: FacebookPageHeader`;
                          
                          navigator.clipboard.writeText(infoText).then(() => {
                            const notification = document.createElement('div');
                            notification.textContent = '✅ تم نسخ معلومات المنشور';
                            notification.className = 'fixed top-4 right-4 bg-accent text-accent-foreground px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
                            document.body.appendChild(notification);
                            
                            setTimeout(() => {
                              notification.remove();
                            }, 2000);
                          });
                        }}
                      >
                        <Copy className="h-2.5 w-2.5 text-primary" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد منشورات حديثة</p>
              <p className="text-sm">سيتم عرض المنشورات هنا عند توفرها</p>
            </div>
          )}
        </CardContent>

        {/* أيقونة نسخ للبطاقة الرئيسية */}
        {safeCopySettings.cards && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute -left-6 top-1/2 -translate-y-1/2 h-5 w-5 p-0 transition-all duration-200 hover:bg-primary/20 hover:scale-110 copy-button"
            style={{ 
              opacity: safeCopySettings.opacity / 100,
              background: `hsl(var(--primary) / ${safeCopySettings.opacity / 100 * 0.1})`,
              borderColor: `hsl(var(--primary) / ${safeCopySettings.opacity / 100 * 0.3})`,
              border: '1px solid'
            } as React.CSSProperties}
            onClick={(e) => {
              e.stopPropagation();
              const pageInfo = {
                id: selectedPage.id,
                name: selectedPage.name,
                category: selectedPage.category,
                followers: selectedPage.fan_count || 0,
                postsCount: recentPosts.length
              };
              
              const infoText = `رمزه في الكود: FacebookPageHeader
المكون: FacebookPageHeader`;
              
              navigator.clipboard.writeText(infoText).then(() => {
                const notification = document.createElement('div');
                notification.textContent = '✅ تم نسخ معلومات هيدر الصفحة';
                notification.className = 'fixed top-4 right-4 bg-accent text-accent-foreground px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
                document.body.appendChild(notification);
                
                setTimeout(() => {
                  notification.remove();
                }, 2000);
              });
            }}
          >
            <Copy className="h-2.5 w-2.5 text-primary" />
          </Button>
        )}
      </Card>
    </div>
  );
};