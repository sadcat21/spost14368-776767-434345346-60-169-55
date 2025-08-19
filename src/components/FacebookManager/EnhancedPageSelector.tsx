import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { 
  Facebook, User, Globe, Building, Users, Heart, MapPin, 
  ExternalLink, ChevronDown, RefreshCw, Check, Sparkles 
} from "lucide-react";
import { toast } from "sonner";

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

interface EnhancedPageData {
  id: string;
  name: string;
  category: string;
  about?: string;
  description?: string;
  fan_count?: number;
  followers_count?: number;
  website?: string;
  location?: {
    city?: string;
    country?: string;
  };
  picture?: {
    data: {
      url: string;
    };
  };
  cover?: {
    source: string;
  };
  link?: string;
  verification_status?: string;
}

interface EnhancedPageSelectorProps {
  accessToken: string;
  onPageSelect: (page: FacebookPage) => void;
  selectedPage?: FacebookPage | null;
  isCompactView?: boolean;
}

export const EnhancedPageSelector = ({ 
  accessToken, 
  onPageSelect, 
  selectedPage, 
  isCompactView = false 
}: EnhancedPageSelectorProps) => {
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [enhancedPagesData, setEnhancedPagesData] = useState<Map<string, EnhancedPageData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [expandedPage, setExpandedPage] = useState<string | null>(null);

  useEffect(() => {
    if (accessToken) {
      loadPages();
    }
  }, [accessToken]);

  const loadPages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,category,access_token,picture&access_token=${accessToken}`
      );
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const pagesData = data.data || [];
      setPages(pagesData);
      
      // جلب البيانات المحسنة لكل صفحة
      await loadEnhancedPagesData(pagesData);
      
      // Auto-select first page if none selected
      if (pagesData.length > 0 && !selectedPage) {
        onPageSelect(pagesData[0]);
      }
      
    } catch (error) {
      console.error("Error loading pages:", error);
      toast.error("فشل في تحميل الصفحات");
    } finally {
      setLoading(false);
    }
  };

  const loadEnhancedPagesData = async (pagesArray: FacebookPage[]) => {
    const enhancedData = new Map<string, EnhancedPageData>();
    
    // جلب البيانات المحسنة لكل صفحة بالتوازي
    const promises = pagesArray.map(async (page) => {
      try {
        const fields = [
          'id', 'name', 'category', 'about', 'description',
          'fan_count', 'followers_count', 'website', 'location',
          'picture.type(large)', 'cover', 'link', 'verification_status'
        ].join(',');

        const response = await fetch(
          `https://graph.facebook.com/v19.0/${page.id}?fields=${fields}&access_token=${page.access_token}`
        );
        
        const data = await response.json();
        
        if (!data.error && data.id) {
          enhancedData.set(page.id, data);
          console.log(`Enhanced data loaded for page ${page.id}:`, data);
        } else {
          console.warn(`Failed to load enhanced data for page ${page.id}:`, data.error);
        }
      } catch (error) {
        console.error(`Error loading enhanced data for page ${page.id}:`, error);
      }
    });

    await Promise.all(promises);
    setEnhancedPagesData(enhancedData);
    console.log('All enhanced page data loaded:', enhancedData);
  };

  const handlePageSelect = (page: FacebookPage) => {
    onPageSelect(page);
    setExpandedPage(null);
    toast.success(`تم اختيار صفحة: ${page.name}`);
  };

  const formatNumber = (num?: number) => {
    if (!num) return null;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Facebook className="h-5 w-5" />
            جاري تحميل الصفحات...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (pages.length === 0) {
    return (
      <Card className="shadow-elegant">
        <CardContent className="text-center py-8">
          <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">لا توجد صفحات متاحة</p>
          <Button onClick={loadPages} className="mt-4" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Facebook className="h-5 w-5" />
            اختيار الصفحة
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {pages.length} صفحة
            </Badge>
          </CardTitle>
          <Button onClick={loadPages} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* إضافة مؤشر التحميل للبيانات المحسنة */}
        {enhancedPagesData.size === 0 && pages.length > 0 && (
          <div className="text-center py-2">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              جاري تحميل البيانات المحسنة...
            </div>
          </div>
        )}
        
        <div className="grid gap-4">
          {pages.map((page) => {
            const enhancedData = enhancedPagesData.get(page.id);
            const isSelected = selectedPage?.id === page.id;
            const isExpanded = expandedPage === page.id;

            console.log(`Rendering page ${page.id}, Enhanced data:`, enhancedData);

            return (
              <div
                key={page.id}
                className={`
                  relative overflow-hidden rounded-xl border-2 transition-all duration-300
                  ${isSelected 
                    ? 'border-primary bg-primary/5 shadow-lg scale-105' 
                    : 'border-border/50 hover:border-primary/50 hover:shadow-md hover:scale-102'
                  }
                `}
              >
                {/* صورة الغلاف مع التدرج - إظهار حتى لو لم تكن هناك صورة غلاف */}
                {enhancedData?.cover?.source ? (
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={enhancedData.cover.source}
                      alt="صورة الغلاف"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      onError={(e) => {
                        console.log('Cover image failed to load:', enhancedData.cover.source);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* زر التوسع */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200"
                      onClick={() => setExpandedPage(isExpanded ? null : page.id)}
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>
                ) : (
                  /* زر التوسع في حالة عدم وجود صورة غلاف */
                  <div className="absolute top-2 right-2 z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-primary/10 hover:bg-primary/20 transition-all duration-200"
                      onClick={() => setExpandedPage(isExpanded ? null : page.id)}
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>
                )}

                {/* المحتوى الرئيسي */}
                <div className={`p-4 ${enhancedData?.cover?.source ? '-mt-8' : ''} relative`}>
                  <div className="flex items-start gap-4">
                    {/* صورة البروفايل */}
                    <div className="relative flex-shrink-0">
                      <Avatar className={`${enhancedData?.cover?.source ? 'w-16 h-16 border-4 border-white' : 'w-12 h-12'} shadow-lg transition-transform duration-200 hover:scale-110`}>
                        <AvatarImage 
                          src={enhancedData?.picture?.data?.url || page.picture?.data?.url} 
                          alt={page.name}
                          onError={(e) => {
                            console.log('Profile image failed to load');
                          }}
                        />
                        <AvatarFallback className="bg-primary/10">
                          <Building className="h-6 w-6 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* علامة التحقق */}
                      {enhancedData?.verification_status === 'verified' && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* معلومات الصفحة */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold truncate ${enhancedData?.cover?.source ? 'text-white' : 'text-foreground'} text-lg transition-colors duration-200`}>
                            {page.name}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className={`mt-1 transition-all duration-200 ${enhancedData?.cover?.source ? 'bg-white/20 text-white border-white/30' : ''}`}
                          >
                            {page.category}
                          </Badge>
                        </div>

                        {/* زر الاختيار */}
                        <Button
                          onClick={() => handlePageSelect(page)}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className={`gap-2 transition-all duration-200 hover:scale-105 ${enhancedData?.cover?.source && !isSelected ? 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border-white/30' : ''}`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="h-4 w-4" />
                              محدد
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              اختيار
                            </>
                          )}
                        </Button>
                      </div>

                      {/* الإحصائيات السريعة - دائماً مرئية */}
                      {(enhancedData?.fan_count || enhancedData?.followers_count || page.id) && (
                        <div className={`flex gap-4 mt-2 ${enhancedData?.cover?.source ? 'text-white/90' : 'text-muted-foreground'} transition-colors duration-200`}>
                          {enhancedData?.fan_count ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Heart className="h-3 w-3 animate-pulse text-red-500" />
                              <span className="font-medium">{formatNumber(enhancedData.fan_count)}</span>
                              <span className="text-xs opacity-75">إعجاب</span>
                            </div>
                          ) : null}
                          {enhancedData?.followers_count ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Users className="h-3 w-3 text-blue-500" />
                              <span className="font-medium">{formatNumber(enhancedData.followers_count)}</span>
                              <span className="text-xs opacity-75">متابع</span>
                            </div>
                          ) : null}
                          {/* عرض رقم الصفحة كبديل إذا لم تتوفر الإحصائيات */}
                          {!enhancedData?.fan_count && !enhancedData?.followers_count && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Building className="h-3 w-3" />
                              <span>ID: {page.id.substring(0, 8)}...</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* التفاصيل الموسعة */}
                  {isExpanded && enhancedData && (
                    <div className="mt-4 pt-4 border-t border-border/30 space-y-3 animate-in slide-in-from-top-2 duration-300">
                      {enhancedData.about && (
                        <p className="text-sm text-muted-foreground leading-relaxed p-3 bg-white/5 rounded-lg border border-primary/10">
                          {enhancedData.about}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-3 text-xs">
                        {enhancedData.website && (
                          <a
                            href={enhancedData.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                          >
                            <Globe className="h-3 w-3" />
                            موقع إلكتروني
                            <ExternalLink className="h-2 w-2" />
                          </a>
                        )}
                        
                        {enhancedData.location && (enhancedData.location.city || enhancedData.location.country) && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {enhancedData.location.city || enhancedData.location.country}
                          </div>
                        )}
                        
                        {enhancedData.link && (
                          <a
                            href={enhancedData.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:text-primary/80 hover:underline transition-colors duration-200"
                          >
                            <Facebook className="h-3 w-3" />
                            صفحة فيسبوك
                            <ExternalLink className="h-2 w-2" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};