import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings2,
  Layers,
  MousePointer2
} from 'lucide-react';
import { ContentPreview } from '@/components/ContentPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export const ContentPreviewDemo: React.FC = () => {
  const [demoSettings, setDemoSettings] = useState({
    showDeviceToggle: true,
    showTools: true,
    compact: false,
    autoRefresh: true
  });

  const [isPlaying, setIsPlaying] = useState(false);

  const toggleSetting = (key: keyof typeof demoSettings) => {
    setDemoSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header مع التحكم */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            عرض توضيحي - ContentPreview
            <Badge variant="outline" className="ml-2">مكون مشترك</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* أدوات التحكم */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                إعدادات العرض
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="device-toggle" className="text-sm">تبديل الأجهزة</Label>
                  <Switch
                    id="device-toggle"
                    checked={demoSettings.showDeviceToggle}
                    onCheckedChange={() => toggleSetting('showDeviceToggle')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-tools" className="text-sm">إظهار الأدوات</Label>
                  <Switch
                    id="show-tools"
                    checked={demoSettings.showTools}
                    onCheckedChange={() => toggleSetting('showTools')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="compact-mode" className="text-sm">النمط المدمج</Label>
                  <Switch
                    id="compact-mode"
                    checked={demoSettings.compact}
                    onCheckedChange={() => toggleSetting('compact')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-refresh" className="text-sm">التحديث التلقائي</Label>
                  <Switch
                    id="auto-refresh"
                    checked={demoSettings.autoRefresh}
                    onCheckedChange={() => toggleSetting('autoRefresh')}
                  />
                </div>
              </div>

              <Separator />

              {/* معلومات الاستخدام */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <MousePointer2 className="h-4 w-4" />
                  معلومات الاستخدام
                </h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>🔧 <strong>الرمز:</strong> ContentPreview</p>
                  <p>📦 <strong>المكون:</strong> ContentPreview</p>
                  <p>📝 <strong>الوصف:</strong> عنصر معاينة المحتوى المُولد</p>
                  <p>🏷️ <strong>الفئة:</strong> عناصر المعاينة</p>
                </div>
              </div>

              {/* مثال الكود */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">مثال من الكود:</h4>
                <div className="bg-muted/50 p-3 rounded-lg text-xs font-mono">
                  <pre>{`import { ContentPreview } from '@/components/ContentPreview';

<ContentPreview 
  className="w-full"
  showDeviceToggle={${demoSettings.showDeviceToggle}}
  showTools={${demoSettings.showTools}}
  compact={${demoSettings.compact}}
  autoRefresh={${demoSettings.autoRefresh}}
  title="معاينة المحتوى"
/>`}</pre>
                </div>
              </div>
            </div>

            {/* معلومات الميزات */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">الميزات الرئيسية:</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                  <span>كشف ذكي للمحتوى من مصادر متعددة</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                  <span>معاينة متعددة الأجهزة (سطح المكتب، تابلت، موبايل)</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
                  <span>تحديث تلقائي ذكي للمحتوى</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
                  <span>أدوات تفاعلية (تحديث، توسيع، تصدير)</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                  <span>مؤشرات حالة فورية للمحتوى</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0"></div>
                  <span>دعم اللوغو والإعدادات المتقدمة</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-sm font-medium">حالات الاستخدام:</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>• صفحات إنشاء المحتوى</p>
                  <p>• تبويبات الإدارة والتحكم</p>
                  <p>• صفحات المعاينة المتخصصة</p>
                  <p>• أدوات التصميم والتخصيص</p>
                  <p>• لوحات المراقبة والتحليل</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* العرض الفعلي للمكون */}
      <ContentPreview 
        {...demoSettings}
        title={`عرض توضيحي - ${demoSettings.compact ? 'مدمج' : 'كامل'}`}
        className="border-2 border-primary/20"
      />

      {/* أمثلة إضافية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentPreview 
          compact={true}
          showDeviceToggle={false}
          title="نسخة مدمجة - للتبويبات"
        />
        
        <ContentPreview 
          showDeviceToggle={true}
          showTools={true}
          title="نسخة كاملة - للصفحات"
          autoRefresh={false}
        />
      </div>
    </div>
  );
};

export default ContentPreviewDemo;