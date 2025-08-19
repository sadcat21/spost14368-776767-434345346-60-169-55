import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2 } from "lucide-react";
import { AIFeatures } from "@/components/AdminTabs/AIFeatures";
import { useGeneratedContent } from "@/contexts/GeneratedContentContext";
import { ContentPreview } from "@/components/ContentPreview";

interface AIFeaturesPageProps {
  copySettings?: {
    livePreview?: boolean;
  };
}

const AIFeaturesPage = ({ copySettings }: AIFeaturesPageProps) => {
  const safeCopySettings = copySettings || { livePreview: true };
  // الحصول على المحتوى المولد من Context
  const { generatedContent } = useGeneratedContent();
  
  // إعدادات افتراضية مع القيم المطلوبة
  const defaultColorSettings = {
    overlayColor: "rgba(0, 0, 0, 0.5)",
    overlayOpacity: 50,
    gradientType: 'linear',
    gradientAngle: 45,
    gradientStart: '#000000',
    gradientEnd: '#ffffff',
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 0
  } as any;
  
  const defaultTextPositionSettings = {
    x: 50,
    y: 50,
    rotation: 0
  } as any;
  
  const defaultEnhancedTextSettings = {
    fontSize: 24,
    fontFamily: 'Arial',
    textColor: '#000000',
    textAlign: 'center',
    fontWeight: 'normal'
  } as any;
  
  const defaultAdvancedBlendingSettings = {
    enabled: false,
    blendMode: 'normal',
    opacity: 100
  } as any;
  
  const defaultLogoSettings = {
    logoUrl: '',
    logoSize: 100,
    logoPosition: 'center',
    logoOpacity: 100
  } as any;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Wand2 className="h-5 w-5" />
            أدوات الذكاء الاصطناعي المتقدمة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
            <h3 className="font-medium text-primary mb-2">تحليل واقتراحات ذكية</h3>
            <p className="text-sm text-muted-foreground">
              قوة الذكاء الاصطناعي في تحليل الصور واقتراحات التصميم الذكية
            </p>
            {generatedContent && (
              <div className="mt-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-sm font-medium text-accent mb-1">📄 المحتوى المولد متاح</p>
                <p className="text-xs text-muted-foreground">
                  يمكنك الآن استخدام أدوات الذكاء الاصطناعي لتحليل وتحسين المحتوى المولد
                </p>
                {generatedContent.imageUrl && (
                  <p className="text-xs text-muted-foreground mt-1">
                    🖼️ صورة متاحة للتحليل والمعالجة
                  </p>
                )}
              </div>
            )}
          </div>

          <AIFeatures
            colorSettings={defaultColorSettings}
            logoSettings={defaultLogoSettings}
            textPositionSettings={defaultTextPositionSettings}
            enhancedTextSettings={defaultEnhancedTextSettings}
            advancedBlendingSettings={defaultAdvancedBlendingSettings}
            setColorSettings={() => {}}
            setLogoSettings={() => {}}
            setTextPositionSettings={() => {}}
            setEnhancedTextSettings={() => {}}
            setAdvancedBlendingSettings={() => {}}
            currentImageUrl={generatedContent?.imageUrl || generatedContent?.uploadedImageUrl}
            generatedContent={generatedContent}
            geminiApiKey={undefined}
            specialty="عام"
            contentType="تصميم"
            imageStyle="حديث"
            language="ar"
          />
        </CardContent>
      </Card>
      
      {/* LivePreview مع إمكانية الإخفاء/الإظهار */}
      {safeCopySettings.livePreview && (
        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              معاينة مباشرة - الذكاء الاصطناعي
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ContentPreview 
              title="معاينة ميزات الذكاء الاصطناعي"
              className="w-full h-64"
              compact={true}
              showDeviceToggle={false}
              autoRefresh={true}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIFeaturesPage;