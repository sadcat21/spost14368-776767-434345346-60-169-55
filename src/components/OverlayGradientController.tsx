import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Palette,
  Plus,
  Trash2,
  RotateCcw,
  Circle,
  Square,
  MoreHorizontal
} from "lucide-react";
// تعريف واجهة GradientSettings محلياً لتجنب التبعية الدائرية
export interface GradientSettings {
  // إعدادات الطبقة العلوية
  useOverlayGradient: boolean;
  
  // نوع التدرج
  gradientType: 'radial' | 'linear' | 'conic';
  gradientAngle: number; // زاوية التدرج بالدرجات
  
  // موضع المركز
  centerX: number; // النسبة المئوية
  centerY: number; // النسبة المئوية
  
  // إعدادات الحجم
  gradientSize: number; // حجم التدرج بالنسبة المئوية
  
  // التوقفات الحادة
  colorStops: Array<{
    color: string;
    opacity: number; // الشفافية بالنسبة المئوية
    position: number; // موضع البداية/النهاية بالنسبة المئوية
  }>;
}

interface OverlayGradientControllerProps {
  settings: GradientSettings;
  onUpdate: (settings: GradientSettings) => void;
}

const defaultGradientSettings: GradientSettings = {
  useOverlayGradient: true,
  gradientType: 'radial',
  gradientAngle: 210,
  centerX: 50,
  centerY: 50,
  gradientSize: 100,
  colorStops: [
    {
      color: "#3b82f6",
      opacity: 100,
      position: 60
    },
    {
      color: "#1e40af",
      opacity: 100,
      position: 15
    }
  ]
};

