import { Image, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackgroundEffectsController } from "../BackgroundEffectsController";


import type { BackgroundEffectsSettings } from "../BackgroundEffectsController";

interface BackgroundControlsProps {
  // Settings
  backgroundEffectsSettings: BackgroundEffectsSettings;
  
  // Update handlers
  setBackgroundEffectsSettings: (settings: BackgroundEffectsSettings) => void;
}

export const BackgroundControls = ({
  backgroundEffectsSettings,
  setBackgroundEffectsSettings
}: BackgroundControlsProps) => {
  return (
    <div className="space-y-6">
      {/* قسم تأثيرات الخلفية */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Image className="h-4 w-4" />
              تأثيرات الخلفية والبصريات
            </CardTitle>
            
          </div>
        </CardHeader>
        <CardContent>
          <BackgroundEffectsController
            settings={backgroundEffectsSettings}
            onUpdate={setBackgroundEffectsSettings}
          />
        </CardContent>
      </Card>
    </div>
  );
};