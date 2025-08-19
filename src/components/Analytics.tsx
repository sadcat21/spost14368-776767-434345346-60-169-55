import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Eye, Download } from "lucide-react";

interface AnalyticsData {
  totalGenerated: number;
  templatesCreated: number;
  mostUsedSpecialty: string;
  mostUsedContentType: string;
  generatedToday: number;
  popularImageStyles: string[];
}

export const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalGenerated: 0,
    templatesCreated: 0,
    mostUsedSpecialty: "",
    mostUsedContentType: "",
    generatedToday: 0,
    popularImageStyles: []
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    // Load data from localStorage
    const generatedContent = JSON.parse(localStorage.getItem("generated-content-history") || "[]");
    const templates = JSON.parse(localStorage.getItem("social-content-templates") || "[]");
    
    // Calculate analytics
    const today = new Date().toDateString();
    const todayGenerated = generatedContent.filter((item: any) => 
      new Date(item.createdAt).toDateString() === today
    ).length;

    // Count specialties
    const specialtyCount: Record<string, number> = {};
    const contentTypeCount: Record<string, number> = {};
    const imageStyleCount: Record<string, number> = {};

    generatedContent.forEach((item: any) => {
      specialtyCount[item.specialty] = (specialtyCount[item.specialty] || 0) + 1;
      contentTypeCount[item.contentType] = (contentTypeCount[item.contentType] || 0) + 1;
      imageStyleCount[item.imageStyle] = (imageStyleCount[item.imageStyle] || 0) + 1;
    });

    const mostUsedSpecialty = Object.keys(specialtyCount).reduce((a, b) => 
      specialtyCount[a] > specialtyCount[b] ? a : b, ""
    );

    const mostUsedContentType = Object.keys(contentTypeCount).reduce((a, b) => 
      contentTypeCount[a] > contentTypeCount[b] ? a : b, ""
    );

    const popularImageStyles = Object.keys(imageStyleCount)
      .sort((a, b) => imageStyleCount[b] - imageStyleCount[a])
      .slice(0, 3);

    setAnalytics({
      totalGenerated: generatedContent.length,
      templatesCreated: templates.length,
      mostUsedSpecialty,
      mostUsedContentType,
      generatedToday: todayGenerated,
      popularImageStyles
    });
  };

  const stats = [
    {
      title: "إجمالي المحتوى المولد",
      value: analytics.totalGenerated,
      icon: BarChart3,
      color: "text-primary"
    },
    {
      title: "النماذج المحفوظة",
      value: analytics.templatesCreated,
      icon: Download,
      color: "text-accent"
    },
    {
      title: "محتوى اليوم",
      value: analytics.generatedToday,
      icon: TrendingUp,
      color: "text-social-instagram"
    }
  ];

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <BarChart3 className="h-5 w-5" />
          إحصائيات الاستخدام
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center p-4 border rounded-lg">
                <Icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold highlight-number">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </div>
            );
          })}
        </div>

        {/* Popular Categories */}
        <div className="space-y-4">
          <h4 className="font-medium">الأكثر استخداماً</h4>
          
          {analytics.mostUsedSpecialty && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">التخصص الأكثر استخداماً</span>
              <span className="highlight-data">{analytics.mostUsedSpecialty}</span>
            </div>
          )}

          {analytics.mostUsedContentType && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">نوع المحتوى الأكثر استخداماً</span>
              <span className="highlight-data">{analytics.mostUsedContentType}</span>
            </div>
          )}

          {analytics.popularImageStyles.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">أنماط الصور الشائعة</span>
              <div className="flex gap-2 flex-wrap">
                {analytics.popularImageStyles.map((style, index) => (
                  <span key={index} className="highlight-keyword">
                    {style}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Usage Tips */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <h4 className="font-medium text-primary mb-2">💡 نصائح لتحسين الاستخدام</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• جرب أنواع محتوى مختلفة لزيادة التفاعل</li>
            <li>• احفظ النماذج الناجحة لإعادة الاستخدام</li>
            <li>• استخدم أبعاد مختلفة حسب المنصة</li>
            <li>• اختبر أنماط صور متنوعة لجذب جمهور أكبر</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};