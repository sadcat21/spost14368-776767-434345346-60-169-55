import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Type, Target, RotateCcw, Frame, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnhancedTextController, EnhancedTextSettings } from "./EnhancedTextController";
import { TextPositionController, TextPositionSettings } from "./TextPositionController";
import { EnhancedTextFrameControls } from "./EnhancedTextFrameControls";
import { AdvancedTextFrameControls } from "./AdvancedTextFrameControls";
import { FrameSettings } from "./FrameCustomizer";
import { ImageController, ImageControlSettings } from "./ImageController";

interface UnifiedTextControllerProps {
  enhancedTextSettings: EnhancedTextSettings;
  textPositionSettings: TextPositionSettings;
  frameSettings: FrameSettings;
  imageControlSettings: ImageControlSettings;
  onEnhancedTextUpdate: (settings: EnhancedTextSettings) => void;
  onTextPositionUpdate: (settings: TextPositionSettings) => void;
  onFrameUpdate: (settings: FrameSettings) => void;
  onImageControlUpdate: (settings: ImageControlSettings) => void;
  imageRotation?: number;
  imageFlipX?: boolean;
  imageFlipY?: boolean;
  onImageRotationChange?: (rotation: number) => void;
  onImageFlipChange?: (flipX: boolean, flipY: boolean) => void;
  language?: string;
}

const defaultEnhancedTextSettings: EnhancedTextSettings = {
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
};

const defaultTextPositionSettings: TextPositionSettings = {
  useCustomTextPosition: true,
  customTextX: 69,
  customTextY: 50,
  textWidth: 58,
  textHeight: 98
};

const defaultFrameSettings: FrameSettings = {
  showFrame: false,
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
  // تدرج خلفية إطار النص
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
};

const defaultImageControlSettings: ImageControlSettings = {
  flipHorizontal: false,
  flipVertical: false,
  rotation: 0,
  positionX: 50,
  positionY: 50,
  scale: 100,
  cropEnabled: false,
  cropX: 0,
  cropY: 0,
  cropWidth: 100,
  cropHeight: 100,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  opacity: 100,
  advancedOpacityEnabled: false,
  opacityShape: 'circle',
  opacityCenter: 100,
  opacityEdge: 0,
  opacityCenterX: 50,
  opacityCenterY: 50,
  opacityRadiusX: 50,
  opacityRadiusY: 50,
  opacityFeatherAmount: 30,
  opacityGradientDirection: 0,
  opacityCustomPattern: 'radial',
  opacityInvert: false
};

export const UnifiedTextController = ({
  enhancedTextSettings,
  textPositionSettings,
  frameSettings,
  imageControlSettings,
  onEnhancedTextUpdate,
  onTextPositionUpdate,
  onFrameUpdate,
  onImageControlUpdate,
  imageRotation = 0,
  imageFlipX = false,
  imageFlipY = false,
  onImageRotationChange,
  onImageFlipChange,
  language = 'ar'
}: UnifiedTextControllerProps) => {
  const [activeTab, setActiveTab] = useState("styling");

  const resetAllToDefaults = () => {
    onEnhancedTextUpdate(defaultEnhancedTextSettings);
    onTextPositionUpdate(defaultTextPositionSettings);
    onFrameUpdate(defaultFrameSettings);
    onImageControlUpdate(defaultImageControlSettings);
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-primary flex items-center gap-2">
          <Type className="h-5 w-5" />
          التحكم الشامل في النص
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetAllToDefaults}
          className="h-8 px-3"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="styling" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              تنسيق النص
            </TabsTrigger>
            <TabsTrigger value="positioning" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              موضع النص
            </TabsTrigger>
            <TabsTrigger value="frame" className="flex items-center gap-2">
              <Frame className="h-4 w-4" />
              إطار النص
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              الصورة
            </TabsTrigger>
          </TabsList>

          {/* شرح التبويبة الحالية */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
            {activeTab === "styling" && (
              <>
                <h3 className="font-medium text-primary mb-2">تنسيق النص المتقدم</h3>
                <p className="text-sm text-muted-foreground">
                  تحكم شامل في خصائص النص، الخطوط، الألوان، التأثيرات البصرية، والظلال
                </p>
              </>
            )}
            {activeTab === "positioning" && (
              <>
                <h3 className="font-medium text-primary mb-2">التحكم في موضع النص</h3>
                <p className="text-sm text-muted-foreground">
                  تحديد موضع النص بدقة على الصورة
                </p>
              </>
            )}
            {activeTab === "frame" && (
              <>
                <h3 className="font-medium text-primary mb-2">إطار النص المتقدم</h3>
                <p className="text-sm text-muted-foreground">
                  تصميم إطار مخصص للنص مع تدرجات ألوان وتأثيرات بصرية متنوعة
                </p>
              </>
            )}
            {activeTab === "image" && (
              <>
                <h3 className="font-medium text-primary mb-2">التحكم الشامل في الصورة</h3>
                <p className="text-sm text-muted-foreground">
                  قلب، تدوير، تحريك، قص الصورة وتطبيق المرشحات والتأثيرات البصرية
                </p>
              </>
            )}
          </div>

          <TabsContent value="styling" className="space-y-6">
            <EnhancedTextController
              settings={enhancedTextSettings}
              onUpdate={onEnhancedTextUpdate}
              language={language}
            />
          </TabsContent>

          <TabsContent value="positioning" className="space-y-6">
            <TextPositionController
              onUpdate={onTextPositionUpdate}
              initialSettings={textPositionSettings}
              frameSettings={frameSettings}
              onFrameUpdate={onFrameUpdate}
              imageRotation={imageRotation}
              imageFlipX={imageFlipX}
              imageFlipY={imageFlipY}
              onImageRotationChange={onImageRotationChange}
              onImageFlipChange={onImageFlipChange}
            />
          </TabsContent>

          <TabsContent value="frame" className="space-y-6">
            <EnhancedTextFrameControls
              frameSettings={frameSettings}
              onUpdate={onFrameUpdate}
            />
            
            <AdvancedTextFrameControls
              frameSettings={frameSettings}
              onUpdate={onFrameUpdate}
            />
          </TabsContent>

          <TabsContent value="image" className="space-y-6">
            <ImageController
              settings={imageControlSettings}
              onUpdate={onImageControlUpdate}
              language={language}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};