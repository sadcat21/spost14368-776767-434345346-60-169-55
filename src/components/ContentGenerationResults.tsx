import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, FileText, Image as ImageIcon, MessageSquare, Download, Share2, RotateCcw, Palette, Zap } from "lucide-react";
import { toast } from "sonner";
import { GeneratedContentImages } from "./GeneratedContentImages";
import { ImageGalleryWithPreview } from "./ImageGalleryWithPreview";
import { PromptStyleGenerator } from "./PromptStyleGenerator";
import { FacebookImagePublisher } from "./FacebookImagePublisher";

interface GeneratedText {
  longText: string;
  shortText: string;
  hashtags: string[];
}

interface GeneratedImagePrompt {
  imagePrompt: string;
  geniusPrompt: string;
  collagePrompt: string;
  organicMaskPrompt: string;
  socialBrandingPrompt: string;
  splitLayoutPrompt: string;
  geometricMaskingPrompt: string;
  minimalistFramePrompt: string;
  gradientOverlayPrompt: string;
  asymmetricalLayoutPrompt: string;
  duotoneDesignPrompt: string;
  cutoutTypographyPrompt: string;
  overlayPatternPrompt: string;
  technicalNetworkPrompt: string;
  style: string;
  elements: string[];
  mood: string;
  composition: string;
}

interface GeneratedQuestions {
  questions: string[];
  questionTypes: string[];
  engagementTips: string[];
}

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

interface ContentGenerationResultsProps {
  generatedText?: GeneratedText | null;
  generatedPrompt?: GeneratedImagePrompt | null;
  generatedQuestions?: GeneratedQuestions | null;
  generatedImages?: GeneratedImageWithEdit | null;
  isTextLoading?: boolean;
  isPromptLoading?: boolean;
  isQuestionsLoading?: boolean;
  isImageLoading?: boolean;
  currentStep?: string;
  onRegenerateImages?: () => void;
  onRegenerateSingleImage?: (prompt: string, style: string) => void;
  onUpdateImages?: (updatedImages: GeneratedImageWithEdit) => void;
  apiKey?: string;
  originalPrompt?: string; // لاستخدامه في النشر
}

