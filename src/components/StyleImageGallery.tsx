import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  Download,
  Eye,
  Copy,
  Check,
  Palette,
  Grid,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

interface GeneratedStyleImage {
  imageUrl: string;
  imageData: string;
  description?: string;
  mimeType: string;
  style: string;
  styleName: string;
  timestamp: number;
}

interface StyleImageGalleryProps {
  images: GeneratedStyleImage[];
  onClearGallery?: () => void;
}

export const StyleImageGallery: React.FC<StyleImageGalleryProps> = ({
  images,
  onClearGallery
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleDownload = (image: GeneratedStyleImage) => {
    const link = document.createElement('a');
    link.href = image.imageUrl;
    link.download = `gemini-${image.style}-${Date.now()}.${image.mimeType.split('/')[1]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تم تحميل الصورة بنجاح');
  };

  const handleCopyImageData = async (image: GeneratedStyleImage) => {
    try {
      await navigator.clipboard.writeText(image.imageData);
      setCopied(image.style);
      toast.success('تم نسخ بيانات الصورة');
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast.error('فشل في نسخ بيانات الصورة');
    }
  };

  const styleLabels: Record<string, string> = {
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

  if (images.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Grid className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>لا توجد صور مولدة بعد</p>
          <p className="text-sm mt-2">قم بتوليد الصور باستخدام الأزرار أعلاه</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            معرض الصور المولدة ({images.length})
          </span>
          {onClearGallery && images.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearGallery}
              className="text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              مسح الكل
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={`${image.style}-${index}`} className="border hover:border-primary/50 transition-colors">
              <CardContent className="p-3 space-y-2">
                <div className="relative group">
                  <img
                    src={image.imageUrl}
                    alt={`صورة بنمط ${styleLabels[image.style] || image.style}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  
                  {/* Overlay buttons */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="secondary" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <div className="space-y-4">
                          <img
                            src={image.imageUrl}
                            alt={`صورة بنمط ${styleLabels[image.style] || image.style}`}
                            className="w-full max-h-[70vh] object-contain rounded-md"
                          />
                          {image.description && (
                            <div className="space-y-2">
                              <h4 className="font-medium">وصف Gemini:</h4>
                              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                                {image.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownload(image)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyImageData(image)}
                    >
                      {copied === image.style ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Badge variant="secondary" className="text-xs w-full justify-center">
                    {styleLabels[image.style] || image.style}
                  </Badge>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{image.mimeType}</span>
                    <span>{new Date(image.timestamp).toLocaleTimeString('ar-SA')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};