import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Layout, RotateCcw, Shapes, AlignCenter } from "lucide-react";

export interface TextDistributionSettings {
  // موضع النص داخل الشكل
  horizontalPosition: number; // 0-100 (left to right)
  verticalPosition: number; // 0-100 (top to bottom)
  
  // حجم منطقة النص
  textAreaWidth: number; // 0-100 (نسبة من عرض الشكل)
  textAreaHeight: number; // 0-100 (نسبة من ارتفاع الشكل)
  
  // التوزيع التلقائي
  autoDistribution: boolean;
  distributionStrategy: 'center' | 'optimal' | 'safe' | 'fill';
  
  // المسافات الداخلية
  innerPadding: number; // 0-50
  
  // تجنب الحواف الحادة
  avoidEdges: boolean;
  edgeBuffer: number; // 0-30
  
  // التكيف مع الشكل
  shapeAware: boolean;
  dynamicSizing: boolean;
}

interface TextDistributionControllerProps {
  onUpdate: (settings: TextDistributionSettings) => void;
  layoutType: 'rectangle' | 'triangle' | 'trapezoid' | 'half-triangle' | 'half-trapezoid' | 'half-circle' | 'half-ellipse';
  triangleDirection: 'up' | 'down' | 'left' | 'right';
}

const defaultSettings: TextDistributionSettings = {
  horizontalPosition: 50, // في المركز أفقياً
  verticalPosition: 50,   // في المركز عمودياً
  textAreaWidth: 80,
  textAreaHeight: 60,
  autoDistribution: true,
  distributionStrategy: 'center', // تغيير من 'optimal' إلى 'center'
  innerPadding: 15,
  avoidEdges: true,
  edgeBuffer: 20,
  shapeAware: true,
  dynamicSizing: true,
};

