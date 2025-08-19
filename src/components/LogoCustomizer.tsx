import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, ImageIcon, X, Scissors, Loader2, RefreshCw, Undo, Type, Frame, Moon, Settings, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { UnifiedLogoAnalyzer } from "./UnifiedLogoAnalyzer";
import { IntelligentLogoAnalyzer } from "./IntelligentLogoAnalyzer";
import { useMergedPreviewData } from '@/contexts/LivePreviewContext';
// import { removeBackground, loadImage } from "@/utils/backgroundRemover"; // Disabled background removal

export interface LogoSettings {
  logoUrl: string;
  logoSize: number;
  logoPosition: "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";
  logoOpacity: number;
  
  // موضع مخصص للشعار
  customLogoX: number;
  customLogoY: number;
  useCustomLogoPosition: boolean;
  showWatermark: boolean;
  watermarkText: string;
  watermarkOpacity: number;
  watermarkPosition: "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";
  
  // موضع مخصص للعلامة المائية
  customWatermarkX: number;
  customWatermarkY: number;
  useCustomWatermarkPosition: boolean;
  // removeBackground: boolean; // Disabled background removal
  
  // إعدادات تأطير الشعار المتقدمة
  logoFrameEnabled: boolean;
  logoFrameShape: 'none' | 'circle' | 'square' | 'rectangle' | 'diamond' | 'hexagon' | 'octagon' | 'star' | 'heart' | 'rounded-square' | 'oval' | 'shield' | 'pentagon' | 'trapezoid';
  logoFrameColor: string;
  logoFrameOpacity: number;
  logoFramePadding: number;
  logoFrameBorderWidth: number;
  logoFrameBorderColor: string;
  logoFrameBorderStyle: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  logoFrameBorderOpacity: number;
  logoFrameShadowEnabled: boolean;
  logoFrameShadowColor: string;
  logoFrameShadowBlur: number;
  logoFrameShadowOffsetX: number;
  logoFrameShadowOffsetY: number;
  logoFrameRotation: number;
  logoFrameGradientEnabled: boolean;
  logoFrameGradientStart: string;
  logoFrameGradientEnd: string;
  logoFrameGradientDirection: number;
  
  // تحكم في نسب الأبعاد
  logoFrameCustomDimensions: boolean;
  logoFrameWidth: number;
  logoFrameHeight: number;
  logoFrameAspectRatio: 'square' | 'portrait' | 'landscape' | 'custom';
  
  // Advanced watermark settings
  watermarkFontSize: number;
  watermarkFontFamily: string;
  watermarkFontWeight: string;
  watermarkColor: string;
  watermarkRotation: number;
  watermarkFrameEnabled: boolean;
  watermarkFrameColor: string;
  watermarkFrameOpacity: number;
  watermarkFramePadding: number;
  watermarkFrameRadius: number;
  watermarkFrameBorderWidth: number;
  watermarkFrameBorderColor: string;
  watermarkFrameAlignment: 'left' | 'center' | 'right' | 'top' | 'bottom';
  watermarkShadowEnabled: boolean;
  watermarkShadowColor: string;
  watermarkShadowOffsetX: number;
  watermarkShadowOffsetY: number;
  watermarkShadowBlur: number;
  watermarkBlendMode: string;
  watermarkTextTransform: string;
  watermarkLetterSpacing: number;
  watermarkLineHeight: number;
  
  // إعدادات الإطار المتحرك للشعار
  logoFrameAnimationEnabled: boolean;
  logoFrameAnimationType: 'none' | 'pulse' | 'rotate' | 'bounce' | 'float' | 'glow' | 'zoom' | 'shake';
  logoFrameAnimationSpeed: number;
  logoFrameAnimationIntensity: number;
}

interface LogoCustomizerProps {
  onUpdate: (settings: LogoSettings) => void;
  initialSettings?: LogoSettings;
  // props للذكاء الاصطناعي
  currentImageUrl?: string;
  geminiApiKey?: string;
  specialty?: string;
  contentType?: string;
  imageStyle?: string;
  language?: string;
}

const defaultLogoSettings: LogoSettings = {
  logoUrl: "",
  logoSize: 60,
  logoPosition: "bottom-right",
  logoOpacity: 90,
  showWatermark: false,
  watermarkText: "© Your Brand",
  watermarkOpacity: 50,
  watermarkPosition: "bottom-left",
  // removeBackground: false, // Disabled background removal
  
  // إعدادات الموضع المخصص الافتراضية
  customLogoX: 50,
  customLogoY: 50,
  useCustomLogoPosition: false,
  customWatermarkX: 50,
  customWatermarkY: 50,
  useCustomWatermarkPosition: false,
  
  // إعدادات تأطير الشعار الافتراضية
  logoFrameEnabled: false,
  logoFrameShape: 'none',
  logoFrameColor: '#000000',
  logoFrameOpacity: 30,
  logoFramePadding: 10,
  logoFrameBorderWidth: 2,
  logoFrameBorderColor: '#ffffff',
  logoFrameBorderStyle: 'solid',
  logoFrameBorderOpacity: 100,
  logoFrameShadowEnabled: false,
  logoFrameShadowColor: 'rgba(0, 0, 0, 0.5)',
  logoFrameShadowBlur: 8,
  logoFrameShadowOffsetX: 0,
  logoFrameShadowOffsetY: 4,
  logoFrameRotation: 0,
  logoFrameGradientEnabled: false,
  logoFrameGradientStart: '#667eea',
  logoFrameGradientEnd: '#764ba2',
  logoFrameGradientDirection: 45,
  
  // تحكم في نسب الأبعاد
  logoFrameCustomDimensions: false,
  logoFrameWidth: 100,
  logoFrameHeight: 100,
  logoFrameAspectRatio: 'square',
  
  // Advanced watermark defaults
  watermarkFontSize: 12,
  watermarkFontFamily: "Cairo, system-ui, sans-serif",
  watermarkFontWeight: "500",
  watermarkColor: "#ffffff",
  watermarkRotation: 0,
  watermarkFrameEnabled: false,
  watermarkFrameColor: "#000000",
  watermarkFrameOpacity: 30,
  watermarkFramePadding: 8,
  watermarkFrameRadius: 4,
  watermarkFrameBorderWidth: 1,
  watermarkFrameBorderColor: "#ffffff",
  watermarkFrameAlignment: 'center',
  watermarkShadowEnabled: true,
  watermarkShadowColor: "rgba(0, 0, 0, 0.7)",
  watermarkShadowOffsetX: 1,
  watermarkShadowOffsetY: 1,
  watermarkShadowBlur: 2,
  watermarkBlendMode: "normal",
  watermarkTextTransform: "none",
  watermarkLetterSpacing: 0,
  watermarkLineHeight: 1.2,
  
  // إعدادات الإطار المتحرك للشعار  
  logoFrameAnimationEnabled: false,
  logoFrameAnimationType: 'none',
  logoFrameAnimationSpeed: 50,
  logoFrameAnimationIntensity: 50
};

const positions = [
  { value: "top-left", label: "أعلى يسار" },
  { value: "top-center", label: "أعلى وسط" },
  { value: "top-right", label: "أعلى يمين" },
  { value: "center-left", label: "يسار وسط" },
  { value: "center", label: "وسط" },
  { value: "center-right", label: "يمين وسط" },
  { value: "bottom-left", label: "أسفل يسار" },
  { value: "bottom-center", label: "أسفل وسط" },
  { value: "bottom-right", label: "أسفل يمين" }
];

export const LogoCustomizer = ({ 
  onUpdate, 
  initialSettings,
  currentImageUrl,
  geminiApiKey,
  specialty,
  contentType,
  imageStyle,
  language = 'ar'
}: LogoCustomizerProps) => {
  const [settings, setSettings] = useState<LogoSettings>(initialSettings || defaultLogoSettings);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [originalLogoUrl, setOriginalLogoUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update settings when initialSettings change
  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
      if (initialSettings.logoUrl && !originalLogoUrl) {
        setOriginalLogoUrl(initialSettings.logoUrl);
      }
    }
  }, [initialSettings]);

  // حفظ واستعادة الإعدادات
  useEffect(() => {
    const savedSettings = localStorage.getItem('logoCustomizer_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed && !initialSettings) {
          setSettings({ ...defaultLogoSettings, ...parsed });
          if (parsed.logoUrl) {
            setOriginalLogoUrl(parsed.logoUrl);
          }
        }
      } catch (error) {
        console.log('خطأ في استعادة إعدادات الشعار:', error);
      }
    }
  }, [initialSettings]);

  useEffect(() => {
    localStorage.setItem('logoCustomizer_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof LogoSettings>(
    key: K,
    value: LogoSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('logoCustomizer_settings', JSON.stringify(newSettings));
    onUpdate(newSettings);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الملف كبير جداً. يرجى اختيار صورة أصغر من 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setOriginalLogoUrl(result);
        const newSettings = {
          ...settings,
          logoUrl: result
        };
        setSettings(newSettings);
        localStorage.setItem('logoCustomizer_settings', JSON.stringify(newSettings));
        onUpdate(newSettings);
        toast.success("تم رفع الشعار بنجاح!");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <ImageIcon className="h-5 w-5" />
          الشعار والعلامة المائية مع التأطير المتقدم
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Upload */}
        <div className="space-y-4">
          <Label>رفع الشعار</Label>
          {settings.logoUrl ? (
            <div className="relative">
              <div className="flex items-center gap-4">
                <img 
                  src={settings.logoUrl} 
                  alt="Logo preview" 
                  className="w-20 h-20 object-contain border rounded-lg bg-white/10"
                />
                <div className="flex flex-col gap-2">
                  <Button
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      const newSettings = { ...settings, logoUrl: "" };
                      setSettings(newSettings);
                      localStorage.setItem('logoCustomizer_settings', JSON.stringify(newSettings));
                      onUpdate(newSettings);
                      setOriginalLogoUrl("");
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    إزالة الشعار
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                رفع الشعار
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                PNG, JPG أو SVG (حد أقصى 5MB)
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>

        {/* قسم التحليل الذكي المدمج */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              التحليل الذكي المدمج
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentImageUrl && settings.logoUrl ? (
              <UnifiedLogoAnalyzer
                currentImageUrl={currentImageUrl}
                logoUrl={settings.logoUrl}
                logoSettings={settings}
                onApplyLogoSuggestions={(suggestions) => {
                  const newSettings = { ...settings, ...suggestions };
                  setSettings(newSettings);
                  localStorage.setItem('logoCustomizer_settings', JSON.stringify(newSettings));
                  onUpdate(newSettings);
                  toast.success("تم تطبيق اقتراحات المحلل الموحد بنجاح");
                }}
                geminiApiKey={geminiApiKey}
                specialty={specialty}
                contentType={contentType}
                imageStyle={imageStyle}
                language={language}
              />
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 rounded-full bg-muted">
                    <Settings className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">التحليل الذكي غير متاح</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {!settings.logoUrl && (
                      <p className="flex items-center gap-2 justify-center">
                        <Upload className="h-4 w-4 text-orange-500" />
                        يرجى رفع شعار أولاً
                      </p>
                    )}
                    {!currentImageUrl && (
                      <p className="flex items-center gap-2 justify-center">
                        <ImageIcon className="h-4 w-4 text-orange-500" />
                        يرجى إضافة محتوى في الصفحة الرئيسية
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    💡 <strong>نصيحة:</strong> ارفع شعارك وانشئ محتوى لتفعيل التحليل الذكي للحصول على اقتراحات مثالية لموضع الشعار
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {settings.logoUrl && (
          <>
            {/* Logo Settings */}
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label>حجم الشعار: {settings.logoSize}px</Label>
                <Slider
                  value={[settings.logoSize]}
                  onValueChange={([value]) => updateSetting("logoSize", value)}
                  min={30}
                  max={150}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>موضع الشعار</Label>
                <Select value={settings.logoPosition} onValueChange={(value: any) => updateSetting("logoPosition", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position.value} value={position.value}>
                        {position.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* التحكم المخصص في موضع الشعار */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    🎯 تحكم دقيق في موضع الشعار
                  </Label>
                  <Switch
                    checked={settings.useCustomLogoPosition}
                    onCheckedChange={(checked) => updateSetting("useCustomLogoPosition", checked)}
                  />
                </div>
                
                {settings.useCustomLogoPosition && (
                  <div className="space-y-4">
                    <div className="bg-muted/30 rounded-lg p-3 text-sm text-muted-foreground">
                      💡 <strong>تلميح:</strong> عند تفعيل هذا الخيار، انتقل إلى قسم المعاينة وانقر على الصورة لتحديد موضع الشعار تفاعلياً.
                    </div>

                    {/* التحكم اليدوي بالأرقام */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>الموضع الأفقي (X): {settings.customLogoX}%</Label>
                        <Slider
                          value={[settings.customLogoX]}
                          onValueChange={([value]) => updateSetting("customLogoX", value)}
                          min={0}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>الموضع العمودي (Y): {settings.customLogoY}%</Label>
                        <Slider
                          value={[settings.customLogoY]}
                          onValueChange={([value]) => updateSetting("customLogoY", value)}
                          min={0}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>شفافية الشعار: {settings.logoOpacity}%</Label>
                <Slider
                  value={[settings.logoOpacity]}
                  onValueChange={([value]) => updateSetting("logoOpacity", value)}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* إعدادات تأطير الشعار الجديدة */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Frame className="h-5 w-5" />
                    تأطير الشعار بأشكال متنوعة
                  </Label>
                  <Switch
                    checked={settings.logoFrameEnabled}
                    onCheckedChange={(checked) => updateSetting("logoFrameEnabled", checked)}
                  />
                </div>

                {settings.logoFrameEnabled && (
                  <div className="space-y-4">
                    {/* Preview إطار الشعار */}
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <Label className="text-sm text-muted-foreground mb-2 block">معاينة الإطار:</Label>
                      <div className="flex justify-center">
                        <div 
                          style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: `${settings.logoFrameColor}${Math.round((settings.logoFrameOpacity / 100) * 255).toString(16).padStart(2, '0')}`,
                            border: settings.logoFrameBorderWidth > 0 
                              ? `${settings.logoFrameBorderWidth}px ${settings.logoFrameBorderStyle} ${settings.logoFrameBorderColor}${Math.round(((settings.logoFrameBorderOpacity || 100) / 100) * 255).toString(16).padStart(2, '0')}`
                              : 'none',
                            padding: `${settings.logoFramePadding}px`,
                            borderRadius: settings.logoFrameShape === 'circle' ? '50%' : 
                                        settings.logoFrameShape === 'rounded-square' ? '15%' : '0',
                            clipPath: settings.logoFrameShape === 'diamond' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' :
                                     settings.logoFrameShape === 'hexagon' ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' :
                                     settings.logoFrameShape === 'pentagon' ? 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' :
                                     settings.logoFrameShape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' :
                                     settings.logoFrameShape === 'heart' ? 'polygon(50% 25%, 65% 10%, 80% 20%, 80% 40%, 50% 85%, 20% 40%, 20% 20%, 35% 10%)' :
                                     settings.logoFrameShape === 'shield' ? 'polygon(50% 0%, 100% 25%, 82% 100%, 18% 100%, 0% 25%)' :
                                     settings.logoFrameShape === 'trapezoid' ? 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' :
                                     'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          🖼️
                        </div>
                      </div>
                    </div>

                    {/* ألوان الإطار */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>لون خلفية الإطار</Label>
                        <Input
                          type="color"
                          value={settings.logoFrameColor}
                          onChange={(e) => updateSetting("logoFrameColor", e.target.value)}
                          className="w-full h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>لون حدود الإطار</Label>
                        <Input
                          type="color"
                          value={settings.logoFrameBorderColor}
                          onChange={(e) => updateSetting("logoFrameBorderColor", e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                    </div>

                     {/* اختيار شكل الإطار الموسع */}
                    <div className="space-y-2">
                      <Label>شكل الإطار المتقدم</Label>
                      <Select
                        value={settings.logoFrameShape}
                        onValueChange={(value: any) => updateSetting("logoFrameShape", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">بدون إطار</SelectItem>
                          <SelectItem value="circle">🔵 دائرة</SelectItem>
                          <SelectItem value="square">⬜ مربع</SelectItem>
                          <SelectItem value="rectangle">▭ مستطيل</SelectItem>
                          <SelectItem value="rounded-square">🔲 مربع مدور</SelectItem>
                          <SelectItem value="oval">🥚 بيضاوي</SelectItem>
                          <SelectItem value="diamond">🔷 معين</SelectItem>
                          <SelectItem value="hexagon">⬡ سداسي</SelectItem>
                          <SelectItem value="octagon">⬢ ثماني</SelectItem>
                          <SelectItem value="pentagon">⭐ خماسي</SelectItem>
                          <SelectItem value="star">⭐ نجمة</SelectItem>
                          <SelectItem value="heart">💖 قلب</SelectItem>
                          <SelectItem value="shield">🛡️ درع</SelectItem>
                          <SelectItem value="trapezoid">🔹 شبه منحرف</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* تحكم في نسب الأبعاد */}
                    <div className="space-y-4 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          📐 تحكم في أبعاد الإطار
                        </Label>
                        <Switch
                          checked={settings.logoFrameCustomDimensions}
                          onCheckedChange={(checked) => updateSetting("logoFrameCustomDimensions", checked)}
                        />
                      </div>
                      
                      {settings.logoFrameCustomDimensions && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>نسب الأبعاد</Label>
                            <Select
                              value={settings.logoFrameAspectRatio}
                              onValueChange={(value: any) => updateSetting("logoFrameAspectRatio", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="square">مربع 1:1</SelectItem>
                                <SelectItem value="portrait">عمودي 3:4</SelectItem>
                                <SelectItem value="landscape">أفقي 4:3</SelectItem>
                                <SelectItem value="custom">مخصص</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {settings.logoFrameAspectRatio === 'custom' && (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>العرض: {settings.logoFrameWidth}%</Label>
                                <Slider
                                  value={[settings.logoFrameWidth]}
                                  onValueChange={([value]) => updateSetting("logoFrameWidth", value)}
                                  min={50}
                                  max={200}
                                  step={5}
                                  className="w-full"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label>الارتفاع: {settings.logoFrameHeight}%</Label>
                                <Slider
                                  value={[settings.logoFrameHeight]}
                                  onValueChange={([value]) => updateSetting("logoFrameHeight", value)}
                                  min={50}
                                  max={200}
                                  step={5}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* حشو وشفافية الإطار */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>حشو الإطار: {settings.logoFramePadding}px</Label>
                        <Slider
                          value={[settings.logoFramePadding]}
                          onValueChange={([value]) => updateSetting("logoFramePadding", value)}
                          min={0}
                          max={50}
                          step={1}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          عند 0px يصبح الإطار معدوماً
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>شفافية الإطار: {settings.logoFrameOpacity}%</Label>
                        <Slider
                          value={[settings.logoFrameOpacity]}
                          onValueChange={([value]) => updateSetting("logoFrameOpacity", value)}
                          min={0}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* إعدادات الحدود المتقدمة */}
                    <div className="space-y-4 border-t pt-4">
                      <Label className="flex items-center gap-2">
                        🎨 تحكم متقدم في الحدود
                      </Label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>سمك الحدود: {settings.logoFrameBorderWidth}px</Label>
                          <Slider
                            value={[settings.logoFrameBorderWidth]}
                            onValueChange={([value]) => updateSetting("logoFrameBorderWidth", value)}
                            min={0}
                            max={10}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>شفافية الحدود: {settings.logoFrameBorderOpacity}%</Label>
                          <Slider
                            value={[settings.logoFrameBorderOpacity]}
                            onValueChange={([value]) => updateSetting("logoFrameBorderOpacity", value)}
                            min={0}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>نوع الحدود</Label>
                        <Select
                          value={settings.logoFrameBorderStyle}
                          onValueChange={(value: any) => updateSetting("logoFrameBorderStyle", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="solid">خط مستمر ━━━</SelectItem>
                            <SelectItem value="dashed">خط مقطع ╋╋╋</SelectItem>
                            <SelectItem value="dotted">نقاط ••••</SelectItem>
                            <SelectItem value="double">خط مزدوج ═══</SelectItem>
                            <SelectItem value="groove">منحوت 🔲</SelectItem>
                            <SelectItem value="ridge">بارز 🔳</SelectItem>
                            <SelectItem value="inset">غائر ⬇️</SelectItem>
                            <SelectItem value="outset">نافر ⬆️</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Enhanced Watermark Settings */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              العلامة المائية النصية المتقدمة
            </Label>
            <Switch
              checked={settings.showWatermark}
              onCheckedChange={(checked) => updateSetting("showWatermark", checked)}
            />
          </div>

          {settings.showWatermark && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  أساسي
                </TabsTrigger>
                <TabsTrigger value="frame" className="flex items-center gap-2">
                  <Frame className="h-4 w-4" />
                  الإطار
                </TabsTrigger>
                <TabsTrigger value="shadow" className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  الظل
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  متقدم
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 mt-4">
                {/* النص */}
                <div className="space-y-2">
                  <Label>نص العلامة المائية</Label>
                  <Input
                    value={settings.watermarkText}
                    onChange={(e) => updateSetting("watermarkText", e.target.value)}
                    placeholder="© Your Brand"
                    className="w-full"
                  />
                </div>

                {/* الخط ومقاس الخط */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>نوع الخط</Label>
                    <Select
                      value={settings.watermarkFontFamily}
                      onValueChange={(value) => updateSetting("watermarkFontFamily", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cairo, system-ui, sans-serif">Cairo</SelectItem>
                        <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                        <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                        <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
                        <SelectItem value="Georgia, serif">Georgia</SelectItem>
                        <SelectItem value="Courier New, monospace">Courier New</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>سمك الخط</Label>
                    <Select
                      value={settings.watermarkFontWeight}
                      onValueChange={(value) => updateSetting("watermarkFontWeight", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">رفيع</SelectItem>
                        <SelectItem value="400">عادي</SelectItem>
                        <SelectItem value="500">متوسط</SelectItem>
                        <SelectItem value="600">سميك</SelectItem>
                        <SelectItem value="700">عريض</SelectItem>
                        <SelectItem value="900">عريض جداً</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* حجم الخط والشفافية */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>حجم الخط: {settings.watermarkFontSize}px</Label>
                    <Slider
                      value={[settings.watermarkFontSize]}
                      onValueChange={([value]) => updateSetting("watermarkFontSize", value)}
                      min={8}
                      max={72}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>الشفافية: {settings.watermarkOpacity}%</Label>
                    <Slider
                      value={[settings.watermarkOpacity]}
                      onValueChange={([value]) => updateSetting("watermarkOpacity", value)}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* لون النص والموضع */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>لون النص</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={settings.watermarkColor}
                        onChange={(e) => updateSetting("watermarkColor", e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        type="text"
                        value={settings.watermarkColor}
                        onChange={(e) => updateSetting("watermarkColor", e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>موضع العلامة المائية</Label>
                    <Select value={settings.watermarkPosition} onValueChange={(value: any) => updateSetting("watermarkPosition", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((position) => (
                          <SelectItem key={position.value} value={position.value}>
                            {position.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* محاذاة النص داخل العلامة المائية */}
                <div className="space-y-2">
                  <Label>محاذاة النص</Label>
                  <Select
                    value={settings.watermarkFrameAlignment || 'center'}
                    onValueChange={(value: any) => updateSetting("watermarkFrameAlignment", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">يسار</SelectItem>
                      <SelectItem value="center">وسط</SelectItem>
                      <SelectItem value="right">يمين</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* الدوران */}
                <div className="space-y-2">
                  <Label>دوران النص: {settings.watermarkRotation}°</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[settings.watermarkRotation]}
                      onValueChange={([value]) => updateSetting("watermarkRotation", value)}
                      min={-45}
                      max={45}
                      step={1}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => updateSetting("watermarkRotation", 0)}
                      variant="outline"
                      size="sm"
                      title="إعادة تعيين الدوران"
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* الموضع المخصص */}
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      🎯 تحكم دقيق في موضع العلامة المائية
                    </Label>
                    <Switch
                      checked={settings.useCustomWatermarkPosition}
                      onCheckedChange={(checked) => updateSetting("useCustomWatermarkPosition", checked)}
                    />
                  </div>
                  
                  {settings.useCustomWatermarkPosition && (
                    <div className="space-y-4">
                      <div className="bg-muted/30 rounded-lg p-3 text-sm text-muted-foreground">
                        💡 <strong>تلميح:</strong> عند تفعيل هذا الخيار، انتقل إلى قسم المعاينة وانقر على الصورة لتحديد موضع العلامة المائية تفاعلياً.
                      </div>

                      {/* التحكم اليدوي بالأرقام */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>الموضع الأفقي (X): {settings.customWatermarkX}%</Label>
                          <Slider
                            value={[settings.customWatermarkX]}
                            onValueChange={([value]) => updateSetting("customWatermarkX", value)}
                            min={0}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>الموضع العمودي (Y): {settings.customWatermarkY}%</Label>
                          <Slider
                            value={[settings.customWatermarkY]}
                            onValueChange={([value]) => updateSetting("customWatermarkY", value)}
                            min={0}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="frame" className="space-y-4 mt-4">
                {/* تفعيل الإطار */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">تفعيل إطار العلامة المائية</Label>
                  <Switch
                    checked={settings.watermarkFrameEnabled}
                    onCheckedChange={(enabled) => updateSetting("watermarkFrameEnabled", enabled)}
                  />
                </div>

                {settings.watermarkFrameEnabled && (
                  <>
                    {/* لون الإطار والحدود */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">لون خلفية الإطار</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={settings.watermarkFrameColor}
                            onChange={(e) => updateSetting("watermarkFrameColor", e.target.value)}
                            className="w-16 h-10 p-1 border rounded"
                          />
                          <Input
                            type="text"
                            value={settings.watermarkFrameColor}
                            onChange={(e) => updateSetting("watermarkFrameColor", e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">لون حدود الإطار</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={settings.watermarkFrameBorderColor}
                            onChange={(e) => updateSetting("watermarkFrameBorderColor", e.target.value)}
                            className="w-16 h-10 p-1 border rounded"
                          />
                          <Input
                            type="text"
                            value={settings.watermarkFrameBorderColor}
                            onChange={(e) => updateSetting("watermarkFrameBorderColor", e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* شفافية الإطار والحدود */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">شفافية الإطار: {settings.watermarkFrameOpacity}%</Label>
                        <Slider
                          value={[settings.watermarkFrameOpacity]}
                          onValueChange={([value]) => updateSetting("watermarkFrameOpacity", value)}
                          min={0}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">سمك حدود الإطار: {settings.watermarkFrameBorderWidth}px</Label>
                        <Slider
                          value={[settings.watermarkFrameBorderWidth]}
                          onValueChange={([value]) => updateSetting("watermarkFrameBorderWidth", value)}
                          min={0}
                          max={8}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Padding والزوايا */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">المساحة الداخلية: {settings.watermarkFramePadding}px</Label>
                        <Slider
                          value={[settings.watermarkFramePadding]}
                          onValueChange={([value]) => updateSetting("watermarkFramePadding", value)}
                          min={0}
                          max={30}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">زاوية الإطار: {settings.watermarkFrameRadius}px</Label>
                        <Slider
                          value={[settings.watermarkFrameRadius]}
                          onValueChange={([value]) => updateSetting("watermarkFrameRadius", value)}
                          min={0}
                          max={20}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="shadow" className="space-y-4 mt-4">
                {/* تفعيل الظل */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">تفعيل ظل العلامة المائية</Label>
                  <Switch
                    checked={settings.watermarkShadowEnabled}
                    onCheckedChange={(enabled) => updateSetting("watermarkShadowEnabled", enabled)}
                  />
                </div>

                {settings.watermarkShadowEnabled && (
                  <>
                    {/* لون الظل */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">لون الظل</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={settings.watermarkShadowColor.replace('rgba(', '').replace(')', '').split(',').slice(0, 3).map(c => parseInt(c.trim())).reduce((acc, val, i) => acc + val.toString(16).padStart(2, '0'), '#')}
                          onChange={(e) => {
                            const hex = e.target.value;
                            const r = parseInt(hex.slice(1, 3), 16);
                            const g = parseInt(hex.slice(3, 5), 16);
                            const b = parseInt(hex.slice(5, 7), 16);
                            updateSetting("watermarkShadowColor", `rgba(${r}, ${g}, ${b}, 0.7)`);
                          }}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          type="text"
                          value={settings.watermarkShadowColor}
                          onChange={(e) => updateSetting("watermarkShadowColor", e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* إعدادات الظل */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">إزاحة أفقية: {settings.watermarkShadowOffsetX}px</Label>
                        <Slider
                          value={[settings.watermarkShadowOffsetX]}
                          onValueChange={([value]) => updateSetting("watermarkShadowOffsetX", value)}
                          min={-10}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">إزاحة عمودية: {settings.watermarkShadowOffsetY}px</Label>
                        <Slider
                          value={[settings.watermarkShadowOffsetY]}
                          onValueChange={([value]) => updateSetting("watermarkShadowOffsetY", value)}
                          min={-10}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">ضبابية الظل: {settings.watermarkShadowBlur}px</Label>
                        <Slider
                          value={[settings.watermarkShadowBlur]}
                          onValueChange={([value]) => updateSetting("watermarkShadowBlur", value)}
                          min={0}
                          max={20}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4 mt-4">
                {/* نمط المزج */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">نمط المزج</Label>
                  <Select
                    value={settings.watermarkBlendMode}
                    onValueChange={(value) => updateSetting("watermarkBlendMode", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">عادي</SelectItem>
                      <SelectItem value="multiply">تداخل</SelectItem>
                      <SelectItem value="screen">شاشة</SelectItem>
                      <SelectItem value="overlay">إضافة</SelectItem>
                      <SelectItem value="soft-light">إضاءة خفيفة</SelectItem>
                      <SelectItem value="hard-light">إضاءة قوية</SelectItem>
                      <SelectItem value="difference">فرق</SelectItem>
                      <SelectItem value="exclusion">استبعاد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* تحويل النص */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">تحويل النص</Label>
                  <Select
                    value={settings.watermarkTextTransform}
                    onValueChange={(value) => updateSetting("watermarkTextTransform", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">عادي</SelectItem>
                      <SelectItem value="uppercase">أحرف كبيرة</SelectItem>
                      <SelectItem value="lowercase">أحرف صغيرة</SelectItem>
                      <SelectItem value="capitalize">أول حرف كبير</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* تباعد الأحرف وارتفاع الخط */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">تباعد الأحرف: {settings.watermarkLetterSpacing}px</Label>
                    <Slider
                      value={[settings.watermarkLetterSpacing]}
                      onValueChange={([value]) => updateSetting("watermarkLetterSpacing", value)}
                      min={-5}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">ارتفاع الخط: {settings.watermarkLineHeight}</Label>
                    <Slider
                      value={[settings.watermarkLineHeight]}
                      onValueChange={([value]) => updateSetting("watermarkLineHeight", value)}
                      min={0.8}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  );
};