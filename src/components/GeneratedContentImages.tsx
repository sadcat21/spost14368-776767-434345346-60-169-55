import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ImageIcon, 
  Edit3, 
  Download, 
  Copy, 
  Check,
  Wand2,
  Sparkles,
  RefreshCw,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { useGeminiContentImageGeneration } from "@/hooks/useGeminiContentImageGeneration";
import { useGeminiApiKey } from "@/hooks/useGeminiApiKey";

interface GeneratedContentImagesProps {
  imagePrompt?: string;
  geniusPrompt?: string; // برومت النمط جينيوس
  collagePrompt?: string; // برومت تصميم الكولاج
  organicMaskPrompt?: string; // برومت القص العضوي
  socialBrandingPrompt?: string; // برومت العلامة التجارية الاجتماعية
  splitLayoutPrompt?: string; // برومت التصميم المقسوم
  geometricMaskingPrompt?: string; // برومت القص الهندسي
  minimalistFramePrompt?: string; // برومت الإطار البسيط
  gradientOverlayPrompt?: string; // برومت طبقة التدرج اللوني
  asymmetricalLayoutPrompt?: string; // برومت التصميم غير المتماثل
  duotoneDesignPrompt?: string; // برومت التصميم ثنائي اللون
  cutoutTypographyPrompt?: string; // برومت قص النصوص
  overlayPatternPrompt?: string; // برومت طبقة النقوش
  technicalNetworkPrompt?: string; // برومت الشبكة التقنية المتدرجة
  imageStyle?: string;
  generatedImages?: any; // صور مولدة من المرحلة الرابعة
  isVisible?: boolean;
}

