import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  RotateCcw, 
  Type, 
  Eye, 
  Contrast,
  Droplets,
  Frame,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from "lucide-react";

export interface EnhancedTextSettings {
  // الإعدادات الأساسية
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  
  // الألوان والتأثيرات
  textColor: string;
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  
  // ظلال متعددة
  multiShadowEnabled: boolean;
  shadowLayers: Array<{
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
    spread: number;
  }>;
  
  // التباين العالي
  highContrastEnabled: boolean;
  contrastBackground: string;
  contrastBorderWidth: number;
  contrastBorderColor: string;
  
  // الخلفية النصية
  textBackgroundEnabled: boolean;
  textBackgroundColor: string;
  textBackgroundOpacity: number;
  textBackgroundPadding: number;
  textBackgroundRadius: number;
  textBackgroundGradient: boolean;
  textBackgroundGradientStart: string;
  textBackgroundGradientEnd: string;
  
  // التحديد (Outline)
  outlineEnabled: boolean;
  outlineColor: string;
  outlineWidth: number;
  outlineStyle: 'solid' | 'dashed' | 'dotted';
  outlineGradient: boolean;
  outlineGradientStart: string;
  outlineGradientEnd: string;
  
  // التموضع المتقدم
  textPosition: 'inside' | 'outside' | 'top' | 'bottom' | 'left' | 'right' | 'center';
  textRotation: number;
  textSkew: number;
  textScale: number;
  textPerspective: number;
  
  // التأثيرات الإضافية
  glowEnabled: boolean;
  glowColor: string;
  glowIntensity: number;
  innerGlowEnabled: boolean;
  innerGlowColor: string;
  innerGlowIntensity: number;
  
  gradientTextEnabled: boolean;
  gradientTextStart: string;
  gradientTextEnd: string;
  gradientTextDirection: number;
  gradientTextStops: number;
  
  // تأثيرات النص الثلاثية الأبعاد
  text3DEnabled: boolean;
  text3DDepth: number;
  text3DColor: string;
  text3DAngle: number;
  
  // تأثيرات الانعكاس
  reflectionEnabled: boolean;
  reflectionOpacity: number;
  reflectionBlur: number;
  reflectionDistance: number;
  
  // تأثيرات الحركة
  animationEnabled: boolean;
  animationType: 'none' | 'fade' | 'slide' | 'bounce' | 'zoom' | 'rotate' | 'pulse' | 'wave';
  animationDuration: number;
  animationDelay: number;
  
  // الشفافية والمزج
  textOpacity: number;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light' | 'color-dodge' | 'color-burn';
  
  // تحسينات الخط
  fontSmoothing: boolean;
  fontOpticalSizing: boolean;
  fontVariationSettings: string;
}

interface EnhancedTextControllerProps {
  settings: EnhancedTextSettings;
  onUpdate: (settings: EnhancedTextSettings) => void;
  language?: string;
}

