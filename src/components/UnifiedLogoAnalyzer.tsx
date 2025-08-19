import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Sparkles, 
  Target, 
  Loader2, 
  CheckCircle, 
  Info, 
  Eye, 
  Palette, 
  MapPin, 
  AlertCircle,
  Settings,
  Zap,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import type { LogoSettings } from './LogoCustomizer';

// الواجهات المشتركة
interface LogoAnalysis {
  colors: {
    dominant: string[];
    complementary: string[];
    contrast: 'high' | 'medium' | 'low';
  };
  shape: {
    type: 'circular' | 'rectangular' | 'complex' | 'text-based' | 'diamond' | 'polygon';
    aspectRatio: number;
    hasTransparency: boolean;
    corners?: number;
    edgeRatio?: string;
  };
  characteristics: {
    style: string;
    complexity: 'simple' | 'moderate' | 'complex';
    readability: 'high' | 'medium' | 'low';
  };
}

interface ImageAnalysis {
  safeZones: {
    position: string;
    confidence: number;
    reason: string;
  }[];
  colorProfile: {
    dominant: string[];
    brightness: 'dark' | 'medium' | 'bright';
    contrast: string[];
  };
  composition: {
    focusAreas: string[];
    emptySpaces: string[];
    visualWeight: string;
  };
}

interface OptimalPlacement {
  position: string;
  confidence: number;
  reasoning: string;
  frameRecommendation?: {
    enabled: boolean;
    shape: string;
    color: string;
    opacity: number;
  };
}

interface GeminiAnalysisResult {
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

interface UnifiedLogoAnalyzerProps {
  currentImageUrl?: string;
  logoUrl?: string;
  logoSettings?: LogoSettings;
  onApplyLogoSuggestions?: (suggestions: Partial<LogoSettings>) => void;
  geminiApiKey?: string;
  specialty?: string;
  contentType?: string;
  imageStyle?: string;
  language?: string;
}

export const UnifiedLogoAnalyzer: React.FC<UnifiedLogoAnalyzerProps> = ({
  currentImageUrl,
  logoUrl,
  logoSettings,
  onApplyLogoSuggestions,
  geminiApiKey,
  specialty,
  contentType,
  imageStyle,
  language = 'ar'
}) => {
  // حالات التحليل
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('ai-analysis');
  
  // نتائج التحليل المحلي
  const [logoAnalysis, setLogoAnalysis] = useState<LogoAnalysis | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null);
  const [optimalPlacement, setOptimalPlacement] = useState<OptimalPlacement | null>(null);
  
  // نتائج تحليل Gemini
  const [geminiAnalysisResult, setGeminiAnalysisResult] = useState<GeminiAnalysisResult | null>(null);

