import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, Copy, Sparkles, Palette, Zap, RotateCcw, Share2 } from "lucide-react";
import { toast } from "sonner";
import { FacebookImagePublisher } from "./FacebookImagePublisher";

interface GeneratedImageResult {
  imageUrl: string;
  imageData: string;
  description?: string;
  mimeType: string;
  style?: 'normal' | 'genius' | 'collage' | 'organic' | 'social' | 'splitLayout' | 'geometricMasking' | 'minimalistFrame' | 'gradientOverlay' | 'asymmetricalLayout' | 'duotoneDesign' | 'cutoutTypography' | 'overlayPattern' | 'technicalNetwork';
}

interface GeneratedImageWithEdit {
  originalImages: GeneratedImageResult[];
  geniusImages: GeneratedImageResult[];
  collageImages: GeneratedImageResult[];
  organicImages: GeneratedImageResult[];
  socialImages: GeneratedImageResult[];
  splitLayoutImages: GeneratedImageResult[];
  geometricMaskingImages: GeneratedImageResult[];
  minimalistFrameImages: GeneratedImageResult[];
  gradientOverlayImages: GeneratedImageResult[];
  asymmetricalLayoutImages: GeneratedImageResult[];
  duotoneDesignImages: GeneratedImageResult[];
  cutoutTypographyImages: GeneratedImageResult[];
  overlayPatternImages: GeneratedImageResult[];
  technicalNetworkImages: GeneratedImageResult[];
  editedImages: Array<{
    imageUrl: string;
    imageData: string;
    description?: string;
    mimeType: string;
    editPrompt: string;
  }>;
}

interface ImageGalleryWithPreviewProps {
  generatedImages?: GeneratedImageWithEdit | null;
  isLoading?: boolean;
  onRegenerate?: (prompt: string, style: string) => void;
  textContent?: string; // النص المولد للنشر
  interactiveQuestions?: string[]; // الأسئلة التفاعلية للنشر
}

// أسماء الأنماط بالعربية
const styleNames = {
  normal: 'العادية',
  genius: 'جينيوس',
  collage: 'كولاج',
  organic: 'قص عضوي',
  social: 'علامة تجارية اجتماعية',
  splitLayout: 'تصميم مقسوم',
  geometricMasking: 'قص هندسي',
  minimalistFrame: 'إطار بسيط',
  gradientOverlay: 'طبقة تدرج لوني',
  asymmetricalLayout: 'تصميم غير متماثل',
  duotoneDesign: 'تصميم ثنائي اللون',
  cutoutTypography: 'قص النصوص',
  overlayPattern: 'طبقة النقوش',
  technicalNetwork: 'شبكة تقنية متدرجة'
};

// أيقونات الأنماط
const styleIcons = {
  normal: '🖼️',
  genius: '✨',
  collage: '🎨',
  organic: '🌿',
  social: '📱',
  splitLayout: '⚡',
  geometricMasking: '🔷',
  minimalistFrame: '⬜',
  gradientOverlay: '🌈',
  asymmetricalLayout: '🎯',
  duotoneDesign: '🎭',
  cutoutTypography: '🔤',
  overlayPattern: '🎪',
  technicalNetwork: '🔗'
};

// ألوان الأنماط
const styleColors = {
  normal: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800',
  genius: 'from-emerald-50 to-cyan-50 dark:from-emerald-950/20 dark:to-cyan-950/20 border-emerald-200 dark:border-emerald-800',
  collage: 'from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border-orange-200 dark:border-orange-800',
  organic: 'from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 border-green-200 dark:border-green-800',
  social: 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800',
  splitLayout: 'from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border-indigo-200 dark:border-indigo-800',
  geometricMasking: 'from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border-pink-200 dark:border-pink-800',
  minimalistFrame: 'from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20 border-gray-200 dark:border-gray-800',
  gradientOverlay: 'from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-violet-200 dark:border-violet-800',
  asymmetricalLayout: 'from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-cyan-200 dark:border-cyan-800',
  duotoneDesign: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800',
  cutoutTypography: 'from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800',
  overlayPattern: 'from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 border-teal-200 dark:border-teal-800',
  technicalNetwork: 'from-slate-50 to-zinc-50 dark:from-slate-950/20 dark:to-zinc-950/20 border-slate-200 dark:border-slate-800'
};

