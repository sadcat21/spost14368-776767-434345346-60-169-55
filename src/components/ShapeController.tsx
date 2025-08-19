
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShapeMarginSettings } from "./ShapeMarginController";
import { TextDistributionSettings } from "./TextDistributionController";
import { ContentCanvas, TextSettings, ColorSettings, LogoSettings } from "./ContentCanvas";
import { FrameSettings } from "./FrameCustomizer";
import { UnifiedCustomizer } from "./UnifiedCustomizer";
import { UnifiedTextController } from "./UnifiedTextController";
import { ShapeInversionSettings } from "./ShapeInversionController";
import { AdvancedShapeSettings } from "./AdvancedShapeController";
import { BackgroundEffectsSettings } from "./BackgroundEffectsController";
import { EnhancedTextSettings } from "./EnhancedTextController";
import { ShapePositionSettings } from "./ShapePositionController";
import { TextPositionSettings } from "./TextPositionController";
import { AdvancedBlendingSettings } from "./AdvancedBlendingController";
import { ImageControlSettings } from "./ImageController";
import { Shapes } from "lucide-react";

interface ShapeControllerProps {
  text: string;
  imageUrl: string;
  dimensions: { width: number; height: number };
  textSettings?: TextSettings;
  colorSettings?: ColorSettings;
  logoSettings?: LogoSettings;
  frameSettings?: FrameSettings;
  layoutType?: 'rectangle' | 'triangle' | 'trapezoid' | 'half-triangle' | 'half-trapezoid' | 'half-circle' | 'half-ellipse';
  triangleDirection?: 'up' | 'down' | 'left' | 'right';
  shapeMarginSettings?: ShapeMarginSettings;
  textDistributionSettings?: TextDistributionSettings;
  shapeInversionSettings?: ShapeInversionSettings;
  advancedShapeSettings?: AdvancedShapeSettings;
  backgroundEffectsSettings?: BackgroundEffectsSettings;
  enhancedTextSettings?: EnhancedTextSettings;
  textPositionSettings?: TextPositionSettings;
  shapePositionSettings?: ShapePositionSettings;
  advancedBlendingSettings?: AdvancedBlendingSettings;
  imageControlSettings?: ImageControlSettings;
  onRegenerateImage?: () => void;
  onRegenerateText?: () => void;
  onSmartAnalysis?: () => void;
  onEnhancedTextUpdate?: (settings: EnhancedTextSettings) => void;
  onTextPositionUpdate?: (settings: TextPositionSettings) => void;
  language: string;
}

export const ShapeController = (props: ShapeControllerProps) => {
  // استخدام الإعدادات الممررة من الخارج أو القيم الافتراضية
  const shapeMarginSettings = props.shapeMarginSettings || {
    topMargin: 20,
    bottomMargin: 20,
    leftMargin: 20,
    rightMargin: 20,
    uniformMargin: true
  };

  const textDistributionSettings = props.textDistributionSettings || {
    horizontalPosition: 50,
    verticalPosition: 50,
    textAreaWidth: 80,
    textAreaHeight: 60,
    autoDistribution: true,
    distributionStrategy: 'optimal',
    innerPadding: 15,
    avoidEdges: true,
    edgeBuffer: 20,
    shapeAware: true,
    dynamicSizing: true,
  };

  const colorSettings = props.colorSettings || {
    textColor: '#ffffff',
    backgroundColor: '#1a1a2e',
    overlayColor: 'rgba(0, 0, 0, 0.4)',
    overlayOpacity: 40,
    gradientType: 'none',
    gradientDirection: '135deg',
    gradientColors: ['#667eea', '#764ba2'],
    gradientStart: '#667eea',
    gradientEnd: '#764ba2',
    useGradient: false,
    borderColor: '#e2e8f0',
    borderWidth: 0,
  };

  const frameSettings = props.frameSettings || {
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

  const textSettings = props.textSettings || {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 1.4,
    letterSpacing: 0,
    fontFamily: 'Cairo',
    textColor: '#ffffff',
    shadowColor: 'rgba(0, 0, 0, 0.7)',
    shadowBlur: 4,
    shadowOffsetX: 2,
    shadowOffsetY: 2
  };

  const [layoutType, setLayoutType] = useState<'rectangle' | 'triangle' | 'trapezoid' | 'half-triangle' | 'half-trapezoid' | 'half-circle' | 'half-ellipse'>(props.layoutType || 'rectangle');
  const [triangleDirection, setTriangleDirection] = useState<'up' | 'down' | 'left' | 'right'>(props.triangleDirection || 'up');

  return (
    <div className="space-y-6">
      {/* Content Canvas */}
      <ContentCanvas
        {...props}
        layoutType={layoutType}
        triangleDirection={triangleDirection}
        shapeMarginSettings={shapeMarginSettings}
        textDistributionSettings={textDistributionSettings}
        shapeInversionSettings={props.shapeInversionSettings}
        advancedShapeSettings={props.advancedShapeSettings}
        backgroundEffectsSettings={props.backgroundEffectsSettings}
        enhancedTextSettings={props.enhancedTextSettings}
        textPositionSettings={props.textPositionSettings}
        shapePositionSettings={props.shapePositionSettings}
        advancedBlendingSettings={props.advancedBlendingSettings}
        imageControlSettings={props.imageControlSettings}
        colorSettings={colorSettings}
        frameSettings={frameSettings}
        textSettings={textSettings}
      />
      
      {/* Unified Text Controller */}
      {props.enhancedTextSettings && props.textPositionSettings && props.frameSettings && props.onEnhancedTextUpdate && props.onTextPositionUpdate && (
        <UnifiedTextController
          enhancedTextSettings={props.enhancedTextSettings}
          textPositionSettings={props.textPositionSettings}
          frameSettings={props.frameSettings}
          imageControlSettings={props.imageControlSettings || {
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
          }}
          onEnhancedTextUpdate={props.onEnhancedTextUpdate}
          onTextPositionUpdate={props.onTextPositionUpdate}
          onFrameUpdate={() => {}} // Placeholder since ShapeController doesn't handle frame updates
          onImageControlUpdate={() => {}} // Placeholder since ShapeController doesn't handle image control updates
          language={props.language}
        />
      )}
    </div>
  );
};
