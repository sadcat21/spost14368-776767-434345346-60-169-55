import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SocialPlatformPreview } from "./SocialPlatformPreview";
import { TemplateLibrary } from "./TemplateLibrary";
import { Analytics } from "./Analytics";
import { Share2, Archive, BarChart3 } from "lucide-react";

interface UnifiedPreviewTabsProps {
  text: string;
  imageUrl?: string;
  originalImageUrl?: string;
  uploadedImageUrl?: string;
  onTextChange?: (newText: string) => void;
  onLoadTemplate?: (template: any) => void;
}

export const UnifiedPreviewTabs = ({
  text,
  imageUrl,
  originalImageUrl,
  uploadedImageUrl,
  onTextChange,
  onLoadTemplate
}: UnifiedPreviewTabsProps) => {
  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="text-primary">إدارة المحتوى والمعاينة</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              معاينة المنصات
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              مكتبة النماذج
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              الإحصائيات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-0">
            <SocialPlatformPreview
              text={text}
              imageUrl={imageUrl}
              originalImageUrl={originalImageUrl}
              uploadedImageUrl={uploadedImageUrl}
              onTextChange={onTextChange}
            />
          </TabsContent>

          <TabsContent value="templates" className="mt-0">
            <TemplateLibrary onLoadTemplate={onLoadTemplate || (() => {})} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <Analytics />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};