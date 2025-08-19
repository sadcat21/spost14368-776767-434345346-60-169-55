import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { NumericInput } from "@/components/ui/numeric-input";
import { 
  Image, 
  Layers, 
  Palette, 
  RotateCcw, 
  FlipHorizontal, 
  FlipVertical,
  RotateCw,
  Move,
  Crop,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Lightbulb,
  Droplets,
  Wind,
  Shapes,
  Layout
} from "lucide-react";

export interface BackgroundImageSettings {
  // خيارات الخلفية المتطورة
  backgroundType: 'solid' | 'gradient' | 'pattern' | 'texture' | 'atmospheric' | 'artistic' | 'geometric' | 'nature' | 'abstract' | 'professional';
  backgroundColor: string;
  gradientType: 'linear' | 'radial' | 'conic';
  gradientDirection: number;
  gradientColors: string[];
  
  // أنماط الخلفية المتخصصة
  patternType: 'geometric' | 'organic' | 'tech' | 'minimal' | 'vintage' | 'modern' | 'artistic' | 'corporate' | 'creative' | 'elegant';
  patternDensity: number;
  patternOpacity: number;
  
  // التأثيرات الجوية
  atmosphericEffect: 'fog' | 'clouds' | 'mist' | 'smoke' | 'particles' | 'bokeh' | 'light-rays' | 'aurora' | 'stars' | 'rain';
  atmosphericIntensity: number;
  atmosphericColor: string;
  
  // التأثيرات الفنية
  artisticStyle: 'watercolor' | 'oil-painting' | 'sketch' | 'digital-art' | 'minimalist' | 'abstract' | 'pop-art' | 'vintage' | 'futuristic' | 'cinematic';
  artisticBlend: number;
  
  // إعدادات الإضاءة المتقدمة
  lightingEnabled: boolean;
  lightingType: 'ambient' | 'directional' | 'spot' | 'rim' | 'dramatic' | 'soft' | 'natural' | 'studio' | 'sunset' | 'neon';
  lightIntensity: number;
  lightColor: string;
  lightAngle: number;
  
  // تأثيرات التراكب
  overlayEnabled: boolean;
  overlayTexture: 'noise' | 'grain' | 'paper' | 'fabric' | 'metal' | 'glass' | 'concrete' | 'wood' | 'marble' | 'leather';
  overlayIntensity: number;
  overlayBlendMode: 'normal' | 'multiply' | 'overlay' | 'soft-light' | 'hard-light' | 'darken' | 'lighten' | 'color-burn' | 'color-dodge' | 'screen';
}

export interface ImageProperties {
  // تحويل الصورة
  flipHorizontal: boolean;
  flipVertical: boolean;
  rotation: number;
  positionX: number;
  positionY: number;
  scale: number;
  
  // قص الصورة
  cropEnabled: boolean;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  
  // فلاتر متقدمة
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  opacity: number;
  sepia: number;
  grayscale: number;
  invert: boolean;
  
  // تأثيرات الصورة المتخصصة
  imageEffect: 'none' | 'vintage' | 'cinematic' | 'dramatic' | 'soft' | 'sharp' | 'warm' | 'cool' | 'high-contrast' | 'dreamy';
  vignetteEnabled: boolean;
  vignetteIntensity: number;
  
  // الشفافية المتقدمة
  advancedOpacityEnabled: boolean;
  opacityShape: 'circle' | 'rectangle' | 'ellipse' | 'diagonal' | 'radial' | 'linear' | 'custom' | 'feathered' | 'mask' | 'gradient';
  opacityPattern: 'smooth' | 'sharp' | 'feathered' | 'organic' | 'geometric' | 'artistic' | 'random' | 'structured' | 'flowing' | 'precise';
}

export interface LayoutSpaceSettings {
  // تخطيط المساحة المتطور
  layoutType: 'rectangle' | 'triangle' | 'trapezoid' | 'half-triangle' | 'half-trapezoid' | 'half-circle' | 'half-ellipse' | 'diamond' | 'hexagon' | 'pentagon' | 'octagon' | 'star' | 'heart' | 'custom';
  
  // إعدادات الهوامش المتقدمة
  marginType: 'uniform' | 'variable' | 'dynamic' | 'responsive' | 'artistic' | 'geometric' | 'organic' | 'minimal' | 'dramatic' | 'balanced';
  topMargin: number;
  bottomMargin: number;
  leftMargin: number;
  rightMargin: number;
  
