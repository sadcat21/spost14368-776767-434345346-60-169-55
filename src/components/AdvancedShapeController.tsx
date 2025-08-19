import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RotateCcw, Shapes, Circle, Square, Triangle, Pentagon, Hexagon, Octagon } from "lucide-react";

export interface AdvancedShapeSettings {
  shapeType: 'rectangle' | 'triangle' | 'trapezoid' | 'half-triangle' | 'half-trapezoid' | 'half-circle' | 'half-ellipse' | 'polygon' | 'custom';
  cornerRadius: number;
  hasRoundedCorners: boolean;
  polygonSides: number;
  polygonRotation: number;
  curvatureStrength: number;
  edgeSmoothness: number;
  customPath?: string;
  aspectRatio: number;
  skewX: number;
  skewY: number;
}

interface AdvancedShapeControllerProps {
  settings: AdvancedShapeSettings;
  onUpdate: (settings: AdvancedShapeSettings) => void;
}

const defaultSettings: AdvancedShapeSettings = {
  shapeType: 'rectangle',
  cornerRadius: 0,
  hasRoundedCorners: false,
  polygonSides: 6,
  polygonRotation: 0,
  curvatureStrength: 0,
  edgeSmoothness: 0,
  aspectRatio: 1,
  skewX: 0,
  skewY: 0
};

const shapeOptions = [
  { value: 'rectangle', label: 'مستطيل', icon: Square },
  { value: 'triangle', label: 'مثلث', icon: Triangle },
  { value: 'trapezoid', label: 'شبه منحرف', icon: Shapes },
  { value: 'half-triangle', label: 'نصف مثلث', icon: Triangle },
  { value: 'half-trapezoid', label: 'نصف شبه منحرف', icon: Shapes },
  { value: 'half-circle', label: 'نصف دائرة', icon: Circle },
  { value: 'half-ellipse', label: 'نصف بيضاوي', icon: Circle },
  { value: 'polygon', label: 'مضلع', icon: Hexagon },
  { value: 'custom', label: 'مخصص', icon: Shapes }
];

const polygonOptions = [
  { value: 5, label: 'خماسي', icon: Pentagon },
  { value: 6, label: 'سداسي', icon: Hexagon },
  { value: 8, label: 'ثماني', icon: Octagon },
  { value: 10, label: 'عشاري', icon: Shapes },
  { value: 12, label: 'اثني عشري', icon: Shapes }
];

export const AdvancedShapeController = ({ settings, onUpdate }: AdvancedShapeControllerProps) => {
  const updateSetting = <K extends keyof AdvancedShapeSettings>(
    key: K,
    value: AdvancedShapeSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    onUpdate(newSettings);
  };

  const resetToDefaults = () => {
    onUpdate(defaultSettings);
  };

  const generatePolygonPath = (sides: number, rotation: number = 0) => {
    const points: string[] = [];
    const centerX = 50;
    const centerY = 50;
    const radius = 45;
    
    for (let i = 0; i < sides; i++) {
      const angle = (2 * Math.PI * i) / sides + (rotation * Math.PI) / 180;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(`${x}% ${y}%`);
    }
    
    return `polygon(${points.join(', ')})`;
  };

  const getShapeStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      transform: `skew(${settings.skewX}deg, ${settings.skewY}deg)`,
    };

    if (settings.shapeType === 'polygon') {
      baseStyle.clipPath = generatePolygonPath(settings.polygonSides, settings.polygonRotation);
    } else if (settings.shapeType === 'rectangle' && settings.hasRoundedCorners) {
      baseStyle.borderRadius = `${settings.cornerRadius}px`;
    }

    return baseStyle;
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-primary flex items-center gap-2">
          <Shapes className="h-5 w-5" />
          أشكال متقدمة
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
      <CardContent className="space-y-4">
        {/* نوع الشكل */}
        <div className="space-y-2">
          <Label className="text-sm">نوع الشكل</Label>
          <Select
            value={settings.shapeType}
            onValueChange={(value: AdvancedShapeSettings['shapeType']) => updateSetting('shapeType', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {shapeOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* معاينة الشكل */}
        <div className="space-y-2">
          <Label className="text-sm">معاينة الشكل</Label>
          <div className="w-full h-24 bg-muted rounded-lg flex items-center justify-center">
            <div 
              className="w-16 h-16 bg-primary"
              style={getShapeStyle()}
            />
          </div>
        </div>

        {/* إعدادات الزوايا المدورة */}
        {(settings.shapeType === 'rectangle' || settings.shapeType === 'trapezoid') && (
          <>
            <div className="flex items-center justify-between">
              <Label htmlFor="rounded-corners" className="text-sm">
                زوايا دائرية
              </Label>
              <Switch
                id="rounded-corners"
                checked={settings.hasRoundedCorners}
                onCheckedChange={(checked) => updateSetting('hasRoundedCorners', checked)}
              />
            </div>

            {settings.hasRoundedCorners && (
              <div className="space-y-2">
                <Label className="text-sm">
                  نصف قطر الزاوية: {settings.cornerRadius}px
                </Label>
                <Slider
                  value={[settings.cornerRadius]}
                  onValueChange={([value]) => updateSetting('cornerRadius', value)}
                  max={50}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </>
        )}

        {/* إعدادات المضلع */}
        {settings.shapeType === 'polygon' && (
          <>
            <div className="space-y-2">
              <Label className="text-sm">عدد الأضلاع</Label>
              <Select
                value={settings.polygonSides.toString()}
                onValueChange={(value) => updateSetting('polygonSides', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {polygonOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          {option.label} ({option.value} أضلاع)
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">
                دوران المضلع: {settings.polygonRotation}°
              </Label>
              <Slider
                value={[settings.polygonRotation]}
                onValueChange={([value]) => updateSetting('polygonRotation', value)}
                max={360}
                min={0}
                step={15}
                className="w-full"
              />
            </div>
          </>
        )}

        {/* التحكم في الانحناء */}
        <div className="space-y-2">
          <Label className="text-sm">
            قوة الانحناء: {settings.curvatureStrength}%
          </Label>
          <Slider
            value={[settings.curvatureStrength]}
            onValueChange={([value]) => updateSetting('curvatureStrength', value)}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
        </div>

        {/* نعومة الأطراف */}
        <div className="space-y-2">
          <Label className="text-sm">
            نعومة الأطراف: {settings.edgeSmoothness}%
          </Label>
          <Slider
            value={[settings.edgeSmoothness]}
            onValueChange={([value]) => updateSetting('edgeSmoothness', value)}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
        </div>

        {/* تحريف الشكل */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-sm">
              إمالة أفقية: {settings.skewX}°
            </Label>
            <Slider
              value={[settings.skewX]}
              onValueChange={([value]) => updateSetting('skewX', value)}
              max={30}
              min={-30}
              step={1}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm">
              إمالة عمودية: {settings.skewY}°
            </Label>
            <Slider
              value={[settings.skewY]}
              onValueChange={([value]) => updateSetting('skewY', value)}
              max={30}
              min={-30}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};