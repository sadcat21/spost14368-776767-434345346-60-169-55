
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Ruler } from "lucide-react";

export interface ShapeMarginSettings {
  topMargin: number;
  bottomMargin: number;
  leftMargin: number;
  rightMargin: number;
  uniformMargin: boolean;
}

interface ShapeMarginControllerProps {
  onUpdate: (settings: ShapeMarginSettings) => void;
  layoutType: string;
  triangleDirection: string;
}

const defaultSettings: ShapeMarginSettings = {
  topMargin: 20,
  bottomMargin: 20,
  leftMargin: 20,
  rightMargin: 20,
  uniformMargin: true
};

export const ShapeMarginController = ({ 
  onUpdate, 
  layoutType, 
  triangleDirection 
}: ShapeMarginControllerProps) => {
  const [settings, setSettings] = useState<ShapeMarginSettings>(defaultSettings);

  const updateSetting = <K extends keyof ShapeMarginSettings>(
    key: K,
    value: ShapeMarginSettings[K]
  ) => {
    let newSettings = { ...settings, [key]: value };
    
    // إذا كان التحكم موحد، نطبق القيمة على جميع الجهات
    if (settings.uniformMargin && key !== 'uniformMargin') {
      newSettings = {
        ...newSettings,
        topMargin: value as number,
        bottomMargin: value as number,
        leftMargin: value as number,
        rightMargin: value as number
      };
    }
    
    console.log('ShapeMarginController - إعدادات جديدة:', newSettings);
    setSettings(newSettings);
    onUpdate(newSettings);
  };

  const handleUniformToggle = (uniform: boolean) => {
    if (uniform) {
      // عند تفعيل التحكم الموحد، استخدم قيمة الهامش العلوي
      const uniformValue = settings.topMargin;
      const newSettings = {
        ...settings,
        uniformMargin: uniform,
        topMargin: uniformValue,
        bottomMargin: uniformValue,
        leftMargin: uniformValue,
        rightMargin: uniformValue
      };
      console.log('ShapeMarginController - تحكم موحد:', newSettings);
      setSettings(newSettings);
      onUpdate(newSettings);
    } else {
      const newSettings = { ...settings, uniformMargin: uniform };
      console.log('ShapeMarginController - تحكم منفصل:', newSettings);
      setSettings(newSettings);
      onUpdate(newSettings);
    }
  };

  // إظهار التحكم لجميع الأشكال بما في ذلك المستطيل

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-700 text-base font-bold">
          <Ruler className="h-5 w-5" />
          🎯 التحكم في مسافات الشكل من حدود الصورة
        </CardTitle>
        <p className="text-sm text-blue-600 font-medium">
          {layoutType === 'rectangle' 
            ? 'تحكم في المسافة بين إطار النص وحدود الصورة - للتحكم في موضع الإطار النصي'
            : 'تحكم في المسافة بين حدود الشكل الهندسي وحدود الصورة - هذا القسم يتحكم في موضع الشكل داخل الصورة'
          }
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Uniform Margin Toggle */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <Label className="text-sm font-medium">تحكم موحد في جميع الجهات</Label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.uniformMargin}
              onChange={(e) => handleUniformToggle(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-500">
              {settings.uniformMargin ? 'مفعل' : 'معطل'}
            </span>
          </div>
        </div>

        {settings.uniformMargin ? (
          /* Uniform Margin Control */
          <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
            <Label className="flex items-center gap-2 text-sm font-medium text-blue-800">
              <Move className="h-4 w-4" />
              المسافة من جميع الجهات: {settings.topMargin}px
            </Label>
            <Slider
              value={[settings.topMargin]}
              onValueChange={([value]) => updateSetting("topMargin", value)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="text-xs text-blue-600">
              جميع الجهات: {settings.topMargin}px من حدود الصورة
            </div>
          </div>
        ) : (
          /* Individual Margin Controls */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Top Margin */}
            <div className="space-y-2 p-3 bg-white rounded-lg border">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <ArrowUp className="h-4 w-4 text-blue-600" />
                المسافة العلوية: {settings.topMargin}px
              </Label>
              <Slider
                value={[settings.topMargin]}
                onValueChange={([value]) => updateSetting("topMargin", value)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="text-xs text-gray-500">
                من الحد العلوي للصورة
              </div>
            </div>

            {/* Bottom Margin */}
            <div className="space-y-2 p-3 bg-white rounded-lg border">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <ArrowDown className="h-4 w-4 text-blue-600" />
                المسافة السفلية: {settings.bottomMargin}px
              </Label>
              <Slider
                value={[settings.bottomMargin]}
                onValueChange={([value]) => updateSetting("bottomMargin", value)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="text-xs text-gray-500">
                من الحد السفلي للصورة
              </div>
            </div>

            {/* Left Margin */}
            <div className="space-y-2 p-3 bg-white rounded-lg border">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <ArrowLeft className="h-4 w-4 text-blue-600" />
                المسافة اليسرى: {settings.leftMargin}px
              </Label>
              <Slider
                value={[settings.leftMargin]}
                onValueChange={([value]) => updateSetting("leftMargin", value)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="text-xs text-gray-500">
                من الحد الأيسر للصورة
              </div>
            </div>

            {/* Right Margin */}
            <div className="space-y-2 p-3 bg-white rounded-lg border">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <ArrowRight className="h-4 w-4 text-blue-600" />
                المسافة اليمنى: {settings.rightMargin}px
              </Label>
              <Slider
                value={[settings.rightMargin]}
                onValueChange={([value]) => updateSetting("rightMargin", value)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="text-xs text-gray-500">
                من الحد الأيمن للصورة
              </div>
            </div>
          </div>
        )}

        {/* Visual Hint based on shape and direction */}
        <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-2xl">
              {layoutType === 'triangle' ? '△' : 
               layoutType === 'trapezoid' ? '⬟' :
               layoutType === 'half-triangle' ? '◮' :
               layoutType === 'half-trapezoid' ? '⬢' :
               layoutType === 'half-circle' ? '◐' :
               '⬮'}
            </div>
            <div className="text-sm">
              <p className="font-medium text-amber-800">
                💡 الشكل الحالي: {layoutType === 'triangle' ? 'مثلث' : 
                               layoutType === 'trapezoid' ? 'شبه منحرف' :
                               layoutType === 'half-triangle' ? 'نصف مثلث' :
                               layoutType === 'half-trapezoid' ? 'نصف شبه منحرف' :
                               layoutType === 'half-circle' ? 'نصف دائرة' :
                               'نصف بيضاوي'}
              </p>
              <p className="text-xs text-amber-600">
                الاتجاه: {triangleDirection === 'up' ? 'للأعلى' :
                        triangleDirection === 'down' ? 'للأسفل' :
                        triangleDirection === 'left' ? 'لليسار' :
                        'لليمين'}
              </p>
            </div>
          </div>
          <p className="text-xs text-amber-700">
            ✨ يمكنك تحريك الشكل أقرب أو أبعد عن حدود الصورة باستخدام أدوات التحكم أعلاه
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
