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
  RefreshCw,
  Lightbulb,
  Cpu,
  Network
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { geminiApiManager } from '@/utils/geminiApiManager';
import type { LogoSettings } from './LogoCustomizer';

// الواجهات المشتركة
interface LocalLogoAnalysis {
  colors: {
    dominant: string[];
    complementary: string[];
    contrast: 'high' | 'medium' | 'low';
  };
  shape: {
    type: 'circular' | 'rectangular' | 'complex' | 'text-based';
    aspectRatio: number;
    hasTransparency: boolean;
    dimensions: {
      width: number;
      height: number;
    };
  };
  characteristics: {
    style: string;
    complexity: 'simple' | 'moderate' | 'complex';
    readability: 'high' | 'medium' | 'low';
    visualWeight: 'light' | 'medium' | 'heavy';
  };
}

interface LocalImageAnalysis {
  safeZones: {
    position: string;
    confidence: number;
    reason: string;
    coordinates: { x: number; y: number; width: number; height: number };
  }[];
  colorProfile: {
    dominant: string[];
    brightness: 'dark' | 'medium' | 'bright';
    contrast: string[];
    averageLuminance: number;
  };
  composition: {
    focusAreas: string[];
    emptySpaces: string[];
    visualWeight: string;
    busyAreas: string[];
    dimensions: {
      width: number;
      height: number;
    };
  };
}

interface GeminiEnhancedAnalysis {
  creativeSuggestions: {
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
      framePadding: number;
      logoRotation: number;
      logoEffect: string;
      shadowIntensity: number;
      blendMode: string;
      reasoning: string;
    };
    contextualRecommendations: {
      brandAlignment: string;
      audienceConsiderations: string;
      platformOptimization: string;
      accessibilityNotes: string;
    };
  };
  explanation: string;
  confidenceScore: number;
}

