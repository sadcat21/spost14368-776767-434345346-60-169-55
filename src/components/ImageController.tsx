import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  FlipHorizontal, 
  FlipVertical, 
  RotateCw, 
  Move, 
  Crop,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Layers,
  Circle,
  Square,
  Ellipsis,
  Zap
} from "lucide-react";

export interface ImageControlSettings {
  flipHorizontal: boolean;
  flipVertical: boolean;
  rotation: number;
  positionX: number;
  positionY: number;
  scale: number;
  cropEnabled: boolean;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  opacity: number;
  // Advanced Transparency Settings
  advancedOpacityEnabled: boolean;
  opacityShape: 'circle' | 'rectangle' | 'ellipse' | 'diagonal';
  opacityCenter: number;
  opacityEdge: number;
  opacityCenterX: number;
  opacityCenterY: number;
  opacityRadiusX: number;
  opacityRadiusY: number;
  opacityFeatherAmount: number;
  opacityGradientDirection: number;
  opacityCustomPattern: string;
  opacityInvert: boolean;
}

interface ImageControllerProps {
  settings: ImageControlSettings;
  onUpdate: (settings: ImageControlSettings) => void;
  language?: string;
}

const defaultSettings: ImageControlSettings = {
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
  blur: 0,
  opacity: 100,
  // Advanced Transparency Defaults
  advancedOpacityEnabled: false,
  opacityShape: 'circle',
  opacityCenter: 100,
  opacityEdge: 0,
  opacityCenterX: 50,
  opacityCenterY: 50,
  opacityRadiusX: 50,
  opacityRadiusY: 50,
  opacityFeatherAmount: 30,
  opacityGradientDirection: 0,
  opacityCustomPattern: 'radial',
  opacityInvert: false
};

export const ImageController = ({
  settings,
  onUpdate,
  language = 'ar'
}: ImageControllerProps) => {
  // التأكد من وجود settings وإعطاء قيم افتراضية إذا لم تكن موجودة
  const safeSettings = settings || defaultSettings;
  
  const updateSetting = (key: keyof ImageControlSettings, value: any) => {
    onUpdate({
      ...safeSettings,
      [key]: value
    });
  };

  const resetAll = () => {
    onUpdate(defaultSettings);
  };

  const rotateQuick = (degrees: number) => {
    const newRotation = (safeSettings.rotation + degrees) % 360;
    updateSetting('rotation', newRotation < 0 ? newRotation + 360 : newRotation);
  };

  return (
    <div className="space-y-6">
      {/* أزرار القلب والدوران السريع */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <FlipHorizontal className="h-4 w-4" />
            تحويل الصورة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={safeSettings.flipHorizontal ? "default" : "outline"}
              onClick={() => updateSetting('flipHorizontal', !safeSettings.flipHorizontal)}
              className="flex items-center gap-2"
            >
              <FlipHorizontal className="h-4 w-4" />
              قلب أفقي
            </Button>
            
            <Button
              size="sm"
              variant={safeSettings.flipVertical ? "default" : "outline"}
              onClick={() => updateSetting('flipVertical', !safeSettings.flipVertical)}
              className="flex items-center gap-2"
            >
              <FlipVertical className="h-4 w-4" />
              قلب عمودي
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => rotateQuick(90)}
              className="flex items-center gap-2"
            >
              <RotateCw className="h-4 w-4" />
              90°
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => rotateQuick(-90)}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              -90°
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* التدوير الدقيق */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <RotateCw className="h-4 w-4" />
            تدوير دقيق
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>زاوية الدوران: {safeSettings.rotation}°</Label>
            <Slider
              value={[safeSettings.rotation]}
              onValueChange={(value) => updateSetting('rotation', value[0])}
              max={360}
              min={0}
              step={1}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              value={safeSettings.rotation}
              onChange={(e) => updateSetting('rotation', parseInt(e.target.value) || 0)}
              min={0}
              max={360}
              placeholder="الزاوية"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateSetting('rotation', 0)}
            >
              إعادة تعيين
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* موضع الصورة */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Move className="h-4 w-4" />
            موضع الصورة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الموضع الأفقي (X): {safeSettings.positionX}%</Label>
              <Slider
                value={[safeSettings.positionX]}
                onValueChange={(value) => updateSetting('positionX', value[0])}
                max={200}
                min={-100}
                step={1}
              />
              <div className="text-xs text-muted-foreground">
                بدون حدود: -100% إلى 200% للحرية الكاملة في الموضع
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>الموضع العمودي (Y): {safeSettings.positionY}%</Label>
              <Slider
                value={[safeSettings.positionY]}
                onValueChange={(value) => updateSetting('positionY', value[0])}
                max={200}
                min={-100}
                step={1}
              />
              <div className="text-xs text-muted-foreground">
                بدون حدود: -100% إلى 200% للحرية الكاملة في الموضع
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              value={safeSettings.positionX}
              onChange={(e) => updateSetting('positionX', parseInt(e.target.value) || 0)}
              min={-100}
              max={200}
              placeholder="X"
            />
            <Input
              type="number"
              value={safeSettings.positionY}
              onChange={(e) => updateSetting('positionY', parseInt(e.target.value) || 0)}
              min={-100}
              max={200}
              placeholder="Y"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                updateSetting('positionX', 50);
                updateSetting('positionY', 50);
              }}
            >
              توسيط
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* التكبير والتصغير */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Maximize2 className="h-4 w-4" />
            حجم الصورة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>نسبة التكبير: {safeSettings.scale}%</Label>
            <Slider
              value={[safeSettings.scale]}
              onValueChange={(value) => updateSetting('scale', value[0])}
              max={200}
              min={25}
              step={5}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateSetting('scale', Math.max(25, safeSettings.scale - 10))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={safeSettings.scale}
              onChange={(e) => updateSetting('scale', parseInt(e.target.value) || 100)}
              min={25}
              max={200}
              className="flex-1"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateSetting('scale', Math.min(200, safeSettings.scale + 10))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* قص الصورة */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Crop className="h-4 w-4" />
            قص الصورة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>تفعيل القص</Label>
            <Button
              size="sm"
              variant={safeSettings.cropEnabled ? "default" : "outline"}
              onClick={() => updateSetting('cropEnabled', !safeSettings.cropEnabled)}
            >
              {safeSettings.cropEnabled ? 'مفعل' : 'معطل'}
            </Button>
          </div>
          
          {safeSettings.cropEnabled && (
            <div className="space-y-4 pt-2 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نقطة البداية X: {safeSettings.cropX}%</Label>
                  <Slider
                    value={[safeSettings.cropX]}
                    onValueChange={(value) => updateSetting('cropX', value[0])}
                    max={100}
                    min={0}
                    step={1}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>نقطة البداية Y: {safeSettings.cropY}%</Label>
                  <Slider
                    value={[safeSettings.cropY]}
                    onValueChange={(value) => updateSetting('cropY', value[0])}
                    max={100}
                    min={0}
                    step={1}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>العرض: {safeSettings.cropWidth}%</Label>
                  <Slider
                    value={[safeSettings.cropWidth]}
                    onValueChange={(value) => updateSetting('cropWidth', value[0])}
                    max={100}
                    min={10}
                    step={1}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>الارتفاع: {safeSettings.cropHeight}%</Label>
                  <Slider
                    value={[safeSettings.cropHeight]}
                    onValueChange={(value) => updateSetting('cropHeight', value[0])}
                    max={100}
                    min={10}
                    step={1}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* فلاتر الصورة */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">فلاتر الصورة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>السطوع: {safeSettings.brightness}%</Label>
              <Slider
                value={[safeSettings.brightness]}
                onValueChange={(value) => updateSetting('brightness', value[0])}
                max={200}
                min={0}
                step={5}
              />
            </div>
            
            <div className="space-y-2">
              <Label>التباين: {safeSettings.contrast}%</Label>
              <Slider
                value={[safeSettings.contrast]}
                onValueChange={(value) => updateSetting('contrast', value[0])}
                max={200}
                min={0}
                step={5}
              />
            </div>
            
            <div className="space-y-2">
              <Label>التشبع: {safeSettings.saturation}%</Label>
              <Slider
                value={[safeSettings.saturation]}
                onValueChange={(value) => updateSetting('saturation', value[0])}
                max={200}
                min={0}
                step={5}
              />
            </div>
            
            <div className="space-y-2">
              <Label>الضبابية: {safeSettings.blur}px</Label>
              <Slider
                value={[safeSettings.blur]}
                onValueChange={(value) => updateSetting('blur', value[0])}
                max={20}
                min={0}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label>الشفافية: {safeSettings.opacity}%</Label>
              <Slider
                value={[safeSettings.opacity]}
                onValueChange={(value) => updateSetting('opacity', value[0])}
                max={100}
                min={0}
                step={5}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* الشفافية المتقدمة */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4" />
            شفافية متقدمة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>تفعيل الشفافية المتقدمة</Label>
            <Button
              size="sm"
              variant={safeSettings.advancedOpacityEnabled ? "default" : "outline"}
              onClick={() => updateSetting('advancedOpacityEnabled', !safeSettings.advancedOpacityEnabled)}
            >
              {safeSettings.advancedOpacityEnabled ? 'مفعل' : 'معطل'}
            </Button>
          </div>
          
          {safeSettings.advancedOpacityEnabled && (
            <div className="space-y-4 pt-2 border-t">
              {/* نوع الشكل */}
              <div className="space-y-2">
                <Label>شكل الشفافية</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant={safeSettings.opacityShape === 'circle' ? "default" : "outline"}
                    onClick={() => updateSetting('opacityShape', 'circle')}
                    className="flex items-center gap-2"
                  >
                    <Circle className="h-4 w-4" />
                    دائرة
                  </Button>
                  <Button
                    size="sm"
                    variant={safeSettings.opacityShape === 'rectangle' ? "default" : "outline"}
                    onClick={() => updateSetting('opacityShape', 'rectangle')}
                    className="flex items-center gap-2"
                  >
                    <Square className="h-4 w-4" />
                    مستطيل
                  </Button>
                  <Button
                    size="sm"
                    variant={safeSettings.opacityShape === 'ellipse' ? "default" : "outline"}
                    onClick={() => updateSetting('opacityShape', 'ellipse')}
                    className="flex items-center gap-2"
                  >
                    <Ellipsis className="h-4 w-4" />
                    بيضاوي
                  </Button>
                  <Button
                    size="sm"
                    variant={safeSettings.opacityShape === 'diagonal' ? "default" : "outline"}
                    onClick={() => updateSetting('opacityShape', 'diagonal')}
                    className="flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    قطري
                  </Button>
                </div>
              </div>

              {/* شفافية المركز والحواف */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>شفافية المركز: {safeSettings.opacityCenter}%</Label>
                  <Slider
                    value={[safeSettings.opacityCenter]}
                    onValueChange={(value) => updateSetting('opacityCenter', value[0])}
                    max={100}
                    min={0}
                    step={5}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>شفافية الحواف: {safeSettings.opacityEdge}%</Label>
                  <Slider
                    value={[safeSettings.opacityEdge]}
                    onValueChange={(value) => updateSetting('opacityEdge', value[0])}
                    max={100}
                    min={0}
                    step={5}
                  />
                </div>
              </div>

              {/* مركز الشفافية */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>مركز الشفافية X: {safeSettings.opacityCenterX}%</Label>
                  <Slider
                    value={[safeSettings.opacityCenterX]}
                    onValueChange={(value) => updateSetting('opacityCenterX', value[0])}
                    max={100}
                    min={0}
                    step={1}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>مركز الشفافية Y: {safeSettings.opacityCenterY}%</Label>
                  <Slider
                    value={[safeSettings.opacityCenterY]}
                    onValueChange={(value) => updateSetting('opacityCenterY', value[0])}
                    max={100}
                    min={0}
                    step={1}
                  />
                </div>
              </div>

              {/* نصف القطر */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نصف القطر X: {safeSettings.opacityRadiusX}%</Label>
                  <Slider
                    value={[safeSettings.opacityRadiusX]}
                    onValueChange={(value) => updateSetting('opacityRadiusX', value[0])}
                    max={100}
                    min={5}
                    step={1}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>نصف القطر Y: {safeSettings.opacityRadiusY}%</Label>
                  <Slider
                    value={[safeSettings.opacityRadiusY]}
                    onValueChange={(value) => updateSetting('opacityRadiusY', value[0])}
                    max={100}
                    min={5}
                    step={1}
                  />
                </div>
              </div>

              {/* تنعيم الحواف */}
              <div className="space-y-2">
                <Label>تنعيم الحواف: {safeSettings.opacityFeatherAmount}%</Label>
                <Slider
                  value={[safeSettings.opacityFeatherAmount]}
                  onValueChange={(value) => updateSetting('opacityFeatherAmount', value[0])}
                  max={100}
                  min={0}
                  step={5}
                />
              </div>

              {/* اتجاه التدرج (للشكل القطري) */}
              {safeSettings.opacityShape === 'diagonal' && (
                <div className="space-y-2">
                  <Label>اتجاه التدرج: {safeSettings.opacityGradientDirection}°</Label>
                  <Slider
                    value={[safeSettings.opacityGradientDirection]}
                    onValueChange={(value) => updateSetting('opacityGradientDirection', value[0])}
                    max={360}
                    min={0}
                    step={15}
                  />
                </div>
              )}

              {/* عكس الشفافية */}
              <div className="flex items-center justify-between">
                <Label>عكس الشفافية</Label>
                <Button
                  size="sm"
                  variant={safeSettings.opacityInvert ? "default" : "outline"}
                  onClick={() => updateSetting('opacityInvert', !safeSettings.opacityInvert)}
                >
                  {safeSettings.opacityInvert ? 'مفعل' : 'معطل'}
                </Button>
              </div>

              {/* أزرار سريعة للأشكال المحددة مسبقاً */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    updateSetting('opacityShape', 'circle');
                    updateSetting('opacityCenter', 100);
                    updateSetting('opacityEdge', 0);
                    updateSetting('opacityFeatherAmount', 50);
                  }}
                >
                  دائرة مركزية
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    updateSetting('opacityShape', 'rectangle');
                    updateSetting('opacityCenter', 100);
                    updateSetting('opacityEdge', 20);
                    updateSetting('opacityFeatherAmount', 30);
                  }}
                >
                  إطار شفاف
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    updateSetting('opacityShape', 'diagonal');
                    updateSetting('opacityGradientDirection', 45);
                    updateSetting('opacityCenter', 100);
                    updateSetting('opacityEdge', 0);
                  }}
                >
                  تدرج قطري
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    updateSetting('opacityShape', 'ellipse');
                    updateSetting('opacityRadiusX', 70);
                    updateSetting('opacityRadiusY', 40);
                    updateSetting('opacityFeatherAmount', 40);
                  }}
                >
                  بيضاوي أفقي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* زر إعادة التعيين الشامل */}
      <Button
        variant="outline"
        onClick={resetAll}
        className="w-full flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        إعادة تعيين جميع إعدادات الصورة
      </Button>
    </div>
  );
};