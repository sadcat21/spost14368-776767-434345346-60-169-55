import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";
import { BackgroundControls } from "@/components/AdminTabs/BackgroundControls";
import { ContentPreview } from "@/components/ContentPreview";

interface BackgroundControlsPageProps {
  copySettings?: {
    livePreview?: boolean;
  };
}

const BackgroundControlsPage = ({ copySettings }: BackgroundControlsPageProps) => {
  const safeCopySettings = copySettings || { livePreview: true };
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Image className="h-5 w-5" />
            أدوات تأثيرات خلفية الصورة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
            <h3 className="font-medium text-primary mb-2">معالجة وتحسين الخلفيات</h3>
            <p className="text-sm text-muted-foreground">
              أدوات متقدمة لتأثيرات وتحسينات خلفية الصورة ومعالجة البيانات البصرية
            </p>
          </div>

          <div className="grid gap-6">
            <BackgroundControls
              backgroundEffectsSettings={{
                blurEnabled: false,
                blurAmount: 0,
                blurType: 'gaussian',
                lightingEnabled: false,
                lightingType: 'ambient',
                lightIntensity: 50,
                lightColor: '#ffffff',
                lightAngle: 45,
                lightDistance: 100,
                atmosphericEnabled: false,
                fogDensity: 0,
                fogColor: '#ffffff',
                particleCount: 0,
                particleType: 'dust',
                overlayEnabled: false,
                overlayTexture: 'noise',
                overlayIntensity: 20,
                overlayBlendMode: 'overlay',
                vignetteEnabled: false,
                vignetteIntensity: 30,
                vignetteSize: 70,
                vignetteColor: '#000000'
              }}
              setBackgroundEffectsSettings={() => {}}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* LivePreview مع إمكانية الإخفاء/الإظهار */}
      {safeCopySettings.livePreview && (
        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Image className="h-4 w-4" />
              معاينة مباشرة - تأثيرات خلفية الصورة
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ContentPreview 
              title="معاينة تحكم الخلفية"
              className="w-full h-64"
              compact={true}
              showDeviceToggle={false}
              autoRefresh={true}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BackgroundControlsPage;