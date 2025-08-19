
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Image, Type, Palette, Upload, Frame } from "lucide-react";

interface ResetControlsProps {
  onResetImage: () => void;
  onResetText: () => void;
  onResetTextSettings: () => void;
  onResetColorSettings: () => void;
  onResetLogoSettings: () => void;
  onResetFrameSettings: () => void;
  onResetAll: () => void;
}

export const ResetControls = ({
  onResetImage,
  onResetText,
  onResetTextSettings,
  onResetColorSettings,
  onResetLogoSettings,
  onResetFrameSettings,
  onResetAll
}: ResetControlsProps) => {
  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <RotateCcw className="h-5 w-5" />
          إعادة تعيين المحتوى
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" onClick={onResetImage} className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            إعادة تعيين الصورة
          </Button>
          
          <Button variant="outline" onClick={onResetText} className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            إعادة تعيين النص
          </Button>
          
          <Button variant="outline" onClick={onResetTextSettings} className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            إعادة تعيين تنسيق النص
          </Button>
          
          <Button variant="outline" onClick={onResetColorSettings} className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            إعادة تعيين الألوان
          </Button>
          
          <Button variant="outline" onClick={onResetLogoSettings} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            إعادة تعيين الشعار
          </Button>

          <Button variant="outline" onClick={onResetFrameSettings} className="flex items-center gap-2">
            <Frame className="h-4 w-4" />
            إعادة تعيين الإطار
          </Button>
        </div>
        
        <Button 
          variant="destructive" 
          onClick={onResetAll}
          className="w-full"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          إعادة تعيين كل شيء
        </Button>
      </CardContent>
    </Card>
  );
};