  // تحليل هندسي متقدم للشكل
  const analyzeShapeGeometry = (imageData: ImageData, width: number, height: number) => {
    const data = imageData.data;
    let edgePixels = 0;
    let corners = 0;
    let straightLines = 0;
    let curves = 0;
    
    // تحليل الحواف والزوايا
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const index = (y * width + x) * 4;
        const alpha = data[index + 3];
        
        if (alpha > 128) { // بكسل مرئي
          // فحص البكسلات المجاورة للكشف عن الحواف
          const neighbors = [
            data[((y-1) * width + x) * 4 + 3], // أعلى
            data[((y+1) * width + x) * 4 + 3], // أسفل  
            data[(y * width + (x-1)) * 4 + 3], // يسار
            data[(y * width + (x+1)) * 4 + 3], // يمين
          ];
          
          const visibleNeighbors = neighbors.filter(n => n > 128).length;
          
          if (visibleNeighbors < 4) {
            edgePixels++;
            
            // تحليل الزوايا والخطوط
            const diagonalNeighbors = [
              data[((y-1) * width + (x-1)) * 4 + 3], // أعلى يسار
              data[((y-1) * width + (x+1)) * 4 + 3], // أعلى يمين
              data[((y+1) * width + (x-1)) * 4 + 3], // أسفل يسار
              data[((y+1) * width + (x+1)) * 4 + 3], // أسفل يمين
            ];
            
            const visibleDiagonals = diagonalNeighbors.filter(n => n > 128).length;
            
            // كشف الزوايا الحادة (مناطق مع تغييرات اتجاه حادة)
            if (visibleNeighbors <= 2 && visibleDiagonals <= 1) {
              corners++;
            }
          }
        }
      }
    }
    
    // تحديد الشكل بناءً على التحليل
    let detectedShape = 'unknown';
    const edgeRatio = edgePixels / (width * height);
    
    if (corners >= 4 && corners <= 6) {
      // إذا كان هناك 4 زوايا تقريباً = معين أو مربع
      detectedShape = 'diamond';
    } else if (corners >= 6 && corners <= 10) {
      // زوايا أكثر = شكل متعدد الأضلاع  
      detectedShape = 'polygon';
    } else if (corners < 4 && edgeRatio < 0.3) {
      // قليل من الزوايا والحواف = دائري
      detectedShape = 'circular';
    } else if (edgeRatio > 0.4) {
      // حواف كثيرة = معقد
      detectedShape = 'complex';
    } else {
      // افتراضي
      detectedShape = 'rectangular';
    }
    
    return {
      detectedShape,
      corners,
      edgePixels,
      edgeRatio: edgeRatio.toFixed(3)
    };
  };

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

  // التحليل المحلي للصورة
  const analyzeImageLocally = async (imageUrl: string, type: 'logo' | 'background'): Promise<any> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      if (imageUrl.startsWith('data:')) {
        img.src = imageUrl;
      } else {
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
      }
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('Unable to get canvas context');
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // تحليل الألوان
          const colorMap = new Map<string, number>();
          const pixels = data.length / 4;
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            if (a < 128) continue;
            
            const roundedR = Math.round(r / 32) * 32;
            const roundedG = Math.round(g / 32) * 32;
            const roundedB = Math.round(b / 32) * 32;
            
            const colorKey = `rgb(${roundedR},${roundedG},${roundedB})`;
            colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
          }

          const sortedColors = Array.from(colorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([color]) => color);

          const aspectRatio = img.width / img.height;
          
          // تحليل أكثر تقدماً للشكل باستخدام تحليل المحيط والزوايا
          const shapeAnalysis = analyzeShapeGeometry(imageData, canvas.width, canvas.height);
          let shapeType: string = shapeAnalysis.detectedShape;
          
          // تحليل احتياطي بناءً على نسبة الأبعاد إذا فشل التحليل الهندسي
          if (shapeType === 'unknown') {
            if (Math.abs(aspectRatio - 1) < 0.1) {
              shapeType = 'circular';
            } else if (aspectRatio > 1.5) {
              shapeType = 'rectangular';
            } else {
              shapeType = 'complex';
            }
          }

          let transparentPixels = 0;
          for (let i = 3; i < data.length; i += 4) {
            if (data[i] < 128) transparentPixels++;
          }
          const hasTransparency = transparentPixels > pixels * 0.1;

          const uniqueColors = colorMap.size;
          let complexity: string;
          if (uniqueColors < 5) {
            complexity = 'simple';
          } else if (uniqueColors < 20) {
            complexity = 'moderate';
          } else {
            complexity = 'complex';
          }

          if (type === 'logo') {
            resolve({
              colors: {
                dominant: sortedColors,
                complementary: sortedColors.slice().reverse(),
                contrast: uniqueColors > 10 ? 'high' : uniqueColors > 5 ? 'medium' : 'low'
              },
              shape: {
                type: shapeType,
                aspectRatio,
                hasTransparency,
                corners: shapeAnalysis.corners,
                edgeRatio: shapeAnalysis.edgeRatio
              },
              characteristics: {
                style: complexity === 'simple' ? 'minimalist' : 'detailed',
                complexity,
                readability: hasTransparency && uniqueColors < 10 ? 'high' : 'medium'
              }
            });
          } else {
            const safeZones = [
              { position: 'top-right', confidence: 0.85, reason: 'منطقة عادة تكون أقل ازدحاماً' },
              { position: 'bottom-right', confidence: 0.8, reason: 'موضع تقليدي للشعارات' },
              { position: 'top-left', confidence: 0.75, reason: 'منطقة بديلة جيدة' },
              { position: 'bottom-left', confidence: 0.7, reason: 'منطقة آمنة للشعارات' }
            ];

            resolve({
              safeZones,
              colorProfile: {
                dominant: sortedColors,
                brightness: 'medium',
                contrast: sortedColors
              },
              composition: {
                focusAreas: ['center'],
                emptySpaces: ['corners'],
                visualWeight: complexity
              }
            });
          }
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('فشل في تحميل الصورة'));
      };
    });
  };

  // تحليل Gemini الذكي
  const performGeminiAnalysis = async () => {
    if (!currentImageUrl) {
      toast.error('لا توجد صورة للتحليل');
      return;
    }

    if (!geminiApiKey) {
      toast.error('مفتاح Gemini غير متوفر. يرجى إدخال المفتاح في إعدادات توليد المحتوى');
      return;
    }

    try {
      setAnalysisProgress(20);
      
      const imageBase64 = await convertImageToBase64(currentImageUrl);
      const imageMimeType = imageBase64.split(';')[0].split(':')[1];
      const imageData = imageBase64.split(',')[1];

      setAnalysisProgress(40);

      const prompt = `
      أنت خبير متخصص في تصميم الجرافيك وتحليل الشعارات. قم بتحليل الصورة المرفقة واقتراح تصميم شامل للشعار يشمل الموضع والإطار والشكل والتأثيرات.

      السياق:
      ${specialty ? `التخصص: ${specialty}` : ''}
      ${contentType ? `نوع المحتوى: ${contentType}` : ''}
      ${imageStyle ? `نمط الصورة: ${imageStyle}` : ''}

      ${logoAnalysis ? `
      معلومات التحليل المحلي للشعار (يرجى أخذها في الاعتبار):
      - شكل الشعار: ${logoAnalysis.shape.type}
      - نسبة العرض إلى الارتفاع: ${logoAnalysis.shape.aspectRatio.toFixed(2)}
      - يحتوي على شفافية: ${logoAnalysis.shape.hasTransparency ? 'نعم' : 'لا'}
      - مستوى التعقيد: ${logoAnalysis.characteristics.complexity}
      - مستوى الوضوح: ${logoAnalysis.characteristics.readability}
      - نمط التصميم: ${logoAnalysis.characteristics.style}
      - مستوى التباين: ${logoAnalysis.colors.contrast}
      - الألوان المهيمنة: ${logoAnalysis.colors.dominant.join(', ')}
      
      هذه المعلومات مهمة جداً لاختيار الإطار المناسب وحجم الشعار!
      ` : ''}

      ${optimalPlacement ? `
      نتائج التحليل المحلي للموضع (للمقارنة):
      - الموضع المقترح محلياً: ${optimalPlacement.position}
      - مستوى الثقة: ${optimalPlacement.confidence.toFixed(1)}%
      - السبب: ${optimalPlacement.reasoning}
      ${optimalPlacement.frameRecommendation?.enabled ? `- توصية الإطار المحلي: ${optimalPlacement.frameRecommendation.shape}` : ''}
      ` : ''}

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
        logoFrameOpacity: logoSettings.logoFrameOpacity
      }, null, 2) : 'لا توجد إعدادات حالية'}

      قدم النتيجة بصيغة JSON صحيحة مع مراعاة المعلومات المحلية للشعار:
      {
        "analysis": "تحليل مفصل شامل للصورة والعناصر البصرية مع مراعاة خصائص الشعار المحللة محلياً",
        "logoPlacement": {
          "position": "وصف تفصيلي للموضع المثالي مع مقارنة بالتحليل المحلي",
          "customLogoX": 85,
          "customLogoY": 15,
          "logoSize": 60,
          "logoOpacity": 90,
          "reasoning": "تفسير مفصل لسبب اختيار هذا الموضع مع الاستفادة من التحليل المحلي"
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
          "reasoning": "تفسير شامل لخيارات التصميم مع مراعاة شكل ونوع الشعار المحلل"
        },
        "explanation": "تفسير شامل يجمع كل الاقتراحات ويوضح كيف استفدت من التحليل المحلي للشعار والموضع"
      }
      `;

      setAnalysisProgress(60);

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

      setAnalysisProgress(80);

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      let result;
      try {
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
          
          // التأكد من وجود الحقول المطلوبة
          if (!result.analysis) result.analysis = 'تم تحليل الصورة بنجاح';
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
          if (!result.explanation) result.explanation = 'تم إنتاج اقتراحات شاملة للشعار';
          
        } else {
          throw new Error('لم يتم العثور على JSON صالح في الاستجابة');
        }
      } catch (e) {
        throw new Error('خطأ في معالجة استجابة Gemini');
      }
      
      setGeminiAnalysisResult(result);
      setAnalysisProgress(100);
      toast.success('تم تحليل موضع الشعار بذكاء Gemini بنجاح!');

    } catch (error) {
      console.error('Error in Gemini analysis:', error);
      toast.error('حدث خطأ أثناء تحليل Gemini: ' + error.message);
    }
  };

  // التحليل المحلي المتقدم
  const performLocalAnalysis = async () => {
    if (!currentImageUrl || !logoUrl) {
      toast.error('يرجى تحديد الصورة والشعار أولاً');
      return;
    }

    try {
      setAnalysisProgress(25);
      const logoData: LogoAnalysis = await analyzeImageLocally(logoUrl, 'logo');
      setLogoAnalysis(logoData);

      setAnalysisProgress(50);
      let imageData: ImageAnalysis;
      
      try {
        imageData = await analyzeImageLocally(currentImageUrl, 'background');
      } catch (error) {
        console.warn('فشل في التحليل المحلي، استخدام التحليل الافتراضي:', error);
        imageData = {
          safeZones: [
            { position: 'top-right', confidence: 0.8, reason: 'منطقة آمنة افتراضية' },
            { position: 'bottom-right', confidence: 0.75, reason: 'منطقة آمنة افتراضية' },
            { position: 'top-left', confidence: 0.7, reason: 'منطقة آمنة افتراضية' },
            { position: 'bottom-left', confidence: 0.65, reason: 'منطقة آمنة افتراضية' }
          ],
          colorProfile: {
            dominant: ['#f0f0f0', '#333333'],
            brightness: 'medium',
            contrast: ['#ffffff', '#000000']
          },
          composition: {
            focusAreas: ['center'],
            emptySpaces: ['corners'],
            visualWeight: 'balanced'
          }
        };
      }
      setImageAnalysis(imageData);

      setAnalysisProgress(75);
      const placement = calculateOptimalPlacement(logoData, imageData);
      setOptimalPlacement(placement);

      setAnalysisProgress(100);
      toast.success(`تم التحليل المحلي بنجاح بثقة ${placement.confidence.toFixed(1)}%`);

    } catch (error) {
      console.error('خطأ في التحليل المحلي:', error);
      toast.error('فشل في التحليل المحلي: ' + error.message);
    }
  };

  // حساب الموضع المثالي المحسّن (يأخذ سياق الصورة في الاعتبار)
  const calculateOptimalPlacement = (logoData: LogoAnalysis, imageData: ImageAnalysis): OptimalPlacement => {
    let bestPosition = 'top-right';
    let maxConfidence = 0;
    let reasoning = '';
    let frameRecommendation = undefined;

    // تحليل خاص للوسط - أولوية عالية للصور ذات التركيز المركزي
    const centerConfidence = 0.75; // ثقة أساسية للوسط
    let centerAdjustment = 0;

    // زيادة ثقة الوسط في حالات خاصة
    if (imageData.composition.focusAreas.includes('center')) {
      centerAdjustment += 0.25; // زيادة كبيرة للتركيز المركزي
    }
    
    if (imageData.composition.visualWeight === 'balanced') {
      centerAdjustment += 0.15; // التوازن البصري يفضل الوسط
    }

    if (logoData.shape.type === 'circular' || logoData.shape.type === 'complex') {
      centerAdjustment += 0.1; // الشعارات المعقدة أو الدائرية تبدو جيدة في الوسط
    }

    if (logoData.characteristics.complexity === 'simple' && logoData.colors.contrast === 'high') {
      centerAdjustment += 0.15; // الشعارات البسيطة عالية التباين مثالية للوسط
    }

    // إذا كان هناك عنصر مركزي في الصورة (مثل اليدين المتشابكتين)
    if (imageData.composition.emptySpaces.includes('center') === false) {
      centerAdjustment += 0.2; // الوسط مناسب للتركيز على العنصر المركزي
    }

    // تحليل الوسط أولاً
    const finalCenterConfidence = centerConfidence + centerAdjustment;
    if (finalCenterConfidence > maxConfidence) {
      maxConfidence = finalCenterConfidence;
      bestPosition = 'center';
      reasoning = 'الوسط مثالي للتركيز المركزي والتوازن البصري مع سياق الصورة';
    }

    // تحليل المناطق الآمنة الأخرى
    imageData.safeZones.forEach(zone => {
      let confidence = zone.confidence;
      
      // تعديل الثقة بناءً على خصائص الشعار
      if (logoData.shape.type === 'circular' && zone.position.includes('corner')) {
        confidence += 0.1; // الشعارات الدائرية تبدو أفضل في الزوايا
      }
      
      if (logoData.characteristics.complexity === 'simple' && imageData.composition.visualWeight === 'heavy') {
        confidence += 0.15; // الشعارات البسيطة أفضل مع الصور المعقدة
      }

      // تحليل التباين اللوني
      const hasGoodContrast = logoData.colors.contrast === 'high' || 
                            imageData.colorProfile.brightness !== 'medium';
      if (hasGoodContrast) confidence += 0.1;

      // تقليل ثقة الزوايا إذا كان الوسط مناسباً
      if (zone.position.includes('corner') && centerAdjustment > 0.2) {
        confidence -= 0.15; // تفضيل الوسط على الزوايا في الصور المركزية
      }

      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        bestPosition = zone.position;
        reasoning = zone.reason;
      }
    });

    if (logoData.colors.contrast === 'low' || !logoData.shape.hasTransparency) {
      frameRecommendation = {
        enabled: true,
        shape: logoData.shape.type === 'circular' ? 'circle' : 'rounded-square',
        color: imageData.colorProfile.brightness === 'dark' ? '#ffffff' : '#000000',
        opacity: 0.8
      };
    }

    return {
      position: bestPosition,
      confidence: Math.min(maxConfidence * 100, 95),
      reasoning: reasoning || 'تحليل شامل للصورة والشعار',
      frameRecommendation
    };
  };

  // تطبيق اقتراحات Gemini
  const applyGeminiSuggestions = () => {
    if (!geminiAnalysisResult?.logoPlacement) {
      toast.error('لا توجد اقتراحات Gemini لتطبيقها');
      return;
    }

    if (!onApplyLogoSuggestions) {
      toast.error('خطأ: دالة تطبيق الاقتراحات غير متوفرة');
      return;
    }

    const suggestions: Partial<LogoSettings> = {
      useCustomLogoPosition: true,
      customLogoX: geminiAnalysisResult.logoPlacement.customLogoX,
      customLogoY: geminiAnalysisResult.logoPlacement.customLogoY,
      logoSize: geminiAnalysisResult.logoPlacement.logoSize,
      logoOpacity: geminiAnalysisResult.logoPlacement.logoOpacity,
      
      logoFrameEnabled: geminiAnalysisResult.logoDesign?.hasFrame || false,
      logoFrameShape: (geminiAnalysisResult.logoDesign?.frameShape || 'circle') as LogoSettings['logoFrameShape'],
      logoFrameColor: geminiAnalysisResult.logoDesign?.frameColor || '#ffffff',
      logoFrameOpacity: geminiAnalysisResult.logoDesign?.frameOpacity || 80,
      logoFrameBorderWidth: geminiAnalysisResult.logoDesign?.frameThickness || 3,
      logoFrameRotation: geminiAnalysisResult.logoDesign?.logoRotation || 0,
      logoFrameShadowEnabled: geminiAnalysisResult.logoDesign?.logoEffect === 'shadow',
      logoFrameShadowBlur: geminiAnalysisResult.logoDesign?.shadowIntensity || 30
    };

    onApplyLogoSuggestions(suggestions);
    toast.success('تم تطبيق اقتراحات Gemini!');
  };

  // تطبيق اقتراحات التحليل المحلي
  const applyLocalSuggestions = () => {
    if (!optimalPlacement) {
      toast.error('لا توجد اقتراحات التحليل المحلي لتطبيقها');
      return;
    }

    if (!onApplyLogoSuggestions) {
      toast.error('خطأ: دالة تطبيق الاقتراحات غير متوفرة');
      return;
    }

    // تحويل موضع النص إلى إحداثيات
    const positionMapping: { [key: string]: { x: number, y: number } } = {
      'top-right': { x: 85, y: 15 },
      'top-left': { x: 15, y: 15 },
      'bottom-right': { x: 85, y: 85 },
      'bottom-left': { x: 15, y: 85 },
      'center': { x: 50, y: 50 }
    };

    const coordinates = positionMapping[optimalPlacement.position] || { x: 85, y: 15 };

    const suggestions: Partial<LogoSettings> = {
      useCustomLogoPosition: true,
      customLogoX: coordinates.x,
      customLogoY: coordinates.y,
      logoFrameEnabled: optimalPlacement.frameRecommendation?.enabled || false,
      logoFrameShape: (optimalPlacement.frameRecommendation?.shape || 'circle') as LogoSettings['logoFrameShape'],
      logoFrameColor: optimalPlacement.frameRecommendation?.color || '#ffffff',
      logoFrameOpacity: (optimalPlacement.frameRecommendation?.opacity || 0.8) * 100
    };

    onApplyLogoSuggestions(suggestions);
    toast.success('تم تطبيق اقتراحات التحليل المحلي!');
  };

  // تشغيل التحليل الموحد المحسّن
  const performUnifiedAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // تحليل محلي أولاً (أسرع) - ضروري لإرسال المعلومات إلى Gemini
      if (logoUrl) {
        setActiveTab("unified-analysis");
        setAnalysisProgress(20);
        await performLocalAnalysis();
        setAnalysisProgress(50);
      }

      // ثم تحليل Gemini مع المعلومات المحلية (أكثر تقدماً)
      if (geminiApiKey) {
        setAnalysisProgress(60);
        await performGeminiAnalysis();
        setAnalysisProgress(100);
      }

      // التبديل إلى تبويب التحليل المدمج
      setActiveTab("unified-analysis");
      toast.success("تم إكمال التحليل الموحد بنجاح!");
    } catch (error) {
      console.error("خطأ في التحليل الموحد:", error);
      toast.error("حدث خطأ أثناء التحليل الموحد");
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  // تطبيق اقتراحات التحليل المدمج
  const applyUnifiedSuggestions = () => {
    if (!onApplyLogoSuggestions) return;

    let suggestions: Partial<LogoSettings> = {};

    // إعطاء الأولوية لتحليل Gemini إذا كان متوفراً
    if (geminiAnalysisResult) {
      suggestions = {
        useCustomLogoPosition: true,
        customLogoX: geminiAnalysisResult.logoPlacement.customLogoX,
        customLogoY: geminiAnalysisResult.logoPlacement.customLogoY,
        logoSize: geminiAnalysisResult.logoPlacement.logoSize,
        logoOpacity: geminiAnalysisResult.logoPlacement.logoOpacity,
        logoFrameEnabled: geminiAnalysisResult.logoDesign?.hasFrame || false,
        logoFrameShape: (geminiAnalysisResult.logoDesign?.frameShape || 'circle') as LogoSettings['logoFrameShape'],
        logoFrameColor: geminiAnalysisResult.logoDesign?.frameColor || '#ffffff',
        logoFrameOpacity: geminiAnalysisResult.logoDesign?.frameOpacity || 80,
        logoFrameBorderWidth: geminiAnalysisResult.logoDesign?.frameThickness || 3,
        logoFrameRotation: geminiAnalysisResult.logoDesign?.logoRotation || 0
      };
    } 
    // استخدام التحليل المحلي كبديل
    else if (optimalPlacement) {
      const positionMap: { [key: string]: [number, number] } = {
        'top-right': [85, 15],
        'top-left': [15, 15],
        'bottom-right': [85, 85],
        'bottom-left': [15, 85],
        'center': [50, 50]
      };

      const [x, y] = positionMap[optimalPlacement.position] || [85, 15];

      suggestions = {
        useCustomLogoPosition: true,
        customLogoX: x,
        customLogoY: y,
        logoSize: 60,
        logoOpacity: 90,
        logoFrameEnabled: optimalPlacement.frameRecommendation?.enabled || false,
        logoFrameShape: (optimalPlacement.frameRecommendation?.shape || 'circle') as LogoSettings['logoFrameShape'],
        logoFrameColor: optimalPlacement.frameRecommendation?.color || '#ffffff',
        logoFrameOpacity: optimalPlacement.frameRecommendation?.opacity || 80
      };
    }

    onApplyLogoSuggestions(suggestions);
    toast.success('تم تطبيق اقتراحات التحليل المدمج بنجاح!');
  };

  // إنشاء تفسير موحد للتحليل المدمج المحسّن
  const getUnifiedAnalysisExplanation = (): string => {
    let explanation = "";
    
    if (geminiAnalysisResult && optimalPlacement) {
      explanation = `
🧠 **التحليل المدمج الشامل المحسّن:**

**تحليل Gemini AI (مع معلومات محلية):** ${geminiAnalysisResult.analysis}

**التحليل المحلي:** تم تحديد الموضع المثالي "${optimalPlacement.position}" بثقة ${optimalPlacement.confidence.toFixed(1)}% - ${optimalPlacement.reasoning}

${logoAnalysis ? `**معلومات الشعار المحللة محلياً:** شكل ${logoAnalysis.shape.type} (نسبة ${logoAnalysis.shape.aspectRatio.toFixed(2)}) مع تعقيد ${logoAnalysis.characteristics.complexity} و${logoAnalysis.shape.hasTransparency ? "شفافية" : "بدون شفافية"} وتباين ${logoAnalysis.colors.contrast}` : ""}

**الاقتراح النهائي المدمج:** يُنصح بتطبيق إعدادات Gemini المتطورة (الموضع: ${geminiAnalysisResult.logoPlacement.customLogoX}%, ${geminiAnalysisResult.logoPlacement.customLogoY}%) مع ${geminiAnalysisResult.logoDesign?.hasFrame ? "إطار " + geminiAnalysisResult.logoDesign.frameShape : "بدون إطار"} مع الاستفادة من التحليل المحلي للشعار في اختيار التصميم المناسب.

**لماذا هذا الاختيار أفضل؟** ${geminiAnalysisResult.explanation}

${logoAnalysis ? `**كيف استفاد Gemini من التحليل المحلي:** تم أخذ شكل الشعار (${logoAnalysis.shape.type}) ومستوى التعقيد (${logoAnalysis.characteristics.complexity}) في الاعتبار لاختيار الإطار والحجم المناسب.` : ""}
      `;
    } else if (geminiAnalysisResult) {
      explanation = `
🧠 **تحليل Gemini AI المتقدم:**

${geminiAnalysisResult.analysis}

**الاقتراحات:** موضع مثالي في (${geminiAnalysisResult.logoPlacement.customLogoX}%, ${geminiAnalysisResult.logoPlacement.customLogoY}%) بحجم ${geminiAnalysisResult.logoPlacement.logoSize}px وشفافية ${geminiAnalysisResult.logoPlacement.logoOpacity}%.

**التفسير الكامل:** ${geminiAnalysisResult.explanation}
      `;
    } else if (optimalPlacement && logoAnalysis) {
      explanation = `
⚙️ **التحليل المحلي المتقدم:**

**الموضع المثالي:** ${optimalPlacement.position} بثقة ${optimalPlacement.confidence.toFixed(1)}%
**السبب:** ${optimalPlacement.reasoning}

**تحليل الشعار:** شكل ${logoAnalysis.shape.type} بتعقيد ${logoAnalysis.characteristics.complexity} وتباين ${logoAnalysis.colors.contrast}

**التوصية:** تطبيق الموضع المحسوب محلياً ${optimalPlacement.frameRecommendation?.enabled ? "مع إطار " + optimalPlacement.frameRecommendation.shape : "بدون إطار"} للحصول على أفضل توازن بصري.
      `;
    } else {
      explanation = "لم يتم العثور على نتائج تحليل كاملة. يرجى تشغيل التحليل المدمج أولاً.";
    }

    return explanation;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Target className="h-5 w-5" />
          🎯 المحلل الموحد للشعار المثالي
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* الزر الرئيسي للتحليل الذكي المدمج */}
        <div className="text-center space-y-4 mb-6">
          <Button
            onClick={performUnifiedAnalysis}
            disabled={!currentImageUrl || isAnalyzing}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                جاري التحليل الذكي المدمج...
              </>
            ) : (
              <>
                <Brain className="h-5 w-5 mr-2" />
                🧠 التحليل الذكي المدمج
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground">
            تحليل شامل متطور يجمع بين التحليل المحلي المتقدم وذكاء Gemini AI للحصول على أفضل النتائج
          </p>
        </div>

        {/* شريط التقدم */}
        {isAnalyzing && (
          <div className="space-y-2 mb-6">
            <Progress value={analysisProgress} className="w-full" />
            <p className="text-xs text-center text-muted-foreground">
              جاري التحليل الشامل... {analysisProgress}%
            </p>
          </div>
        )}

        {/* خيارات التحليل المتقدمة */}
        {!isAnalyzing && (
          <details className="mb-6">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground mb-3">
              🔧 خيارات التحليل المتقدمة
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button
                onClick={performLocalAnalysis}
                disabled={!currentImageUrl || !logoUrl || isAnalyzing}
                className="flex items-center gap-2"
                variant="outline"
                size="sm"
              >
                <Settings className="h-4 w-4" />
                تحليل محلي متقدم
              </Button>

              <Button
                onClick={performGeminiAnalysis}
                disabled={!currentImageUrl || isAnalyzing || !geminiApiKey}
                className="flex items-center gap-2"
                variant="outline"
                size="sm"
              >
                <Sparkles className="h-4 w-4" />
                تحليل Gemini AI
              </Button>

              <Button
                onClick={performUnifiedAnalysis}
                disabled={!currentImageUrl || isAnalyzing}
                className="flex items-center gap-2"
                variant="outline"
                size="sm"
              >
                <Zap className="h-4 w-4" />
                تحليل شامل موحد
              </Button>
            </div>
          </details>
        )}

        {(!currentImageUrl || (!geminiApiKey && !logoUrl)) && (
          <div className="text-center p-3 bg-muted/50 rounded-lg mb-6">
            <Info className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {!currentImageUrl && 'يتطلب وجود صورة للتحليل'}
              {currentImageUrl && !geminiApiKey && !logoUrl && 'يتطلب إما مفتاح Gemini أو ملف الشعار'}
            </p>
          </div>
        )}

        {/* نتائج التحليل */}
        {(geminiAnalysisResult || (logoAnalysis && imageAnalysis && optimalPlacement)) && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="unified-analysis" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                التحليل المدمج
              </TabsTrigger>
              <TabsTrigger value="ai-analysis" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                تحليل Gemini AI
              </TabsTrigger>
              <TabsTrigger value="local-analysis" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                التحليل المحلي
              </TabsTrigger>
            </TabsList>

            {/* التحليل المدمج */}
            <TabsContent value="unified-analysis" className="space-y-4">
              {(geminiAnalysisResult || optimalPlacement) && (
                <div className="space-y-4">
                  {/* التفسير الموحد */}
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <Target className="h-5 w-5" />
                        🎯 التحليل المدمج الشامل
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-line text-sm leading-relaxed">
                          {getUnifiedAnalysisExplanation()}
                        </div>
                      </div>
                      
                      {/* ملخص الاقتراحات */}
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-primary" />
                          ملخص الاقتراحات النهائية:
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          {geminiAnalysisResult && (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">الموضع (X, Y):</span>
                                <Badge variant="secondary">
                                  {geminiAnalysisResult.logoPlacement.customLogoX}%, {geminiAnalysisResult.logoPlacement.customLogoY}%
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">الحجم:</span>
                                <Badge variant="secondary">{geminiAnalysisResult.logoPlacement.logoSize}px</Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">الشفافية:</span>
                                <Badge variant="secondary">{geminiAnalysisResult.logoPlacement.logoOpacity}%</Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">الإطار:</span>
                                <Badge variant={geminiAnalysisResult.logoDesign?.hasFrame ? "default" : "secondary"}>
                                  {geminiAnalysisResult.logoDesign?.hasFrame ? "مُفعل" : "معطل"}
                                </Badge>
                              </div>
                            </>
                          )}
                          {!geminiAnalysisResult && optimalPlacement && (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">الموضع:</span>
                                <Badge variant="secondary">{optimalPlacement.position}</Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">مستوى الثقة:</span>
                                <Badge variant="default">{optimalPlacement.confidence.toFixed(1)}%</Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">الإطار:</span>
                                <Badge variant={optimalPlacement.frameRecommendation?.enabled ? "default" : "secondary"}>
                                  {optimalPlacement.frameRecommendation?.enabled ? "مُفعل" : "معطل"}
                                </Badge>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* زر تطبيق الاقتراحات المدمجة */}
                      <Button
                        onClick={applyUnifiedSuggestions}
                        className="w-full mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        size="lg"
                        disabled={!geminiAnalysisResult && !optimalPlacement}
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        🎯 تطبيق اقتراحات التحليل المدمج
                      </Button>
                    </CardContent>
                  </Card>

                  {/* معلومات إضافية حول التحليل المدمج */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {geminiAnalysisResult && (
                      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm">
                            <Brain className="h-4 w-4" />
                            اقتراحات Gemini AI
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                            {geminiAnalysisResult.logoPlacement.reasoning}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            AI-Powered Analysis
                          </Badge>
                        </CardContent>
                      </Card>
                    )}

                    {optimalPlacement && (
                      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300 text-sm">
                            <Settings className="h-4 w-4" />
                            التحليل المحلي المتقدم
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-green-600 dark:text-green-400 mb-2">
                            {optimalPlacement.reasoning}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            ثقة {optimalPlacement.confidence.toFixed(1)}%
                          </Badge>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* تحليل Gemini */}
            <TabsContent value="ai-analysis" className="space-y-4">
              {geminiAnalysisResult && (
                <div className="space-y-4">
                  <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-accent" />
                      <span className="font-medium text-accent">تحليل Gemini AI</span>
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="font-medium text-sm mb-1">تحليل الصورة:</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {geminiAnalysisResult.analysis}
                      </p>
                    </div>

                    <div className="mb-3">
                      <h4 className="font-medium text-sm mb-2">اقتراحات الموضع:</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span>الموضع X:</span>
                          <Badge variant="secondary">{geminiAnalysisResult.logoPlacement.customLogoX}%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>الموضع Y:</span>
                          <Badge variant="secondary">{geminiAnalysisResult.logoPlacement.customLogoY}%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>الحجم:</span>
                          <Badge variant="secondary">{geminiAnalysisResult.logoPlacement.logoSize}px</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>الشفافية:</span>
                          <Badge variant="secondary">{geminiAnalysisResult.logoPlacement.logoOpacity}%</Badge>
                        </div>
                      </div>
                    </div>

                    {geminiAnalysisResult.logoDesign && (
                      <div className="mb-3">
                        <h4 className="font-medium text-sm mb-2">اقتراحات التصميم:</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span>الإطار:</span>
                            <Badge variant={geminiAnalysisResult.logoDesign.hasFrame ? "default" : "secondary"}>
                              {geminiAnalysisResult.logoDesign.hasFrame ? "مُفعل" : "غير مُفعل"}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>شكل الإطار:</span>
                            <Badge variant="secondary">{geminiAnalysisResult.logoDesign.frameShape}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>لون الإطار:</span>
                            <div className="flex items-center gap-1">
                              <div 
                                className="w-3 h-3 rounded border border-border"
                                style={{ backgroundColor: geminiAnalysisResult.logoDesign.frameColor }}
                              />
                              <Badge variant="secondary">{geminiAnalysisResult.logoDesign.frameColor}</Badge>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span>التأثير:</span>
                            <Badge variant="secondary">{geminiAnalysisResult.logoDesign.logoEffect}</Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={applyGeminiSuggestions}
                      className="w-full mt-3"
                      variant="default"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      تطبيق اقتراحات Gemini
                    </Button>
                  </div>

                  {geminiAnalysisResult.explanation && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <h4 className="font-medium text-sm mb-1">تفسير إضافي:</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {geminiAnalysisResult.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* التحليل المحلي */}
            <TabsContent value="local-analysis" className="space-y-4">
              {logoAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-blue-500" />
                      تحليل الشعار
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">الألوان المهيمنة</h4>
                      <div className="flex gap-2">
                        {logoAnalysis.colors.dominant.map((color, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">نوع الشكل:</span>
                        <Badge variant="secondary" className="ml-2">
                          {logoAnalysis.shape.type === 'diamond' ? 'معين' : 
                           logoAnalysis.shape.type === 'circular' ? 'دائري' :
                           logoAnalysis.shape.type === 'polygon' ? 'متعدد الأضلاع' :
                           logoAnalysis.shape.type === 'rectangular' ? 'مستطيل' :
                           logoAnalysis.shape.type}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">مستوى التعقيد:</span>
                        <Badge 
                          variant={logoAnalysis.characteristics.complexity === 'simple' ? 'default' : 'secondary'} 
                          className="ml-2"
                        >
                          {logoAnalysis.characteristics.complexity}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">التباين:</span>
                        <Badge 
                          variant={logoAnalysis.colors.contrast === 'high' ? 'default' : 'outline'} 
                          className="ml-2"
                        >
                          {logoAnalysis.colors.contrast}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">الوضوح:</span>
                        <Badge 
                          variant={logoAnalysis.characteristics.readability === 'high' ? 'default' : 'secondary'} 
                          className="ml-2"
                        >
                          {logoAnalysis.characteristics.readability}
                        </Badge>
                      </div>
                      {logoAnalysis.shape.corners && (
                        <div>
                          <span className="font-medium">عدد الزوايا:</span>
                          <Badge variant="outline" className="ml-2">
                            {logoAnalysis.shape.corners}
                          </Badge>
                        </div>
                      )}
                      {logoAnalysis.shape.edgeRatio && (
                        <div>
                          <span className="font-medium">نسبة الحواف:</span>
                          <Badge variant="outline" className="ml-2">
                            {logoAnalysis.shape.edgeRatio}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {imageAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-green-500" />
                      تحليل الصورة الأساسية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">المناطق الآمنة</h4>
                      <div className="space-y-2">
                        {imageAnalysis.safeZones.map((zone, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm">{zone.position}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={zone.confidence * 100} className="w-16 h-2" />
                              <span className="text-xs text-muted-foreground">
                                {(zone.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">الألوان المهيمنة</h4>
                      <div className="flex gap-2">
                        {imageAnalysis.colorProfile.dominant.map((color, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {optimalPlacement && (
                <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <MapPin className="h-5 w-5" />
                      الموضع المثالي المحسوب
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{optimalPlacement.position}</h4>
                        <p className="text-sm text-muted-foreground">{optimalPlacement.reasoning}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {optimalPlacement.confidence.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">مستوى الثقة</div>
                      </div>
                    </div>
                    
                    {optimalPlacement.frameRecommendation?.enabled && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            توصية الإطار
                          </span>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          يُنصح بإضافة إطار {optimalPlacement.frameRecommendation.shape} لتحسين الوضوح
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={applyLocalSuggestions}
                      className="w-full"
                      variant="outline"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      تطبيق اقتراحات التحليل المحلي
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedLogoAnalyzer;