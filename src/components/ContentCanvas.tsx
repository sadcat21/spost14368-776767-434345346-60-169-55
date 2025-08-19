import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Image, Sparkles, Loader2, Eye, EyeOff } from "lucide-react";

import { FrameSettings } from "./FrameCustomizer";
import { ShapeMarginSettings } from "./ShapeMarginController";
import { TextDistributionSettings } from "./TextDistributionController";
import { ShapeInversionSettings } from "./ShapeInversionController";
import { AdvancedShapeSettings } from "./AdvancedShapeController";
import { BackgroundEffectsSettings } from "./BackgroundEffectsController";
import { EnhancedTextSettings } from "./EnhancedTextController";
import { ShapePositionSettings } from "./ShapePositionController";
import { TextPositionSettings } from "./TextPositionController";
  import { AdvancedBlendingSettings } from "./AdvancedBlendingController";
  import { AdvancedTransparencySettings } from "./AdvancedTransparencyController";
  import { VideoPlayer } from "./VideoPlayer";
  import { toast } from "sonner";
  import React from "react";
  import { useLivePreview } from '@/contexts/LivePreviewContext';
  import type { SidebarLogoSettings } from '@/components/SidebarLogoCustomizer';

export interface TextSettings {
  fontSize: number;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  letterSpacing: number;
  fontFamily: string;
  textColor: string;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

export interface ColorSettings {
  textColor: string;
  backgroundColor: string;
  overlayColor: string;
  overlayOpacity: number;
  gradientType: 'none' | 'linear' | 'radial' | 'conic' | 'repeating-linear' | 'repeating-radial' | 'diamond' | 'grid' | 'fade-blend' | 'soft-transition' | 'color-burst' | 'spiral' | 'wave' | 'crystalline' | 'plasma' | 'metallic';
  gradientDirection: string;
  gradientColors: string[];
  gradientStart: string;
  gradientEnd: string;
  useGradient: boolean;
  borderColor: string;
  borderWidth: number;
}

export interface LogoSettings {
  logoUrl: string;
  logoSize: number;
  logoPosition: "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";
  logoOpacity: number;
  showWatermark: boolean;
  watermarkText: string;
  watermarkOpacity: number;
  watermarkPosition: "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";
  // removeBackground: boolean; // Disabled background removal
  
  // موضع مخصص للشعار
  customLogoX: number;
  customLogoY: number;
  useCustomLogoPosition: boolean;
  
  // موضع مخصص للعلامة المائية
  customWatermarkX: number;
  customWatermarkY: number;
  useCustomWatermarkPosition: boolean;
  
  // إعدادات تأطير الشعار المتقدمة
  logoFrameEnabled: boolean;
  logoFrameShape: 'none' | 'circle' | 'square' | 'rectangle' | 'diamond' | 'hexagon' | 'octagon' | 'star' | 'heart' | 'rounded-square' | 'oval' | 'shield' | 'pentagon' | 'trapezoid';
  logoFrameColor: string;
  logoFrameOpacity: number;
  logoFramePadding: number;
  logoFrameBorderWidth: number;
  logoFrameBorderColor: string;
  logoFrameBorderStyle: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  logoFrameBorderOpacity: number;
  logoFrameShadowEnabled: boolean;
  logoFrameShadowColor: string;
  logoFrameShadowBlur: number;
  logoFrameShadowOffsetX: number;
  logoFrameShadowOffsetY: number;
  logoFrameRotation: number;
  logoFrameGradientEnabled: boolean;
  logoFrameGradientStart: string;
  logoFrameGradientEnd: string;
  logoFrameGradientDirection: number;
  
  // تحكم في نسب الأبعاد
  logoFrameCustomDimensions: boolean;
  logoFrameWidth: number;
  logoFrameHeight: number;
  logoFrameAspectRatio: 'square' | 'portrait' | 'landscape' | 'custom';
  
  // إعدادات العلامة المائية المتقدمة
  watermarkFontSize: number;
  watermarkFontFamily: string;
  watermarkFontWeight: string;
  watermarkColor: string;
  watermarkRotation: number;
  watermarkFrameEnabled: boolean;
  watermarkFrameColor: string;
  watermarkFrameOpacity: number;
  watermarkFramePadding: number;
  watermarkFrameRadius: number;
  watermarkFrameBorderWidth: number;
  watermarkFrameBorderColor: string;
  watermarkShadowEnabled: boolean;
  watermarkShadowColor: string;
  watermarkShadowOffsetX: number;
  watermarkShadowOffsetY: number;
  watermarkShadowBlur: number;
  watermarkBlendMode: string;
  watermarkTextTransform: string;
  watermarkLetterSpacing: number;
  watermarkLineHeight: number;
  