export const ContentGenerationResults: React.FC<ContentGenerationResultsProps> = ({
  generatedText,
  generatedPrompt,
  generatedQuestions,
  generatedImages,
  isTextLoading = false,
  isPromptLoading = false,
  isQuestionsLoading = false,
  isImageLoading = false,
  currentStep = 'idle',
  onRegenerateImages,
  onRegenerateSingleImage,
  onUpdateImages,
  apiKey,
  originalPrompt
}) => {

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${type} إلى الحافظة`);
  };

  const hasAnyContent = generatedText || generatedPrompt || generatedQuestions || generatedImages;
  const hasAnyLoading = isTextLoading || isPromptLoading || isQuestionsLoading || isImageLoading;

  if (!hasAnyContent && !hasAnyLoading) {
    return (
      <Card className="mt-6">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">لا توجد نتائج حتى الآن</p>
            <p className="text-sm">اضغط على "توليد المحتوى" لبدء إنشاء المحتوى</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          نتائج توليد المحتوى
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              المحتوى النصي
              {isTextLoading && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
              {generatedText && <Badge variant="secondary" className="text-xs">✓</Badge>}
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              برومت الصورة
              {isPromptLoading && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
              {generatedPrompt && <Badge variant="secondary" className="text-xs">✓</Badge>}
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              الأسئلة التفاعلية
              {isQuestionsLoading && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
              {generatedQuestions && <Badge variant="secondary" className="text-xs">✓</Badge>}
            </TabsTrigger>
            <TabsTrigger value="generated-images" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              الصور المولدة
              {isImageLoading && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
              {generatedImages && <Badge variant="secondary" className="text-xs">✓</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* المحتوى النصي */}
          <TabsContent value="text" className="space-y-4">
            {isTextLoading ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>جاري توليد المحتوى النصي...</span>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </div>
            ) : generatedText ? (
              <div className="space-y-6">
                {/* النص الطويل */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-primary">النص الطويل (المنشور الرئيسي)</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(generatedText.longText, 'النص الطويل')}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      نسخ
                    </Button>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg border-r-4 border-primary">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{generatedText.longText}</p>
                  </div>
                </div>

                <Separator />

                {/* النص القصير */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-primary">النص القصير (الملخص)</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(generatedText.shortText, 'النص القصير')}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      نسخ
                    </Button>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg border-r-4 border-secondary">
                    <p className="text-sm leading-relaxed">{generatedText.shortText}</p>
                  </div>
                </div>

                <Separator />

                {/* الهاشتاغات */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-primary">الهاشتاغات</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(generatedText.hashtags.join(' '), 'الهاشتاغات')}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      نسخ
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {generatedText.hashtags.map((hashtag, index) => (
                      <Badge key={index} variant="outline" className="px-3 py-1 text-sm">
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لم يتم توليد المحتوى النصي بعد</p>
              </div>
            )}
          </TabsContent>

          {/* برومت الصورة */}
          <TabsContent value="image" className="space-y-4">
            {isPromptLoading ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>جاري توليد برومت الصورة...</span>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-4/5" />
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                </div>
              </div>
            ) : generatedPrompt ? (
              <div className="space-y-6">
                {/* برومت الصورة العادي */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-primary">برومت الصورة العادي (للذكاء الاصطناعي)</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(generatedPrompt.imagePrompt, 'برومت الصورة العادي')}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      نسخ
                    </Button>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg border-r-4 border-primary">
                    <p className="text-sm leading-relaxed font-mono">{generatedPrompt.imagePrompt}</p>
                  </div>
                </div>

                {/* برومت النمط جينيوس */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-emerald-600">برومت النمط جينيوس (إبداعي)</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(generatedPrompt.geniusPrompt, 'برومت النمط جينيوس')}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      نسخ
                    </Button>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-950/20 dark:to-cyan-950/20 rounded-lg border-r-4 border-emerald-500">
                    <p className="text-sm leading-relaxed font-mono">{generatedPrompt.geniusPrompt}</p>
                  </div>
                </div>

                {/* برومت تصميم الكولاج */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-orange-600">برومت تصميم الكولاج (متعدد الصور)</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(generatedPrompt.collagePrompt, 'برومت تصميم الكولاج')}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      نسخ
                    </Button>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 rounded-lg border-r-4 border-orange-500">
                    <p className="text-sm leading-relaxed font-mono">{generatedPrompt.collagePrompt}</p>
                  </div>
                </div>

                {/* برومت القص العضوي */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-purple-600">برومت القص العضوي (أشكال طبيعية)</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(generatedPrompt.organicMaskPrompt, 'برومت القص العضوي')}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      نسخ
                    </Button>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border-r-4 border-purple-500">
                    <p className="text-sm leading-relaxed font-mono">{generatedPrompt.organicMaskPrompt}</p>
                  </div>
                </div>

                {/* برومت العلامة التجارية الاجتماعية */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-blue-600">برومت العلامة التجارية الاجتماعية (وسائل التواصل)</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(generatedPrompt.socialBrandingPrompt, 'برومت العلامة التجارية الاجتماعية')}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      نسخ
                    </Button>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border-r-4 border-blue-500">
                    <p className="text-sm leading-relaxed font-mono">{generatedPrompt.socialBrandingPrompt}</p>
                  </div>
                </div>

                {/* البرومتات الجديدة - الأنماط المتقدمة */}
                
                {/* برومت التصميم المقسوم */}
                {generatedPrompt.splitLayoutPrompt && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-indigo-600">برومت التصميم المقسوم (Split Layout)</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(generatedPrompt.splitLayoutPrompt, 'برومت التصميم المقسوم')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        نسخ
                      </Button>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-lg border-r-4 border-indigo-500">
                      <p className="text-sm leading-relaxed font-mono">{generatedPrompt.splitLayoutPrompt}</p>
                    </div>
                  </div>
                )}

                {/* برومت القص الهندسي */}
                {generatedPrompt.geometricMaskingPrompt && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-pink-600">برومت القص الهندسي (Geometric Masking)</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(generatedPrompt.geometricMaskingPrompt, 'برومت القص الهندسي')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        نسخ
                      </Button>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 rounded-lg border-r-4 border-pink-500">
                      <p className="text-sm leading-relaxed font-mono">{generatedPrompt.geometricMaskingPrompt}</p>
                    </div>
                  </div>
                )}

                {/* برومت الإطار البسيط */}
                {generatedPrompt.minimalistFramePrompt && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-600">برومت الإطار البسيط (Minimalist Frame)</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(generatedPrompt.minimalistFramePrompt, 'برومت الإطار البسيط')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        نسخ
                      </Button>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20 rounded-lg border-r-4 border-gray-500">
                      <p className="text-sm leading-relaxed font-mono">{generatedPrompt.minimalistFramePrompt}</p>
                    </div>
                  </div>
                )}

                {/* برومت طبقة التدرج اللوني */}
                {generatedPrompt.gradientOverlayPrompt && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-violet-600">برومت طبقة التدرج اللوني (Gradient Overlay)</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(generatedPrompt.gradientOverlayPrompt, 'برومت طبقة التدرج اللوني')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        نسخ
                      </Button>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 rounded-lg border-r-4 border-violet-500">
                      <p className="text-sm leading-relaxed font-mono">{generatedPrompt.gradientOverlayPrompt}</p>
                    </div>
                  </div>
                )}

                {/* برومت التصميم غير المتماثل */}
                {generatedPrompt.asymmetricalLayoutPrompt && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-cyan-600">برومت التصميم غير المتماثل (Asymmetrical Layout)</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(generatedPrompt.asymmetricalLayoutPrompt, 'برومت التصميم غير المتماثل')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        نسخ
                      </Button>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20 rounded-lg border-r-4 border-cyan-500">
                      <p className="text-sm leading-relaxed font-mono">{generatedPrompt.asymmetricalLayoutPrompt}</p>
                    </div>
                  </div>
                )}

                {/* برومت التصميم ثنائي اللون */}
                {generatedPrompt.duotoneDesignPrompt && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-amber-600">برومت التصميم ثنائي اللون (Duotone Design)</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(generatedPrompt.duotoneDesignPrompt, 'برومت التصميم ثنائي اللون')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        نسخ
                      </Button>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border-r-4 border-amber-500">
                      <p className="text-sm leading-relaxed font-mono">{generatedPrompt.duotoneDesignPrompt}</p>
                    </div>
                  </div>
                )}

                {/* برومت قص النصوص */}
                {generatedPrompt.cutoutTypographyPrompt && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-red-600">برومت قص النصوص (Cutout Typography)</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(generatedPrompt.cutoutTypographyPrompt, 'برومت قص النصوص')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        نسخ
                      </Button>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 rounded-lg border-r-4 border-red-500">
                      <p className="text-sm leading-relaxed font-mono">{generatedPrompt.cutoutTypographyPrompt}</p>
                    </div>
                  </div>
                )}

                 {/* برومت طبقة النقوش */}
                {generatedPrompt.overlayPatternPrompt && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-emerald-600">برومت طبقة النقوش (Overlay Pattern)</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(generatedPrompt.overlayPatternPrompt, 'برومت طبقة النقوش')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        نسخ
                      </Button>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-lg border-r-4 border-emerald-500">
                      <p className="text-sm leading-relaxed font-mono">{generatedPrompt.overlayPatternPrompt}</p>
                    </div>
                  </div>
                )}

                {/* برومت الشبكة التقنية المتدرجة - الجديد */}
                {generatedPrompt.technicalNetworkPrompt && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-600">برومت الشبكة التقنية المتدرجة (Technical Network)</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(generatedPrompt.technicalNetworkPrompt, 'برومت الشبكة التقنية المتدرجة')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        نسخ
                      </Button>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-slate-50 to-zinc-50 dark:from-slate-950/20 dark:to-zinc-950/20 rounded-lg border-r-4 border-slate-500">
                      <p className="text-sm leading-relaxed font-mono">{generatedPrompt.technicalNetworkPrompt}</p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* النمط */}
                  <div>
                    <h4 className="font-semibold text-primary mb-2">النمط الفني</h4>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm">{generatedPrompt.style}</p>
                    </div>
                  </div>

                  {/* المزاج */}
                  <div>
                    <h4 className="font-semibold text-primary mb-2">المزاج العام</h4>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm">{generatedPrompt.mood}</p>
                    </div>
                  </div>
                </div>

                {/* العناصر الأساسية */}
                <div>
                  <h4 className="font-semibold text-primary mb-2">العناصر الأساسية</h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedPrompt.elements.map((element, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {element}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* التركيب */}
                <div>
                  <h4 className="font-semibold text-primary mb-2">التركيب والتأطير</h4>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm">{generatedPrompt.composition}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لم يتم توليد برومت الصورة بعد</p>
              </div>
            )}
          </TabsContent>

          {/* الأسئلة التفاعلية */}
          <TabsContent value="questions" className="space-y-4">
            {isQuestionsLoading ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>جاري توليد الأسئلة التفاعلية...</span>
                </div>
                <div className="space-y-2">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="h-4 bg-muted rounded animate-pulse" style={{ width: `${Math.random() * 50 + 50}%` }} />
                  ))}
                </div>
              </div>
            ) : generatedQuestions ? (
              <div className="space-y-6">
                {/* الأسئلة */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-primary">الأسئلة التفاعلية (7 أسئلة)</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(generatedQuestions.questions.join('\n\n'), 'الأسئلة التفاعلية')}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      نسخ الكل
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {generatedQuestions.questions.map((question, index) => (
                      <div key={index} className="p-4 bg-muted/30 rounded-lg border-r-4 border-secondary">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {generatedQuestions.questionTypes[index] || `سؤال ${index + 1}`}
                              </Badge>
                            </div>
                            <p className="text-sm leading-relaxed">{question}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(question, `السؤال ${index + 1}`)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* نصائح التفاعل */}
                {generatedQuestions.engagementTips && generatedQuestions.engagementTips.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-primary mb-2">نصائح لزيادة التفاعل</h4>
                    <div className="space-y-2">
                      {generatedQuestions.engagementTips.map((tip, index) => (
                        <div key={index} className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-r-4 border-blue-400">
                          <p className="text-sm text-blue-700 dark:text-blue-300">💡 {tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لم يتم توليد الأسئلة التفاعلية بعد</p>
              </div>
            )}
          </TabsContent>

          {/* الصور المولدة */}
          <TabsContent value="generated-images" className="space-y-6">
            {/* أزرار إعادة التوليد */}
            {onRegenerateImages && (
              <div className="flex justify-center gap-4 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border-2 border-primary/20">
                <Button
                  onClick={onRegenerateImages}
                  disabled={isImageLoading}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                  size="lg"
                >
                  {isImageLoading ? (
                    <>
                      <RotateCcw className="h-5 w-5 mr-2 animate-spin" />
                      جاري إعادة التوليد...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      إعادة توليد جميع الأنماط (13 صورة)
                    </>
                  )}
                </Button>
              </div>
            )}

            {(isImageLoading || currentStep === 'image-generation') ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600 mb-4">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>جاري توليد الصور بجميع الأنماط...</span>
                </div>
                <ImageGalleryWithPreview 
                  generatedImages={generatedImages} 
                  isLoading={true}
                  onRegenerate={onRegenerateSingleImage}
                  textContent={generatedText?.longText || ''}
                  interactiveQuestions={generatedQuestions?.questions || []}
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* عرض معرض الصور مع أزرار إعادة التوليد الفردية */}
                <Card className="border-2 border-primary/30 bg-gradient-to-br from-card via-card to-muted/30 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/20">
                    <CardTitle className="flex items-center gap-3">
                      <div className="relative">
                        <Palette className="h-6 w-6 text-primary animate-pulse" />
                        <div className="absolute inset-0 h-6 w-6 text-primary animate-ping opacity-75"></div>
                      </div>
                      <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        معرض الصور المولدة - 13 نمط مختلف
                      </span>
                      {generatedImages && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                          {[
                            ...generatedImages.originalImages,
                            ...generatedImages.geniusImages,
                            ...generatedImages.collageImages,
                            ...generatedImages.organicImages,
                            ...generatedImages.socialImages,
                            ...generatedImages.splitLayoutImages,
                            ...generatedImages.geometricMaskingImages,
                            ...generatedImages.minimalistFrameImages,
                            ...generatedImages.gradientOverlayImages,
                            ...generatedImages.asymmetricalLayoutImages,
                            ...generatedImages.duotoneDesignImages,
                             ...generatedImages.cutoutTypographyImages,
                             ...generatedImages.overlayPatternImages,
                             ...generatedImages.technicalNetworkImages
                           ].length} صورة
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ImageGalleryWithPreview 
                      generatedImages={generatedImages} 
                      isLoading={false}
                      onRegenerate={onRegenerateSingleImage}
                      textContent={generatedText?.longText || ''}
                      interactiveQuestions={generatedQuestions?.questions || []}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* مولد الصور بالأنماط المختلفة */}
            {generatedPrompt && apiKey && (
              <div className="mt-8 border-t pt-6">
                <h4 className="text-lg font-semibold mb-4">🎨 مولد الصور بالأنماط المختلفة</h4>
                <PromptStyleGenerator
                  generatedPrompts={generatedPrompt}
                  originalPrompt={generatedPrompt.imagePrompt}
                  apiKey={apiKey}
                  onImageGenerated={(image, style) => {
                    console.log('📸 إضافة صورة جديدة للمعرض:', style, image);
                    console.log('📊 حالة المعرض قبل الإضافة:', generatedImages);
                    
                    // إضافة الصورة للمعرض حسب النمط
                    if (image && image.imageUrl) {
                      console.log('🔄 تحديث المعرض للنمط:', style);
                      
                      // الحصول على أحدث حالة من generatedImages أو إنشاء حالة جديدة
                      const currentImages = generatedImages || {
                        originalImages: [],
                        geniusImages: [],
                        collageImages: [],
                        organicImages: [],
                        socialImages: [],
                        splitLayoutImages: [],
                        geometricMaskingImages: [],
                        minimalistFrameImages: [],
                        gradientOverlayImages: [],
                        asymmetricalLayoutImages: [],
                        duotoneDesignImages: [],
                        cutoutTypographyImages: [],
                        overlayPatternImages: [],
                        technicalNetworkImages: [],
                        editedImages: []
                      };

                      // إنشاء نسخة جديدة مع ضمان وجود جميع المصفوفات
                      const updatedImages = {
                        originalImages: [...(currentImages.originalImages || [])],
                        geniusImages: [...(currentImages.geniusImages || [])],
                        collageImages: [...(currentImages.collageImages || [])],
                        organicImages: [...(currentImages.organicImages || [])],
                        socialImages: [...(currentImages.socialImages || [])],
                        splitLayoutImages: [...(currentImages.splitLayoutImages || [])],
                        geometricMaskingImages: [...(currentImages.geometricMaskingImages || [])],
                        minimalistFrameImages: [...(currentImages.minimalistFrameImages || [])],
                        gradientOverlayImages: [...(currentImages.gradientOverlayImages || [])],
                        asymmetricalLayoutImages: [...(currentImages.asymmetricalLayoutImages || [])],
                        duotoneDesignImages: [...(currentImages.duotoneDesignImages || [])],
                        cutoutTypographyImages: [...(currentImages.cutoutTypographyImages || [])],
                        overlayPatternImages: [...(currentImages.overlayPatternImages || [])],
                        technicalNetworkImages: [...(currentImages.technicalNetworkImages || [])],
                        editedImages: [...(currentImages.editedImages || [])]
                      };

                      // إضافة الصورة الجديدة للنمط المناسب
                      const imageWithStyle = { ...image, style };
                      
                      switch (style) {
                        case 'normal':
                          updatedImages.originalImages.push(imageWithStyle);
                          break;
                        case 'genius':
                          updatedImages.geniusImages.push(imageWithStyle);
                          break;
                        case 'collage':
                          updatedImages.collageImages.push(imageWithStyle);
                          break;
                        case 'organic':
                          updatedImages.organicImages.push(imageWithStyle);
                          break;
                        case 'social':
                          updatedImages.socialImages.push(imageWithStyle);
                          break;
                        case 'splitLayout':
                          updatedImages.splitLayoutImages.push(imageWithStyle);
                          break;
                        case 'geometricMasking':
                          updatedImages.geometricMaskingImages.push(imageWithStyle);
                          break;
                        case 'minimalistFrame':
                          updatedImages.minimalistFrameImages.push(imageWithStyle);
                          break;
                        case 'gradientOverlay':
                          updatedImages.gradientOverlayImages.push(imageWithStyle);
                          break;
                        case 'asymmetricalLayout':
                          updatedImages.asymmetricalLayoutImages.push(imageWithStyle);
                          break;
                        case 'duotoneDesign':
                          updatedImages.duotoneDesignImages.push(imageWithStyle);
                          break;
                        case 'cutoutTypography':
                          updatedImages.cutoutTypographyImages.push(imageWithStyle);
                          break;
                        case 'overlayPattern':
                          updatedImages.overlayPatternImages.push(imageWithStyle);
                          break;
                        case 'technicalNetwork':
                          updatedImages.technicalNetworkImages.push(imageWithStyle);
                          break;
                        default:
                          updatedImages.originalImages.push(imageWithStyle);
                      }

                      // عد الصور الإجمالي بعد الإضافة
                      const totalImages = Object.values(updatedImages).reduce((total, images) => total + images.length, 0);

                      console.log('📊 تم إضافة الصورة - العدد الإجمالي:', totalImages);
                      console.log('🔄 تحديث المعرض بالحالة الجديدة:', updatedImages);
                      
                      // تحديث الحالة بالصور الجديدة
                      onUpdateImages && onUpdateImages(updatedImages);
                      
                      toast.success(`تم إضافة صورة ${style} (المجموع: ${totalImages} صور)`);
                    } else {
                      console.error('❌ الصورة المولدة لا تحتوي على imageUrl');
                      toast.error('فشل في إضافة الصورة للمعرض');
                    }
                  }}
                />
              </div>
            )}

            {/* المكون القديم كنسخة احتياطية */}
            <div className="mt-8 border-t pt-6">
              <h4 className="text-lg font-semibold mb-4 text-muted-foreground">🔧 العرض التقني المفصل</h4>
              <GeneratedContentImages
                imagePrompt={generatedPrompt?.imagePrompt}
                geniusPrompt={generatedPrompt?.geniusPrompt}
                collagePrompt={generatedPrompt?.collagePrompt}
                organicMaskPrompt={generatedPrompt?.organicMaskPrompt}
                socialBrandingPrompt={generatedPrompt?.socialBrandingPrompt}
                splitLayoutPrompt={generatedPrompt?.splitLayoutPrompt}
                geometricMaskingPrompt={generatedPrompt?.geometricMaskingPrompt}
                minimalistFramePrompt={generatedPrompt?.minimalistFramePrompt}
                gradientOverlayPrompt={generatedPrompt?.gradientOverlayPrompt}
                asymmetricalLayoutPrompt={generatedPrompt?.asymmetricalLayoutPrompt}
                duotoneDesignPrompt={generatedPrompt?.duotoneDesignPrompt}
                cutoutTypographyPrompt={generatedPrompt?.cutoutTypographyPrompt}
                overlayPatternPrompt={generatedPrompt?.overlayPatternPrompt}
                technicalNetworkPrompt={generatedPrompt?.technicalNetworkPrompt}
                imageStyle={generatedPrompt?.style}
                generatedImages={generatedImages}
                isVisible={currentStep === 'image-generation' || currentStep === 'complete' || generatedImages !== null}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};