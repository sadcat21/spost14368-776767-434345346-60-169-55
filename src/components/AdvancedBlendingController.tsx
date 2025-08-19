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
  Blend, 
  Settings,
  Waves,
  Triangle,
  Zap,
  Circle,
  Flower
} from "lucide-react";

export interface AdvancedBlendingSettings {
  // نوع التداخل الأساسي
  blendType: 'smooth' | 'sharp' | 'wavy' | 'zigzag' | 'curved' | 'organic' | 'spiral' | 'diamond' | 'hexagon' | 'bubble' | 'lightning' | 'fabric';
  
  // إعدادات التداخل الناعم
  transitionWidth: number;
  blendIntensity: number;
  smoothingRadius: number;
  gradientStops: number;
  
  // إعدادات الخط المتموج
  waveFrequency: number;
  waveAmplitude: number;
  waveOffset: number;
  waveType: 'sine' | 'cosine' | 'triangle' | 'sawtooth';
  waveDirection: 'horizontal' | 'vertical' | 'diagonal';
  
  // إعدادات الخط المتعرج
  zigzagSegments: number;
  zigzagHeight: number;
  zigzagPattern: 'sharp' | 'rounded' | 'beveled';
  zigzagRandomness: number;
  
  // إعدادات الخط المنحني
  curveRadius: number;
  curveDirection: 'inward' | 'outward' | 'mixed';
  curveSmoothing: number;
  curveAsymmetry: number;
  
  // الشكل العضوي
  organicComplexity: number;
  organicVariation: number;
  organicSeed: number;
  organicFlowDirection: 'radial' | 'linear' | 'turbulent';
  
  // الشكل اللولبي الجديد
  spiralTurns: number;
  spiralRadius: number;
  spiralTightness: number;
  spiralDirection: 'clockwise' | 'counterclockwise';
  
  // الشكل الماسي الجديد
  diamondSize: number;
  diamondRotation: number;
  diamondDistortion: number;
  
  // الشكل السداسي الجديد
  hexagonSize: number;
  hexagonOrientation: 'flat' | 'pointy';
  hexagonSpacing: number;
  
  // تأثير الفقاعات الجديد
  bubbleCount: number;
  bubbleSize: number;
  bubbleVariation: number;
  bubbleDistribution: 'random' | 'grid' | 'organic';
  
  // تأثير البرق الجديد
  lightningBranches: number;
  lightningIntensity: number;
  lightningChaos: number;
  
  // تأثير القماش الجديد
  fabricPattern: 'weave' | 'knit' | 'mesh' | 'cross-hatch';
  fabricDensity: number;
  fabricRoughness: number;
  
  // إعدادات التطبيق المتقدمة
  applyToGradients: boolean;
  applyToOverlays: boolean;
  applyToBorders: boolean;
  applyToBackground: boolean;
  applyToTexts: boolean;
  applyToShapes: boolean;
  applyToShadows: boolean;
  
  // إعدادات التحكم في الطبقات
  layerBlendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light' | 'color-dodge' | 'color-burn';
  layerOpacity: number;
  layerMaskFeather: number;
  
  // إعدادات التحكم المتقدم
  enablePreview: boolean;
  realTimeUpdate: boolean;
  animationSpeed: number;
  enableAnimation: boolean;
}

interface AdvancedBlendingControllerProps {
  settings: AdvancedBlendingSettings;
  onUpdate: (settings: AdvancedBlendingSettings) => void;
  language?: string;
}

const defaultSettings: AdvancedBlendingSettings = {
  blendType: 'smooth',
  transitionWidth: 20,
  blendIntensity: 50,
  smoothingRadius: 10,
  gradientStops: 5,
  
  waveFrequency: 5,
  waveAmplitude: 15,
  waveOffset: 0,
  waveType: 'sine',
  waveDirection: 'horizontal',
  
  zigzagSegments: 8,
  zigzagHeight: 20,
  zigzagPattern: 'sharp',
  zigzagRandomness: 0,
  
  curveRadius: 50,
  curveDirection: 'inward',
  curveSmoothing: 80,
  curveAsymmetry: 0,
  
  organicComplexity: 5,
  organicVariation: 30,
  organicSeed: 1,
  organicFlowDirection: 'radial',
  
  spiralTurns: 3,
  spiralRadius: 40,
  spiralTightness: 50,
  spiralDirection: 'clockwise',
  
  diamondSize: 30,
  diamondRotation: 45,
  diamondDistortion: 0,
  
  hexagonSize: 25,
  hexagonOrientation: 'flat',
  hexagonSpacing: 20,
  
  bubbleCount: 12,
  bubbleSize: 20,
  bubbleVariation: 40,
  bubbleDistribution: 'random',
  
  lightningBranches: 5,
  lightningIntensity: 70,
  lightningChaos: 30,
  
  fabricPattern: 'weave',
  fabricDensity: 50,
  fabricRoughness: 25,
  
  // تفعيل خيار الطبقات بشكل افتراضي في خيارات التطبيق المتقدمة
  applyToGradients: false,
  applyToOverlays: true,
  applyToBorders: false,
  applyToBackground: false,
  applyToTexts: false,
  applyToShapes: false,
  applyToShadows: false,
  
  layerBlendMode: 'overlay',
  layerOpacity: 80,
  layerMaskFeather: 15,
  
  enablePreview: true,
  realTimeUpdate: true,
  animationSpeed: 50,
  enableAnimation: false
};

const blendTypes = [
  { value: 'smooth', label: 'تداخل ناعم', icon: Circle },
  { value: 'sharp', label: 'خط حاد مستقيم', icon: Triangle },
  { value: 'wavy', label: 'خط متموج', icon: Waves },
  { value: 'zigzag', label: 'خط متعرج', icon: Zap },
  { value: 'curved', label: 'خط منحني', icon: Settings },
  { value: 'organic', label: 'شكل عضوي', icon: Flower },
  { value: 'spiral', label: 'حلزوني', icon: RotateCcw },
  { value: 'diamond', label: 'ماسي', icon: Settings },
  { value: 'hexagon', label: 'سداسي', icon: Circle },
  { value: 'bubble', label: 'فقاعات', icon: Circle },
  { value: 'lightning', label: 'برق', icon: Zap },
  { value: 'fabric', label: 'قماش', icon: Settings }
];

