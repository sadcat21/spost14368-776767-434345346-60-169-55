import { AutomatedFacebookPublisher } from "@/components/AutomatedFacebookPublisher";
import { TestCronJobButton } from "@/components/TestCronJobButton";
import { GeminiApiKeyPrompt } from "@/components/GeminiApiKeyPrompt";
import { useGeminiApiKey } from "@/hooks/useGeminiApiKey";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Facebook, Brain, Bot, Eye, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AutomatedPublishingPage() {
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
                🤖 هذا النظام يستخدم الذكاء الاصطناعي لتوليد المحتوى والصور والنشر التلقائي على فيسبوك
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
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-8">
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
              <Zap className="h-12 w-12 animate-pulse" />
              <Facebook className="h-6 w-6 absolute -bottom-1 -right-1 bg-white text-blue-600 rounded-full p-1" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">أتمتة النشر على فيسبوك</h1>
              <p className="text-white/90 mt-1">
                توليد المحتوى والصور والنشر التلقائي بالذكاء الاصطناعي
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center p-4">
            <Bot className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-sm">توليد المحتوى</h3>
            <p className="text-xs text-muted-foreground">نص تسويقي احترافي</p>
          </Card>
          
          <Card className="text-center p-4">
            <Zap className="h-8 w-8 text-secondary mx-auto mb-2" />
            <h3 className="font-semibold text-sm">صور جينيوس</h3>
            <p className="text-xs text-muted-foreground">تصاميم إبداعية مبتكرة</p>
          </Card>
          
          <Card className="text-center p-4">
            <Facebook className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">نشر تلقائي</h3>
            <p className="text-xs text-muted-foreground">مباشرة على فيسبوك</p>
          </Card>
          
          <Card className="text-center p-4">
            <Brain className="h-8 w-8 text-accent mx-auto mb-2" />
            <h3 className="font-semibold text-sm">أسئلة تفاعلية</h3>
            <p className="text-xs text-muted-foreground">تعليقات تزيد المشاركة</p>
          </Card>
        </div>


        {/* Test Cron Job Button */}
        <div className="mb-6">
          <TestCronJobButton />
        </div>

        {/* Main Component */}
        <AutomatedFacebookPublisher />
      </div>
    </div>
  );
}