export const OverlayGradientController = ({ 
  settings = defaultGradientSettings, 
  onUpdate 
}: OverlayGradientControllerProps) => {
  const updateSetting = <K extends keyof GradientSettings>(
    key: K,
    value: GradientSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    onUpdate(newSettings);
  };

  const updateColorStop = (index: number, field: 'color' | 'opacity' | 'position', value: string | number) => {
    const newStops = [...settings.colorStops];
    newStops[index] = { ...newStops[index], [field]: value };
    updateSetting('colorStops', newStops);
  };

  const addColorStop = () => {
    const newStops = [...settings.colorStops];
    const newPosition = newStops.length > 0 ? 
      Math.max(...newStops.map(s => s.position)) + 10 : 50;
    
    newStops.push({
      color: "#3b82f6",
      opacity: 100,
      position: Math.min(newPosition, 100)
    });
    updateSetting('colorStops', newStops);
  };

  const removeColorStop = (index: number) => {
    if (settings.colorStops.length > 2) {
      const newStops = settings.colorStops.filter((_, i) => i !== index);
      updateSetting('colorStops', newStops);
    }
  };

  const resetToDefaults = () => {
    onUpdate(defaultGradientSettings);
  };

  const generateGradientCSS = () => {
    const sortedStops = [...settings.colorStops].sort((a, b) => a.position - b.position);
    const stopStrings = sortedStops.map(stop => 
      `rgba(${parseInt(stop.color.slice(1, 3), 16)}, ${parseInt(stop.color.slice(3, 5), 16)}, ${parseInt(stop.color.slice(5, 7), 16)}, ${stop.opacity / 100}) ${stop.position}%`
    );

    switch (settings.gradientType) {
      case 'linear':
        return `linear-gradient(${settings.gradientAngle}deg, ${stopStrings.join(', ')})`;
      case 'radial':
        return `radial-gradient(ellipse ${settings.gradientSize}% ${settings.gradientSize}% at ${settings.centerX}% ${settings.centerY}%, ${stopStrings.join(', ')})`;
      case 'conic':
        return `conic-gradient(from ${settings.gradientAngle}deg at ${settings.centerX}% ${settings.centerY}%, ${stopStrings.join(', ')})`;
      default:
        return 'none';
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-primary flex items-center gap-2">
          <Palette className="h-5 w-5" />
          إعدادات الطبقة العلوية
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
      
      <CardContent className="space-y-6">
        {/* تفعيل استخدام تدرج الطبقة العلوية */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-semibold">استخدام تدرج الطبقة العلوية</Label>
            <p className="text-xs text-muted-foreground">
              تفعيل أو إلغاء تفعيل تأثير التدرج على الطبقة العلوية
            </p>
          </div>
          <Switch
            checked={settings.useOverlayGradient}
            onCheckedChange={(checked) => updateSetting('useOverlayGradient', checked)}
          />
        </div>

        {settings.useOverlayGradient && (
          <>
            <Separator />

            {/* نوع التدرج */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold">نوع التدرج</Label>
              
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={settings.gradientType === 'linear' ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting('gradientType', 'linear')}
                  className="flex items-center gap-2 h-auto py-3"
                >
                  <Square className="h-4 w-4" />
                  <span className="text-xs">خطي</span>
                </Button>
                
                <Button
                  variant={settings.gradientType === 'radial' ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting('gradientType', 'radial')}
                  className="flex items-center gap-2 h-auto py-3"
                >
                  <Circle className="h-4 w-4" />
                  <span className="text-xs">دائري</span>
                </Button>
                
                <Button
                  variant={settings.gradientType === 'conic' ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting('gradientType', 'conic')}
                  className="flex items-center gap-2 h-auto py-3"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="text-xs">مخروطي</span>
                </Button>
              </div>
            </div>

            {/* إعدادات الزاوية */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm">زاوية التدرج</Label>
                <Badge variant="secondary" className="text-xs">
                  {settings.gradientAngle}°
                </Badge>
              </div>
              <Slider
                value={[settings.gradientAngle]}
                onValueChange={([value]) => updateSetting('gradientAngle', value)}
                max={360}
                min={0}
                step={5}
                className="w-full"
              />
            </div>

            {/* موضع المركز */}
            {(settings.gradientType === 'radial' || settings.gradientType === 'conic') && (
              <div className="space-y-4">
                <Label className="text-sm font-semibold">موضع المركز</Label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm">المحور X</Label>
                      <Badge variant="secondary" className="text-xs">
                        {settings.centerX}%
                      </Badge>
                    </div>
                    <Slider
                      value={[settings.centerX]}
                      onValueChange={([value]) => updateSetting('centerX', value)}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm">المحور Y</Label>
                      <Badge variant="secondary" className="text-xs">
                        {settings.centerY}%
                      </Badge>
                    </div>
                    <Slider
                      value={[settings.centerY]}
                      onValueChange={([value]) => updateSetting('centerY', value)}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* إعدادات الحجم */}
            {settings.gradientType === 'radial' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm">حجم التدرج</Label>
                  <Badge variant="secondary" className="text-xs">
                    {settings.gradientSize}%
                  </Badge>
                </div>
                <Slider
                  value={[settings.gradientSize]}
                  onValueChange={([value]) => updateSetting('gradientSize', value)}
                  max={200}
                  min={50}
                  step={5}
                  className="w-full"
                />
              </div>
            )}

            <Separator />

            {/* التوقفات الحادة */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">التوقفات الحادة</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addColorStop}
                  className="h-8 px-3"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {settings.colorStops.map((stop, index) => (
                  <div key={index} className="space-y-3 p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        {index === 0 ? 'اللون الأول' : index === 1 ? 'اللون الثاني' : `اللون ${index + 1}`}
                      </Label>
                      {settings.colorStops.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeColorStop(index)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    {/* اللون */}
                    <div className="space-y-2">
                      <Label className="text-xs">اللون</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={stop.color}
                          onChange={(e) => updateColorStop(index, 'color', e.target.value)}
                          className="w-10 h-8 rounded border border-input cursor-pointer"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={stop.color}
                            onChange={(e) => updateColorStop(index, 'color', e.target.value)}
                            className="w-full px-3 py-1 text-sm border border-input rounded bg-background"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* الشفافية */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs">الشفافية</Label>
                        <Badge variant="secondary" className="text-xs">
                          {stop.opacity}%
                        </Badge>
                      </div>
                      <Slider
                        value={[stop.opacity]}
                        onValueChange={([value]) => updateColorStop(index, 'opacity', value)}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    
                    {/* الموضع */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs">
                          {index === 0 ? 'موضع البداية' : index === settings.colorStops.length - 1 ? 'موضع النهاية' : 'الموضع'}
                        </Label>
                        <Badge variant="secondary" className="text-xs">
                          {stop.position}%
                        </Badge>
                      </div>
                      <Slider
                        value={[stop.position]}
                        onValueChange={([value]) => updateColorStop(index, 'position', value)}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* معاينة التدرج */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">معاينة التدرج</Label>
              <div 
                className="h-20 rounded-lg border-2 border-dashed border-muted-foreground/20 relative overflow-hidden"
                style={{
                  background: generateGradientCSS()
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Badge variant="secondary" className="text-xs bg-black/20 text-white">
                    {settings.gradientType === 'linear' ? 'خطي' : 
                     settings.gradientType === 'radial' ? 'دائري' : 'مخروطي'} - {settings.gradientAngle}°
                  </Badge>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};