export const TextDistributionController = ({ 
  onUpdate, 
  layoutType, 
  triangleDirection 
}: TextDistributionControllerProps) => {
  const [settings, setSettings] = useState<TextDistributionSettings>(defaultSettings);

  const updateSetting = <K extends keyof TextDistributionSettings>(
    key: K,
    value: TextDistributionSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onUpdate(newSettings);
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    onUpdate(defaultSettings);
  };

  const applyOptimalSettings = () => {
    const optimalSettings = getOptimalSettingsForShape(layoutType, triangleDirection);
    setSettings(optimalSettings);
    onUpdate(optimalSettings);
  };

  const getOptimalSettingsForShape = (
    shape: string, 
    direction: string
  ): TextDistributionSettings => {
    const baseSettings = { ...defaultSettings };

    switch (shape) {
      case 'triangle':
        if (direction === 'up') {
          return {
            ...baseSettings,
            horizontalPosition: 50,
            verticalPosition: 70,
            textAreaWidth: 70,
            textAreaHeight: 50,
            edgeBuffer: 25,
          };
        } else if (direction === 'down') {
          return {
            ...baseSettings,
            horizontalPosition: 50,
            verticalPosition: 30,
            textAreaWidth: 70,
            textAreaHeight: 50,
            edgeBuffer: 25,
          };
        } else if (direction === 'left') {
          return {
            ...baseSettings,
            horizontalPosition: 65,
            verticalPosition: 50,
            textAreaWidth: 60,
            textAreaHeight: 70,
            edgeBuffer: 20,
          };
        } else { // right
          return {
            ...baseSettings,
            horizontalPosition: 35,
            verticalPosition: 50,
            textAreaWidth: 60,
            textAreaHeight: 70,
            edgeBuffer: 20,
          };
        }

      case 'trapezoid':
        if (direction === 'up') {
          return {
            ...baseSettings,
            horizontalPosition: 50,
            verticalPosition: 65,
            textAreaWidth: 75,
            textAreaHeight: 55,
            edgeBuffer: 15,
          };
        } else if (direction === 'down') {
          return {
            ...baseSettings,
            horizontalPosition: 50,
            verticalPosition: 35,
            textAreaWidth: 75,
            textAreaHeight: 55,
            edgeBuffer: 15,
          };
        }
        break;

      case 'half-circle':
        if (direction === 'up') {
          return {
            ...baseSettings,
            horizontalPosition: 50,
            verticalPosition: 30,
            textAreaWidth: 75,
            textAreaHeight: 40,
            edgeBuffer: 15,
          };
        } else if (direction === 'down') {
          return {
            ...baseSettings,
            horizontalPosition: 50,
            verticalPosition: 70,
            textAreaWidth: 75,
            textAreaHeight: 40,
            edgeBuffer: 15,
          };
        } else if (direction === 'left') {
          return {
            ...baseSettings,
            horizontalPosition: 30,
            verticalPosition: 50,
            textAreaWidth: 55,
            textAreaHeight: 75,
            edgeBuffer: 15,
          };
        } else { // right
          return {
            ...baseSettings,
            horizontalPosition: 70,
            verticalPosition: 50,
            textAreaWidth: 55,
            textAreaHeight: 75,
            edgeBuffer: 15,
          };
        }

      case 'half-ellipse':
        return {
          ...baseSettings,
          horizontalPosition: 50,
          verticalPosition: direction === 'up' ? 35 : 65,
          textAreaWidth: 80,
          textAreaHeight: 45,
          edgeBuffer: 12,
        };

      default:
        return baseSettings;
    }

    return baseSettings;
  };

  const getShapePreview = () => {
    const shapeMap = {
      triangle: '△',
      trapezoid: '⬟',
      'half-triangle': '◮',
      'half-trapezoid': '⬢',
      'half-circle': '◐',
      'half-ellipse': '⬮',
      rectangle: '▭'
    };
    
    return `${shapeMap[layoutType] || '▭'} ${triangleDirection}`;
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Layout className="h-5 w-5" />
          توزيع النص الذكي
          <span className="text-sm font-normal text-muted-foreground">
            {getShapePreview()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* التوزيع التلقائي */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-distribution">التوزيع التلقائي</Label>
            <Switch
              id="auto-distribution"
              checked={settings.autoDistribution}
              onCheckedChange={(checked) => updateSetting("autoDistribution", checked)}
            />
          </div>

          {settings.autoDistribution && (
            <div className="space-y-2">
              <Label>استراتيجية التوزيع</Label>
              <Select 
                value={settings.distributionStrategy} 
                onValueChange={(value: any) => updateSetting("distributionStrategy", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">وسط</SelectItem>
                  <SelectItem value="optimal">أمثل</SelectItem>
                  <SelectItem value="safe">آمن</SelectItem>
                  <SelectItem value="fill">ملء</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* موضع النص */}
        {!settings.autoDistribution && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الموضع الأفقي: {settings.horizontalPosition}%</Label>
              <Slider
                value={[settings.horizontalPosition]}
                onValueChange={([value]) => updateSetting("horizontalPosition", value)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>الموضع العمودي: {settings.verticalPosition}%</Label>
              <Slider
                value={[settings.verticalPosition]}
                onValueChange={([value]) => updateSetting("verticalPosition", value)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* حجم منطقة النص */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>عرض منطقة النص: {settings.textAreaWidth}%</Label>
            <Slider
              value={[settings.textAreaWidth]}
              onValueChange={([value]) => updateSetting("textAreaWidth", value)}
              min={30}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>ارتفاع منطقة النص: {settings.textAreaHeight}%</Label>
            <Slider
              value={[settings.textAreaHeight]}
              onValueChange={([value]) => updateSetting("textAreaHeight", value)}
              min={20}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        {/* المسافات والحواف */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>المسافة الداخلية: {settings.innerPadding}px</Label>
            <Slider
              value={[settings.innerPadding]}
              onValueChange={([value]) => updateSetting("innerPadding", value)}
              min={0}
              max={50}
              step={5}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="avoid-edges">تجنب الحواف الحادة</Label>
            <Switch
              id="avoid-edges"
              checked={settings.avoidEdges}
              onCheckedChange={(checked) => updateSetting("avoidEdges", checked)}
            />
          </div>

          {settings.avoidEdges && (
            <div className="space-y-2">
              <Label>مسافة الأمان من الحواف: {settings.edgeBuffer}px</Label>
              <Slider
                value={[settings.edgeBuffer]}
                onValueChange={([value]) => updateSetting("edgeBuffer", value)}
                min={0}
                max={30}
                step={5}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* إعدادات متقدمة */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="shape-aware">التكيف مع الشكل</Label>
            <Switch
              id="shape-aware"
              checked={settings.shapeAware}
              onCheckedChange={(checked) => updateSetting("shapeAware", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="dynamic-sizing">تغيير الحجم تلقائياً</Label>
            <Switch
              id="dynamic-sizing"
              checked={settings.dynamicSizing}
              onCheckedChange={(checked) => updateSetting("dynamicSizing", checked)}
            />
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={applyOptimalSettings}
            className="flex-1"
          >
            <AlignCenter className="mr-2 h-4 w-4" />
            إعدادات مثالية
          </Button>
          
          <Button 
            variant="outline" 
            onClick={resetToDefaults}
            className="flex-1"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            إعادة تعيين
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};