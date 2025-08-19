import { Eye, Share2, Download, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SocialPlatformPreview } from "../SocialPlatformPreview";
import { ContentPreview } from "@/components/ContentPreview";


interface PreviewControlsProps {
  text?: string;
  imageUrl?: string;
  originalImageUrl?: string;
  uploadedImageUrl?: string;
  onTextChange?: (newText: string) => void;
  onLoadTemplate?: (template: any) => void;
}

export const PreviewControls = ({
  text,
  imageUrl,
  originalImageUrl,
  uploadedImageUrl,
  onTextChange,
  onLoadTemplate
}: PreviewControlsProps) => {
  return (
    <div className="space-y-6">
      {/* قسم معاينة المنصات الاجتماعية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Share2 className="h-4 w-4" />
            معاينة المنصات الاجتماعية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SocialPlatformPreview 
            text={text || ""}
            imageUrl={imageUrl}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* قسم إدارة المحتوى والمعاينة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Eye className="h-4 w-4" />
            إدارة المحتوى والمعاينة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              معاينة المحتوى على المنصات المختلفة وإدارة النماذج.
            </p>
            
            {/* مكون المعاينة الذكي */}
            <ContentPreview 
              compact={true}
              showDeviceToggle={false}
              showTools={true}
              title="معاينة سريعة"
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* قسم النص للنشر */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Globe className="h-4 w-4" />
            النص للنشر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              إدارة النص للنشر على المنصات الاجتماعية.
            </p>
            {text && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">النص الحالي:</h4>
                <p className="text-sm">{text}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};