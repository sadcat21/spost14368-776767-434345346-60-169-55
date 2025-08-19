import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  AlertTriangle, 
  Key, 
  Facebook, 
  Settings,
  ExternalLink,
  Code,
  Zap
} from "lucide-react";

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'warning';
  action?: string;
  link?: string;
}

interface AutomationSetupGuideProps {
  hasGeminiKey: boolean;
  hasFacebookConnection: boolean;
  hasGeminiImageGeneration: boolean;
}

export const AutomationSetupGuide: React.FC<AutomationSetupGuideProps> = ({
  hasGeminiKey,
  hasFacebookConnection,
  hasGeminiImageGeneration
}) => {
  const setupSteps: SetupStep[] = [
    {
      id: 'gemini',
      title: 'مفتاح Gemini API',
      description: 'مطلوب لتوليد المحتوى النصي والبرومتات والأسئلة التفاعلية',
      status: hasGeminiKey ? 'completed' : 'pending',
      action: hasGeminiKey ? '' : 'أدخل مفتاح Gemini API في الحقل أدناه',
      link: 'https://aistudio.google.com/app/apikey'
    },
    {
      id: 'gemini-image',
      title: 'توليد الصور بـ Gemini',
      description: 'يستخدم Gemini API لتوليد الصور عالية الجودة بنمط جينيوس',
      status: hasGeminiImageGeneration ? 'completed' : 'completed',
      action: 'متوفر عبر Supabase Edge Function',
      link: 'https://aistudio.google.com/'
    },
    {
      id: 'facebook',
      title: 'اتصال فيسبوك',
      description: 'مطلوب للنشر التلقائي على صفحات فيسبوك',
      status: hasFacebookConnection ? 'completed' : 'pending',
      action: hasFacebookConnection ? '' : 'اتصل بصفحة فيسبوك من تبويب "إدارة فيسبوك"'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">مكتمل</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-700">مطلوب إعداد</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">مطلوب</Badge>;
    }
  };

  const completedSteps = setupSteps.filter(step => step.status === 'completed').length;
  const isFullySetup = completedSteps === setupSteps.length;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          دليل الإعداد
          <Badge variant="outline" className="ml-auto">
            {completedSteps}/{setupSteps.length} مكتمل
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* حالة الإعداد العامة */}
        {isFullySetup ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              🎉 تم إعداد النظام بالكامل! يمكنك الآن استخدام الأتمتة الكاملة للنشر على فيسبوك.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-blue-200 bg-blue-50">
            <Zap className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              يحتاج النظام لبعض الإعدادات الإضافية لتشغيل الأتمتة الكاملة.
            </AlertDescription>
          </Alert>
        )}

        {/* خطوات الإعداد */}
        <div className="space-y-3">
          {setupSteps.map((step, index) => (
            <div key={step.id} className={`p-4 rounded-lg border transition-all ${
              step.status === 'completed' ? 'border-green-200 bg-green-50' :
              step.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
              'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border text-sm font-bold">
                  {index + 1}
                </div>
                {getStatusIcon(step.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{step.title}</h3>
                    {getStatusBadge(step.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                  
                  {step.action && (
                    <p className="text-sm font-medium text-blue-600">{step.action}</p>
                  )}
                  
                  {step.link && step.status !== 'completed' && (
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-blue-500 hover:text-blue-700 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      الحصول على المفتاح
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* معلومات إضافية */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Code className="h-4 w-4" />
            معلومات تقنية
          </h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>Gemini API:</strong> يُستخدم لتوليد النصوص والبرومتات والأسئلة التفاعلية والصور</p>
            <p>• <strong>Gemini Image Generation:</strong> يُستخدم لتوليد الصور عالية الجودة بأنماط متنوعة</p>
            <p>• <strong>Facebook Graph API:</strong> يُستخدم للنشر التلقائي وإضافة التعليقات</p>
          </div>
        </div>

        {/* معلومة Gemini */}
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>توليد الصور بـ Gemini:</strong> يتم استخدام Gemini API لتوليد الصور مباشرة عبر Supabase Edge Function بدون الحاجة لمفاتيح إضافية.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};