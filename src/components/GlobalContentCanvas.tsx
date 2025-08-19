import React from 'react';
import { useGeneratedContent } from '@/contexts/GeneratedContentContext';
import { useLivePreview } from '@/contexts/LivePreviewContext';
import { ContentCanvas } from './ContentCanvas';
import type { LogoSettings } from './LogoCustomizer';

interface GlobalContentCanvasProps {
  logoSettings?: LogoSettings;
}

/**
 * مكون ContentCanvas عالمي مخفي يعرض المحتوى المولد الحقيقي
 * يستخدم للمعاينة المباشرة العائمة في جميع التبويبات
 */
export const GlobalContentCanvas: React.FC<GlobalContentCanvasProps> = ({ logoSettings }) => {
  const { generatedContent, hasContent } = useGeneratedContent();
  const { previewData } = useLivePreview();

  // عرض محتوى افتراضي إذا لم يكن هناك محتوى مولد
  const displayText = generatedContent?.longText || generatedContent?.shortText || previewData?.text || "مثال على النص للمعاينة المباشرة";
  const displayImage = generatedContent?.imageUrl || generatedContent?.uploadedImageUrl || previewData?.imageUrl || "";

  console.log('GlobalContentCanvas - Rendering with:', {
    hasContent,
    displayText: displayText?.slice(0, 50) + '...',
    displayImage: displayImage?.slice(0, 50) + '...',
    logoSettings,
    sidebarLogoSettings: previewData?.sidebarLogoSettings
  });

  return (
    <div className="fixed -top-[9999px] -left-[9999px] opacity-0 pointer-events-none" data-global-content-canvas="true">
      <ContentCanvas
        text={displayText}
        imageUrl={displayImage}
        textSettings={{
          fontSize: 24,
          fontWeight: "bold",
          textAlign: "center" as const,
          lineHeight: 1.5,
          letterSpacing: 0,
          fontFamily: "Arial",
          textColor: "#000000",
          shadowColor: "#000000",
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0
        }}
        colorSettings={{
          textColor: "#1F2937",
          backgroundColor: "#F8FAFC",
          overlayColor: "#3B82F6",
          overlayOpacity: 50,
          gradientType: "none" as const,
          gradientDirection: "0deg",
          gradientColors: ["#3B82F6", "#1E40AF"],
          gradientStart: "#3B82F6",
          gradientEnd: "#1E40AF",
          useGradient: false,
          borderColor: "#000000",
          borderWidth: 0
        }}
        frameSettings={{
          showFrame: false,
          backgroundColor: "#FFFFFF",
          borderColor: "#000000",
          borderWidth: 0,
          borderRadius: 0,
          padding: 0,
          opacity: 100,
          shadowColor: "#000000",
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          borderStyle: "solid" as const,
          textFrameEnabled: false,
          textFrameBackground: "#FFFFFF",
          textFrameOpacity: 100,
          textFrameBorderColor: "#000000",
          textFrameBorderWidth: 0,
          textFrameBorderRadius: 0,
          textFramePadding: 0,
          textFrameShadowColor: "#000000",
          textFrameShadowBlur: 0,
          textFrameShadowOffsetX: 0,
          textFrameShadowOffsetY: 0,
          textFrameBorderStyle: "solid" as const,
          textFrameBlur: 0,
          textFramePosition: "center" as const,
          textFrameWidth: 100,
          textFrameHeight: 50,
          textAlignment: "center" as const,
          customFrameWidth: 100,
          customFrameHeight: 50,
          textFrameGradientEnabled: false,
          textFrameGradientDirection: 0,
          textFrameGradientStart: "#FFFFFF",
          textFrameGradientEnd: "#F0F0F0",
          textFrameGradientType: "linear" as const,
          textFrameGradientStartOpacity: 100,
          textFrameGradientEndOpacity: 100,
          textFrameGradientStartPosition: 0,
          textFrameGradientEndPosition: 100,
          textFrameGradientStops: 2
        }}
        logoSettings={logoSettings}
        layoutType="triangle"
        triangleDirection="up"
        language="ar"
      />
    </div>
  );
};

export default GlobalContentCanvas;