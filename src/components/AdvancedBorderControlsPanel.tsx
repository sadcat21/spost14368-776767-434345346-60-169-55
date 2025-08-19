import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Paintbrush, RotateCcw } from "lucide-react";
import type { ColorSettings } from "./ContentCanvas";

interface AdvancedBorderControlsPanelProps {
  colorSettings: ColorSettings;
  onUpdate: (settings: ColorSettings) => void;
}

export const AdvancedBorderControlsPanel = ({ colorSettings, onUpdate }: AdvancedBorderControlsPanelProps) => {
  const [borderGradientType, setBorderGradientType] = useState<'none' | 'straight' | 'curved' | 'wavy' | 'zigzag' | 'graduated' | 'organic'>('none');
  const [sharpBorderEnabled, setSharpBorderEnabled] = useState(false);
  const [sharpBorderStyle, setSharpBorderStyle] = useState<'straight' | 'curved' | 'zigzag'>('straight');
  const [sharpBorderThickness, setSharpBorderThickness] = useState(3);
  const [sharpBorderCurvature, setSharpBorderCurvature] = useState(50);
  const [sharpBorderSegments, setSharpBorderSegments] = useState(8);

  const updateSetting = <K extends keyof ColorSettings>(
    key: K,
    value: ColorSettings[K]
  ) => {
    const newSettings = { ...colorSettings, [key]: value };
    onUpdate(newSettings);
  };

  // Generate border gradient styles
  const generateBorderGradient = () => {
    if (borderGradientType === 'none' && !sharpBorderEnabled) return '';
    
    const borderColors = [colorSettings.borderColor, colorSettings.textColor];
    const borderWidth = colorSettings.borderWidth || 2;
    
    // حدود حادة منفصلة
    if (sharpBorderEnabled) {
      const baseStyle = `border: ${sharpBorderThickness}px solid ${borderColors[0]}; `;
      
      switch (sharpBorderStyle) {
        case 'straight':
          return baseStyle + `box-shadow: inset 0 0 0 ${sharpBorderThickness}px ${borderColors[1]};`;
        case 'curved':
          const radius = sharpBorderCurvature;
          return baseStyle + `border-radius: ${radius}% ${100-radius}% ${radius}% ${100-radius}%; box-shadow: 0 0 0 ${sharpBorderThickness}px ${borderColors[1]};`;
        case 'zigzag':
          const segments = sharpBorderSegments;
          const zigzagPath = Array.from({length: segments}, (_, i) => {
            const x = (i / segments) * 100;
            const y = i % 2 === 0 ? 0 : 20;
            return `${x}% ${y}%`;
          }).join(', ');
          return baseStyle + `clip-path: polygon(${zigzagPath}); box-shadow: 0 0 0 ${sharpBorderThickness}px ${borderColors[1]};`;
      }
    }
    
    switch (borderGradientType) {
      case 'straight':
        return `border: ${borderWidth}px solid; border-image: linear-gradient(45deg, ${borderColors[0]}, ${borderColors[1]}) 1;`;
      case 'curved':
        return `border: ${borderWidth}px solid; border-image: radial-gradient(circle, ${borderColors[0]}, ${borderColors[1]}) 1; border-radius: 20px;`;
      case 'wavy':
        return `border: ${borderWidth}px solid; border-image: repeating-linear-gradient(45deg, ${borderColors[0]}, ${borderColors[1]} 10px, ${borderColors[0]} 20px) 1;`;
      case 'zigzag':
        return `border: ${borderWidth}px solid; border-image: repeating-conic-gradient(${borderColors[0]} 0deg 45deg, ${borderColors[1]} 45deg 90deg) 1;`;
      case 'graduated':
        return `border: ${borderWidth}px solid; border-image: linear-gradient(to right, ${borderColors[0]} 0%, ${borderColors[1]} 50%, ${borderColors[0]} 100%) 1;`;
      case 'organic':
        return `border: ${borderWidth}px solid; border-image: conic-gradient(from 0deg, ${borderColors[0]}, ${borderColors[1]}, ${borderColors[0]}) 1; border-radius: 50% 20% 80% 30%;`;
      default:
        return '';
    }
  };

  const resetToDefaults = () => {
    setBorderGradientType('none');
    setSharpBorderEnabled(false);
    setSharpBorderStyle('straight');
    setSharpBorderThickness(3);
    setSharpBorderCurvature(50);
    setSharpBorderSegments(8);
    
    onUpdate({
      ...colorSettings,
      borderColor: '#e2e8f0',
      borderWidth: 0
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Paintbrush className="h-5 w-5 text-primary" />
          إعدادات الحدود المتطورة
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
        {/* نوع حدود التدرج */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">نوع حدود التدرج</Label>
          <Select 
            value={borderGradientType} 
            onValueChange={(value: typeof borderGradientType) => setBorderGradientType(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">بلا تدرج</SelectItem>
              <SelectItem value="straight">مستقيمة</SelectItem>
              <SelectItem value="curved">منحنية</SelectItem>
              <SelectItem value="wavy">متموجة</SelectItem>
              <SelectItem value="zigzag">متعرجة</SelectItem>
              <SelectItem value="graduated">متدرجة</SelectItem>
              <SelectItem value="organic">عضوية</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(borderGradientType !== 'none' || sharpBorderEnabled) && (
          <div className="space-y-6 animate-fade-in">
            {/* إعدادات الحدود الحادة */}
            {sharpBorderEnabled && (
              <div className="space-y-4 bg-accent/20 p-4 rounded-lg">
                <Label className="text-sm font-medium text-primary">إعدادات الحدود الحادة</Label>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">نمط الحد</Label>
                    <Select value={sharpBorderStyle} onValueChange={(value: any) => setSharpBorderStyle(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="straight">خط مستقيم</SelectItem>
                        <SelectItem value="curved">خط منحني</SelectItem>
                        <SelectItem value="zigzag">خط متعرج</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">سماكة الحد: {sharpBorderThickness}px</Label>
                    <Slider
                      value={[sharpBorderThickness]}
                      onValueChange={([value]) => setSharpBorderThickness(value)}
                      min={1}
                      max={10}
                      step={1}
                    />
                  </div>
                  
                  {sharpBorderStyle === 'curved' && (
                    <div className="space-y-2">
                      <Label className="text-xs">درجة الانحناء: {sharpBorderCurvature}%</Label>
                      <Slider
                        value={[sharpBorderCurvature]}
                        onValueChange={([value]) => setSharpBorderCurvature(value)}
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>
                  )}
                  
                  {sharpBorderStyle === 'zigzag' && (
                    <div className="space-y-2">
                      <Label className="text-xs">عدد الأجزاء: {sharpBorderSegments}</Label>
                      <Slider
                        value={[sharpBorderSegments]}
                        onValueChange={([value]) => setSharpBorderSegments(value)}
                        min={4}
                        max={20}
                        step={2}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="p-3 rounded border-2 border-dashed border-muted-foreground/20">
              <div className="text-xs text-muted-foreground mb-1">معاينة الحدود المتقدمة:</div>
              <div 
                className="h-12 rounded border-4"
                style={{ 
                  ...(() => {
                    const styles = generateBorderGradient();
                    const styleObj: React.CSSProperties = {};
                    
                    // Parse CSS string to React style object
                    styles.split(';').forEach(rule => {
                      const [property, value] = rule.split(':').map(s => s.trim());
                      if (property && value) {
                        const camelCaseProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                        (styleObj as any)[camelCaseProperty] = value;
                      }
                    });
                    
                    return styleObj;
                  })()
                }}
              />
            </div>
          </div>
        )}
        
        {/* زر تمكين الحدود الحادة */}
        <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
          <Label className="text-sm font-medium">حدود حادة منفصلة</Label>
          <Switch
            checked={sharpBorderEnabled}
            onCheckedChange={setSharpBorderEnabled}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">لون الحدود</Label>
            <Input
              type="color"
              value={colorSettings.borderColor}
              onChange={(e) => updateSetting("borderColor", e.target.value)}
              className="h-12 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">عرض الحدود: {colorSettings.borderWidth}px</Label>
            <Slider
              value={[colorSettings.borderWidth]}
              onValueChange={([value]) => updateSetting("borderWidth", value)}
              min={0}
              max={10}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};