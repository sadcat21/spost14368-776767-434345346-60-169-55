import { useState } from "react";
import { Layers, Palette, Settings, Image } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedCustomizer } from "../UnifiedCustomizer";
import { OverlayControlsPanel } from "../OverlayControlsPanel";
import { AdvancedBorderControlsPanel } from "../AdvancedBorderControlsPanel";


import type { TextSettings, ColorSettings } from "../ContentCanvas";
import type { LogoSettings } from "../LogoCustomizer";
import type { FrameSettings } from "../FrameCustomizer";
import type { ShapeMarginSettings } from "../ShapeMarginController";
import type { TextDistributionSettings } from "../TextDistributionController";
import type { AdvancedBlendingSettings } from "../AdvancedBlendingController";
import type { TextPositionSettings } from "../TextPositionController";
import type { LayerEffect } from "../LayerEffectsSelector";

interface OverlayControlsProps {
  // Settings
  colorSettings: ColorSettings;
  frameSettings: FrameSettings;
  textSettings: TextSettings;
  shapeMarginSettings: ShapeMarginSettings;
  textDistributionSettings: TextDistributionSettings;
  advancedBlendingSettings: AdvancedBlendingSettings;
  textPositionSettings: TextPositionSettings;
  currentLayerEffect?: LayerEffect;
  
  // Update handlers
  setColorSettings: (settings: ColorSettings) => void;
  setFrameSettings: (settings: FrameSettings) => void;
  setTextSettings: (settings: TextSettings) => void;
  setShapeMarginSettings: (settings: ShapeMarginSettings) => void;
  setTextDistributionSettings: (settings: TextDistributionSettings) => void;
  setAdvancedBlendingSettings: (settings: AdvancedBlendingSettings) => void;
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
}

export const OverlayControls = ({
  colorSettings,
  frameSettings,
  textSettings,
  shapeMarginSettings,
  textDistributionSettings,
  advancedBlendingSettings,
  textPositionSettings,
  currentLayerEffect,
  setColorSettings,
  setFrameSettings,
  setTextSettings,
  setShapeMarginSettings,
  setTextDistributionSettings,
  setAdvancedBlendingSettings,
  setCurrentLayerEffect,
  currentImageUrl,
  layoutType,
  triangleDirection,
  onLayoutChange,
  onDirectionChange,
  smartAnalysisRef,
  geminiApiKey,
  logoSettings,
  overlaySettings
}: OverlayControlsProps) => {
  const [activeSubTab, setActiveSubTab] = useState("background");

  const subTabs = [
    {
      value: "background",
      label: "إعدادات الخلفية",
      icon: Image,
      description: "لون الخلفية الأساسي وإعداداته"
    },
    {
      value: "overlay",
      label: "إعدادات الطبقة العلوية", 
      icon: Layers,
      description: "لون الطبقة العلوية وشفافيتها"
    },
    {
      value: "advanced",
      label: "إعدادات الحدود المتطورة",
      icon: Settings,
      description: "نوع حدود التدرج والحدود الحادة"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Layers className="h-4 w-4" />
              التحكم الموحد في التصميم
            </CardTitle>
            
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              {subTabs.map((tab) => (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value}
                  className="flex flex-col gap-1 h-auto py-3 text-xs"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:block">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* شرح التبويبة الحالية */}
            <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
              <h3 className="font-medium text-primary mb-2">
                {subTabs.find(tab => tab.value === activeSubTab)?.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                {subTabs.find(tab => tab.value === activeSubTab)?.description}
              </p>
            </div>

            <TabsContent value="background" className="space-y-6">
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
            </TabsContent>

            <TabsContent value="overlay" className="space-y-6">
              <OverlayControlsPanel 
                colorSettings={colorSettings}
                onUpdate={setColorSettings}
              />
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <AdvancedBorderControlsPanel 
                colorSettings={colorSettings}
                onUpdate={setColorSettings}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