const defaultSettings: EnhancedTextSettings = {
  fontSize: 24,
  fontWeight: '700',
  fontFamily: 'Cairo',
  textAlign: 'center',
  lineHeight: 1.4,
  letterSpacing: 0,
  wordSpacing: 0,
  
  textColor: '#ffffff',
  shadowEnabled: true,
  shadowColor: 'rgba(0, 0, 0, 0.7)',
  shadowBlur: 4,
  shadowOffsetX: 2,
  shadowOffsetY: 2,
  
  multiShadowEnabled: false,
  shadowLayers: [
    { color: 'rgba(0, 0, 0, 0.7)', blur: 4, offsetX: 2, offsetY: 2, spread: 0 },
    { color: 'rgba(255, 255, 255, 0.3)', blur: 8, offsetX: -1, offsetY: -1, spread: 1 }
  ],
  
  highContrastEnabled: false,
  contrastBackground: 'rgba(0, 0, 0, 0.8)',
  contrastBorderWidth: 2,
  contrastBorderColor: '#ffffff',
  
  textBackgroundEnabled: false,
  textBackgroundColor: 'rgba(0, 0, 0, 0.5)',
  textBackgroundOpacity: 50,
  textBackgroundPadding: 15,
  textBackgroundRadius: 8,
  textBackgroundGradient: false,
  textBackgroundGradientStart: '#000000',
  textBackgroundGradientEnd: '#333333',
  
  outlineEnabled: false,
  outlineColor: '#000000',
  outlineWidth: 1,
  outlineStyle: 'solid',
  outlineGradient: false,
  outlineGradientStart: '#000000',
  outlineGradientEnd: '#666666',
  
  textPosition: 'center',
  textRotation: 0,
  textSkew: 0,
  textScale: 100,
  textPerspective: 0,
  
  glowEnabled: false,
  glowColor: '#ffffff',
  glowIntensity: 20,
  innerGlowEnabled: false,
  innerGlowColor: '#ffffff',
  innerGlowIntensity: 10,
  
  gradientTextEnabled: false,
  gradientTextStart: '#667eea',
  gradientTextEnd: '#764ba2',
  gradientTextDirection: 45,
  gradientTextStops: 2,
  
  text3DEnabled: false,
  text3DDepth: 5,
  text3DColor: '#333333',
  text3DAngle: 45,
  
  reflectionEnabled: false,
  reflectionOpacity: 50,
  reflectionBlur: 2,
  reflectionDistance: 0,
  
  animationEnabled: false,
  animationType: 'none',
  animationDuration: 1000,
  animationDelay: 0,
  
  textOpacity: 100,
  blendMode: 'normal',
  
  fontSmoothing: true,
  fontOpticalSizing: false,
  fontVariationSettings: ''
};

const fontFamilies = [
  { value: 'Cairo', label: 'Cairo (عربي)' },
  { value: 'Amiri', label: 'Amiri (عربي كلاسيكي)' },
  { value: 'Noto Sans Arabic', label: 'Noto Sans Arabic' },
  { value: 'Tajawal', label: 'Tajawal (عربي حديث)' },
  { value: 'Almarai', label: 'Almarai (عربي أنيق)' },
  { value: 'Inter', label: 'Inter (إنجليزي)' },
  { value: 'Roboto', label: 'Roboto (إنجليزي)' },
  { value: 'Poppins', label: 'Poppins (إنجليزي)' },
  { value: 'Montserrat', label: 'Montserrat (إنجليزي)' }
];

const fontWeights = [
  { value: '100', label: 'رفيع جداً (100)' },
  { value: '200', label: 'رفيع (200)' },
  { value: '300', label: 'خفيف (300)' },
  { value: '400', label: 'عادي (400)' },
  { value: '500', label: 'متوسط (500)' },
  { value: '600', label: 'متوسط ثقيل (600)' },
  { value: '700', label: 'عريض (700)' },
  { value: '800', label: 'عريض جداً (800)' },
  { value: '900', label: 'أعرض (900)' }
];

const textPositions = [
  { value: 'center', label: 'وسط الصورة' },
  { value: 'inside', label: 'داخل الشكل' },
  { value: 'outside', label: 'خارج الشكل' },
  { value: 'top', label: 'أعلى الشكل' },
  { value: 'bottom', label: 'أسفل الشكل' },
  { value: 'left', label: 'يسار الشكل' },
  { value: 'right', label: 'يمين الشكل' }
];

const blendModes = [
  { value: 'normal', label: 'عادي' },
  { value: 'multiply', label: 'ضرب' },
  { value: 'screen', label: 'شاشة' },
  { value: 'overlay', label: 'تراكب' },
  { value: 'soft-light', label: 'إضاءة ناعمة' },
  { value: 'hard-light', label: 'إضاءة قوية' }
];

