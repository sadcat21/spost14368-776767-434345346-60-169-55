import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Type, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FrameSettings } from "./FrameCustomizer";

interface AdvancedTextFrameControlsProps {
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

export const AdvancedTextFrameControls = ({
  frameSettings,
  onUpdate
}: AdvancedTextFrameControlsProps) => {
  
  const updateFrameSetting = <K extends keyof FrameSettings>(
    key: K,
    value: FrameSettings[K]
  ) => {
    const newSettings = { ...frameSettings, [key]: value };
    onUpdate(newSettings);
  };

  console.log('AdvancedTextFrameControls rendered with frameSettings:', frameSettings);
  
  const resetToDefaults = () => {
    onUpdate(defaultFrameSettings);
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-primary flex items-center gap-2">
          <Type className="h-5 w-5" />
          إعدادات إطار النص المتقدمة
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
          <div className="space-y-6 bg-muted/30 p-4 rounded-lg animate-fade-in">
            {/* تفعيل تدرج خلفية إطار النص */}
            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
              <div className="space-y-1">
                <Label className="font-medium">تفعيل تدرج خلفية إطار النص</Label>
                <p className="text-sm text-muted-foreground">استخدام تدرج لوني بدلاً من لون واحد لخلفية الإطار</p>
              </div>
              <Switch
                checked={frameSettings.textFrameGradientEnabled}
                onCheckedChange={(value) => updateFrameSetting("textFrameGradientEnabled", value)}
              />
            </div>

            {/* إعدادات الخلفية */}
            {!frameSettings.textFrameGradientEnabled ? (
              <div className="space-y-2">
                <Label>لون خلفية إطار النص</Label>
                <Input
                  type="color"
                  value={frameSettings.textFrameBackground.includes("rgba") ? "#000000" : frameSettings.textFrameBackground}
                  onChange={(e) => updateFrameSetting("textFrameBackground", e.target.value)}
                  className="h-12"
                />
              </div>
            ) : (
              <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                <Label className="font-medium">إعدادات تدرج خلفية إطار النص</Label>
                
                {/* نوع التدرج */}
                <div className="space-y-2">
                  <Label>نوع التدرج</Label>
                  <Select value={frameSettings.textFrameGradientType} onValueChange={(value: any) => updateFrameSetting("textFrameGradientType", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">خطي</SelectItem>
                      <SelectItem value="radial">دائري</SelectItem>
                      <SelectItem value="conic">مخروطي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* ألوان التدرج */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>اللون الأول للتدرج</Label>
                    <Input
                      type="color"
                      value={frameSettings.textFrameGradientStart}
                      onChange={(e) => updateFrameSetting("textFrameGradientStart", e.target.value)}
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>اللون الثاني للتدرج</Label>
                    <Input
                      type="color"
                      value={frameSettings.textFrameGradientEnd}
                      onChange={(e) => updateFrameSetting("textFrameGradientEnd", e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>

                {/* شفافية الألوان */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الشفافية: اللون الأول ({frameSettings.textFrameGradientStartOpacity}%)</Label>
                    <Slider
                      value={[frameSettings.textFrameGradientStartOpacity]}
                      onValueChange={([value]) => updateFrameSetting("textFrameGradientStartOpacity", value)}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>الشفافية: اللون الثاني ({frameSettings.textFrameGradientEndOpacity}%)</Label>
                    <Slider
                      value={[frameSettings.textFrameGradientEndOpacity]}
                      onValueChange={([value]) => updateFrameSetting("textFrameGradientEndOpacity", value)}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* مواضع الألوان */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>موضع البداية: اللون الأول ({frameSettings.textFrameGradientStartPosition}%)</Label>
                    <Slider
                      value={[frameSettings.textFrameGradientStartPosition]}
                      onValueChange={([value]) => updateFrameSetting("textFrameGradientStartPosition", value)}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>موضع النهاية: اللون الثاني ({frameSettings.textFrameGradientEndPosition}%)</Label>
                    <Slider
                      value={[frameSettings.textFrameGradientEndPosition]}
                      onValueChange={([value]) => updateFrameSetting("textFrameGradientEndPosition", value)}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* اتجاه وعدد نقاط التدرج */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>اتجاه التدرج: {frameSettings.textFrameGradientDirection}°</Label>
                    <Slider
                      value={[frameSettings.textFrameGradientDirection]}
                      onValueChange={([value]) => updateFrameSetting("textFrameGradientDirection", value)}
                      min={0}
                      max={360}
                      step={15}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>عدد نقاط التدرج: {frameSettings.textFrameGradientStops}</Label>
                    <Slider
                      value={[frameSettings.textFrameGradientStops]}
                      onValueChange={([value]) => updateFrameSetting("textFrameGradientStops", value)}
                      min={2}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* معاينة التدرج */}
                <div className="space-y-2">
                  <Label>معاينة نوع التدرج</Label>
                  <div 
                    className="w-full h-20 rounded-lg border-2 border-border"
                    style={{
                      background: frameSettings.textFrameGradientType === 'linear' 
                        ? `linear-gradient(${frameSettings.textFrameGradientDirection}deg, 
                           ${frameSettings.textFrameGradientStart}${Math.round(frameSettings.textFrameGradientStartOpacity * 2.55).toString(16).padStart(2, '0')} ${frameSettings.textFrameGradientStartPosition}%, 
                           ${frameSettings.textFrameGradientEnd}${Math.round(frameSettings.textFrameGradientEndOpacity * 2.55).toString(16).padStart(2, '0')} ${frameSettings.textFrameGradientEndPosition}%)`
                        : frameSettings.textFrameGradientType === 'radial'
                        ? `radial-gradient(circle, 
                           ${frameSettings.textFrameGradientStart}${Math.round(frameSettings.textFrameGradientStartOpacity * 2.55).toString(16).padStart(2, '0')} ${frameSettings.textFrameGradientStartPosition}%, 
                           ${frameSettings.textFrameGradientEnd}${Math.round(frameSettings.textFrameGradientEndOpacity * 2.55).toString(16).padStart(2, '0')} ${frameSettings.textFrameGradientEndPosition}%)`
                        : `conic-gradient(from ${frameSettings.textFrameGradientDirection}deg, 
                           ${frameSettings.textFrameGradientStart}${Math.round(frameSettings.textFrameGradientStartOpacity * 2.55).toString(16).padStart(2, '0')} ${frameSettings.textFrameGradientStartPosition}%, 
                           ${frameSettings.textFrameGradientEnd}${Math.round(frameSettings.textFrameGradientEndOpacity * 2.55).toString(16).padStart(2, '0')} ${frameSettings.textFrameGradientEndPosition}%)`
                    }}
                  />
                </div>
              </div>
            )}

            {/* شفافية إطار النص */}
            <div className="space-y-2">
              <Label>شفافية إطار النص: {frameSettings.textFrameOpacity}%</Label>
              <Slider
                value={[frameSettings.textFrameOpacity]}
                onValueChange={([value]) => updateFrameSetting("textFrameOpacity", value)}
                min={0}
                max={80}
                step={5}
                className="w-full"
              />
            </div>

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

            {/* موقع الإطار والضبابية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>موقع إطار النص</Label>
                <Select value={frameSettings.textFramePosition} onValueChange={(value: any) => updateFrameSetting("textFramePosition", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">وسط</SelectItem>
                    <SelectItem value="top">أعلى</SelectItem>
                    <SelectItem value="bottom">أسفل</SelectItem>
                    <SelectItem value="left">يسار</SelectItem>
                    <SelectItem value="right">يمين</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ضبابية النص: {frameSettings.textFrameBlur}px</Label>
                <Slider
                  value={[frameSettings.textFrameBlur]}
                  onValueChange={([value]) => updateFrameSetting("textFrameBlur", value)}
                  min={0}
                  max={20}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};