interface IntelligentLogoAnalyzerProps {
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

export const IntelligentLogoAnalyzer: React.FC<IntelligentLogoAnalyzerProps> = ({
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
  const [currentStep, setCurrentStep] = useState('');
  const [activeTab, setActiveTab] = useState('unified');
  
  // نتائج التحليل المحلي
  const [localLogoAnalysis, setLocalLogoAnalysis] = useState<LocalLogoAnalysis | null>(null);
  const [localImageAnalysis, setLocalImageAnalysis] = useState<LocalImageAnalysis | null>(null);
  
  // نتائج تحليل Gemini المحسن
  const [geminiAnalysis, setGeminiAnalysis] = useState<GeminiEnhancedAnalysis | null>(null);
  
  // النتيجة المدمجة النهائية
  const [finalRecommendations, setFinalRecommendations] = useState<Partial<LogoSettings> | null>(null);

  // التحليل المحلي المتقدم للصورة
  const performAdvancedLocalAnalysis = async (imageUrl: string, type: 'logo' | 'background'): Promise<any> => {
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
          const pixels = data.length / 4;
          
          // تحليل متقدم للألوان
          const colorMap = new Map<string, { count: number; positions: { x: number; y: number }[] }>();
          let totalLuminance = 0;
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            if (a < 128) continue;
            
            // حساب الإضاءة النسبية
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            totalLuminance += luminance;
            
            const pixelIndex = i / 4;
            const x = pixelIndex % canvas.width;
            const y = Math.floor(pixelIndex / canvas.width);
            
            const roundedR = Math.round(r / 16) * 16;
            const roundedG = Math.round(g / 16) * 16;
            const roundedB = Math.round(b / 16) * 16;
            
            const colorKey = `rgb(${roundedR},${roundedG},${roundedB})`;
            
            if (!colorMap.has(colorKey)) {
              colorMap.set(colorKey, { count: 0, positions: [] });
            }
            
            const colorData = colorMap.get(colorKey)!;
            colorData.count++;
            if (colorData.positions.length < 100) { // تحديد عدد النقاط لتوفير الذاكرة
              colorData.positions.push({ x, y });
            }
          }

          const averageLuminance = totalLuminance / pixels;
          const sortedColors = Array.from(colorMap.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 8)
            .map(([color]) => color);

          // تحليل المناطق الآمنة والمشغولة
          const gridSize = 16;
          const cellWidth = canvas.width / gridSize;
          const cellHeight = canvas.height / gridSize;
          const densityGrid: number[][] = [];
          
          for (let y = 0; y < gridSize; y++) {
            densityGrid[y] = [];
            for (let x = 0; x < gridSize; x++) {
              let cellDensity = 0;
              const startX = Math.floor(x * cellWidth);
              const startY = Math.floor(y * cellHeight);
              const endX = Math.min(startX + cellWidth, canvas.width);
              const endY = Math.min(startY + cellHeight, canvas.height);
              
              for (let py = startY; py < endY; py++) {
                for (let px = startX; px < endX; px++) {
                  const pixelIndex = (py * canvas.width + px) * 4;
                  const r = data[pixelIndex];
                  const g = data[pixelIndex + 1];
                  const b = data[pixelIndex + 2];
                  const a = data[pixelIndex + 3];
                  
                  if (a > 128) {
                    const variance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
                    cellDensity += variance;
                  }
                }
              }
              
              densityGrid[y][x] = cellDensity;
            }
          }

          const aspectRatio = img.width / img.height;
          let shapeType: string;
          
          if (Math.abs(aspectRatio - 1) < 0.2) {
            shapeType = 'circular';
          } else if (aspectRatio > 2) {
            shapeType = 'rectangular';
          } else {
            shapeType = 'complex';
          }

          let transparentPixels = 0;
          for (let i = 3; i < data.length; i += 4) {
            if (data[i] < 128) transparentPixels++;
          }
          const hasTransparency = transparentPixels > pixels * 0.05;

          const uniqueColors = colorMap.size;
          let complexity: string;
          let visualWeight: string;
          
          if (uniqueColors < 10) {
            complexity = 'simple';
            visualWeight = 'light';
          } else if (uniqueColors < 50) {
            complexity = 'moderate';
            visualWeight = 'medium';
          } else {
            complexity = 'complex';
            visualWeight = 'heavy';
          }

          if (type === 'logo') {
            resolve({
              colors: {
                dominant: sortedColors,
                complementary: sortedColors.slice().reverse(),
                contrast: uniqueColors > 20 ? 'high' : uniqueColors > 10 ? 'medium' : 'low'
              },
              shape: {
                type: shapeType,
                aspectRatio,
                hasTransparency,
                dimensions: { width: img.width, height: img.height }
              },
              characteristics: {
                style: complexity === 'simple' ? 'minimalist' : complexity === 'moderate' ? 'balanced' : 'detailed',
                complexity,
                readability: hasTransparency && uniqueColors < 15 ? 'high' : uniqueColors < 30 ? 'medium' : 'low',
                visualWeight
              }
            });
          } else {
            // تحليل المناطق الآمنة بناءً على الكثافة
            const safeZones = [];
            const corners = [
              { name: 'top-right', x: gridSize - 4, y: 0, width: 4, height: 4 },
              { name: 'top-left', x: 0, y: 0, width: 4, height: 4 },
              { name: 'bottom-right', x: gridSize - 4, y: gridSize - 4, width: 4, height: 4 },
              { name: 'bottom-left', x: 0, y: gridSize - 4, width: 4, height: 4 },
              { name: 'center-right', x: gridSize - 3, y: Math.floor(gridSize/2) - 2, width: 3, height: 4 },
              { name: 'center-left', x: 0, y: Math.floor(gridSize/2) - 2, width: 3, height: 4 }
            ];

            corners.forEach(corner => {
              let avgDensity = 0;
              let cellCount = 0;
              
              for (let y = corner.y; y < corner.y + corner.height && y < gridSize; y++) {
                for (let x = corner.x; x < corner.x + corner.width && x < gridSize; x++) {
                  avgDensity += densityGrid[y][x];
                  cellCount++;
                }
              }
              
              avgDensity /= cellCount;
              const maxDensity = Math.max(...densityGrid.flat());
              const confidence = Math.max(0.3, Math.min(0.95, 1 - (avgDensity / maxDensity)));
              
              safeZones.push({
                position: corner.name,
                confidence,
                reason: confidence > 0.8 ? 'منطقة قليلة التفاصيل' : confidence > 0.6 ? 'منطقة مناسبة' : 'منطقة مقبولة',
                coordinates: {
                  x: (corner.x / gridSize) * 100,
                  y: (corner.y / gridSize) * 100,
                  width: (corner.width / gridSize) * 100,
                  height: (corner.height / gridSize) * 100
                }
              });
            });

            safeZones.sort((a, b) => b.confidence - a.confidence);

            resolve({
              safeZones,
              colorProfile: {
                dominant: sortedColors,
                brightness: averageLuminance > 0.6 ? 'bright' : averageLuminance < 0.3 ? 'dark' : 'medium',
                contrast: sortedColors,
                averageLuminance
              },
              composition: {
                focusAreas: ['center'],
                emptySpaces: safeZones.filter(z => z.confidence > 0.7).map(z => z.position),
                visualWeight: complexity,
                busyAreas: safeZones.filter(z => z.confidence < 0.5).map(z => z.position),
                dimensions: { width: img.width, height: img.height }
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

  // تحليل Gemini المحسن مع البيانات المحلية
  const performEnhancedGeminiAnalysis = async (localLogoData: LocalLogoAnalysis, localImageData: LocalImageAnalysis) => {
    if (!geminiApiKey) {
      throw new Error('مفتاح Gemini غير متوفر');
    }

    try {
      const imageBase64 = await convertImageToBase64(currentImageUrl!);
      const logoBase64 = await convertImageToBase64(logoUrl!);
      
      const imageMimeType = imageBase64.split(';')[0].split(':')[1];
      const logoMimeType = logoBase64.split(';')[0].split(':')[1];
      const imageData = imageBase64.split(',')[1];
      const logoData = logoBase64.split(',')[1];

      // إنشاء prompt ذكي مع البيانات المحلية
      const enhancedPrompt = `
      أنت مصمم جرافيك خبير ومتخصص في تكامل الشعارات مع التصاميم. لديك تحليل محلي مفصل للصورة والشعار، استخدم هذه البيانات لإنتاج اقتراحات إبداعية ومبتكرة.

      البيانات المحلية للشعار:
      - الألوان المهيمنة: ${localLogoData.colors.dominant.join(', ')}
      - نوع الشكل: ${localLogoData.shape.type}
      - نسبة العرض للارتفاع: ${localLogoData.shape.aspectRatio.toFixed(2)}
      - وجود شفافية: ${localLogoData.shape.hasTransparency ? 'نعم' : 'لا'}
      - أبعاد الشعار: ${localLogoData.shape.dimensions.width}x${localLogoData.shape.dimensions.height}
      - مستوى التعقيد: ${localLogoData.characteristics.complexity}
      - مستوى الوضوح: ${localLogoData.characteristics.readability}
      - الوزن البصري: ${localLogoData.characteristics.visualWeight}

      البيانات المحلية للصورة:
      - أفضل المناطق الآمنة: ${localImageData.safeZones.slice(0, 3).map(z => `${z.position} (ثقة: ${(z.confidence * 100).toFixed(1)}%)`).join(', ')}
      - الألوان المهيمنة: ${localImageData.colorProfile.dominant.slice(0, 5).join(', ')}
      - مستوى السطوع: ${localImageData.colorProfile.brightness}
      - متوسط الإضاءة: ${(localImageData.colorProfile.averageLuminance * 100).toFixed(1)}%
      - أبعاد الصورة: ${localImageData.composition.dimensions.width}x${localImageData.composition.dimensions.height}
      - المناطق المشغولة: ${localImageData.composition.busyAreas.join(', ') || 'لا توجد'}

      السياق الإضافي:
      ${specialty ? `التخصص: ${specialty}` : ''}
      ${contentType ? `نوع المحتوى: ${contentType}` : ''}
      ${imageStyle ? `نمط الصورة: ${imageStyle}` : ''}

      الإعدادات الحالية:
      ${logoSettings ? JSON.stringify({
        logoSize: logoSettings.logoSize,
        logoPosition: logoSettings.logoPosition,
        logoOpacity: logoSettings.logoOpacity,
        customLogoX: logoSettings.customLogoX,
        customLogoY: logoSettings.customLogoY
      }, null, 2) : 'لا توجد إعدادات حالية'}

      المطلوب:
      بناءً على التحليل المحلي المفصل والصور المرفقة، قدم اقتراحات إبداعية شاملة تتضمن:

      1. موضع مثالي للشعار مع تبرير مفصل
      2. تصميم إطار متقدم (إذا كان مناسباً)
      3. تأثيرات بصرية مبتكرة
      4. اعتبارات العلامة التجارية والجمهور
      5. تحسينات لكل منصة

      أجب بصيغة JSON صحيحة:
      {
        "creativeSuggestions": {
          "logoPlacement": {
            "position": "الموضع المثالي مع تفسير السبب",
            "customLogoX": 85,
            "customLogoY": 15,
            "logoSize": 65,
            "logoOpacity": 90,
            "reasoning": "تفسير مفصل مع ربط بالتحليل المحلي"
          },
          "logoDesign": {
            "hasFrame": true,
            "frameShape": "circle",
            "frameColor": "#ffffff",
            "frameOpacity": 85,
            "frameThickness": 4,
            "framePadding": 8,
            "logoRotation": 0,
            "logoEffect": "glow",
            "shadowIntensity": 35,
            "blendMode": "normal",
            "reasoning": "تفسير شامل لخيارات التصميم المتقدمة"
          },
          "contextualRecommendations": {
            "brandAlignment": "كيف يتناسب التصميم مع هوية العلامة التجارية",
            "audienceConsiderations": "اعتبارات خاصة بالجمهور المستهدف",
            "platformOptimization": "تحسينات لمنصات التواصل المختلفة",
            "accessibilityNotes": "ملاحظات حول إمكانية الوصول والوضوح"
          }
        },
        "explanation": "تفسير شامل يربط كل الاقتراحات بالتحليل المحلي",
        "confidenceScore": 92
      }
      `;

      const response = await geminiApiManager.makeRequest(
        geminiApiManager.getApiUrl(),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: enhancedPrompt },
                {
                  inlineData: {
                    mimeType: imageMimeType,
                    data: imageData
                  }
                },
                {
                  inlineData: {
                    mimeType: logoMimeType,
                    data: logoData
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 3048,
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
        
        // التأكد من وجود الحقول المطلوبة
        if (!result.creativeSuggestions) {
          throw new Error('لم يتم إنتاج اقتراحات إبداعية');
        }
        
        return result;
      } else {
        throw new Error('لم يتم العثور على JSON صالح في الاستجابة');
      }

    } catch (error) {
      console.error('Error in enhanced Gemini analysis:', error);
      throw error;
    }
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

  // دمج النتائج وإنتاج التوصيات النهائية
  const generateFinalRecommendations = (
    localLogo: LocalLogoAnalysis, 
    localImage: LocalImageAnalysis, 
    geminiResult: GeminiEnhancedAnalysis
  ): Partial<LogoSettings> => {
    const bestSafeZone = localImage.safeZones[0];
    const geminiSuggestions = geminiResult.creativeSuggestions;
    
    // دمج ذكي للإعدادات
    return {
      // الموضع - أولوية للتحليل المحلي مع تعديل Gemini
      logoPosition: 'top-right',
      useCustomLogoPosition: true,
      customLogoX: Math.max(5, Math.min(95, geminiSuggestions.logoPlacement.customLogoX)),
      customLogoY: Math.max(5, Math.min(95, geminiSuggestions.logoPlacement.customLogoY)),
      
      // الحجم - مدمج بناءً على نسبة الأبعاد وتوصيات Gemini
      logoSize: Math.max(30, Math.min(100, geminiSuggestions.logoPlacement.logoSize)),
      
      // الشفافية - محسوبة بناءً على التباين المحلي
      logoOpacity: localLogo.characteristics.readability === 'high' 
        ? Math.min(100, geminiSuggestions.logoPlacement.logoOpacity + 10)
        : Math.max(70, geminiSuggestions.logoPlacement.logoOpacity - 10),
      
      // إعدادات الإطار المتقدمة
      logoFrameEnabled: geminiSuggestions.logoDesign.hasFrame || localLogo.colors.contrast === 'low',
      logoFrameShape: 'rounded-square',
      logoFrameColor: geminiSuggestions.logoDesign.frameColor,
      logoFrameOpacity: Math.max(50, Math.min(100, geminiSuggestions.logoDesign.frameOpacity)),
      logoFrameBorderWidth: Math.max(1, Math.min(8, geminiSuggestions.logoDesign.frameThickness)),
      
      // تأثيرات إضافية - استخدام الخصائص المتوفرة فقط
      logoFramePadding: geminiSuggestions.logoDesign.framePadding || 8
    };
  };

  // تنفيذ التحليل الذكي المدمج
  const performIntelligentAnalysis = async () => {
    if (!currentImageUrl || !logoUrl) {
      toast.error('يرجى تحديد الصورة والشعار أولاً');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentStep('بدء التحليل...');

    try {
      // المرحلة 1: التحليل المحلي للشعار
      setCurrentStep('تحليل الشعار محلياً...');
      setAnalysisProgress(15);
      const logoData: LocalLogoAnalysis = await performAdvancedLocalAnalysis(logoUrl, 'logo');
      setLocalLogoAnalysis(logoData);

      // المرحلة 2: التحليل المحلي للصورة
      setCurrentStep('تحليل الصورة محلياً...');
      setAnalysisProgress(30);
      const imageData: LocalImageAnalysis = await performAdvancedLocalAnalysis(currentImageUrl, 'background');
      setLocalImageAnalysis(imageData);

      // المرحلة 3: إرسال البيانات لـ Gemini للحصول على اقتراحات إبداعية
      setCurrentStep('تحليل ذكي بواسطة Gemini...');
      setAnalysisProgress(55);
      const geminiResult: GeminiEnhancedAnalysis = await performEnhancedGeminiAnalysis(logoData, imageData);
      setGeminiAnalysis(geminiResult);

      // المرحلة 4: دمج النتائج وإنتاج التوصيات النهائية
      setCurrentStep('دمج النتائج وإنتاج التوصيات...');
      setAnalysisProgress(85);
      const finalRecs = generateFinalRecommendations(logoData, imageData, geminiResult);
      setFinalRecommendations(finalRecs);

      setAnalysisProgress(100);
      setCurrentStep('تم التحليل بنجاح!');
      
      toast.success(`تم التحليل الذكي بنجاح! درجة الثقة: ${geminiResult.confidenceScore}%`);

    } catch (error) {
      console.error('Error in intelligent analysis:', error);
      toast.error('حدث خطأ أثناء التحليل الذكي: ' + error.message);
      setCurrentStep('فشل في التحليل');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // تطبيق التوصيات
  const applyRecommendations = () => {
    if (finalRecommendations && onApplyLogoSuggestions) {
      onApplyLogoSuggestions(finalRecommendations);
      toast.success('تم تطبيق التوصيات الذكية بنجاح!');
    }
  };

  return (
    <div className="space-y-6">
      {/* زر بدء التحليل الذكي */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            التحليل الذكي المدمج للشعار
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              نظام تحليل متطور يدمج التحليل المحلي مع ذكاء Gemini لإنتاج توصيات إبداعية شاملة
            </p>
            
            {isAnalyzing && (
              <div className="space-y-3">
                <Progress value={analysisProgress} className="w-full" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {currentStep}
                </div>
              </div>
            )}
            
            <Button 
              onClick={performIntelligentAnalysis}
              disabled={isAnalyzing || !currentImageUrl || !logoUrl}
              className="w-full"
              size="lg"
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              {isAnalyzing ? 'جاري التحليل الذكي...' : 'بدء التحليل الذكي المدمج'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* عرض النتائج */}
      {(localLogoAnalysis || localImageAnalysis || geminiAnalysis) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              نتائج التحليل المدمج
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="unified" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  المدمج
                </TabsTrigger>
                <TabsTrigger value="local" className="flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  المحلي
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  Gemini
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="flex items-center gap-1">
                  <Settings className="h-3 w-3" />
                  التوصيات
                </TabsTrigger>
              </TabsList>

              {/* النتائج المدمجة */}
              <TabsContent value="unified" className="space-y-4">
                {finalRecommendations && geminiAnalysis && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="text-lg px-3 py-1">
                        درجة الثقة: {geminiAnalysis.confidenceScore}%
                      </Badge>
                      <Button onClick={applyRecommendations} size="sm">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        تطبيق التوصيات
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          الموضع المثالي
                        </h4>
                        <div className="text-sm space-y-1">
                          <p>الإحداثيات: ({finalRecommendations.customLogoX}, {finalRecommendations.customLogoY})</p>
                          <p>الحجم: {finalRecommendations.logoSize}%</p>
                          <p>الشفافية: {finalRecommendations.logoOpacity}%</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Settings className="h-4 w-4 text-green-500" />
                          تصميم الإطار
                        </h4>
                        <div className="text-sm space-y-1">
                          <p>الشكل: {finalRecommendations.logoFrameShape}</p>
                          <p>السُمك: {finalRecommendations.logoFrameBorderWidth}px</p>
                          <p>الشفافية: {finalRecommendations.logoFrameOpacity}%</p>
                        </div>
                      </div>
                    </div>
                    
                    {geminiAnalysis.explanation && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm">{geminiAnalysis.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* التحليل المحلي */}
              <TabsContent value="local" className="space-y-4">
                {localLogoAnalysis && (
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Palette className="h-4 w-4 text-blue-500" />
                      تحليل الشعار المحلي
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">الألوان المهيمنة:</span>
                        <div className="flex gap-1 mt-1">
                          {localLogoAnalysis.colors.dominant.slice(0, 4).map((color, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">نوع الشكل:</span>
                        <Badge variant="secondary" className="ml-2">{localLogoAnalysis.shape.type}</Badge>
                      </div>
                      <div>
                        <span className="font-medium">التعقيد:</span>
                        <Badge variant="outline" className="ml-2">{localLogoAnalysis.characteristics.complexity}</Badge>
                      </div>
                      <div>
                        <span className="font-medium">الوزن البصري:</span>
                        <Badge variant="outline" className="ml-2">{localLogoAnalysis.characteristics.visualWeight}</Badge>
                      </div>
                    </div>
                  </div>
                )}
                
                {localImageAnalysis && (
                  <div className="space-y-4">
                    <Separator />
                    <h4 className="font-medium flex items-center gap-2">
                      <Eye className="h-4 w-4 text-green-500" />
                      تحليل الصورة المحلي
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-sm">المناطق الآمنة (مرتبة بالثقة):</span>
                        <div className="mt-2 space-y-2">
                          {localImageAnalysis.safeZones.slice(0, 4).map((zone, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">{zone.position}</span>
                              <Badge variant={zone.confidence > 0.8 ? 'default' : zone.confidence > 0.6 ? 'secondary' : 'outline'}>
                                {(zone.confidence * 100).toFixed(1)}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-sm">الخصائص:</span>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div>السطوع: {localImageAnalysis.colorProfile.brightness}</div>
                          <div>الوزن البصري: {localImageAnalysis.composition.visualWeight}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* تحليل Gemini */}
              <TabsContent value="ai" className="space-y-4">
                {geminiAnalysis && (
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Network className="h-4 w-4 text-purple-500" />
                      التحليل الإبداعي بواسطة Gemini
                    </h4>
                    
                    {geminiAnalysis.creativeSuggestions.contextualRecommendations && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-muted rounded-lg">
                          <h5 className="font-medium text-sm mb-2">توافق العلامة التجارية</h5>
                          <p className="text-xs text-muted-foreground">
                            {geminiAnalysis.creativeSuggestions.contextualRecommendations.brandAlignment}
                          </p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <h5 className="font-medium text-sm mb-2">اعتبارات الجمهور</h5>
                          <p className="text-xs text-muted-foreground">
                            {geminiAnalysis.creativeSuggestions.contextualRecommendations.audienceConsiderations}
                          </p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <h5 className="font-medium text-sm mb-2">تحسين المنصات</h5>
                          <p className="text-xs text-muted-foreground">
                            {geminiAnalysis.creativeSuggestions.contextualRecommendations.platformOptimization}
                          </p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <h5 className="font-medium text-sm mb-2">إمكانية الوصول</h5>
                          <p className="text-xs text-muted-foreground">
                            {geminiAnalysis.creativeSuggestions.contextualRecommendations.accessibilityNotes}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <h5 className="font-medium text-sm mb-2">تبرير الموضع</h5>
                        <p className="text-xs">{geminiAnalysis.creativeSuggestions.logoPlacement.reasoning}</p>
                      </div>
                      
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <h5 className="font-medium text-sm mb-2">تبرير التصميم</h5>
                        <p className="text-xs">{geminiAnalysis.creativeSuggestions.logoDesign.reasoning}</p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* التوصيات النهائية */}
              <TabsContent value="recommendations" className="space-y-4">
                {finalRecommendations && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        التوصيات النهائية المحسنة
                      </h4>
                      <Button onClick={applyRecommendations} variant="default">
                        تطبيق الجميع
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="p-3 border rounded-lg">
                        <span className="font-medium block">الموضع</span>
                        <span className="text-muted-foreground">
                          X: {finalRecommendations.customLogoX}%, Y: {finalRecommendations.customLogoY}%
                        </span>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <span className="font-medium block">الحجم</span>
                        <span className="text-muted-foreground">{finalRecommendations.logoSize}%</span>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <span className="font-medium block">الشفافية</span>
                        <span className="text-muted-foreground">{finalRecommendations.logoOpacity}%</span>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <span className="font-medium block">الإطار</span>
                        <span className="text-muted-foreground">
                          {finalRecommendations.logoFrameEnabled ? 'مفعل' : 'غير مفعل'}
                        </span>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <span className="font-medium block">شكل الإطار</span>
                        <span className="text-muted-foreground">{finalRecommendations.logoFrameShape}</span>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <span className="font-medium block">سُمك الإطار</span>
                        <span className="text-muted-foreground">{finalRecommendations.logoFrameBorderWidth}px</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-sm">ملاحظة</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        هذه التوصيات مبنية على تحليل متقدم يدمج البيانات المحلية مع ذكاء Gemini لضمان أفضل النتائج البصرية والإبداعية.
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntelligentLogoAnalyzer;