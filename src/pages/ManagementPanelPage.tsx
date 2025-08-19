import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";
import { ManagementPanel } from "@/components/AdminTabs/ManagementPanel";
import { toast } from "sonner";
import { ContentPreview } from "@/components/ContentPreview";

interface ManagementPanelPageProps {
  copySettings?: {
    livePreview?: boolean;
  };
}

const ManagementPanelPage = ({ copySettings }: ManagementPanelPageProps) => {
  const safeCopySettings = copySettings || { livePreview: true };
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Database className="h-5 w-5" />
            الإدارة العامة والإعدادات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            إدارة الإعدادات، التصدير، والاستيراد - تحكم شامل في جميع إعدادات النظام.
          </p>
          <ManagementPanel
            onExportSettings={() => {
              console.log('تصدير الإعدادات');
              toast.success('تم تصدير الإعدادات بنجاح!');
            }}
            onImportSettings={() => {
              console.log('استيراد الإعدادات');
              toast.success('تم استيراد الإعدادات بنجاح!');
            }}
            onResetAll={() => {
              console.log('إعادة تعيين الكل');
              toast.success('تم إعادة تعيين جميع الإعدادات!');
            }}
            onSaveTemplate={() => {
              const templateName = prompt("أدخل اسم النموذج:");
              if (!templateName) return;
              
              console.log('حفظ النموذج:', templateName);
              toast.success(`تم حفظ النموذج "${templateName}" بنجاح!`);
            }}
          />
        </CardContent>
      </Card>
      
      {/* ContentPreview مع إمكانية الإخفاء/الإظهار */}
      {safeCopySettings.livePreview && (
        <ContentPreview 
          className="sticky top-6"
          showDeviceToggle={true}
          showTools={true}
          title="معاينة إدارة المحتوى"
        />
      )}
    </div>
  );
};

export default ManagementPanelPage;