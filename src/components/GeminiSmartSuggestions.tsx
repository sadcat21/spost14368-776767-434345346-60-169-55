import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Target, Type, ImageIcon, Layers, Key } from "lucide-react";
import { toast } from "sonner";
import GeminiReviewManager from './GeminiReviewManager';
import type { LogoSettings } from "./LogoCustomizer";
import type { TextPositionSettings } from "./TextPositionController";
import type { AdvancedBlendingSettings } from "./AdvancedBlendingController";
import type { LayerEffect } from "./LayerEffectsSelector";

interface GeminiSmartSuggestionsProps {
  currentImage?: string;
  geminiApiKey?: string;
  logoSettings?: LogoSettings;
  textPositionSettings?: TextPositionSettings;
  overlaySettings?: any;
  onApplyOverlaySuggestions?: (suggestions: any) => void;
  onApplyLogoSuggestions?: (suggestions: Partial<LogoSettings>) => void;
  onApplyTextSuggestions?: (suggestions: Partial<TextPositionSettings>) => void;
}

interface SmartSuggestion {
  type: 'overlay' | 'logo' | 'text';
  settings: any;
  explanation: string;
  confidence: number;
}

export const GeminiSmartSuggestions: React.FC<GeminiSmartSuggestionsProps> = ({
  currentImage,
  geminiApiKey,
  logoSettings,
  textPositionSettings,
  overlaySettings,
  onApplyOverlaySuggestions,
  onApplyLogoSuggestions,
  onApplyTextSuggestions
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [overlaySuggestions, setOverlaySuggestions] = useState<SmartSuggestion | null>(null);
  const [logoSuggestions, setLogoSuggestions] = useState<SmartSuggestion | null>(null);
  const [textSuggestions, setTextSuggestions] = useState<SmartSuggestion | null>(null);
  const [localGeminiKey, setLocalGeminiKey] = useState(() => {
    return localStorage.getItem("gemini-api-key") || "";
  });

  // تحديث localStorage عند تغيير المفتاح
  const updateGeminiKey = (key: string) => {
    setLocalGeminiKey(key);
    if (key) {
      localStorage.setItem("gemini-api-key", key);
    } else {
      localStorage.removeItem("gemini-api-key");
    }
  };

  // استخدام المفتاح المحلي أو المفتاح المرسل من props
  const activeGeminiKey = geminiApiKey || localGeminiKey;

  // تحويل الصورة إلى base64
  const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  };

  // تحليل الطبقة العلوية
  const analyzeOverlay = async () => {
    if (!currentImage || !activeGeminiKey) {
      toast.error('الصورة أو مفتاح Gemini غير متوفر');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const imageBase64 = await convertImageToBase64(currentImage);
      const imageMimeType = imageBase64.split(';')[0].split(':')[1];
      const imageData = imageBase64.split(',')[1];

      const prompt = `
      أنت خبير في تصميم الطبقات العلوية (overlay). قم بتحليل الصورة المرفقة واقتراح أفضل إعدادات للطبقة العلوية.

      الإعدادات الحالية: ${overlaySettings ? JSON.stringify(overlaySettings, null, 2) : 'لا توجد إعدادات'}

      قم بتحليل:
      - الألوان الرئيسية في الصورة
      - المناطق المناسبة للطبقة العلوية
      - التدرجات المناسبة مع الصورة
      - الشفافية المثلى

      أعطني النتيجة بصيغة JSON:
      {
        "settings": {
          "gradient_type": "linear|radial|conic",
          "first_color": "#hex",
          "first_color_opacity": 0-100,
          "first_color_position": 0-100,
          "second_color": "#hex", 
          "second_color_opacity": 0-100,
          "second_color_position": 0-100,
          "gradient_angle": 0-360,
          "center_x": 0-100,
          "center_y": 0-100,
          "gradient_size": 0-200,
          "global_opacity": 0-100,
          "blend_mode": "normal|overlay|multiply..."
        },
        "explanation": "تفسير تفصيلي لسبب هذه الاختيارات",
        "confidence": 85
      }
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${activeGeminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: imageMimeType,
                    data: imageData
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`خطأ HTTP: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        setOverlaySuggestions({
          type: 'overlay',
          settings: result.settings,
          explanation: result.explanation,
          confidence: result.confidence || 80
        });
        toast.success('تم تحليل الطبقة العلوية بنجاح!');
      }

    } catch (error) {
      console.error('Error analyzing overlay:', error);
      toast.error('حدث خطأ في تحليل الطبقة العلوية');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // تحليل موضع الشعار
  const analyzeLogo = async () => {
    if (!currentImage || !activeGeminiKey) {
      toast.error('الصورة أو مفتاح Gemini غير متوفر');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const imageBase64 = await convertImageToBase64(currentImage);
      const imageMimeType = imageBase64.split(';')[0].split(':')[1];
      const imageData = imageBase64.split(',')[1];

      const logoInfo = logoSettings ? `
      الإعدادات الحالية للشعار:
      - حجم الشعار: ${logoSettings.logoSize}px
      - الموضع: ${logoSettings.logoPosition}
      - الشفافية: ${logoSettings.logoOpacity}%
      - موضع مخصص X: ${logoSettings.customLogoX}%
      - موضع مخصص Y: ${logoSettings.customLogoY}%
      - تأطير: ${logoSettings.logoFrameEnabled ? 'مفعل' : 'معطل'}
      - شكل الإطار: ${logoSettings.logoFrameShape}
      - لون الإطار: ${logoSettings.logoFrameColor}
      - شفافية الإطار: ${logoSettings.logoFrameOpacity}%
      - حشو الإطار: ${logoSettings.logoFramePadding}px
      - سمك الحدود: ${logoSettings.logoFrameBorderWidth}px
      - لون الحدود: ${logoSettings.logoFrameBorderColor}
      - نوع الحدود: ${logoSettings.logoFrameBorderStyle}
      ` : 'لا توجد إعدادات شعار حالية';

      const prompt = `
      أنت خبير في تصميم وموضع الشعارات. قم بتحليل الصورة واقتراح أفضل موضع وإعدادات للشعار.

      ${logoInfo}

      قم بتحليل:
      - أفضل مكان لوضع الشعار دون حجب العناصر المهمة
      - الحجم المناسب للشعار
      - الشفافية المثلى
      - إعدادات التأطير المناسبة
      - المواضع الدقيقة X,Y

      أعطني النتيجة بصيغة JSON:
      {
        "settings": {
          "logoPosition": "top-left|top-center|top-right|center-left|center|center-right|bottom-left|bottom-center|bottom-right",
          "customLogoX": 0-100,
          "customLogoY": 0-100, 
          "useCustomLogoPosition": true/false,
          "logoSize": 30-150,
          "logoOpacity": 10-100,
          "logoFrameEnabled": true/false,
          "logoFrameShape": "none|circle|square|rectangle|diamond|hexagon...",
          "logoFrameColor": "#hex",
          "logoFrameOpacity": 0-100,
          "logoFramePadding": 0-50,
          "logoFrameBorderWidth": 0-10,
          "logoFrameBorderColor": "#hex",
          "logoFrameBorderStyle": "solid|dashed|dotted..."
        },
        "explanation": "تفسير تفصيلي للموضع وإعدادات التأطير المقترحة",
        "confidence": 90
      }
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${activeGeminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: imageMimeType,
                    data: imageData
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`خطأ HTTP: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        setLogoSuggestions({
          type: 'logo',
          settings: result.settings,
          explanation: result.explanation,
          confidence: result.confidence || 80
        });
        toast.success('تم تحليل موضع الشعار بنجاح!');
      }

    } catch (error) {
      console.error('Error analyzing logo:', error);
      toast.error('حدث خطأ في تحليل موضع الشعار');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // تحليل موضع النص
  const analyzeText = async () => {
    if (!currentImage || !activeGeminiKey) {
      toast.error('الصورة أو مفتاح Gemini غير متوفر');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const imageBase64 = await convertImageToBase64(currentImage);
      const imageMimeType = imageBase64.split(';')[0].split(':')[1];
      const imageData = imageBase64.split(',')[1];

      const textInfo = textPositionSettings ? `
      الإعدادات الحالية للنص:
      - موضع مخصص: ${textPositionSettings.useCustomTextPosition ? 'مفعل' : 'معطل'}
      - الموضع الأفقي X: ${textPositionSettings.customTextX}%
      - الموضع العمودي Y: ${textPositionSettings.customTextY}%
      - عرض منطقة النص: ${textPositionSettings.textWidth}%
      - ارتفاع منطقة النص: ${textPositionSettings.textHeight}%
      ` : 'لا توجد إعدادات موضع نص حالية';

      const prompt = `
      أنت خبير في تصميم وموضع النص. قم بتحليل الصورة واقتراح أفضل موضع وأبعاد لمنطقة النص.

      ${textInfo}

      قم بتحليل:
      - أفضل مكان لوضع النص مع أقصى وضوح
      - عرض وارتفاع منطقة النص المناسبة
      - تجنب العناصر المهمة في الصورة
      - المواضع الدقيقة X,Y

       أعطني النتيجة بصيغة JSON:
       {
         "settings": {
           "useCustomTextPosition": true,
           "customTextX": 0-100,
           "customTextY": 0-100,
           "textWidth": 20-200,
           "textHeight": 20-200
         },
         "explanation": "تفسير تفصيلي لموضع النص وأبعاد المنطقة المقترحة",
         "confidence": 88
       }
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${activeGeminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: imageMimeType,
                    data: imageData
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`خطأ HTTP: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        setTextSuggestions({
          type: 'text',
          settings: result.settings,
          explanation: result.explanation,
          confidence: result.confidence || 80
        });
        toast.success('تم تحليل موضع النص بنجاح!');
      }

    } catch (error) {
      console.error('Error analyzing text position:', error);
      toast.error('حدث خطأ في تحليل موضع النص');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // تطبيق اقتراحات الطبقة العلوية
  const applyOverlaySuggestions = () => {
    if (overlaySuggestions && onApplyOverlaySuggestions) {
      onApplyOverlaySuggestions(overlaySuggestions);
      toast.success('تم تطبيق اقتراحات الطبقة العلوية!');
    }
  };

  // تطبيق اقتراحات الشعار
  const applyLogoSuggestions = () => {
    console.log('تطبيق اقتراحات الشعار:', logoSuggestions?.settings);
    console.log('دالة التطبيق متوفرة:', !!onApplyLogoSuggestions);
    
    if (logoSuggestions?.settings && onApplyLogoSuggestions) {
      // تحويل اقتراحات Gemini إلى إعدادات الشعار المناسبة مع إعدادات الموضع الدقيقة
      const logoSuggestionSettings = {
        logoOpacity: logoSuggestions.settings.logoOpacity || 80,
        logoSize: logoSuggestions.settings.logoSize || 60,
        logoPosition: logoSuggestions.settings.logoPosition || 'bottom-right',
        customLogoX: logoSuggestions.settings.customLogoX || 85,
        customLogoY: logoSuggestions.settings.customLogoY || 85,
        useCustomLogoPosition: logoSuggestions.settings.useCustomLogoPosition || true,
        logoFrameEnabled: logoSuggestions.settings.logoFrameEnabled || false,
        logoFrameShape: logoSuggestions.settings.logoFrameShape || 'none',
        logoFrameColor: logoSuggestions.settings.logoFrameColor || '#ffffff',
        logoFrameOpacity: logoSuggestions.settings.logoFrameOpacity || 30,
        logoFramePadding: logoSuggestions.settings.logoFramePadding || 10,
        logoFrameBorderWidth: logoSuggestions.settings.logoFrameBorderWidth || 2,
        logoFrameBorderColor: logoSuggestions.settings.logoFrameBorderColor || '#ffffff',
        logoFrameBorderStyle: logoSuggestions.settings.logoFrameBorderStyle || 'solid'
      };
      
      console.log('إعدادات الشعار المقترحة:', logoSuggestionSettings);
      onApplyLogoSuggestions(logoSuggestionSettings);
      toast.success('تم تطبيق اقتراحات موضع الشعار!');
    } else {
      toast.error('لا توجد اقتراحات للشعار لتطبيقها');
    }
  };

  // تطبيق اقتراحات النص
  const applyTextSuggestions = () => {
    console.log('تطبيق اقتراحات النص:', textSuggestions?.settings);
    console.log('دالة التطبيق متوفرة:', !!onApplyTextSuggestions);
    
    if (textSuggestions?.settings && onApplyTextSuggestions) {
      // تحويل اقتراحات Gemini إلى إعدادات النص المناسبة مع التحكم الدقيق في الموضع
      const textSuggestionSettings = {
        useCustomTextPosition: true, // تأكد من تفعيل الموضع المخصص
        customTextX: textSuggestions.settings.customTextX || 30, // قيمة اختبار واضحة
        customTextY: textSuggestions.settings.customTextY || 20, // قيمة اختبار واضحة
        textWidth: textSuggestions.settings.textWidth || 70, // عرض أصغر للاختبار
        textHeight: textSuggestions.settings.textHeight || 30 // ارتفاع أصغر للاختبار
      };
      
      console.log('إعدادات النص المقترحة:', textSuggestionSettings);
      onApplyTextSuggestions(textSuggestionSettings);
      toast.success(`تم تطبيق موضع النص: X=${textSuggestionSettings.customTextX}%, Y=${textSuggestionSettings.customTextY}%`);
    } else if (!textSuggestions?.settings) {
      // إذا لم توجد اقتراحات، أنشئ قيماً تجريبية للاختبار
      console.log('لا توجد اقتراحات نص، استخدام قيم تجريبية');
      
      if (onApplyTextSuggestions) {
        const testTextSettings = {
          useCustomTextPosition: true,
          customTextX: Math.floor(Math.random() * 60) + 20, // قيمة عشوائية بين 20-80
          customTextY: Math.floor(Math.random() * 60) + 20, // قيمة عشوائية بين 20-80
          textWidth: 70,
          textHeight: 30
        };
        
        console.log('إعدادات النص التجريبية:', testTextSettings);
        onApplyTextSuggestions(testTextSettings);
        toast.success(`تم تطبيق موضع تجريبي للنص: X=${testTextSettings.customTextX}%, Y=${testTextSettings.customTextY}%`);
      } else {
        toast.error('دالة تطبيق اقتراحات النص غير متوفرة');
      }
    } else if (!onApplyTextSuggestions) {
      console.log('دالة تطبيق اقتراحات النص غير متوفرة');
      toast.error('خطأ: دالة تطبيق اقتراحات النص غير متوفرة');
    }
  };

  if (!currentImage) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="text-amber-700 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            اقتراحات Gemini الذكية المتخصصة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-amber-600 text-sm">
            يرجى رفع صورة لاستخدام الاقتراحات الذكية
          </p>
          
          {!activeGeminiKey && (
            <div className="space-y-3">
              <Label htmlFor="gemini-key" className="text-sm font-medium">
                مفتاح Gemini API
              </Label>
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="gemini-key"
                  type="password"
                  placeholder="أدخل مفتاح Gemini API الخاص بك"
                  value={localGeminiKey}
                  onChange={(e) => updateGeminiKey(e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                احصل على مفتاح API من Google AI Studio
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 bg-purple-50/50">
      <CardHeader>
        <CardTitle className="text-purple-700 flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          🎯 اقتراحات Gemini الذكية المتخصصة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* حقل إدخال مفتاح Gemini إذا لم يكن متوفراً */}
        {!activeGeminiKey && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="pt-4 space-y-3">
              <Label htmlFor="gemini-key-main" className="text-sm font-medium text-amber-700">
                مفتاح Gemini API مطلوب للحصول على الاقتراحات
              </Label>
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-amber-600" />
                <Input
                  id="gemini-key-main"
                  type="password"
                  placeholder="أدخل مفتاح Gemini API الخاص بك"
                  value={localGeminiKey}
                  onChange={(e) => updateGeminiKey(e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-amber-600">
                احصل على مفتاح API من Google AI Studio
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* أزرار التحليل المتخصصة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* تحليل الطبقة العلوية */}
          <div className="space-y-3">
            <Button 
              onClick={analyzeOverlay}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              size="sm"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Layers className="h-4 w-4 mr-2" />
              )}
              تحليل الطبقة العلوية
            </Button>
            
            {overlaySuggestions && (
              <div className="p-3 bg-purple-100/50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    ثقة: {overlaySuggestions.confidence}%
                  </Badge>
                </div>
                <p className="text-xs text-purple-700 mb-3">
                  {overlaySuggestions.explanation}
                </p>
                <Button 
                  onClick={applyOverlaySuggestions}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  تطبيق اقتراحات الطبقة العلوية
                </Button>
              </div>
            )}
          </div>

          {/* تحليل موضع الشعار */}
          <div className="space-y-3">
            <Button 
              onClick={analyzeLogo}
              disabled={isAnalyzing || !logoSettings?.logoUrl}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              size="sm"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ImageIcon className="h-4 w-4 mr-2" />
              )}
              تحليل موضع الشعار
            </Button>
            
            {!logoSettings?.logoUrl && (
              <p className="text-xs text-gray-500 text-center">
                يتطلب رفع شعار أولاً
              </p>
            )}
            
            {logoSuggestions && (
              <div className="p-3 bg-green-100/50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    ثقة: {logoSuggestions.confidence}%
                  </Badge>
                </div>
                <p className="text-xs text-green-700 mb-3">
                  {logoSuggestions.explanation}
                </p>
                <Button 
                  onClick={applyLogoSuggestions}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  تطبيق اقتراحات الشعار
                </Button>
              </div>
            )}
          </div>

          {/* تحليل موضع النص */}
          <div className="space-y-3">
            <Button 
              onClick={analyzeText}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              size="sm"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Type className="h-4 w-4 mr-2" />
              )}
              تحليل موضع النص
            </Button>
            
            {textSuggestions && (
              <div className="p-3 bg-blue-100/50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    ثقة: {textSuggestions.confidence}%
                  </Badge>
                </div>
                <p className="text-xs text-blue-700 mb-3">
                  {textSuggestions.explanation}
                </p>
                <Button 
                  onClick={applyTextSuggestions}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  تطبيق اقتراحات النص
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="text-xs text-purple-600 text-center p-3 bg-purple-100/30 rounded-lg border border-purple-200">
          💡 يحلل Gemini كل عنصر بشكل منفصل ويقدم اقتراحات متخصصة لكل جزء من التصميم
        </div>

      </CardContent>
    </Card>
  );
};