export const ImageGalleryWithPreview: React.FC<ImageGalleryWithPreviewProps> = ({
  generatedImages,
  isLoading = false,
  onRegenerate,
  textContent = '',
  interactiveQuestions = []
}) => {
  const [selectedImage, setSelectedImage] = useState<GeneratedImageResult | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // تجميع جميع الصور من جميع الأنماط
  const getAllImages = (): Array<{ image: GeneratedImageResult; styleName: string; styleType: string }> => {
    if (!generatedImages) return [];

    const allImages: Array<{ image: GeneratedImageResult; styleName: string; styleType: string }> = [];

    // إضافة الصور العادية
    generatedImages.originalImages?.forEach(image => {
      allImages.push({
        image,
        styleName: styleNames.normal,
        styleType: 'normal'
      });
    });

    // إضافة باقي الأنماط
    const styleArrays = [
      { images: generatedImages.geniusImages, style: 'genius' },
      { images: generatedImages.collageImages, style: 'collage' },
      { images: generatedImages.organicImages, style: 'organic' },
      { images: generatedImages.socialImages, style: 'social' },
      { images: generatedImages.splitLayoutImages, style: 'splitLayout' },
      { images: generatedImages.geometricMaskingImages, style: 'geometricMasking' },
      { images: generatedImages.minimalistFrameImages, style: 'minimalistFrame' },
      { images: generatedImages.gradientOverlayImages, style: 'gradientOverlay' },
      { images: generatedImages.asymmetricalLayoutImages, style: 'asymmetricalLayout' },
      { images: generatedImages.duotoneDesignImages, style: 'duotoneDesign' },
      { images: generatedImages.cutoutTypographyImages, style: 'cutoutTypography' },
      { images: generatedImages.overlayPatternImages, style: 'overlayPattern' },
      { images: generatedImages.technicalNetworkImages, style: 'technicalNetwork' }
    ];

    styleArrays.forEach(({ images, style }) => {
      images?.forEach(image => {
        allImages.push({
          image,
          styleName: styleNames[style as keyof typeof styleNames],
          styleType: style
        });
      });
    });

    return allImages;
  };

  const downloadImage = (image: GeneratedImageResult, styleName: string) => {
    try {
      const link = document.createElement('a');
      link.href = image.imageUrl;
      link.download = `image-${styleName}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`تم تحميل صورة ${styleName}`);
    } catch (error) {
      toast.error('فشل في تحميل الصورة');
    }
  };

  const copyImageUrl = (image: GeneratedImageResult, styleName: string) => {
    navigator.clipboard.writeText(image.imageUrl);
    toast.success(`تم نسخ رابط صورة ${styleName}`);
  };

  const openPreview = (image: GeneratedImageResult) => {
    setSelectedImage(image);
    setIsPreviewOpen(true);
  };

  const allImages = getAllImages();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">🎨 معرض الصور المولدة</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="aspect-square bg-muted" />
              <CardContent className="p-3">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (allImages.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">لا توجد صور مولدة حتى الآن</p>
          <p className="text-sm">ستظهر الصور هنا بمجرد توليدها</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
          <Palette className="h-5 w-5" />
          🎨 معرض الصور المولدة ({allImages.length} صورة)
        </h3>
        <Badge variant="secondary" className="text-sm">
          {allImages.length} نمط مختلف
        </Badge>
      </div>

      {/* شبكة الصور */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {allImages.map(({ image, styleName, styleType }, index) => (
          <Card 
            key={`${styleType}-${index}`} 
            className={`overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 bg-gradient-to-br ${styleColors[styleType as keyof typeof styleColors]} border-2`}
            onClick={() => openPreview(image)}
          >
            <div className="aspect-square relative overflow-hidden">
              <img
                src={image.imageUrl}
                alt={`صورة ${styleName}`}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                <Eye className="h-8 w-8 text-white" />
              </div>
              {/* أيقونة النمط */}
              <div className="absolute top-2 right-2 text-2xl bg-white/90 dark:bg-black/90 rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                {styleIcons[styleType as keyof typeof styleIcons]}
              </div>
            </div>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm truncate">{styleName}</h4>
                <Badge variant="outline" className="text-xs">
                  {styleType === 'normal' ? 'عادي' : 'متقدم'}
                </Badge>
              </div>
              <div className="flex gap-1 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage(image, styleName);
                  }}
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyImageUrl(image, styleName);
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {onRegenerate && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-7 text-xs bg-primary/10 hover:bg-primary/20 border-primary/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegenerate(image.description || 'صورة', styleName);
                    }}
                    title={`إعادة توليد صورة ${styleName}`}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {/* زر النشر على فيسبوك */}
              <div 
                className="w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <FacebookImagePublisher
                  imageUrl={image.imageUrl}
                  imageStyle={styleName}
                  textContent={textContent}
                  interactiveQuestions={interactiveQuestions}
                  onPublishComplete={() => {
                    toast.success(`تم نشر صورة ${styleName} بنجاح على فيسبوك!`);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* نافذة المعاينة المنبثقة */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              معاينة الصورة
              {selectedImage && (
                <Badge variant="secondary" className="mr-2">
                  {styleNames[selectedImage.style || 'normal']}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedImage && (
            <div className="space-y-4">
              {/* الصورة الكبيرة */}
              <div className="flex justify-center">
                <img
                  src={selectedImage.imageUrl}
                  alt="معاينة الصورة"
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                />
              </div>

              {/* معلومات الصورة */}
              {selectedImage.description && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h5 className="font-medium mb-2">وصف الصورة:</h5>
                  <p className="text-sm text-muted-foreground">{selectedImage.description}</p>
                </div>
              )}

              {/* أزرار التحكم */}
              <div className="flex flex-col gap-3">
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => downloadImage(selectedImage, styleNames[selectedImage.style || 'normal'])}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    تحميل الصورة
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyImageUrl(selectedImage, styleNames[selectedImage.style || 'normal'])}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    نسخ الرابط
                  </Button>
                </div>
                
                {/* زر النشر في المعاينة */}
                <div className="flex justify-center">
                  <div className="w-64">
                    <FacebookImagePublisher
                      imageUrl={selectedImage.imageUrl}
                      imageStyle={styleNames[selectedImage.style || 'normal']}
                      textContent={textContent}
                      interactiveQuestions={interactiveQuestions}
                      onPublishComplete={() => {
                        toast.success(`تم نشر صورة ${styleNames[selectedImage.style || 'normal']} بنجاح على فيسبوك!`);
                        setIsPreviewOpen(false);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};