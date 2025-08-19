import { Layers, Palette, Sparkles, Blend } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UnifiedCustomizer } from "../UnifiedCustomizer";
import { BackgroundEffectsController } from "../BackgroundEffectsController";

import type { TextSettings, ColorSettings } from "../ContentCanvas";
import type { LogoSettings } from "../LogoCustomizer";
import type { FrameSettings } from "../FrameCustomizer";
import type { ShapeMarginSettings } from "../ShapeMarginController";
import type { TextDistributionSettings } from "../TextDistributionController";
import type { AdvancedBlendingSettings } from "../AdvancedBlendingController";
import type { BackgroundEffectsSettings } from "../BackgroundEffectsController";
import type { TextPositionSettings } from "../TextPositionController";
import type { LayerEffect } from "../LayerEffectsSelector";

interface LayerControlsProps {
  // Settings
  colorSettings: ColorSettings;
  frameSettings: FrameSettings;
  textSettings: TextSettings;
  shapeMarginSettings: ShapeMarginSettings;
  textDistributionSettings: TextDistributionSettings;
  advancedBlendingSettings: AdvancedBlendingSettings;
  backgroundEffectsSettings: BackgroundEffectsSettings;
  textPositionSettings: TextPositionSettings;
  currentLayerEffect?: LayerEffect;
  
  // Update handlers
  setColorSettings: (settings: ColorSettings) => void;
  setFrameSettings: (settings: FrameSettings) => void;
  setTextSettings: (settings: TextSettings) => void;
  setShapeMarginSettings: (settings: ShapeMarginSettings) => void;
  setTextDistributionSettings: (settings: TextDistributionSettings) => void;
  setAdvancedBlendingSettings: (settings: AdvancedBlendingSettings) => void;
  setBackgroundEffectsSettings: (settings: BackgroundEffectsSettings) => void;
  setCurrentLayerEffect?: (effect: LayerEffect) => void;
  
  // Other props
  currentImageUrl?: string;
  layoutType: 'rectangle' | 'triangle' | 'trapezoid' | 'half-triangle' | 'half-trapezoid' | 'half-circle' | 'half-ellipse';
  triangleDirection: 'up' | 'down' | 'left' | 'right';
  onLayoutChange: (type: 'rectangle' | 'triangle' | 'trapezoid' | 'half-triangle' | 'half-trapezoid' | 'half-circle' | 'half-ellipse') => void;
  onDirectionChange: (direction: 'up' | 'down' | 'left' | 'right') => void;
  smartAnalysisRef: any;
  geminiApiKey?: string;
  logoSettings?: LogoSettings;
  overlaySettings?: any;
  language: string;
}

export const LayerControls = ({
  colorSettings,
  frameSettings,
  textSettings,
  shapeMarginSettings,
  textDistributionSettings,
  advancedBlendingSettings,
  backgroundEffectsSettings,
  textPositionSettings,
  currentLayerEffect,
  setColorSettings,
  setFrameSettings,
  setTextSettings,
  setShapeMarginSettings,
  setTextDistributionSettings,
  setAdvancedBlendingSettings,
  setBackgroundEffectsSettings,
  setCurrentLayerEffect,
  currentImageUrl,
  layoutType,
  triangleDirection,
  onLayoutChange,
  onDirectionChange,
  smartAnalysisRef,
  geminiApiKey,
  logoSettings,
  overlaySettings,
  language
}: LayerControlsProps) => {
  return (
    <div className="space-y-6">
      {/* قسم الطبقة العلوية والألوان */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Palette className="h-4 w-4" />
            الطبقة العلوية والألوان والإطارات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UnifiedCustomizer 
            onColorUpdate={setColorSettings}
            onFrameUpdate={setFrameSettings}
            onTextUpdate={setTextSettings}
            onShapeMarginUpdate={setShapeMarginSettings}
            onTextDistributionUpdate={setTextDistributionSettings}
            onAdvancedBlendingUpdate={setAdvancedBlendingSettings}
            onLayerEffectUpdate={setCurrentLayerEffect}
            initialColorSettings={colorSettings}
            initialFrameSettings={frameSettings}
            initialTextSettings={textSettings}
            initialShapeMarginSettings={shapeMarginSettings}
            initialTextDistributionSettings={textDistributionSettings}
            initialAdvancedBlendingSettings={advancedBlendingSettings}
            initialLayerEffect={currentLayerEffect}
            currentImageUrl={currentImageUrl}
            layoutType={layoutType}
            triangleDirection={triangleDirection}
            onLayoutChange={onLayoutChange}
            onDirectionChange={onDirectionChange}
            onSmartAnalysis={smartAnalysisRef}
            geminiApiKey={geminiApiKey}
            logoSettings={logoSettings}
            textPositionSettings={textPositionSettings}
            overlaySettings={overlaySettings}
            onApplyGeminiOverlaySuggestions={(suggestions) => {
              if (suggestions.settings) {
                setAdvancedBlendingSettings({...advancedBlendingSettings, ...suggestions.settings});
              }
            }}
            onApplyGeminiLogoSuggestions={(suggestions) => {
              console.log('تطبيق اقتراحات الشعار:', suggestions);
            }}
            onApplyGeminiTextSuggestions={(suggestions) => {
              // معالجة اقتراحات النص
            }}
          />
        </CardContent>
      </Card>

    </div>
  );
};