export const AdvancedBlendingController = ({ 
  settings = defaultSettings, 
  onUpdate, 
  language = 'ar' 
}: AdvancedBlendingControllerProps) => {
  const updateSetting = <K extends keyof AdvancedBlendingSettings>(
    key: K,
    value: AdvancedBlendingSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    onUpdate(newSettings);
  };

  const resetToDefaults = () => {
    onUpdate(defaultSettings);
  };

  const generateBlendingCSS = () => {
    switch (settings.blendType) {
      case 'smooth':
        return `
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(255,255,255,${settings.blendIntensity/100}) ${settings.transitionWidth}%, 
            rgba(255,255,255,${settings.blendIntensity/100}) ${100-settings.transitionWidth}%, 
            transparent 100%
          );
        `;
      
      case 'wavy':
        return `
          mask: repeating-linear-gradient(
            90deg,
            black 0px,
            black ${100/settings.waveFrequency}%,
            transparent ${100/settings.waveFrequency + settings.waveAmplitude}%
          );
        `;
      
      case 'zigzag':
        const zigzagPath = Array.from({length: settings.zigzagSegments}, (_, i) => {
          const x = (i / settings.zigzagSegments) * 100;
          const y = i % 2 === 0 ? 0 : settings.zigzagHeight;
          return `${x}% ${y}%`;
        }).join(', ');
        
        return `
          clip-path: polygon(${zigzagPath});
        `;
      
      case 'curved':
        return `
          border-radius: ${settings.curveRadius}% / ${settings.curveSmoothing}%;
          mask: radial-gradient(ellipse ${settings.curveRadius}% ${settings.curveSmoothing}% at center, black 70%, transparent 100%);
        `;
      
      case 'organic':
        const organicRadius = `${50 + settings.organicVariation * Math.sin(settings.organicSeed)}% ${50 + settings.organicVariation * Math.cos(settings.organicSeed)}%`;
        return `
          border-radius: ${organicRadius} ${organicRadius} ${organicRadius} ${organicRadius};
          filter: blur(${settings.organicComplexity}px);
        `;
      
      default:
        return '';
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-primary flex items-center gap-2">
          <Blend className="h-5 w-5" />
          التحكم المتقدم في التداخل بين الألوان
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
        {/* نوع التداخل */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">نوع التداخل</Label>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {blendTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <Button
                  key={type.value}
                  variant={settings.blendType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting('blendType', type.value as any)}
                  className="flex items-center gap-2 h-auto py-3"
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-xs">{type.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* إعدادات خاصة بنوع التداخل */}
          <div className="space-y-4">
          <Label className="text-sm font-semibold">
            إعدادات {blendTypes.find(t => t.value === settings?.blendType)?.label || 'التداخل'}
          </Label>
          
          {settings.blendType === 'smooth' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">عرض الانتقال: {settings.transitionWidth}%</Label>
                <Slider
                  value={[settings.transitionWidth]}
                  onValueChange={([value]) => updateSetting('transitionWidth', value)}
                  max={50}
                  min={5}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">شدة التداخل: {settings.blendIntensity}%</Label>
                <Slider
                  value={[settings.blendIntensity]}
                  onValueChange={([value]) => updateSetting('blendIntensity', value)}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {settings.blendType === 'wavy' && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">التردد: {settings.waveFrequency}</Label>
                <Slider
                  value={[settings.waveFrequency]}
                  onValueChange={([value]) => updateSetting('waveFrequency', value)}
                  max={20}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">السعة: {settings.waveAmplitude}%</Label>
                <Slider
                  value={[settings.waveAmplitude]}
                  onValueChange={([value]) => updateSetting('waveAmplitude', value)}
                  max={50}
                  min={5}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">الإزاحة: {settings.waveOffset}°</Label>
                <Slider
                  value={[settings.waveOffset]}
                  onValueChange={([value]) => updateSetting('waveOffset', value)}
                  max={360}
                  min={0}
                  step={15}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {settings.blendType === 'zigzag' && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">عدد الأجزاء: {settings.zigzagSegments}</Label>
                <Slider
                  value={[settings.zigzagSegments]}
                  onValueChange={([value]) => updateSetting('zigzagSegments', value)}
                  max={20}
                  min={3}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">الارتفاع: {settings.zigzagHeight}%</Label>
                <Slider
                  value={[settings.zigzagHeight]}
                  onValueChange={([value]) => updateSetting('zigzagHeight', value)}
                  max={50}
                  min={5}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">نمط الزوايا</Label>
                <Select
                  value={settings.zigzagPattern}
                  onValueChange={(value: 'sharp' | 'rounded') => updateSetting('zigzagPattern', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sharp">حادة</SelectItem>
                    <SelectItem value="rounded">مدورة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {settings.blendType === 'curved' && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">نصف القطر: {settings.curveRadius}%</Label>
                <Slider
                  value={[settings.curveRadius]}
                  onValueChange={([value]) => updateSetting('curveRadius', value)}
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">النعومة: {settings.curveSmoothing}%</Label>
                <Slider
                  value={[settings.curveSmoothing]}
                  onValueChange={([value]) => updateSetting('curveSmoothing', value)}
                  max={100}
                  min={20}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">اتجاه الانحناء</Label>
                <Select
                  value={settings.curveDirection}
                  onValueChange={(value: 'inward' | 'outward' | 'mixed') => updateSetting('curveDirection', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inward">للداخل</SelectItem>
                    <SelectItem value="outward">للخارج</SelectItem>
                    <SelectItem value="mixed">مختلط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {settings.blendType === 'organic' && (
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">التعقيد: {settings.organicComplexity}</Label>
                <Slider
                  value={[settings.organicComplexity]}
                  onValueChange={([value]) => updateSetting('organicComplexity', value)}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">التنوع: {settings.organicVariation}%</Label>
                <Slider
                  value={[settings.organicVariation]}
                  onValueChange={([value]) => updateSetting('organicVariation', value)}
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">البذرة: {settings.organicSeed}</Label>
                <Slider
                  value={[settings.organicSeed]}
                  onValueChange={([value]) => updateSetting('organicSeed', value)}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">اتجاه التدفق</Label>
                <Select
                  value={settings.organicFlowDirection}
                  onValueChange={(value: 'radial' | 'linear' | 'turbulent') => updateSetting('organicFlowDirection', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="radial">شعاعي</SelectItem>
                    <SelectItem value="linear">خطي</SelectItem>
                    <SelectItem value="turbulent">مضطرب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {settings.blendType === 'spiral' && (
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">عدد الدورات: {settings.spiralTurns}</Label>
                <Slider
                  value={[settings.spiralTurns]}
                  onValueChange={([value]) => updateSetting('spiralTurns', value)}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">نصف القطر: {settings.spiralRadius}%</Label>
                <Slider
                  value={[settings.spiralRadius]}
                  onValueChange={([value]) => updateSetting('spiralRadius', value)}
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">الضيق: {settings.spiralTightness}%</Label>
                <Slider
                  value={[settings.spiralTightness]}
                  onValueChange={([value]) => updateSetting('spiralTightness', value)}
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">الاتجاه</Label>
                <Select
                  value={settings.spiralDirection}
                  onValueChange={(value: 'clockwise' | 'counterclockwise') => updateSetting('spiralDirection', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clockwise">عكس عقارب الساعة</SelectItem>
                    <SelectItem value="counterclockwise">مع عقارب الساعة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {settings.blendType === 'diamond' && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">الحجم: {settings.diamondSize}%</Label>
                <Slider
                  value={[settings.diamondSize]}
                  onValueChange={([value]) => updateSetting('diamondSize', value)}
                  max={80}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">الدوران: {settings.diamondRotation}°</Label>
                <Slider
                  value={[settings.diamondRotation]}
                  onValueChange={([value]) => updateSetting('diamondRotation', value)}
                  max={360}
                  min={0}
                  step={15}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">التشويه: {settings.diamondDistortion}%</Label>
                <Slider
                  value={[settings.diamondDistortion]}
                  onValueChange={([value]) => updateSetting('diamondDistortion', value)}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {settings.blendType === 'hexagon' && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">الحجم: {settings.hexagonSize}%</Label>
                <Slider
                  value={[settings.hexagonSize]}
                  onValueChange={([value]) => updateSetting('hexagonSize', value)}
                  max={60}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">التوجه</Label>
                <Select
                  value={settings.hexagonOrientation}
                  onValueChange={(value: 'flat' | 'pointy') => updateSetting('hexagonOrientation', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">مسطح</SelectItem>
                    <SelectItem value="pointy">مدبب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">المسافات: {settings.hexagonSpacing}%</Label>
                <Slider
                  value={[settings.hexagonSpacing]}
                  onValueChange={([value]) => updateSetting('hexagonSpacing', value)}
                  max={50}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {settings.blendType === 'bubble' && (
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">العدد: {settings.bubbleCount}</Label>
                <Slider
                  value={[settings.bubbleCount]}
                  onValueChange={([value]) => updateSetting('bubbleCount', value)}
                  max={50}
                  min={5}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">الحجم: {settings.bubbleSize}%</Label>
                <Slider
                  value={[settings.bubbleSize]}
                  onValueChange={([value]) => updateSetting('bubbleSize', value)}
                  max={60}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">التنوع: {settings.bubbleVariation}%</Label>
                <Slider
                  value={[settings.bubbleVariation]}
                  onValueChange={([value]) => updateSetting('bubbleVariation', value)}
                  max={100}
                  min={0}
                  step={10}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">التوزيع</Label>
                <Select
                  value={settings.bubbleDistribution}
                  onValueChange={(value: 'random' | 'grid' | 'organic') => updateSetting('bubbleDistribution', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">عشوائي</SelectItem>
                    <SelectItem value="grid">شبكي</SelectItem>
                    <SelectItem value="organic">عضوي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {settings.blendType === 'lightning' && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">الفروع: {settings.lightningBranches}</Label>
                <Slider
                  value={[settings.lightningBranches]}
                  onValueChange={([value]) => updateSetting('lightningBranches', value)}
                  max={15}
                  min={2}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">الكثافة: {settings.lightningIntensity}%</Label>
                <Slider
                  value={[settings.lightningIntensity]}
                  onValueChange={([value]) => updateSetting('lightningIntensity', value)}
                  max={100}
                  min={20}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">الفوضى: {settings.lightningChaos}%</Label>
                <Slider
                  value={[settings.lightningChaos]}
                  onValueChange={([value]) => updateSetting('lightningChaos', value)}
                  max={100}
                  min={0}
                  step={10}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {settings.blendType === 'fabric' && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">النمط</Label>
                <Select
                  value={settings.fabricPattern}
                  onValueChange={(value: 'weave' | 'knit' | 'mesh' | 'cross-hatch') => updateSetting('fabricPattern', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weave">نسيج</SelectItem>
                    <SelectItem value="knit">حياكة</SelectItem>
                    <SelectItem value="mesh">شبكة</SelectItem>
                    <SelectItem value="cross-hatch">تقاطع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">الكثافة: {settings.fabricDensity}%</Label>
                <Slider
                  value={[settings.fabricDensity]}
                  onValueChange={([value]) => updateSetting('fabricDensity', value)}
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">الخشونة: {settings.fabricRoughness}%</Label>
                <Slider
                  value={[settings.fabricRoughness]}
                  onValueChange={([value]) => updateSetting('fabricRoughness', value)}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* خيارات التطبيق المتقدمة */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">خيارات التطبيق المتقدمة</Label>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="apply-gradients" className="text-sm">التدرجات</Label>
              <Switch
                id="apply-gradients"
                checked={settings.applyToGradients}
                onCheckedChange={(checked) => updateSetting('applyToGradients', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="apply-overlays" className="text-sm">الطبقات</Label>
              <Switch
                id="apply-overlays"
                checked={settings.applyToOverlays}
                onCheckedChange={(checked) => updateSetting('applyToOverlays', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="apply-borders" className="text-sm">الحدود</Label>
              <Switch
                id="apply-borders"
                checked={settings.applyToBorders}
                onCheckedChange={(checked) => updateSetting('applyToBorders', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="apply-background" className="text-sm">الخلفية</Label>
              <Switch
                id="apply-background"
                checked={settings.applyToBackground}
                onCheckedChange={(checked) => updateSetting('applyToBackground', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="apply-texts" className="text-sm">النصوص</Label>
              <Switch
                id="apply-texts"
                checked={settings.applyToTexts}
                onCheckedChange={(checked) => updateSetting('applyToTexts', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="apply-shapes" className="text-sm">الأشكال</Label>
              <Switch
                id="apply-shapes"
                checked={settings.applyToShapes}
                onCheckedChange={(checked) => updateSetting('applyToShapes', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="apply-shadows" className="text-sm">الظلال</Label>
              <Switch
                id="apply-shadows"
                checked={settings.applyToShadows}
                onCheckedChange={(checked) => updateSetting('applyToShadows', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-animation" className="text-sm">تحريك</Label>
              <Switch
                id="enable-animation"
                checked={settings.enableAnimation}
                onCheckedChange={(checked) => updateSetting('enableAnimation', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* إعدادات التحكم في الطبقات */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">إعدادات التحكم في الطبقات</Label>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">نمط المزج</Label>
              <Select
                value={settings.layerBlendMode}
                onValueChange={(value: typeof settings.layerBlendMode) => updateSetting('layerBlendMode', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">عادي</SelectItem>
                  <SelectItem value="multiply">ضرب</SelectItem>
                  <SelectItem value="screen">شاشة</SelectItem>
                  <SelectItem value="overlay">طبقة علوية</SelectItem>
                  <SelectItem value="soft-light">ضوء ناعم</SelectItem>
                  <SelectItem value="hard-light">ضوء قوي</SelectItem>
                  <SelectItem value="color-dodge">تجنب اللون</SelectItem>
                  <SelectItem value="color-burn">حرق اللون</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">شفافية الطبقة: {settings.layerOpacity}%</Label>
              <Slider
                value={[settings.layerOpacity]}
                onValueChange={([value]) => updateSetting('layerOpacity', value)}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">نعومة القناع: {settings.layerMaskFeather}px</Label>
              <Slider
                value={[settings.layerMaskFeather]}
                onValueChange={([value]) => updateSetting('layerMaskFeather', value)}
                max={50}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">سرعة الحركة: {settings.animationSpeed}%</Label>
              <Slider
                value={[settings.animationSpeed]}
                onValueChange={([value]) => updateSetting('animationSpeed', value)}
                max={200}
                min={10}
                step={10}
                className="w-full"
                disabled={!settings.enableAnimation}
              />
            </div>
          </div>
        </div>

        {/* معاينة التأثير */}
        {settings.enablePreview && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">معاينة التأثير</Label>
            <div 
              className="h-16 rounded-lg border-2 border-dashed border-muted-foreground/20 relative overflow-hidden"
              style={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)'
              }}
            >
              <div 
                className="absolute inset-0"
                style={{ 
                  background: generateBlendingCSS(),
                  mixBlendMode: 'overlay'
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-white/80 font-medium">
                  {blendTypes.find(t => t.value === settings.blendType)?.label}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};