  // توزيع النص المتطور
  textDistribution: 'center' | 'justified' | 'artistic' | 'dynamic' | 'flowing' | 'structured' | 'minimal' | 'dramatic' | 'balanced' | 'creative';
  textFlow: 'standard' | 'curved' | 'spiral' | 'wave' | 'zigzag' | 'organic' | 'geometric' | 'artistic' | 'modern' | 'classic';
  
  // إعدادات التوزيع المكاني
  horizontalAlignment: 'left' | 'center' | 'right' | 'justified' | 'distributed' | 'artistic' | 'dynamic' | 'flowing' | 'structured' | 'balanced';
  verticalAlignment: 'top' | 'center' | 'bottom' | 'distributed' | 'artistic' | 'dynamic' | 'flowing' | 'structured' | 'balanced' | 'responsive';
  
  // التباعد والمسافات
  innerPadding: number;
  elementSpacing: number;
  lineSpacing: number;
  paragraphSpacing: number;
  
  // التكيف مع الشكل
  shapeAware: boolean;
  edgeBuffer: number;
  flowAroundElements: boolean;
  adaptiveLayout: boolean;
}

interface BackgroundAndImageControllerProps {
  backgroundSettings: BackgroundImageSettings;
  imageProperties: ImageProperties;
  layoutSettings: LayoutSpaceSettings;
  onBackgroundUpdate: (settings: BackgroundImageSettings) => void;
  onImageUpdate: (properties: ImageProperties) => void;
  onLayoutUpdate: (settings: LayoutSpaceSettings) => void;
}

const defaultBackgroundSettings: BackgroundImageSettings = {
  backgroundType: 'gradient',
  backgroundColor: '#1a1a2e',
  gradientType: 'linear',
  gradientDirection: 135,
  gradientColors: ['#667eea', '#764ba2'],
  patternType: 'geometric',
  patternDensity: 50,
  patternOpacity: 30,
  atmosphericEffect: 'fog',
  atmosphericIntensity: 25,
  atmosphericColor: '#ffffff',
  artisticStyle: 'digital-art',
  artisticBlend: 50,
  lightingEnabled: false,
  lightingType: 'ambient',
  lightIntensity: 50,
  lightColor: '#ffffff',
  lightAngle: 45,
  overlayEnabled: false,
  overlayTexture: 'noise',
  overlayIntensity: 20,
  overlayBlendMode: 'overlay'
};

const defaultImageProperties: ImageProperties = {
  flipHorizontal: false,
  flipVertical: false,
  rotation: 0,
  positionX: 50,
  positionY: 50,
  scale: 100,
  cropEnabled: false,
  cropX: 0,
  cropY: 0,
  cropWidth: 100,
  cropHeight: 100,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  blur: 0,
  opacity: 100,
  sepia: 0,
  grayscale: 0,
  invert: false,
  imageEffect: 'none',
  vignetteEnabled: false,
  vignetteIntensity: 30,
  advancedOpacityEnabled: false,
  opacityShape: 'circle',
  opacityPattern: 'smooth'
};

const defaultLayoutSettings: LayoutSpaceSettings = {
  layoutType: 'rectangle',
  marginType: 'uniform',
  topMargin: 20,
  bottomMargin: 20,
  leftMargin: 20,
  rightMargin: 20,
  textDistribution: 'center',
  textFlow: 'standard',
  horizontalAlignment: 'center',
  verticalAlignment: 'center',
  innerPadding: 15,
  elementSpacing: 10,
  lineSpacing: 1.4,
  paragraphSpacing: 20,
  shapeAware: true,
  edgeBuffer: 15,
  flowAroundElements: true,
  adaptiveLayout: true
};

