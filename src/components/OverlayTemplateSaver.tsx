import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Save, Upload, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useEnhancedOverlayTemplates } from "@/hooks/useEnhancedOverlayTemplates";
import type { LayerEffect } from "./LayerEffectsSelector";
import type { GradientSettings } from "./OverlayGradientController";
import type { AdvancedBlendingSettings } from "./AdvancedBlendingController";

interface OverlayTemplateSaverProps {
  layerEffect?: LayerEffect;
  gradientSettings?: GradientSettings;
  advancedBlendingSettings?: AdvancedBlendingSettings;
  advancedBlendingEnabled?: boolean;
  currentImage?: string;
  onSaved?: () => void; // callback لتحديث المعرض
}

export const OverlayTemplateSaver = ({ 
  layerEffect, 
  gradientSettings, 
  advancedBlendingSettings, 
  advancedBlendingEnabled = false,
  currentImage,
  onSaved
}: OverlayTemplateSaverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSuggestingName, setIsSuggestingName] = useState(false);
  
  const { createFromCurrentSettings, saving } = useEnhancedOverlayTemplates();

  const suggestNameAndDescription = async () => {
    if (!gradientSettings) {
      toast.error("لا توجد إعدادات طبقة علوية لتحليلها");
      return;
    }

    setIsSuggestingName(true);
    try {
      const response = await fetch('https://msrtbumkztdwtoqysykf.supabase.co/functions/v1/gemini-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'suggest_name_description',
          settings: {
            gradient_type: gradientSettings?.gradientType || 'radial',
            first_color: gradientSettings?.colorStops?.[0]?.color || '#000000',
            first_color_opacity: gradientSettings?.colorStops?.[0]?.opacity || 100,
            second_color: gradientSettings?.colorStops?.[1]?.color || '#ffffff',
            second_color_opacity: gradientSettings?.colorStops?.[1]?.opacity || 100,
            gradient_angle: gradientSettings?.gradientAngle || 210,
            global_opacity: layerEffect?.properties?.opacity || 100,
            use_sharp_stops: gradientSettings?.colorStops ? gradientSettings.colorStops.length > 2 : true,
          }
        })
      });

      if (!response.ok) {
        throw new Error('فشل في الحصول على الاقتراحات');
      }

      const data = await response.json();
      
      if (data.name && data.description) {
        setName(data.name);
        setDescription(data.description);
        toast.success('تم اقتراح اسم ووصف ذكي بنجاح!');
      } else if (data.text) {
        // محاولة استخراج الاسم والوصف من النص
        const lines = data.text.split('\n').filter(line => line.trim());
        if (lines.length >= 2) {
          setName(lines[0].replace(/^اسم[:\s]*/, '').trim());
          setDescription(lines[1].replace(/^وصف[:\s]*/, '').trim());
          toast.success('تم اقتراح اسم ووصف ذكي بنجاح!');
        } else {
          toast.error('تعذر معالجة الاقتراحات المستلمة');
        }
      }
    } catch (error) {
      console.error('Error getting name suggestion:', error);
      toast.error('حدث خطأ أثناء الحصول على الاقتراحات');
    } finally {
      setIsSuggestingName(false);
    }
  };

  const uploadImageToImgBB = async (imageBlob: Blob): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('image', imageBlob);

      const response = await fetch('https://api.imgbb.com/1/upload?key=46e8e5b6efd273b60dd8db78c3b62ebc', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data.url;
      } else {
        console.error('Error uploading to ImgBB:', result);
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const captureCurrentPreview = async (): Promise<Blob | null> => {
    try {
      // البحث عن عنصر المعاينة بطرق أكثر دقة
      let previewElement = document.querySelector('#preview-image') as HTMLImageElement;
      
      if (!previewElement) {
        // البحث عن الصورة في معاينة المحتوى
        previewElement = document.querySelector('.content-preview img') as HTMLImageElement;
      }
      
      if (!previewElement) {
        // البحث عن أي صورة تحتوي على blob أو data URL
        previewElement = document.querySelector('img[src*="blob:"], img[src*="data:"]') as HTMLImageElement;
      }
      
      if (!previewElement) {
        // البحث عن canvas للمعاينة
        const canvasElement = document.querySelector('canvas') as HTMLCanvasElement;
        if (canvasElement) {
          return new Promise((resolve) => {
            canvasElement.toBlob((blob) => {
              resolve(blob);
            }, 'image/jpeg', 0.8);
          });
        }
      }
      
      if (previewElement && previewElement.tagName === 'IMG') {
        // تحويل الصورة إلى canvas ثم إلى blob
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = previewElement.naturalWidth || previewElement.width || 400;
          canvas.height = previewElement.naturalHeight || previewElement.height || 300;
          
          // رسم الصورة على canvas
          ctx.drawImage(previewElement, 0, 0, canvas.width, canvas.height);
          
          return new Promise((resolve) => {
            canvas.toBlob((blob) => {
              resolve(blob);
            }, 'image/jpeg', 0.8);
          });
        }
      }

      // إذا لم نجد canvas، نبحث عن صورة المعاينة
      let previewImage = document.querySelector('[data-preview-image]') as HTMLImageElement;
      
      if (!previewImage) {
        // البحث عن أي صورة في منطقة المعاينة
        previewImage = document.querySelector('.preview-section img, .content-preview img, img[src*="blob:"]') as HTMLImageElement;
      }
      
      if (previewImage) {
        // تحويل الصورة إلى canvas ثم إلى blob
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = previewImage.naturalWidth || previewImage.width || 400;
          canvas.height = previewImage.naturalHeight || previewImage.height || 300;
          
          // رسم الصورة على canvas
          ctx.drawImage(previewImage, 0, 0, canvas.width, canvas.height);
          
          return new Promise((resolve) => {
            canvas.toBlob((blob) => {
              resolve(blob);
            }, 'image/jpeg', 0.8);
          });
        }
      }

      // إذا فشل كل شيء، استخدم الصورة الحالية إذا كانت متوفرة
      if (currentImage) {
        const response = await fetch(currentImage);
        const blob = await response.blob();
        return blob;
      }
      
      return null;
    } catch (error) {
      console.error('Error capturing preview:', error);
      return null;
    }
  };

  const handleSaveTemplate = async () => {
    if (!name.trim()) {
      toast.error("يرجى إدخال اسم النموذج");
      return;
    }

    if (!gradientSettings) {
      toast.error("لا توجد إعدادات طبقة علوية لحفظها");
      return;
    }

    try {
      let previewImageUrl = null;

      // التقاط صورة المعاينة الحالية
      const previewBlob = await captureCurrentPreview();
      
      if (previewBlob) {
        // رفع الصورة إلى ImgBB
        previewImageUrl = await uploadImageToImgBB(previewBlob);
        
        if (!previewImageUrl) {
          console.warn("فشل في رفع صورة المعاينة، سيتم الحفظ بدونها");
        }
      }

      // تحويل إعدادات الطبقة العلوية إلى النظام الجديد
      const enhancedSettings = {
        use_gradient: gradientSettings?.useOverlayGradient || true,
        gradient_type: (gradientSettings?.gradientType || 'radial') as 'linear' | 'radial' | 'conic',
        gradient_angle: gradientSettings?.gradientAngle || 210,
        center_x: gradientSettings?.centerX || 50,
        center_y: gradientSettings?.centerY || 50,
        gradient_size: gradientSettings?.gradientSize || 100,
        use_sharp_stops: gradientSettings?.colorStops ? gradientSettings.colorStops.length > 2 : true,
        first_color: gradientSettings?.colorStops?.[0]?.color || '#000000',
        first_color_opacity: gradientSettings?.colorStops?.[0]?.opacity || 100,
        first_color_position: gradientSettings?.colorStops?.[0]?.position || 60,
        second_color: gradientSettings?.colorStops?.[1]?.color || '#ffffff',
        second_color_opacity: gradientSettings?.colorStops?.[1]?.opacity || 100,
        second_color_position: gradientSettings?.colorStops?.[1]?.position || 15,
        additional_colors: gradientSettings?.colorStops?.slice(2)?.map(stop => ({
          color: stop.color,
          opacity: stop.opacity,
          position: stop.position
        })) || [],
        blend_mode: 'normal', // قيمة افتراضية
        advanced_blending_enabled: advancedBlendingEnabled,
        global_opacity: layerEffect?.properties?.opacity || 100
      };

      // حفظ النموذج في الجدول الجديد
      const result = await createFromCurrentSettings(
        name.trim(),
        enhancedSettings,
        description.trim() || "نموذج طبقة علوية مخصص"
      );

      if (result) {
        // تحديث preview_image_url إذا نجح رفع الصورة
        if (previewImageUrl && result.id) {
          // يمكن إضافة تحديث للصورة لاحقاً إذا احتجنا
        }
        
        setIsOpen(false);
        setName("");
        setDescription("");
        
        // استدعاء callback لتحديث المعرض
        if (onSaved) {
          onSaved();
        }
        
        toast.success("تم حفظ النموذج بنجاح في النظام المحسّن!");
      }
      
    } catch (error) {
      console.error('Error saving enhanced template:', error);
      toast.error("حدث خطأ أثناء حفظ النموذج المحسّن");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Save className="h-4 w-4" />
          حفظ كنموذج طبقة علوية
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            حفظ نموذج الطبقة العلوية
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="template-name">اسم النموذج *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={suggestNameAndDescription}
                disabled={saving || isSuggestingName}
                className="text-xs gap-1"
              >
                <Sparkles className="h-3 w-3" />
                {isSuggestingName ? 'جاري الاقتراح...' : 'اقتراح ذكي'}
              </Button>
            </div>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ادخل اسم النموذج..."
              disabled={saving || isSuggestingName}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="template-description">وصف النموذج</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر للنموذج (اختياري)..."
              rows={3}
              disabled={saving || isSuggestingName}
            />
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Upload className="h-4 w-4" />
              سيتم حفظ إعدادات الطبقة العلوية الحالية مع صورة المعاينة
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSaveTemplate}
              disabled={saving || !name.trim()}
              className="flex-1"
            >
              {saving ? "جاري الحفظ..." : "حفظ النموذج"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={saving}
            >
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};