  // إعدادات الإطار المتحرك للشعار
  logoFrameAnimationEnabled: boolean;
  logoFrameAnimationType: 'none' | 'pulse' | 'rotate' | 'bounce' | 'float' | 'glow' | 'zoom' | 'shake';
  logoFrameAnimationSpeed: number;
  logoFrameAnimationIntensity: number;
}

interface ContentCanvasProps {
  imageUrl?: string;
  text: string;
  textSettings: TextSettings;
  colorSettings?: ColorSettings;
  logoSettings?: LogoSettings;
  frameSettings?: FrameSettings;
  width?: number;
  height?: number;
  layoutType: 'triangle' | 'rectangle' | 'trapezoid' | 'half-triangle' | 'half-trapezoid' | 'half-circle' | 'half-ellipse' | 'inverted-triangle' | 'parallel-triangle' | 'diamond' | 'hexagon' | 'octagon' | 'star' | 'heart' | 'flower' | 'custom-polygon';
  triangleDirection: 'up' | 'down' | 'left' | 'right';
  shapeMarginSettings?: ShapeMarginSettings;
  textDistributionSettings?: TextDistributionSettings;
  shapeInversionSettings?: ShapeInversionSettings;
  advancedShapeSettings?: AdvancedShapeSettings;
  backgroundEffectsSettings?: BackgroundEffectsSettings;
  enhancedTextSettings?: EnhancedTextSettings;
  shapePositionSettings?: ShapePositionSettings;
  textPositionSettings?: TextPositionSettings;
  advancedBlendingSettings?: AdvancedBlendingSettings;
  advancedTransparencySettings?: AdvancedTransparencySettings;
  onRegenerateImage?: () => void;
  onRegenerateText?: () => void;
  onSmartAnalysis?: () => void;
  language: string;
  isVideo?: boolean;
  videoPageUrl?: string;
  videoThumbnail?: string;
  imageControlSettings?: any;
  isTextVisible?: boolean;
  isBackgroundOnTop?: boolean;
}

export const ContentCanvas = ({
  imageUrl,
  text,
  textSettings,
  colorSettings,
  logoSettings,
  frameSettings,
  width = 800,
  height = 600,
  layoutType,
  triangleDirection,
  shapeMarginSettings,
  textDistributionSettings,
  shapeInversionSettings,
  advancedShapeSettings,
  backgroundEffectsSettings,
  enhancedTextSettings,
  shapePositionSettings,
  textPositionSettings,
  advancedBlendingSettings,
  advancedTransparencySettings,
  onRegenerateImage,
  onRegenerateText,
  onSmartAnalysis,
  language,
  isVideo = false,
  videoPageUrl,
  videoThumbnail,
  imageControlSettings,
  isTextVisible = true,
  isBackgroundOnTop = false
}: ContentCanvasProps) => {
  const [showPreview, setShowPreview] = useState(true);
  const { previewData, updatePreviewData } = useLivePreview();

  // استخدام الشعار الجانبي إذا كان متوفراً، وإلا استخدم الشعار الرئيسي
  const effectiveLogoSettings = previewData.sidebarLogoSettings || logoSettings;
  
  // إضافة console logs لتتبع حالة الشعار الجانبي
  console.log('ContentCanvas - previewData:', previewData);
  console.log('ContentCanvas - sidebarLogoSettings:', previewData.sidebarLogoSettings);
  console.log('ContentCanvas - effectiveLogoSettings:', effectiveLogoSettings);
  console.log('ContentCanvas - logoSettings (main):', logoSettings);

  // تحديث المعاينة المباشرة عند تغيير المحتوى
  React.useEffect(() => {
    console.log('ContentCanvas - تحديث المعاينة المباشرة بالمحتوى الجديد');
    
    // منع التحديث المتكرر بتحقق من التغيير الفعلي
    const newData = {
      text: text || '',
      imageUrl: imageUrl || '',
      textSettings: textSettings,
      colorSettings: colorSettings,
      layoutSettings: {
        layoutType,
        triangleDirection,
        width,
        height
      }
    };
    
    // التحقق من أن البيانات تغيرت فعلاً قبل التحديث
    const hasChanged = JSON.stringify(previewData) !== JSON.stringify(newData);
    
    if (hasChanged) {
      updatePreviewData(newData);
    }
  }, [text, imageUrl, textSettings, colorSettings, layoutType, triangleDirection, width, height, updatePreviewData]);

  // دالة تطبيق التداخل المتقدم
  const getAdvancedBlendingStyle = (): React.CSSProperties => {
    // عدم تطبيق التداخل إذا لم يكن مطلوباً أو لم يكن مفعلاً
    if (!advancedBlendingSettings || !advancedBlendingSettings.applyToOverlays) return {};
    
    const blending = advancedBlendingSettings;
    let style: React.CSSProperties = {};
    
    // تطبيق التأثيرات حسب النوع فقط إذا كان مفعلاً صراحة
    switch (blending.blendType) {
      case 'smooth':
        style.background = `linear-gradient(
          ${blending.gradientStops || 90}deg,
          transparent 0%,
          rgba(0,0,0,${blending.blendIntensity/100 * 0.3}) ${blending.transitionWidth}%,
          rgba(0,0,0,${blending.blendIntensity/100 * 0.3}) ${100-blending.transitionWidth}%,
          transparent 100%
        )`;
        style.filter = `blur(${blending.smoothingRadius}px)`;
        style.mixBlendMode = 'overlay';
        break;
        
      case 'sharp':
        // خط حاد مستقيم - تطبيق تأثير حاد وواضح
        const sharpIntensity = Math.max(blending.blendIntensity/100, 0.6);
        style.background = `linear-gradient(
          90deg,
          transparent 0%,
          transparent ${(50 - blending.transitionWidth/2)}%,
          rgba(255,0,0,${sharpIntensity}) ${50}%,
          transparent ${(50 + blending.transitionWidth/2)}%,
          transparent 100%
        )`;
        style.mixBlendMode = 'difference';
        style.filter = 'contrast(150%)';
        break;
        
      case 'wavy':
        const waveDirection = blending.waveDirection === 'horizontal' ? '90deg' : 
                            blending.waveDirection === 'vertical' ? '0deg' : '45deg';
        style.background = `repeating-linear-gradient(
          ${waveDirection},
          rgba(255,255,255,0.4) 0px,
          rgba(255,255,255,0.4) ${100/blending.waveFrequency}%,
          transparent ${100/blending.waveFrequency}%,
          transparent ${100/blending.waveFrequency + blending.waveAmplitude}%
        )`;
        style.transform = `rotate(${blending.waveOffset}deg)`;
        style.mixBlendMode = 'multiply';
        break;
        
      case 'zigzag':
        const zigzagPath = Array.from({length: blending.zigzagSegments}, (_, i) => {
          const x = (i / blending.zigzagSegments) * 100;
          const y = i % 2 === 0 ? 0 : blending.zigzagHeight;
          return `${x}% ${y}%`;
        }).join(', ');
        style.background = `linear-gradient(45deg, rgba(255,255,255,0.4) 0%, transparent 50%)`;
        style.clipPath = `polygon(${zigzagPath})`;
        style.mixBlendMode = 'hard-light';
        break;
        
      case 'curved':
        style.background = `radial-gradient(ellipse ${blending.curveRadius}% ${blending.curveSmoothing}% at center, rgba(255,255,255,0.4) 0%, transparent 70%)`;
        style.borderRadius = `${blending.curveRadius}% / ${blending.curveSmoothing}%`;
        style.mixBlendMode = 'soft-light';
        break;
        
      case 'organic':
        const organicRadius = `${50 + blending.organicVariation * Math.sin(blending.organicSeed)}% ${50 + blending.organicVariation * Math.cos(blending.organicSeed)}%`;
        style.background = `radial-gradient(ellipse at center, rgba(255,255,255,0.5) 0%, transparent 60%)`;
        style.borderRadius = `${organicRadius} ${organicRadius} ${organicRadius} ${organicRadius}`;
        style.filter = `blur(${blending.organicComplexity}px)`;
        style.mixBlendMode = 'color-dodge';
        break;
        
      case 'spiral':
        const spiralTurns = blending.spiralTurns || 3;
        style.background = `conic-gradient(
          from ${blending.spiralRadius || 0}deg,
          transparent 0deg,
          rgba(255,255,255,0.4) ${360/spiralTurns}deg,
          transparent ${2*(360/spiralTurns)}deg
        )`;
        style.mixBlendMode = 'screen';
        break;
        
      default:
        break;
    }
    
    // تطبيق الشفافية والطبقة
    style.opacity = blending.layerOpacity / 100;
    
    return style;
  };

  // دالة تطبيق التداخل على الطبقة العلوية فقط
  const getOverlayWithBlending = (): React.CSSProperties => {
    
    // التحقق من وجود إعدادات الطبقة العلوية المتقدمة من Gemini
    const overlayGradientSettings = (colorSettings as any)?.overlayGradientSettings;
    
    let baseOverlay: React.CSSProperties = {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: isBackgroundOnTop ? 0 : 1,
    };

    // تطبيق التدرج المتقدم للطبقة العلوية إذا كان متوفراً
    if (overlayGradientSettings?.enabled && colorSettings?.overlayColor?.includes('gradient')) {
      baseOverlay.background = colorSettings.overlayColor;
      baseOverlay.opacity = typeof colorSettings?.overlayOpacity === 'number' && colorSettings.overlayOpacity <= 1 ? 
        colorSettings.overlayOpacity : 
        (colorSettings?.overlayOpacity || 50) / 100;
    } else {
      // الطريقة التقليدية - إزالة الطبقة الافتراضية الضبابية
      baseOverlay.background = colorSettings?.overlayColor && colorSettings.overlayColor !== 'rgba(0, 0, 0, 0.4)' 
        ? colorSettings.overlayColor 
        : 'transparent';
      baseOverlay.opacity = colorSettings?.overlayOpacity && colorSettings.overlayOpacity > 0
        ? (typeof colorSettings.overlayOpacity === 'number' && colorSettings.overlayOpacity <= 1 ? 
          colorSettings.overlayOpacity : 
          (colorSettings.overlayOpacity || 0) / 100)
        : 0;
    }

    // تطبيق التداخل المتقدم فقط على الطبقة العلوية عند استخدام تدرج
    if (advancedBlendingSettings?.applyToOverlays) {
      const blendingStyle = getAdvancedBlendingStyle();
      return { 
        ...baseOverlay, 
        ...blendingStyle,
        // إزالة القيد على الشفافية للسماح بوصولها إلى 100%
        opacity: typeof colorSettings?.overlayOpacity === 'number' && colorSettings.overlayOpacity <= 1 ? 
          colorSettings.overlayOpacity : 
          (colorSettings?.overlayOpacity || 50) / 100
      };
    }

    return baseOverlay;
  };

  const cleanText = text?.replace(/[*#]/g, '') || '';

  // استخدام الإعدادات المتقدمة للنص إذا كانت متوفرة
  const activeTextSettings = enhancedTextSettings || textSettings;
  
  const textStyle: React.CSSProperties = {
    fontSize: `${activeTextSettings.fontSize}px`,
    fontWeight: enhancedTextSettings?.fontWeight || textSettings.fontWeight,
    textAlign: enhancedTextSettings?.textAlign || textSettings.textAlign,
    lineHeight: enhancedTextSettings?.lineHeight || textSettings.lineHeight,
    letterSpacing: `${enhancedTextSettings?.letterSpacing || textSettings.letterSpacing}px`,
    fontFamily: enhancedTextSettings?.fontFamily || textSettings.fontFamily,
    color: enhancedTextSettings?.textColor || textSettings.textColor,
    textShadow: enhancedTextSettings?.shadowEnabled ? 
      `${enhancedTextSettings.shadowOffsetX}px ${enhancedTextSettings.shadowOffsetY}px ${enhancedTextSettings.shadowBlur}px ${enhancedTextSettings.shadowColor}` :
      `${textSettings.shadowOffsetX}px ${textSettings.shadowOffsetY}px ${textSettings.shadowBlur}px ${textSettings.shadowColor}`,
    margin: 0,
    padding: `${frameSettings?.textFramePadding || 10}px`,
    wordWrap: 'break-word',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    
    // تطبيق التأثيرات المتقدمة
    ...(enhancedTextSettings?.highContrastEnabled && {
      background: enhancedTextSettings.contrastBackground,
      border: `${enhancedTextSettings.contrastBorderWidth}px solid ${enhancedTextSettings.contrastBorderColor}`,
    }),
    
    ...(enhancedTextSettings?.textBackgroundEnabled && {
      background: enhancedTextSettings.textBackgroundColor,
      borderRadius: `${enhancedTextSettings.textBackgroundRadius}px`,
      padding: `${enhancedTextSettings.textBackgroundPadding}px`,
    }),
    
    ...(enhancedTextSettings?.outlineEnabled && {
      WebkitTextStroke: `${enhancedTextSettings.outlineWidth}px ${enhancedTextSettings.outlineColor}`,
    }),
    
    ...(enhancedTextSettings?.glowEnabled && {
      filter: `drop-shadow(0 0 ${enhancedTextSettings.glowIntensity}px ${enhancedTextSettings.glowColor})`,
    }),
    
    ...(enhancedTextSettings?.gradientTextEnabled && {
      background: `linear-gradient(${enhancedTextSettings.gradientTextDirection}deg, ${enhancedTextSettings.gradientTextStart}, ${enhancedTextSettings.gradientTextEnd})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }),
    
    opacity: (enhancedTextSettings?.textOpacity || 100) / 100,
    transform: `rotate(${enhancedTextSettings?.textRotation || 0}deg) skew(${enhancedTextSettings?.textSkew || 0}deg)`,
    mixBlendMode: enhancedTextSettings?.blendMode || 'normal',
  };


  // تحديد النسبة بناءً على الأبعاد المحددة
  const getAspectRatio = () => {
    if (width && height) {
      return `${width}/${height}`;
    }
    return '16/9'; // القيمة الافتراضية
  };

  // دالة لحساب خلفية متقدمة مع التدرج
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!colorSettings?.useGradient) {
      return {
        backgroundColor: colorSettings?.backgroundColor || '#1a1a1a',
      };
    }

    const { gradientType, gradientDirection, gradientStart, gradientEnd } = colorSettings;
    const angle = parseInt(gradientDirection?.replace('deg', '') || '135');
    
    let background = '';
    switch (gradientType) {
      case 'linear':
        background = `linear-gradient(${angle}deg, ${gradientStart}, ${gradientEnd})`;
        break;
      case 'radial':
        background = `radial-gradient(circle at center, ${gradientStart}, ${gradientEnd})`;
        break;
      case 'conic':
        background = `conic-gradient(from ${angle}deg at center, ${gradientStart}, ${gradientEnd})`;
        break;
      case 'repeating-linear':
        background = `repeating-linear-gradient(${angle}deg, ${gradientStart} 0, ${gradientEnd} 50px)`;
        break;
      case 'repeating-radial':
        background = `repeating-radial-gradient(circle at center, ${gradientStart} 0, ${gradientEnd} 50px)`;
        break;
      case 'diamond':
        background = `conic-gradient(from ${angle}deg at center, ${gradientStart}, ${gradientEnd} 25%, ${gradientStart} 50%, ${gradientEnd} 75%, ${gradientStart})`;
        break;
      case 'grid':
        background = `repeating-conic-gradient(from ${angle}deg at center, ${gradientStart} 0deg 90deg, ${gradientEnd} 90deg 180deg)`;
        break;
      case 'fade-blend':
        background = `linear-gradient(${angle}deg, ${gradientStart} 0%, transparent 50%, ${gradientEnd} 100%), linear-gradient(${angle + 90}deg, ${gradientEnd} 0%, transparent 50%, ${gradientStart} 100%)`;
        break;
      case 'soft-transition':
        background = `linear-gradient(${angle}deg, ${gradientStart} 0%, ${gradientStart} 30%, ${gradientEnd} 70%, ${gradientEnd} 100%)`;
        break;
      case 'color-burst':
        background = `radial-gradient(circle at 30% 30%, ${gradientStart} 0%, transparent 40%), radial-gradient(circle at 70% 70%, ${gradientEnd} 0%, transparent 40%)`;
        break;
      default:
        background = `linear-gradient(${angle}deg, ${gradientStart}, ${gradientEnd})`;
    }

    return { background };
  };

  const canvasStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: `${Math.min(width || 800, 600)}px`,
    aspectRatio: getAspectRatio(),
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '8px',
    ...getBackgroundStyle(),
    border: `${colorSettings?.borderWidth || 0}px solid ${colorSettings?.borderColor || 'transparent'}`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    margin: '0 auto',
  };

  // أنماط الصورة مع إعدادات التحكم الشامل
  const getImageBackgroundStyle = (): React.CSSProperties => {
    const settings = imageControlSettings || {};
    
    // تحديد موضع الصورة - استخدام shapePositionSettings إذا كان متوفراً
    let positionX = settings.positionX !== undefined ? settings.positionX : 50;
    let positionY = settings.positionY !== undefined ? settings.positionY : 50;
    
    // إعطاء الأولوية لإعدادات موضع الشكل
    if (shapePositionSettings) {
      positionX = shapePositionSettings.positionX;
      positionY = shapePositionSettings.positionY;
    }
    
    // تحديد التحويلات
    const scaleX = settings.flipHorizontal ? -1 : 1;
    const scaleY = settings.flipVertical ? -1 : 1;
    const rotation = settings.rotation || 0;
    const scale = (settings.scale || 100) / 100;
    
    // تحديد الفلاتر
    const filters = [
      `brightness(${settings.brightness || 100}%)`,
      `contrast(${settings.contrast || 100}%)`,
      `saturate(${settings.saturation || 100}%)`,
      `blur(${settings.blur || 0}px)`
    ].join(' ');
    
    let style: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: `${positionX}% ${positionY}%`,
      transform: `scaleX(${scaleX}) scaleY(${scaleY}) rotate(${rotation}deg) scale(${scale})`,
      filter: filters,
      opacity: (settings.opacity || 100) / 100,
      transition: 'all 0.3s ease',
      zIndex: isBackgroundOnTop ? 2 : 0,
    };
    
    // تطبيق القص إذا كان مفعلاً
    if (settings.cropEnabled) {
      const cropX = settings.cropX || 0;
      const cropY = settings.cropY || 0;
      const cropWidth = settings.cropWidth || 100;
      const cropHeight = settings.cropHeight || 100;
      
      style.clipPath = `inset(${cropY}% ${100 - cropX - cropWidth}% ${100 - cropY - cropHeight}% ${cropX}%)`;
    }
    
    // تطبيق الشفافية المتقدمة
    if (settings.advancedOpacityEnabled && settings.opacityShape !== 'none') {
      const shape = settings.opacityShape;
      const centerOpacity = (settings.opacityCenter || 100) / 100;
      const edgeOpacity = (settings.opacityEdge || 0) / 100;
      const centerX = settings.opacityCenterX || 50;
      const centerY = settings.opacityCenterY || 50;
      const radiusX = settings.opacityRadiusX || 50;
      const radiusY = settings.opacityRadiusY || 50;
      const feathering = settings.opacityFeatherAmount || 20;
      const isInverted = settings.opacityInvert || false;
      
      let maskImage = '';
      
      switch (shape) {
        case 'circle':
          maskImage = `radial-gradient(ellipse ${radiusX}% ${radiusY}% at ${centerX}% ${centerY}%, 
            rgba(0,0,0,${isInverted ? edgeOpacity : centerOpacity}) 0%, 
            rgba(0,0,0,${isInverted ? edgeOpacity : centerOpacity}) ${100 - feathering}%, 
            rgba(0,0,0,${isInverted ? centerOpacity : edgeOpacity}) 100%)`;
          break;
        case 'rectangle':
          const rectWidth = radiusX;
          const rectHeight = radiusY;
          maskImage = `linear-gradient(0deg, 
            rgba(0,0,0,${isInverted ? centerOpacity : edgeOpacity}) 0%, 
            rgba(0,0,0,${isInverted ? edgeOpacity : centerOpacity}) ${centerY - rectHeight/2}%, 
            rgba(0,0,0,${isInverted ? edgeOpacity : centerOpacity}) ${centerY + rectHeight/2}%, 
            rgba(0,0,0,${isInverted ? centerOpacity : edgeOpacity}) 100%)`;
          break;
        case 'ellipse':
          maskImage = `radial-gradient(ellipse ${radiusX*1.5}% ${radiusY*0.8}% at ${centerX}% ${centerY}%, 
            rgba(0,0,0,${isInverted ? edgeOpacity : centerOpacity}) 0%, 
            rgba(0,0,0,${isInverted ? edgeOpacity : centerOpacity}) ${100 - feathering}%, 
            rgba(0,0,0,${isInverted ? centerOpacity : edgeOpacity}) 100%)`;
          break;
        case 'diagonal':
          const direction = settings.opacityGradientDirection || 45;
          maskImage = `linear-gradient(${direction}deg, 
            rgba(0,0,0,${isInverted ? centerOpacity : edgeOpacity}) 0%, 
            rgba(0,0,0,${isInverted ? edgeOpacity : centerOpacity}) ${feathering}%, 
            rgba(0,0,0,${isInverted ? edgeOpacity : centerOpacity}) ${100 - feathering}%, 
            rgba(0,0,0,${isInverted ? centerOpacity : edgeOpacity}) 100%)`;
          break;
      }
      
      if (maskImage) {
        style.WebkitMask = maskImage;
        style.mask = maskImage;
      }
    }

    // تطبيق إعدادات الشفافية المتقدمة الجديدة
    if (advancedTransparencySettings?.enabled) {
      console.log('تطبيق إعدادات الشفافية المتقدمة:', advancedTransparencySettings);
      const transparencySettings = advancedTransparencySettings;
      
      // تطبيق الشفافية العامة
      style.opacity = (transparencySettings.opacity || 100) / 100;
      
      // تطبيق نمط المزج
      if (transparencySettings.blendMode && transparencySettings.blendMode !== 'normal') {
        style.mixBlendMode = transparencySettings.blendMode as any;
      }
      
      // تطبيق حدود الشفافية
      if (transparencySettings.borderType && transparencySettings.borderType !== 'sharp') {
        let borderStyle = '';
        const borderWidth = transparencySettings.borderWidth || 2;
        const featherRadius = transparencySettings.featherRadius || 10;
        const edgeHardness = (transparencySettings.edgeHardness || 50) / 100;
        
        switch (transparencySettings.borderType) {
          case 'soft':
            style.WebkitMask = `radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,${edgeHardness}) ${100 - featherRadius}%, rgba(0,0,0,0) 100%)`;
            style.mask = `radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,${edgeHardness}) ${100 - featherRadius}%, rgba(0,0,0,0) 100%)`;
            break;
          case 'feathered':
            style.WebkitMask = `radial-gradient(ellipse, rgba(0,0,0,1) 0%, rgba(0,0,0,${edgeHardness}) ${100 - featherRadius}%, rgba(0,0,0,0) 100%)`;
            style.mask = `radial-gradient(ellipse, rgba(0,0,0,1) 0%, rgba(0,0,0,${edgeHardness}) ${100 - featherRadius}%, rgba(0,0,0,0) 100%)`;
            break;
          case 'gradient':
            const stops = transparencySettings.gradientStops || 3;
            let gradientStops = '';
            for (let i = 0; i <= stops; i++) {
              const pos = (i / stops) * 100;
              const alpha = 1 - (i / stops) * (1 - edgeHardness);
              gradientStops += `rgba(0,0,0,${alpha}) ${pos}%${i < stops ? ', ' : ''}`;
            }
            style.WebkitMask = `radial-gradient(circle, ${gradientStops})`;
            style.mask = `radial-gradient(circle, ${gradientStops})`;
            break;
        }
      }
      
      // تطبيق التوهج الداخلي والخارجي والظل
      let filters = [
        `brightness(${settings.brightness || 100}%)`,
        `contrast(${settings.contrast || 100}%)`,
        `saturate(${settings.saturation || 100}%)`,
        `blur(${settings.blur || 0}px)`
      ];
      
      let boxShadows = [];
      
      // التوهج الداخلي
      if (transparencySettings.innerGlow) {
        const glowColor = transparencySettings.innerGlowColor || '#ffffff';
        const glowSize = transparencySettings.innerGlowSize || 5;
        boxShadows.push(`inset 0 0 ${glowSize}px ${glowColor}`);
      }
      
      // التوهج الخارجي
      if (transparencySettings.outerGlow) {
        const glowColor = transparencySettings.outerGlowColor || '#000000';
        const glowSize = transparencySettings.outerGlowSize || 10;
        boxShadows.push(`0 0 ${glowSize}px ${glowColor}`);
      }
      
      // ظل الحدود
      if (transparencySettings.shadowEnabled) {
        const shadowColor = transparencySettings.shadowColor || '#000000';
        const shadowOffsetX = transparencySettings.shadowOffsetX || 2;
        const shadowOffsetY = transparencySettings.shadowOffsetY || 2;
        const shadowBlur = transparencySettings.shadowBlur || 4;
        const shadowSpread = transparencySettings.shadowSpread || 0;
        boxShadows.push(`${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`);
      }
      
      if (boxShadows.length > 0) {
        style.boxShadow = boxShadows.join(', ');
      }
      
      style.filter = filters.join(' ');
      
      // تطبيق التجسيم (Bevel)
      if (transparencySettings.bevelEnabled) {
        const bevelDepth = transparencySettings.bevelDepth || 3;
        const bevelSize = transparencySettings.bevelSize || 5;
        const bevelAngle = transparencySettings.bevelAngle || 45;
        
        // محاكاة تأثير التجسيم باستخدام multiple box-shadows
        const lightX = Math.cos(bevelAngle * Math.PI / 180) * bevelSize;
        const lightY = Math.sin(bevelAngle * Math.PI / 180) * bevelSize;
        const darkX = -lightX;
        const darkY = -lightY;
        
        const bevelShadows = [
          `${lightX}px ${lightY}px ${bevelSize}px rgba(255,255,255,0.3)`, // الضوء
          `${darkX}px ${darkY}px ${bevelSize}px rgba(0,0,0,0.3)` // الظل
        ];
        
        if (boxShadows.length > 0) {
          style.boxShadow = [...boxShadows, ...bevelShadows].join(', ');
        } else {
          style.boxShadow = bevelShadows.join(', ');
        }
      }
    }
    
    return style;
  };

  // تطبيق إعدادات موضع النص المخصص
  const getTextContainerStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
      background: frameSettings?.textFrameEnabled 
        ? (() => {
            const bg = frameSettings.textFrameBackground;
            if (!bg) return 'transparent';
            
            // إذا كان تدرج (يحتوي على linear-gradient)
            if (bg.includes('linear-gradient')) {
              return bg;
            }
            
            // إذا كان لون rgba
            if (bg.includes('rgba')) {
              return bg;
            }
            
            // إذا كان لون hex، نحوله إلى rgba مع الشفافية
            const opacity = (frameSettings.textFrameOpacity || 40) / 100;
            if (bg.startsWith('#')) {
              const r = parseInt(bg.slice(1, 3), 16);
              const g = parseInt(bg.slice(3, 5), 16);
              const b = parseInt(bg.slice(5, 7), 16);
              return `rgba(${r}, ${g}, ${b}, ${opacity})`;
            }
            
            return bg;
          })()
        : 'transparent',
      borderRadius: `${frameSettings?.textFrameBorderRadius || 0}px`,
      border: frameSettings?.textFrameEnabled 
        ? `${frameSettings.textFrameBorderWidth || 1}px ${frameSettings.textFrameBorderStyle || 'solid'} ${frameSettings.textFrameBorderColor || '#ffffff'}`
        : 'none',
      boxShadow: frameSettings?.textFrameEnabled 
        ? `${frameSettings.textFrameShadowOffsetX || 0}px ${frameSettings.textFrameShadowOffsetY || 2}px ${frameSettings.textFrameShadowBlur || 8}px ${frameSettings.textFrameShadowColor || 'rgba(0, 0, 0, 0.6)'}`
        : 'none',
      backdropFilter: frameSettings?.textFrameEnabled && frameSettings.textFrameBlur 
        ? `blur(${frameSettings.textFrameBlur}px)` 
        : 'none',
    };

    // تطبيق الموضع المخصص إذا كان مفعلاً
    if (textPositionSettings?.useCustomTextPosition) {
      return {
        ...baseStyle,
        left: `${textPositionSettings.customTextX}%`,
        top: `${textPositionSettings.customTextY}%`,
        width: `${textPositionSettings.textWidth}%`,
        height: `${textPositionSettings.textHeight}%`,
        transform: 'translate(-50%, -50%)', // الحفاظ على التوسيط النسبي
      };
    }

    // الموضع الافتراضي مع تطبيق إعدادات الإطار
    return {
      ...baseStyle,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: frameSettings?.textFrameEnabled ? `${frameSettings.textFrameWidth || 80}%` : '90%',
      height: frameSettings?.textFrameEnabled ? `${frameSettings.textFrameHeight || 60}%` : '90%',
    };
  };

  const textContainerStyle = getTextContainerStyle();

  // دالة حساب موضع العنصر
  const getPositionStyle = (position: string, isLogo: boolean = false) => {
    const positions = {
      'top-left': { top: '5%', left: '5%' },
      'top-center': { top: '5%', left: '50%', transform: 'translateX(-50%)' },
      'top-right': { top: '5%', right: '5%' },
      'center-left': { top: '50%', left: '5%', transform: 'translateY(-50%)' },
      'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
      'center-right': { top: '50%', right: '5%', transform: 'translateY(-50%)' },
      'bottom-left': { bottom: '5%', left: '5%' },
      'bottom-center': { bottom: '5%', left: '50%', transform: 'translateX(-50%)' },
      'bottom-right': { bottom: '5%', right: '5%' },
    };
    return positions[position as keyof typeof positions] || positions['top-left'];
  };

  // دالة حساب نمط اللوغو مع جميع التنسيقات
  const getLogoStyle = (): React.CSSProperties => {
    if (!effectiveLogoSettings?.logoUrl) return { display: 'none' };

    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      maxWidth: `${effectiveLogoSettings.logoSize || 100}px`,
      maxHeight: `${effectiveLogoSettings.logoSize || 100}px`,
      opacity: (effectiveLogoSettings.logoOpacity || 100) / 100,
      zIndex: 50,
      objectFit: 'contain',
    };

    // استخدام الموضع المخصص إذا كان مفعلاً
    if (effectiveLogoSettings.useCustomLogoPosition) {
      return {
        ...baseStyle,
        left: `${effectiveLogoSettings.customLogoX}%`,
        top: `${effectiveLogoSettings.customLogoY}%`,
        transform: 'translate(-50%, -50%)',
      };
    }

    // استخدام الموضع المحدد مسبقاً
    return {
      ...baseStyle,
      ...getPositionStyle(effectiveLogoSettings.logoPosition),
    };
  };

  // دالة حساب نمط إطار اللوغو
  const getLogoFrameStyle = (): React.CSSProperties => {
    if (!effectiveLogoSettings?.logoFrameEnabled) return { display: 'none' };

    const frameSize = (effectiveLogoSettings.logoSize || 100) + (effectiveLogoSettings.logoFramePadding || 10) * 2;
    
    let baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: `${frameSize}px`,
      height: `${frameSize}px`,
      zIndex: 9,
      transform: `rotate(${effectiveLogoSettings.logoFrameRotation || 0}deg)`,
    };

    // إضافة اللون والشفافية
    if (effectiveLogoSettings.logoFrameGradientEnabled) {
      baseStyle.background = `linear-gradient(${effectiveLogoSettings.logoFrameGradientDirection}deg, ${effectiveLogoSettings.logoFrameGradientStart}, ${effectiveLogoSettings.logoFrameGradientEnd})`;
    } else {
      baseStyle.backgroundColor = effectiveLogoSettings.logoFrameColor;
    }
    baseStyle.opacity = (effectiveLogoSettings.logoFrameOpacity || 30) / 100;

    // إضافة الحدود
    if (effectiveLogoSettings.logoFrameBorderWidth && effectiveLogoSettings.logoFrameBorderWidth > 0) {
      baseStyle.border = `${effectiveLogoSettings.logoFrameBorderWidth}px ${effectiveLogoSettings.logoFrameBorderStyle} ${effectiveLogoSettings.logoFrameBorderColor}`;
      baseStyle.borderColor = effectiveLogoSettings.logoFrameBorderColor + Math.round(((effectiveLogoSettings.logoFrameBorderOpacity || 100) / 100) * 255).toString(16).padStart(2, '0');
    }

    // إضافة الظل
    if (effectiveLogoSettings.logoFrameShadowEnabled) {
      baseStyle.boxShadow = `${effectiveLogoSettings.logoFrameShadowOffsetX}px ${effectiveLogoSettings.logoFrameShadowOffsetY}px ${effectiveLogoSettings.logoFrameShadowBlur}px ${effectiveLogoSettings.logoFrameShadowColor}`;
    }

    // تطبيق الأشكال
    switch (effectiveLogoSettings.logoFrameShape) {
      case 'circle':
        baseStyle.borderRadius = '50%';
        break;
      case 'rounded-square':
        baseStyle.borderRadius = '15%';
        break;
      case 'diamond':
        baseStyle.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
        break;
      case 'hexagon':
        baseStyle.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
        break;
      case 'pentagon':
        baseStyle.clipPath = 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)';
        break;
      case 'star':
        baseStyle.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
        break;
      case 'heart':
        baseStyle.clipPath = 'path("M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z")';
        break;
      default:
        baseStyle.borderRadius = '0';
    }

    // الموضع
    if (effectiveLogoSettings.useCustomLogoPosition) {
      baseStyle.left = `calc(${effectiveLogoSettings.customLogoX}% - ${frameSize/2}px)`;
      baseStyle.top = `calc(${effectiveLogoSettings.customLogoY}% - ${frameSize/2}px)`;
    } else {
      const position = getPositionStyle(effectiveLogoSettings.logoPosition);
      if ('left' in position) baseStyle.left = `calc(${position.left} - ${frameSize/2}px)`;
      if ('right' in position) baseStyle.right = `calc(${position.right} - ${frameSize/2}px)`;
      if ('top' in position) baseStyle.top = `calc(${position.top} - ${frameSize/2}px)`;
      if ('bottom' in position) baseStyle.bottom = `calc(${position.bottom} - ${frameSize/2}px)`;
    }

    return baseStyle;
  };

  // دالة حساب نمط العلامة المائية مع جميع التنسيقات (فقط للشعار الرئيسي)
  const getWatermarkStyle = (): React.CSSProperties => {
    if (!logoSettings?.showWatermark || !logoSettings?.watermarkText) return { display: 'none' };

    let baseStyle: React.CSSProperties = {
      position: 'absolute',
      color: logoSettings.watermarkColor || '#ffffff',
      fontSize: `${logoSettings.watermarkFontSize || 14}px`,
      fontFamily: logoSettings.watermarkFontFamily || 'Arial',
      fontWeight: logoSettings.watermarkFontWeight || 'normal',
      opacity: (logoSettings.watermarkOpacity || 70) / 100,
      zIndex: 50,
      whiteSpace: 'nowrap',
      transform: `rotate(${logoSettings.watermarkRotation || 0}deg)`,
      letterSpacing: `${logoSettings.watermarkLetterSpacing || 0}px`,
      lineHeight: logoSettings.watermarkLineHeight || 1.2,
      textTransform: logoSettings.watermarkTextTransform as any || 'none',
      mixBlendMode: logoSettings.watermarkBlendMode as any || 'normal',
    };

    // إضافة ظل النص
    if (logoSettings.watermarkShadowEnabled) {
      baseStyle.textShadow = `${logoSettings.watermarkShadowOffsetX}px ${logoSettings.watermarkShadowOffsetY}px ${logoSettings.watermarkShadowBlur}px ${logoSettings.watermarkShadowColor}`;
    }

    // إضافة إطار للعلامة المائية
    if (logoSettings.watermarkFrameEnabled) {
      baseStyle.backgroundColor = logoSettings.watermarkFrameColor;
      baseStyle.padding = `${logoSettings.watermarkFramePadding}px`;
      baseStyle.borderRadius = `${logoSettings.watermarkFrameRadius}px`;
      baseStyle.border = `${logoSettings.watermarkFrameBorderWidth}px solid ${logoSettings.watermarkFrameBorderColor}`;
      baseStyle.backdropFilter = 'blur(5px)';
    }

    // استخدام الموضع المخصص إذا كان مفعلاً
    if (logoSettings.useCustomWatermarkPosition) {
      return {
        ...baseStyle,
        left: `${logoSettings.customWatermarkX}%`,
        top: `${logoSettings.customWatermarkY}%`,
        transform: `translate(-50%, -50%) rotate(${logoSettings.watermarkRotation || 0}deg)`,
      };
    }

    // استخدام الموضع المحدد مسبقاً
    return {
      ...baseStyle,
      ...getPositionStyle(logoSettings.watermarkPosition),
    };
  };

  return (
    <div 
      id="content-canvas"
      style={{
        ...canvasStyle,
        border: '3px solid #ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)',
      }} 
      data-content-canvas="true" 
      className="content-canvas bg-red-50/20 border-red-500"
    >
      {/* Background image layer with transformations */}
      {imageUrl && <div style={getImageBackgroundStyle()} />}
      
      {/* Overlay layer with advanced blending */}
      <div style={getOverlayWithBlending()} />
      
      {/* طبقة التداخل المتقدم المنفصلة - تظهر فقط عند التفعيل الصريح */}
      {advancedBlendingSettings?.applyToOverlays && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1.5,
            ...getAdvancedBlendingStyle()
          }}
        />
      )}
      
      {/* Video player for video content */}
      {isVideo && videoPageUrl && (
        <VideoPlayer
          videoUrl={videoPageUrl}
          videoPageUrl={videoPageUrl}
          thumbnailUrl={videoThumbnail}
        />
      )}

      {/* Logo Frame */}
      {effectiveLogoSettings?.logoFrameEnabled && effectiveLogoSettings?.logoUrl && (
        <div style={getLogoFrameStyle()} />
      )}

      {/* Logo */}
      {effectiveLogoSettings?.logoUrl && (
        <img 
          src={effectiveLogoSettings.logoUrl} 
          alt="Logo" 
          style={getLogoStyle()}
        />
      )}

      {/* Watermark - only for LogoSettings (not SidebarLogoSettings) */}
      {logoSettings?.showWatermark && logoSettings?.watermarkText && (
        <div style={getWatermarkStyle()}>
          {logoSettings.watermarkText}
        </div>
      )}

      {/* Text container */}
      {isTextVisible && (
        <div style={textContainerStyle}>
          <h2 style={textStyle}>
            {cleanText}
          </h2>
        </div>
      )}



      {/* Regenerate Controls */}
      <div className="regenerate-controls absolute top-2 left-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity z-10">
        {onRegenerateImage && (
          <Button size="sm" variant="secondary" onClick={onRegenerateImage} title="إعادة توليد الصورة">
            <Image className="h-3 w-3" />
          </Button>
        )}
        {onRegenerateText && (
          <Button size="sm" variant="secondary" onClick={onRegenerateText} title="إعادة توليد النص">
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};