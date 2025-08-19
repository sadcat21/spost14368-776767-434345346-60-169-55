import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Type } from "lucide-react";
import { TextControls } from "@/components/AdminTabs/TextControls";
import { ContentPreview } from "@/components/ContentPreview";

interface TextControlsPageProps {
  copySettings?: {
    livePreview?: boolean;
  };
}

const TextControlsPage = ({ copySettings }: TextControlsPageProps) => {
  const safeCopySettings = copySettings || { livePreview: true };
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Type className="h-5 w-5" />
            أدوات النص والشفافية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
            <h3 className="font-medium text-primary mb-2">تحكم شامل في النصوص</h3>
            <p className="text-sm text-muted-foreground">
              تحكم في النص، الموضع، الشفافية، والتأثيرات المتقدمة
            </p>
          </div>

          <div className="grid gap-6">
            <TextControls
              enhancedTextSettings={{
                fontSize: 24,
                fontWeight: '700',
                fontFamily: 'Cairo',
                textAlign: 'center',
                lineHeight: 1.4,
                letterSpacing: 0,
                wordSpacing: 0,
                textColor: '#ffffff',
                shadowEnabled: true,
                shadowColor: 'rgba(0, 0, 0, 0.7)',
                shadowBlur: 4,
                shadowOffsetX: 2,
                shadowOffsetY: 2,
                multiShadowEnabled: false,
                shadowLayers: [
                  { color: 'rgba(0, 0, 0, 0.7)', blur: 4, offsetX: 2, offsetY: 2, spread: 0 },
                  { color: 'rgba(255, 255, 255, 0.3)', blur: 8, offsetX: -1, offsetY: -1, spread: 1 }
                ],
                highContrastEnabled: false,
                contrastBackground: 'rgba(0, 0, 0, 0.8)',
                contrastBorderWidth: 2,
                contrastBorderColor: '#ffffff',
                textBackgroundEnabled: false,
                textBackgroundColor: 'rgba(0, 0, 0, 0.5)',
                textBackgroundOpacity: 50,
                textBackgroundPadding: 15,
                textBackgroundRadius: 8,
                textBackgroundGradient: false,
                textBackgroundGradientStart: '#000000',
                textBackgroundGradientEnd: '#333333',
                outlineEnabled: false,
                outlineColor: '#000000',
                outlineWidth: 1,
                outlineStyle: 'solid',
                outlineGradient: false,
                outlineGradientStart: '#000000',
                outlineGradientEnd: '#666666',
                textPosition: 'center',
                textRotation: 0,
                textSkew: 0,
                textScale: 100,
                textPerspective: 0,
                glowEnabled: false,
                glowColor: '#ffffff',
                glowIntensity: 20,
                innerGlowEnabled: false,
                innerGlowColor: '#ffffff',
                innerGlowIntensity: 10,
                gradientTextEnabled: false,
                gradientTextStart: '#667eea',
                gradientTextEnd: '#764ba2',
                gradientTextDirection: 45,
                gradientTextStops: 2,
                text3DEnabled: false,
                text3DDepth: 5,
                text3DColor: '#333333',
                text3DAngle: 45,
                reflectionEnabled: false,
                reflectionOpacity: 50,
                reflectionBlur: 2,
                reflectionDistance: 0,
                animationEnabled: false,
                animationType: 'none',
                animationDuration: 1000,
                animationDelay: 0,
                textOpacity: 100,
                blendMode: 'normal',
                fontSmoothing: true,
                fontOpticalSizing: false,
                fontVariationSettings: ''
              }}
              setEnhancedTextSettings={() => {}}
              textPositionSettings={{
                useCustomTextPosition: false,
                customTextX: 50,
                customTextY: 50,
                textWidth: 80,
                textHeight: 60
              }}
              setTextPositionSettings={() => {}}
              frameSettings={{
                showFrame: true,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderColor: '#ffffff',
                borderWidth: 2,
                borderRadius: 12,
                padding: 20,
                opacity: 30,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowOffsetY: 4,
                borderStyle: 'solid',
                textFrameEnabled: true,
                textFrameBackground: 'rgba(0, 0, 0, 0.4)',
                textFrameOpacity: 40,
                textFrameBorderColor: '#ffffff',
                textFrameBorderWidth: 1,
                textFrameBorderRadius: 8,
                textFramePadding: 15,
                textFrameShadowColor: 'rgba(0, 0, 0, 0.6)',
                textFrameShadowBlur: 8,
                textFrameShadowOffsetX: 0,
                textFrameShadowOffsetY: 2,
                textFrameBorderStyle: 'solid',
                textFrameBlur: 10,
                textFramePosition: 'center',
                textFrameWidth: 80,
                textFrameHeight: 60,
                textAlignment: 'center',
                customFrameWidth: 90,
                customFrameHeight: 70,
                textFrameGradientEnabled: false,
                textFrameGradientDirection: 45,
                textFrameGradientStart: '#000000',
                textFrameGradientEnd: '#333333',
                textFrameGradientStops: 2,
                textFrameGradientStartOpacity: 40,
                textFrameGradientEndOpacity: 20,
                textFrameGradientStartPosition: 0,
                textFrameGradientEndPosition: 100,
                textFrameGradientType: 'linear'
              }}
              setFrameSettings={() => {}}
              advancedTransparencySettings={{
                enabled: false,
                borderType: 'soft',
                borderWidth: 2,
                featherRadius: 10,
                gradientStops: 3,
                edgeHardness: 50,
                antiAliasing: true,
                blendMode: 'normal',
                opacity: 100,
                innerGlow: false,
                innerGlowColor: '#ffffff',
                innerGlowSize: 5,
                outerGlow: false,
                outerGlowColor: '#000000',
                outerGlowSize: 5,
                bevelEnabled: false,
                bevelDepth: 5,
                bevelSize: 3,
                bevelAngle: 45,
                shadowEnabled: false,
                shadowColor: '#000000',
                shadowOffsetX: 2,
                shadowOffsetY: 2,
                shadowBlur: 5,
                shadowSpread: 0
              }}
              setAdvancedTransparencySettings={() => {}}
              language="ar"
          />
        </div>
      </CardContent>
    </Card>
    
    {/* LivePreview مع إمكانية الإخفاء/الإظهار */}
    {safeCopySettings.livePreview && (
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Type className="h-4 w-4" />
            معاينة مباشرة - النص والشفافية
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ContentPreview 
            title="معاينة تحكم النص"
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

export default TextControlsPage;