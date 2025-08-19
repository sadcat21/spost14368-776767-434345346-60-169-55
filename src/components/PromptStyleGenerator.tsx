import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  RefreshCw, 
  Palette,
  Scissors,
  Share2,
  Layers,
  Shapes,
  Frame,
  Zap,
  RotateCcw,
  Contrast,
  Type,
  Grid,
  Network,
  PlayCircle,
  Pause
} from "lucide-react";
import { toast } from "sonner";
import { useGeminiImageGeneration } from "@/hooks/useGeminiImageGeneration";

interface PromptStyleGeneratorProps {
  generatedPrompts: any;
  originalPrompt: string;
  apiKey: string;
  onImageGenerated: (image: any, style: string) => void;
}

interface StyleConfig {
  key: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  promptKey: keyof any;
}

const styles: StyleConfig[] = [
  {
    key: 'normal',
    name: 'النمط العادي',
    icon: Sparkles,
    description: 'توليد صورة عادية احترافية',
    promptKey: 'imagePrompt'
  },
  {
    key: 'genius',
    name: 'نمط جينيوس',
    icon: Palette,
    description: 'تصميم إبداعي وحر مع عناصر مبتكرة',
    promptKey: 'geniusPrompt'
  },
  {
    key: 'collage',
    name: 'تصميم كولاج',
    icon: Layers,
    description: 'ترتيب متعدد الصور في تركيبة فنية',
    promptKey: 'collagePrompt'
  },
  {
    key: 'organic',
    name: 'قص عضوي',
    icon: Scissors,
    description: 'أشكال طبيعية منحنية وانسيابية',
    promptKey: 'organicMaskPrompt'
  },
  {
    key: 'social',
    name: 'علامة تجارية اجتماعية',
    icon: Share2,
    description: 'مصمم للنشر على منصات التواصل',
    promptKey: 'socialBrandingPrompt'
  },
  {
    key: 'splitLayout',
    name: 'تصميم مقسوم',
    icon: Layers,
    description: 'تقسيم المساحة لأقسام متعددة',
    promptKey: 'splitLayoutPrompt'
  },
  {
    key: 'geometricMasking',
    name: 'قص هندسي',
    icon: Shapes,
    description: 'أشكال هندسية منتظمة',
    promptKey: 'geometricMaskingPrompt'
  },
  {
    key: 'minimalistFrame',
    name: 'إطار بسيط',
    icon: Frame,
    description: 'تصميم بسيط مع إطار ملون',
    promptKey: 'minimalistFramePrompt'
  },
  {
    key: 'gradientOverlay',
    name: 'طبقة تدرج لوني',
    icon: Zap,
    description: 'تدرج لوني نصف شفاف',
    promptKey: 'gradientOverlayPrompt'
  },
  {
    key: 'asymmetricalLayout',
    name: 'تصميم غير متماثل',
    icon: RotateCcw,
    description: 'توزيع عناصر غير متوازن',
    promptKey: 'asymmetricalLayoutPrompt'
  },
  {
    key: 'duotoneDesign',
    name: 'تصميم ثنائي اللون',
    icon: Contrast,
    description: 'استخدام لونين فقط',
    promptKey: 'duotoneDesignPrompt'
  },
  {
    key: 'cutoutTypography',
    name: 'قص النصوص',
    icon: Type,
    description: 'نصوص كقناع للصورة',
    promptKey: 'cutoutTypographyPrompt'
  },
  {
    key: 'overlayPattern',
    name: 'طبقة النقوش',
    icon: Grid,
    description: 'أنماط شفافة فوق الصورة',
    promptKey: 'overlayPatternPrompt'
  },
  {
    key: 'technicalNetwork',
    name: 'شبكة تقنية متدرجة',
    icon: Network,
    description: 'خلفية تقنية بتدرجات وشبكات',
    promptKey: 'technicalNetworkPrompt'
  }
];

