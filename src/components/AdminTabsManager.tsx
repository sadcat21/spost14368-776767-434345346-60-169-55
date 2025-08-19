import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Palette, Type, Layers, Shapes, Sparkles, Target, Move, Wand2, Brain, Database, Eye } from "lucide-react";
import { toast } from "sonner";

// استيراد المكونات المنظمة الجديدة
import { DesignControls } from "./AdminTabs/DesignControls";
import { TextControls } from "./AdminTabs/TextControls";
import { OverlayControls } from "./AdminTabs/OverlayControls";
import { BackgroundControls } from "./AdminTabs/BackgroundControls";
import { AIFeatures } from "./AdminTabs/AIFeatures";


import { ManagementPanel } from "./AdminTabs/ManagementPanel";
import { SmartContentControls } from "./AdminTabs/SmartContentControls";

import type {
  TextSettings, 
  ColorSettings
} from "./ContentCanvas";
import type { LogoSettings } from "./LogoCustomizer";
import type { FrameSettings } from "./FrameCustomizer";
import type { ShapeMarginSettings } from "./ShapeMarginController";
import type { TextDistributionSettings } from "./TextDistributionController";
import type { ShapeInversionSettings } from "./ShapeInversionController";
import type { SpaceLayoutSettings } from "./SpaceLayoutController";
import type { AdvancedShapeSettings } from "./AdvancedShapeController";
import type { BackgroundEffectsSettings } from "./BackgroundEffectsController";
import type { EnhancedTextSettings } from "./EnhancedTextController";
import type { TextPositionSettings } from "./TextPositionController";
import type { AdvancedBlendingSettings } from "./AdvancedBlendingController";
import type { ImageControlSettings } from "./ImageController";
import type { AdvancedTransparencySettings } from "./AdvancedTransparencyController";
import type { LayerEffect } from "./LayerEffectsSelector";

interface AdminTabsManagerProps {
  // Settings states
  colorSettings: ColorSettings;
  frameSettings: FrameSettings;
  textSettings: TextSettings;
  shapeMarginSettings: ShapeMarginSettings;
  textDistributionSettings: TextDistributionSettings;
  shapeInversionSettings: ShapeInversionSettings;
  advancedShapeSettings: AdvancedShapeSettings;
  spaceLayoutSettings: SpaceLayoutSettings;
  backgroundEffectsSettings: BackgroundEffectsSettings;
  enhancedTextSettings: EnhancedTextSettings;
  textPositionSettings: TextPositionSettings;
  advancedBlendingSettings: AdvancedBlendingSettings;
  imageControlSettings?: ImageControlSettings;
  advancedTransparencySettings: AdvancedTransparencySettings;
  currentLayerEffect?: LayerEffect;
  
  // Update handlers
  setColorSettings: (settings: ColorSettings) => void;
  setFrameSettings: (settings: FrameSettings) => void;
  setTextSettings: (settings: TextSettings) => void;
  setShapeMarginSettings: (settings: ShapeMarginSettings) => void;
  setTextDistributionSettings: (settings: TextDistributionSettings) => void;
  setShapeInversionSettings: (settings: ShapeInversionSettings) => void;
  setAdvancedShapeSettings: (settings: AdvancedShapeSettings) => void;
  setSpaceLayoutSettings: (settings: SpaceLayoutSettings) => void;
  setBackgroundEffectsSettings: (settings: BackgroundEffectsSettings) => void;
  setEnhancedTextSettings: (settings: EnhancedTextSettings) => void;
  setTextPositionSettings: (settings: TextPositionSettings) => void;
  setAdvancedBlendingSettings: (settings: AdvancedBlendingSettings) => void;
  setImageControlSettings?: (settings: ImageControlSettings) => void;
  setAdvancedTransparencySettings: (settings: AdvancedTransparencySettings) => void;
  setCurrentLayerEffect?: (effect: LayerEffect) => void;
  
  // Other props
  currentImageUrl?: string;
  layoutType: 'rectangle' | 'triangle' | 'trapezoid' | 'half-triangle' | 'half-trapezoid' | 'half-circle' | 'half-ellipse';
  triangleDirection: 'up' | 'down' | 'left' | 'right';
  onLayoutChange: (type: 'rectangle' | 'triangle' | 'trapezoid' | 'half-triangle' | 'half-trapezoid' | 'half-circle' | 'half-ellipse') => void;
  onDirectionChange: (direction: 'up' | 'down' | 'left' | 'right') => void;
  smartAnalysisRef: any;
  language: string;
  
  // Gemini integration
  geminiApiKey?: string;
  specialty?: string;
  contentType?: string;
  imageStyle?: string;
  logoSettings?: LogoSettings;
  setLogoSettings?: (settings: LogoSettings) => void;
  overlaySettings?: any;
  
  // Auto prompt generation handlers
  onGeneratePrompt?: (prompt: string) => void;
  onGenerateImage?: (prompt: string) => void;
  
  // Content preview props
  text?: string;
  imageUrl?: string;
  originalImageUrl?: string;
  uploadedImageUrl?: string;
  onTextChange?: (newText: string) => void;
  onLoadTemplate?: (template: any) => void;
}

export const AdminTabsManager = ({
  colorSettings,
  frameSettings,
  textSettings,
  shapeMarginSettings,
  textDistributionSettings,
  shapeInversionSettings,
  advancedShapeSettings,
  spaceLayoutSettings,
  backgroundEffectsSettings,
  enhancedTextSettings,
  textPositionSettings,
  advancedBlendingSettings,
  imageControlSettings,
  advancedTransparencySettings,
  currentLayerEffect,
  setColorSettings,
  setFrameSettings,
  setTextSettings,
  setShapeMarginSettings,
  setTextDistributionSettings,
  setShapeInversionSettings,
  setAdvancedShapeSettings,
  setSpaceLayoutSettings,
  setBackgroundEffectsSettings,
  setEnhancedTextSettings,
  setTextPositionSettings,
  setAdvancedBlendingSettings,
  setImageControlSettings,
  setAdvancedTransparencySettings,
  setCurrentLayerEffect,
  currentImageUrl,
  layoutType,
  triangleDirection,
  onLayoutChange,
  onDirectionChange,
  smartAnalysisRef,
  language,
  geminiApiKey,
  specialty,
  contentType,
  imageStyle,
  logoSettings,
  setLogoSettings,
  overlaySettings,
  onGeneratePrompt,
  onGenerateImage,
  text,
  imageUrl,
  originalImageUrl,
  uploadedImageUrl,
  onTextChange,
  onLoadTemplate
}: AdminTabsManagerProps) => {
  console.log('AdminTabsManager rendered - التبويبات الفرعية تم نقلها إلى AISidebar');

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Settings className="h-5 w-5" />
          إعدادات الإدارة المتقدمة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center p-8 space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Settings className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-primary">تم نقل أدوات الإدارة إلى القائمة الجانبية</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            يمكنك الآن الوصول إلى جميع أدوات التصميم والإدارة من خلال القائمة الجانبية في قسم "الإدارة". 
            انقر على قسم الإدارة في القائمة الجانبية لعرض جميع الخيارات المتاحة.
          </p>
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
            <h4 className="font-medium text-primary mb-2">أدوات الإدارة المتاحة:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 text-right">
              <li>• التصميم والأشكال</li>
              <li>• النص والشفافية</li>
              <li>• طبقات الألوان والخلفيات</li>
              <li>• تأثيرات خلفية الصورة</li>
              <li>• أدوات الذكاء الاصطناعي</li>
              <li>• المحتوى الذكي والمعاينة</li>
              <li>• الإدارة العامة والإعدادات</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
