import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers } from "lucide-react";
import { OverlayControls } from "@/components/AdminTabs/OverlayControls";
import { ContentPreview } from "@/components/ContentPreview";

interface OverlayControlsPageProps {
  copySettings?: {
    livePreview?: boolean;
  };
}

const OverlayControlsPage = ({ copySettings }: OverlayControlsPageProps) => {
  const safeCopySettings = copySettings || { livePreview: true };
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
  
  const defaultFrameSettings = {
    frameType: 'none',
    frameColor: '#000000',
    frameWidth: 2,
    frameOpacity: 100
  } as any;
  
  const defaultTextSettings = {
    fontSize: 24,
    fontFamily: 'Arial',
    textColor: '#000000',
    textAlign: 'center',
    fontWeight: 'normal'
  } as any;
  
  const defaultShapeMarginSettings = {
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0
  } as any;
  
  const defaultTextDistributionSettings = {
    distribution: 'center',
    spacing: 10
  } as any;
  
  const defaultAdvancedBlendingSettings = {
    enabled: false,
    blendMode: 'normal',
    opacity: 100
  } as any;
  
  const defaultTextPositionSettings = {
    x: 50,
    y: 50,
    rotation: 0
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
            <Layers className="h-5 w-5" />
            أدوات طبقات الألوان والخلفيات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
            <h3 className="font-medium text-primary mb-2">طبقات متقدمة ومؤثرات بصرية</h3>
            <p className="text-sm text-muted-foreground">
              تحكم دقيق في طبقات الألوان، الخلفيات، والحدود المتطورة
            </p>
          </div>

          <OverlayControls
            colorSettings={defaultColorSettings}
            frameSettings={defaultFrameSettings}
            textSettings={defaultTextSettings}
            shapeMarginSettings={defaultShapeMarginSettings}
            textDistributionSettings={defaultTextDistributionSettings}
            advancedBlendingSettings={defaultAdvancedBlendingSettings}
            textPositionSettings={defaultTextPositionSettings}
            currentLayerEffect={undefined}
            setColorSettings={() => {}}
            setFrameSettings={() => {}}
            setTextSettings={() => {}}
            setShapeMarginSettings={() => {}}
            setTextDistributionSettings={() => {}}
            setAdvancedBlendingSettings={() => {}}
            setCurrentLayerEffect={() => {}}
            currentImageUrl={undefined}
            layoutType="rectangle"
            triangleDirection="up"
            onLayoutChange={() => {}}
            onDirectionChange={() => {}}
            smartAnalysisRef={null}
            geminiApiKey={undefined}
            logoSettings={defaultLogoSettings}
            overlaySettings={undefined}
          />
        </CardContent>
      </Card>
      
      {/* LivePreview مع إمكانية الإخفاء/الإظهار */}
      {safeCopySettings.livePreview && (
        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="h-4 w-4" />
              معاينة مباشرة - طبقات الألوان والخلفيات
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ContentPreview 
              title="معاينة تحكم الطبقات"
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

export default OverlayControlsPage;