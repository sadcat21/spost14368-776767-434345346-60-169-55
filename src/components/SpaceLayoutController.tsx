import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Layout, 
  Grid3X3, 
  Square, 
  Circle, 
  Triangle, 
  Waves,
  Zap,
  Hexagon,
  Diamond,
  Heart,
  Star
} from "lucide-react";

export interface SpaceLayoutSettings {
  layoutPattern: string;
  textPosition: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'diagonal';
  imagePosition: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'background';
  divisionStyle: 'straight' | 'curved' | 'wave' | 'zigzag' | 'organic';
  spacingRatio: number; // نسبة تقسيم المساحة (0-100)
}

interface SpaceLayoutControllerProps {
  onUpdate: (settings: SpaceLayoutSettings) => void;
}

const defaultSettings: SpaceLayoutSettings = {
  layoutPattern: 'half-split',
  textPosition: 'right',
  imagePosition: 'left',
  divisionStyle: 'curved',
  spacingRatio: 50
};

// أنماط التقسيم المختلفة
const layoutPatterns = [
  {
    id: 'half-split',
    name: 'تقسيم نصفي',
    icon: Square,
    description: 'تقسيم الصورة إلى نصفين متساويين'
  },
  {
    id: 'diagonal-split',
    name: 'تقسيم قطري',
    icon: Diamond,
    description: 'تقسيم قطري للمساحة'
  },
  {
    id: 'curved-split',
    name: 'تقسيم منحني',
    icon: Waves,
    description: 'تقسيم بخط منحني أنيق'
  },
  {
    id: 'circular-frame',
    name: 'إطار دائري',
    icon: Circle,
    description: 'مساحة دائرية للصورة مع خلفية ملونة'
  },
  {
    id: 'triangular-cut',
    name: 'قطع مثلثي',
    icon: Triangle,
    description: 'تقسيم بشكل مثلثي حديث'
  },
  {
    id: 'wave-pattern',
    name: 'نمط الموجات',
    icon: Waves,
    description: 'خطوط موجية ناعمة'
  },
  {
    id: 'organic-shape',
    name: 'أشكال عضوية',
    icon: Zap,
    description: 'أشكال طبيعية غير منتظمة'
  },
  {
    id: 'hexagonal',
    name: 'سداسي الأضلاع',
    icon: Hexagon,
    description: 'تقسيم بشكل سداسي'
  },
  {
    id: 'star-burst',
    name: 'انفجار نجمي',
    icon: Star,
    description: 'شكل نجمي إشعاعي'
  },
  {
    id: 'heart-shape',
    name: 'شكل القلب',
    icon: Heart,
    description: 'تقسيم بشكل القلب'
  }
];

// مواضع النص
const textPositions = [
  { id: 'top', name: 'أعلى', emoji: '⬆️' },
  { id: 'bottom', name: 'أسفل', emoji: '⬇️' },
  { id: 'left', name: 'يسار', emoji: '⬅️' },
  { id: 'right', name: 'يمين', emoji: '➡️' },
  { id: 'center', name: 'وسط', emoji: '⭕' },
  { id: 'diagonal', name: 'قطري', emoji: '↗️' }
];

// مواضع الصورة
const imagePositions = [
  { id: 'top', name: 'أعلى', emoji: '🔝' },
  { id: 'bottom', name: 'أسفل', emoji: '🔻' },
  { id: 'left', name: 'يسار', emoji: '◀️' },
  { id: 'right', name: 'يمين', emoji: '▶️' },
  { id: 'center', name: 'وسط', emoji: '⭕' },
  { id: 'background', name: 'خلفية', emoji: '🌅' }
];

// أنماط الخطوط الفاصلة
const divisionStyles = [
  { id: 'straight', name: 'مستقيم', emoji: '📏' },
  { id: 'curved', name: 'منحني', emoji: '🌙' },
  { id: 'wave', name: 'موجي', emoji: '🌊' },
  { id: 'zigzag', name: 'متعرج', emoji: '⚡' },
  { id: 'organic', name: 'عضوي', emoji: '🍃' }
];

