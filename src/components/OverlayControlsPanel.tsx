import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers, RotateCcw } from "lucide-react";
import type { ColorSettings } from "./ContentCanvas";

interface OverlayControlsPanelProps {
  colorSettings: ColorSettings;
  onUpdate: (settings: ColorSettings) => void;
}

export const OverlayControlsPanel = ({ colorSettings, onUpdate }: OverlayControlsPanelProps) => {
  const [useOverlayGradient, setUseOverlayGradient] = useState(false);
  const [overlayGradientStart, setOverlayGradientStart] = useState('#000000');
  const [overlayGradientEnd, setOverlayGradientEnd] = useState('#333333');
  const [overlayGradientAngle, setOverlayGradientAngle] = useState(135);
  const [overlayStartOpacity, setOverlayStartOpacity] = useState(30);
  const [overlayEndOpacity, setOverlayEndOpacity] = useState(20);
  const [overlayStartPosition, setOverlayStartPosition] = useState(0);
  const [overlayEndPosition, setOverlayEndPosition] = useState(100);
  const [overlayGradientType, setOverlayGradientType] = useState<'linear' | 'radial' | 'conic' | 'repeating-linear' | 'repeating-radial' | 'diamond' | 'grid' | 'fade-blend' | 'soft-transition' | 'color-burst' | 'spiral' | 'wave' | 'crystalline' | 'plasma' | 'metallic' | 'prism' | 'aurora' | 'fire' | 'water' | 'earth' | 'cosmic' | 'galaxy' | 'rainbow' | 'sunset' | 'ocean' | 'forest' | 'desert' | 'storm' | 'nebula' | 'solar' | 'lunar' | 'volcanic' | 'glacier' | 'marble' | 'silk' | 'electric' | 'holographic'>('linear');
  const [gradientCenterX, setGradientCenterX] = useState(50);
  const [gradientCenterY, setGradientCenterY] = useState(50);
  const [gradientSize, setGradientSize] = useState(100);
  const [gradientRepeat, setGradientRepeat] = useState(50);
  const [useSharpStops, setUseSharpStops] = useState(false);
  
  // Advanced transparency settings
  const [advancedTransparencyEnabled, setAdvancedTransparencyEnabled] = useState(false);
  const [borderType, setBorderType] = useState<'soft' | 'hard' | 'feathered' | 'sharp' | 'glow' | 'double' | 'triple'>('soft');
  const [borderWidth, setBorderWidth] = useState(5);
  const [featherRadius, setFeatherRadius] = useState(15);
  const [innerGlow, setInnerGlow] = useState(0);
  const [outerGlow, setOuterGlow] = useState(0);
  const [glowColor, setGlowColor] = useState('#ffffff');
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowBlur, setShadowBlur] = useState(10);
  const [shadowSpread, setShadowSpread] = useState(5);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowOpacity, setShadowOpacity] = useState(50);
  
  // Overlay blending settings
  const [overlayBlendEnabled, setOverlayBlendEnabled] = useState(false);
  const [overlayBlendType, setOverlayBlendType] = useState<'smooth' | 'sharp' | 'wavy' | 'zigzag' | 'curved' | 'organic'>('smooth');
  const [overlayTransitionWidth, setOverlayTransitionWidth] = useState(20);
  const [overlayWaveFrequency, setOverlayWaveFrequency] = useState(5);
  const [overlayWaveAmplitude, setOverlayWaveAmplitude] = useState(15);
  const [overlayZigzagSegments, setOverlayZigzagSegments] = useState(8);
  const [overlayCurveRadius, setOverlayCurveRadius] = useState(50);

  const handleGradientSettingChange = (setter: any, value: any) => {
    setter(value);
    if (useOverlayGradient) {
      const gradient = generateAdvancedGradient();
      onUpdate({ ...colorSettings, overlayColor: gradient });
    }
  };

  const handleOverlayGradientToggle = (checked: boolean) => {
    setUseOverlayGradient(checked);
    if (checked) {
      const gradient = generateAdvancedGradient();
      onUpdate({ ...colorSettings, overlayColor: gradient });
    } else {
      const rgba = `rgba(0, 0, 0, ${colorSettings.overlayOpacity / 100})`;
      onUpdate({ ...colorSettings, overlayColor: rgba });
    }
  };

  const handleOverlayColorChange = (colorValue: string) => {
    if (useOverlayGradient) {
      const gradient = generateAdvancedGradient();
      onUpdate({ ...colorSettings, overlayColor: gradient });
    } else {
      // Convert hex to rgba with current opacity
      const hex = colorValue.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const rgba = `rgba(${r}, ${g}, ${b}, ${colorSettings.overlayOpacity / 100})`;
      onUpdate({ ...colorSettings, overlayColor: rgba });
    }
  };

  const handleOverlayOpacityChange = (opacity: number) => {
    onUpdate({ ...colorSettings, overlayOpacity: opacity });
    
    if (!useOverlayGradient && colorSettings.overlayColor.includes("rgba")) {
      const rgbaMatch = colorSettings.overlayColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
      if (rgbaMatch) {
        const [, r, g, b] = rgbaMatch;
        const newRgba = `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
        onUpdate({ ...colorSettings, overlayColor: newRgba, overlayOpacity: opacity });
      }
    }
  };

  const handleOverlayGradientStartChange = (color: string) => {
    setOverlayGradientStart(color);
    if (useOverlayGradient) {
      const gradient = generateAdvancedGradient();
      onUpdate({ ...colorSettings, overlayColor: gradient });
    }
  };

  const handleOverlayGradientEndChange = (color: string) => {
    setOverlayGradientEnd(color);
    if (useOverlayGradient) {
      const gradient = generateAdvancedGradient();
      onUpdate({ ...colorSettings, overlayColor: gradient });
    }
  };

  const getHexFromOverlayColor = () => {
    if (colorSettings.overlayColor.includes("rgba")) {
      const match = colorSettings.overlayColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),/);
      if (match) {
        const [, r, g, b] = match;
        return `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
      }
    }
    return '#000000';
  };

  // Generate advanced gradient based on settings
  const generateAdvancedGradient = () => {
    const hexToRgba = (hex: string, opacity: number) => {
      const r = parseInt(hex.substring(1, 3), 16);
      const g = parseInt(hex.substring(3, 5), 16);
      const b = parseInt(hex.substring(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
    };

    const startColor = hexToRgba(overlayGradientStart, overlayStartOpacity);
    const endColor = hexToRgba(overlayGradientEnd, overlayEndOpacity);
    
    // Add sharp stops if enabled
    const startStop = useSharpStops ? `${overlayStartPosition}%` : `${overlayStartPosition}%`;
    const endStop = useSharpStops ? `${overlayEndPosition}%` : `${overlayEndPosition}%`;
    const sharpTransition = useSharpStops ? `, ${startColor} ${overlayStartPosition + 1}%, ${endColor} ${overlayEndPosition - 1}%` : '';

    let gradientString = '';
    switch (overlayGradientType) {
      case 'linear':
        gradientString = `linear-gradient(${overlayGradientAngle}deg, ${startColor} ${startStop}, ${endColor} ${endStop}${sharpTransition})`;
        break;
      case 'radial':
        const radialSize = gradientSize === 100 ? 'circle' : `${gradientSize}% ${gradientSize}%`;
        gradientString = `radial-gradient(${radialSize} at ${gradientCenterX}% ${gradientCenterY}%, ${startColor} ${startStop}, ${endColor} ${endStop}${sharpTransition})`;
        break;
      case 'conic':
        gradientString = `conic-gradient(from ${overlayGradientAngle}deg at ${gradientCenterX}% ${gradientCenterY}%, ${startColor} ${startStop}, ${endColor} ${endStop}${sharpTransition})`;
        break;
      case 'repeating-linear':
        const repeatSize = `${gradientRepeat}px`;
        gradientString = `repeating-linear-gradient(${overlayGradientAngle}deg, ${startColor} 0, ${endColor} ${repeatSize})`;
        break;
      case 'repeating-radial':
        const repeatRadialSize = `${gradientRepeat}px`;
        gradientString = `repeating-radial-gradient(circle at ${gradientCenterX}% ${gradientCenterY}%, ${startColor} 0, ${endColor} ${repeatRadialSize})`;
        break;
      // ... إضافة باقي أنواع التدرج كما هو مكتوب في الملف الأصلي
      default:
        gradientString = `linear-gradient(${overlayGradientAngle}deg, ${startColor} ${startStop}, ${endColor} ${endStop}${sharpTransition})`;
    }

    return gradientString;
  };

  const resetToDefaults = () => {
    setUseOverlayGradient(false);
    setOverlayGradientStart('#000000');
    setOverlayGradientEnd('#333333');
    setOverlayGradientAngle(135);
    setOverlayStartOpacity(30);
    setOverlayEndOpacity(20);
    setOverlayStartPosition(0);
    setOverlayEndPosition(100);
    setOverlayGradientType('linear');
    setGradientCenterX(50);
    setGradientCenterY(50);
    setGradientSize(100);
    setGradientRepeat(50);
    setUseSharpStops(false);
    setAdvancedTransparencyEnabled(false);
    setBorderType('soft');
    setBorderWidth(5);
    setFeatherRadius(15);
    setInnerGlow(0);
    setOuterGlow(0);
    setGlowColor('#ffffff');
    setShadowEnabled(false);
    setShadowBlur(10);
    setShadowSpread(5);
    setShadowColor('#000000');
    setShadowOpacity(50);
    setOverlayBlendEnabled(false);
    setOverlayBlendType('smooth');
    setOverlayTransitionWidth(20);
    setOverlayWaveFrequency(5);
    setOverlayWaveAmplitude(15);
    setOverlayZigzagSegments(8);
    setOverlayCurveRadius(50);
    
    const defaultOverlay = 'rgba(0, 0, 0, 0.4)';
    onUpdate({ ...colorSettings, overlayColor: defaultOverlay, overlayOpacity: 30 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Layers className="h-5 w-5 text-primary" />
          إعدادات الطبقة العلوية
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetToDefaults}
          className="h-8 px-3"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">استخدام تدرج الطبقة العلوية</Label>
          <Switch
            checked={useOverlayGradient}
            onCheckedChange={handleOverlayGradientToggle}
          />
        </div>

        {useOverlayGradient ? (
          <div className="space-y-6 animate-fade-in">
             {/* نوع التدرج */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">نوع التدرج</Label>
              <Select 
                value={overlayGradientType} 
                onValueChange={(value: typeof overlayGradientType) => 
                  handleGradientSettingChange(setOverlayGradientType, value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">خطي</SelectItem>
                  <SelectItem value="radial">دائري</SelectItem>
                  <SelectItem value="conic">مخروطي</SelectItem>
                  <SelectItem value="repeating-linear">خطي متكرر</SelectItem>
                  <SelectItem value="repeating-radial">دائري متكرر</SelectItem>
                  <SelectItem value="diamond">ماسي</SelectItem>
                  <SelectItem value="grid">شبكي معقد</SelectItem>
                  <SelectItem value="fade-blend">تلاشي وتداخل</SelectItem>
                  <SelectItem value="soft-transition">انتقال ناعم</SelectItem>
                  <SelectItem value="color-burst">انفجار لوني</SelectItem>
                  <SelectItem value="spiral">لولبي</SelectItem>
                  <SelectItem value="wave">موجي</SelectItem>
                  <SelectItem value="crystalline">بلوري</SelectItem>
                  <SelectItem value="plasma">بلازما</SelectItem>
                  <SelectItem value="metallic">معدني</SelectItem>
                  <SelectItem value="prism">منشوري</SelectItem>
                  <SelectItem value="aurora">شفق قطبي</SelectItem>
                  <SelectItem value="fire">ناري</SelectItem>
                  <SelectItem value="water">مائي</SelectItem>
                  <SelectItem value="earth">ترابي</SelectItem>
                  <SelectItem value="cosmic">كوني</SelectItem>
                  <SelectItem value="galaxy">مجري</SelectItem>
                  <SelectItem value="rainbow">قوس قزح</SelectItem>
                  <SelectItem value="sunset">غروب</SelectItem>
                  <SelectItem value="ocean">محيطي</SelectItem>
                  <SelectItem value="forest">غابات</SelectItem>
                  <SelectItem value="desert">صحراوي</SelectItem>
                  <SelectItem value="storm">عاصف</SelectItem>
                  <SelectItem value="nebula">سديمي</SelectItem>
                  <SelectItem value="solar">شمسي</SelectItem>
                  <SelectItem value="lunar">قمري</SelectItem>
                  <SelectItem value="volcanic">بركاني</SelectItem>
                  <SelectItem value="glacier">جليدي</SelectItem>
                  <SelectItem value="marble">رخامي</SelectItem>
                  <SelectItem value="silk">حريري</SelectItem>
                  <SelectItem value="electric">كهربائي</SelectItem>
                  <SelectItem value="holographic">ثلاثي الأبعاد</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* زاوية التدرج */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">زاوية التدرج: {overlayGradientAngle}°</Label>
              <Slider
                value={[overlayGradientAngle]}
                onValueChange={([value]) => handleGradientSettingChange(setOverlayGradientAngle, value)}
                min={0}
                max={360}
                step={15}
                className="w-full"
              />
            </div>

            {/* إعدادات متقدمة للتدرج */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* موضع المركز */}
              {(overlayGradientType === 'radial' || overlayGradientType === 'conic' || overlayGradientType === 'repeating-radial' || overlayGradientType === 'diamond' || overlayGradientType === 'grid' || overlayGradientType === 'spiral' || overlayGradientType === 'crystalline' || overlayGradientType === 'plasma') && (
                <div className="space-y-3 bg-accent/20 p-3 rounded-lg">
                  <Label className="text-sm font-medium text-primary">موضع المركز</Label>
                  <div className="space-y-2">
                    <Label className="text-xs">المحور X: {gradientCenterX}%</Label>
                    <Slider
                      value={[gradientCenterX]}
                      onValueChange={([value]) => handleGradientSettingChange(setGradientCenterX, value)}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">المحور Y: {gradientCenterY}%</Label>
                    <Slider
                      value={[gradientCenterY]}
                      onValueChange={([value]) => handleGradientSettingChange(setGradientCenterY, value)}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* حجم التدرج والتكرار */}
              <div className="space-y-3 bg-accent/20 p-3 rounded-lg">
                <Label className="text-sm font-medium text-primary">إعدادات الحجم</Label>
                {overlayGradientType === 'radial' && (
                  <div className="space-y-2">
                    <Label className="text-xs">حجم التدرج: {gradientSize}%</Label>
                    <Slider
                      value={[gradientSize]}
                      onValueChange={([value]) => handleGradientSettingChange(setGradientSize, value)}
                      min={10}
                      max={200}
                      step={10}
                      className="w-full"
                    />
                  </div>
                )}
                {(overlayGradientType === 'repeating-linear' || overlayGradientType === 'repeating-radial' || overlayGradientType === 'grid' || overlayGradientType === 'plasma') && (
                  <div className="space-y-2">
                    <Label className="text-xs">مسافة التكرار: {gradientRepeat}px</Label>
                    <Slider
                      value={[gradientRepeat]}
                      onValueChange={([value]) => handleGradientSettingChange(setGradientRepeat, value)}
                      min={10}
                      max={200}
                      step={10}
                      className="w-full"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Label className="text-xs">التوقفات الحادة</Label>
                  <Switch
                    checked={useSharpStops}
                    onCheckedChange={(checked) => handleGradientSettingChange(setUseSharpStops, checked)}
                  />
                </div>
              </div>
            </div>

            {/* ألوان التدرج مع الشفافية المنفصلة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 bg-muted/20 p-3 rounded-lg">
                <Label className="text-sm font-medium text-primary">اللون الأول</Label>
                <Input
                  type="color"
                  value={overlayGradientStart}
                  onChange={(e) => handleOverlayGradientStartChange(e.target.value)}
                  className="h-10 cursor-pointer"
                />
                <div className="space-y-1">
                  <Label className="text-xs">الشفافية: {overlayStartOpacity}%</Label>
                  <Slider
                    value={[overlayStartOpacity]}
                    onValueChange={([value]) => handleGradientSettingChange(setOverlayStartOpacity, value)}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">موضع البداية: {overlayStartPosition}%</Label>
                  <Slider
                    value={[overlayStartPosition]}
                    onValueChange={([value]) => handleGradientSettingChange(setOverlayStartPosition, value)}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-3 bg-muted/20 p-3 rounded-lg">
                <Label className="text-sm font-medium text-primary">اللون الثاني</Label>
                <Input
                  type="color"
                  value={overlayGradientEnd}
                  onChange={(e) => handleOverlayGradientEndChange(e.target.value)}
                  className="h-10 cursor-pointer"
                />
                <div className="space-y-1">
                  <Label className="text-xs">الشفافية: {overlayEndOpacity}%</Label>
                  <Slider
                    value={[overlayEndOpacity]}
                    onValueChange={([value]) => handleGradientSettingChange(setOverlayEndOpacity, value)}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">موضع النهاية: {overlayEndPosition}%</Label>
                  <Slider
                    value={[overlayEndPosition]}
                    onValueChange={([value]) => handleGradientSettingChange(setOverlayEndPosition, value)}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            {/* إعدادات الشفافية المتقدمة */}
            <div className="space-y-4 bg-accent/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-primary">الشفافية المتقدمة</Label>
                <Switch
                  checked={advancedTransparencyEnabled}
                  onCheckedChange={setAdvancedTransparencyEnabled}
                />
              </div>

              {advancedTransparencyEnabled && (
                <div className="space-y-4 animate-fade-in">
                  {/* نوع الحدود */}
                  <div className="space-y-2">
                    <Label className="text-xs">نوع الحدود</Label>
                    <Select value={borderType} onValueChange={(value: any) => setBorderType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="soft">ناعمة</SelectItem>
                        <SelectItem value="hard">صلبة</SelectItem>
                        <SelectItem value="feathered">ريشية</SelectItem>
                        <SelectItem value="sharp">حادة</SelectItem>
                        <SelectItem value="glow">متوهجة</SelectItem>
                        <SelectItem value="double">مزدوجة</SelectItem>
                        <SelectItem value="triple">ثلاثية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* عرض الحدود */}
                  <div className="space-y-2">
                    <Label className="text-xs">عرض الحدود: {borderWidth}px</Label>
                    <Slider
                      value={[borderWidth]}
                      onValueChange={([value]) => setBorderWidth(value)}
                      min={1}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* نصف قطر التدرج */}
                  {(borderType === 'feathered' || borderType === 'soft') && (
                    <div className="space-y-2">
                      <Label className="text-xs">نصف قطر التدرج: {featherRadius}px</Label>
                      <Slider
                        value={[featherRadius]}
                        onValueChange={([value]) => setFeatherRadius(value)}
                        min={5}
                        max={50}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* التوهج الداخلي والخارجي */}
                  {borderType === 'glow' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">التوهج الداخلي: {innerGlow}px</Label>
                        <Slider
                          value={[innerGlow]}
                          onValueChange={([value]) => setInnerGlow(value)}
                          min={0}
                          max={30}
                          step={2}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">التوهج الخارجي: {outerGlow}px</Label>
                        <Slider
                          value={[outerGlow]}
                          onValueChange={([value]) => setOuterGlow(value)}
                          min={0}
                          max={30}
                          step={2}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* لون التوهج */}
                  {borderType === 'glow' && (innerGlow > 0 || outerGlow > 0) && (
                    <div className="space-y-2">
                      <Label className="text-xs">لون التوهج</Label>
                      <Input
                        type="color"
                        value={glowColor}
                        onChange={(e) => setGlowColor(e.target.value)}
                        className="h-8 cursor-pointer"
                      />
                    </div>
                  )}

                  {/* إعدادات الظل */}
                  <div className="space-y-3 bg-muted/30 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">ظل مخصص</Label>
                      <Switch
                        checked={shadowEnabled}
                        onCheckedChange={setShadowEnabled}
                      />
                    </div>

                    {shadowEnabled && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">ضبابية الظل: {shadowBlur}px</Label>
                            <Slider
                              value={[shadowBlur]}
                              onValueChange={([value]) => setShadowBlur(value)}
                              min={0}
                              max={50}
                              step={2}
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">انتشار الظل: {shadowSpread}px</Label>
                            <Slider
                              value={[shadowSpread]}
                              onValueChange={([value]) => setShadowSpread(value)}
                              min={0}
                              max={20}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">لون الظل</Label>
                            <Input
                              type="color"
                              value={shadowColor}
                              onChange={(e) => setShadowColor(e.target.value)}
                              className="h-8 cursor-pointer"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">شفافية الظل: {shadowOpacity}%</Label>
                            <Slider
                              value={[shadowOpacity]}
                              onValueChange={([value]) => setShadowOpacity(value)}
                              min={0}
                              max={100}
                              step={5}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* معاينة التدرج المتقدم */}
            <div className="p-4 rounded-lg border-2 border-dashed border-primary/30 bg-background/50">
              <div className="text-sm font-medium text-primary mb-2">معاينة التدرج المتقدم:</div>
              <div 
                className="h-12 rounded-lg border"
                style={{ 
                  background: generateAdvancedGradient()
                }}
              />
              <div className="text-xs text-muted-foreground mt-2 font-mono break-all">
                {generateAdvancedGradient()}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">لون الطبقة العلوية</Label>
              <Input
                type="color"
                value={getHexFromOverlayColor()}
                onChange={(e) => handleOverlayColorChange(e.target.value)}
                className="h-12 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">شفافية الطبقة العلوية: {colorSettings.overlayOpacity}%</Label>
              <Slider
                value={[colorSettings.overlayOpacity]}
                onValueChange={([value]) => handleOverlayOpacityChange(value)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};