
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Type, RotateCcw, Hash } from "lucide-react";
import { TextSettings } from "./ContentCanvas";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TextCustomizationProps {
  onUpdate: (settings: TextSettings) => void;
}

const defaultSettings: TextSettings = {
  fontFamily: 'Cairo, sans-serif',
  fontSize: 24,
  fontWeight: '600',
  textAlign: 'center',
  lineHeight: 1.6,
  letterSpacing: 0,
  textColor: '#ffffff',
  shadowColor: 'rgba(0, 0, 0, 0.8)',
  shadowBlur: 4,
  shadowOffsetX: 2,
  shadowOffsetY: 2,
};

const fontFamilies = [
  { value: "Cairo, sans-serif", label: "Cairo" },
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Georgia", label: "Georgia" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Verdana", label: "Verdana" },
  { value: "Tahoma", label: "Tahoma" },
  { value: "Impact", label: "Impact" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Montserrat", label: "Montserrat" }
];

export const TextCustomizer = ({ onUpdate }: TextCustomizationProps) => {
  const [settings, setSettings] = useState<TextSettings>(defaultSettings);

  const updateSetting = <K extends keyof TextSettings>(
    key: K,
    value: TextSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onUpdate(newSettings);
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    onUpdate(defaultSettings);
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Type className="h-5 w-5" />
          تخصيص النص
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hashtag Information */}
        <Alert className="border-blue-200 bg-blue-50">
          <Hash className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            سيتم إزالة الهاشتاغات تلقائياً من النص المعروض على الصورة للحصول على مظهر أنظف ومميز.
          </AlertDescription>
        </Alert>

        {/* Font Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>نوع الخط</Label>
            <Select value={settings.fontFamily} onValueChange={(value) => updateSetting("fontFamily", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>وزن الخط</Label>
            <Select value={settings.fontWeight} onValueChange={(value) => updateSetting("fontWeight", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">عادي</SelectItem>
                <SelectItem value="600">متوسط</SelectItem>
                <SelectItem value="bold">عريض</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <Label>حجم الخط: {settings.fontSize}px</Label>
          <Slider
            value={[settings.fontSize]}
            onValueChange={([value]) => updateSetting("fontSize", value)}
            min={16}
            max={72}
            step={1}
            className="w-full"
          />
        </div>

        {/* Text Alignment - إضافة محاذاة النص */}
        <div className="space-y-2">
          <Label>محاذاة النص</Label>
          <Select value={settings.textAlign} onValueChange={(value: any) => updateSetting("textAlign", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">يسار</SelectItem>
              <SelectItem value="center">وسط</SelectItem>
              <SelectItem value="right">يمين</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Line Height */}
        <div className="space-y-2">
          <Label>ارتفاع السطر: {settings.lineHeight}</Label>
          <Slider
            value={[settings.lineHeight]}
            onValueChange={([value]) => updateSetting("lineHeight", value)}
            min={1}
            max={2}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Letter Spacing */}
        <div className="space-y-2">
          <Label>تباعد الأحرف: {settings.letterSpacing}px</Label>
          <Slider
            value={[settings.letterSpacing]}
            onValueChange={([value]) => updateSetting("letterSpacing", value)}
            min={-2}
            max={10}
            step={0.5}
            className="w-full"
          />
        </div>

        {/* Colors */}
        <div className="space-y-2">
          <Label>لون النص</Label>
          <Input
            type="color"
            value={settings.textColor}
            onChange={(e) => updateSetting("textColor", e.target.value)}
            className="h-12"
          />
        </div>

        {/* Shadow Settings */}
        <div className="space-y-4">
          <Label>إعدادات الظل</Label>
          
          <div className="space-y-2">
            <Label>لون الظل</Label>
            <Input
              type="color"
              value={settings.shadowColor.includes("rgba") ? "#000000" : settings.shadowColor}
              onChange={(e) => updateSetting("shadowColor", e.target.value)}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label>ضبابية الظل: {settings.shadowBlur}px</Label>
            <Slider
              value={[settings.shadowBlur]}
              onValueChange={([value]) => updateSetting("shadowBlur", value)}
              min={0}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>إزاحة X: {settings.shadowOffsetX}px</Label>
              <Slider
                value={[settings.shadowOffsetX]}
                onValueChange={([value]) => updateSetting("shadowOffsetX", value)}
                min={-10}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>إزاحة Y: {settings.shadowOffsetY}px</Label>
              <Slider
                value={[settings.shadowOffsetY]}
                onValueChange={([value]) => updateSetting("shadowOffsetY", value)}
                min={-10}
                max={10}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <Button 
          variant="outline" 
          onClick={resetToDefaults}
          className="w-full"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          إعادة تعيين الإعدادات
        </Button>
      </CardContent>
    </Card>
  );
};