export const BackgroundAndImageController = ({
  backgroundSettings,
  imageProperties,
  layoutSettings,
  onBackgroundUpdate,
  onImageUpdate,
  onLayoutUpdate
}: BackgroundAndImageControllerProps) => {
  const [activeTab, setActiveTab] = useState("background");

  const updateBackgroundSetting = <K extends keyof BackgroundImageSettings>(
    key: K,
    value: BackgroundImageSettings[K]
  ) => {
    onBackgroundUpdate({ ...backgroundSettings, [key]: value });
  };

  const updateImageProperty = <K extends keyof ImageProperties>(
    key: K,
    value: ImageProperties[K]
  ) => {
    onImageUpdate({ ...imageProperties, [key]: value });
  };

  const updateLayoutSetting = <K extends keyof LayoutSpaceSettings>(
    key: K,
    value: LayoutSpaceSettings[K]
  ) => {
    onLayoutUpdate({ ...layoutSettings, [key]: value });
  };

  const resetAll = () => {
    onBackgroundUpdate(defaultBackgroundSettings);
    onImageUpdate(defaultImageProperties);
    onLayoutUpdate(defaultLayoutSettings);
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-primary flex items-center gap-2">
          <Layers className="h-5 w-5" />
          التحكم الشامل في الخلفية والصورة والتخطيط
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetAll}
          className="h-8 px-3"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="background" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              الخلفية والعناصر
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              خصائص الصورة
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              تخطيط المساحة
            </TabsTrigger>
          </TabsList>

          {/* تبويبة الخلفية والعناصر */}
          <TabsContent value="background" className="space-y-6">
            {/* نوع الخلفية */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                نوع الخلفية المتخصص
              </Label>
              <Select 
                value={backgroundSettings.backgroundType} 
                onValueChange={(value: BackgroundImageSettings['backgroundType']) => updateBackgroundSetting('backgroundType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">خلفية صلبة احترافية</SelectItem>
                  <SelectItem value="gradient">تدرج ألوان متطور</SelectItem>
                  <SelectItem value="pattern">أنماط هندسية متقدمة</SelectItem>
                  <SelectItem value="texture">ملمس وخامات طبيعية</SelectItem>
                  <SelectItem value="atmospheric">تأثيرات جوية سينمائية</SelectItem>
                  <SelectItem value="artistic">أسلوب فني راقي</SelectItem>
                  <SelectItem value="geometric">تصميم هندسي معاصر</SelectItem>
                  <SelectItem value="nature">طبيعة وعناصر عضوية</SelectItem>
                  <SelectItem value="abstract">تجريد فني متطور</SelectItem>
                  <SelectItem value="professional">مظهر مؤسسي احترافي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* أنماط الخلفية المتخصصة */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">نمط الخلفية المتخصص</Label>
              <Select 
                value={backgroundSettings.patternType} 
                onValueChange={(value: BackgroundImageSettings['patternType']) => updateBackgroundSetting('patternType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geometric">هندسي معاصر</SelectItem>
                  <SelectItem value="organic">عضوي طبيعي</SelectItem>
                  <SelectItem value="tech">تقني رقمي</SelectItem>
                  <SelectItem value="minimal">بساطة عصرية</SelectItem>
                  <SelectItem value="vintage">كلاسيكي عتيق</SelectItem>
                  <SelectItem value="modern">حداثي متطور</SelectItem>
                  <SelectItem value="artistic">فني إبداعي</SelectItem>
                  <SelectItem value="corporate">مؤسسي راقي</SelectItem>
                  <SelectItem value="creative">إبداعي متميز</SelectItem>
                  <SelectItem value="elegant">أناقة راقية</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>كثافة النمط: {backgroundSettings.patternDensity}%</Label>
                  <Slider
                    value={[backgroundSettings.patternDensity]}
                    onValueChange={([value]) => updateBackgroundSetting('patternDensity', value)}
                    max={100}
                    min={0}
                    step={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>شفافية النمط: {backgroundSettings.patternOpacity}%</Label>
                  <Slider
                    value={[backgroundSettings.patternOpacity]}
                    onValueChange={([value]) => updateBackgroundSetting('patternOpacity', value)}
                    max={100}
                    min={0}
                    step={5}
                  />
                </div>
              </div>
            </div>

            {/* التأثيرات الجوية */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Droplets className="h-5 w-5 text-primary" />
                التأثيرات الجوية السينمائية
              </Label>
              <Select 
                value={backgroundSettings.atmosphericEffect} 
                onValueChange={(value: BackgroundImageSettings['atmosphericEffect']) => updateBackgroundSetting('atmosphericEffect', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fog">ضباب كثيف سينمائي</SelectItem>
                  <SelectItem value="clouds">سحب متحركة طبيعية</SelectItem>
                  <SelectItem value="mist">رذاذ ناعم شاعري</SelectItem>
                  <SelectItem value="smoke">دخان فني درامي</SelectItem>
                  <SelectItem value="particles">جسيمات متطايرة ساحرة</SelectItem>
                  <SelectItem value="bokeh">بوكيه احترافي راقي</SelectItem>
                  <SelectItem value="light-rays">أشعة ضوء سينمائية</SelectItem>
                  <SelectItem value="aurora">شفق قطبي ملون</SelectItem>
                  <SelectItem value="stars">نجوم متلألئة ليلية</SelectItem>
                  <SelectItem value="rain">مطر طبيعي منعش</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>شدة التأثير: {backgroundSettings.atmosphericIntensity}%</Label>
                  <Slider
                    value={[backgroundSettings.atmosphericIntensity]}
                    onValueChange={([value]) => updateBackgroundSetting('atmosphericIntensity', value)}
                    max={100}
                    min={0}
                    step={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>لون التأثير</Label>
                  <Input
                    type="color"
                    value={backgroundSettings.atmosphericColor}
                    onChange={(e) => updateBackgroundSetting('atmosphericColor', e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* الأسلوب الفني */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">الأسلوب الفني المتطور</Label>
              <Select 
                value={backgroundSettings.artisticStyle} 
                onValueChange={(value: BackgroundImageSettings['artisticStyle']) => updateBackgroundSetting('artisticStyle', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="watercolor">ألوان مائية فنية</SelectItem>
                  <SelectItem value="oil-painting">رسم زيتي كلاسيكي</SelectItem>
                  <SelectItem value="sketch">رسم تخطيطي فني</SelectItem>
                  <SelectItem value="digital-art">فن رقمي معاصر</SelectItem>
                  <SelectItem value="minimalist">بساطة فنية راقية</SelectItem>
                  <SelectItem value="abstract">تجريد فني متطور</SelectItem>
                  <SelectItem value="pop-art">فن شعبي ملون</SelectItem>
                  <SelectItem value="vintage">طراز عتيق أصيل</SelectItem>
                  <SelectItem value="futuristic">مستقبلي متطور</SelectItem>
                  <SelectItem value="cinematic">سينمائي درامي</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="space-y-2">
                <Label>قوة المزج الفني: {backgroundSettings.artisticBlend}%</Label>
                <Slider
                  value={[backgroundSettings.artisticBlend]}
                  onValueChange={([value]) => updateBackgroundSetting('artisticBlend', value)}
                  max={100}
                  min={0}
                  step={5}
                />
              </div>
            </div>

            {/* إعدادات الإضاءة */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  إضاءة احترافية متطورة
                </Label>
                <Switch
                  checked={backgroundSettings.lightingEnabled}
                  onCheckedChange={(enabled) => updateBackgroundSetting('lightingEnabled', enabled)}
                />
              </div>

              {backgroundSettings.lightingEnabled && (
                <div className="space-y-4 pt-2 border-t">
                  <Select 
                    value={backgroundSettings.lightingType} 
                    onValueChange={(value: BackgroundImageSettings['lightingType']) => updateBackgroundSetting('lightingType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ambient">إضاءة محيطة ناعمة</SelectItem>
                      <SelectItem value="directional">إضاءة موجهة احترافية</SelectItem>
                      <SelectItem value="spot">إضاءة بقعة مركزة</SelectItem>
                      <SelectItem value="rim">إضاءة حافة فنية</SelectItem>
                      <SelectItem value="dramatic">إضاءة درامية قوية</SelectItem>
                      <SelectItem value="soft">إضاءة ناعمة رومانسية</SelectItem>
                      <SelectItem value="natural">إضاءة طبيعية دافئة</SelectItem>
                      <SelectItem value="studio">إضاءة استوديو احترافية</SelectItem>
                      <SelectItem value="sunset">إضاءة غروب ذهبية</SelectItem>
                      <SelectItem value="neon">إضاءة نيون عصرية</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>شدة الإضاءة: {backgroundSettings.lightIntensity}%</Label>
                      <Slider
                        value={[backgroundSettings.lightIntensity]}
                        onValueChange={([value]) => updateBackgroundSetting('lightIntensity', value)}
                        max={100}
                        min={0}
                        step={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>لون الإضاءة</Label>
                      <Input
                        type="color"
                        value={backgroundSettings.lightColor}
                        onChange={(e) => updateBackgroundSetting('lightColor', e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>زاوية الإضاءة: {backgroundSettings.lightAngle}°</Label>
                      <Slider
                        value={[backgroundSettings.lightAngle]}
                        onValueChange={([value]) => updateBackgroundSetting('lightAngle', value)}
                        max={360}
                        min={0}
                        step={15}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* طبقة التراكب */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">طبقة التراكب المتطورة</Label>
                <Switch
                  checked={backgroundSettings.overlayEnabled}
                  onCheckedChange={(enabled) => updateBackgroundSetting('overlayEnabled', enabled)}
                />
              </div>

              {backgroundSettings.overlayEnabled && (
                <div className="space-y-4 pt-2 border-t">
                  <Select 
                    value={backgroundSettings.overlayTexture} 
                    onValueChange={(value: BackgroundImageSettings['overlayTexture']) => updateBackgroundSetting('overlayTexture', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="noise">ضوضاء رقمية فنية</SelectItem>
                      <SelectItem value="grain">حبيبات فيلم كلاسيكية</SelectItem>
                      <SelectItem value="paper">ملمس ورق طبيعي</SelectItem>
                      <SelectItem value="fabric">نسيج قماش راقي</SelectItem>
                      <SelectItem value="metal">ملمس معدني عصري</SelectItem>
                      <SelectItem value="glass">زجاج شفاف أنيق</SelectItem>
                      <SelectItem value="concrete">خرسانة صناعية حديثة</SelectItem>
                      <SelectItem value="wood">خشب طبيعي دافئ</SelectItem>
                      <SelectItem value="marble">رخام فخم راقي</SelectItem>
                      <SelectItem value="leather">جلد طبيعي أصيل</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>شدة التراكب: {backgroundSettings.overlayIntensity}%</Label>
                      <Slider
                        value={[backgroundSettings.overlayIntensity]}
                        onValueChange={([value]) => updateBackgroundSetting('overlayIntensity', value)}
                        max={100}
                        min={0}
                        step={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>نمط المزج</Label>
                      <Select 
                        value={backgroundSettings.overlayBlendMode} 
                        onValueChange={(value: BackgroundImageSettings['overlayBlendMode']) => updateBackgroundSetting('overlayBlendMode', value)}
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
                          <SelectItem value="darken">تغميق</SelectItem>
                          <SelectItem value="lighten">تفتيح</SelectItem>
                          <SelectItem value="color-burn">حرق لوني</SelectItem>
                          <SelectItem value="color-dodge">تفاديي لوني</SelectItem>
                          <SelectItem value="screen">شاشة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* تبويبة خصائص الصورة */}
          <TabsContent value="image" className="space-y-6">
            {/* أزرار التحويل السريع */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <FlipHorizontal className="h-5 w-5 text-primary" />
                تحويل الصورة السريع
              </Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={imageProperties.flipHorizontal ? "default" : "outline"}
                  onClick={() => updateImageProperty('flipHorizontal', !imageProperties.flipHorizontal)}
                >
                  <FlipHorizontal className="h-4 w-4 mr-2" />
                  قلب أفقي
                </Button>
                <Button
                  size="sm"
                  variant={imageProperties.flipVertical ? "default" : "outline"}
                  onClick={() => updateImageProperty('flipVertical', !imageProperties.flipVertical)}
                >
                  <FlipVertical className="h-4 w-4 mr-2" />
                  قلب عمودي
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateImageProperty('rotation', (imageProperties.rotation + 90) % 360)}
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  دوران 90°
                </Button>
              </div>
            </div>

            {/* الموضع والحجم */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Move className="h-5 w-5 text-primary" />
                الموضع والحجم
              </Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>الموضع الأفقي: {imageProperties.positionX}%</Label>
                  <Slider
                    value={[imageProperties.positionX]}
                    onValueChange={([value]) => updateImageProperty('positionX', value)}
                    max={200}
                    min={-100}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الموضع العمودي: {imageProperties.positionY}%</Label>
                  <Slider
                    value={[imageProperties.positionY]}
                    onValueChange={([value]) => updateImageProperty('positionY', value)}
                    max={200}
                    min={-100}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>حجم الصورة: {imageProperties.scale}%</Label>
                  <Slider
                    value={[imageProperties.scale]}
                    onValueChange={([value]) => updateImageProperty('scale', value)}
                    max={200}
                    min={25}
                    step={5}
                  />
                </div>
              </div>
            </div>

            {/* الفلاتر المتقدمة */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">فلاتر الصورة المتقدمة</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>السطوع: {imageProperties.brightness}%</Label>
                  <Slider
                    value={[imageProperties.brightness]}
                    onValueChange={([value]) => updateImageProperty('brightness', value)}
                    max={200}
                    min={0}
                    step={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>التباين: {imageProperties.contrast}%</Label>
                  <Slider
                    value={[imageProperties.contrast]}
                    onValueChange={([value]) => updateImageProperty('contrast', value)}
                    max={200}
                    min={0}
                    step={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>التشبع: {imageProperties.saturation}%</Label>
                  <Slider
                    value={[imageProperties.saturation]}
                    onValueChange={([value]) => updateImageProperty('saturation', value)}
                    max={200}
                    min={0}
                    step={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>درجة اللون: {imageProperties.hue}°</Label>
                  <Slider
                    value={[imageProperties.hue]}
                    onValueChange={([value]) => updateImageProperty('hue', value)}
                    max={360}
                    min={0}
                    step={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الضبابية: {imageProperties.blur}px</Label>
                  <Slider
                    value={[imageProperties.blur]}
                    onValueChange={([value]) => updateImageProperty('blur', value)}
                    max={20}
                    min={0}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الشفافية: {imageProperties.opacity}%</Label>
                  <Slider
                    value={[imageProperties.opacity]}
                    onValueChange={([value]) => updateImageProperty('opacity', value)}
                    max={100}
                    min={0}
                    step={5}
                  />
                </div>
              </div>
            </div>

            {/* تأثيرات الصورة المتخصصة */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">تأثيرات الصورة المتخصصة</Label>
              <Select 
                value={imageProperties.imageEffect} 
                onValueChange={(value: ImageProperties['imageEffect']) => updateImageProperty('imageEffect', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون تأثير</SelectItem>
                  <SelectItem value="vintage">طراز عتيق كلاسيكي</SelectItem>
                  <SelectItem value="cinematic">سينمائي احترافي</SelectItem>
                  <SelectItem value="dramatic">درامي قوي</SelectItem>
                  <SelectItem value="soft">ناعم رومانسي</SelectItem>
                  <SelectItem value="sharp">حاد وواضح</SelectItem>
                  <SelectItem value="warm">دافئ مريح</SelectItem>
                  <SelectItem value="cool">بارد عصري</SelectItem>
                  <SelectItem value="high-contrast">تباين عالي</SelectItem>
                  <SelectItem value="dreamy">حالم شاعري</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* الشفافية المتقدمة */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">شفافية متقدمة</Label>
                <Switch
                  checked={imageProperties.advancedOpacityEnabled}
                  onCheckedChange={(enabled) => updateImageProperty('advancedOpacityEnabled', enabled)}
                />
              </div>

              {imageProperties.advancedOpacityEnabled && (
                <div className="space-y-4 pt-2 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>شكل الشفافية</Label>
                      <Select 
                        value={imageProperties.opacityShape} 
                        onValueChange={(value: ImageProperties['opacityShape']) => updateImageProperty('opacityShape', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="circle">دائري كلاسيكي</SelectItem>
                          <SelectItem value="rectangle">مستطيل هندسي</SelectItem>
                          <SelectItem value="ellipse">بيضاوي أنيق</SelectItem>
                          <SelectItem value="diagonal">قطري عصري</SelectItem>
                          <SelectItem value="radial">شعاعي متدرج</SelectItem>
                          <SelectItem value="linear">خطي بسيط</SelectItem>
                          <SelectItem value="custom">مخصص فني</SelectItem>
                          <SelectItem value="feathered">ناعم منسدل</SelectItem>
                          <SelectItem value="mask">قناع احترافي</SelectItem>
                          <SelectItem value="gradient">تدرج متطور</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>نمط الشفافية</Label>
                      <Select 
                        value={imageProperties.opacityPattern} 
                        onValueChange={(value: ImageProperties['opacityPattern']) => updateImageProperty('opacityPattern', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="smooth">ناعم انسيابي</SelectItem>
                          <SelectItem value="sharp">حاد محدد</SelectItem>
                          <SelectItem value="feathered">ناعم متدرج</SelectItem>
                          <SelectItem value="organic">عضوي طبيعي</SelectItem>
                          <SelectItem value="geometric">هندسي منتظم</SelectItem>
                          <SelectItem value="artistic">فني إبداعي</SelectItem>
                          <SelectItem value="random">عشوائي متنوع</SelectItem>
                          <SelectItem value="structured">منظم مرتب</SelectItem>
                          <SelectItem value="flowing">متدفق سلس</SelectItem>
                          <SelectItem value="precise">دقيق محكم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* تبويبة تخطيط المساحة */}
          <TabsContent value="layout" className="space-y-6">
            {/* نوع التخطيط */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Shapes className="h-5 w-5 text-primary" />
                نوع التخطيط المتطور
              </Label>
              <Select 
                value={layoutSettings.layoutType} 
                onValueChange={(value: LayoutSpaceSettings['layoutType']) => updateLayoutSetting('layoutType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rectangle">مستطيل كلاسيكي</SelectItem>
                  <SelectItem value="triangle">مثلث هندسي</SelectItem>
                  <SelectItem value="trapezoid">شبه منحرف عصري</SelectItem>
                  <SelectItem value="half-triangle">نصف مثلث فني</SelectItem>
                  <SelectItem value="half-trapezoid">نصف شبه منحرف</SelectItem>
                  <SelectItem value="half-circle">نصف دائرة أنيق</SelectItem>
                  <SelectItem value="half-ellipse">نصف بيضاوي راقي</SelectItem>
                  <SelectItem value="diamond">معين بلوري</SelectItem>
                  <SelectItem value="hexagon">سداسي هندسي</SelectItem>
                  <SelectItem value="pentagon">خماسي متوازن</SelectItem>
                  <SelectItem value="octagon">ثماني متقدم</SelectItem>
                  <SelectItem value="star">نجمة مميزة</SelectItem>
                  <SelectItem value="heart">قلب رومانسي</SelectItem>
                  <SelectItem value="custom">مخصص إبداعي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* نوع الهوامش */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">نوع الهوامش المتطور</Label>
              <Select 
                value={layoutSettings.marginType} 
                onValueChange={(value: LayoutSpaceSettings['marginType']) => updateLayoutSetting('marginType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uniform">موحد متوازن</SelectItem>
                  <SelectItem value="variable">متغير ديناميكي</SelectItem>
                  <SelectItem value="dynamic">ديناميكي تفاعلي</SelectItem>
                  <SelectItem value="responsive">متجاوب ذكي</SelectItem>
                  <SelectItem value="artistic">فني إبداعي</SelectItem>
                  <SelectItem value="geometric">هندسي منتظم</SelectItem>
                  <SelectItem value="organic">عضوي طبيعي</SelectItem>
                  <SelectItem value="minimal">بسيط أنيق</SelectItem>
                  <SelectItem value="dramatic">درامي قوي</SelectItem>
                  <SelectItem value="balanced">متوازن احترافي</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الهامش العلوي: {layoutSettings.topMargin}px</Label>
                  <Slider
                    value={[layoutSettings.topMargin]}
                    onValueChange={([value]) => updateLayoutSetting('topMargin', value)}
                    max={100}
                    min={0}
                    step={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الهامش السفلي: {layoutSettings.bottomMargin}px</Label>
                  <Slider
                    value={[layoutSettings.bottomMargin]}
                    onValueChange={([value]) => updateLayoutSetting('bottomMargin', value)}
                    max={100}
                    min={0}
                    step={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الهامش الأيسر: {layoutSettings.leftMargin}px</Label>
                  <Slider
                    value={[layoutSettings.leftMargin]}
                    onValueChange={([value]) => updateLayoutSetting('leftMargin', value)}
                    max={100}
                    min={0}
                    step={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الهامش الأيمن: {layoutSettings.rightMargin}px</Label>
                  <Slider
                    value={[layoutSettings.rightMargin]}
                    onValueChange={([value]) => updateLayoutSetting('rightMargin', value)}
                    max={100}
                    min={0}
                    step={5}
                  />
                </div>
              </div>
            </div>

            {/* توزيع النص */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">توزيع النص المتطور</Label>
              <Select 
                value={layoutSettings.textDistribution} 
                onValueChange={(value: LayoutSpaceSettings['textDistribution']) => updateLayoutSetting('textDistribution', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">مركزي متوازن</SelectItem>
                  <SelectItem value="justified">مبرر احترافي</SelectItem>
                  <SelectItem value="artistic">فني إبداعي</SelectItem>
                  <SelectItem value="dynamic">ديناميكي متحرك</SelectItem>
                  <SelectItem value="flowing">متدفق سلس</SelectItem>
                  <SelectItem value="structured">منظم مرتب</SelectItem>
                  <SelectItem value="minimal">بسيط راقي</SelectItem>
                  <SelectItem value="dramatic">درامي قوي</SelectItem>
                  <SelectItem value="balanced">متوازن متناسق</SelectItem>
                  <SelectItem value="creative">إبداعي متميز</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* تدفق النص */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">تدفق النص المتطور</Label>
              <Select 
                value={layoutSettings.textFlow} 
                onValueChange={(value: LayoutSpaceSettings['textFlow']) => updateLayoutSetting('textFlow', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">عادي بسيط</SelectItem>
                  <SelectItem value="curved">منحني أنيق</SelectItem>
                  <SelectItem value="spiral">حلزوني فني</SelectItem>
                  <SelectItem value="wave">موجي متدفق</SelectItem>
                  <SelectItem value="zigzag">متعرج ديناميكي</SelectItem>
                  <SelectItem value="organic">عضوي طبيعي</SelectItem>
                  <SelectItem value="geometric">هندسي منتظم</SelectItem>
                  <SelectItem value="artistic">فني إبداعي</SelectItem>
                  <SelectItem value="modern">حديث عصري</SelectItem>
                  <SelectItem value="classic">كلاسيكي راقي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* المحاذاة المتقدمة */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">المحاذاة المتقدمة</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>المحاذاة الأفقية</Label>
                  <Select 
                    value={layoutSettings.horizontalAlignment} 
                    onValueChange={(value: LayoutSpaceSettings['horizontalAlignment']) => updateLayoutSetting('horizontalAlignment', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">يسار</SelectItem>
                      <SelectItem value="center">وسط</SelectItem>
                      <SelectItem value="right">يمين</SelectItem>
                      <SelectItem value="justified">مبرر</SelectItem>
                      <SelectItem value="distributed">موزع</SelectItem>
                      <SelectItem value="artistic">فني</SelectItem>
                      <SelectItem value="dynamic">ديناميكي</SelectItem>
                      <SelectItem value="flowing">متدفق</SelectItem>
                      <SelectItem value="structured">منظم</SelectItem>
                      <SelectItem value="balanced">متوازن</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>المحاذاة العمودية</Label>
                  <Select 
                    value={layoutSettings.verticalAlignment} 
                    onValueChange={(value: LayoutSpaceSettings['verticalAlignment']) => updateLayoutSetting('verticalAlignment', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">أعلى</SelectItem>
                      <SelectItem value="center">وسط</SelectItem>
                      <SelectItem value="bottom">أسفل</SelectItem>
                      <SelectItem value="distributed">موزع</SelectItem>
                      <SelectItem value="artistic">فني</SelectItem>
                      <SelectItem value="dynamic">ديناميكي</SelectItem>
                      <SelectItem value="flowing">متدفق</SelectItem>
                      <SelectItem value="structured">منظم</SelectItem>
                      <SelectItem value="balanced">متوازن</SelectItem>
                      <SelectItem value="responsive">متجاوب</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* إعدادات التباعد */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">إعدادات التباعد المتقدمة</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الحشو الداخلي: {layoutSettings.innerPadding}px</Label>
                  <Slider
                    value={[layoutSettings.innerPadding]}
                    onValueChange={([value]) => updateLayoutSetting('innerPadding', value)}
                    max={50}
                    min={0}
                    step={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>تباعد العناصر: {layoutSettings.elementSpacing}px</Label>
                  <Slider
                    value={[layoutSettings.elementSpacing]}
                    onValueChange={([value]) => updateLayoutSetting('elementSpacing', value)}
                    max={30}
                    min={0}
                    step={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>تباعد الأسطر: {layoutSettings.lineSpacing}</Label>
                  <Slider
                    value={[layoutSettings.lineSpacing]}
                    onValueChange={([value]) => updateLayoutSetting('lineSpacing', value)}
                    max={3}
                    min={0.8}
                    step={0.1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>تباعد الفقرات: {layoutSettings.paragraphSpacing}px</Label>
                  <Slider
                    value={[layoutSettings.paragraphSpacing]}
                    onValueChange={([value]) => updateLayoutSetting('paragraphSpacing', value)}
                    max={50}
                    min={0}
                    step={2}
                  />
                </div>
              </div>
            </div>

            {/* الإعدادات الذكية */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">الإعدادات الذكية</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>الوعي بالشكل</Label>
                  <Switch
                    checked={layoutSettings.shapeAware}
                    onCheckedChange={(enabled) => updateLayoutSetting('shapeAware', enabled)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>التدفق حول العناصر</Label>
                  <Switch
                    checked={layoutSettings.flowAroundElements}
                    onCheckedChange={(enabled) => updateLayoutSetting('flowAroundElements', enabled)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>التخطيط التكيفي</Label>
                  <Switch
                    checked={layoutSettings.adaptiveLayout}
                    onCheckedChange={(enabled) => updateLayoutSetting('adaptiveLayout', enabled)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>منطقة الحافة: {layoutSettings.edgeBuffer}px</Label>
                  <Slider
                    value={[layoutSettings.edgeBuffer]}
                    onValueChange={([value]) => updateLayoutSetting('edgeBuffer', value)}
                    max={50}
                    min={0}
                    step={2}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};