import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RotateCcw, RefreshCw } from "lucide-react";

export interface ShapeInversionSettings {
  enabled: boolean;
  mode: 'normal' | 'inverted';
  maskOpacity: number;
  textPlacement: 'inside' | 'outside' | 'top' | 'bottom' | 'left' | 'right';
  maskBlur: number;
  backgroundBlending: 'normal' | 'multiply' | 'overlay' | 'screen';
}

interface ShapeInversionControllerProps {
  settings: ShapeInversionSettings;
  onUpdate: (settings: ShapeInversionSettings) => void;
}

const defaultSettings: ShapeInversionSettings = {
  enabled: false,
  mode: 'normal',
  maskOpacity: 80,
  textPlacement: 'inside',
  maskBlur: 0,
  backgroundBlending: 'normal'
};

export const ShapeInversionController = ({ settings, onUpdate }: ShapeInversionControllerProps) => {
  const updateSetting = <K extends keyof ShapeInversionSettings>(
    key: K,
    value: ShapeInversionSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    onUpdate(newSettings);
  };

  const resetToDefaults = () => {
    onUpdate(defaultSettings);
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-primary flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          انعكاس الشكل
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
        {/* تفعيل الانعكاس */}
        <div className="flex items-center justify-between">
          <Label htmlFor="inversion-enabled" className="text-sm">
            تفعيل انعكاس الشكل
          </Label>
          <Switch
            id="inversion-enabled"
            checked={settings.enabled}
            onCheckedChange={(enabled) => updateSetting('enabled', enabled)}
          />
        </div>

        {settings.enabled && (
          <>
            {/* نمط الانعكاس */}
            <div className="space-y-2">
              <Label className="text-sm">نمط الانعكاس</Label>
              <Select
                value={settings.mode}
                onValueChange={(value: 'normal' | 'inverted') => updateSetting('mode', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">عادي (النص داخل الشكل)</SelectItem>
                  <SelectItem value="inverted">معكوس (الشكل كقناع)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* موضع النص */}
            <div className="space-y-2">
              <Label className="text-sm">موضع النص</Label>
              <Select
                value={settings.textPlacement}
                onValueChange={(value: ShapeInversionSettings['textPlacement']) => updateSetting('textPlacement', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inside">داخل الشكل</SelectItem>
                  <SelectItem value="outside">خارج الشكل</SelectItem>
                  <SelectItem value="top">أعلى الشكل</SelectItem>
                  <SelectItem value="bottom">أسفل الشكل</SelectItem>
                  <SelectItem value="left">يسار الشكل</SelectItem>
                  <SelectItem value="right">يمين الشكل</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* شفافية القناع */}
            <div className="space-y-2">
              <Label className="text-sm">
                شفافية القناع: {settings.maskOpacity}%
              </Label>
              <Slider
                value={[settings.maskOpacity]}
                onValueChange={([value]) => updateSetting('maskOpacity', value)}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>

            {/* ضبابية القناع */}
            <div className="space-y-2">
              <Label className="text-sm">
                ضبابية القناع: {settings.maskBlur}px
              </Label>
              <Slider
                value={[settings.maskBlur]}
                onValueChange={([value]) => updateSetting('maskBlur', value)}
                max={20}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            {/* مزج الخلفية */}
            <div className="space-y-2">
              <Label className="text-sm">نمط مزج الخلفية</Label>
              <Select
                value={settings.backgroundBlending}
                onValueChange={(value: ShapeInversionSettings['backgroundBlending']) => updateSetting('backgroundBlending', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">عادي</SelectItem>
                  <SelectItem value="multiply">ضرب</SelectItem>
                  <SelectItem value="overlay">تراكب</SelectItem>
                  <SelectItem value="screen">شاشة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};