import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Palette, Type, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentPreview } from "@/components/ContentPreview";

interface ManagementPageProps {
  copySettings?: {
    livePreview?: boolean;
  };
}

const ManagementPage = ({ copySettings }: ManagementPageProps) => {
  const safeCopySettings = copySettings || { livePreview: true };
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary text-right">
              لوحة الإدارة المتقدمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center py-8">
                <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">إدارة الإعدادات المتقدمة</h3>
                <p className="text-muted-foreground mb-6">
                  تحكم في جميع جوانب التصميم والمحتوى من مكان واحد
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
                    <CardContent className="p-6 text-center">
                      <Palette className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">إدارة الألوان</h4>
                      <p className="text-sm text-muted-foreground">تخصيص الألوان والتدرجات</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
                    <CardContent className="p-6 text-center">
                      <Type className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">إدارة النصوص</h4>
                      <p className="text-sm text-muted-foreground">تنسيق الخطوط والنصوص</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
                    <CardContent className="p-6 text-center">
                      <Layers className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">إدارة الطبقات</h4>
                      <p className="text-sm text-muted-foreground">ترتيب وتنظيم الطبقات</p>
                    </CardContent>
                  </Card>
                </div>
                
                 <div className="mt-6">
                   <Button variant="outline" size="lg">
                     <Settings className="mr-2 h-4 w-4" />
                     فتح الإعدادات المتقدمة
                   </Button>
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>
         
         {/* LivePreview مع إمكانية الإخفاء/الإظهار */}
         {safeCopySettings.livePreview && (
           <div className="fixed bottom-4 left-4 w-80 z-50">
             <Card className="shadow-lg">
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm">معاينة مباشرة - الإدارة</CardTitle>
               </CardHeader>
               <CardContent className="pt-0">
                 <ContentPreview 
                   title="معاينة أدوات الإدارة"
                   className="w-full h-48"
                   compact={true}
                   showDeviceToggle={false}
                   autoRefresh={true}
                 />
               </CardContent>
             </Card>
           </div>
         )}
       </div>
     </div>
  );
};

export default ManagementPage;