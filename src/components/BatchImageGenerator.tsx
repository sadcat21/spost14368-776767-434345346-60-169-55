import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Eye,
  Zap,
  Image as ImageIcon,
  Grid3X3,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { useGeminiApiKey } from "@/hooks/useGeminiApiKey";
import { useGeminiImageGeneration } from "@/hooks/useGeminiImageGeneration";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { ImageGallery } from "./ImageGallery";

interface GeneratedImageData {
  id: string;
  imageUrl: string;
  imageData: string;
  prompt: string;
  style: string;
  timestamp: number;
  mimeType: string;
}

// برومتات متنوعة جاهزة
const defaultPrompts = [
  "A professional workspace with modern design and natural lighting",
  "Beautiful landscape with mountains and sunset colors",
  "Abstract geometric patterns with vibrant colors",
  "Modern architecture building with glass and steel",
  "Cozy coffee shop interior with warm atmosphere",
  "Digital art of futuristic city skyline",
  "Minimalist design with clean lines and white space",
  "Nature scene with flowing water and green trees"
];

export const BatchImageGenerator: React.FC = () => {
  const { apiKey, hasApiKey } = useGeminiApiKey();
  const { generateImage, isGenerating, error } = useGeminiImageGeneration();
  
  const [prompts, setPrompts] = useState<string[]>(defaultPrompts);
  const [newPrompt, setNewPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageData[]>([]);
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<GeneratedImageData | null>(null);

  // إضافة برومت جديد
  const addPrompt = useCallback(() => {
    if (newPrompt.trim() && !prompts.includes(newPrompt.trim())) {
      setPrompts(prev => [...prev, newPrompt.trim()]);
      setNewPrompt('');
      toast.success('تمت إضافة البرومت بنجاح!');
    }
  }, [newPrompt, prompts]);

  // حذف برومت
  const removePrompt = useCallback((index: number) => {
    setPrompts(prev => prev.filter((_, i) => i !== index));
    toast.success('تم حذف البرومت');
  }, []);

  // بدء توليد الصور بدفعة واحدة
  const startBatchGeneration = useCallback(async () => {
    if (!hasApiKey()) {
      toast.error('يرجى إدخال مفتاح Gemini API أولاً');
      return;
    }

    if (prompts.length === 0) {
      toast.error('يرجى إضافة برومتات أولاً');
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    setCurrentIndex(0);
    setProgress(0);
    
    toast.info(`بدء توليد ${prompts.length} صورة...`);

    for (let i = 0; i < prompts.length; i++) {
      if (isPaused) {
        setIsRunning(false);
        return;
      }

      setCurrentIndex(i);
      setProgress((i / prompts.length) * 100);

      try {
        const result = await generateImage({
          prompt: prompts[i],
          apiKey,
          temperature: 0.8,
          maxOutputTokens: 2048
        });

        if (result) {
          const imageData: GeneratedImageData = {
            id: crypto.randomUUID(),
            imageUrl: result.imageUrl,
            imageData: result.imageData,
            prompt: prompts[i],
            style: 'احترافي',
            timestamp: Date.now(),
            mimeType: result.mimeType
          };

          setGeneratedImages(prev => [...prev, imageData]);
          toast.success(`تم توليد الصورة ${i + 1} من ${prompts.length}`);
        }
      } catch (error) {
        console.error(`خطأ في توليد الصورة ${i + 1}:`, error);
        toast.error(`فشل في توليد الصورة ${i + 1}`);
      }

      // تأخير صغير بين الطلبات
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setProgress(100);
    setIsRunning(false);
    toast.success(`تم الانتهاء! تم توليد ${generatedImages.length + prompts.length} صورة بنجاح`);
  }, [hasApiKey, prompts, apiKey, generateImage, isPaused, generatedImages.length]);

  // إيقاف مؤقت
  const pauseGeneration = useCallback(() => {
    setIsPaused(true);
    setIsRunning(false);
    toast.info('تم إيقاف التوليد مؤقتاً');
  }, []);

  // إعادة تعيين
  const resetAll = useCallback(() => {
    setGeneratedImages([]);
    setProgress(0);
    setCurrentIndex(0);
    setIsRunning(false);
    setIsPaused(false);
    toast.success('تم إعادة تعيين الكل');
  }, []);

  // تحميل صورة
  const downloadImage = useCallback((image: GeneratedImageData) => {
    const link = document.createElement('a');
    link.href = image.imageUrl;
    link.download = `generated-image-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تم تحميل الصورة');
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* العنوان والإحصائيات */}
      <Card className="border-2 border-primary/30 bg-card shadow-2xl shadow-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/20">
          <CardTitle className="flex items-center gap-3 text-3xl font-bold text-foreground">
            <div className="relative">
              <Zap className="h-8 w-8 text-primary animate-pulse" />
              <div className="absolute inset-0 h-8 w-8 text-primary animate-ping opacity-75"></div>
            </div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              مولد الصور المتعدد
            </span>
            <span className="text-foreground">- دفعة واحدة</span>
          </CardTitle>
          <div className="flex gap-6 text-lg font-medium">
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
              <ImageIcon className="h-5 w-5 text-primary" />
              <span className="text-foreground">{prompts.length} برومت</span>
            </div>
            <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-lg border border-accent/20">
              <Grid3X3 className="h-5 w-5 text-accent" />
              <span className="text-foreground">{generatedImages.length} صورة مولدة</span>
            </div>
            <div className="flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-lg border border-secondary/20">
              <Sparkles className="h-5 w-5 text-secondary" />
              <span className="text-foreground">{isRunning ? 'جاري التوليد...' : 'جاهز'}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* إضافة برومتات جديدة */}
      <Card className="border-2 border-primary/20 bg-card shadow-xl shadow-primary/10">
        <CardHeader className="bg-gradient-to-r from-secondary/10 to-accent/10 border-b border-secondary/20">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-secondary" />
            إضافة برومتات جديدة
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex gap-3">
            <Input
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              placeholder="أدخل برومت جديد للذكاء الاصطناعي..."
              onKeyPress={(e) => e.key === 'Enter' && addPrompt()}
              className="flex-1 border-2 border-primary/20 focus:border-primary bg-background text-foreground font-medium"
            />
            <Button 
              onClick={addPrompt} 
              disabled={!newPrompt.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6 shadow-lg border-2 border-primary-foreground/20"
            >
              إضافة
            </Button>
          </div>

          {/* عرض البرومتات الحالية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prompts.map((prompt, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border-2 border-primary/10 hover:border-primary/20 transition-all duration-300 shadow-md">
                <span className="text-sm flex-1 truncate text-foreground font-medium pr-3">{prompt}</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 border border-primary-foreground/20">
                    {index + 1}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePrompt(index)}
                    className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive border border-destructive/20 text-destructive font-bold"
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* أزرار التحكم */}
      <Card className="border-2 border-accent/30 bg-card shadow-2xl shadow-accent/20">
        <CardContent className="pt-8">
          <div className="flex items-center justify-center gap-6">
            <Button
              onClick={startBatchGeneration}
              disabled={isRunning || !hasApiKey() || prompts.length === 0}
              size="lg"
              className="px-10 py-4 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl border-2 border-primary-foreground/20 transition-all duration-300"
            >
              <Play className="h-5 w-5 ml-2" />
              {isRunning ? 'جاري التوليد...' : 'بدء التوليد المتقدم'}
            </Button>

            {isRunning && (
              <Button
                onClick={pauseGeneration}
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg font-bold border-2 border-secondary bg-secondary/10 text-secondary hover:bg-secondary/20 shadow-lg"
              >
                <Pause className="h-5 w-5 ml-2" />
                إيقاف مؤقت
              </Button>
            )}

            <Button
              onClick={resetAll}
              variant="outline"
              size="lg"
              disabled={isRunning}
              className="px-8 py-4 text-lg font-bold border-2 border-accent bg-accent/10 text-accent hover:bg-accent/20 shadow-lg"
            >
              <RotateCcw className="h-5 w-5 ml-2" />
              إعادة تعيين
            </Button>
          </div>

          {/* شريط التقدم المحسن */}
          {(isRunning || progress > 0) && (
            <div className="mt-8 space-y-4">
              <div className="flex justify-between text-lg font-bold bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-xl border border-primary/20">
                <span className="text-foreground">التقدم: {Math.round(progress)}%</span>
                <span className="text-foreground">الصورة {currentIndex + 1} من {prompts.length}</span>
              </div>
              <div className="relative">
                <Progress 
                  value={progress} 
                  className="w-full h-4 bg-muted border-2 border-primary/20 shadow-lg" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full opacity-50"></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* رسالة خطأ محسنة */}
      {error && (
        <Alert className="border-2 border-destructive bg-destructive/5 shadow-lg">
          <AlertDescription className="text-destructive font-bold text-lg p-4">
            ⚠️ {error}
          </AlertDescription>
        </Alert>
      )}

      {/* معرض الصور المحسن */}
      {generatedImages.length > 0 && (
        <div className="mt-8">
          <ImageGallery
            images={generatedImages}
            onImageClick={setSelectedImage}
            onDownload={downloadImage}
            onRegenerate={(prompt, style) => {
              setNewPrompt(prompt);
              toast.info('تم نسخ البرومت للإعادة توليد');
            }}
          />
        </div>
      )}

      {/* نافذة معاينة الصورة */}
      <ImagePreviewModal
        image={selectedImage}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        onDownload={downloadImage}
      />
    </div>
  );
};