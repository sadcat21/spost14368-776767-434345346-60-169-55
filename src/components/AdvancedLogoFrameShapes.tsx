import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shapes, Zap, Eye } from "lucide-react";

interface AdvancedLogoFrameShapesProps {
  settings: any;
  updateSettings: (updates: any) => void;
}

export const AdvancedLogoFrameShapes: React.FC<AdvancedLogoFrameShapesProps> = ({
  settings,
  updateSettings
}) => {
  
  // دالة للحصول على CSS الخاص بكل شكل
  const getShapeCSS = (shape: string) => {
    const shapeStyles: Record<string, string> = {
      'none': 'none',
      'circle': 'border-radius: 50%',
      'square': 'border-radius: 0',
      'rounded-square': 'border-radius: 15%',
      'rectangle': 'border-radius: 0; aspect-ratio: 16/9',
      'oval': 'border-radius: 50%; aspect-ratio: 16/9',
      'diamond': 'clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      'hexagon': 'clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
      'octagon': 'clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
      'pentagon': 'clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
      'star': 'clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
      'heart': 'clip-path: polygon(50% 100%, 0% 40%, 0% 25%, 25% 0%, 50% 25%, 75% 0%, 100% 25%, 100% 40%)',
      'shield': 'clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      'trapezoid': 'clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
      'arrow-right': 'clip-path: polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)',
      'arrow-up': 'clip-path: polygon(20% 0%, 80% 0%, 100% 60%, 80% 60%, 80% 100%, 20% 100%, 20% 60%, 0% 60%)',
      'cross': 'clip-path: polygon(40% 0%, 60% 0%, 60% 40%, 100% 40%, 100% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%)',
      'ribbon': 'clip-path: polygon(0% 0%, 100% 0%, 90% 50%, 100% 100%, 0% 100%, 10% 50%)',
      'flower': 'border-radius: 0 100% 0 100%',
      'leaf': 'border-radius: 0 100%',
      'teardrop': 'border-radius: 100% 0 100% 100%'
    };
    
    return shapeStyles[shape] || 'none';
  };

  // دالة للحصول على أشكال متقدمة إضافية
  const getAdvancedShape = (shape: string) => {
    switch (shape) {
      case 'morphing':
        return {
          borderRadius: '50% 20% 80% 30%',
          animation: 'morphing 4s infinite'
        };
      case 'organic':
        return {
          borderRadius: '63% 37% 54% 46% / 55% 48% 52% 45%'
        };
      case 'wave':
        return {
          clipPath: 'polygon(0% 50%, 15% 30%, 40% 45%, 65% 25%, 100% 50%, 100% 100%, 0% 100%)'
        };
      case 'lightning':
        return {
          clipPath: 'polygon(30% 0%, 60% 0%, 40% 30%, 70% 30%, 45% 60%, 75% 60%, 50% 100%, 20% 100%, 35% 70%, 5% 70%, 25% 40%, 0% 40%)'
        };
      default:
        return {};
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shapes className="h-5 w-5" />
          أشكال الإطار المتقدمة
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* اختيار الشكل الأساسي */}
        <div className="space-y-4">
          <Label className="font-medium">الأشكال الأساسية</Label>
          <Select 
            value={settings.logoFrameShape} 
            onValueChange={(value: any) => updateSettings({ logoFrameShape: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">بدون إطار</SelectItem>
              <SelectItem value="circle">دائري</SelectItem>
              <SelectItem value="square">مربع</SelectItem>
              <SelectItem value="rounded-square">مربع مدور</SelectItem>
              <SelectItem value="rectangle">مستطيل</SelectItem>
              <SelectItem value="oval">بيضاوي</SelectItem>
              <SelectItem value="diamond">معين</SelectItem>
              <SelectItem value="hexagon">سداسي</SelectItem>
              <SelectItem value="octagon">ثماني</SelectItem>
              <SelectItem value="pentagon">خماسي</SelectItem>
              <SelectItem value="star">نجمة</SelectItem>
              <SelectItem value="heart">قلب</SelectItem>
              <SelectItem value="shield">درع</SelectItem>
              <SelectItem value="trapezoid">شبه منحرف</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* الأشكال المتقدمة الجديدة */}
        <div className="space-y-4">
          <Label className="font-medium">أشكال متقدمة إضافية</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateSettings({ logoFrameShape: 'arrow-right' })}
              className={`p-3 border rounded-lg text-center hover:bg-muted transition-colors ${
                settings.logoFrameShape === 'arrow-right' ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              <div className="w-8 h-8 mx-auto mb-2 bg-primary/20" 
                   style={{ clipPath: 'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)' }} />
              <span className="text-xs">سهم يمين</span>
            </button>
            
            <button
              type="button"
              onClick={() => updateSettings({ logoFrameShape: 'arrow-up' })}
              className={`p-3 border rounded-lg text-center hover:bg-muted transition-colors ${
                settings.logoFrameShape === 'arrow-up' ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              <div className="w-8 h-8 mx-auto mb-2 bg-primary/20" 
                   style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 60%, 80% 60%, 80% 100%, 20% 100%, 20% 60%, 0% 60%)' }} />
              <span className="text-xs">سهم فوق</span>
            </button>
            
            <button
              type="button"
              onClick={() => updateSettings({ logoFrameShape: 'cross' })}
              className={`p-3 border rounded-lg text-center hover:bg-muted transition-colors ${
                settings.logoFrameShape === 'cross' ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              <div className="w-8 h-8 mx-auto mb-2 bg-primary/20" 
                   style={{ clipPath: 'polygon(40% 0%, 60% 0%, 60% 40%, 100% 40%, 100% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%)' }} />
              <span className="text-xs">صليب</span>
            </button>
            
            <button
              type="button"
              onClick={() => updateSettings({ logoFrameShape: 'ribbon' })}
              className={`p-3 border rounded-lg text-center hover:bg-muted transition-colors ${
                settings.logoFrameShape === 'ribbon' ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              <div className="w-8 h-8 mx-auto mb-2 bg-primary/20" 
                   style={{ clipPath: 'polygon(0% 0%, 100% 0%, 90% 50%, 100% 100%, 0% 100%, 10% 50%)' }} />
              <span className="text-xs">شريط</span>
            </button>

            <button
              type="button"
              onClick={() => updateSettings({ logoFrameShape: 'flower' })}
              className={`p-3 border rounded-lg text-center hover:bg-muted transition-colors ${
                settings.logoFrameShape === 'flower' ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              <div className="w-8 h-8 mx-auto mb-2 bg-primary/20" 
                   style={{ borderRadius: '0 100% 0 100%' }} />
              <span className="text-xs">زهرة</span>
            </button>
            
            <button
              type="button"
              onClick={() => updateSettings({ logoFrameShape: 'leaf' })}
              className={`p-3 border rounded-lg text-center hover:bg-muted transition-colors ${
                settings.logoFrameShape === 'leaf' ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              <div className="w-8 h-8 mx-auto mb-2 bg-primary/20" 
                   style={{ borderRadius: '0 100%' }} />
              <span className="text-xs">ورقة</span>
            </button>
          </div>
        </div>

        {/* الأشكال العضوية والمتحركة */}
        <div className="space-y-4">
          <Label className="font-medium">أشكال عضوية ومتحركة</Label>
          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() => updateSettings({ logoFrameShape: 'organic' })}
              className={`p-3 border rounded-lg text-center hover:bg-muted transition-colors ${
                settings.logoFrameShape === 'organic' ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              <div className="w-8 h-8 mx-auto mb-2 bg-primary/20" 
                   style={{ borderRadius: '63% 37% 54% 46% / 55% 48% 52% 45%' }} />
              <span className="text-xs">شكل عضوي طبيعي</span>
            </button>
            
            <button
              type="button"
              onClick={() => updateSettings({ logoFrameShape: 'wave' })}
              className={`p-3 border rounded-lg text-center hover:bg-muted transition-colors ${
                settings.logoFrameShape === 'wave' ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              <div className="w-8 h-8 mx-auto mb-2 bg-primary/20" 
                   style={{ clipPath: 'polygon(0% 50%, 15% 30%, 40% 45%, 65% 25%, 100% 50%, 100% 100%, 0% 100%)' }} />
              <span className="text-xs">موجة</span>
            </button>
          </div>
        </div>

        {/* معاينة الشكل المختار */}
        {settings.logoFrameShape !== 'none' && (
          <div className="space-y-4">
            <Label className="font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              معاينة الشكل المختار
            </Label>
            <div className="border rounded-lg p-6 bg-muted/30 flex justify-center">
              <div 
                className="w-20 h-20 bg-gradient-to-br from-primary/60 to-primary/40 flex items-center justify-center"
                style={{
                  ...getAdvancedShape(settings.logoFrameShape),
                  borderRadius: settings.logoFrameShape === 'circle' ? '50%' : 
                              settings.logoFrameShape === 'rounded-square' ? '15%' : 
                              settings.logoFrameShape === 'flower' ? '0 100% 0 100%' :
                              settings.logoFrameShape === 'leaf' ? '0 100%' : '0',
                  clipPath: settings.logoFrameShape === 'diamond' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' :
                           settings.logoFrameShape === 'hexagon' ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' :
                           settings.logoFrameShape === 'pentagon' ? 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' :
                           settings.logoFrameShape === 'octagon' ? 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' :
                           settings.logoFrameShape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' :
                           settings.logoFrameShape === 'heart' ? 'polygon(50% 100%, 0% 40%, 0% 25%, 25% 0%, 50% 25%, 75% 0%, 100% 25%, 100% 40%)' :
                           settings.logoFrameShape === 'shield' ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' :
                           settings.logoFrameShape === 'trapezoid' ? 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' :
                           settings.logoFrameShape === 'arrow-right' ? 'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)' :
                           settings.logoFrameShape === 'arrow-up' ? 'polygon(20% 0%, 80% 0%, 100% 60%, 80% 60%, 80% 100%, 20% 100%, 20% 60%, 0% 60%)' :
                           settings.logoFrameShape === 'cross' ? 'polygon(40% 0%, 60% 0%, 60% 40%, 100% 40%, 100% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%)' :
                           settings.logoFrameShape === 'ribbon' ? 'polygon(0% 0%, 100% 0%, 90% 50%, 100% 100%, 0% 100%, 10% 50%)' :
                           settings.logoFrameShape === 'wave' ? 'polygon(0% 50%, 15% 30%, 40% 45%, 65% 25%, 100% 50%, 100% 100%, 0% 100%)' :
                           'none',
                  aspectRatio: settings.logoFrameShape === 'rectangle' || settings.logoFrameShape === 'oval' ? '16/9' : '1',
                  transform: `rotate(${settings.logoFrameRotation || 0}deg)`,
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="w-8 h-8 bg-white/80 rounded-sm flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              هذا مثال على كيف سيظهر الإطار حول الشعار الخاص بك
            </p>
          </div>
        )}

        {/* نصائح للاستخدام */}
        <div className="bg-info/10 p-4 rounded-lg">
          <h4 className="font-medium text-info mb-2">💡 نصائح للحصول على أفضل النتائج:</h4>
          <ul className="text-sm text-info/80 space-y-1">
            <li>• الأشكال الدائرية والمربعة المدورة مناسبة للشعارات الكلاسيكية</li>
            <li>• الأشكال العضوية والطبيعية تعطي مظهراً حديثاً وإبداعياً</li>
            <li>• الأشكال الهندسية مثل السداسي والثماني مناسبة للتصاميم التقنية</li>
            <li>• الأسهم والأشرطة مناسبة للعلامات التجارية الديناميكية</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedLogoFrameShapes;