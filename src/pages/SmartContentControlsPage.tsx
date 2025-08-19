import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { SmartContentControls } from "@/components/AdminTabs/SmartContentControls";
import { toast } from "sonner";

interface SmartContentControlsPageProps {
  copySettings?: {
    livePreview?: boolean;
  };
}

const SmartContentControlsPage = ({ copySettings }: SmartContentControlsPageProps) => {
  const safeCopySettings = copySettings || { livePreview: true };
  const [text, setText] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleTextChange = (newText: string) => {
    setText(newText);
  };

  const handleLoadTemplate = (template: any) => {
    console.log("Loading template:", template);
    toast.success("تم تحميل النموذج بنجاح!");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Eye className="h-5 w-5" />
            المحتوى الذكي والمعاينة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SmartContentControls
            text={text}
            imageUrl={imageUrl}
            originalImageUrl={imageUrl}
            uploadedImageUrl={imageUrl}
            onTextChange={handleTextChange}
            onLoadTemplate={handleLoadTemplate}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartContentControlsPage;