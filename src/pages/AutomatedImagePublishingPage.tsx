import { AutomatedImagePublisher } from "@/components/AutomatedImagePublisher";
import { TestCronJobButton } from "@/components/TestCronJobButton";
import { GeminiApiKeyPrompt } from "@/components/GeminiApiKeyPrompt";
import { useGeminiApiKey } from "@/hooks/useGeminiApiKey";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Facebook, Brain, Bot, Eye, ArrowLeft, Image as ImageIcon, Wand2, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AutomatedImagePublishingPage() {
  const { apiKey, hasApiKey, saveApiKey } = useGeminiApiKey();
  const navigate = useNavigate();

  if (!hasApiKey()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center">
              <Brain className="h-6 w-6 text-primary" />
              مطلوب مفتاح Gemini API
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GeminiApiKeyPrompt
              onApiKeySet={saveApiKey}
              currentApiKey={apiKey}
              autoFocus={true}
            />
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                🖼️ هذا النظام يستخدم الذكاء الاصطناعي لتحليل وتعديل الصور والنشر التلقائي على فيسبوك
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة للرئيسية
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Camera className="h-12 w-12 animate-pulse" />
              <Wand2 className="h-6 w-6 absolute -bottom-1 -right-1 bg-white text-purple-600 rounded-full p-1" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">أتمتة تعديل الصور والنشر</h1>
              <p className="text-white/90 mt-1">
                تحليل وتعديل الصور التسويقية بالذكاء الاصطناعي والنشر التلقائي
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="text-center p-4">
            <ImageIcon className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-sm">رفع الصور</h3>
            <p className="text-xs text-muted-foreground">صور أو روابط مباشرة</p>
          </Card>
          
          <Card className="text-center p-4">
            <Eye className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">تحليل الصورة</h3>
            <p className="text-xs text-muted-foreground">فهم المحتوى والتصنيف</p>
          </Card>
          
          <Card className="text-center p-4">
            <Wand2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">تعديل احترافي</h3>
            <p className="text-xs text-muted-foreground">أسلوب تسويقي جذاب</p>
          </Card>
          
          <Card className="text-center p-4">
            <Bot className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">محتوى تسويقي</h3>
            <p className="text-xs text-muted-foreground">نصوص جذابة ومناسبة</p>
          </Card>
          
          <Card className="text-center p-4">
            <Facebook className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">نشر فوري</h3>
            <p className="text-xs text-muted-foreground">مباشرة على فيسبوك</p>
          </Card>
        </div>

        {/* Test Cron Job Button */}
        <div className="mb-6">
          <TestCronJobButton />
        </div>

        {/* Main Component */}
        <AutomatedImagePublisher />
      </div>
    </div>
  );
}