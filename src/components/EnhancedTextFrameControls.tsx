import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Type, RotateCcw, Palette, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FrameSettings } from "./FrameCustomizer";

interface EnhancedTextFrameControlsProps {
  frameSettings: FrameSettings;
  onUpdate: (settings: FrameSettings) => void;
}

const defaultFrameSettings: FrameSettings = {
  showFrame: false,
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  borderColor: '#ffffff',
  borderWidth: 2,
  borderRadius: 12,
  padding: 20,
  opacity: 30,
  shadowColor: 'rgba(0, 0, 0, 0.5)',
  shadowBlur: 10,
  shadowOffsetX: 0,
  shadowOffsetY: 4,
  borderStyle: 'solid',
  textFrameEnabled: true,
  textFrameBackground: 'rgba(0, 0, 0, 0.4)',
  textFrameOpacity: 40,
  textFrameBorderColor: '#ffffff',
  textFrameBorderWidth: 1,
  textFrameBorderRadius: 8,
  textFramePadding: 15,
  textFrameShadowColor: 'rgba(0, 0, 0, 0.6)',
  textFrameShadowBlur: 8,
  textFrameShadowOffsetX: 0,
  textFrameShadowOffsetY: 2,
  textFrameBorderStyle: 'solid',
  textFrameBlur: 10,
  textFramePosition: 'center',
  textFrameWidth: 80,
  textFrameHeight: 60,
  textAlignment: 'center',
  customFrameWidth: 90,
  customFrameHeight: 70,
  // تدرج خلفية إطار النص
  textFrameGradientEnabled: false,
  textFrameGradientDirection: 45,
  textFrameGradientStart: '#000000',
  textFrameGradientEnd: '#333333',
  textFrameGradientStops: 2,
  textFrameGradientStartOpacity: 40,
  textFrameGradientEndOpacity: 20,
  textFrameGradientStartPosition: 0,
  textFrameGradientEndPosition: 100,
  textFrameGradientType: 'linear'
};

