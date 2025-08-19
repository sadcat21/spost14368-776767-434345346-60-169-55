import React from 'react';
import { SidebarLogoCustomizer, SidebarLogoSettings } from './SidebarLogoCustomizer';
import { useLivePreview } from '@/contexts/LivePreviewContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Info } from "lucide-react";

export const SidebarLogoManager: React.FC = () => {
  const { previewData, updatePreviewData } = useLivePreview();

  const handleLogoSettingsUpdate = (settings: SidebarLogoSettings) => {
    console.log('SidebarLogoManager - Settings Updated:', settings);
    console.log('SidebarLogoManager - updatePreviewData function:', updatePreviewData);
    updatePreviewData({ sidebarLogoSettings: settings });
    console.log('SidebarLogoManager - updatePreviewData called with:', { sidebarLogoSettings: settings });
  };

  // إضافة معلومات تشخيصية
  console.log('SidebarLogoManager - Current previewData:', previewData);

  return (
    <div className="p-6 space-y-6">
      {/* عنوان الصفحة */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Eye className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary">إدارة الشعار الجانبي</h1>
          <p className="text-sm text-muted-foreground">تخصيص وتحرير الشعار الجانبي مع المعاينة المباشرة</p>
        </div>
      </div>

      {/* محتوى الصفحة */}
      <div className="max-w-4xl mx-auto">
        {/* مكون تخصيص الشعار الجانبي */}
        <div className="space-y-4">
          <SidebarLogoCustomizer onUpdate={handleLogoSettingsUpdate} />
        </div>
        
        {/* معلومات المعاينة العائمة */}
        <Card className="mt-6 border-info/20 bg-info/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-info">
              <Info className="h-5 w-5" />
              معلومات المعاينة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-info" />
                <span>ستظهر المعاينة العائمة تلقائياً مع التغييرات</span>
              </p>
              <p className="text-muted-foreground">
                💡 <strong>نصيحة:</strong> استخدم زر "التقاط المعاينة النهائية" أعلاه لحفظ النتيجة النهائية
              </p>
              <p className="text-muted-foreground text-xs">
                تأكد من وجود محتوى في الصفحة الرئيسية لضمان ظهور المعاينة بشكل صحيح
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SidebarLogoManager;