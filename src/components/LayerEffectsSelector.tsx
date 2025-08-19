import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wand2, Waves, Zap, RotateCcw, Sparkles, Circle, Triangle, Infinity, ArrowUpDown } from "lucide-react";
import { OverlayGradientController, type GradientSettings } from "./OverlayGradientController";


export interface LayerEffect {
  type: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  properties: {
    intensity?: number;
    frequency?: number;
    amplitude?: number;
    rotation?: number;
    scale?: number;
    opacity?: number;
    distortion?: number;
    color?: string;
  };
  // إضافة إعدادات التدرج
  gradientSettings?: GradientSettings;
}

interface LayerEffectsSelectorProps {
  onEffectChange: (effect: LayerEffect) => void;
  currentEffect?: LayerEffect;
}

const layerEffects: LayerEffect[] = [
  {
    type: "arc",
    label: "قوس",
    icon: Circle,
    description: "تأثير قوسي منحني",
    properties: {
      intensity: 50,
      rotation: 0,
      scale: 100,
      opacity: 80,
      color: "#3b82f6"
    }
  },
  {
    type: "wave",
    label: "تموج",
    icon: Waves,
    description: "تأثير تموجي متدفق",
    properties: {
      frequency: 3,
      amplitude: 20,
      intensity: 60,
      opacity: 75,
      color: "#06b6d4"
    }
  },
  {
    type: "refraction",
    label: "انكسار",
    icon: Sparkles,
    description: "تأثير انكسار ضوئي",
    properties: {
      distortion: 40,
      intensity: 70,
      scale: 120,
      opacity: 65,
      color: "#8b5cf6"
    }
  },
  {
    type: "spiral",
    label: "حلزوني",
    icon: RotateCcw,
    description: "تأثير حلزوني دوار",
    properties: {
      rotation: 45,
      intensity: 55,
      scale: 90,
      opacity: 70,
      color: "#f59e0b"
    }
  },
  {
    type: "zigzag",
    label: "متعرج",
    icon: Zap,
    description: "تأثير خطوط متعرجة",
    properties: {
      frequency: 5,
      amplitude: 15,
      intensity: 65,
      opacity: 80,
      color: "#ef4444"
    }
  },
  {
    type: "ripple",
    label: "تموج دائري",
    icon: Circle,
    description: "تأثير موجات دائرية",
    properties: {
      frequency: 4,
      amplitude: 25,
      intensity: 50,
      opacity: 70,
      color: "#10b981"
    }
  },
  {
    type: "twist",
    label: "التواء",
    icon: Infinity,
    description: "تأثير التواء",
    properties: {
      rotation: 30,
      distortion: 35,
      intensity: 60,
      opacity: 75,
      color: "#ec4899"
    }
  },
  {
    type: "glass",
    label: "زجاجي",
    icon: Triangle,
    description: "تأثير زجاجي شفاف",
    properties: {
      distortion: 20,
      intensity: 40,
      opacity: 50,
      scale: 110,
      color: "#6366f1"
    }
  },
  {
    type: "flow",
    label: "انسيابي",
    icon: ArrowUpDown,
    description: "تأثير انسيابي متدفق",
    properties: {
      frequency: 2,
      amplitude: 30,
      intensity: 55,
      opacity: 85,
      color: "#14b8a6"
    }
  },
  {
    type: "pulse",
    label: "نبضي",
    icon: Wand2,
    description: "تأثير نبضات منتظمة",
    properties: {
      frequency: 6,
      intensity: 70,
      scale: 95,
      opacity: 80,
      color: "#f97316"
    }
  }
];

