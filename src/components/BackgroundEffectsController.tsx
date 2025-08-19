import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { RotateCcw, Image, Lightbulb, Droplets, Wind } from "lucide-react";

export interface BackgroundEffectsSettings {
  blurEnabled: boolean;
  blurAmount: number;
  blurType: 'gaussian' | 'motion' | 'radial';
  
  lightingEnabled: boolean;
  lightingType: 'ambient' | 'directional' | 'spot' | 'rim';
  lightIntensity: number;
  lightColor: string;
  lightAngle: number;
  lightDistance: number;
  
  atmosphericEnabled: boolean;
  fogDensity: number;
  fogColor: string;
  particleCount: number;
  particleType: 'dust' | 'bokeh' | 'sparkles' | 'rain';
  
  overlayEnabled: boolean;
  overlayTexture: 'noise' | 'grain' | 'paper' | 'fabric' | 'metal';
  overlayIntensity: number;
  overlayBlendMode: 'normal' | 'multiply' | 'overlay' | 'soft-light' | 'hard-light';
  
  vignetteEnabled: boolean;
  vignetteIntensity: number;
  vignetteSize: number;
  vignetteColor: string;
}

interface BackgroundEffectsControllerProps {
  settings: BackgroundEffectsSettings;
  onUpdate: (settings: BackgroundEffectsSettings) => void;
}

const defaultSettings: BackgroundEffectsSettings = {
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
};

