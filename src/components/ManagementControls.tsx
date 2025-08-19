import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Layers, RotateCcw, Move, Ruler, Layout } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShapeMarginSettings } from "./ShapeMarginController";
import { TextDistributionSettings } from "./TextDistributionController";
import { SpaceLayoutController, SpaceLayoutSettings } from "./SpaceLayoutController";

interface ManagementControlsProps {
  layoutType: 'rectangle' | 'triangle' | 'trapezoid' | 'half-triangle' | 'half-trapezoid' | 'half-circle' | 'half-ellipse';
  triangleDirection: 'up' | 'down' | 'left' | 'right';
  onLayoutChange?: (layoutType: 'rectangle' | 'triangle' | 'trapezoid' | 'half-triangle' | 'half-trapezoid' | 'half-circle' | 'half-ellipse') => void;
  onDirectionChange?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  shapeMarginSettings: ShapeMarginSettings;
  textDistributionSettings: TextDistributionSettings;
  spaceLayoutSettings?: SpaceLayoutSettings;
  onShapeMarginUpdate?: (settings: ShapeMarginSettings) => void;
  onTextDistributionUpdate?: (settings: TextDistributionSettings) => void;
  onSpaceLayoutUpdate?: (settings: SpaceLayoutSettings) => void;
}

const defaultShapeMarginSettings: ShapeMarginSettings = {
  topMargin: 20,
  bottomMargin: 20,
  leftMargin: 20,
  rightMargin: 20,
  uniformMargin: true
};

const defaultTextDistributionSettings: TextDistributionSettings = {
  horizontalPosition: 50,
  verticalPosition: 50,
  textAreaWidth: 80,
  textAreaHeight: 60,
  autoDistribution: true,
  distributionStrategy: 'optimal',
  innerPadding: 15,
  avoidEdges: true,
  edgeBuffer: 20,
  shapeAware: true,
  dynamicSizing: true,
};

export const ManagementControls = ({
  layoutType,
  triangleDirection,
  onLayoutChange,
  onDirectionChange,
  shapeMarginSettings,
  textDistributionSettings,
  spaceLayoutSettings,
  onShapeMarginUpdate,
  onTextDistributionUpdate,
  onSpaceLayoutUpdate
}: ManagementControlsProps) => {
  
  const updateShapeMarginSetting = <K extends keyof ShapeMarginSettings>(
    key: K,
    value: ShapeMarginSettings[K]
  ) => {
    const newSettings = { ...shapeMarginSettings, [key]: value };
    onShapeMarginUpdate?.(newSettings);
  };

  const updateTextDistributionSetting = <K extends keyof TextDistributionSettings>(
    key: K,
    value: TextDistributionSettings[K]
  ) => {
    const newSettings = { ...textDistributionSettings, [key]: value };
    onTextDistributionUpdate?.(newSettings);
  };

  const resetToDefaults = () => {
    onShapeMarginUpdate?.(defaultShapeMarginSettings);
    onTextDistributionUpdate?.(defaultTextDistributionSettings);
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-primary flex items-center gap-2">
          <Layers className="h-5 w-5" />
          إدارة النموذج والتوزيع
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetToDefaults}
          className="h-8 px-3"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Layout Shape Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-medium">
            <Layers className="h-5 w-5 text-primary" />
            إعدادات نوع النموذج والأشكال الهندسية
          </div>
          
          <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
            <div className="space-y-2">
              <Label className="text-sm font-medium">نوع النموذج</Label>
              <Select value={layoutType} onValueChange={onLayoutChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rectangle">الإطار النصي المستطيل</SelectItem>
                  <SelectItem value="triangle">نموذج المثلث</SelectItem>
                  <SelectItem value="trapezoid">نموذج الشبه منحرف</SelectItem>
                  <SelectItem value="half-triangle">نموذج نصف المثلث</SelectItem>
                  <SelectItem value="half-trapezoid">نموذج نصف الشبه منحرف</SelectItem>
                  <SelectItem value="half-circle">نموذج نصف الدائرة</SelectItem>
                  <SelectItem value="half-ellipse">نموذج نصف البيضاوي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(layoutType !== 'rectangle') && (
              <div className="space-y-2 animate-fade-in">
                <Label className="text-sm font-medium">اتجاه الشكل</Label>
                <Select value={triangleDirection} onValueChange={onDirectionChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="up">للأعلى ↑</SelectItem>
                    <SelectItem value="down">للأسفل ↓</SelectItem>
                    <SelectItem value="left">لليسار ←</SelectItem>
                    <SelectItem value="right">لليمين →</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Shape Margin Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-medium">
            <Move className="h-5 w-5 text-primary" />
            إعدادات هوامش الشكل
          </div>
          
          <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">الهامش العلوي: {shapeMarginSettings.topMargin}px</Label>
                <Slider
                  value={[shapeMarginSettings.topMargin]}
                  onValueChange={([value]) => updateShapeMarginSetting('topMargin', value)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">الهامش السفلي: {shapeMarginSettings.bottomMargin}px</Label>
                <Slider
                  value={[shapeMarginSettings.bottomMargin]}
                  onValueChange={([value]) => updateShapeMarginSetting('bottomMargin', value)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">الهامش الأيسر: {shapeMarginSettings.leftMargin}px</Label>
                <Slider
                  value={[shapeMarginSettings.leftMargin]}
                  onValueChange={([value]) => updateShapeMarginSetting('leftMargin', value)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">الهامش الأيمن: {shapeMarginSettings.rightMargin}px</Label>
                <Slider
                  value={[shapeMarginSettings.rightMargin]}
                  onValueChange={([value]) => updateShapeMarginSetting('rightMargin', value)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Text Distribution Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-medium">
            <Ruler className="h-5 w-5 text-primary" />
            إعدادات توزيع النص
          </div>
          
          <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">الموضع الأفقي: {textDistributionSettings.horizontalPosition}%</Label>
                <Slider
                  value={[textDistributionSettings.horizontalPosition]}
                  onValueChange={([value]) => updateTextDistributionSetting('horizontalPosition', value)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">الموضع العمودي: {textDistributionSettings.verticalPosition}%</Label>
                <Slider
                  value={[textDistributionSettings.verticalPosition]}
                  onValueChange={([value]) => updateTextDistributionSetting('verticalPosition', value)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">عرض منطقة النص: {textDistributionSettings.textAreaWidth}%</Label>
                <Slider
                  value={[textDistributionSettings.textAreaWidth]}
                  onValueChange={([value]) => updateTextDistributionSetting('textAreaWidth', value)}
                  min={20}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">ارتفاع منطقة النص: {textDistributionSettings.textAreaHeight}%</Label>
                <Slider
                  value={[textDistributionSettings.textAreaHeight]}
                  onValueChange={([value]) => updateTextDistributionSetting('textAreaHeight', value)}
                  min={20}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Space Layout Controller */}
        {onSpaceLayoutUpdate && spaceLayoutSettings && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-medium">
              <Layout className="h-5 w-5 text-primary" />
              تخطيط وتقسيم المساحة
            </div>
            
            <SpaceLayoutController 
              onUpdate={onSpaceLayoutUpdate}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};