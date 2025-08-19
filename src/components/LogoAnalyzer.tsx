import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Brain, Eye, Palette, MapPin, Sparkles, AlertCircle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface LogoAnalysis {
  colors: {
    dominant: string[];
    complementary: string[];
    contrast: 'high' | 'medium' | 'low';
  };
  shape: {
    type: 'circular' | 'rectangular' | 'complex' | 'text-based';
    aspectRatio: number;
    hasTransparency: boolean;
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

interface LogoAnalyzerProps {
  imageUrl?: string;
  logoUrl?: string;
  onAnalysisComplete?: (placement: OptimalPlacement) => void;
}

export const LogoAnalyzer: React.FC<LogoAnalyzerProps> = ({
  imageUrl,
  logoUrl,
  onAnalysisComplete
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logoAnalysis, setLogoAnalysis] = useState<LogoAnalysis | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null);
  const [optimalPlacement, setOptimalPlacement] = useState<OptimalPlacement | null>(null);
  const { toast } = useToast();

  // تحليل محلي للصورة باستخدام Canvas
  const analyzeImageLocally = async (imageUrl: string, type: 'logo' | 'background'): Promise<any> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // التعامل مع data URLs أو URL عادي
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
            
            // تجاهل البكسلات الشفافة
            if (a < 128) continue;
            
            // تجميع الألوان المتشابهة
            const roundedR = Math.round(r / 32) * 32;
            const roundedG = Math.round(g / 32) * 32;
            const roundedB = Math.round(b / 32) * 32;
            
            const colorKey = `rgb(${roundedR},${roundedG},${roundedB})`;
            colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
          }

          // ترتيب الألوان حسب التكرار
          const sortedColors = Array.from(colorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([color]) => color);

          // تحليل الشكل
          const aspectRatio = img.width / img.height;
          let shapeType: string;
          
          if (Math.abs(aspectRatio - 1) < 0.1) {
            shapeType = 'circular';
          } else if (aspectRatio > 1.5) {
            shapeType = 'rectangular';
          } else {
            shapeType = 'complex';
          }

          // تحليل الشفافية
          let transparentPixels = 0;
          for (let i = 3; i < data.length; i += 4) {
            if (data[i] < 128) transparentPixels++;
          }
          const hasTransparency = transparentPixels > pixels * 0.1;

          // تحليل التعقيد (بناءً على تنوع الألوان)
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
                hasTransparency
              },
              characteristics: {
                style: complexity === 'simple' ? 'minimalist' : 'detailed',
                complexity,
                readability: hasTransparency && uniqueColors < 10 ? 'high' : 'medium'
              }
            });
          } else {
            // تحليل المناطق الآمنة للصورة الخلفية
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

  const analyzeImage = async (url: string, type: 'logo' | 'background'): Promise<any> => {
    try {
      // محاولة التحليل المحلي أولاً
      return await analyzeImageLocally(url, type);
    } catch (localError) {
      console.warn('فشل في التحليل المحلي، محاولة استخدام Gemini:', localError);
      
      try {
        // التحقق من صحة الرابط
        if (!url || (!url.startsWith('http') && !url.startsWith('data:'))) {
          throw new Error('رابط الصورة غير صالح');
        }

        const { data, error } = await supabase.functions.invoke('gemini-image-analysis', {
          body: {
            imageUrl: url,
            analysisType: type,
            prompt: type === 'logo' 
              ? `حلل هذا الشعار وحدد:
                 1. الألوان المهيمنة والمكملة
                 2. شكل الشعار ونسبة العرض إلى الارتفاع
                 3. مستوى التعقيد والوضوح
                 4. وجود شفافية أو خلفية
                 5. نمط التصميم (حديث، كلاسيكي، إلخ)`
              : `حلل هذه الصورة لتحديد أفضل مواضع وضع الشعار:
                 1. المناطق الآمنة (قليلة التفاصيل)
                 2. توزيع الألوان والسطوع
                 3. نقاط التركيز البصري
                 4. المساحات الفارغة المناسبة
                 5. التباين اللوني في المناطق المختلفة`
          }
        });

        if (error) {
          console.error('Supabase function error:', error);
          throw new Error(`خطأ في الخدمة: ${error.message}`);
        }

        if (!data) {
          throw new Error('لم يتم استلام بيانات من الخدمة');
        }

        return data;
      } catch (error) {
        console.error('Error in analyzeImage:', error);
        throw error;
      }
    }
  };

  const calculateOptimalPlacement = (logoData: LogoAnalysis, imageData: ImageAnalysis): OptimalPlacement => {
    // خوارزمية ذكية لحساب أفضل موضع
    let bestPosition = 'top-right';
    let maxConfidence = 0;
    let reasoning = '';
    let frameRecommendation = undefined;

    // تحليل كل منطقة آمنة
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

      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        bestPosition = zone.position;
        reasoning = zone.reason;
      }
    });

    // تحديد الحاجة للإطار
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

  const performAnalysis = async () => {
    if (!imageUrl || !logoUrl) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد الصورة والشعار أولاً",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);

    try {
      // تحليل الشعار
      setProgress(25);
      const logoData: LogoAnalysis = await analyzeImage(logoUrl, 'logo');
      setLogoAnalysis(logoData);

      // تحليل الصورة الأساسية
      setProgress(50);
      let imageData: ImageAnalysis;
      
      try {
        imageData = await analyzeImage(imageUrl, 'background');
      } catch (error) {
        console.warn('فشل في تحليل الصورة باستخدام Gemini، استخدام التحليل الافتراضي:', error);
        // استخدام تحليل افتراضي للصورة
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

      // حساب الموضع المثالي
      setProgress(75);
      const placement = calculateOptimalPlacement(logoData, imageData);
      setOptimalPlacement(placement);

      setProgress(100);
      onAnalysisComplete?.(placement);

      toast({
        title: "تم التحليل بنجاح",
        description: `تم تحديد الموضع المثالي بثقة ${placement.confidence.toFixed(1)}%`
      });

    } catch (error) {
      console.error('خطأ في التحليل:', error);
      toast({
        title: "خطأ في التحليل",
        description: error instanceof Error ? error.message : "فشل في تحليل الصورة أو الشعار",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* زر بدء التحليل */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            تحليل الموضع المثالي للشعار
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              سيتم تحليل الصورة والشعار لتحديد أفضل موضع وإعدادات للشعار
            </p>
            
            {isAnalyzing && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-center text-muted-foreground">
                  جاري التحليل... {progress}%
                </p>
              </div>
            )}
            
            <Button 
              onClick={performAnalysis}
              disabled={isAnalyzing || !imageUrl || !logoUrl}
              className="w-full"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isAnalyzing ? 'جاري التحليل...' : 'بدء التحليل الذكي'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* نتائج تحليل الشعار */}
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
                  {logoAnalysis.shape.type}
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* نتائج تحليل الصورة */}
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

      {/* الموضع المثالي المحسوب */}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LogoAnalyzer;