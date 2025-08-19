import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Type, Settings, Layout, Target, RotateCcw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorCustomizer } from "./ColorCustomizer";
import { FrameCustomizer } from "./FrameCustomizer";
import { TextCustomizer } from "./TextCustomizer";
import { ShapeMarginController } from "./ShapeMarginController";
import { TextDistributionController } from "./TextDistributionController";
import { AdvancedBlendingController } from "./AdvancedBlendingController";
import { LayerEffectsSelector, LayerEffect } from "./LayerEffectsSelector";
import { GeminiSmartSuggestions } from "./GeminiSmartSuggestions";
import { BackgroundAndImageController, BackgroundImageSettings, ImageProperties, LayoutSpaceSettings } from "./BackgroundAndImageController";
import type { 
  ColorSettings, 
  TextSettings
} from "./ContentCanvas";
import type { LogoSettings } from "./LogoCustomizer";
import type { FrameSettings } from "./FrameCustomizer";
import type { ShapeMarginSettings } from "./ShapeMarginController";
import type { TextDistributionSettings } from "./TextDistributionController";
import type { AdvancedBlendingSettings } from "./AdvancedBlendingController";
import type { TextPositionSettings } from "./TextPositionController";

interface UnifiedCustomizerProps {
  onColorUpdate: (settings: ColorSettings) => void;
  onFrameUpdate: (settings: FrameSettings) => void;
  onTextUpdate: (settings: TextSettings) => void;
  onShapeMarginUpdate: (settings: ShapeMarginSettings) => void;
  onTextDistributionUpdate: (settings: TextDistributionSettings) => void;
  onAdvancedBlendingUpdate: (settings: AdvancedBlendingSettings) => void;
  onLayerEffectUpdate?: (effect: LayerEffect) => void;
  // إضافات المكون الجديد
  onBackgroundImageUpdate?: (settings: BackgroundImageSettings) => void;
  onImagePropertiesUpdate?: (properties: ImageProperties) => void;
  onLayoutSpaceUpdate?: (settings: LayoutSpaceSettings) => void;
  initialColorSettings?: ColorSettings;
  initialFrameSettings?: FrameSettings;
  initialTextSettings?: TextSettings;
  initialShapeMarginSettings?: ShapeMarginSettings;
  initialTextDistributionSettings?: TextDistributionSettings;
  initialAdvancedBlendingSettings?: AdvancedBlendingSettings;
  initialLayerEffect?: LayerEffect;
  // إعدادات المكون الجديد الافتراضية
  initialBackgroundImageSettings?: BackgroundImageSettings;
  initialImageProperties?: ImageProperties;
  initialLayoutSpaceSettings?: LayoutSpaceSettings;
  currentImageUrl?: string;
  layoutType: 'rectangle' | 'triangle' | 'trapezoid' | 'half-triangle' | 'half-trapezoid' | 'half-circle' | 'half-ellipse';
  triangleDirection: 'up' | 'down' | 'left' | 'right';
  onLayoutChange: (type: 'rectangle' | 'triangle' | 'trapezoid' | 'half-triangle' | 'half-trapezoid' | 'half-circle' | 'half-ellipse') => void;
  onDirectionChange: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onSmartAnalysis: any;
  // إضافات Gemini
  geminiApiKey?: string;
  logoSettings?: LogoSettings;
  textPositionSettings?: TextPositionSettings;
  overlaySettings?: any;
  onApplyGeminiOverlaySuggestions?: (suggestions: any) => void;
  onApplyGeminiLogoSuggestions?: (suggestions: Partial<LogoSettings>) => void;
  onApplyGeminiTextSuggestions?: (suggestions: Partial<TextPositionSettings>) => void;
}

