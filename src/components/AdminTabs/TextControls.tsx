import { Type, AlignCenter, Move3D } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UnifiedTextController } from "../UnifiedTextController";
import { AdvancedTransparencyController } from "../AdvancedTransparencyController";


import type { EnhancedTextSettings } from "../EnhancedTextController";
import type { TextPositionSettings } from "../TextPositionController";
import type { FrameSettings } from "../FrameCustomizer";
import type { ImageControlSettings } from "../ImageController";
import type { AdvancedTransparencySettings } from "../AdvancedTransparencyController";

interface TextControlsProps {
  // Settings
  enhancedTextSettings: EnhancedTextSettings;
  textPositionSettings: TextPositionSettings;
  frameSettings: FrameSettings;
  imageControlSettings?: ImageControlSettings;
  advancedTransparencySettings: AdvancedTransparencySettings;
  
  // Update handlers
  setEnhancedTextSettings: (settings: EnhancedTextSettings) => void;
  setTextPositionSettings: (settings: TextPositionSettings) => void;
  setFrameSettings: (settings: FrameSettings) => void;
  setImageControlSettings?: (settings: ImageControlSettings) => void;
  setAdvancedTransparencySettings: (settings: AdvancedTransparencySettings) => void;
  
  // Other props
  language: string;
}

export const TextControls = ({
  enhancedTextSettings,
  textPositionSettings,
  frameSettings,
  imageControlSettings,
  advancedTransparencySettings,
  setEnhancedTextSettings,
  setTextPositionSettings,
  setFrameSettings,
  setImageControlSettings,
  setAdvancedTransparencySettings,
  language
}: TextControlsProps) => {
  return (
    <div className="space-y-6">
      {/* قسم التحكم الشامل في النص والموضع */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Type className="h-4 w-4" />
              التحكم الشامل في النص والموضع
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <UnifiedTextController
            enhancedTextSettings={enhancedTextSettings}
            textPositionSettings={textPositionSettings}
            frameSettings={frameSettings}
            imageControlSettings={imageControlSettings || {
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
              opacityShape: 'circle' as const,
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
            }}
            onEnhancedTextUpdate={setEnhancedTextSettings}
            onTextPositionUpdate={setTextPositionSettings}
            onFrameUpdate={setFrameSettings}
            onImageControlUpdate={setImageControlSettings || (() => {})}
            language={language}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* قسم تنسيق النص المتقدم */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Type className="h-4 w-4" />
              تنسيق النص المتقدم
            </CardTitle>
            
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              تحكم شامل في خصائص النص، الخطوط، الألوان، التباعد، والتأثيرات.
            </p>
            <AdvancedTransparencyController
              settings={advancedTransparencySettings}
              onUpdate={setAdvancedTransparencySettings}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