export const SpaceLayoutController = ({ onUpdate }: SpaceLayoutControllerProps) => {
  const [settings, setSettings] = useState<SpaceLayoutSettings>(defaultSettings);

  const updateSetting = <K extends keyof SpaceLayoutSettings>(
    key: K,
    value: SpaceLayoutSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    console.log('SpaceLayoutController - إعدادات جديدة:', newSettings);
    setSettings(newSettings);
    onUpdate(newSettings);
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-purple-700 text-lg font-bold">
          <Layout className="h-6 w-6" />
          🎨 تخطيط وتقسيم مساحة الصورة
        </CardTitle>
        <p className="text-sm text-purple-600 font-medium">
          اختر نمط تقسيم المساحة وموضع النص والصورة للحصول على تصميم فريد ومميز
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* أنماط التقسيم */}
        <div className="space-y-4">
          <Label className="text-base font-semibold text-purple-800 flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            أنماط تقسيم المساحة
          </Label>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {layoutPatterns.map((pattern) => {
              const IconComponent = pattern.icon;
              return (
                <Button
                  key={pattern.id}
                  variant={settings.layoutPattern === pattern.id ? "default" : "outline"}
                  onClick={() => updateSetting("layoutPattern", pattern.id)}
                  className={`h-auto p-4 flex flex-col items-center gap-2 text-xs transition-all ${
                    settings.layoutPattern === pattern.id 
                      ? 'bg-purple-600 text-white shadow-lg scale-105' 
                      : 'hover:bg-purple-50 hover:border-purple-300'
                  }`}
                >
                  <IconComponent className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">{pattern.name}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {pattern.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        <Separator className="bg-purple-200" />

        {/* موضع النص */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-purple-800">
            📝 موضع النص في التصميم
          </Label>
          
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
            {textPositions.map((position) => (
              <Button
                key={position.id}
                variant={settings.textPosition === position.id ? "default" : "outline"}
                onClick={() => updateSetting("textPosition", position.id as any)}
                className={`h-16 flex flex-col items-center gap-1 text-xs ${
                  settings.textPosition === position.id 
                    ? 'bg-purple-600 text-white' 
                    : 'hover:bg-purple-50'
                }`}
              >
                <span className="text-lg">{position.emoji}</span>
                <span className="font-medium">{position.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <Separator className="bg-purple-200" />

        {/* موضع الصورة */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-purple-800">
            🖼️ موضع الصورة في التصميم
          </Label>
          
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
            {imagePositions.map((position) => (
              <Button
                key={position.id}
                variant={settings.imagePosition === position.id ? "default" : "outline"}
                onClick={() => updateSetting("imagePosition", position.id as any)}
                className={`h-16 flex flex-col items-center gap-1 text-xs ${
                  settings.imagePosition === position.id 
                    ? 'bg-purple-600 text-white' 
                    : 'hover:bg-purple-50'
                }`}
              >
                <span className="text-lg">{position.emoji}</span>
                <span className="font-medium">{position.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <Separator className="bg-purple-200" />

        {/* نمط الخط الفاصل */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-purple-800">
            ✂️ نمط الخط الفاصل
          </Label>
          
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
            {divisionStyles.map((style) => (
              <Button
                key={style.id}
                variant={settings.divisionStyle === style.id ? "default" : "outline"}
                onClick={() => updateSetting("divisionStyle", style.id as any)}
                className={`h-16 flex flex-col items-center gap-1 text-xs ${
                  settings.divisionStyle === style.id 
                    ? 'bg-purple-600 text-white' 
                    : 'hover:bg-purple-50'
                }`}
              >
                <span className="text-lg">{style.emoji}</span>
                <span className="font-medium">{style.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <Separator className="bg-purple-200" />

        {/* نسبة التقسيم */}
        <div className="space-y-3 p-4 bg-white rounded-lg border border-purple-200">
          <Label className="text-base font-semibold text-purple-800">
            ⚖️ نسبة تقسيم المساحة: {settings.spacingRatio}%
          </Label>
          
          <div className="space-y-2">
            <input
              type="range"
              min="20"
              max="80"
              step="5"
              value={settings.spacingRatio}
              onChange={(e) => updateSetting("spacingRatio", Number(e.target.value))}
              className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider"
            />
            
            <div className="flex justify-between text-xs text-purple-600">
              <span>النص أكبر (20%)</span>
              <span>متوازن (50%)</span>
              <span>الصورة أكبر (80%)</span>
            </div>
          </div>
        </div>

        {/* معاينة التصميم الحالي */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-2xl">🎭</div>
            <div>
              <p className="font-semibold text-purple-800">التصميم المختار حالياً</p>
              <p className="text-sm text-purple-600">
                {layoutPatterns.find(p => p.id === settings.layoutPattern)?.name} - 
                النص {textPositions.find(p => p.id === settings.textPosition)?.name} - 
                الصورة {imagePositions.find(p => p.id === settings.imagePosition)?.name}
              </p>
            </div>
          </div>
          
          <div className="text-xs text-purple-700">
            ✨ نمط الفاصل: {divisionStyles.find(s => s.id === settings.divisionStyle)?.name} | 
            نسبة التقسيم: {settings.spacingRatio}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
};