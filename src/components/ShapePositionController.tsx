import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Move, RotateCcw, Target, Navigation } from "lucide-react";

export interface ShapePositionSettings {
  // موضع الشكل X,Y داخل الصورة
  positionX: number; // 0-100 (left to right)
  positionY: number; // 0-100 (top to bottom)
  
  // حجم الشكل
  shapeWidth: number; // 0-100 (نسبة من عرض الصورة)
  shapeHeight: number; // 0-100 (نسبة من ارتفاع الصورة)
  
  // دوران الشكل
  rotation: number; // -180 to 180 degrees
}

interface ShapePositionControllerProps {
  onUpdate: (settings: ShapePositionSettings) => void;
  layoutType: 'rectangle' | 'triangle' | 'trapezoid' | 'half-triangle' | 'half-trapezoid' | 'half-circle' | 'half-ellipse';
  triangleDirection: 'up' | 'down' | 'left' | 'right';
}

const defaultSettings: ShapePositionSettings = {
  positionX: 50,
  positionY: 50,
  shapeWidth: 80,
  shapeHeight: 80,
  rotation: 0,
};

export const ShapePositionController = ({ 
  onUpdate, 
  layoutType, 
  triangleDirection 
}: ShapePositionControllerProps) => {
  const [settings, setSettings] = useState<ShapePositionSettings>(defaultSettings);

  const updateSetting = <K extends keyof ShapePositionSettings>(
    key: K,
    value: ShapePositionSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onUpdate(newSettings);
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    onUpdate(defaultSettings);
  };

  const centerShape = () => {
    const centeredSettings = {
      ...settings,
      positionX: 50,
      positionY: 50,
    };
    setSettings(centeredSettings);
    onUpdate(centeredSettings);
  };

  const moveLeft25 = () => {
    const newX = Math.max(0, settings.positionX - 25);
    const leftMovedSettings = {
      ...settings,
      positionX: newX,
    };
    setSettings(leftMovedSettings);
    onUpdate(leftMovedSettings);
  };

  const getShapePreview = () => {
    const shapeMap = {
      triangle: '△',
      trapezoid: '⬟',
      'half-triangle': '◮',
      'half-trapezoid': '⬢',
      'half-circle': '◐',
      'half-ellipse': '⬮',
      rectangle: '▭'
    };
    
    return `${shapeMap[layoutType] || '▭'} ${triangleDirection}`;
  };

  const getShapeName = () => {
    const nameMap = {
      triangle: 'مثلث',
      trapezoid: 'شبه منحرف',
      'half-triangle': 'نصف مثلث',
      'half-trapezoid': 'نصف شبه منحرف',
      'half-circle': 'نصف دائرة',
      'half-ellipse': 'نصف بيضاوي',
      rectangle: 'مستطيل'
    };
    
    return nameMap[layoutType] || 'شكل';
  };

  return (
    <Card className="border-2 border-green-200 bg-green-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-700 text-base font-bold">
          <Move className="h-5 w-5" />
          🎯 التحكم الدقيق في موضع وحجم الشكل (X,Y)
          <span className="text-sm font-normal text-muted-foreground">
            {getShapePreview()}
          </span>
        </CardTitle>
        <p className="text-sm text-green-600 font-medium">
          تحكم دقيق في موضع وحجم ودوران الشكل {getShapeName()} داخل الصورة
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        
        {/* موضع الشكل X,Y */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-green-800">
            <Target className="h-4 w-4" />
            موضع الشكل (X,Y)
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">X - الموضع الأفقي: {settings.positionX}%</Label>
              <Slider
                value={[settings.positionX]}
                onValueChange={([value]) => updateSetting("positionX", value)}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-green-600">
                0% = أقصى اليسار | 100% = أقصى اليمين
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Y - الموضع العمودي: {settings.positionY}%</Label>
              <Slider
                value={[settings.positionY]}
                onValueChange={([value]) => updateSetting("positionY", value)}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-green-600">
                0% = الأعلى | 100% = الأسفل
              </div>
            </div>
          </div>
        </div>

        {/* حجم الشكل */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-green-800">
            <Navigation className="h-4 w-4" />
            حجم الشكل
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">العرض: {settings.shapeWidth}%</Label>
              <Slider
                value={[settings.shapeWidth]}
                onValueChange={([value]) => updateSetting("shapeWidth", value)}
                min={20}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="text-xs text-green-600">
                من عرض الصورة
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">الارتفاع: {settings.shapeHeight}%</Label>
              <Slider
                value={[settings.shapeHeight]}
                onValueChange={([value]) => updateSetting("shapeHeight", value)}
                min={20}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="text-xs text-green-600">
                من ارتفاع الصورة
              </div>
            </div>
          </div>
        </div>

        {/* دوران الشكل */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">دوران الشكل: {settings.rotation}°</Label>
            <Slider
              value={[settings.rotation]}
              onValueChange={([value]) => updateSetting("rotation", value)}
              min={-180}
              max={180}
              step={5}
              className="w-full"
            />
            <div className="text-xs text-green-600">
              -180° إلى 180° للدوران الكامل
            </div>
          </div>
        </div>

        {/* أزرار التحكم السريع */}
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant="outline" 
            onClick={centerShape}
            size="sm"
          >
            <Target className="mr-2 h-4 w-4" />
            توسيط الشكل
          </Button>
          
          <Button 
            variant="outline" 
            onClick={moveLeft25}
            size="sm"
          >
            ⬅️ يسار 25%
          </Button>
          
          <Button 
            variant="outline" 
            onClick={resetToDefaults}
            size="sm"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            إعادة تعيين
          </Button>
        </div>

        {/* معاينة موضع الشكل */}
        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-2 mb-2">
            <div className="text-2xl flex-shrink-0" style={{ 
              transform: `rotate(${settings.rotation}deg)`,
              transition: 'transform 0.3s ease'
            }}>
              {getShapePreview().split(' ')[0]}
            </div>
            <div className="text-sm">
              <p className="font-medium text-green-800">
                📍 الموضع: X={settings.positionX}%, Y={settings.positionY}%
              </p>
              <p className="text-xs text-green-600">
                الحجم: {settings.shapeWidth}% × {settings.shapeHeight}% | الدوران: {settings.rotation}°
              </p>
            </div>
          </div>
          <p className="text-xs text-green-700">
            💡 استخدم أدوات التحكم أعلاه لضبط موضع وحجم ودوران الشكل بدقة
          </p>
        </div>
      </CardContent>
    </Card>
  );
};