import React, { useState, useEffect } from 'react';
import { useLivePreview, useMergedPreviewData } from '@/contexts/LivePreviewContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Upload, Eye, Settings, Building, Save, RotateCcw, Camera, RefreshCw, Brain, Copy, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AdvancedLogoFrameShapes } from "./AdvancedLogoFrameShapes";
import { UnifiedLogoAnalyzer } from "./UnifiedLogoAnalyzer";
import html2canvas from 'html2canvas';

export interface SidebarLogoSettings {
  logoUrl: string;
  logoSize: number;
  logoPosition: "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";
  logoOpacity: number;
  
  // تحكم دقيق في موضع الشعار
  customLogoX: number;
  customLogoY: number;
  useCustomLogoPosition: boolean;
  
  // تأطير الشعار بأشكال متنوعة
  logoFrameEnabled: boolean;
  logoFrameShape: 'none' | 'circle' | 'square' | 'rectangle' | 'diamond' | 'hexagon' | 'octagon' | 'star' | 'heart' | 'rounded-square' | 'oval' | 'shield' | 'pentagon' | 'trapezoid' | 'arrow-right' | 'arrow-up' | 'cross' | 'ribbon' | 'flower' | 'leaf' | 'organic' | 'wave';
  logoFrameColor: string;
  logoFrameOpacity: number;
  logoFramePadding: number;
  logoFrameBorderWidth: number;
  logoFrameBorderColor: string;
  logoFrameBorderStyle: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  logoFrameBorderOpacity: number;
  logoFrameRotation: number;
  logoFrameGradientEnabled: boolean;
  logoFrameGradientStart: string;
  logoFrameGradientEnd: string;
  logoFrameGradientDirection: number;
  logoFrameShadowEnabled: boolean;
  logoFrameShadowColor: string;
  logoFrameShadowBlur: number;
  logoFrameShadowSpread: number;
  logoFrameShadowOffsetX: number;
  logoFrameShadowOffsetY: number;
  logoFrameShadowOpacity: number;
  
  // تحكم في نسب الأبعاد
  logoFrameCustomDimensions: boolean;
  logoFrameWidth: number;
  logoFrameHeight: number;
  logoFrameAspectRatio: 'square' | 'portrait' | 'landscape' | 'custom';
  
  // إعدادات الإطار المتحرك للشعار
  logoFrameAnimationEnabled: boolean;
  logoFrameAnimationType: 'none' | 'pulse' | 'rotate' | 'bounce' | 'float' | 'glow' | 'zoom' | 'shake';
  logoFrameAnimationSpeed: number;
  logoFrameAnimationIntensity: number;
}

interface SidebarLogoCustomizerProps {
  onUpdate?: (settings: SidebarLogoSettings) => void;
  initialSettings?: SidebarLogoSettings;
}

const defaultSidebarLogoSettings: SidebarLogoSettings = {
  logoUrl: '',
  logoSize: 60,
  logoPosition: 'bottom-right',
  logoOpacity: 90,
  
  // تحكم دقيق في موضع الشعار
  customLogoX: 50,
  customLogoY: 50,
  useCustomLogoPosition: false,
  
  // تأطير الشعار بأشكال متنوعة
  logoFrameEnabled: false,
  logoFrameShape: 'none',
  logoFrameColor: '#000000',
  logoFrameOpacity: 30,
  logoFramePadding: 10,
  logoFrameBorderWidth: 2,
  logoFrameBorderColor: '#ffffff',
  logoFrameBorderStyle: 'solid',
  logoFrameBorderOpacity: 100,
  logoFrameRotation: 0,
  logoFrameGradientEnabled: false,
  logoFrameGradientStart: '#667eea',
  logoFrameGradientEnd: '#764ba2',
  logoFrameGradientDirection: 45,
  logoFrameShadowEnabled: false,
  logoFrameShadowColor: 'rgba(0, 0, 0, 0.5)',
  logoFrameShadowBlur: 8,
  logoFrameShadowSpread: 0,
  logoFrameShadowOffsetX: 0,
  logoFrameShadowOffsetY: 4,
  logoFrameShadowOpacity: 25,
  
  // تحكم في نسب الأبعاد
  logoFrameCustomDimensions: false,
  logoFrameWidth: 100,
  logoFrameHeight: 100,
  logoFrameAspectRatio: 'square',
  
  // إعدادات الإطار المتحرك للشعار
  logoFrameAnimationEnabled: false,
  logoFrameAnimationType: 'none',
  logoFrameAnimationSpeed: 50,
  logoFrameAnimationIntensity: 50
};

