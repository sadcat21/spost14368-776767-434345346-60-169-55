
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, RefreshCw, Globe, Mail, Phone, MapPin, User, Camera, AlertTriangle, MessageCircle, Calendar, Link, Shield, FileText } from "lucide-react";
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
      permalink_url: string;
    }>;
  };
}

interface PageInfoProps {
  selectedPage: FacebookPage;
  isCompactView?: boolean;
}

export const PageInfo = ({ selectedPage, isCompactView = false }: PageInfoProps) => {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPageInfo = async () => {
    setLoading(true);
    try {
      // جلب جميع البيانات المطلوبة (إزالة created_time لأنه غير متاح للصفحات)
      const allFields = [
        'id',
        'name',
        'about',
        'category',
        'fan_count',
        'followers_count',
        'link',
        'location',
        'website',
        'posts.limit(100){id,message,created_time,permalink_url}',
        'picture{url}',
        'username',
        'verification_status',
        'description',
        'phone',
        'emails',
        'cover{source}',
        'whatsapp_number'
      ].join(',');

      const response = await fetch(
        `https://graph.facebook.com/v19.0/${selectedPage.id}?fields=${allFields}&access_token=${selectedPage.access_token}`
      );
      
      const data = await response.json();
      
      if (data.error) {
        // إذا فشل، جرب الحد الأدنى
        if (data.error.code === 200 || data.error.code === 190) {
          await fetchBasicInfo();
          return;
        }
        throw new Error(data.error.message);
      }

      setPageData(data);
      toast.success("تم جلب بيانات الصفحة بنجاح");
    } catch (error) {
      console.error("Error fetching page info:", error);
      toast.error("فشل في جلب بيانات الصفحة: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBasicInfo = async () => {
    try {
      // الحد الأدنى من البيانات التي يمكن الوصول إليها بأي توكن
      const minimalFields = ['name', 'category', 'picture{url}', 'id'].join(',');
      
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${selectedPage.id}?fields=${minimalFields}&access_token=${selectedPage.access_token}`
      );
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      setPageData(data);
      toast.success("تم جلب البيانات الأساسية للصفحة", {
        description: "بعض البيانات تتطلب صلاحيات إضافية"
      });
    } catch (error) {
      console.error("Error fetching basic page info:", error);
      toast.error("فشل في جلب البيانات الأساسية: " + (error as Error).message);
    }
  };

  useEffect(() => {
    if (selectedPage) {
      fetchPageInfo();
    }
  }, [selectedPage]);

  if (!pageData && !loading) {
    return (
      <Card className="shadow-elegant">
        <CardContent className="flex items-center justify-center p-6">
          <Button onClick={fetchPageInfo} className="gap-2">
            <Info className="h-4 w-4" />
            جلب بيانات الصفحة
          </Button>
        </CardContent>
      </Card>
    );
  }

  // عرض مصغر للبيانات - يُظهر الأيقونات والنصوص معاً دائماً
  if (isCompactView && pageData) {
    return (
      <Card className="shadow-elegant">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {pageData.picture && (
              <img 
                src={pageData.picture.data.url} 
                alt="صورة الملف الشخصي"
                className="w-12 h-12 rounded-full object-cover border"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{pageData.name}</h3>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                {pageData.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    <span className="truncate max-w-[100px]">{pageData.website}</span>
                  </div>
                )}
                {pageData.emails && pageData.emails.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span className="truncate max-w-[120px]">{pageData.emails[0]}</span>
                  </div>
                )}
                {pageData.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{pageData.phone}</span>
                  </div>
                )}
                {pageData.whatsapp_number && (
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">{pageData.whatsapp_number}</span>
                  </div>
                )}
                {pageData.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-[100px]">
                      {pageData.location.city || pageData.location.country}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPageInfo}
              disabled={loading}
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <Card className="shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Info className="h-5 w-5" />
              بيانات الصفحة العامة
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPageInfo}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* تحذير بشأن الصلاحيات */}
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>ملاحظة هامة:</strong> إذا ظهرت رسالة خطأ تتعلق بـ "business_management permission"، 
          فهذا يعني أن التوكن المستخدم لا يملك الصلاحيات الكاملة للوصول لجميع بيانات الصفحة. 
          سيتم عرض البيانات المتاحة فقط. لحل هذه المشكلة، تحتاج إلى:
          <br />• استخدام User Token بدلاً من Page Token
          <br />• طلب صلاحيات إضافية عند إنشاء التوكن
          <br />• التأكد من أن حسابك هو Admin للصفحة
        </AlertDescription>
      </Alert>

      {loading ? (
        <Card className="shadow-elegant border-primary/20">
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <div className="relative">
                <RefreshCw className="h-12 w-12 animate-spin mx-auto text-primary" />
                <div className="absolute inset-0 h-12 w-12 mx-auto rounded-full border-2 border-primary/20 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-primary">جاري جلب بيانات الصفحة</p>
                <p className="text-sm text-muted-foreground">يتم تحميل المعلومات الشاملة للصفحة...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : pageData && (
        <div className="space-y-6">
          {/* Hero Section with Cover and Profile */}
          {(pageData.picture || pageData.cover) && (
            <Card className="shadow-elegant border-primary/20 overflow-hidden">
              <div className="relative">
                {pageData.cover && (
                  <div className="h-48 md:h-64 relative overflow-hidden">
                    <img 
                      src={pageData.cover.source} 
                      alt="صورة الغلاف"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>
                )}
                
                <div className="relative px-6 pb-6">
                  <div className={`flex flex-col md:flex-row items-start gap-4 ${pageData.cover ? '-mt-16' : 'pt-6'}`}>
                    {pageData.picture && (
                      <div className="relative">
                        <img 
                          src={pageData.picture.data.url} 
                          alt="صورة الملف الشخصي"
                          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        <div className="absolute inset-0 w-32 h-32 rounded-full ring-4 ring-primary/20 animate-pulse"></div>
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-3 mt-4 md:mt-8">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-primary">{pageData.name}</h1>
                        <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary border-primary/20">
                          {pageData.category}
                        </Badge>
                      </div>
                      
                      {(pageData.fan_count || pageData.followers_count) && (
                        <div className="flex flex-wrap gap-6">
                          {pageData.fan_count && (
                            <div className="text-center">
                              <p className="text-2xl font-bold text-primary">{pageData.fan_count.toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">إعجاب</p>
                            </div>
                          )}
                          {pageData.followers_count && (
                            <div className="text-center">
                              <p className="text-2xl font-bold text-primary">{pageData.followers_count.toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">متابع</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info - Enhanced */}
          <Card className="shadow-elegant border-primary/20 bg-gradient-to-br from-white to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <User className="h-5 w-5" />
                المعلومات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* إخفاء الاسم والفئة إذا كانت موجودة في Hero Section */}
              {!(pageData.picture || pageData.cover) && (
                <div className="text-center space-y-2">
                  <h3 className="font-bold text-xl text-primary">{pageData.name}</h3>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {pageData.category}
                  </Badge>
                </div>
              )}
              
              {(pageData.about || pageData.description) && (
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg"></div>
                  <div className="relative space-y-2">
                    <h4 className="font-semibold text-primary flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      الوصف
                    </h4>
                    <p className="text-muted-foreground leading-relaxed bg-white/60 p-4 rounded-lg border border-primary/10">
                      {pageData.about || pageData.description}
                    </p>
                  </div>
                </div>
              )}

              {/* إخفاء إحصائيات المتابعين إذا كانت موجودة في Hero Section */}
              {!(pageData.picture || pageData.cover) && (pageData.fan_count || pageData.followers_count) && (
                <div className="grid grid-cols-2 gap-4">
                  {pageData.fan_count && (
                    <div className="text-center p-4 bg-white/60 rounded-lg border border-primary/10">
                      <p className="text-3xl font-bold text-primary">{pageData.fan_count.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground font-medium">إعجاب</p>
                    </div>
                  )}
                  {pageData.followers_count && (
                    <div className="text-center p-4 bg-white/60 rounded-lg border border-primary/10">
                      <p className="text-3xl font-bold text-primary">{pageData.followers_count.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground font-medium">متابع</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Info - Enhanced */}
          <Card className="shadow-elegant border-primary/20 bg-gradient-to-br from-white to-green-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Phone className="h-5 w-5" />
                معلومات التواصل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pageData.website && (
                <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Globe className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-blue-900">الموقع الإلكتروني</span>
                    <a 
                      href={pageData.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                    >
                      {pageData.website}
                    </a>
                  </div>
                </div>
              )}

              {pageData.emails && pageData.emails.length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-purple-50/50 rounded-lg border border-purple-100 hover:bg-purple-50 transition-colors">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Mail className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-purple-900">البريد الإلكتروني</span>
                    <div className="space-y-1 mt-1">
                      {pageData.emails.map((email, index) => (
                        <a 
                          key={index}
                          href={`mailto:${email}`}
                          className="block text-purple-600 hover:text-purple-800 font-medium hover:underline transition-colors"
                        >
                          {email}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {pageData.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Phone className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-gray-900">رقم الهاتف</span>
                    <a 
                      href={`tel:${pageData.phone}`}
                      className="block text-gray-700 hover:text-gray-900 font-medium hover:underline transition-colors"
                    >
                      {pageData.phone}
                    </a>
                  </div>
                </div>
              )}

              {pageData.whatsapp_number && (
                <div className="flex items-center gap-3 p-3 bg-green-50/50 rounded-lg border border-green-200 hover:bg-green-50 transition-colors">
                  <div className="p-2 bg-green-100 rounded-full">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-green-900">رقم الواتساب</span>
                    <a 
                      href={`https://wa.me/${pageData.whatsapp_number.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-green-600 hover:text-green-800 font-medium hover:underline transition-colors"
                    >
                      {pageData.whatsapp_number}
                    </a>
                  </div>
                </div>
              )}

              {pageData.location && (
                <div className="flex items-start gap-3 p-3 bg-red-50/50 rounded-lg border border-red-100 hover:bg-red-50 transition-colors">
                  <div className="p-2 bg-red-100 rounded-full">
                    <MapPin className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-red-900">العنوان</span>
                    <div className="mt-1">
                      {pageData.location.street && (
                        <p className="text-sm text-red-700 font-medium">{pageData.location.street}</p>
                      )}
                      <p className="text-sm text-red-600">
                        {[pageData.location.city, pageData.location.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!pageData.website && !pageData.emails && !pageData.phone && !pageData.whatsapp_number && !pageData.location && (
                <div className="space-y-3">
                  <div className="text-center p-6 bg-amber-50/50 rounded-lg border border-amber-200">
                    <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-amber-700 font-medium">لا توجد معلومات تواصل متاحة</p>
                  </div>
                  <Alert className="border-amber-200 bg-amber-50/30">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      <strong>ملاحظة:</strong> إذا كان لديك رقم واتساب أو هاتف في إعدادات الصفحة، تأكد من جعله "عامًا" في إعدادات الخصوصية حتى يظهر هنا.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Insights */}
          <Card className="shadow-elegant border-primary/20 bg-gradient-to-br from-white to-blue-50/30 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <FileText className="h-5 w-5" />
                بيانات إضافية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pageData.link && (
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Link className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-900">رابط الصفحة</span>
                    </div>
                    <a 
                      href={pageData.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm hover:underline transition-colors"
                    >
                      {pageData.link}
                    </a>
                  </div>
                )}

                {pageData.username && (
                  <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-900">اسم المستخدم</span>
                    </div>
                    <p className="text-purple-700 text-sm font-medium">@{pageData.username}</p>
                  </div>
                )}

                {pageData.verification_status && (
                  <div className="p-3 bg-green-50/50 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-900">حالة التوثيق</span>
                    </div>
                    <p className="text-green-700 text-sm font-medium">{pageData.verification_status}</p>
                  </div>
                )}

                {pageData.posts && pageData.posts.data && (
                  <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 md:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm font-semibold text-indigo-900">عدد المنشورات</span>
                    </div>
                    <p className="text-indigo-700 text-sm font-medium">{pageData.posts.data.length} منشور متاح</p>
                  </div>
                )}
              </div>

              {/* Recent Posts Preview */}
              {pageData.posts && pageData.posts.data && pageData.posts.data.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-primary flex items-center gap-2 mb-4">
                    <MessageCircle className="h-4 w-4" />
                    أحدث المنشورات
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {pageData.posts.data.slice(0, 5).map((post) => (
                      <div key={post.id} className="p-3 bg-white/60 rounded-lg border border-primary/10 hover:bg-white/80 transition-colors">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {post.message || "منشور بدون نص"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatShortDateInArabic(post.created_time)}
                            </p>
                          </div>
                          <a 
                            href={post.permalink_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors"
                          >
                            عرض
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Page Insights */}
          <Card className="shadow-elegant lg:col-span-2 border-primary/20 bg-gradient-to-br from-white to-blue-50/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Info className="h-5 w-5" />
                معلومات إضافية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/60 rounded-lg border border-primary/10">
                  <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">ID الصفحة</p>
                  <p className="text-xs text-primary font-mono break-all">{pageData.id}</p>
                </div>
                
                <div className="text-center p-4 bg-white/60 rounded-lg border border-primary/10">
                  <User className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">نوع الصفحة</p>
                  <p className="text-sm text-primary font-semibold">{pageData.category}</p>
                </div>
                
                <div className="text-center p-4 bg-white/60 rounded-lg border border-primary/10">
                  <Camera className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">حالة الوسائط</p>
                  <p className="text-sm text-primary font-semibold">
                    {(pageData.picture ? "✓ " : "✗ ") + "صورة شخصية"}
                    <br />
                    {(pageData.cover ? "✓ " : "✗ ") + "صورة غلاف"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      )}
    </div>
  );
};
