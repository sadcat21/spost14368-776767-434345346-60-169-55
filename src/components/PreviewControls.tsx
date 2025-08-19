import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  RefreshCw, 
  Save, 
  Copy, 
  Download, 
  Upload, 
  Eye, 
  EyeOff, 
  Link,
  Settings,
  Image,
  FileText,
  Share2,
  ExternalLink,
  Archive,
  Camera,
  Zap,
  Sparkles,
  Check,
  X,
  Clock,
  Layers,
  AlignRight,
  AlignLeft,
  MousePointer2
} from "lucide-react";
import { toast } from "sonner";
import html2canvas from 'html2canvas';
import { useState, useCallback } from 'react';

interface PreviewControlsProps {
  onCopyText?: () => void;
  onSaveTemplate?: () => void;
  onRegenerateImage?: () => void;
  onRegenerateText?: () => void;
  onDownloadImage?: () => void;
  onToggleText?: () => void;
  onUploadToImgbb?: () => void;
  onToggleLayerOrder?: () => void;
  onApplyRightWriting?: () => void;
  onApplyLeftWriting?: () => void;
  onToggleInteractiveEditor?: () => void;
  isTextVisible?: boolean;
  isBackgroundOnTop?: boolean;
  isInteractiveMode?: boolean;
  canvasRef?: React.RefObject<HTMLDivElement>;
}