export const EnhancedTextFrameControls = ({
  frameSettings,
  onUpdate
}: EnhancedTextFrameControlsProps) => {
  
  const updateFrameSetting = <K extends keyof FrameSettings>(
    key: K,
    value: FrameSettings[K]
  ) => {
    const newSettings = { ...frameSettings, [key]: value };
    onUpdate(newSettings);
  };

  const resetToDefaults = () => {
    onUpdate(defaultFrameSettings);
  };

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
  };

  const applyGradientPreset = (gradientType: string) => {
    const gradients = {
      'ocean': {
        textFrameBackground: 'linear-gradient(135deg, rgba(72, 202, 228, 0.8), rgba(0, 123, 191, 0.8))',
        textFrameBorderColor: '#4FC3F7'
      },
      'sunset': {
        textFrameBackground: 'linear-gradient(135deg, rgba(255, 94, 77, 0.8), rgba(255, 154, 0, 0.8))',
        textFrameBorderColor: '#FF6B35'
      },
      'forest': {
        textFrameBackground: 'linear-gradient(135deg, rgba(76, 175, 80, 0.8), rgba(139, 195, 74, 0.8))',
        textFrameBorderColor: '#66BB6A'
      },
      'night': {
        textFrameBackground: 'linear-gradient(135deg, rgba(63, 81, 181, 0.8), rgba(48, 63, 159, 0.8))',
        textFrameBorderColor: '#5C6BC0'
      },
      'gold': {
        textFrameBackground: 'linear-gradient(135deg, rgba(255, 193, 7, 0.8), rgba(255, 152, 0, 0.8))',
        textFrameBorderColor: '#FFB74D'
      }
    };
    
    const gradient = gradients[gradientType as keyof typeof gradients];
    if (gradient) {
      updateFrameSetting('textFrameBackground', gradient.textFrameBackground);
      updateFrameSetting('textFrameBorderColor', gradient.textFrameBorderColor);
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-primary flex items-center gap-2">
          <Type className="h-5 w-5" />
          إطار النص المتقدم
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
        {/* تفعيل إطار النص */}
        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
          <div className="space-y-1">
            <Label className="font-medium">تفعيل إطار النص المخصص</Label>
            <p className="text-sm text-muted-foreground">إطار مخصص يظهر خلف النص لتحسين وضوحه</p>
          </div>
          <Switch
            checked={frameSettings.textFrameEnabled}
            onCheckedChange={(value) => updateFrameSetting("textFrameEnabled", value)}
          />
        </div>

        {frameSettings.textFrameEnabled && (
          <Tabs defaultValue="background" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="background" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                الخلفية
              </TabsTrigger>
              <TabsTrigger value="gradients" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                التدرجات
              </TabsTrigger>
              <TabsTrigger value="effects" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                التأثيرات
              </TabsTrigger>
            </TabsList>

            <TabsContent value="background" className="space-y-6">
              {/* ألوان الخلفية الأساسية */}
              <div className="space-y-4">
                <Label className="font-medium">ألوان الخلفية الأساسية</Label>
                
                {/* لون خلفية أساسي */}
                <div className="space-y-2">
                  <Label>اللون الأساسي</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={frameSettings.textFrameBackground.includes("rgba") ? "#000000" : frameSettings.textFrameBackground}
                      onChange={(e) => updateFrameSetting("textFrameBackground", e.target.value)}
                      className="h-12 w-20"
                    />
                    <Button
                      variant="outline"
                      onClick={() => updateFrameSetting("textFrameBackground", hexToRgba(frameSettings.textFrameBackground.includes("rgba") ? "#000000" : frameSettings.textFrameBackground, frameSettings.textFrameOpacity))}
                      className="flex-1"
                    >
                      تطبيق مع الشفافية
                    </Button>
                  </div>
                </div>

                {/* ألوان سريعة */}
                <div className="space-y-2">
                  <Label>ألوان سريعة</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {['#000000', '#ffffff', '#ff4444', '#44ff44', '#4444ff', '#ffff44'].map((color) => (
                      <Button
                        key={color}
                        variant="outline"
                        className="h-10 p-1"
                        style={{ backgroundColor: color }}
                        onClick={() => updateFrameSetting("textFrameBackground", hexToRgba(color, frameSettings.textFrameOpacity))}
                      >
                        <span className="sr-only">{color}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* شفافية الخلفية */}
                <div className="space-y-2">
                  <Label>شفافية الخلفية: {frameSettings.textFrameOpacity}%</Label>
                  <Slider
                    value={[frameSettings.textFrameOpacity]}
                    onValueChange={([value]) => updateFrameSetting("textFrameOpacity", value)}
                    min={0}
                    max={90}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gradients" className="space-y-6">
              {/* تدرجات جاهزة */}
              <div className="space-y-4">
                <Label className="font-medium">تدرجات جاهزة</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => applyGradientPreset('ocean')}
                    className="h-12"
                    style={{ background: 'linear-gradient(135deg, #48CAE4, #007BBF)' }}
                  >
                    محيط
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => applyGradientPreset('sunset')}
                    className="h-12"
                    style={{ background: 'linear-gradient(135deg, #FF5E4D, #FF9A00)' }}
                  >
                    غروب
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => applyGradientPreset('forest')}
                    className="h-12"
                    style={{ background: 'linear-gradient(135deg, #4CAF50, #8BC34A)' }}
                  >
                    غابة
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => applyGradientPreset('night')}
                    className="h-12"
                    style={{ background: 'linear-gradient(135deg, #3F51B5, #303F9F)' }}
                  >
                    ليل
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => applyGradientPreset('gold')}
                    className="h-12 col-span-2"
                    style={{ background: 'linear-gradient(135deg, #FFC107, #FF9800)' }}
                  >
                    ذهبي
                  </Button>
                </div>

                {/* تدرج مخصص */}
                <div className="space-y-3">
                  <Label className="font-medium">تدرج مخصص</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>لون البداية</Label>
                      <Input
                        type="color"
                        defaultValue="#000000"
                        onChange={(e) => {
                          const gradient = `linear-gradient(135deg, ${hexToRgba(e.target.value, frameSettings.textFrameOpacity)}, ${hexToRgba('#333333', frameSettings.textFrameOpacity)})`;
                          updateFrameSetting("textFrameBackground", gradient);
                        }}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>لون النهاية</Label>
                      <Input
                        type="color"
                        defaultValue="#333333"
                        onChange={(e) => {
                          const gradient = `linear-gradient(135deg, ${hexToRgba('#000000', frameSettings.textFrameOpacity)}, ${hexToRgba(e.target.value, frameSettings.textFrameOpacity)})`;
                          updateFrameSetting("textFrameBackground", gradient);
                        }}
                        className="h-12"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="effects" className="space-y-6">
              {/* حدود النص */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>لون حدود النص</Label>
                  <Input
                    type="color"
                    value={frameSettings.textFrameBorderColor}
                    onChange={(e) => updateFrameSetting("textFrameBorderColor", e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label>نمط حدود النص</Label>
                  <Select value={frameSettings.textFrameBorderStyle} onValueChange={(value: any) => updateFrameSetting("textFrameBorderStyle", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">مصمت</SelectItem>
                      <SelectItem value="dashed">متقطع</SelectItem>
                      <SelectItem value="dotted">نقطي</SelectItem>
                      <SelectItem value="double">مزدوج</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* إعدادات الحدود والزوايا */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>سمك حدود النص: {frameSettings.textFrameBorderWidth}px</Label>
                  <Slider
                    value={[frameSettings.textFrameBorderWidth]}
                    onValueChange={([value]) => updateFrameSetting("textFrameBorderWidth", value)}
                    min={0}
                    max={8}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>انحناء زوايا النص: {frameSettings.textFrameBorderRadius}px</Label>
                  <Slider
                    value={[frameSettings.textFrameBorderRadius]}
                    onValueChange={([value]) => updateFrameSetting("textFrameBorderRadius", value)}
                    min={0}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>حشو النص: {frameSettings.textFramePadding}px</Label>
                  <Slider
                    value={[frameSettings.textFramePadding]}
                    onValueChange={([value]) => updateFrameSetting("textFramePadding", value)}
                    min={5}
                    max={40}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* أبعاد الإطار */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>عرض إطار النص: {frameSettings.textFrameWidth}%</Label>
                  <Slider
                    value={[frameSettings.textFrameWidth]}
                    onValueChange={([value]) => updateFrameSetting("textFrameWidth", value)}
                    min={30}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>ارتفاع إطار النص: {frameSettings.textFrameHeight}%</Label>
                  <Slider
                    value={[frameSettings.textFrameHeight]}
                    onValueChange={([value]) => updateFrameSetting("textFrameHeight", value)}
                    min={20}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>

              {/* إعدادات ظل إطار النص */}
              <div className="space-y-4">
                <Label className="font-medium">إعدادات ظل إطار النص</Label>
                
                <div className="space-y-2">
                  <Label>لون ظل النص</Label>
                  <Input
                    type="color"
                    value={frameSettings.textFrameShadowColor.includes("rgba") ? "#000000" : frameSettings.textFrameShadowColor}
                    onChange={(e) => updateFrameSetting("textFrameShadowColor", e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>ضبابية ظل النص: {frameSettings.textFrameShadowBlur}px</Label>
                    <Slider
                      value={[frameSettings.textFrameShadowBlur]}
                      onValueChange={([value]) => updateFrameSetting("textFrameShadowBlur", value)}
                      min={0}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>إزاحة الظل أفقياً: {frameSettings.textFrameShadowOffsetX}px</Label>
                    <Slider
                      value={[frameSettings.textFrameShadowOffsetX]}
                      onValueChange={([value]) => updateFrameSetting("textFrameShadowOffsetX", value)}
                      min={-15}
                      max={15}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>إزاحة الظل عمودياً: {frameSettings.textFrameShadowOffsetY}px</Label>
                    <Slider
                      value={[frameSettings.textFrameShadowOffsetY]}
                      onValueChange={([value]) => updateFrameSetting("textFrameShadowOffsetY", value)}
                      min={-15}
                      max={15}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* تمويه الخلفية */}
              <div className="space-y-2">
                <Label>تمويه خلفية النص: {frameSettings.textFrameBlur}px</Label>
                <Slider
                  value={[frameSettings.textFrameBlur]}
                  onValueChange={([value]) => updateFrameSetting("textFrameBlur", value)}
                  min={0}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};