export const BackgroundEffectsController = ({ settings, onUpdate }: BackgroundEffectsControllerProps) => {
  const updateSetting = <K extends keyof BackgroundEffectsSettings>(
    key: K,
    value: BackgroundEffectsSettings[K]
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
          <Image className="h-5 w-5" />
          تأثيرات الخلفية
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
        {/* تأثيرات الضبابية */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-primary" />
            <Label className="text-sm font-semibold">تأثيرات الضبابية</Label>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="blur-enabled" className="text-sm">
              تفعيل الضبابية
            </Label>
            <Switch
              id="blur-enabled"
              checked={settings.blurEnabled}
              onCheckedChange={(enabled) => updateSetting('blurEnabled', enabled)}
            />
          </div>

          {settings.blurEnabled && (
            <>
              <div className="space-y-2">
                <Label className="text-sm">نوع الضبابية</Label>
                <Select
                  value={settings.blurType}
                  onValueChange={(value: BackgroundEffectsSettings['blurType']) => updateSetting('blurType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gaussian">ضبابية عادية</SelectItem>
                    <SelectItem value="motion">ضبابية حركة</SelectItem>
                    <SelectItem value="radial">ضبابية شعاعية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm">
                  قوة الضبابية: {settings.blurAmount}px
                </Label>
                <Slider
                  value={[settings.blurAmount]}
                  onValueChange={([value]) => updateSetting('blurAmount', value)}
                  max={20}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
                <NumericInput
                  value={settings.blurAmount}
                  onChange={(value) => updateSetting('blurAmount', value)}
                  min={0}
                  max={20}
                  step={0.5}
                  className="mt-2"
                />
              </div>
            </>
          )}
        </div>

        {/* تأثيرات الإضاءة */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <Label className="text-sm font-semibold">تأثيرات الإضاءة</Label>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="lighting-enabled" className="text-sm">
              تفعيل الإضاءة
            </Label>
            <Switch
              id="lighting-enabled"
              checked={settings.lightingEnabled}
              onCheckedChange={(enabled) => updateSetting('lightingEnabled', enabled)}
            />
          </div>

          {settings.lightingEnabled && (
            <>
              <div className="space-y-2">
                <Label className="text-sm">نوع الإضاءة</Label>
                <Select
                  value={settings.lightingType}
                  onValueChange={(value: BackgroundEffectsSettings['lightingType']) => updateSetting('lightingType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ambient">إضاءة محيطة</SelectItem>
                    <SelectItem value="directional">إضاءة موجهة</SelectItem>
                    <SelectItem value="spot">إضاءة بقعة</SelectItem>
                    <SelectItem value="rim">إضاءة حافة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                  <Label className="text-sm">
                    شدة الإضاءة: {settings.lightIntensity}%
                  </Label>
                  <Slider
                    value={[settings.lightIntensity]}
                    onValueChange={([value]) => updateSetting('lightIntensity', value)}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <NumericInput
                    value={settings.lightIntensity}
                    onChange={(value) => updateSetting('lightIntensity', value)}
                    min={0}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">لون الإضاءة</Label>
                  <Input
                    type="color"
                    value={settings.lightColor}
                    onChange={(e) => updateSetting('lightColor', e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              {(settings.lightingType === 'directional' || settings.lightingType === 'spot') && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm">
                      زاوية الإضاءة: {settings.lightAngle}°
                    </Label>
                    <Slider
                      value={[settings.lightAngle]}
                      onValueChange={([value]) => updateSetting('lightAngle', value)}
                      max={360}
                      min={0}
                      step={15}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">
                      مسافة الإضاءة: {settings.lightDistance}%
                    </Label>
                    <Slider
                      value={[settings.lightDistance]}
                      onValueChange={([value]) => updateSetting('lightDistance', value)}
                      max={200}
                      min={50}
                      step={10}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* التأثيرات الجوية */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-primary" />
            <Label className="text-sm font-semibold">التأثيرات الجوية</Label>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="atmospheric-enabled" className="text-sm">
              تفعيل التأثيرات الجوية
            </Label>
            <Switch
              id="atmospheric-enabled"
              checked={settings.atmosphericEnabled}
              onCheckedChange={(enabled) => updateSetting('atmosphericEnabled', enabled)}
            />
          </div>

          {settings.atmosphericEnabled && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm">
                    كثافة الضباب: {settings.fogDensity}%
                  </Label>
                  <Slider
                    value={[settings.fogDensity]}
                    onValueChange={([value]) => updateSetting('fogDensity', value)}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">لون الضباب</Label>
                  <Input
                    type="color"
                    value={settings.fogColor}
                    onChange={(e) => updateSetting('fogColor', e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">نوع الجسيمات</Label>
                <Select
                  value={settings.particleType}
                  onValueChange={(value: BackgroundEffectsSettings['particleType']) => updateSetting('particleType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dust">غبار</SelectItem>
                    <SelectItem value="bokeh">بوكيه</SelectItem>
                    <SelectItem value="sparkles">بريق</SelectItem>
                    <SelectItem value="rain">مطر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">
                  عدد الجسيمات: {settings.particleCount}
                </Label>
                <Slider
                  value={[settings.particleCount]}
                  onValueChange={([value]) => updateSetting('particleCount', value)}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>

        {/* طبقة التراكب */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="overlay-enabled" className="text-sm">
              طبقة التراكب
            </Label>
            <Switch
              id="overlay-enabled"
              checked={settings.overlayEnabled}
              onCheckedChange={(enabled) => updateSetting('overlayEnabled', enabled)}
            />
          </div>

          {settings.overlayEnabled && (
            <>
              <div className="space-y-2">
                <Label className="text-sm">نسيج التراكب</Label>
                <Select
                  value={settings.overlayTexture}
                  onValueChange={(value: BackgroundEffectsSettings['overlayTexture']) => updateSetting('overlayTexture', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="noise">ضوضاء</SelectItem>
                    <SelectItem value="grain">حبيبات</SelectItem>
                    <SelectItem value="paper">ورق</SelectItem>
                    <SelectItem value="fabric">نسيج</SelectItem>
                    <SelectItem value="metal">معدن</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <Label className="text-sm">
                  شدة التراكب: {settings.overlayIntensity}%
                </Label>
                <Slider
                  value={[settings.overlayIntensity]}
                  onValueChange={([value]) => updateSetting('overlayIntensity', value)}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <NumericInput
                  value={settings.overlayIntensity}
                  onChange={(value) => updateSetting('overlayIntensity', value)}
                  min={0}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">نمط المزج</Label>
                  <Select
                    value={settings.overlayBlendMode}
                    onValueChange={(value: BackgroundEffectsSettings['overlayBlendMode']) => updateSetting('overlayBlendMode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">عادي</SelectItem>
                      <SelectItem value="multiply">ضرب</SelectItem>
                      <SelectItem value="overlay">تراكب</SelectItem>
                      <SelectItem value="soft-light">إضاءة ناعمة</SelectItem>
                      <SelectItem value="hard-light">إضاءة قوية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </div>

        {/* تأثير التداخل (Vignette) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="vignette-enabled" className="text-sm">
              تأثير التداخل (Vignette)
            </Label>
            <Switch
              id="vignette-enabled"
              checked={settings.vignetteEnabled}
              onCheckedChange={(enabled) => updateSetting('vignetteEnabled', enabled)}
            />
          </div>

          {settings.vignetteEnabled && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">
                  الشدة: {settings.vignetteIntensity}%
                </Label>
                <Slider
                  value={[settings.vignetteIntensity]}
                  onValueChange={([value]) => updateSetting('vignetteIntensity', value)}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">
                  الحجم: {settings.vignetteSize}%
                </Label>
                <Slider
                  value={[settings.vignetteSize]}
                  onValueChange={([value]) => updateSetting('vignetteSize', value)}
                  max={100}
                  min={30}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">اللون</Label>
                <Input
                  type="color"
                  value={settings.vignetteColor}
                  onChange={(e) => updateSetting('vignetteColor', e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};