export const PromptStyleGenerator: React.FC<PromptStyleGeneratorProps> = ({
  generatedPrompts,
  originalPrompt,
  apiKey,
  onImageGenerated
}) => {
  const [generatingStyles, setGeneratingStyles] = useState<Set<string>>(new Set());
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [currentGeneratingStyle, setCurrentGeneratingStyle] = useState<string>('');
  const { generateImage } = useGeminiImageGeneration();

  const handleGenerateStyle = async (style: StyleConfig) => {
    if (!generatedPrompts || !apiKey) {
      toast.error('لا توجد برومتات مولدة أو مفتاح API غير موجود');
      return;
    }

    const prompt = style.key === 'normal' ? originalPrompt : generatedPrompts[style.promptKey];
    
    if (!prompt) {
      toast.error(`برومت ${style.name} غير متوفر`);
      return;
    }

    setGeneratingStyles(prev => new Set(prev).add(style.key));
    
    try {
      console.log(`🎨 توليد صورة بنمط ${style.name}...`);
      toast.info(`🎨 جاري توليد صورة بنمط ${style.name}...`);

      const result = await generateImage({
        prompt: prompt,
        apiKey: apiKey
      });

      console.log('نتيجة التوليد:', result);

      if (result && result.imageUrl) {
        console.log(`✅ إرسال الصورة إلى المعرض: ${style.name}`);
        onImageGenerated(result, style.key);
        toast.success(`✅ تم توليد صورة ${style.name} بنجاح وإضافتها للمعرض`);
      } else {
        console.error('نتيجة التوليد فارغة أو لا تحتوي على imageUrl');
        toast.error(`فشل في توليد صورة ${style.name} - النتيجة فارغة`);
      }
    } catch (error) {
      console.error(`خطأ في توليد صورة ${style.name}:`, error);
      toast.error(`فشل في توليد صورة ${style.name}`);
    } finally {
      setGeneratingStyles(prev => {
        const newSet = new Set(prev);
        newSet.delete(style.key);
        return newSet;
      });
    }
  };

  const handleBatchGeneration = async () => {
    if (!generatedPrompts || !apiKey) {
      toast.error('لا توجد برومتات مولدة أو مفتاح API غير موجود');
      return;
    }

    // فلترة الأنماط التي لها برومتات متوفرة
    const availableStyles = styles.filter(style => {
      const prompt = style.key === 'normal' ? originalPrompt : generatedPrompts[style.promptKey];
      return !!prompt;
    });

    if (availableStyles.length === 0) {
      toast.error('لا توجد أنماط متوفرة للتوليد');
      return;
    }

    setIsBatchGenerating(true);
    setBatchProgress(0);
    
    let successCount = 0;
    let failureCount = 0;

    toast.info(`🚀 بدء توليد ${availableStyles.length} صورة بأنماط مختلفة... (ستتم إضافتها للمعرض الحالي)`);

    // تأكيد عدم إزالة الصور الموجودة
    console.log('📋 بدء التوليد الشامل - لن يتم حذف الصور الموجودة في المعرض');

    for (let i = 0; i < availableStyles.length; i++) {
      const style = availableStyles[i];
      const prompt = style.key === 'normal' ? originalPrompt : generatedPrompts[style.promptKey];
      
      setCurrentGeneratingStyle(style.name);
      setBatchProgress(((i) / availableStyles.length) * 100);

      try {
        console.log(`🎨 توليد متتالي - النمط ${i + 1}/${availableStyles.length}: ${style.name}`);
        
        const result = await generateImage({
          prompt: prompt,
          apiKey: apiKey
        });

        if (result && result.imageUrl) {
          console.log(`✅ إضافة صورة ${style.name} للمعرض (${i + 1}/${availableStyles.length})`);
          onImageGenerated(result, style.key);
          successCount++;
          
          // عرض تحديث فقط كل 3 صور لتجنب الإزعاج
          if ((i + 1) % 3 === 0 || i + 1 === availableStyles.length) {
            toast.success(`✅ تم توليد ${i + 1} من ${availableStyles.length} صور وإضافتها للمعرض`);
          }
        } else {
          failureCount++;
          console.error(`❌ فشل في توليد الصورة ${i + 1}/${availableStyles.length}: ${style.name}`);
        }
      } catch (error) {
        failureCount++;
        console.error(`💥 خطأ في توليد الصورة ${i + 1}/${availableStyles.length}: ${style.name}`, error);
      }

      // تحديث شريط التقدم
      setBatchProgress(((i + 1) / availableStyles.length) * 100);
      
      // انتظار قصير بين الطلبات لتجنب تحميل الخادم
      if (i < availableStyles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsBatchGenerating(false);
    setCurrentGeneratingStyle('');
    setBatchProgress(0);

    // عرض النتيجة النهائية
    if (successCount > 0 && failureCount === 0) {
      toast.success(`🎉 تم توليد جميع الصور بنجاح! (${successCount} صورة)`);
    } else if (successCount > 0 && failureCount > 0) {
      toast.warning(`⚠️ تم توليد ${successCount} صور بنجاح، فشل في ${failureCount} صور`);
    } else {
      toast.error(`❌ فشل في توليد جميع الصور`);
    }
  };

  if (!generatedPrompts) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>قم بتوليد البرومتات أولاً لرؤية الأنماط المختلفة</p>
        </CardContent>
      </Card>
    );
  }

  const availableStylesCount = styles.filter(style => {
    const prompt = style.key === 'normal' ? originalPrompt : generatedPrompts[style.promptKey];
    return !!prompt;
  }).length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">مولد الصور بالأنماط المختلفة</h3>
        <p className="text-muted-foreground text-sm">
          اختر النمط المطلوب وولد الصورة حسب رغبتك
        </p>
      </div>

      {/* زر التوليد الشامل */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                <PlayCircle className="h-5 w-5 text-primary" />
                توليد جميع الأنماط
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                توليد {availableStylesCount} صورة بجميع الأنماط المتوفرة بشكل متتالي
                <br />
                <span className="text-green-600 font-medium text-xs">
                  ✅ سيتم الحفاظ على جميع الصور الموجودة في المعرض
                </span>
              </p>
            </div>

            {isBatchGenerating && (
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">جاري التوليد...</span>
                  <span className="font-medium">{Math.round(batchProgress)}%</span>
                </div>
                <Progress value={batchProgress} className="w-full" />
                {currentGeneratingStyle && (
                  <p className="text-center text-sm text-primary font-medium">
                    🎨 {currentGeneratingStyle}
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={handleBatchGeneration}
              disabled={isBatchGenerating || availableStylesCount === 0}
              size="lg"
              className="w-full max-w-md"
            >
              {isBatchGenerating ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  جاري توليد الصور...
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  توليد جميع الأنماط ({availableStylesCount} صورة)
                </>
              )}
            </Button>

            {availableStylesCount === 0 && (
              <Badge variant="secondary" className="text-xs">
                لا توجد أنماط متوفرة - تأكد من توليد البرومتات أولاً
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {styles.map((style) => {
          const IconComponent = style.icon;
          const isGenerating = generatingStyles.has(style.key);
          const prompt = style.key === 'normal' ? originalPrompt : generatedPrompts[style.promptKey];
          
          return (
            <Card key={style.key} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <IconComponent className="h-4 w-4 text-primary" />
                  {style.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {style.description}
                </p>
                
                {prompt && (
                  <div className="space-y-2">
                    <Label className="text-xs">البرومت:</Label>
                    <Textarea
                      value={prompt}
                      readOnly
                      className="text-xs resize-none bg-muted/50"
                      rows={3}
                    />
                  </div>
                )}
                
                <Button
                  onClick={() => handleGenerateStyle(style)}
                  disabled={isGenerating || !prompt}
                  className="w-full"
                  size="sm"
                  variant={style.key === 'normal' ? 'default' : 'outline'}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                      جاري التوليد...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-2" />
                      توليد الصورة
                    </>
                  )}
                </Button>
                
                {!prompt && (
                  <Badge variant="secondary" className="w-full justify-center text-xs">
                    برومت غير متوفر
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};