import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useGeminiImageGeneration } from "@/hooks/useGeminiImageGeneration";
import { useGeminiApiKey } from "@/hooks/useGeminiApiKey";
import { GeminiApiKeyPrompt } from "@/components/GeminiApiKeyPrompt";
import { 
  ImageIcon, 
  Edit3, 
  Download, 
  RefreshCw, 
  Sparkles,
  Wand2,
  Copy,
  Check,
  Palette,
  Brain
} from "lucide-react";
import { toast } from "sonner";
import { useGeminiImagePrompt } from "@/hooks/useGeminiImagePrompt";
import { PromptStyleGenerator } from "@/components/PromptStyleGenerator";
import { StyleImageGallery } from "@/components/StyleImageGallery";

interface GeneratedStyleImage {
  imageUrl: string;
  imageData: string;
  description?: string;
  mimeType: string;
  style: string;
  styleName: string;
  timestamp: number;
}

export const GeminiImageGenerator: React.FC = () => {
  const { apiKey, hasApiKey, saveApiKey, isLoaded } = useGeminiApiKey();
  const [textPrompt, setTextPrompt] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States for new system
  const [generatedPrompts, setGeneratedPrompts] = useState<any>(null);
  const [generatedStyleImages, setGeneratedStyleImages] = useState<GeneratedStyleImage[]>([]);
  
  // hooks
  const { generateImagePrompt, isGenerating: isGeneratingPrompts } = useGeminiImagePrompt();
  
  const {
    generateImage,
    editImage,
    resetImage,
    isGenerating,
    generatedImage,
    error
  } = useGeminiImageGeneration();

  // إظهار واجهة إدخال المفتاح إذا لم يكن موجود
  if (isLoaded && !hasApiKey()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
        <GeminiApiKeyPrompt 
          onApiKeySet={saveApiKey}
          autoFocus={true}
        />
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        toast.error('يرجى اختيار ملف صورة صحيح');
      }
    }
  };

  const handleGenerateImage = async () => {
    if (!textPrompt.trim()) {
      toast.error('يرجى إدخال وصف للصورة المطلوبة');
      return;
    }

    await generateImage({
      prompt: textPrompt,
      apiKey: apiKey
    });
  };

  const handleEditImage = async () => {
    if (!selectedFile) {
      toast.error('يرجى اختيار صورة للتعديل');
      return;
    }
    
    if (!editPrompt.trim()) {
      toast.error('يرجى إدخال وصف التعديل المطلوب');
      return;
    }

    await editImage({
      prompt: editPrompt,
      imageFile: selectedFile,
      apiKey: apiKey
    });
  };

  // Generate prompts for all styles
  const handleGeneratePrompts = async () => {
    if (!textPrompt.trim()) {
      toast.error('يرجى إدخال وصف للصورة المطلوبة');
      return;
    }

    try {
      const imagePrompts = await generateImagePrompt({
        topic: 'صورة مولدة',
        specialty: 'توليد صور متنوعة',
        contentType: 'صور بأنماط متعددة',
        imageStyle: 'متنوع',
        textContent: textPrompt,
        apiKey: apiKey
      });

      if (imagePrompts) {
        setGeneratedPrompts(imagePrompts);
        toast.success('تم توليد جميع البرومتات بنجاح!');
      }
    } catch (error) {
      console.error('Error generating prompts:', error);
      toast.error('فشل في توليد البرومتات');
    }
  };

  // Handle image generation from style
  const handleImageGenerated = (image: any, style: string) => {
    const styleNames: Record<string, string> = {
      normal: 'النمط العادي',
      genius: 'نمط جينيوس',
      collage: 'تصميم كولاج',
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

    const newImage: GeneratedStyleImage = {
      ...image,
      style,
      styleName: styleNames[style] || style,
      timestamp: Date.now()
    };

    setGeneratedStyleImages(prev => [...prev, newImage]);
  };

  const handleClearGallery = () => {
    setGeneratedStyleImages([]);
    toast.success('تم مسح المعرض');
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage.imageUrl;
    link.download = `gemini-generated-image.${generatedImage.mimeType.split('/')[1]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تم تحميل الصورة بنجاح');
  };

  const handleCopyImageData = async () => {
    if (!generatedImage) return;

    try {
      await navigator.clipboard.writeText(generatedImage.imageData);
      setCopied(true);
      toast.success('تم نسخ بيانات الصورة');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('فشل في نسخ بيانات الصورة');
    }
  };

  const handleReset = () => {
    resetImage();
    setTextPrompt('');
    setEditPrompt('');
    setSelectedFile(null);
    setGeneratedPrompts(null);
    setGeneratedStyleImages([]);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            🎨 نظام توليد المحتوى السريع - Gemini
          </h1>
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <p className="text-muted-foreground">
          قم بتوليد وتعديل الصور باستخدام الذكاء الاصطناعي المتطور من Google Gemini
        </p>
        <Badge variant="secondary" className="text-xs">
          gemini-2.0-flash-preview-image-generation
        </Badge>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            توليد صورة جديدة
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            تعديل صورة موجودة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                توليد صورة من النص
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="textPrompt">وصف الصورة المطلوبة</Label>
                <Textarea
                  id="textPrompt"
                  placeholder="صف الصورة التي تريد توليدها بالتفصيل... مثال: صورة لمنظر طبيعي جميل مع شلال وأشجار خضراء في ضوء الشمس الذهبي"
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button 
                  onClick={handleGenerateImage}
                  disabled={isGenerating || isGeneratingPrompts || !textPrompt.trim()}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      جاري التوليد...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      توليد صورة واحدة
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleGeneratePrompts}
                  disabled={isGenerating || isGeneratingPrompts || !textPrompt.trim()}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  size="lg"
                >
                  {isGeneratingPrompts ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      جاري التوليد...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      توليد البرومتات
                    </>
                  )}
                </Button>

                <Button 
                  onClick={handleReset}
                  variant="destructive"
                  size="lg"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  إعادة تعيين
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Style Generator */}
          <PromptStyleGenerator 
            generatedPrompts={generatedPrompts}
            originalPrompt={textPrompt}
            apiKey={apiKey}
            onImageGenerated={handleImageGenerated}
          />
        </TabsContent>

        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                تعديل صورة موجودة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fileInput">اختر صورة للتعديل</Label>
                <Input
                  ref={fileInputRef}
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
              </div>

              {previewUrl && (
                <div className="space-y-2">
                  <Label>معاينة الصورة المختارة:</Label>
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <img
                      src={previewUrl}
                      alt="صورة مختارة للتعديل"
                      className="max-w-full max-h-64 mx-auto rounded-md object-contain"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="editPrompt">وصف التعديل المطلوب</Label>
                <Textarea
                  id="editPrompt"
                  placeholder="صف التعديل الذي تريده... مثال: أضف قطة بجانب الشجرة، غير لون السماء إلى وردي، أضف قمر في السماء"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              
              <Button 
                onClick={handleEditImage}
                disabled={isGenerating || !selectedFile || !editPrompt.trim()}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    جاري التعديل...
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    تعديل الصورة
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* عرض النتيجة */}
      {generatedImage && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                الصورة المولدة
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyImageData}
                  className="text-xs"
                >
                  {copied ? (
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
                  onClick={handleDownload}
                >
                  <Download className="h-3 w-3 mr-1" />
                  تحميل
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <img
                src={generatedImage.imageUrl}
                alt="صورة مولدة بواسطة Gemini"
                className="max-w-full mx-auto rounded-md shadow-lg"
              />
            </div>
            
            {generatedImage.description && (
              <div className="space-y-2">
                <Label>وصف Gemini للصورة:</Label>
                <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
                  {generatedImage.description}
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Badge variant="secondary">
                {generatedImage.mimeType}
              </Badge>
              <span>حجم البيانات: {Math.round(generatedImage.imageData.length * 0.75)} بايت</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery */}
      <StyleImageGallery 
        images={generatedStyleImages}
        onClearGallery={handleClearGallery}
      />

      {/* عرض الأخطاء */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <span className="text-sm font-medium">خطأ:</span>
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};