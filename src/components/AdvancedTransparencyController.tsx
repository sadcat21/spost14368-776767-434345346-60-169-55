import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RotateCcw, Layers, Zap, RefreshCw } from "lucide-react";

export interface AdvancedTransparencySettings {
  enabled: boolean;
  borderType: 'sharp' | 'soft' | 'gradient' | 'jagged' | 'smooth' | 'feathered' | 'hard-edge' | 'beveled' | 'chamfered';
  borderWidth: number;
  featherRadius: number;
  gradientStops: number;
  edgeHardness: number;
  antiAliasing: boolean;
  blendMode: 'normal' | 'multiply' | 'overlay' | 'screen' | 'difference' | 'exclusion';
  opacity: number;
  innerGlow: boolean;
  innerGlowColor: string;
  innerGlowSize: number;
  outerGlow: boolean;
  outerGlowColor: string;
  outerGlowSize: number;
  bevelEnabled: boolean;
  bevelDepth: number;
  bevelSize: number;
  bevelAngle: number;
  shadowEnabled: boolean;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  shadowSpread: number;
}

interface AdvancedTransparencyControllerProps {
  settings: AdvancedTransparencySettings;
  onUpdate: (settings: AdvancedTransparencySettings) => void;
}

const defaultSettings: AdvancedTransparencySettings = {
  enabled: false,
  borderType: 'soft',
  borderWidth: 2,
  featherRadius: 10,
  gradientStops: 3,
  edgeHardness: 50,
  antiAliasing: true,
  blendMode: 'normal',
  opacity: 100,
  innerGlow: false,
  innerGlowColor: '#ffffff',
  innerGlowSize: 5,
  outerGlow: false,
  outerGlowColor: '#000000',
  outerGlowSize: 10,
  bevelEnabled: false,
  bevelDepth: 3,
  bevelSize: 5,
  bevelAngle: 45,
  shadowEnabled: false,
  shadowColor: '#000000',
  shadowOffsetX: 2,
  shadowOffsetY: 2,
  shadowBlur: 4,
  shadowSpread: 0
};