export const LayerEffectsSelector = ({ onEffectChange, currentEffect }: LayerEffectsSelectorProps) => {
  const [selectedEffect, setSelectedEffect] = useState<LayerEffect>(
    currentEffect || layerEffects[0]
  );

  const handleEffectSelect = (effectType: string) => {
    const effect = layerEffects.find(e => e.type === effectType);
    if (effect) {
      setSelectedEffect(effect);
      onEffectChange(effect);
    }
  };

  const handlePropertyChange = (property: string, value: number | string) => {
    const updatedEffect = {
      ...selectedEffect,
      properties: {
        ...selectedEffect.properties,
        [property]: value
      }
    };
    setSelectedEffect(updatedEffect);
    onEffectChange(updatedEffect);
  };

  const handleGradientSettingsChange = (gradientSettings: GradientSettings) => {
    const updatedEffect = {
      ...selectedEffect,
      gradientSettings
    };
    setSelectedEffect(updatedEffect);
    onEffectChange(updatedEffect);
  };

  const IconComponent = selectedEffect.icon;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wand2 className="h-5 w-5" />
          تأثيرات الطبقة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* اختيار التأثير */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">نوع التأثير</Label>
          <Select value={selectedEffect.type} onValueChange={handleEffectSelect}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border z-50">
              {layerEffects.map((effect) => {
                const EffectIcon = effect.icon;
                return (
                  <SelectItem key={effect.type} value={effect.type}>
                    <div className="flex items-center gap-2">
                      <EffectIcon className="h-4 w-4" />
                      <span>{effect.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* معاينة التأثير */}
        <div className="p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-3 mb-2">
            <IconComponent className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-medium">{selectedEffect.label}</h3>
              <p className="text-sm text-muted-foreground">{selectedEffect.description}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {selectedEffect.type}
          </Badge>
        </div>

        {/* إعدادات التأثير */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">إعدادات التأثير</h4>
          
          {/* اللون */}
          {selectedEffect.properties.color !== undefined && (
            <div className="space-y-2">
              <Label className="text-sm">لون التأثير</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={selectedEffect.properties.color}
                  onChange={(e) => handlePropertyChange('color', e.target.value)}
                  className="w-12 h-8 rounded border border-input cursor-pointer"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={selectedEffect.properties.color}
                    onChange={(e) => handlePropertyChange('color', e.target.value)}
                    className="w-full px-3 py-1 text-sm border border-input rounded bg-background"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* الشدة */}
          {selectedEffect.properties.intensity !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm">الشدة</Label>
                <span className="text-xs text-muted-foreground">
                  {selectedEffect.properties.intensity}%
                </span>
              </div>
              <Slider
                value={[selectedEffect.properties.intensity]}
                onValueChange={(value) => handlePropertyChange('intensity', value[0])}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          )}

          {/* التردد */}
          {selectedEffect.properties.frequency !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm">التردد</Label>
                <span className="text-xs text-muted-foreground">
                  {selectedEffect.properties.frequency}
                </span>
              </div>
              <Slider
                value={[selectedEffect.properties.frequency]}
                onValueChange={(value) => handlePropertyChange('frequency', value[0])}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          )}

          {/* السعة */}
          {selectedEffect.properties.amplitude !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm">السعة</Label>
                <span className="text-xs text-muted-foreground">
                  {selectedEffect.properties.amplitude}px
                </span>
              </div>
              <Slider
                value={[selectedEffect.properties.amplitude]}
                onValueChange={(value) => handlePropertyChange('amplitude', value[0])}
                max={50}
                min={5}
                step={1}
                className="w-full"
              />
            </div>
          )}

          {/* الدوران */}
          {selectedEffect.properties.rotation !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm">الدوران</Label>
                <span className="text-xs text-muted-foreground">
                  {selectedEffect.properties.rotation}°
                </span>
              </div>
              <Slider
                value={[selectedEffect.properties.rotation]}
                onValueChange={(value) => handlePropertyChange('rotation', value[0])}
                max={360}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          )}

          {/* المقياس */}
          {selectedEffect.properties.scale !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm">المقياس</Label>
                <span className="text-xs text-muted-foreground">
                  {selectedEffect.properties.scale}%
                </span>
              </div>
              <Slider
                value={[selectedEffect.properties.scale]}
                onValueChange={(value) => handlePropertyChange('scale', value[0])}
                max={200}
                min={50}
                step={5}
                className="w-full"
              />
            </div>
          )}

          {/* الشفافية */}
          {selectedEffect.properties.opacity !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm">الشفافية</Label>
                <span className="text-xs text-muted-foreground">
                  {selectedEffect.properties.opacity}%
                </span>
              </div>
              <Slider
                value={[selectedEffect.properties.opacity]}
                onValueChange={(value) => handlePropertyChange('opacity', value[0])}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
          )}

          {/* التشويه */}
          {selectedEffect.properties.distortion !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm">التشويه</Label>
                <span className="text-xs text-muted-foreground">
                  {selectedEffect.properties.distortion}%
                </span>
              </div>
              <Slider
                value={[selectedEffect.properties.distortion]}
                onValueChange={(value) => handlePropertyChange('distortion', value[0])}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
          )}
        </div>

        <Separator />

        {/* إعدادات التدرج للطبقة العلوية */}
        <OverlayGradientController
          settings={selectedEffect.gradientSettings || {
            useOverlayGradient: true,
            gradientType: 'radial',
            gradientAngle: 210,
            centerX: 50,
            centerY: 50,
            gradientSize: 100,
            colorStops: [
              { color: "#3b82f6", opacity: 100, position: 60 },
              { color: "#1e40af", opacity: 100, position: 15 }
            ]
          }}
          onUpdate={handleGradientSettingsChange}
        />
      </CardContent>
    </Card>
  );
};