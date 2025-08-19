import { Wand2, Brain, Star, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { GeminiLayerSuggestions } from "../GeminiLayerSuggestions";
import GeminiReviewManager from "../GeminiReviewManager";

import type { GeneratedContent } from "@/contexts/GeneratedContentContext";

import type { ColorSettings } from "../ContentCanvas";
import type { LogoSettings } from "../LogoCustomizer";
import type { TextPositionSettings } from "../TextPositionController";
import type { EnhancedTextSettings } from "../EnhancedTextController";
import type { AdvancedBlendingSettings } from "../AdvancedBlendingController";

interface AIFeaturesProps {
  // Settings
  colorSettings: ColorSettings;
  logoSettings?: LogoSettings;
  textPositionSettings: TextPositionSettings;
  enhancedTextSettings: EnhancedTextSettings;
  advancedBlendingSettings: AdvancedBlendingSettings;
  
  // Update handlers
  setColorSettings: (settings: ColorSettings) => void;
  setLogoSettings?: (settings: LogoSettings) => void;
  setTextPositionSettings: (settings: TextPositionSettings) => void;
  setEnhancedTextSettings: (settings: EnhancedTextSettings) => void;
  setAdvancedBlendingSettings: (settings: AdvancedBlendingSettings) => void;
  
  // Other props
  currentImageUrl?: string;
  generatedContent?: GeneratedContent | null;
  geminiApiKey?: string;
  specialty?: string;
  contentType?: string;
  imageStyle?: string;
  language: string;
}

export const AIFeatures = ({
  colorSettings,
  logoSettings,
  textPositionSettings,
  enhancedTextSettings,
  advancedBlendingSettings,
  setColorSettings,
  setLogoSettings,
  setTextPositionSettings,
  setEnhancedTextSettings,
  setAdvancedBlendingSettings,
  currentImageUrl,
  generatedContent,
  geminiApiKey,
  specialty,
  contentType,
  imageStyle,
  language
}: AIFeaturesProps) => {
  return (
    <div className="space-y-6">
      {/* قسم تحليل وتقييم Gemini */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Brain className="h-4 w-4" />
              تحليل وتقييم التصميم بالذكاء الاصطناعي
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <GeminiReviewManager 
            contentCanvasRef={{ current: document.querySelector('[data-content-canvas="true"]') } as any}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* قسم اقتراحات الطبقة الذكية */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Wand2 className="h-4 w-4" />
              اقتراحات الطبقة الذكية
            </CardTitle>
            
          </div>
        </CardHeader>
        <CardContent>
          <GeminiLayerSuggestions
            currentImage={currentImageUrl}
            overlaySettings={colorSettings}
            geminiApiKey={geminiApiKey}
            logoSettings={logoSettings}
            textPositionSettings={textPositionSettings}
            contentSettings={{
              specialty,
              contentType,
              imageStyle,
              language
            }}
            onApplySuggestions={(suggestions) => {
              console.log('تطبيق اقتراحات Gemini:', suggestions);
              
              // تطبيق اقتراحات Gemini على الطبقة العلوية
              if (suggestions.settings) {
                
                // إنشاء إعدادات الطبقة العلوية المتقدمة
                const overlayGradientSettings = {
                  // تفعيل التدرج للطبقة العلوية
                  enabled: true,
                  type: suggestions.settings.gradient_type || 'linear',
                  
                  // الألوان والشفافية
                  colors: [
                    {
                      color: suggestions.settings.first_color || "#000000",
                      opacity: (suggestions.settings.first_color_opacity || 70) / 100,
                      position: suggestions.settings.first_color_position || 0
                    },
                    {
                      color: suggestions.settings.second_color || "#ffffff", 
                      opacity: (suggestions.settings.second_color_opacity || 30) / 100,
                      position: suggestions.settings.second_color_position || 100
                    }
                  ],
                  
                  // إعدادات التدرج
                  angle: suggestions.settings.gradient_angle || 135,
                  centerX: suggestions.settings.center_x || 50,
                  centerY: suggestions.settings.center_y || 50,
                  size: suggestions.settings.gradient_size || 100,
                  useSharpStops: suggestions.settings.use_sharp_stops || false,
                  
                  // إعدادات المزج
                  blendMode: suggestions.settings.blend_mode || 'normal'
                };
                
                // إنشاء CSS للطبقة العلوية مع التدرج
                let overlayBackground = '';
                const firstColor = overlayGradientSettings.colors[0];
                const secondColor = overlayGradientSettings.colors[1];
                
                if (overlayGradientSettings.type === 'linear') {
                  overlayBackground = `linear-gradient(${overlayGradientSettings.angle}deg, 
                    ${firstColor.color}${Math.round(firstColor.opacity * 255).toString(16).padStart(2, '0')} ${firstColor.position}%, 
                    ${secondColor.color}${Math.round(secondColor.opacity * 255).toString(16).padStart(2, '0')} ${secondColor.position}%)`;
                } else if (overlayGradientSettings.type === 'radial') {
                  overlayBackground = `radial-gradient(ellipse ${overlayGradientSettings.size}% at ${overlayGradientSettings.centerX}% ${overlayGradientSettings.centerY}%, 
                    ${firstColor.color}${Math.round(firstColor.opacity * 255).toString(16).padStart(2, '0')} ${firstColor.position}%, 
                    ${secondColor.color}${Math.round(secondColor.opacity * 255).toString(16).padStart(2, '0')} ${secondColor.position}%)`;
                } else if (overlayGradientSettings.type === 'conic') {
                  overlayBackground = `conic-gradient(from ${overlayGradientSettings.angle}deg at ${overlayGradientSettings.centerX}% ${overlayGradientSettings.centerY}%, 
                    ${firstColor.color}${Math.round(firstColor.opacity * 255).toString(16).padStart(2, '0')} ${firstColor.position}%, 
                    ${secondColor.color}${Math.round(secondColor.opacity * 255).toString(16).padStart(2, '0')} ${secondColor.position}%)`;
                }
                
                const newColorSettings = {
                  ...colorSettings,
                  
                  // تطبيق إعدادات الطبقة العلوية الجديدة
                  overlayColor: overlayBackground || firstColor.color || "#000000",
                  
                  // تطبيق الشفافية العامة
                  overlayOpacity: suggestions.settings.global_opacity !== undefined ? 
                    Math.max(0, Math.min(1, suggestions.settings.global_opacity / 100)) : 0.6,
                  
                  // تطبيق التدرج للطبقة العلوية (تفعيل افتراضي)
                  useGradient: true,
                  gradientType: overlayGradientSettings.type as any,
                  gradientDirection: `${overlayGradientSettings.angle}deg`,
                  gradientStart: firstColor.color,
                  gradientEnd: secondColor.color,
                  gradientColors: [firstColor.color, secondColor.color],
                  
                  // إعدادات إضافية للطبقة العلوية
                  overlayGradientEnabled: true,
                  overlayGradientSettings: overlayGradientSettings
                };
                
                setColorSettings(newColorSettings);
                
                // إجبار إعادة الرسم
                setTimeout(() => {
                  window.dispatchEvent(new Event('resize'));
                }, 100);
              }

              // تطبيق اقتراحات النص واللوغو إذا وُجدت
              if (suggestions.textPlacement && setEnhancedTextSettings) {
                const newTextSettings = {
                  ...enhancedTextSettings,
                  textColor: suggestions.textPlacement.color || enhancedTextSettings?.textColor || "#ffffff"
                };
                console.log('إعدادات النص الجديدة:', newTextSettings);
                setEnhancedTextSettings(newTextSettings);
              }
              
              // إظهار رسالة النجاح
              setTimeout(() => {
                toast.success('تم تطبيق اقتراحات Gemini على الطبقة العلوية مع التدرج المتقدم!');
              }, 200);
            }}
            
            // دوال تطبيق اقتراحات الشعار والنص المتخصصة
            onApplyGeminiLogoSuggestions={(logoSuggestions) => {
              console.log('تطبيق اقتراحات الشعار:', logoSuggestions);
              
              if (logoSuggestions && setLogoSettings) {
                // تطبيق إعدادات الشعار الجديدة مع تحويل القيم المناسبة
                const newLogoSettings = {
                  ...logoSettings,
                  logoOpacity: logoSuggestions.logoOpacity || logoSettings?.logoOpacity || 90,
                  logoSize: logoSuggestions.logoSize || logoSettings?.logoSize || 60,
                  // إضافة المزيد من الإعدادات حسب الحاجة
                  logoPosition: logoSuggestions.logoPosition || logoSettings?.logoPosition || 'bottom-right',
                  customLogoX: logoSuggestions.customLogoX || logoSettings?.customLogoX || 50,
                  customLogoY: logoSuggestions.customLogoY || logoSettings?.customLogoY || 50,
                  useCustomLogoPosition: logoSuggestions.useCustomLogoPosition || false,
                  logoFrameEnabled: logoSuggestions.logoFrameEnabled || logoSettings?.logoFrameEnabled || false,
                  logoFrameShape: logoSuggestions.logoFrameShape || logoSettings?.logoFrameShape || 'none',
                  logoFrameColor: logoSuggestions.logoFrameColor || logoSettings?.logoFrameColor || '#ffffff',
                  logoFrameOpacity: logoSuggestions.logoFrameOpacity || logoSettings?.logoFrameOpacity || 30,
                  logoFramePadding: logoSuggestions.logoFramePadding || logoSettings?.logoFramePadding || 10,
                  logoFrameBorderWidth: logoSuggestions.logoFrameBorderWidth || logoSettings?.logoFrameBorderWidth || 2,
                  logoFrameBorderColor: logoSuggestions.logoFrameBorderColor || logoSettings?.logoFrameBorderColor || '#ffffff',
                  logoFrameBorderStyle: logoSuggestions.logoFrameBorderStyle || logoSettings?.logoFrameBorderStyle || 'solid'
                };
                
                console.log('إعدادات الشعار الجديدة:', newLogoSettings);
                setLogoSettings(newLogoSettings);
                toast.success('تم تطبيق اقتراحات موضع الشعار!');
              } else {
                toast.error('خطأ في تطبيق اقتراحات الشعار');
              }
            }}
            
            onApplyGeminiTextSuggestions={(textSuggestions) => {
              console.log('تطبيق اقتراحات النص:', textSuggestions);
              
              if (textSuggestions && setTextPositionSettings) {
                // تطبيق إعدادات النص الجديدة مع التحكم الدقيق في الموضع
                const newTextPositionSettings = {
                  ...textPositionSettings,
                  useCustomTextPosition: textSuggestions.useCustomTextPosition || true,
                  customTextX: textSuggestions.customTextX || textPositionSettings?.customTextX || 50,
                  customTextY: textSuggestions.customTextY || textPositionSettings?.customTextY || 50,
                  textWidth: textSuggestions.textWidth || textPositionSettings?.textWidth || 80,
                  textHeight: textSuggestions.textHeight || textPositionSettings?.textHeight || 85
                };
                
                console.log('إعدادات النص الجديدة:', newTextPositionSettings);
                console.log('الإعدادات السابقة:', textPositionSettings);
                
                setTextPositionSettings(newTextPositionSettings);
                
                // إجبار إعادة الرسم
                setTimeout(() => {
                  window.dispatchEvent(new Event('resize'));
                  // إجبار إعادة رندر المكونات
                  const canvasElement = document.querySelector('[data-content-canvas="true"]');
                  if (canvasElement) {
                    (canvasElement as any).style.transform = 'scale(1.001)';
                    setTimeout(() => {
                      (canvasElement as any).style.transform = 'scale(1)';
                    }, 10);
                  }
                }, 100);
                
                toast.success('تم تطبيق اقتراحات موضع النص!');
              } else {
                toast.error('خطأ في تطبيق اقتراحات النص');
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};