const defaultColorSettings: ColorSettings = {
  textColor: '#ffffff',
  backgroundColor: '#1a1a2e',
  overlayColor: 'rgba(0, 0, 0, 0.4)',
  overlayOpacity: 30,
  gradientType: 'none',
  gradientDirection: '135deg',
  gradientColors: ['#667eea', '#764ba2'],
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  useGradient: false,
  borderColor: '#e2e8f0',
  borderWidth: 0,
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

const defaultTextSettings: TextSettings = {
  fontFamily: 'Cairo, sans-serif',
  fontSize: 24,
  fontWeight: '600',
  textAlign: 'center',
  lineHeight: 1.6,
  letterSpacing: 0,
  textColor: '#ffffff',
  shadowColor: 'rgba(0, 0, 0, 0.8)',
  shadowBlur: 4,
  shadowOffsetX: 2,
  shadowOffsetY: 2,
};

const defaultShapeMarginSettings: ShapeMarginSettings = {
  topMargin: 20,
  bottomMargin: 20,
  leftMargin: 20,
  rightMargin: 20,
  uniformMargin: true,
};

const defaultTextDistributionSettings: TextDistributionSettings = {
  horizontalPosition: 50, // في المركز أفقياً
  verticalPosition: 50,   // في المركز عمودياً
  textAreaWidth: 80,
  textAreaHeight: 60,
  autoDistribution: true,
  distributionStrategy: 'center', // تغيير إلى المركز كافتراضي
  innerPadding: 15,
  avoidEdges: true,
  edgeBuffer: 20,
  shapeAware: true,
  dynamicSizing: false,
};

const defaultAdvancedBlendingSettings: AdvancedBlendingSettings = {
  blendType: 'smooth',
  transitionWidth: 20,
  blendIntensity: 50,
  smoothingRadius: 10,
  gradientStops: 5,
  waveFrequency: 5,
  waveAmplitude: 15,
  waveOffset: 0,
  waveType: 'sine',
  waveDirection: 'horizontal',
  zigzagSegments: 8,
  zigzagHeight: 20,
  zigzagPattern: 'sharp',
  zigzagRandomness: 0,
  curveRadius: 50,
  curveDirection: 'inward',
  curveSmoothing: 80,
  curveAsymmetry: 0,
  organicComplexity: 5,
  organicVariation: 30,
  organicSeed: 1,
  organicFlowDirection: 'radial',
  spiralTurns: 3,
  spiralRadius: 40,
  spiralTightness: 50,
  spiralDirection: 'clockwise',
  diamondSize: 30,
  diamondRotation: 45,
  diamondDistortion: 0,
  hexagonSize: 25,
  hexagonOrientation: 'flat',
  hexagonSpacing: 20,
  bubbleCount: 12,
  bubbleSize: 20,
  bubbleVariation: 40,
  bubbleDistribution: 'random',
  lightningBranches: 5,
  lightningIntensity: 70,
  lightningChaos: 30,
  fabricPattern: 'weave',
  fabricDensity: 50,
  fabricRoughness: 25,
  applyToGradients: true,
  applyToOverlays: true,
  applyToBorders: false,
  applyToBackground: true,
  applyToTexts: false,
  applyToShapes: true,
  applyToShadows: false,
  layerBlendMode: 'overlay',
  layerOpacity: 80,
  layerMaskFeather: 15,
  enablePreview: true,
  realTimeUpdate: true,
  animationSpeed: 50,
  enableAnimation: false
};

// الإعدادات الافتراضية للمكون الجديد
const defaultBackgroundImageSettings: BackgroundImageSettings = {
  backgroundType: 'gradient',
  backgroundColor: '#1a1a2e',
  gradientType: 'linear',
  gradientDirection: 135,
  gradientColors: ['#667eea', '#764ba2'],
  patternType: 'geometric',
  patternDensity: 50,
  patternOpacity: 30,
  atmosphericEffect: 'fog',
  atmosphericIntensity: 25,
  atmosphericColor: '#ffffff',
  artisticStyle: 'digital-art',
  artisticBlend: 50,
  lightingEnabled: false,
  lightingType: 'ambient',
  lightIntensity: 50,
  lightColor: '#ffffff',
  lightAngle: 45,
  overlayEnabled: false,
  overlayTexture: 'noise',
  overlayIntensity: 20,
  overlayBlendMode: 'overlay'
};

const defaultImageProperties: ImageProperties = {
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
  hue: 0,
  blur: 0,
  opacity: 100,
  sepia: 0,
  grayscale: 0,
  invert: false,
  imageEffect: 'none',
  vignetteEnabled: false,
  vignetteIntensity: 30,
  advancedOpacityEnabled: false,
  opacityShape: 'circle',
  opacityPattern: 'smooth'
};

const defaultLayoutSpaceSettings: LayoutSpaceSettings = {
  layoutType: 'rectangle',
  marginType: 'uniform',
  topMargin: 20,
  bottomMargin: 20,
  leftMargin: 20,
  rightMargin: 20,
  textDistribution: 'center',
  textFlow: 'standard',
  horizontalAlignment: 'center',
  verticalAlignment: 'center',
  innerPadding: 15,
  elementSpacing: 10,
  lineSpacing: 1.4,
  paragraphSpacing: 20,
  shapeAware: true,
  edgeBuffer: 15,
  flowAroundElements: true,
  adaptiveLayout: true
};

export const UnifiedCustomizer = ({
  onColorUpdate,
  onFrameUpdate,
  onTextUpdate,
  onShapeMarginUpdate,
  onTextDistributionUpdate,
  onAdvancedBlendingUpdate,
  onLayerEffectUpdate,
  // المعالجات الجديدة
  onBackgroundImageUpdate,
  onImagePropertiesUpdate,
  onLayoutSpaceUpdate,
  initialColorSettings = defaultColorSettings,
  initialFrameSettings = defaultFrameSettings,
  initialTextSettings = defaultTextSettings,
  initialShapeMarginSettings = defaultShapeMarginSettings,
  initialTextDistributionSettings = defaultTextDistributionSettings,
  initialAdvancedBlendingSettings = defaultAdvancedBlendingSettings,
  initialLayerEffect,
  // الإعدادات الافتراضية الجديدة
  initialBackgroundImageSettings = defaultBackgroundImageSettings,
  initialImageProperties = defaultImageProperties,
  initialLayoutSpaceSettings = defaultLayoutSpaceSettings,
  currentImageUrl,
  layoutType,
  triangleDirection,
  onLayoutChange,
  onDirectionChange,
  onSmartAnalysis,
  // إضافات Gemini
  geminiApiKey,
  logoSettings,
  textPositionSettings,
  overlaySettings,
  onApplyGeminiOverlaySuggestions,
  onApplyGeminiLogoSuggestions,
  onApplyGeminiTextSuggestions
}: UnifiedCustomizerProps) => {
  const [activeTab, setActiveTab] = useState("colors");

  const [colorSettings, setColorSettings] = useState<ColorSettings>(initialColorSettings);
  const [frameSettings, setFrameSettings] = useState<FrameSettings>(initialFrameSettings);
  const [textSettings, setTextSettings] = useState<TextSettings>(initialTextSettings);
  const [shapeMarginSettings, setShapeMarginSettings] = useState<ShapeMarginSettings>(initialShapeMarginSettings);
  const [textDistributionSettings, setTextDistributionSettings] = useState<TextDistributionSettings>(initialTextDistributionSettings);
  const [advancedBlendingSettings, setAdvancedBlendingSettings] = useState<AdvancedBlendingSettings>(initialAdvancedBlendingSettings);
  const [currentLayerEffect, setCurrentLayerEffect] = useState<LayerEffect | undefined>(initialLayerEffect);
  // الحالات الجديدة
  const [backgroundImageSettings, setBackgroundImageSettings] = useState<BackgroundImageSettings>(initialBackgroundImageSettings);
  const [imageProperties, setImageProperties] = useState<ImageProperties>(initialImageProperties);
  const [layoutSpaceSettings, setLayoutSpaceSettings] = useState<LayoutSpaceSettings>(initialLayoutSpaceSettings);

  const resetColorsToDefaults = () => {
    setColorSettings(defaultColorSettings);
    onColorUpdate(defaultColorSettings);
  };

  const resetFramesToDefaults = () => {
    setFrameSettings(defaultFrameSettings);
    onFrameUpdate(defaultFrameSettings);
  };

  const resetTextToDefaults = () => {
    setTextSettings(defaultTextSettings);
    onTextUpdate(defaultTextSettings);
  };

  const resetLayoutToDefaults = () => {
    setShapeMarginSettings(defaultShapeMarginSettings);
    setTextDistributionSettings(defaultTextDistributionSettings);
    onShapeMarginUpdate(defaultShapeMarginSettings);
    onTextDistributionUpdate(defaultTextDistributionSettings);
  };

  const resetBlendingToDefaults = () => {
    setAdvancedBlendingSettings(defaultAdvancedBlendingSettings);
    onAdvancedBlendingUpdate(defaultAdvancedBlendingSettings);
  };

  const resetBackgroundImageToDefaults = () => {
    setBackgroundImageSettings(defaultBackgroundImageSettings);
    onBackgroundImageUpdate?.(defaultBackgroundImageSettings);
  };

  const resetImagePropertiesToDefaults = () => {
    setImageProperties(defaultImageProperties);
    onImagePropertiesUpdate?.(defaultImageProperties);
  };

  const resetLayoutSpaceToDefaults = () => {
    setLayoutSpaceSettings(defaultLayoutSpaceSettings);
    onLayoutSpaceUpdate?.(defaultLayoutSpaceSettings);
  };

  const resetAllToDefaults = () => {
    resetColorsToDefaults();
    resetFramesToDefaults();
    resetTextToDefaults();
    resetLayoutToDefaults();
    resetBlendingToDefaults();
    resetBackgroundImageToDefaults();
    resetImagePropertiesToDefaults();
    resetLayoutSpaceToDefaults();
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-primary flex items-center gap-2">
          <Settings className="h-5 w-5" />
          التحكم الموحد في التصميم
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
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              التصميم والألوان
            </TabsTrigger>
            <TabsTrigger value="background-image" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              الخلفية والصورة والتخطيط
            </TabsTrigger>
          </TabsList>

          {/* شرح التبويبة الحالية */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
            {activeTab === "colors" && (
              <>
                <h3 className="font-medium text-primary mb-2">التصميم والألوان</h3>
                <p className="text-sm text-muted-foreground">
                  تخصيص الألوان، الخلفيات، والتدرجات للحصول على التصميم المثالي
                </p>
              </>
            )}
            {activeTab === "background-image" && (
              <>
                <h3 className="font-medium text-primary mb-2">الخلفية والصورة والتخطيط</h3>
                <p className="text-sm text-muted-foreground">
                  تحكم شامل في خصائص الخلفية، إعدادات الصورة المتقدمة، وتخطيط المساحة المتطور
                </p>
              </>
            )}
          </div>

          <TabsContent value="colors" className="space-y-6">
            <ColorCustomizer
              onUpdate={onColorUpdate}
              initialSettings={initialColorSettings}
            />
          </TabsContent>

          <TabsContent value="background-image" className="space-y-6">
            <BackgroundAndImageController
              backgroundSettings={backgroundImageSettings}
              imageProperties={imageProperties}
              layoutSettings={layoutSpaceSettings}
              onBackgroundUpdate={(settings) => {
                setBackgroundImageSettings(settings);
                onBackgroundImageUpdate?.(settings);
              }}
              onImageUpdate={(properties) => {
                setImageProperties(properties);
                onImagePropertiesUpdate?.(properties);
              }}
              onLayoutUpdate={(settings) => {
                setLayoutSpaceSettings(settings);
                onLayoutSpaceUpdate?.(settings);
              }}
            />
          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  );
};
