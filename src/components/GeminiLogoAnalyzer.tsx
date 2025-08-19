import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Target, Brain, CheckCircle, Info } from "lucide-react";
import { toast } from "sonner";
import type { LogoSettings } from './LogoCustomizer';

interface GeminiLogoAnalyzerProps {
  currentImageUrl?: string;
  logoSettings?: LogoSettings;
  onApplyLogoSuggestions?: (suggestions: Partial<LogoSettings>) => void;
  geminiApiKey?: string;
  specialty?: string;
  contentType?: string;
  imageStyle?: string;
  language?: string;
}

interface LogoAnalysisResult {
  analysis: string;
  logoPlacement: {
    position: string;
    customLogoX: number;
    customLogoY: number;
    logoSize: number;
    logoOpacity: number;
    reasoning: string;
  };
  logoDesign: {
    hasFrame: boolean;
    frameShape: string;
    frameColor: string;
    frameOpacity: number;
    frameThickness: number;
    logoRotation: number;
    logoEffect: string;
    shadowIntensity: number;
    reasoning: string;
  };
  explanation: string;
}

export const GeminiLogoAnalyzer: React.FC<GeminiLogoAnalyzerProps> = ({
  currentImageUrl,
  logoSettings,
  onApplyLogoSuggestions,
  geminiApiKey,
  specialty,
  contentType,
  imageStyle,
  language = 'ar'
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<LogoAnalysisResult | null>(null);

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

  // تحليل موضع الشعار المثالي
  const analyzeLogoPosition = async () => {
    if (!currentImageUrl) {
      toast.error('لا توجد صورة للتحليل');
      return;
    }

    if (!geminiApiKey) {
      toast.error('مفتاح Gemini غير متوفر. يرجى إدخال المفتاح في إعدادات توليد المحتوى');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // تحويل الصورة إلى base64
      const imageBase64 = await convertImageToBase64(currentImageUrl);
      const imageMimeType = imageBase64.split(';')[0].split(':')[1];
      const imageData = imageBase64.split(',')[1];

      // إعداد prompt محسّن لتحليل الشعار الشامل
      const prompt = `
      أنت خبير متخصص في تصميم الجرافيك وتحليل الشعارات. قم بتحليل الصورة المرفقة واقتراح تصميم شامل للشعار يشمل الموضع والإطار والشكل والتأثيرات.

      السياق:
      ${specialty ? `التخصص: ${specialty}` : ''}
      ${contentType ? `نوع المحتوى: ${contentType}` : ''}
      ${imageStyle ? `نمط الصورة: ${imageStyle}` : ''}

      الإعدادات الحالية للشعار:
      ${logoSettings ? JSON.stringify({
        logoSize: logoSettings.logoSize,
        logoPosition: logoSettings.logoPosition,
        logoOpacity: logoSettings.logoOpacity,
        customLogoX: logoSettings.customLogoX,
        customLogoY: logoSettings.customLogoY,
        useCustomLogoPosition: logoSettings.useCustomLogoPosition,
        logoFrameEnabled: logoSettings.logoFrameEnabled,
        logoFrameShape: logoSettings.logoFrameShape,
        logoFrameColor: logoSettings.logoFrameColor,
        logoFrameOpacity: logoSettings.logoFrameOpacity,
        logoFrameBorderWidth: logoSettings.logoFrameBorderWidth,
        logoFrameRotation: logoSettings.logoFrameRotation,
        logoFrameShadowEnabled: logoSettings.logoFrameShadowEnabled,
        logoFrameShadowBlur: logoSettings.logoFrameShadowBlur
      }, null, 2) : 'لا توجد إعدادات حالية'}

      يرجى تحليل الصورة وتقديم تحليل شامل يتضمن:

      1. تحليل الصورة المرئي:
         - العناصر الرئيسية والثانوية في الصورة
         - الألوان السائدة والمهيمنة
         - المناطق الفارغة والمزدحمة بصرياً
         - نقاط التركيز البصري والعقد
         - نمط الإضاءة والظلال
         - التوازن البصري والتكوين العام
         - المساحات المناسبة لوضع الشعار

      2. تحليل موضع الشعار المثالي:
         - أفضل إحداثيات (X, Y) للشعار
         - الحجم الأمثل بناءً على حجم الصورة
         - مستوى الشفافية المناسب
         - المبررات التصميمية لكل قرار

      3. تصميم الإطار والشكل:
         - هل يحتاج الشعار لإطار في هذه الصورة؟
         - أفضل شكل للإطار (دائري، مربع، مستطيل، مخصص)
         - لون الإطار المتناسق مع الصورة
         - سمك الإطار المناسب
         - شفافية الإطار

      4. التأثيرات والتحسينات:
         - زاوية الدوران المناسبة للشعار
         - نوع التأثير المرئي (عادي، ظل، توهج، انعكاس)
         - شدة الظل أو التأثير
         - أي تحسينات إضافية

      5. تحليل البدائل والخيارات:
         - مواضع بديلة مناسبة
         - خيارات تصميم أخرى
         - المقايضات بين الخيارات المختلفة

      قدم النتيجة بصيغة JSON صحيحة وشاملة:
      {
        "analysis": "تحليل مفصل شامل للصورة والعناصر البصرية مع التركيز على كيفية تأثير كل عنصر على موضع وتصميم الشعار",
        "logoPlacement": {
          "position": "وصف تفصيلي للموضع المثالي مع الأسباب",
          "customLogoX": 85,
          "customLogoY": 15,
          "logoSize": 60,
          "logoOpacity": 90,
          "reasoning": "تفسير مفصل لسبب اختيار هذا الموضع والحجم والشفافية"
        },
        "logoDesign": {
          "hasFrame": true,
          "frameShape": "circle",
          "frameColor": "#ffffff",
          "frameOpacity": 80,
          "frameThickness": 3,
          "logoRotation": 0,
          "logoEffect": "shadow",
          "shadowIntensity": 30,
          "reasoning": "تفسير شامل لخيارات التصميم والإطار والتأثيرات المقترحة"
        },
        "explanation": "تفسير شامل يجمع كل الاقتراحات مع ذكر البدائل والمبررات النهائية"
      }

      ملاحظات مهمة للتنفيذ:
      - customLogoX وcustomLogoY: النسب المئوية (0-100)
      - logoSize: بالبكسل (20-200)
      - logoOpacity, frameOpacity, shadowIntensity: النسب المئوية (0-100)
      - frameThickness: سمك الإطار بالبكسل (1-10)
      - logoRotation: زاوية الدوران بالدرجات (-360 إلى 360)
      - frameShape: "circle", "square", "rectangle", "rounded", "custom"
      - logoEffect: "none", "shadow", "glow", "reflection", "blur"
      - frameColor: كود الألوان HEX
      - احرص على التناسق مع ألوان الصورة
      - تجنب حجب العناصر المهمة
      - اهدف للتوازن البصري والجاذبية
      `;

      // إرسال الطلب إلى Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: prompt
                },
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
      
      // محاولة استخراج JSON من النص
      let result;
      try {
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
          
          // التأكد من وجود الحقول المطلوبة
          if (!result.analysis) {
            result.analysis = 'تم تحليل الصورة بنجاح';
          }
          if (!result.logoPlacement) {
            result.logoPlacement = {
              position: 'الموضع المناسب للشعار',
              customLogoX: 85,
              customLogoY: 15,
              logoSize: 60,
              logoOpacity: 90,
              reasoning: 'تم إنتاج إعدادات افتراضية مناسبة'
            };
          }
          if (!result.logoDesign) {
            result.logoDesign = {
              hasFrame: true,
              frameShape: 'circle',
              frameColor: '#ffffff',
              frameOpacity: 80,
              frameThickness: 3,
              logoRotation: 0,
              logoEffect: 'shadow',
              shadowIntensity: 30,
              reasoning: 'تم إنتاج إعدادات تصميم افتراضية'
            };
          }
          if (!result.explanation) {
            result.explanation = 'تم إنتاج اقتراحات شاملة للشعار';
          }
          
        } else {
          result = { 
            analysis: generatedText,
            logoPlacement: {
              position: 'تم استخراج اقتراح من التحليل النصي',
              customLogoX: 85,
              customLogoY: 15,
              logoSize: 60,
              logoOpacity: 90,
              reasoning: 'تم إنتاج من التحليل النصي'
            },
            logoDesign: {
              hasFrame: true,
              frameShape: 'circle',
              frameColor: '#ffffff',
              frameOpacity: 80,
              frameThickness: 3,
              logoRotation: 0,
              logoEffect: 'shadow',
              shadowIntensity: 30,
              reasoning: 'تم إنتاج إعدادات تصميم افتراضية'
            },
            explanation: 'تم إنتاج اقتراحات من التحليل النصي'
          };
        }
      } catch (e) {
        result = { 
          analysis: generatedText,
          logoPlacement: {
            position: 'خطأ في استخراج JSON',
            customLogoX: 85,
            customLogoY: 15,
            logoSize: 60,
            logoOpacity: 90,
            reasoning: 'تم إنتاج إعدادات افتراضية'
          },
          logoDesign: {
            hasFrame: true,
            frameShape: 'circle',
            frameColor: '#ffffff',
            frameOpacity: 80,
            frameThickness: 3,
            logoRotation: 0,
            logoEffect: 'shadow',
            shadowIntensity: 30,
            reasoning: 'تم إنتاج إعدادات تصميم افتراضية'
          },
          explanation: 'تم إنتاج إعدادات افتراضية نتيجة خطأ في معالجة الاستجابة'
        };
      }
      
      setAnalysisResult(result);
      toast.success('تم تحليل موضع الشعار بنجاح!');

    } catch (error) {
      console.error('Error analyzing logo position:', error);
      toast.error('حدث خطأ أثناء تحليل موضع الشعار: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // تطبيق اقتراحات موضع الشعار
  const applyLogoSuggestions = () => {
    if (!analysisResult?.logoPlacement) {
      toast.error('لا توجد اقتراحات لتطبيقها. يرجى تحليل الصورة أولاً.');
      return;
    }

    if (!onApplyLogoSuggestions) {
      toast.error('خطأ: دالة تطبيق الاقتراحات غير متوفرة');
      return;
    }

    // دمج اقتراحات الموضع والتصميم
    const suggestions: Partial<LogoSettings> = {
      // اقتراحات الموضع
      useCustomLogoPosition: true,
      customLogoX: analysisResult.logoPlacement.customLogoX,
      customLogoY: analysisResult.logoPlacement.customLogoY,
      logoSize: analysisResult.logoPlacement.logoSize,
      logoOpacity: analysisResult.logoPlacement.logoOpacity,
      
      // اقتراحات التصميم والإطار
      logoFrameEnabled: analysisResult.logoDesign?.hasFrame || false,
      logoFrameShape: (analysisResult.logoDesign?.frameShape || 'circle') as LogoSettings['logoFrameShape'],
      logoFrameColor: analysisResult.logoDesign?.frameColor || '#ffffff',
      logoFrameOpacity: analysisResult.logoDesign?.frameOpacity || 80,
      logoFrameBorderWidth: analysisResult.logoDesign?.frameThickness || 3,
      logoFrameRotation: analysisResult.logoDesign?.logoRotation || 0,
      logoFrameShadowEnabled: analysisResult.logoDesign?.logoEffect === 'shadow',
      logoFrameShadowBlur: analysisResult.logoDesign?.shadowIntensity || 30
    };

    onApplyLogoSuggestions(suggestions);
    toast.success('تم تطبيق اقتراحات موضع الشعار!');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Target className="h-5 w-5" />
          🎯 تحليل موضع الشعار الذكي
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* زر التحليل */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={analyzeLogoPosition}
            disabled={!currentImageUrl || isAnalyzing || !geminiApiKey}
            className="w-full flex items-center gap-2"
            variant="default"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري تحليل موضع الشعار...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                تحليل موضع الشعار المثالي
              </>
            )}
          </Button>

          {!currentImageUrl && (
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Info className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                يتطلب وجود صورة للتحليل
              </p>
            </div>
          )}
        </div>

        {/* نتائج التحليل */}
        {analysisResult && (
          <div className="space-y-4">
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="font-medium text-accent">نتائج التحليل</span>
              </div>
              
              {/* تحليل الصورة */}
              <div className="mb-3">
                <h4 className="font-medium text-sm mb-1">تحليل الصورة:</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysisResult.analysis}
                </p>
              </div>

              {/* اقتراحات الموضع */}
              <div className="mb-3">
                <h4 className="font-medium text-sm mb-2">اقتراحات الموضع:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span>الموضع X:</span>
                    <Badge variant="secondary">{analysisResult.logoPlacement.customLogoX}%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>الموضع Y:</span>
                    <Badge variant="secondary">{analysisResult.logoPlacement.customLogoY}%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>الحجم:</span>
                    <Badge variant="secondary">{analysisResult.logoPlacement.logoSize}px</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>الشفافية:</span>
                    <Badge variant="secondary">{analysisResult.logoPlacement.logoOpacity}%</Badge>
                  </div>
                </div>
              </div>

              {/* التبرير */}
              <div className="mb-3">
                <h4 className="font-medium text-sm mb-1">تبرير الموضع:</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysisResult.logoPlacement.reasoning}
                </p>
              </div>

              {/* اقتراحات التصميم والإطار */}
              {analysisResult.logoDesign && (
                <>
                  <div className="mb-3">
                    <h4 className="font-medium text-sm mb-2">اقتراحات التصميم:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>الإطار:</span>
                        <Badge variant={analysisResult.logoDesign.hasFrame ? "default" : "secondary"}>
                          {analysisResult.logoDesign.hasFrame ? "مُفعل" : "غير مُفعل"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>شكل الإطار:</span>
                        <Badge variant="secondary">{analysisResult.logoDesign.frameShape}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>لون الإطار:</span>
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-3 h-3 rounded border border-border"
                            style={{ backgroundColor: analysisResult.logoDesign.frameColor }}
                          />
                          <Badge variant="secondary">{analysisResult.logoDesign.frameColor}</Badge>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>شفافية الإطار:</span>
                        <Badge variant="secondary">{analysisResult.logoDesign.frameOpacity}%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>سمك الإطار:</span>
                        <Badge variant="secondary">{analysisResult.logoDesign.frameThickness}px</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>دوران الشعار:</span>
                        <Badge variant="secondary">{analysisResult.logoDesign.logoRotation}°</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>التأثير:</span>
                        <Badge variant="secondary">{analysisResult.logoDesign.logoEffect}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>شدة الظل:</span>
                        <Badge variant="secondary">{analysisResult.logoDesign.shadowIntensity}%</Badge>
                      </div>
                    </div>
                  </div>

                  {/* تبرير التصميم */}
                  <div className="mb-3">
                    <h4 className="font-medium text-sm mb-1">تبرير التصميم:</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analysisResult.logoDesign.reasoning}
                    </p>
                  </div>
                </>
              )}

              {/* زر التطبيق */}
              <Button
                onClick={applyLogoSuggestions}
                className="w-full mt-3"
                variant="outline"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                تطبيق اقتراحات الموضع
              </Button>
            </div>

            {/* الشرح الإضافي */}
            {analysisResult.explanation && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-1">تفسير إضافي:</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysisResult.explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};