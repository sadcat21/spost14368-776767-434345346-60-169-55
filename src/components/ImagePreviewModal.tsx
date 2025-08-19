import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Copy, 
  Clock, 
  Image as ImageIcon,
  FileText,
  Palette
} from "lucide-react";
import { toast } from "sonner";

interface GeneratedImageData {
  id: string;
  imageUrl: string;
  imageData: string;
  prompt: string;
  style: string;
  timestamp: number;
  mimeType: string;
}

interface ImagePreviewModalProps {
  image: GeneratedImageData | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (image: GeneratedImageData) => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  image,
  isOpen,
  onClose,
  onDownload
}) => {
  if (!image) return null;

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ar-SA');
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(image.prompt);
    toast.success('تم نسخ البرومت');
  };

  const copyImageData = () => {
    navigator.clipboard.writeText(image.imageUrl);
    toast.success('تم نسخ رابط الصورة');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            معاينة الصورة
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* الصورة */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={image.imageUrl}
                alt={image.prompt}
                className="w-full h-auto max-h-96 object-contain rounded-lg border"
              />
            </div>

            {/* أزرار العمل */}
            <div className="flex gap-2">
              <Button
                onClick={() => onDownload(image)}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                تحميل الصورة
              </Button>
              
              <Button
                onClick={copyImageData}
                variant="outline"
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                نسخ الرابط
              </Button>
            </div>
          </div>

          {/* معلومات الصورة */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                البرومت المستخدم
              </h4>
              <div className="p-3 bg-muted rounded-lg text-sm">
                {image.prompt}
              </div>
              <Button
                onClick={copyPrompt}
                variant="ghost"
                size="sm"
                className="mt-2"
              >
                <Copy className="h-3 w-3 mr-1" />
                نسخ البرومت
              </Button>
            </div>

            <Separator />

            {/* المعلومات التقنية */}
            <div className="space-y-3">
              <h4 className="font-medium">تفاصيل الصورة</h4>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">النمط:</span>
                  <Badge variant="outline">{image.style}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">الوقت:</span>
                  <span className="text-xs">{formatDateTime(image.timestamp)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">النوع:</span>
                  <Badge variant="outline">{image.mimeType}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">المعرف:</span>
                  <span className="text-xs font-mono">{image.id.slice(0, 8)}...</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* إحصائيات الصورة */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-primary/5 rounded-lg">
                <div className="text-lg font-semibold text-primary">HD</div>
                <div className="text-xs text-muted-foreground">جودة عالية</div>
              </div>
              <div className="p-3 bg-green-500/5 rounded-lg">
                <div className="text-lg font-semibold text-green-600">AI</div>
                <div className="text-xs text-muted-foreground">مولد بالذكاء الاصطناعي</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};