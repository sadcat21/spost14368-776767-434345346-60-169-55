import { Eye, Share2, Download, Globe, Brain, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SocialPlatformPreview } from "../SocialPlatformPreview";
import { UnifiedPreviewTabs } from "../UnifiedPreviewTabs";
import { ContentPreview } from "@/components/ContentPreview";

interface SmartContentControlsProps {
  text?: string;
  imageUrl?: string;
  originalImageUrl?: string;
  uploadedImageUrl?: string;
  onTextChange?: (newText: string) => void;
  onLoadTemplate?: (template: any) => void;
}

export const SmartContentControls = ({
  text,
  imageUrl,
  originalImageUrl,
  uploadedImageUrl,
  onTextChange,
  onLoadTemplate
}: SmartContentControlsProps) => {
  return (
    <div className="space-y-6">
      {/* قسم المحتوى الذكي والمعاينة المتطورة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Brain className="h-4 w-4" />
            المحتوى الذكي والمعاينة المتطورة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* المعاينة الذكية الأساسية */}
            <ContentPreview 
              showDeviceToggle={true}
              showTools={true}
              title="معاينة المحتوى الذكي"
              className="mb-4"
            />
            
            {/* تبويبات المعاينة المتطورة */}
            <UnifiedPreviewTabs
              text={text || ""}
              imageUrl={imageUrl}
              originalImageUrl={originalImageUrl}
              uploadedImageUrl={uploadedImageUrl}
              onTextChange={onTextChange}
              onLoadTemplate={onLoadTemplate}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

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

      <Separator />

      {/* قسم التحليل الذكي للمحتوى */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            التحليل الذكي للمحتوى
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              تحليل المحتوى واقتراحات التحسين باستخدام الذكاء الاصطناعي.
            </p>
            <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
              <h4 className="font-medium mb-2">ميزات التحليل الذكي:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• تحليل جودة المحتوى</li>
                <li>• اقتراحات التحسين</li>
                <li>• تحليل التفاعل المتوقع</li>
                <li>• تحسين SEO</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};