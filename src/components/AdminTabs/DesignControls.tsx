import { Shapes, Move, Target, Settings, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShapeInversionController } from "../ShapeInversionController";
import { AdvancedShapeController } from "../AdvancedShapeController";
import { ManagementControls } from "../ManagementControls";


import type { ShapeInversionSettings } from "../ShapeInversionController";
import type { AdvancedShapeSettings } from "../AdvancedShapeController";
import type { ShapeMarginSettings } from "../ShapeMarginController";
import type { TextDistributionSettings } from "../TextDistributionController";
import type { SpaceLayoutSettings } from "../SpaceLayoutController";

interface DesignControlsProps {
  // Settings
  shapeInversionSettings: ShapeInversionSettings;
  advancedShapeSettings: AdvancedShapeSettings;
  shapeMarginSettings: ShapeMarginSettings;
  textDistributionSettings: TextDistributionSettings;
  spaceLayoutSettings: SpaceLayoutSettings;
  
  // Update handlers
  setShapeInversionSettings: (settings: ShapeInversionSettings) => void;
  setAdvancedShapeSettings: (settings: AdvancedShapeSettings) => void;
  setShapeMarginSettings: (settings: ShapeMarginSettings) => void;
  setTextDistributionSettings: (settings: TextDistributionSettings) => void;
  setSpaceLayoutSettings: (settings: SpaceLayoutSettings) => void;
  
  // Layout controls
  layoutType: 'rectangle' | 'triangle' | 'trapezoid' | 'half-triangle' | 'half-trapezoid' | 'half-circle' | 'half-ellipse';
  triangleDirection: 'up' | 'down' | 'left' | 'right';
  onLayoutChange: (type: 'rectangle' | 'triangle' | 'trapezoid' | 'half-triangle' | 'half-trapezoid' | 'half-circle' | 'half-ellipse') => void;
  onDirectionChange: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

export const DesignControls = ({
  shapeInversionSettings,
  advancedShapeSettings,
  shapeMarginSettings,
  textDistributionSettings,
  spaceLayoutSettings,
  setShapeInversionSettings,
  setAdvancedShapeSettings,
  setShapeMarginSettings,
  setTextDistributionSettings,
  setSpaceLayoutSettings,
  layoutType,
  triangleDirection,
  onLayoutChange,
  onDirectionChange
}: DesignControlsProps) => {
  return (
    <div className="space-y-6">
      {/* قسم إدارة النموذج والتوزيع */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Settings className="h-4 w-4" />
              إدارة النموذج والتوزيع
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ManagementControls
            layoutType={layoutType}
            triangleDirection={triangleDirection}
            onLayoutChange={onLayoutChange}
            onDirectionChange={onDirectionChange}
            shapeMarginSettings={shapeMarginSettings}
            textDistributionSettings={textDistributionSettings}
            spaceLayoutSettings={spaceLayoutSettings}
            onShapeMarginUpdate={setShapeMarginSettings}
            onTextDistributionUpdate={setTextDistributionSettings}
            onSpaceLayoutUpdate={setSpaceLayoutSettings}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* قسم إعدادات الأشكال الهندسية */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Shapes className="h-4 w-4" />
              إعدادات الأشكال الهندسية
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdvancedShapeController
            settings={advancedShapeSettings}
            onUpdate={setAdvancedShapeSettings}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* قسم إعدادات قوامى الشكل */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <RotateCcw className="h-4 w-4" />
              إعدادات قوامى الشكل
            </CardTitle>
            
          </div>
        </CardHeader>
        <CardContent>
          <ShapeInversionController
            settings={shapeInversionSettings}
            onUpdate={setShapeInversionSettings}
          />
        </CardContent>
      </Card>
    </div>
  );
};