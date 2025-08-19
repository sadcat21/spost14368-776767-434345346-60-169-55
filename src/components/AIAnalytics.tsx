import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Users, BarChart3, Target, Zap, Activity, RefreshCw } from "lucide-react";
import { useFacebookData } from "@/hooks/useFacebookData";
import { useState, useEffect } from "react";

interface AIAnalyticsProps {
  selectedPage?: {
    id: string;
    name: string;
    access_token: string;
    category: string;
  } | null;
}

const AIAnalytics = ({ selectedPage }: AIAnalyticsProps) => {
  const { insights, posts, loading, error, refreshData } = useFacebookData(selectedPage);
  const [engagementRate, setEngagementRate] = useState(0);
  const [totalReactions, setTotalReactions] = useState(0);

  // حساب معدل التفاعل من البيانات الحقيقية
  useEffect(() => {
    if (posts && posts.length > 0 && insights) {
      const totalEngagement = posts.reduce((sum, post) => {
        const likes = post.likes?.summary.total_count || 0;
        const comments = post.comments?.summary.total_count || 0;
        const shares = post.shares?.count || 0;
        return sum + likes + comments + shares;
      }, 0);

      setTotalReactions(totalEngagement);
      
      if (insights.page_fans > 0) {
        const rate = (totalEngagement / insights.page_fans) * 100;
        setEngagementRate(Math.round(rate * 100) / 100);
      }
    }
  }, [posts, insights]);

  // البيانات المحسوبة من Facebook API
  const analyticsData = [
    {
      title: "إجمالي المتابعين",
      value: insights?.page_fans ? insights.page_fans.toLocaleString() : "0",
      change: loading ? "..." : "+متغير",
      trend: "up",
      icon: Users,
      description: "عدد متابعي الصفحة الحالي"
    },
    {
      title: "مشاهدات الصفحة",
      value: insights?.page_views ? insights.page_views.toLocaleString() : "0",
      change: loading ? "..." : "+متغير",
      trend: "up",
      icon: BarChart3,
      description: "مشاهدات الصفحة في آخر 30 يوم"
    },
    {
      title: "معدل التفاعل",
      value: loading ? "..." : `${engagementRate}%`,
      change: loading ? "..." : "+محسوب",
      trend: "up",
      icon: Activity,
      description: "معدل التفاعل المحسوب من البيانات الحقيقية"
    },
    {
      title: "المستخدمون المتفاعلون",
      value: insights?.page_engaged_users ? insights.page_engaged_users.toLocaleString() : "0",
      change: loading ? "..." : "+متغير",
      trend: "up",
      icon: Target,
      description: "عدد المستخدمين المتفاعلين"
    }
  ];

  // رؤى الذكاء الاصطناعي المبنية على البيانات الحقيقية
  const aiInsights = [
    {
      category: "أداء المنشورات",
      insight: posts.length > 0 
        ? `آخر ${posts.length} منشورات حققت ${totalReactions} تفاعل`
        : "لا توجد منشورات حديثة للتحليل",
      confidence: posts.length > 0 ? 94 : 0,
      impact: "عالي"
    },
    {
      category: "مستوى المشاركة",
      insight: insights?.page_impressions 
        ? `${insights.page_impressions.toLocaleString()} مشاهدة للمنشورات`
        : "بيانات المشاهدات غير متوفرة",
      confidence: insights?.page_impressions ? 87 : 0,
      impact: "عالي"
    },
    {
      category: "نمو الجمهور",
      insight: insights?.page_fans 
        ? `${insights.page_fans.toLocaleString()} متابع حالياً`
        : "بيانات المتابعين غير متوفرة",
      confidence: insights?.page_fans ? 82 : 0,
      impact: "متوسط"
    },
    {
      category: "التفاعل الأخير",
      insight: insights?.page_actions_post_reactions_total 
        ? `${insights.page_actions_post_reactions_total.toLocaleString()} رد فعل إجمالي`
        : "بيانات التفاعلات غير متوفرة",
      confidence: insights?.page_actions_post_reactions_total ? 78 : 0,
      impact: "متوسط"
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-primary">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">التحليلات الذكية</h1>
            <p className="text-muted-foreground">
              {selectedPage ? `رؤى حقيقية من صفحة ${selectedPage.name}` : "رؤى مدعومة بالذكاء الاصطناعي"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={loading || !selectedPage}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </Button>
          {selectedPage && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              بيانات حقيقية
            </Badge>
          )}
        </div>
      </div>

      {error && (
        <Card className="glass-effect border-destructive/20 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm">خطأ في جلب البيانات: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsData.map((item, index) => (
          <Card key={index} className="glass-effect border-primary/10 hover:border-primary/30 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 text-xs">
                  {item.change}
                </Badge>
              </div>
              <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
              <div className="text-2xl font-bold text-primary mb-2">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <Card className="glass-effect border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            رؤى الذكاء الاصطناعي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/20 border border-muted/40">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-sm text-primary">{insight.category}</h4>
                    <p className="text-sm text-foreground mt-1">{insight.insight}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      insight.impact === "عالي" 
                        ? "bg-accent/10 text-accent border-accent/20" 
                        : "bg-secondary/10 text-secondary border-secondary/20"
                    }`}
                  >
                    {insight.impact}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">مستوى الثقة</span>
                    <span className="text-primary font-medium">{insight.confidence}%</span>
                  </div>
                  <Progress value={insight.confidence} className="h-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart Placeholder */}
      <Card className="glass-effect border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            تحليل الأداء الزمني
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/10 rounded-lg border border-muted/20">
            <div className="text-center space-y-2">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">رسم بياني تفاعلي للأداء</p>
              <p className="text-xs text-muted-foreground">سيتم عرض البيانات التفصيلية هنا</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalytics;