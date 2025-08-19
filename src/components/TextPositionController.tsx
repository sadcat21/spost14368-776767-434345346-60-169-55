
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { NumericInput } from "@/components/ui/numeric-input";
import { FrameSettings } from "./FrameCustomizer";
import { Target, Move, RotateCw, FlipHorizontal, FlipVertical, Settings } from "lucide-react";

export interface TextPositionSettings {
  // التحكم الدقيق في موضع النص
  useCustomTextPosition: boolean;
  customTextX: number;
  customTextY: number;
  textWidth: number;
  textHeight: number;
}

interface TextPositionControllerProps {
  onUpdate: (settings: TextPositionSettings) => void;
  initialSettings?: TextPositionSettings;
  frameSettings?: FrameSettings;
  onFrameUpdate?: (settings: FrameSettings) => void;
  imageRotation?: number;
  imageFlipX?: boolean;
  imageFlipY?: boolean;
  onImageRotationChange?: (rotation: number) => void;
  onImageFlipChange?: (flipX: boolean, flipY: boolean) => void;
}

const defaultSettings: TextPositionSettings = {
  useCustomTextPosition: true,
  customTextX: 69,
  customTextY: 50,
  textWidth: 58,
  textHeight: 98,
};

export const TextPositionController = ({ 
  onUpdate, 
  initialSettings,
  frameSettings,
  onFrameUpdate,
  imageRotation = 0,
  imageFlipX = false,
  imageFlipY = false,
  onImageRotationChange,
  onImageFlipChange
}: TextPositionControllerProps) => {
  // دمج الإعدادات الواردة مع القيم الافتراضية لضمان التفعيل الصحيح
  const mergedSettings = { ...defaultSettings, ...initialSettings };
  const [settings, setSettings] = useState<TextPositionSettings>(mergedSettings);

  // تأكد من تطبيق الإعدادات الافتراضية عند التحميل الأول
  useEffect(() => {
    if (!initialSettings || Object.keys(initialSettings).length === 0) {
      console.log('TextPositionController - تطبيق الإعدادات الافتراضية:', defaultSettings);
      setSettings(defaultSettings);
      onUpdate(defaultSettings);
    }
  }, []);

  const updateSetting = <K extends keyof TextPositionSettings>(
    key: K,
    value: TextPositionSettings[K]
  ) => {
    console.log(`TextPositionController - تحديث ${key}:`, value);
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onUpdate(newSettings);
    
    // Force re-render by updating parent immediately
    setTimeout(() => {
      onUpdate(newSettings);
    }, 0);
  };

  // تطبيق الإعدادات المُوصى بها
  const applyRecommendedSettings = () => {
    const recommendedSettings: TextPositionSettings = {
      useCustomTextPosition: true,
      customTextX: 69,
      customTextY: 50,
      textWidth: 58,
      textHeight: 98,
    };
    console.log('TextPositionController - تطبيق الإعدادات المُوصى بها:', recommendedSettings);
    setSettings(recommendedSettings);
    onUpdate(recommendedSettings);
    
    // إيقاف إطار النص
    if (onFrameUpdate && frameSettings) {
      const updatedFrameSettings = {
        ...frameSettings,
        textFrameEnabled: false
      };
      console.log('TextPositionController - إيقاف إطار النص');
      onFrameUpdate(updatedFrameSettings);
    }
  };

  // تطبيق إعدادات الكتابة اليسرى
  const applyLeftWritingSettings = () => {
    const leftWritingSettings: TextPositionSettings = {
      useCustomTextPosition: true,
      customTextX: 28,
      customTextY: 50,
      textWidth: 58,
      textHeight: 98,
    };
    console.log('TextPositionController - تطبيق إعدادات الكتابة اليسرى:', leftWritingSettings);
    setSettings(leftWritingSettings);
    onUpdate(leftWritingSettings);
    
    // إيقاف إطار النص
    if (onFrameUpdate && frameSettings) {
      const updatedFrameSettings = {
        ...frameSettings,
        textFrameEnabled: false
      };
      console.log('TextPositionController - إيقاف إطار النص');
      onFrameUpdate(updatedFrameSettings);
    }
  };

  console.log('TextPositionController rendered with settings:', settings);

  return (
    <div className="space-y-6">
      {/* تحكم الصورة */}
      {(onImageRotationChange || onImageFlipChange) && (
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <RotateCw className="h-5 w-5" />
              تحكم الصورة الخلفية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* تدوير الصورة */}
            {onImageRotationChange && (
              <div className="space-y-3">
                <Label>تدوير الصورة: {imageRotation}°</Label>
                <Slider
                  value={[imageRotation]}
                  onValueChange={([value]) => onImageRotationChange(value)}
                  min={0}
                  max={360}
                  step={1}
                  className="w-full"
                />
                <NumericInput
                  value={imageRotation}
                  onChange={(value) => onImageRotationChange(value)}
                  min={0}
                  max={360}
                  step={1}
                  className="mt-2"
                />
              </div>
            )}

            {/* قلب الصورة */}
            {onImageFlipChange && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <FlipHorizontal className="h-4 w-4" />
                    قلب أفقي
                  </Label>
                  <Switch
                    checked={imageFlipX}
                    onCheckedChange={(checked) => onImageFlipChange(checked, imageFlipY)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <FlipVertical className="h-4 w-4" />
                    قلب عمودي
                  </Label>
                  <Switch
                    checked={imageFlipY}
                    onCheckedChange={(checked) => onImageFlipChange(imageFlipX, checked)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* تحكم موضع النص */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Target className="h-5 w-5" />
            التحكم الدقيق في موضع النص
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
        {/* تفعيل التحكم المخصص */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Move className="h-4 w-4" />
              استخدام موضع مخصص للنص
            </Label>
            <Switch
              checked={settings.useCustomTextPosition}
              onCheckedChange={(checked) => updateSetting("useCustomTextPosition", checked)}
            />
          </div>

          {/* أزرار الإعدادات المُوصى بها */}
          <div className="flex justify-center gap-2">
          </div>
        </div>

        {settings.useCustomTextPosition && (
          <div className="space-y-4">
            {/* موضع النص */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label>الموضع الأفقي (X): {settings.customTextX}%</Label>
                  <Slider
                    value={[settings.customTextX]}
                    onValueChange={([value]) => updateSetting("customTextX", value)}
                    min={-50}
                    max={150}
                    step={0.5}
                    className="w-full"
                  />
                  <NumericInput
                    value={settings.customTextX}
                    onChange={(value) => updateSetting("customTextX", value)}
                    min={-50}
                    max={150}
                    step={0.5}
                    className="mt-2"
                  />
                  <div className="text-xs text-muted-foreground">
                    من -50% (خارج الحد الأيسر) إلى 150% (خارج الحد الأيمن)
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>الموضع العمودي (Y): {settings.customTextY}%</Label>
                  <Slider
                    value={[settings.customTextY]}
                    onValueChange={([value]) => updateSetting("customTextY", value)}
                    min={-50}
                    max={150}
                    step={0.5}
                    className="w-full"
                  />
                  <NumericInput
                    value={settings.customTextY}
                    onChange={(value) => updateSetting("customTextY", value)}
                    min={-50}
                    max={150}
                    step={0.5}
                    className="mt-2"
                  />
                  <div className="text-xs text-muted-foreground">
                    من -50% (خارج الحد العلوي) إلى 150% (خارج الحد السفلي)
                  </div>
                </div>
            </div>

            {/* حجم منطقة النص */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label>عرض منطقة النص: {settings.textWidth}%</Label>
                  <Slider
                    value={[settings.textWidth]}
                    onValueChange={([value]) => updateSetting("textWidth", value)}
                    min={5}
                    max={200}
                    step={1}
                    className="w-full"
                  />
                  <NumericInput
                    value={settings.textWidth}
                    onChange={(value) => updateSetting("textWidth", value)}
                    min={5}
                    max={200}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-xs text-muted-foreground">
                    من 5% (ضيق جداً) إلى 200% (يتجاوز عرض الصورة)
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>ارتفاع منطقة النص: {settings.textHeight}%</Label>
                  <Slider
                    value={[settings.textHeight]}
                    onValueChange={([value]) => updateSetting("textHeight", value)}
                    min={5}
                    max={200}
                    step={1}
                    className="w-full"
                  />
                  <NumericInput
                    value={settings.textHeight}
                    onChange={(value) => updateSetting("textHeight", value)}
                    min={5}
                    max={200}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-xs text-muted-foreground">
                    من 5% (قصير جداً) إلى 200% (يتجاوز ارتفاع الصورة)
                  </div>
                </div>

                {/* إعدادات متقدمة إضافية */}
                <div className="space-y-4 border-t pt-4">
                  <Label className="text-sm font-medium">إعدادات متقدمة</Label>
                  
                  {/* أزرار المواضع السريعة */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        updateSetting("customTextX", 10);
                        updateSetting("customTextY", 10);
                      }}
                    >
                      🡄 أعلى يسار
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        updateSetting("customTextX", 50);
                        updateSetting("customTextY", 10);
                      }}
                    >
                      🡅 أعلى وسط
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        updateSetting("customTextX", 90);
                        updateSetting("customTextY", 10);
                      }}
                    >
                      🡆 أعلى يمين
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        updateSetting("customTextX", 10);
                        updateSetting("customTextY", 50);
                      }}
                    >
                      🡄 وسط يسار
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        updateSetting("customTextX", 50);
                        updateSetting("customTextY", 50);
                      }}
                    >
                      ⬤ وسط
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        updateSetting("customTextX", 90);
                        updateSetting("customTextY", 50);
                      }}
                    >
                      🡆 وسط يمين
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        updateSetting("customTextX", 10);
                        updateSetting("customTextY", 90);
                      }}
                    >
                      🡄 أسفل يسار
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        updateSetting("customTextX", 50);
                        updateSetting("customTextY", 90);
                      }}
                    >
                      🡇 أسفل وسط
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        updateSetting("customTextX", 90);
                        updateSetting("customTextY", 90);
                      }}
                    >
                      🡆 أسفل يمين
                    </Button>
                  </div>
                </div>
            </div>

            {/* نصائح للاستخدام */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h4 className="font-medium text-primary mb-2">💡 نصائح للاستخدام:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• استخدم الموضع الأفقي والعمودي لتحديد نقطة بداية النص</li>
                <li>• اضبط العرض والارتفاع للتحكم في مساحة النص</li>
                <li>• تجنب وضع النص في نفس موضع الشعار أو العلامة المائية</li>
                <li>• اختبر المواضع المختلفة للحصول على أفضل نتيجة بصرية</li>
              </ul>
            </div>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
};