export const AdvancedTransparencyController = ({ settings, onUpdate }: AdvancedTransparencyControllerProps) => {
  const updateSetting = <K extends keyof AdvancedTransparencySettings>(
    key: K,
    value: AdvancedTransparencySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    onUpdate(newSettings);
  };

  const resetToDefaults = () => {
    onUpdate(defaultSettings);
  };

  return (
    <Card className="shadow-elegant border-2 border-blue-200 bg-blue-50/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-primary flex items-center gap-2">
          <Layers className="h-5 w-5" />
          التحكم المتقدم في حدود الشفافية
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
        {/* تفعيل التحكم المتقدم */}
        <div className="flex items-center justify-between">
          <Label htmlFor="transparency-enabled" className="text-sm font-medium">
            تفعيل التحكم المتقدم في الحدود
          </Label>
          <Switch
            id="transparency-enabled"
            checked={settings.enabled}
            onCheckedChange={(enabled) => updateSetting('enabled', enabled)}
          />
        </div>

        {settings.enabled && (
          <>
            {/* نوع الحدود */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">نوع الحدود والحواف</Label>
              <Select
                value={settings.borderType}
                onValueChange={(value: AdvancedTransparencySettings['borderType']) => updateSetting('borderType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sharp">حادة (Sharp)</SelectItem>
                  <SelectItem value="soft">ناعمة (Soft)</SelectItem>
                  <SelectItem value="gradient">متدرجة (Gradient)</SelectItem>
                  <SelectItem value="jagged">متداخلة (Jagged)</SelectItem>
                  <SelectItem value="smooth">ملساء (Smooth)</SelectItem>
                  <SelectItem value="feathered">منتشرة (Feathered)</SelectItem>
                  <SelectItem value="hard-edge">حافة صلبة (Hard Edge)</SelectItem>
                  <SelectItem value="beveled">مشطوفة (Beveled)</SelectItem>
                  <SelectItem value="chamfered">مقطوعة (Chamfered)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* عرض الحدود */}
            <div className="space-y-2">
              <Label className="text-sm">
                عرض الحدود: {settings.borderWidth}px
              </Label>
              <Slider
                value={[settings.borderWidth]}
                onValueChange={([value]) => updateSetting('borderWidth', value)}
                max={50}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            {/* قوة الحواف */}
            <div className="space-y-2">
              <Label className="text-sm">
                قوة الحواف: {settings.edgeHardness}%
              </Label>
              <Slider
                value={[settings.edgeHardness]}
                onValueChange={([value]) => updateSetting('edgeHardness', value)}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>

            {/* نصف قطر الانتشار */}
            {(settings.borderType === 'soft' || settings.borderType === 'feathered') && (
              <div className="space-y-2">
                <Label className="text-sm">
                  نصف قطر الانتشار: {settings.featherRadius}px
                </Label>
                <Slider
                  value={[settings.featherRadius]}
                  onValueChange={([value]) => updateSetting('featherRadius', value)}
                  max={50}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            )}

            {/* عدد نقاط التدرج */}
            {settings.borderType === 'gradient' && (
              <div className="space-y-2">
                <Label className="text-sm">
                  عدد نقاط التدرج: {settings.gradientStops}
                </Label>
                <Slider
                  value={[settings.gradientStops]}
                  onValueChange={([value]) => updateSetting('gradientStops', value)}
                  max={10}
                  min={2}
                  step={1}
                  className="w-full"
                />
              </div>
            )}

            {/* مضاد التشويش */}
            <div className="flex items-center justify-between">
              <Label htmlFor="antialiasing" className="text-sm">
                مضاد التشويش (Anti-aliasing)
              </Label>
              <Switch
                id="antialiasing"
                checked={settings.antiAliasing}
                onCheckedChange={(checked) => updateSetting('antiAliasing', checked)}
              />
            </div>

            {/* نمط المزج */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">نمط مزج الحدود</Label>
              <Select
                value={settings.blendMode}
                onValueChange={(value: AdvancedTransparencySettings['blendMode']) => updateSetting('blendMode', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">عادي</SelectItem>
                  <SelectItem value="multiply">ضرب</SelectItem>
                  <SelectItem value="overlay">تراكب</SelectItem>
                  <SelectItem value="screen">شاشة</SelectItem>
                  <SelectItem value="difference">فرق</SelectItem>
                  <SelectItem value="exclusion">استبعاد</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* الشفافية العامة */}
            <div className="space-y-2">
              <Label className="text-sm">
                الشفافية العامة: {settings.opacity}%
              </Label>
              <Slider
                value={[settings.opacity]}
                onValueChange={([value]) => updateSetting('opacity', value)}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>

            {/* التوهج الداخلي */}
            <div className="space-y-4 p-4 border border-green-200 rounded-lg bg-green-50/30">
              <div className="flex items-center justify-between">
                <Label htmlFor="inner-glow" className="text-sm font-medium">
                  التوهج الداخلي
                </Label>
                <Switch
                  id="inner-glow"
                  checked={settings.innerGlow}
                  onCheckedChange={(checked) => updateSetting('innerGlow', checked)}
                />
              </div>
              
              {settings.innerGlow && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">لون التوهج الداخلي</Label>
                      <input
                        type="color"
                        value={settings.innerGlowColor}
                        onChange={(e) => updateSetting('innerGlowColor', e.target.value)}
                        className="w-full h-8 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">حجم التوهج: {settings.innerGlowSize}px</Label>
                      <Slider
                        value={[settings.innerGlowSize]}
                        onValueChange={([value]) => updateSetting('innerGlowSize', value)}
                        max={20}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* التوهج الخارجي */}
            <div className="space-y-4 p-4 border border-purple-200 rounded-lg bg-purple-50/30">
              <div className="flex items-center justify-between">
                <Label htmlFor="outer-glow" className="text-sm font-medium">
                  التوهج الخارجي
                </Label>
                <Switch
                  id="outer-glow"
                  checked={settings.outerGlow}
                  onCheckedChange={(checked) => updateSetting('outerGlow', checked)}
                />
              </div>
              
              {settings.outerGlow && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">لون التوهج الخارجي</Label>
                      <input
                        type="color"
                        value={settings.outerGlowColor}
                        onChange={(e) => updateSetting('outerGlowColor', e.target.value)}
                        className="w-full h-8 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">حجم التوهج: {settings.outerGlowSize}px</Label>
                      <Slider
                        value={[settings.outerGlowSize]}
                        onValueChange={([value]) => updateSetting('outerGlowSize', value)}
                        max={30}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* التأثير المجسم */}
            <div className="space-y-4 p-4 border border-orange-200 rounded-lg bg-orange-50/30">
              <div className="flex items-center justify-between">
                <Label htmlFor="bevel-enabled" className="text-sm font-medium">
                  تأثير التجسيم (Bevel)
                </Label>
                <Switch
                  id="bevel-enabled"
                  checked={settings.bevelEnabled}
                  onCheckedChange={(checked) => updateSetting('bevelEnabled', checked)}
                />
              </div>
              
              {settings.bevelEnabled && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">العمق: {settings.bevelDepth}</Label>
                      <Slider
                        value={[settings.bevelDepth]}
                        onValueChange={([value]) => updateSetting('bevelDepth', value)}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">الحجم: {settings.bevelSize}px</Label>
                      <Slider
                        value={[settings.bevelSize]}
                        onValueChange={([value]) => updateSetting('bevelSize', value)}
                        max={20}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">الزاوية: {settings.bevelAngle}°</Label>
                      <Slider
                        value={[settings.bevelAngle]}
                        onValueChange={([value]) => updateSetting('bevelAngle', value)}
                        max={180}
                        min={0}
                        step={15}
                        className="w-full"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* الظل */}
            <div className="space-y-4 p-4 border border-gray-300 rounded-lg bg-gray-50/30">
              <div className="flex items-center justify-between">
                <Label htmlFor="shadow-enabled" className="text-sm font-medium">
                  ظل الحدود
                </Label>
                <Switch
                  id="shadow-enabled"
                  checked={settings.shadowEnabled}
                  onCheckedChange={(checked) => updateSetting('shadowEnabled', checked)}
                />
              </div>
              
              {settings.shadowEnabled && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs">لون الظل</Label>
                    <input
                      type="color"
                      value={settings.shadowColor}
                      onChange={(e) => updateSetting('shadowColor', e.target.value)}
                      className="w-full h-8 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">إزاحة X: {settings.shadowOffsetX}px</Label>
                      <Slider
                        value={[settings.shadowOffsetX]}
                        onValueChange={([value]) => updateSetting('shadowOffsetX', value)}
                        max={20}
                        min={-20}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">إزاحة Y: {settings.shadowOffsetY}px</Label>
                      <Slider
                        value={[settings.shadowOffsetY]}
                        onValueChange={([value]) => updateSetting('shadowOffsetY', value)}
                        max={20}
                        min={-20}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">ضبابية الظل: {settings.shadowBlur}px</Label>
                      <Slider
                        value={[settings.shadowBlur]}
                        onValueChange={([value]) => updateSetting('shadowBlur', value)}
                        max={30}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">انتشار الظل: {settings.shadowSpread}px</Label>
                      <Slider
                        value={[settings.shadowSpread]}
                        onValueChange={([value]) => updateSetting('shadowSpread', value)}
                        max={10}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* معاينة سريعة */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-800 mb-2">
                <Zap className="inline h-4 w-4 mr-1" />
                معاينة التأثيرات المطبقة
              </div>
              <div className="text-xs text-blue-600 space-y-1">
                <p>• نوع الحدود: {settings.borderType}</p>
                <p>• عرض الحدود: {settings.borderWidth}px</p>
                <p>• قوة الحواف: {settings.edgeHardness}%</p>
                {settings.innerGlow && <p>• التوهج الداخلي مفعل</p>}
                {settings.outerGlow && <p>• التوهج الخارجي مفعل</p>}
                {settings.bevelEnabled && <p>• التجسيم مفعل</p>}
                {settings.shadowEnabled && <p>• الظل مفعل</p>}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};