import { Settings, Save, RefreshCw, Download, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { formatDateTimeForFiles, getCurrentTimeInArabic } from "@/utils/dateUtils";


interface ManagementPanelProps {
  onExportSettings: () => void;
  onImportSettings: () => void;
  onResetAll: () => void;
  onSaveTemplate: () => void;
}

export const ManagementPanel = ({
  onExportSettings,
  onImportSettings,
  onResetAll,
  onSaveTemplate
}: ManagementPanelProps) => {
  const handleExportAll = () => {
    try {
      // تجميع جميع الإعدادات من localStorage
      const allSettings = {
        timestamp: new Date().toISOString(),
        version: "1.0",
        settings: {
          contentGenerator_specialty: localStorage.getItem('contentGenerator_specialty'),
          contentGenerator_contentType: localStorage.getItem('contentGenerator_contentType'),
          contentGenerator_language: localStorage.getItem('contentGenerator_language'),
          contentGenerator_imageStyle: localStorage.getItem('contentGenerator_imageStyle'),
          contentGenerator_imageDimension: localStorage.getItem('contentGenerator_imageDimension'),
          contentGenerator_imageSource: localStorage.getItem('contentGenerator_imageSource'),
          contentGenerator_pixabayContentType: localStorage.getItem('contentGenerator_pixabayContentType'),
          contentGenerator_customPrompt: localStorage.getItem('contentGenerator_customPrompt'),
          contentGenerator_textSettings: localStorage.getItem('contentGenerator_textSettings'),
          contentGenerator_colorSettings: localStorage.getItem('contentGenerator_colorSettings'),
          contentGenerator_logoSettings: localStorage.getItem('contentGenerator_logoSettings'),
          contentGenerator_frameSettings: localStorage.getItem('contentGenerator_frameSettings'),
          contentGeneratorSettings: localStorage.getItem('contentGeneratorSettings')
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allSettings, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `diagno-page-settings-${formatDateTimeForFiles()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast.success('تم تصدير جميع الإعدادات بنجاح!');
    } catch (error) {
      console.error('خطأ في تصدير الإعدادات:', error);
      toast.error('فشل في تصدير الإعدادات');
    }
  };

  const handleImportAll = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          
          if (importedData.settings) {
            // استيراد جميع الإعدادات
            Object.entries(importedData.settings).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                localStorage.setItem(key, value as string);
              }
            });
            
            // إعادة تحميل الصفحة لتطبيق الإعدادات الجديدة
            toast.success('تم استيراد الإعدادات بنجاح! سيتم إعادة تحميل الصفحة...');
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else {
            toast.error('ملف الإعدادات غير صالح');
          }
        } catch (error) {
          console.error('خطأ في استيراد الإعدادات:', error);
          toast.error('فشل في استيراد الإعدادات - تأكد من صحة الملف');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  const handleResetAll = () => {
    if (window.confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات؟ سيتم فقدان جميع التخصيصات الحالية.')) {
      try {
        // حذف جميع إعدادات التطبيق من localStorage
        const keysToRemove = [
          'contentGenerator_specialty',
          'contentGenerator_contentType',
          'contentGenerator_language',
          'contentGenerator_imageStyle',
          'contentGenerator_imageDimension',
          'contentGenerator_imageSource',
          'contentGenerator_pixabayContentType',
          'contentGenerator_customPrompt',
          'contentGenerator_textSettings',
          'contentGenerator_colorSettings',
          'contentGenerator_logoSettings',
          'contentGenerator_frameSettings',
          'contentGeneratorSettings'
        ];
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
        
        toast.success('تم إعادة تعيين جميع الإعدادات! سيتم إعادة تحميل الصفحة...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        console.error('خطأ في إعادة التعيين:', error);
        toast.error('فشل في إعادة تعيين الإعدادات');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* قسم إدارة الإعدادات */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Settings className="h-4 w-4" />
              إدارة الإعدادات العامة
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleExportAll}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              تصدير جميع الإعدادات
            </Button>
            
            <Button
              onClick={handleImportAll}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              استيراد الإعدادات
            </Button>
            
            <Button
              onClick={onSaveTemplate}
              variant="default"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              حفظ كنموذج
            </Button>
            
            <Button
              onClick={handleResetAll}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              إعادة تعيين الكل
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* قسم معلومات النظام */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Settings className="h-4 w-4" />
              معلومات النظام
            </CardTitle>
            
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>الإصدار:</strong> DIAGNO PAGE v1.0</p>
            <p><strong>آخر تحديث:</strong> {getCurrentTimeInArabic()}</p>
            <p><strong>نوع المحتوى:</strong> منصة إنشاء المحتوى بالذكاء الاصطناعي</p>
            <p><strong>الميزات المتاحة:</strong> تحليل الصور، اقتراحات ذكية، طبقات متقدمة، تصدير عالي الجودة</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};