export const EnhancedTextController = ({ settings, onUpdate, language = 'ar' }: EnhancedTextControllerProps) => {
  const isRTL = language === 'ar' || language.includes('ar');

  const updateSetting = <K extends keyof EnhancedTextSettings>(
    key: K,
    value: EnhancedTextSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    onUpdate(newSettings);
  };

  const resetToDefaults = () => {
    onUpdate(defaultSettings);
  };

  const getAlignmentIcon = (alignment: string) => {
    switch (alignment) {
      case 'left': return AlignLeft;
      case 'center': return AlignCenter;
      case 'right': return AlignRight;
      case 'justify': return AlignJustify;
      default: return AlignCenter;
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-primary flex items-center gap-2">
          <Type className="h-5 w-5" />
          تخصيص النص المتقدم
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
        {/* الإعدادات الأساسية */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">الإعدادات الأساسية</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">نوع الخط</Label>
              <Select
                value={settings.fontFamily}
                onValueChange={(value) => updateSetting('fontFamily', value)}
              >
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
              <Label className="text-sm">وزن الخط</Label>
              <Select
                value={settings.fontWeight}
                onValueChange={(value) => updateSetting('fontWeight', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontWeights.map((weight) => (
                    <SelectItem key={weight.value} value={weight.value}>
                      {weight.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label className="text-sm">حجم الخط: {settings.fontSize}px</Label>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([value]) => updateSetting('fontSize', value)}
                max={72}
                min={10}
                step={1}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">ارتفاع السطر: {settings.lineHeight}</Label>
              <Slider
                value={[settings.lineHeight]}
                onValueChange={([value]) => updateSetting('lineHeight', value)}
                max={3}
                min={0.8}
                step={0.1}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">المسافة بين الحروف: {settings.letterSpacing}px</Label>
              <Slider
                value={[settings.letterSpacing]}
                onValueChange={([value]) => updateSetting('letterSpacing', value)}
                max={10}
                min={-2}
                step={0.5}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">لون النص</Label>
              <Input
                type="color"
                value={settings.textColor}
                onChange={(e) => updateSetting('textColor', e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {/* محاذاة النص */}
          <div className="space-y-2">
            <Label className="text-sm">محاذاة النص</Label>
            <div className="flex gap-2">
              {['left', 'center', 'right', 'justify'].map((align) => {
                const IconComponent = getAlignmentIcon(align);
                return (
                  <Button
                    key={align}
                    variant={settings.textAlign === align ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetting('textAlign', align as any)}
                  >
                    <IconComponent className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        <Separator />

        {/* تموضع النص */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">تموضع النص</Label>
          
          <div className="space-y-2">
            <Label className="text-sm">موضع النص</Label>
            <Select
              value={settings.textPosition}
              onValueChange={(value: EnhancedTextSettings['textPosition']) => updateSetting('textPosition', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {textPositions.map((position) => (
                  <SelectItem key={position.value} value={position.value}>
                    {position.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm">دوران النص: {settings.textRotation}°</Label>
              <Slider
                value={[settings.textRotation]}
                onValueChange={([value]) => updateSetting('textRotation', value)}
                max={360}
                min={-360}
                step={15}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">إمالة النص: {settings.textSkew}°</Label>
              <Slider
                value={[settings.textSkew]}
                onValueChange={([value]) => updateSetting('textSkew', value)}
                max={30}
                min={-30}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* التأثيرات البصرية */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Eye className="h-4 w-4" />
            التأثيرات البصرية
          </Label>
          
          {/* الظل */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="shadow-enabled" className="text-sm flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                ظل النص
              </Label>
              <Switch
                id="shadow-enabled"
                checked={settings.shadowEnabled}
                onCheckedChange={(enabled) => updateSetting('shadowEnabled', enabled)}
              />
            </div>

            {settings.shadowEnabled && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ml-6">
                <div className="space-y-2">
                  <Label className="text-sm">لون الظل</Label>
                  <Input
                    type="color"
                    value={settings.shadowColor.replace(/rgba?\([^)]+\)/, '#000000')}
                    onChange={(e) => updateSetting('shadowColor', e.target.value)}
                    className="h-8"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">ضبابية: {settings.shadowBlur}px</Label>
                  <Slider
                    value={[settings.shadowBlur]}
                    onValueChange={([value]) => updateSetting('shadowBlur', value)}
                    max={20}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">إزاحة X: {settings.shadowOffsetX}px</Label>
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
                  <Label className="text-sm">إزاحة Y: {settings.shadowOffsetY}px</Label>
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
            )}
          </div>

          {/* التحديد */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="outline-enabled" className="text-sm">
                تحديد النص
              </Label>
              <Switch
                id="outline-enabled"
                checked={settings.outlineEnabled}
                onCheckedChange={(enabled) => updateSetting('outlineEnabled', enabled)}
              />
            </div>

            {settings.outlineEnabled && (
              <div className="grid grid-cols-3 gap-3 ml-6">
                <div className="space-y-2">
                  <Label className="text-sm">لون التحديد</Label>
                  <Input
                    type="color"
                    value={settings.outlineColor}
                    onChange={(e) => updateSetting('outlineColor', e.target.value)}
                    className="h-8"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">عرض التحديد: {settings.outlineWidth}px</Label>
                  <Slider
                    value={[settings.outlineWidth]}
                    onValueChange={([value]) => updateSetting('outlineWidth', value)}
                    max={5}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">نمط التحديد</Label>
                  <Select
                    value={settings.outlineStyle}
                    onValueChange={(value: EnhancedTextSettings['outlineStyle']) => updateSetting('outlineStyle', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">متصل</SelectItem>
                      <SelectItem value="dashed">متقطع</SelectItem>
                      <SelectItem value="dotted">نقاط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* التوهج */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="glow-enabled" className="text-sm">
                توهج النص
              </Label>
              <Switch
                id="glow-enabled"
                checked={settings.glowEnabled}
                onCheckedChange={(enabled) => updateSetting('glowEnabled', enabled)}
              />
            </div>

            {settings.glowEnabled && (
              <div className="grid grid-cols-2 gap-3 ml-6">
                <div className="space-y-2">
                  <Label className="text-sm">لون التوهج</Label>
                  <Input
                    type="color"
                    value={settings.glowColor}
                    onChange={(e) => updateSetting('glowColor', e.target.value)}
                    className="h-8"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">شدة التوهج: {settings.glowIntensity}%</Label>
                  <Slider
                    value={[settings.glowIntensity]}
                    onValueChange={([value]) => updateSetting('glowIntensity', value)}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* التباين العالي */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast-enabled" className="text-sm flex items-center gap-2">
              <Contrast className="h-4 w-4" />
              تباين عالي
            </Label>
            <Switch
              id="high-contrast-enabled"
              checked={settings.highContrastEnabled}
              onCheckedChange={(enabled) => updateSetting('highContrastEnabled', enabled)}
            />
          </div>

          {settings.highContrastEnabled && (
            <div className="grid grid-cols-3 gap-3 ml-6">
              <div className="space-y-2">
                <Label className="text-sm">خلفية التباين</Label>
                <Input
                  type="color"
                  value={settings.contrastBackground.replace(/rgba?\([^)]+\)/, '#000000')}
                  onChange={(e) => updateSetting('contrastBackground', e.target.value)}
                  className="h-8"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">لون الحدود</Label>
                <Input
                  type="color"
                  value={settings.contrastBorderColor}
                  onChange={(e) => updateSetting('contrastBorderColor', e.target.value)}
                  className="h-8"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">عرض الحدود: {settings.contrastBorderWidth}px</Label>
                <Slider
                  value={[settings.contrastBorderWidth]}
                  onValueChange={([value]) => updateSetting('contrastBorderWidth', value)}
                  max={5}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* إعدادات إضافية */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">إعدادات إضافية</Label>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm">شفافية النص: {settings.textOpacity}%</Label>
              <Slider
                value={[settings.textOpacity]}
                onValueChange={([value]) => updateSetting('textOpacity', value)}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">نمط المزج</Label>
              <Select
                value={settings.blendMode}
                onValueChange={(value: EnhancedTextSettings['blendMode']) => updateSetting('blendMode', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {blendModes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};