import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles, Zap, TrendingUp, Target, Clock } from "lucide-react";

const SmartContentPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-gradient-primary">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            المحتوى الذكي
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          اكتشف قوة الذكاء الاصطناعي في إنشاء المحتوى المتقدم والذكي لجميع منصات التواصل الاجتماعي
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-effect border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">847</p>
                <p className="text-xs text-muted-foreground">محتوى ذكي تم إنشاؤه</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">+89%</p>
                <p className="text-xs text-muted-foreground">تحسن في التفاعل</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/20">
                <Target className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">94%</p>
                <p className="text-xs text-muted-foreground">دقة الاستهداف</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-muted/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted/20">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">2.3 دق</p>
                <p className="text-xs text-muted-foreground">متوسط وقت الإنشاء</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Content Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Content Generator */}
        <Card className="glass-effect border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle>مولد المحتوى الذكي</CardTitle>
            </div>
            <CardDescription>
              إنشاء محتوى متقدم باستخدام أحدث تقنيات الذكاء الاصطناعي
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">مُحسن بالذكاء الاصطناعي</Badge>
                </div>
                <h4 className="font-medium">تحليل الجمهور التلقائي</h4>
                <p className="text-sm text-muted-foreground">
                  يحلل جمهورك تلقائياً لإنشاء محتوى مخصص يناسب اهتماماتهم
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">تحسين تلقائي</Badge>
                </div>
                <h4 className="font-medium">تحسين الكلمات المفتاحية</h4>
                <p className="text-sm text-muted-foreground">
                  يختار أفضل الكلمات المفتاحية لتحسين ظهور المحتوى
                </p>
              </div>
            </div>
            
            <Button className="w-full bg-gradient-primary text-primary-foreground shadow-glow">
              <Zap className="w-4 h-4 mr-2" />
              إنشاء محتوى ذكي
            </Button>
          </CardContent>
        </Card>

        {/* Smart Suggestions */}
        <Card className="glass-effect border-accent/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-accent" />
              <CardTitle>الاقتراحات الذكية</CardTitle>
            </div>
            <CardDescription>
              اقتراحات محسنة بناءً على تحليل البيانات والاتجاهات
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/10">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">اتجاه صاعد</Badge>
                  <span className="text-sm text-secondary font-medium">+34%</span>
                </div>
                <h4 className="font-medium">محتوى الفيديو القصير</h4>
                <p className="text-sm text-muted-foreground">
                  الفيديوهات القصيرة تحقق أعلى معدلات تفاعل هذا الأسبوع
                </p>
              </div>

              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">وقت مثالي</Badge>
                  <span className="text-sm text-primary font-medium">3:30 م</span>
                </div>
                <h4 className="font-medium">أفضل وقت للنشر</h4>
                <p className="text-sm text-muted-foreground">
                  الوقت الأمثل للنشر بناءً على نشاط جمهورك
                </p>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <Target className="w-4 h-4 mr-2" />
              عرض جميع الاقتراحات
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Smart Content */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>المحتوى الذكي الأخير</CardTitle>
          <CardDescription>
            آخر المحتوى المُولد بالذكاء الاصطناعي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-4 p-3 rounded-lg border border-muted/20 hover:bg-muted/5 transition-colors">
                <div className="p-2 rounded-lg bg-gradient-primary">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">محتوى ذكي #{item}</h4>
                  <p className="text-sm text-muted-foreground">
                    تم إنشاؤه منذ {item} ساعات • معدل تفاعل عالي
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">نُشر</Badge>
                  <Button variant="ghost" size="sm">
                    عرض
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartContentPage;