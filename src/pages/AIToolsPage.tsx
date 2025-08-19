import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Bot, Sparkles, Wand2 } from "lucide-react";
import { AIFeatures } from "@/components/AdminTabs/AIFeatures";
import { useNavigate } from "react-router-dom";

const AIToolsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="shadow-elegant border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Brain className="h-6 w-6" />
            أدوات الذكاء الاصطناعي
            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse ml-2" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
            <h3 className="font-medium text-primary mb-2">منصة شاملة للذكاء الاصطناعي</h3>
            <p className="text-sm text-muted-foreground">
              تحليل الصور واقتراحات التصميم الذكية مع توليد المحتوى المتقدم مدعومة بالذكاء الاصطناعي
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* نظام Gemini المستقل */}
            <Card className="border-2 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">🎨 نظام Gemini المستقل</h3>
                    <p className="text-sm text-muted-foreground">
                      توليد المحتوى والصور باستخدام مفتاحك الشخصي
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• توليد المحتوى النصي المتقدم</p>
                  <p>• إنشاء الصور من الوصف</p>
                  <p>• أسئلة تفاعلية ذكية</p>
                  <p>• يعتمد على مفتاحك الشخصي فقط</p>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  onClick={() => navigate("/gemini-content")}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  استخدم نظام Gemini
                </Button>
              </CardContent>
            </Card>

            {/* مولد الصور الذكي */}
            <Card className="border-2 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Wand2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">🎨 مولد الصور الذكي</h3>
                    <p className="text-sm text-muted-foreground">
                      إنشاء صور عالية الجودة من الوصف
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• توليد متعدد الصور</p>
                  <p>• تعديل الصور الموجودة</p>
                  <p>• أنماط فنية متنوعة</p>
                  <p>• جودة احترافية عالية</p>
                </div>

                <Button 
                  variant="outline"
                  className="w-full border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/20"
                  onClick={() => navigate("/gemini-image")}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  مولد الصور
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
              💡 نصيحة مهمة
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              لاستخدام جميع أدوات الذكاء الاصطناعي، ستحتاج إلى مفتاح Gemini API من Google AI Studio. 
              المفتاح محفوظ محلياً في متصفحك فقط لضمان الأمان الكامل.
            </p>
          </div>

          
        </CardContent>
      </Card>
    </div>
  );
};

export default AIToolsPage;