export const PreviewControls = ({
  onCopyText,
  onSaveTemplate,
  onRegenerateImage,
  onRegenerateText,
  onDownloadImage,
  onToggleText,
  onUploadToImgbb,
  onToggleLayerOrder,
  onApplyRightWriting,
  onApplyLeftWriting,
  onToggleInteractiveEditor,
  isTextVisible = true,
  isBackgroundOnTop = false,
  isInteractiveMode = false,
  canvasRef
}: PreviewControlsProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // دالة محسنة ومطورة لالتقاط الصورة مع جميع إعداداتها
  const captureCanvasWithSettings = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    if (!canvasRef?.current) {
      toast.error("لا يمكن العثور على العنصر للمعالجة");
      return null;
    }

    try {
      // انتظار أطول للتأكد من تطبيق جميع الإعدادات والتأثيرات
      await new Promise(resolve => setTimeout(resolve, 300));

      // إخفاء عناصر التحكم مؤقتاً
      const controlElements = canvasRef.current.querySelectorAll('.control-panel, .regenerate-controls, .preview-controls, button, input, [data-control]');
      const originalStyles: { element: HTMLElement; display: string; visibility: string; opacity: string }[] = [];
      
      controlElements.forEach(el => {
        const htmlEl = el as HTMLElement;
        originalStyles.push({
          element: htmlEl,
          display: htmlEl.style.display,
          visibility: htmlEl.style.visibility,
          opacity: htmlEl.style.opacity
        });
        htmlEl.style.display = 'none';
        htmlEl.style.visibility = 'hidden';
        htmlEl.style.opacity = '0';
      });

      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: 'transparent',
        useCORS: true,
        allowTaint: true,
        scale: 3, // دقة أعلى
        logging: false,
        width: canvasRef.current.offsetWidth,
        height: canvasRef.current.offsetHeight,
        foreignObjectRendering: true,
        imageTimeout: 15000,
        removeContainer: true,
        ignoreElements: (element) => {
          const htmlElement = element as HTMLElement;
          const computedStyle = window.getComputedStyle(htmlElement);
          
          // تجاهل العناصر المخفية والتحكم بطريقة أكثر دقة
          return (
            element.classList.contains('regenerate-controls') ||
            element.classList.contains('preview-controls') ||
            element.classList.contains('control-panel') ||
            element.hasAttribute('data-control') ||
            htmlElement.tagName === 'BUTTON' ||
            htmlElement.tagName === 'INPUT' ||
            htmlElement.tagName === 'SELECT' ||
            htmlElement.tagName === 'TEXTAREA' ||
            computedStyle.display === 'none' ||
            computedStyle.visibility === 'hidden' ||
            (computedStyle.opacity === '0' && !htmlElement.classList.contains('backdrop')) ||
            htmlElement.style.pointerEvents === 'none'
          );
        },
        onclone: (clonedDoc) => {
          // تنظيف شامل للنسخة المستنسخة
          const selectorsToRemove = [
            '.regenerate-controls', 
            '.preview-controls', 
            '.control-panel',
            '[data-control]',
            'button', 
            'input', 
            'select',
            'textarea',
            '[style*="display: none"]',
            '[style*="visibility: hidden"]',
            '.lucide-icon',
            '[role="button"]'
          ];
          
          selectorsToRemove.forEach(selector => {
            const elements = clonedDoc.querySelectorAll(selector);
            elements.forEach(el => {
              const parent = el.parentNode;
              if (parent) {
                parent.removeChild(el);
              }
            });
          });

          // إصلاح الأنماط والشفافية وإعدادات التدرج
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach(el => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style) {
              // التأكد من تطبيق تأثيرات التدرج من الـ CSS الحالي
              const computedStyle = window.getComputedStyle(htmlEl);
              if (computedStyle.background && computedStyle.background !== 'none') {
                htmlEl.style.background = computedStyle.background;
              }
              if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'transparent') {
                htmlEl.style.backgroundColor = computedStyle.backgroundColor;
              }
              
              // إزالة الطبقات الشفافة غير المرغوبة فقط
              if (htmlEl.style.backgroundColor && htmlEl.style.backgroundColor.includes('rgba')) {
                const rgba = htmlEl.style.backgroundColor;
                // إذا كانت الشفافية عالية جداً (أقل من 0.05)، اجعلها شفافة تماماً
                const match = rgba.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/);
                if (match && parseFloat(match[1]) < 0.05) {
                  htmlEl.style.backgroundColor = 'transparent';
                }
              }
              
              // إصلاح مشاكل الشفافية في النصوص والعناصر المهمة
              if (htmlEl.style.opacity && parseFloat(htmlEl.style.opacity) < 0.1) {
                // فقط إذا لم تكن طبقة خلفية
                if (!htmlEl.classList.contains('backdrop') && 
                    !htmlEl.classList.contains('overlay') && 
                    !htmlEl.classList.contains('background-layer')) {
                  htmlEl.style.opacity = '1';
                }
              }
              
              // التأكد من ظهور العناصر المهمة
              if (htmlEl.classList.contains('text-content') || 
                  htmlEl.classList.contains('image-content') ||
                  htmlEl.tagName === 'H1' || 
                  htmlEl.tagName === 'H2' ||
                  htmlEl.tagName === 'H3') {
                htmlEl.style.visibility = 'visible';
                htmlEl.style.display = htmlEl.style.display || 'block';
                if (!htmlEl.style.opacity || parseFloat(htmlEl.style.opacity) < 0.1) {
                  htmlEl.style.opacity = '1';
                }
              }
            }
          });
        }
      });

      // إعادة عناصر التحكم إلى حالتها الأصلية
      originalStyles.forEach(({ element, display, visibility, opacity }) => {
        element.style.display = display;
        element.style.visibility = visibility;
        element.style.opacity = opacity;
      });

      return canvas;
    } catch (error) {
      console.error('Error capturing canvas:', error);
      toast.error("حدث خطأ أثناء معالجة الصورة");
      return null;
    }
  }, [canvasRef]);

  const downloadCanvas = useCallback(async () => {
    setIsDownloading(true);
    
    try {
      const canvas = await captureCanvasWithSettings();
      if (!canvas) return;

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `content-image-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success("تم تحميل الصورة بنجاح!");
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error("حدث خطأ أثناء تحميل الصورة");
    } finally {
      setIsDownloading(false);
    }
  }, [captureCanvasWithSettings]);

  const uploadToImgbb = useCallback(async () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const canvas = await captureCanvasWithSettings();
      if (!canvas) return;

      // محاكاة التقدم
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      canvas.toBlob(async (blob) => {
        if (blob) {
          const formData = new FormData();
          formData.append('image', blob);
          formData.append('key', '7d8b9e2a1c3f4e5a6b7c8d9e0f1a2b3c');

          try {
            const response = await fetch('https://api.imgbb.com/1/upload', {
              method: 'POST',
              body: formData
            });

            setUploadProgress(100);
            const data = await response.json();
            
            if (data.success) {
              await navigator.clipboard.writeText(data.data.url);
              toast.success("تم رفع الصورة ونسخ الرابط بنجاح!");
            } else {
              toast.error("فشل في رفع الصورة إلى الخادم");
            }
          } catch (error) {
            console.error('Error uploading to imgbb:', error);
            toast.error("حدث خطأ أثناء رفع الصورة");
          }
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Error preparing image for upload:', error);
      toast.error("حدث خطأ أثناء تحضير الصورة للرفع");
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  }, [captureCanvasWithSettings]);

  return (
    <div className="relative">
      {/* تأثير الخلفية المتحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-purple-600/10 to-purple-700/20 rounded-xl animate-pulse opacity-80" />
      
      <Card className="relative border-2 border-yellow-400 bg-purple-100/90 dark:bg-purple-900/50 backdrop-blur-xl shadow-2xl ring-2 ring-yellow-300/30 overflow-hidden">
        {/* شريط التحكم العلوي */}
        <CardHeader className="pb-3 pt-4 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary font-bold">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Sparkles className="h-4 w-4" />
              </div>
              لوحة التحكم الذكية
            </CardTitle>
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1" />
              متصل
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 p-4">
          {/* زر المحرر التفاعلي المميز */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">المحرر التفاعلي</h3>
            <Button
              onClick={onToggleInteractiveEditor}
              className={`w-full h-12 text-sm font-bold transition-all duration-300 ${
                isInteractiveMode 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg ring-2 ring-amber-400/50' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MousePointer2 className={`h-5 w-5 ${isInteractiveMode ? 'animate-bounce' : ''}`} />
                <span>
                  {isInteractiveMode ? '🔙 العودة للمعاينة العادية' : '🚀 تفعيل المحرر التفاعلي - اسحب وأفلت!'}
                </span>
              </div>
            </Button>
          </div>

          {/* الأدوات الأساسية */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">أدوات التحكم الأساسية</h3>
            <div className="grid grid-cols-7 gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopyText}
                className="h-10 group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 border border-blue-500/20 transition-all duration-300"
              >
                <Copy className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 group-hover:-bottom-8 transition-all duration-300">
                  نسخ
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleText}
                className="h-10 group relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-600/10 hover:from-purple-500/20 hover:to-purple-600/20 border border-purple-500/20 transition-all duration-300"
              >
                {isTextVisible ? 
                  <EyeOff className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform" /> : 
                  <Eye className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform" />
                }
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-purple-600 opacity-0 group-hover:opacity-100 group-hover:-bottom-8 transition-all duration-300">
                  {isTextVisible ? "إخفاء" : "إظهار"}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onApplyRightWriting}
                className="h-10 group relative overflow-hidden bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 hover:from-cyan-500/20 hover:to-cyan-600/20 border border-cyan-500/20 transition-all duration-300"
              >
                <AlignRight className="h-4 w-4 text-cyan-600 group-hover:scale-110 transition-transform" />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-cyan-600 opacity-0 group-hover:opacity-100 group-hover:-bottom-8 transition-all duration-300">
                  يمين
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onApplyLeftWriting}
                className="h-10 group relative overflow-hidden bg-gradient-to-br from-teal-500/10 to-teal-600/10 hover:from-teal-500/20 hover:to-teal-600/20 border border-teal-500/20 transition-all duration-300"
              >
                <AlignLeft className="h-4 w-4 text-teal-600 group-hover:scale-110 transition-transform" />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-teal-600 opacity-0 group-hover:opacity-100 group-hover:-bottom-8 transition-all duration-300">
                  يسار
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={downloadCanvas}
                disabled={isDownloading}
                className="h-10 group relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-600/10 hover:from-green-500/20 hover:to-green-600/20 border border-green-500/20 transition-all duration-300"
              >
                {isDownloading ? (
                  <Clock className="h-4 w-4 text-green-600 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform" />
                )}
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-green-600 opacity-0 group-hover:opacity-100 group-hover:-bottom-8 transition-all duration-300">
                  تحميل
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={uploadToImgbb}
                disabled={isUploading}
                className="h-10 group relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-orange-600/10 hover:from-orange-500/20 hover:to-orange-600/20 border border-orange-500/20 transition-all duration-300"
              >
                {isUploading ? (
                  <Clock className="h-4 w-4 text-orange-600 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 text-orange-600 group-hover:scale-110 transition-transform" />
                )}
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-orange-600 opacity-0 group-hover:opacity-100 group-hover:-bottom-8 transition-all duration-300">
                  رفع
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("تم نسخ الرابط!");
                }}
                className="h-10 group relative overflow-hidden bg-gradient-to-br from-pink-500/10 to-pink-600/10 hover:from-pink-500/20 hover:to-pink-600/20 border border-pink-500/20 transition-all duration-300"
              >
                <Share2 className="h-4 w-4 text-pink-600 group-hover:scale-110 transition-transform" />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-pink-600 opacity-0 group-hover:opacity-100 group-hover:-bottom-8 transition-all duration-300">
                  مشاركة
                </span>
              </Button>
            </div>
          </div>

          {/* شريط التقدم للرفع */}
          {isUploading && (
            <div className="space-y-2 p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-600 font-medium">جاري رفع الصورة...</span>
                <span className="text-orange-600">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2 bg-orange-500/20" />
            </div>
          )}

          {/* أدوات التوليد المتقدمة */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">أدوات التوليد الذكية</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerateImage}
                className="h-12 group relative overflow-hidden bg-gradient-to-br from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 border border-red-500/20 transition-all duration-300"
              >
                <div className="flex flex-col items-center gap-1">
                  <Image className="h-4 w-4 text-red-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-red-600">إعادة توليد الصورة</span>
                </div>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerateText}
                className="h-12 group relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 hover:from-emerald-500/20 hover:to-emerald-600/20 border border-emerald-500/20 transition-all duration-300"
              >
                <div className="flex flex-col items-center gap-1">
                  <FileText className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-emerald-600">إعادة توليد النص</span>
                </div>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleLayerOrder}
                className="h-12 group relative overflow-hidden bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 hover:from-indigo-500/20 hover:to-indigo-600/20 border border-indigo-500/20 transition-all duration-300"
              >
                <div className="flex flex-col items-center gap-1">
                  <Layers className="h-4 w-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-indigo-600">
                    {isBackgroundOnTop ? "الخلفية أعلى" : "الصورة أعلى"}
                  </span>
                </div>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (onRegenerateImage) onRegenerateImage();
                  setTimeout(() => {
                    if (onRegenerateText) onRegenerateText();
                  }, 1000);
                }}
                className="h-12 group relative overflow-hidden bg-gradient-to-br from-violet-500/10 to-violet-600/10 hover:from-violet-500/20 hover:to-violet-600/20 border border-violet-500/20 transition-all duration-300"
              >
                <div className="flex flex-col items-center gap-1">
                  <Zap className="h-4 w-4 text-violet-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-violet-600">توليد شامل</span>
                </div>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onSaveTemplate}
                className="h-12 group relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 border border-amber-500/20 transition-all duration-300"
              >
                <div className="flex flex-col items-center gap-1">
                  <Archive className="h-4 w-4 text-amber-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-amber-600">حفظ نموذج</span>
                </div>
              </Button>
            </div>
          </div>

          {/* شريط الحالة المحسن */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/5 to-blue-500/5 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-20" />
              </div>
              <span className="text-sm font-medium text-green-600">النظام جاهز للعمل</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                {isTextVisible ? "النص مرئي" : "النص مخفي"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};