export const SidebarLogoCustomizer: React.FC<SidebarLogoCustomizerProps> = ({
  onUpdate,
  initialSettings
}) => {
  const [settings, setSettings] = useState<SidebarLogoSettings>(
    initialSettings || defaultSidebarLogoSettings
  );
  const { updatePreviewData } = useLivePreview();
  const [isCapturing, setIsCapturing] = useState(false);
  const { previewData } = useMergedPreviewData();
  
  // حالات رفع الشعار إلى imgbb
  const [isUploadingToImgbb, setIsUploadingToImgbb] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imgbbLogoUrl, setImgbbLogoUrl] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");

  // تحميل الإعدادات المحفوظة عند بدء التشغيل
  useEffect(() => {
    const savedSettings = localStorage.getItem('sidebar_logo_settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        // تمرير الإعدادات المحملة فوراً
        onUpdate?.(parsedSettings);
      } catch (error) {
        console.error('خطأ في تحميل إعدادات الشعار:', error);
      }
    }
  }, []); // إزالة onUpdate من التبعيات لتجنب الوميض

  // حفظ الإعدادات تلقائياً عند تغييرها وإرسال التحديث للمعاينة المباشرة
  useEffect(() => {
    localStorage.setItem('sidebar_logo_settings', JSON.stringify(settings));
    console.log('SidebarLogoCustomizer - useEffect triggered, calling onUpdate with:', settings);
    onUpdate?.(settings);
  }, [settings, onUpdate]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الملف كبير جداً (الحد الأقصى 5 ميجابايت)');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('SidebarLogoCustomizer - File uploaded, result:', result.substring(0, 50) + '...');
        updateSettings({ logoUrl: result });
        toast.success('تم رفع الشعار بنجاح');
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSettings = (updates: Partial<SidebarLogoSettings>) => {
    const newSettings = { ...settings, ...updates };
    console.log('SidebarLogoCustomizer - updateSettings called with:', updates);
    console.log('SidebarLogoCustomizer - newSettings:', newSettings);
    
    setSettings(newSettings);
    
    // إرسال التحديث للمعاينة المباشرة فوراً
    onUpdate?.(newSettings);
    
    // إرسال التحديث لـ LivePreviewContext لتحديث المعاينة المباشرة
    updatePreviewData({
      sidebarLogoSettings: newSettings
    });
    
    console.log('SidebarLogoCustomizer - updated both onUpdate and LivePreviewContext');
  };

  const resetSettings = () => {
    setSettings(defaultSidebarLogoSettings);
    setImgbbLogoUrl("");
    setUploadError("");
    toast.success('تم إعادة تعيين إعدادات الشعار');
  };

  // رفع الشعار إلى imgbb
  const uploadLogoToImgbb = async (file: File) => {
    setIsUploadingToImgbb(true);
    setUploadError("");
    setUploadProgress(0);
    
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      setUploadError("يرجى اختيار ملف صورة صالح");
      setIsUploadingToImgbb(false);
      return;
    }

    // التحقق من حجم الملف (32MB limit for imgbb)
    const maxSize = 32 * 1024 * 1024; // 32MB
    if (file.size > maxSize) {
      setUploadError("حجم الصورة كبير جداً. الحد الأقصى 32 ميجابايت");
      setIsUploadingToImgbb(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", "6d207e02198a847aa98d0a2a901485a5"); // imgbb API key

    try {
      const xhr = new XMLHttpRequest();
      
      // تتبع تقدم الرفع
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.success && data.data?.url) {
            setImgbbLogoUrl(data.data.url);
            toast.success('تم رفع الشعار إلى imgbb بنجاح!');
          } else {
            throw new Error(data.error?.message || "خطأ في رفع الصورة");
          }
        } else {
          throw new Error(`خطأ في الخادم: ${xhr.status}`);
        }
        setIsUploadingToImgbb(false);
      });

      xhr.addEventListener('error', () => {
        setUploadError("فشل في الاتصال بخادم imgbb");
        setIsUploadingToImgbb(false);
      });

      xhr.open('POST', 'https://api.imgbb.com/1/upload');
      xhr.send(formData);

    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "حدث خطأ أثناء الرفع");
      setIsUploadingToImgbb(false);
    }
  };

  // نسخ رابط imgbb
  const copyImgbbLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(imgbbLogoUrl);
      toast.success('تم نسخ رابط imgbb!');
    } catch (error) {
      toast.error('فشل في نسخ الرابط');
    }
  };

  // التقاط المعاينة النهائية من ContentCanvas
  const captureContentCanvas = async () => {
    setIsCapturing(true);
    try {
      // البحث عن ContentCanvas فقط - المصدر الوحيد المعتمد
      const contentCanvas = document.querySelector('[data-content-canvas="true"]') as HTMLElement;
      
      if (!contentCanvas) {
        console.error('لا يمكن العثور على ContentCanvas. تأكد من وجود المكون:', {
          dataContentCanvas: document.querySelectorAll('[data-content-canvas="true"]'),
          availableElements: Array.from(document.querySelectorAll('[data-content-canvas]')).map(el => ({
            tag: el.tagName,
            id: el.id,
            classes: el.className,
            dataAttribute: el.getAttribute('data-content-canvas')
          }))
        });
        toast.error('لا يمكن العثور على ContentCanvas - انتقل لصفحة المحتوى أولاً');
        return;
      }

      console.log('عنصر المحتوى موجود:', {
        element: contentCanvas,
        id: contentCanvas.id,
        classes: contentCanvas.className,
        dimensions: {
          width: contentCanvas.offsetWidth,
          height: contentCanvas.offsetHeight
        }
      });

      const canvas = await html2canvas(contentCanvas, {
        allowTaint: true,
        useCORS: true,
        scale: 2,
        logging: false,
        backgroundColor: null,
        height: contentCanvas.offsetHeight,
        width: contentCanvas.offsetWidth,
        onclone: (clonedDoc) => {
          // إزالة أزرار التحكم من الصورة الملتقطة
          const controls = clonedDoc.querySelectorAll('.regenerate-controls, .control-button, .floating-button');
          controls.forEach(control => {
            if (control.parentNode) {
              control.parentNode.removeChild(control);
            }
          });
        }
      });
      
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      
      // فتح المعاينة في نافذة جديدة
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>المعاينة النهائية مع الشعار</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px; 
                  display: flex; 
                  justify-content: center; 
                  align-items: center; 
                  min-height: 100vh; 
                  background: #f0f0f0; 
                  font-family: Arial, sans-serif;
                }
                img { 
                  max-width: 100%; 
                  max-height: 100vh; 
                  box-shadow: 0 10px 30px rgba(0,0,0,0.3); 
                  border-radius: 8px;
                }
                .download-btn {
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  padding: 10px 20px;
                  background: #007bff;
                  color: white;
                  border: none;
                  border-radius: 5px;
                  cursor: pointer;
                  font-size: 14px;
                }
                .download-btn:hover {
                  background: #0056b3;
                }
              </style>
            </head>
            <body>
              <button class="download-btn" onclick="downloadImage()">تحميل الصورة</button>
              <img src="${dataUrl}" alt="المعاينة النهائية مع الشعار" />
              <script>
                function downloadImage() {
                  const link = document.createElement('a');
                  link.download = 'preview-with-logo-${Date.now()}.png';
                  link.href = '${dataUrl}';
                  link.click();
                }
              </script>
            </body>
          </html>
        `);
      }
      
      toast.success('تم تحديث المعاينة من ContentCanvas بنجاح!');
    } catch (error) {
      console.error('خطأ في التقاط المعاينة:', error);
      toast.error('فشل في التقاط المعاينة');
    } finally {
      setIsCapturing(false);
    }
  };

  const positionOptions = [
    { value: 'top-left', label: 'أعلى اليسار' },
    { value: 'top-center', label: 'أعلى الوسط' },
    { value: 'top-right', label: 'أعلى اليمين' },
    { value: 'center-left', label: 'وسط اليسار' },
    { value: 'center', label: 'الوسط' },
    { value: 'center-right', label: 'وسط اليمين' },
    { value: 'bottom-left', label: 'أسفل اليسار' },
    { value: 'bottom-center', label: 'أسفل الوسط' },
    { value: 'bottom-right', label: 'أسفل اليمين' }
  ];

  return (
    <div className="space-y-6">
      {/* عنوان التبويب */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Building className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary">شعار القائمة الجانبية</h2>
          <p className="text-sm text-muted-foreground">إعدادات شعار منفصلة للمعاينة المباشرة</p>
        </div>
      </div>

      {/* رفع الشعار */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            رفع الشعار
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="sidebar-logo-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Upload className="h-4 w-4" />
                اختر ملف الشعار
              </div>
              <Input
                id="sidebar-logo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={resetSettings}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              إعادة تعيين
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={captureContentCanvas}
              disabled={isCapturing || !settings.logoUrl}
              className="flex items-center gap-2"
            >
              {isCapturing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              {isCapturing ? 'جاري التقاط المعاينة...' : 'التقاط المعاينة النهائية'}
            </Button>
          </div>

          {/* معاينة الشعار */}
          {settings.logoUrl && (
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <img 
                  src={settings.logoUrl} 
                  alt="معاينة الشعار" 
                  className="w-16 h-16 object-contain rounded border"
                />
                <div>
                  <p className="text-sm font-medium">الشعار المرفوع</p>
                  <p className="text-xs text-muted-foreground">جاهز للاستخدام</p>
                </div>
              </div>
            </div>
          )}

          {/* رفع إلى imgbb للحصول على رابط عام */}
          {settings.logoUrl && !settings.logoUrl.startsWith('http') && (
            <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    رفع الشعار إلى imgbb
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    للحصول على رابط عام قابل للمشاركة
                  </p>
                </div>
                {!imgbbLogoUrl && !isUploadingToImgbb && (
                  <Button
                    onClick={() => {
                      const fileInput = document.getElementById('sidebar-logo-upload') as HTMLInputElement;
                      if (fileInput?.files?.[0]) {
                        uploadLogoToImgbb(fileInput.files[0]);
                      }
                    }}
                    size="sm"
                    variant="outline"
                    className="text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-900"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    رفع إلى imgbb
                  </Button>
                )}
              </div>

              {/* شريط التقدم أثناء الرفع */}
              {isUploadingToImgbb && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-blue-700 dark:text-blue-300">
                    <span>جاري الرفع...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* رسالة خطأ */}
              {uploadError && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="text-sm">{uploadError}</span>
                </div>
              )}

              {/* نجح الرفع - عرض الرابط */}
              {imgbbLogoUrl && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-medium">تم رفع الشعار بنجاح!</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">رابط imgbb:</Label>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded border">
                      <code className="flex-1 text-xs break-all text-muted-foreground">
                        {imgbbLogoUrl}
                      </code>
                      <div className="flex gap-1">
                        <Button
                          onClick={copyImgbbLinkToClipboard}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => window.open(imgbbLogoUrl, '_blank')}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* قسم التحليل الذكي المدمج */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            التحليل الذكي المدمج
          </CardTitle>
        </CardHeader>
        <CardContent>
          {settings.logoUrl && previewData.imageUrl ? (
            <UnifiedLogoAnalyzer
              currentImageUrl={previewData.imageUrl}
              logoUrl={settings.logoUrl}
              logoSettings={{
                ...settings,
                logoPosition: 'custom',
                useCustomLogoPosition: settings.useCustomLogoPosition
              } as any}
              onApplyLogoSuggestions={(suggestions: any) => {
                // تحويل من LogoSettings إلى SidebarLogoSettings
                const sidebarSuggestions: Partial<SidebarLogoSettings> = {
                  useCustomLogoPosition: suggestions.useCustomLogoPosition,
                  customLogoX: suggestions.customLogoX,
                  customLogoY: suggestions.customLogoY,
                  logoSize: suggestions.logoSize,
                  logoOpacity: suggestions.logoOpacity,
                  logoFrameEnabled: suggestions.logoFrameEnabled,
                  logoFrameShape: suggestions.logoFrameShape,
                  logoFrameColor: suggestions.logoFrameColor,
                  logoFrameOpacity: suggestions.logoFrameOpacity,
                  logoFrameBorderWidth: suggestions.logoFrameBorderWidth,
                  logoFrameRotation: suggestions.logoFrameRotation,
                  logoFrameShadowEnabled: suggestions.logoFrameShadowEnabled,
                  logoFrameShadowBlur: suggestions.logoFrameShadowBlur
                };
                
                updateSettings(sidebarSuggestions);
                toast.success('تم تطبيق اقتراحات المحلل الموحد بنجاح!');
              }}
              specialty="تصميم"
              contentType="شعار"
              imageStyle="احترافي"
              language="ar"
            />
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-muted">
                  <Brain className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">التحليل الذكي غير متاح</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  {!settings.logoUrl && (
                    <p className="flex items-center gap-2 justify-center">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      يرجى رفع شعار أولاً
                    </p>
                  )}
                  {!previewData.imageUrl && (
                    <p className="flex items-center gap-2 justify-center">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      يرجى إضافة محتوى في الصفحة الرئيسية
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  💡 <strong>نصيحة:</strong> ارفع شعارك وانشئ محتوى لتفعيل التحليل الذكي للحصول على اقتراحات مثالية لموضع الشعار
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* إعدادات الحجم والموضع */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            الحجم والموضع
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* حجم الشعار */}
          <div className="space-y-2">
            <Label>حجم الشعار: {settings.logoSize}px</Label>
            <Slider
              value={[settings.logoSize]}
              onValueChange={([value]) => updateSettings({ logoSize: value })}
              min={20}
              max={200}
              step={5}
              className="w-full"
            />
          </div>

          {/* شفافية الشعار */}
          <div className="space-y-2">
            <Label>الشفافية: {settings.logoOpacity}%</Label>
            <Slider
              value={[settings.logoOpacity]}
              onValueChange={([value]) => updateSettings({ logoOpacity: value })}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <Separator />

          {/* موضع الشعار */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>استخدام موضع مخصص</Label>
              <Switch
                checked={settings.useCustomLogoPosition}
                onCheckedChange={(checked) => updateSettings({ useCustomLogoPosition: checked })}
              />
            </div>

            {settings.useCustomLogoPosition ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الموضع الأفقي: {settings.customLogoX}%</Label>
                  <Slider
                    value={[settings.customLogoX]}
                    onValueChange={([value]) => updateSettings({ customLogoX: value })}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الموضع العمودي: {settings.customLogoY}%</Label>
                  <Slider
                    value={[settings.customLogoY]}
                    onValueChange={([value]) => updateSettings({ customLogoY: value })}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            ) : (
              <Select 
                value={settings.logoPosition} 
                onValueChange={(value: any) => updateSettings({ logoPosition: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر موضع الشعار" />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* إطار الشعار */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            إطار الشعار
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>تفعيل الإطار</Label>
            <Switch
              checked={settings.logoFrameEnabled}
              onCheckedChange={(checked) => updateSettings({ logoFrameEnabled: checked })}
            />
          </div>

          {settings.logoFrameEnabled && (
            <div className="space-y-4 pt-4 border-t">
              {/* شكل الإطار */}
              <div className="space-y-2">
                <Label>شكل الإطار</Label>
                <Select 
                  value={settings.logoFrameShape} 
                  onValueChange={(value: any) => updateSettings({ logoFrameShape: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون إطار</SelectItem>
                    <SelectItem value="circle">دائري</SelectItem>
                    <SelectItem value="square">مربع</SelectItem>
                    <SelectItem value="rounded">مربع مدور</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* لون الإطار */}
              <div className="space-y-2">
                <Label>لون الإطار</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.logoFrameColor}
                    onChange={(e) => updateSettings({ logoFrameColor: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={settings.logoFrameColor}
                    onChange={(e) => updateSettings({ logoFrameColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* شفافية الإطار */}
              <div className="space-y-2">
                <Label>شفافية الإطار: {settings.logoFrameOpacity}%</Label>
                <Slider
                  value={[settings.logoFrameOpacity]}
                  onValueChange={([value]) => updateSettings({ logoFrameOpacity: value })}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              {/* إعدادات شكل الإطار المتقدمة */}
              {settings.logoFrameShape !== 'none' && (
                <div className="space-y-4">
                  {/* شكل الإطار */}
                  <div className="space-y-2">
                    <Label>نوع الشكل</Label>
                    <Select 
                      value={settings.logoFrameShape} 
                      onValueChange={(value: any) => updateSettings({ logoFrameShape: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">بدون إطار</SelectItem>
                        <SelectItem value="circle">دائري</SelectItem>
                        <SelectItem value="square">مربع</SelectItem>
                        <SelectItem value="rounded-square">مربع مدور</SelectItem>
                        <SelectItem value="rectangle">مستطيل</SelectItem>
                        <SelectItem value="oval">بيضاوي</SelectItem>
                        <SelectItem value="diamond">معين</SelectItem>
                        <SelectItem value="hexagon">سداسي</SelectItem>
                        <SelectItem value="octagon">ثماني</SelectItem>
                        <SelectItem value="pentagon">خماسي</SelectItem>
                        <SelectItem value="star">نجمة</SelectItem>
                        <SelectItem value="heart">قلب</SelectItem>
                        <SelectItem value="shield">درع</SelectItem>
                        <SelectItem value="trapezoid">شبه منحرف</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* معاينة الإطار */}
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <Label className="text-sm text-muted-foreground mb-2 block">معاينة الإطار:</Label>
                    <div className="flex justify-center">
                      <div 
                        style={{
                          width: '60px',
                          height: '60px',
                          backgroundColor: `${settings.logoFrameColor}${Math.round((settings.logoFrameOpacity / 100) * 255).toString(16).padStart(2, '0')}`,
                          border: settings.logoFrameBorderWidth > 0 
                            ? `${settings.logoFrameBorderWidth}px ${settings.logoFrameBorderStyle} ${settings.logoFrameBorderColor}${Math.round(((settings.logoFrameBorderOpacity || 100) / 100) * 255).toString(16).padStart(2, '0')}`
                            : 'none',
                          padding: `${settings.logoFramePadding}px`,
                          borderRadius: settings.logoFrameShape === 'circle' ? '50%' : 
                                      settings.logoFrameShape === 'rounded-square' ? '15%' : '0',
                          clipPath: settings.logoFrameShape === 'diamond' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' :
                                   settings.logoFrameShape === 'hexagon' ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' :
                                   settings.logoFrameShape === 'pentagon' ? 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' :
                                   settings.logoFrameShape === 'octagon' ? 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' :
                                   settings.logoFrameShape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' :
                                   settings.logoFrameShape === 'heart' ? 'polygon(50% 100%, 0% 40%, 0% 25%, 25% 0%, 50% 25%, 75% 0%, 100% 25%, 100% 40%)' :
                                   settings.logoFrameShape === 'shield' ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' :
                                   settings.logoFrameShape === 'trapezoid' ? 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' :
                                   'none',
                          transform: `rotate(${settings.logoFrameRotation}deg)`,
                          background: settings.logoFrameGradientEnabled
                            ? `linear-gradient(${settings.logoFrameGradientDirection}deg, ${settings.logoFrameGradientStart}, ${settings.logoFrameGradientEnd})`
                            : settings.logoFrameColor,
                          boxShadow: settings.logoFrameShadowEnabled 
                            ? `${settings.logoFrameShadowOffsetX}px ${settings.logoFrameShadowOffsetY}px ${settings.logoFrameShadowBlur}px ${settings.logoFrameShadowSpread}px ${settings.logoFrameShadowColor}${Math.round((settings.logoFrameShadowOpacity / 100) * 255).toString(16).padStart(2, '0')}`
                            : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        className="mx-auto"
                      >
                        <div className="w-6 h-6 bg-primary/20 rounded" />
                      </div>
                    </div>
                  </div>

                  {/* إعدادات التدرج */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>تدرج لوني للإطار</Label>
                      <Switch
                        checked={settings.logoFrameGradientEnabled}
                        onCheckedChange={(checked) => updateSettings({ logoFrameGradientEnabled: checked })}
                      />
                    </div>

                    {settings.logoFrameGradientEnabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>لون البداية</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={settings.logoFrameGradientStart}
                              onChange={(e) => updateSettings({ logoFrameGradientStart: e.target.value })}
                              className="w-16 h-10"
                            />
                            <Input
                              type="text"
                              value={settings.logoFrameGradientStart}
                              onChange={(e) => updateSettings({ logoFrameGradientStart: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>لون النهاية</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={settings.logoFrameGradientEnd}
                              onChange={(e) => updateSettings({ logoFrameGradientEnd: e.target.value })}
                              className="w-16 h-10"
                            />
                            <Input
                              type="text"
                              value={settings.logoFrameGradientEnd}
                              onChange={(e) => updateSettings({ logoFrameGradientEnd: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label>اتجاه التدرج: {settings.logoFrameGradientDirection}°</Label>
                          <Slider
                            value={[settings.logoFrameGradientDirection]}
                            onValueChange={([value]) => updateSettings({ logoFrameGradientDirection: value })}
                            min={0}
                            max={360}
                            step={15}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* إعدادات الحدود */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>عرض الحدود: {settings.logoFrameBorderWidth}px</Label>
                      <Slider
                        value={[settings.logoFrameBorderWidth]}
                        onValueChange={([value]) => updateSettings({ logoFrameBorderWidth: value })}
                        min={0}
                        max={10}
                        step={1}
                      />
                    </div>

                    {settings.logoFrameBorderWidth > 0 && (
                      <>
                        <div className="space-y-2">
                          <Label>نوع الحدود</Label>
                          <Select 
                            value={settings.logoFrameBorderStyle} 
                            onValueChange={(value: any) => updateSettings({ logoFrameBorderStyle: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="solid">مصمت</SelectItem>
                              <SelectItem value="dashed">متقطع</SelectItem>
                              <SelectItem value="dotted">منقط</SelectItem>
                              <SelectItem value="double">مزدوج</SelectItem>
                              <SelectItem value="groove">مجوف</SelectItem>
                              <SelectItem value="ridge">بارز</SelectItem>
                              <SelectItem value="inset">غائر</SelectItem>
                              <SelectItem value="outset">نافر</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>لون الحدود</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={settings.logoFrameBorderColor}
                              onChange={(e) => updateSettings({ logoFrameBorderColor: e.target.value })}
                              className="w-16 h-10"
                            />
                            <Input
                              type="text"
                              value={settings.logoFrameBorderColor}
                              onChange={(e) => updateSettings({ logoFrameBorderColor: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>شفافية الحدود: {settings.logoFrameBorderOpacity}%</Label>
                          <Slider
                            value={[settings.logoFrameBorderOpacity]}
                            onValueChange={([value]) => updateSettings({ logoFrameBorderOpacity: value })}
                            min={0}
                            max={100}
                            step={5}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* إعدادات الظلال */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>ظلال الإطار</Label>
                      <Switch
                        checked={settings.logoFrameShadowEnabled}
                        onCheckedChange={(checked) => updateSettings({ logoFrameShadowEnabled: checked })}
                      />
                    </div>

                    {settings.logoFrameShadowEnabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>لون الظل</Label>
                          <Input
                            type="color"
                            value={settings.logoFrameShadowColor.includes('rgba') ? '#000000' : settings.logoFrameShadowColor}
                            onChange={(e) => updateSettings({ logoFrameShadowColor: e.target.value })}
                            className="w-full h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>شفافية الظل: {settings.logoFrameShadowOpacity}%</Label>
                          <Slider
                            value={[settings.logoFrameShadowOpacity]}
                            onValueChange={([value]) => updateSettings({ logoFrameShadowOpacity: value })}
                            min={0}
                            max={100}
                            step={5}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>ضبابية الظل: {settings.logoFrameShadowBlur}px</Label>
                          <Slider
                            value={[settings.logoFrameShadowBlur]}
                            onValueChange={([value]) => updateSettings({ logoFrameShadowBlur: value })}
                            min={0}
                            max={20}
                            step={1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>انتشار الظل: {settings.logoFrameShadowSpread}px</Label>
                          <Slider
                            value={[settings.logoFrameShadowSpread]}
                            onValueChange={([value]) => updateSettings({ logoFrameShadowSpread: value })}
                            min={0}
                            max={10}
                            step={1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>إزاحة أفقية: {settings.logoFrameShadowOffsetX}px</Label>
                          <Slider
                            value={[settings.logoFrameShadowOffsetX]}
                            onValueChange={([value]) => updateSettings({ logoFrameShadowOffsetX: value })}
                            min={-20}
                            max={20}
                            step={1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>إزاحة عمودية: {settings.logoFrameShadowOffsetY}px</Label>
                          <Slider
                            value={[settings.logoFrameShadowOffsetY]}
                            onValueChange={([value]) => updateSettings({ logoFrameShadowOffsetY: value })}
                            min={-20}
                            max={20}
                            step={1}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* دوران الإطار */}
                  <div className="space-y-2">
                    <Label>دوران الإطار: {settings.logoFrameRotation}°</Label>
                    <Slider
                      value={[settings.logoFrameRotation]}
                      onValueChange={([value]) => updateSettings({ logoFrameRotation: value })}
                      min={0}
                      max={360}
                      step={15}
                    />
                  </div>

                  {/* padding الإطار */}
                  <div className="space-y-2">
                    <Label>مساحة الإطار: {settings.logoFramePadding}px</Label>
                    <Slider
                      value={[settings.logoFramePadding]}
                      onValueChange={([value]) => updateSettings({ logoFramePadding: value })}
                      min={0}
                      max={50}
                      step={2}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* أشكال الإطار المتقدمة */}
      {settings.logoFrameEnabled && (
        <AdvancedLogoFrameShapes 
          settings={settings} 
          updateSettings={updateSettings} 
        />
      )}

      {/* إعدادات متقدمة للإطار */}
      {settings.logoFrameEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              إعدادات متقدمة للإطار
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* تحكم في الأبعاد */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>أبعاد مخصصة للإطار</Label>
                <Switch
                  checked={settings.logoFrameCustomDimensions}
                  onCheckedChange={(checked) => updateSettings({ logoFrameCustomDimensions: checked })}
                />
              </div>

              {settings.logoFrameCustomDimensions && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>نسبة العرض للارتفاع</Label>
                    <Select 
                      value={settings.logoFrameAspectRatio} 
                      onValueChange={(value: any) => updateSettings({ logoFrameAspectRatio: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="square">مربع (1:1)</SelectItem>
                        <SelectItem value="portrait">عمودي (3:4)</SelectItem>
                        <SelectItem value="landscape">أفقي (4:3)</SelectItem>
                        <SelectItem value="custom">مخصص</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {settings.logoFrameAspectRatio === 'custom' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>عرض الإطار: {settings.logoFrameWidth}px</Label>
                        <Slider
                          value={[settings.logoFrameWidth]}
                          onValueChange={([value]) => updateSettings({ logoFrameWidth: value })}
                          min={50}
                          max={300}
                          step={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>ارتفاع الإطار: {settings.logoFrameHeight}px</Label>
                        <Slider
                          value={[settings.logoFrameHeight]}
                          onValueChange={([value]) => updateSettings({ logoFrameHeight: value })}
                          min={50}
                          max={300}
                          step={5}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* الحركات المتقدمة */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>حركات متقدمة للإطار</Label>
                <Switch
                  checked={settings.logoFrameAnimationEnabled}
                  onCheckedChange={(checked) => updateSettings({ logoFrameAnimationEnabled: checked })}
                />
              </div>

              {settings.logoFrameAnimationEnabled && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>نوع الحركة</Label>
                    <Select 
                      value={settings.logoFrameAnimationType} 
                      onValueChange={(value: any) => updateSettings({ logoFrameAnimationType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">بدون حركة</SelectItem>
                        <SelectItem value="pulse">نبضة</SelectItem>
                        <SelectItem value="rotate">دوران</SelectItem>
                        <SelectItem value="bounce">ارتداد</SelectItem>
                        <SelectItem value="float">طفو</SelectItem>
                        <SelectItem value="glow">توهج</SelectItem>
                        <SelectItem value="zoom">تكبير وتصغير</SelectItem>
                        <SelectItem value="shake">اهتزاز</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>سرعة الحركة: {settings.logoFrameAnimationSpeed}%</Label>
                    <Slider
                      value={[settings.logoFrameAnimationSpeed]}
                      onValueChange={([value]) => updateSettings({ logoFrameAnimationSpeed: value })}
                      min={10}
                      max={100}
                      step={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>شدة الحركة: {settings.logoFrameAnimationIntensity}%</Label>
                    <Slider
                      value={[settings.logoFrameAnimationIntensity]}
                      onValueChange={([value]) => updateSettings({ logoFrameAnimationIntensity: value })}
                      min={10}
                      max={100}
                      step={5}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SidebarLogoCustomizer;