export const GeneratedContentImages: React.FC<GeneratedContentImagesProps> = ({
  imagePrompt,
  geniusPrompt,
  collagePrompt,
  organicMaskPrompt,
  socialBrandingPrompt,
  splitLayoutPrompt,
  geometricMaskingPrompt,
  minimalistFramePrompt,
  gradientOverlayPrompt,
  asymmetricalLayoutPrompt,
  duotoneDesignPrompt,
  cutoutTypographyPrompt,
  overlayPatternPrompt,
  imageStyle,
  generatedImages: propsGeneratedImages,
  isVisible = true
}) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  
  // إدارة مفتاح API
  const { apiKey: geminiApiKey, hasApiKey } = useGeminiApiKey();
  
  const {
    generateImageFromPrompt,
    generateSingleStyleImage, // إضافة الدالة الجديدة
    editGeneratedImage,
    resetImages,
    isGenerating,
    generatedImages: hookGeneratedImages,
    error
  } = useGeminiContentImageGeneration();

  // استخدام الصور المولدة من المرحلة الرابعة إذا كانت متوفرة، وإلا استخدم من hook
  const generatedImages = propsGeneratedImages || hookGeneratedImages;

  if (!isVisible) return null;

  const handleGenerateImage = async () => {
    if (!imagePrompt?.trim()) {
      toast.error('لا يوجد برومت صورة متاح');
      return;
    }

    if (!hasApiKey() && !geminiApiKey) {
      toast.error('⚠️ مفتاح Gemini API مطلوب! يرجى إدخال المفتاح أولاً.');
      return;
    }

    console.log('🖼️ بدء توليد الصور مع المعاملات:', {
      imagePrompt: imagePrompt.substring(0, 50) + '...',
      geniusPrompt: geniusPrompt ? geniusPrompt.substring(0, 50) + '...' : 'غير متوفر',
      style: imageStyle,
      hasApiKey: !!geminiApiKey
    });

    await generateImageFromPrompt({
      imagePrompt,
      geniusPrompt, // تمرير برومت جينيوس
      style: imageStyle,
      apiKey: geminiApiKey // تمرير مفتاح API
    });
  };

  const handleRegenerateImage = async (type: 'normal' | 'genius') => {
    if (!hasApiKey() && !geminiApiKey) {
      toast.error('⚠️ مفتاح Gemini API مطلوب! يرجى إدخال المفتاح أولاً.');
      return;
    }

    const promptToUse = type === 'genius' ? geniusPrompt : imagePrompt;
    
    if (!promptToUse?.trim()) {
      toast.error(`لا يوجد برومت ${type === 'genius' ? 'جينيوس' : 'عادي'} متاح`);
      return;
    }

    console.log(`🔄 إعادة توليد الصورة ${type === 'genius' ? 'جينيوس' : 'العادية'}...`);
    
    await generateImageFromPrompt({
      imagePrompt: type === 'normal' ? imagePrompt : '',
      geniusPrompt: type === 'genius' ? geniusPrompt : '',
      style: imageStyle,
      apiKey: geminiApiKey
    });
  };

  const handleGenerateFromNewPrompt = async (promptType: 'collage' | 'organic' | 'social' | 'splitLayout' | 'geometricMasking' | 'minimalistFrame' | 'gradientOverlay' | 'asymmetricalLayout' | 'duotoneDesign' | 'cutoutTypography' | 'overlayPattern') => {
    if (!hasApiKey() && !geminiApiKey) {
      toast.error('⚠️ مفتاح Gemini API مطلوب! يرجى إدخال المفتاح أولاً.');
      return;
    }

    let promptToUse = '';
    let styleToUse = '';

    switch (promptType) {
      case 'collage':
        promptToUse = collagePrompt || '';
        styleToUse = 'Collage Layout';
        break;
      case 'organic':
        promptToUse = organicMaskPrompt || '';
        styleToUse = 'Organic Shape Masking';
        break;
      case 'social':
        promptToUse = socialBrandingPrompt || '';
        styleToUse = 'Social Media Branding';
        break;
      case 'splitLayout':
        promptToUse = splitLayoutPrompt || '';
        styleToUse = 'Split Layout Design';
        break;
      case 'geometricMasking':
        promptToUse = geometricMaskingPrompt || '';
        styleToUse = 'Geometric Masking';
        break;
      case 'minimalistFrame':
        promptToUse = minimalistFramePrompt || '';
        styleToUse = 'Minimalist Frame';
        break;
      case 'gradientOverlay':
        promptToUse = gradientOverlayPrompt || '';
        styleToUse = 'Gradient Overlay';
        break;
      case 'asymmetricalLayout':
        promptToUse = asymmetricalLayoutPrompt || '';
        styleToUse = 'Asymmetrical Layout';
        break;
      case 'duotoneDesign':
        promptToUse = duotoneDesignPrompt || '';
        styleToUse = 'Duotone Design';
        break;
      case 'cutoutTypography':
        promptToUse = cutoutTypographyPrompt || '';
        styleToUse = 'Cutout Typography';
        break;
      case 'overlayPattern':
        promptToUse = overlayPatternPrompt || '';
        styleToUse = 'Overlay Pattern';
        break;
    }

    if (!promptToUse.trim()) {
      toast.error(`لا يوجد برومت ${promptType} متاح`);
      return;
    }

    console.log(`🖼️ بدء توليد الصورة للنمط ${promptType}:`, promptToUse.substring(0, 50) + '...');

    // استخدام الدالة الجديدة لتوليد صورة بالنمط المحدد
    await generateSingleStyleImage({
      imagePrompt: promptToUse,
      style: styleToUse,
      apiKey: geminiApiKey,
      styleType: promptType
    });
  };

  const handleEditImage = async (imageData: string, mimeType: string, editPrompt: string, imageType: 'normal' | 'genius') => {
    if (!editPrompt.trim()) {
      toast.error('يرجى إدخال وصف التعديل');
      return;
    }

    if (!hasApiKey() && !geminiApiKey) {
      toast.error('⚠️ مفتاح Gemini API مطلوب!');
      return;
    }

    try {
      console.log(`🖼️ بدء تعديل الصورة ${imageType === 'genius' ? 'جينيوس' : 'العادية'}...`);
      
      // استخدام Gemini API مباشرة للتعديل
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Edit this image: ${editPrompt}. Maintain the overall composition while applying the requested changes. High quality, detailed result.`
              },
              {
                inlineData: {
                  mimeType,
                  data: imageData
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
            responseModalities: ["TEXT", "IMAGE"]
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`خطأ من Gemini API: ${response.status}`);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      
      if (candidate?.content?.parts) {
        let newImageData = null;
        let textResponse = null;
        
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            newImageData = part.inlineData.data;
          } else if (part.text) {
            textResponse = part.text;
          }
        }
        
        if (newImageData) {
          const newMimeType = candidate.content.parts.find(p => p.inlineData)?.inlineData?.mimeType || 'image/png';
          const newImageUrl = `data:${newMimeType};base64,${newImageData}`;
          
          const editResult = {
            imageUrl: newImageUrl,
            imageData: newImageData,
            description: textResponse,
            mimeType: newMimeType,
            editPrompt,
            originalType: imageType
          };

          // إضافة الصورة المعدلة للنتائج
          if (generatedImages) {
            const updatedImages = {
              ...generatedImages,
              editedImages: [...generatedImages.editedImages, editResult]
            };
            // هنا نحتاج إلى تحديث الحالة في المكون الأب
          }

          console.log('✅ تم تعديل الصورة بنجاح');
          toast.success(`تم تعديل الصورة ${imageType === 'genius' ? 'جينيوس' : 'العادية'} بنجاح!`);
          return editResult;
        }
      }
      
      throw new Error('لم يتم إنشاء صورة معدلة');
      
    } catch (error) {
      console.error('❌ خطأ في تعديل الصورة:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في تعديل الصورة';
      toast.error(errorMessage);
      return null;
    }
  };

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تم تحميل الصورة');
  };

  const handleCopyImageData = async (imageData: string, imageId: string) => {
    try {
      await navigator.clipboard.writeText(imageData);
      setCopied(imageId);
      toast.success('تم نسخ بيانات الصورة');
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast.error('فشل في نسخ البيانات');
    }
  };
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <span>🖼️ توليد الصور - المرحلة الرابعة</span>
          </div>
          {generatedImages && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetImages}
              disabled={isGenerating}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              إعادة تعيين
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* عرض البرومت المتاح */}
        {imagePrompt && (
          <div className="space-y-4">
            {/* برومت الصورة العادي */}
            <div className="space-y-2">
              <Label>برومت الصورة العادي المولد:</Label>
              <div className="p-3 bg-muted/50 rounded-md text-sm">
                <p className="text-muted-foreground">{imagePrompt}</p>
              </div>
            </div>
            
            {/* برومت النمط جينيوس إذا كان متوفراً */}
            {geniusPrompt && (
              <div className="space-y-2">
                <Label className="text-emerald-600">برومت النمط جينيوس المولد:</Label>
                <div className="p-3 bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-950/20 dark:to-cyan-950/20 rounded-md text-sm border-r-4 border-emerald-500">
                  <p className="text-muted-foreground">{geniusPrompt}</p>
                </div>
              </div>
            )}
            
            {/* برومت تصميم الكولاج إذا كان متوفراً */}
            {collagePrompt && (
              <div className="space-y-2">
                <Label className="text-orange-600">برومت تصميم الكولاج (متعدد الصور):</Label>
                <div className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 rounded-md text-sm border-r-4 border-orange-500">
                  <p className="text-muted-foreground">{collagePrompt}</p>
                </div>
              </div>
            )}
            
            {/* برومت القص العضوي إذا كان متوفراً */}
            {organicMaskPrompt && (
              <div className="space-y-2">
                <Label className="text-purple-600">برومت القص العضوي (أشكال طبيعية):</Label>
                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-md text-sm border-r-4 border-purple-500">
                  <p className="text-muted-foreground">{organicMaskPrompt}</p>
                </div>
              </div>
            )}
            
            {/* برومت العلامة التجارية الاجتماعية إذا كان متوفراً */}
            {socialBrandingPrompt && (
              <div className="space-y-2">
                <Label className="text-blue-600">برومت العلامة التجارية الاجتماعية (وسائل التواصل):</Label>
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-md text-sm border-r-4 border-blue-500">
                  <p className="text-muted-foreground">{socialBrandingPrompt}</p>
                </div>
              </div>
            )}
            
            {/* البرومتات الجديدة */}
            {splitLayoutPrompt && (
              <div className="space-y-2">
                <Label className="text-indigo-600">برومت التصميم المقسوم (Split Layout):</Label>
                <div className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-md text-sm border-r-4 border-indigo-500">
                  <p className="text-muted-foreground">{splitLayoutPrompt}</p>
                </div>
              </div>
            )}
            
            {geometricMaskingPrompt && (
              <div className="space-y-2">
                <Label className="text-pink-600">برومت القص الهندسي (Geometric Masking):</Label>
                <div className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 rounded-md text-sm border-r-4 border-pink-500">
                  <p className="text-muted-foreground">{geometricMaskingPrompt}</p>
                </div>
              </div>
            )}
            
            {minimalistFramePrompt && (
              <div className="space-y-2">
                <Label className="text-gray-600">برومت الإطار البسيط (Minimalist Frame):</Label>
                <div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20 rounded-md text-sm border-r-4 border-gray-500">
                  <p className="text-muted-foreground">{minimalistFramePrompt}</p>
                </div>
              </div>
            )}
            
            {gradientOverlayPrompt && (
              <div className="space-y-2">
                <Label className="text-violet-600">برومت طبقة التدرج اللوني (Gradient Overlay):</Label>
                <div className="p-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 rounded-md text-sm border-r-4 border-violet-500">
                  <p className="text-muted-foreground">{gradientOverlayPrompt}</p>
                </div>
              </div>
            )}
            
            {asymmetricalLayoutPrompt && (
              <div className="space-y-2">
                <Label className="text-cyan-600">برومت التصميم غير المتماثل (Asymmetrical Layout):</Label>
                <div className="p-3 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20 rounded-md text-sm border-r-4 border-cyan-500">
                  <p className="text-muted-foreground">{asymmetricalLayoutPrompt}</p>
                </div>
              </div>
            )}
            
            {duotoneDesignPrompt && (
              <div className="space-y-2">
                <Label className="text-amber-600">برومت التصميم ثنائي اللون (Duotone Design):</Label>
                <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-md text-sm border-r-4 border-amber-500">
                  <p className="text-muted-foreground">{duotoneDesignPrompt}</p>
                </div>
              </div>
            )}
            
            {cutoutTypographyPrompt && (
              <div className="space-y-2">
                <Label className="text-red-600">برومت قص النصوص (Cutout Typography):</Label>
                <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 rounded-md text-sm border-r-4 border-red-500">
                  <p className="text-muted-foreground">{cutoutTypographyPrompt}</p>
                </div>
              </div>
            )}
            
            {overlayPatternPrompt && (
              <div className="space-y-2">
                <Label className="text-emerald-600">برومت طبقة النقوش (Overlay Pattern):</Label>
                <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-md text-sm border-r-4 border-emerald-500">
                  <p className="text-muted-foreground">{overlayPatternPrompt}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                النمط: {imageStyle || 'احترافي'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Gemini Image Generation
              </Badge>
              {geniusPrompt && (
                <Badge variant="outline" className="text-xs bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0">
                  جينيوس متوفر
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* أزرار توليد الأنماط المختلفة */}
        {!generatedImages && imagePrompt && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* زر توليد عادي */}
            <Button
              onClick={handleGenerateImage}
              disabled={isGenerating}
              className="h-12"
              variant="default"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  جاري التوليد...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  توليد عادي
                </>
              )}
            </Button>

            {/* زر توليد جينيوس */}
            {geniusPrompt && (
              <Button
                onClick={() => handleRegenerateImage('genius')}
                disabled={isGenerating}
                className="h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    توليد جينيوس
                  </>
                )}
              </Button>
            )}

            {/* زر توليد كولاج */}
            {collagePrompt && (
              <Button
                onClick={() => handleGenerateFromNewPrompt('collage')}
                disabled={isGenerating}
                className="h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    توليد كولاج
                  </>
                )}
              </Button>
            )}

            {/* زر توليد قص عضوي */}
            {organicMaskPrompt && (
              <Button
                onClick={() => handleGenerateFromNewPrompt('organic')}
                disabled={isGenerating}
                className="h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    قص عضوي
                  </>
                )}
              </Button>
            )}

            {/* زر توليد علامة تجارية اجتماعية */}
            {socialBrandingPrompt && (
              <Button
                onClick={() => handleGenerateFromNewPrompt('social')}
                disabled={isGenerating}
                className="h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    علامة تجارية
                  </>
                )}
              </Button>
            )}

            {/* الأزرار الجديدة للأنماط المتقدمة */}
            
            {/* زر توليد التصميم المقسوم */}
            {splitLayoutPrompt && (
              <Button
                onClick={() => handleGenerateFromNewPrompt('splitLayout')}
                disabled={isGenerating}
                className="h-12 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    تصميم مقسوم
                  </>
                )}
              </Button>
            )}

            {/* زر توليد القص الهندسي */}
            {geometricMaskingPrompt && (
              <Button
                onClick={() => handleGenerateFromNewPrompt('geometricMasking')}
                disabled={isGenerating}
                className="h-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    قص هندسي
                  </>
                )}
              </Button>
            )}

            {/* زر توليد الإطار البسيط */}
            {minimalistFramePrompt && (
              <Button
                onClick={() => handleGenerateFromNewPrompt('minimalistFrame')}
                disabled={isGenerating}
                className="h-12 bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    إطار بسيط
                  </>
                )}
              </Button>
            )}

            {/* زر توليد طبقة التدرج اللوني */}
            {gradientOverlayPrompt && (
              <Button
                onClick={() => handleGenerateFromNewPrompt('gradientOverlay')}
                disabled={isGenerating}
                className="h-12 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    تدرج لوني
                  </>
                )}
              </Button>
            )}

            {/* زر توليد التصميم غير المتماثل */}
            {asymmetricalLayoutPrompt && (
              <Button
                onClick={() => handleGenerateFromNewPrompt('asymmetricalLayout')}
                disabled={isGenerating}
                className="h-12 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    غير متماثل
                  </>
                )}
              </Button>
            )}

            {/* زر توليد التصميم ثنائي اللون */}
            {duotoneDesignPrompt && (
              <Button
                onClick={() => handleGenerateFromNewPrompt('duotoneDesign')}
                disabled={isGenerating}
                className="h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    ثنائي اللون
                  </>
                )}
              </Button>
            )}

            {/* زر توليد قص النصوص */}
            {cutoutTypographyPrompt && (
              <Button
                onClick={() => handleGenerateFromNewPrompt('cutoutTypography')}
                disabled={isGenerating}
                className="h-12 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    قص نصوص
                  </>
                )}
              </Button>
            )}

            {/* زر توليد طبقة النقوش */}
            {overlayPatternPrompt && (
              <Button
                onClick={() => handleGenerateFromNewPrompt('overlayPattern')}
                disabled={isGenerating}
                className="h-12 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    طبقة نقوش
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* عرض الصور المولدة */}
        {generatedImages && (
          <Tabs defaultValue="original" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="original">
                الصور العادية ({generatedImages.originalImages.length})
              </TabsTrigger>
              <TabsTrigger value="genius">
                النمط جينيوس ({generatedImages.geniusImages?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="edited">
                المعدلة ({generatedImages.editedImages.length})
              </TabsTrigger>
            </TabsList>

            {/* الصور الأصلية */}
            <TabsContent value="original" className="space-y-6">
              {generatedImages.originalImages.map((image, index) => (
                <Card key={index} className="overflow-hidden border-2 border-primary/10 bg-gradient-to-br from-background to-muted/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">الصورة العادية {index + 1}</h4>
                          <p className="text-xs text-muted-foreground">{generatedImages.originalImages.length} صورة مولدة</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0">
                          عادي
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRegenerateImage('normal')}
                          disabled={isGenerating}
                          className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200 text-green-700"
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              جاري التوليد...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-3 w-3 mr-1" />
                              إعادة التوليد
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <img
                        src={image.imageUrl}
                        alt={`صورة عادية ${index + 1}`}
                        className="w-full max-w-2xl mx-auto rounded-xl shadow-2xl border border-primary/20 hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                  
                    {image.description && (
                      <div className="mt-4 space-y-2">
                        <Label className="text-primary font-medium">وصف Gemini:</Label>
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-primary/20">
                          <p className="text-sm text-foreground leading-relaxed">
                            {image.description}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-4 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyImageData(image.imageData, `original-${index}`)}
                        className="bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 border-cyan-200 text-cyan-700"
                      >
                        {copied === `original-${index}` ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            تم النسخ
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            نسخ البيانات
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(image.imageUrl, `generated-image-${index + 1}.png`)}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200 text-green-700"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        تحميل
                      </Button>
                      <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200">
                        {image.mimeType}
                      </Badge>
                    </div>
                  
                    {/* إدخال تعديل للصورة العادية */}
                    <div className="mt-6 space-y-4 pt-4 border-t border-primary/20">
                      <Label htmlFor={`editPrompt-normal-${index}`} className="text-primary font-medium">
                        تعديل الصورة العادية باستخدام Gemini:
                      </Label>
                      <div className="flex gap-3">
                        <Input
                          id={`editPrompt-normal-${index}`}
                          value={editPrompt}
                          onChange={(e) => setEditPrompt(e.target.value)}
                          placeholder="مثال: أضف سماء زرقاء، غير اللون إلى أحمر، أضف نباتات..."
                          className="flex-1 border-primary/30 focus:border-primary/50 bg-gradient-to-r from-background to-muted/20"
                        />
                        <Button
                          onClick={() => handleEditImage(image.imageData, image.mimeType, editPrompt, 'normal')}
                          disabled={isGenerating || !editPrompt.trim()}
                          size="sm"
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                        >
                          {isGenerating ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Edit3 className="h-3 w-3 mr-1" />
                              تعديل
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* تحميل جميع الصور */}
              {generatedImages.originalImages.length > 1 && (
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      generatedImages.originalImages.forEach((image, index) => {
                        setTimeout(() => {
                          handleDownload(image.imageUrl, `generated-image-${index + 1}.png`);
                        }, index * 500);
                      });
                      toast.success(`جاري تحميل ${generatedImages.originalImages.length} صور...`);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    تحميل جميع الصور ({generatedImages.originalImages.length})
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* صور النمط جينيوس */}
            <TabsContent value="genius" className="space-y-4">
              {(!generatedImages.geniusImages || generatedImages.geniusImages.length === 0) ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>لم يتم إنشاء صور بالنمط جينيوس بعد</p>
                  {!geniusPrompt ? (
                    <p className="text-sm text-orange-600">⚠️ لم يتم توليد برومت جينيوس من المرحلة الثانية</p>
                  ) : (
                    <p className="text-sm">برومت جينيوس متوفر، انقر على "توليد الصورة" لإنشاء الصور</p>
                  )}
                </div>
              ) : (
                generatedImages.geniusImages.map((image, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          صورة جينيوس {index + 1} من {generatedImages.geniusImages.length}
                        </span>
                        <Badge variant="outline" className="text-xs bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0">
                          جينيوس
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerateImage('genius')}
                        disabled={isGenerating || !geniusPrompt}
                      >
                        {isGenerating ? (
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3 mr-1" />
                        )}
                        إعادة التوليد
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-950/20 dark:to-cyan-950/20">
                      <img
                        src={image.imageUrl}
                        alt={`صورة جينيوس ${index + 1}`}
                        className="max-w-full mx-auto rounded-md shadow-lg"
                      />
                    </div>
                    
                    {image.description && (
                      <div className="space-y-2">
                        <Label>وصف Gemini (جينيوس):</Label>
                        <p className="text-sm text-muted-foreground p-3 bg-gradient-to-r from-emerald-50/50 to-cyan-50/50 dark:from-emerald-950/10 dark:to-cyan-950/10 rounded-md">
                          {image.description}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyImageData(image.imageData, `genius-${index}`)}
                      >
                        {copied === `genius-${index}` ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            تم النسخ
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            نسخ البيانات
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(image.imageUrl, `genius-image-${index + 1}.png`)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        تحميل
                      </Button>
                      <Badge variant="secondary" className="text-xs">
                        {image.mimeType}
                      </Badge>
                    </div>
                    
                    {/* إدخال تعديل لصورة جينيوس */}
                    <div className="space-y-3 pt-4 border-t border-emerald-200">
                      <Label htmlFor={`editPrompt-genius-${index}`}>تعديل صورة جينيوس باستخدام Gemini:</Label>
                      <div className="flex gap-2">
                        <Input
                          id={`editPrompt-genius-${index}`}
                          value={editPrompt}
                          onChange={(e) => setEditPrompt(e.target.value)}
                          placeholder="مثال: أضف عناصر أكثر إبداعاً، غير الألوان لتكون أكثر حيوية..."
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleEditImage(image.imageData, image.mimeType, editPrompt, 'genius')}
                          disabled={isGenerating || !editPrompt.trim()}
                          size="sm"
                          className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                        >
                          {isGenerating ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Edit3 className="h-3 w-3 mr-1" />
                              تعديل جينيوس
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {index < generatedImages.geniusImages.length - 1 && (
                      <hr className="my-4" />
                    )}
                  </div>
                ))
              )}
            </TabsContent>

            {/* الصور المعدلة */}
            <TabsContent value="edited" className="space-y-4">
              {generatedImages.editedImages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Edit3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>لم يتم إنشاء صور معدلة بعد</p>
                  <p className="text-sm">انتقل إلى الصور الأصلية أو جينيوس لإضافة تعديلات</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {generatedImages.editedImages.map((editedImage, index) => (
                    <div key={index} className="space-y-3 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium">
                            تعديل {index + 1}: {editedImage.editPrompt}
                          </Label>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${(editedImage as any).originalType === 'genius' 
                              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0' 
                              : ''}`}
                          >
                            {(editedImage as any).originalType === 'genius' ? 'معدل من جينيوس' : 'معدل من عادي'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
                        <img
                          src={editedImage.imageUrl}
                          alt={`صورة معدلة ${index + 1}`}
                          className="max-w-full mx-auto rounded-md shadow-lg"
                        />
                      </div>

                      {editedImage.description && (
                        <p className="text-sm text-muted-foreground p-2 bg-muted/30 rounded text-center">
                          {editedImage.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyImageData(editedImage.imageData, `edited-${index}`)}
                        >
                          {copied === `edited-${index}` ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              تم النسخ
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              نسخ البيانات
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(editedImage.imageUrl, `edited-image-${index + 1}.png`)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          تحميل
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* عرض الأخطاء */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* رسالة في حالة عدم وجود برومت */}
        {!imagePrompt && (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>في انتظار برومت الصورة من المرحلة الثانية</p>
            <p className="text-sm">قم بتوليد المحتوى أولاً للحصول على برومت الصورة</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};