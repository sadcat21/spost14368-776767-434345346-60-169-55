import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye, Download, Image, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatShortDateInArabic } from "@/utils/dateUtils";
import { useEnhancedOverlayTemplates, type EnhancedOverlayTemplate } from "@/hooks/useEnhancedOverlayTemplates";
import type { LayerEffect } from "./LayerEffectsSelector";
import type { AdvancedBlendingSettings } from "./AdvancedBlendingController";

// إعدادات الطبقة العلوية
interface OverlaySettings {
  useOverlayGradient: boolean;
  overlayGradientStart: string;
  overlayGradientEnd: string;
  overlayGradientAngle: number;
  overlayGradientDirection: string;
  overlayStartOpacity: number;
  overlayEndOpacity: number;
  overlayStartPosition: number;
  overlayEndPosition: number;
  overlayGradientType: string;
  gradientCenterX: number;
  gradientCenterY: number;
  gradientSize: number;
  gradientRepeat: number;
  useSharpStops: boolean;
  borderGradientType: string;
  currentLayerEffect?: LayerEffect;
  advancedBlendingSettings?: AdvancedBlendingSettings;
}

interface OverlayTemplate {
  id: string;
  name: string;
  description: string | null;
  preview_image_url: string | null;
  settings: OverlaySettings;
  created_at: string;
}

interface OverlayTemplateGalleryProps {
  onLoadTemplate: (settings: OverlaySettings) => void;
  refreshTrigger?: number; // للتحديث التلقائي
}

export const OverlayTemplateGallery = ({ onLoadTemplate, refreshTrigger }: OverlayTemplateGalleryProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<EnhancedOverlayTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const { 
    templates, 
    loading: isLoading, 
    loadTemplates, 
    deleteTemplate: deleteEnhancedTemplate,
    generateGradientCSS 
  } = useEnhancedOverlayTemplates();

  useEffect(() => {
    loadTemplates();
  }, [refreshTrigger]); // إعادة التحميل عند تغيير refreshTrigger

  // تحويل النموذج المحسّن إلى الصيغة القديمة
  const convertToLegacySettings = (template: EnhancedOverlayTemplate): OverlaySettings => {
    return {
      useOverlayGradient: template.use_gradient,
      overlayGradientStart: template.first_color,
      overlayGradientEnd: template.second_color,
      overlayGradientAngle: template.gradient_angle,
      overlayGradientDirection: template.gradient_type === 'linear' ? 'linear' : 'radial',
      overlayStartOpacity: template.first_color_opacity,
      overlayEndOpacity: template.second_color_opacity,
      overlayStartPosition: template.first_color_position,
      overlayEndPosition: template.second_color_position,
      overlayGradientType: template.gradient_type,
      gradientCenterX: template.center_x,
      gradientCenterY: template.center_y,
      gradientSize: template.gradient_size,
      gradientRepeat: 1, // قيمة افتراضية
      useSharpStops: template.use_sharp_stops,
      borderGradientType: template.gradient_type,
      currentLayerEffect: undefined, // يمكن تحسينه لاحقاً
      advancedBlendingSettings: template.advanced_blending_settings
    };
  };

  const handleDeleteTemplate = async (id: string) => {
    await deleteEnhancedTemplate(id);
  };

  const handleLoadTemplate = (template: EnhancedOverlayTemplate) => {
    const legacySettings = convertToLegacySettings(template);
    onLoadTemplate(legacySettings);
    toast.success(`تم تحميل النموذج: ${template.name}`);
  };

  const loadTemplate = (template: EnhancedOverlayTemplate) => {
    const legacySettings = convertToLegacySettings(template);
    onLoadTemplate(legacySettings);
    toast.success(`تم تحميل نموذج "${template.name}"`);
  };

  const openPreview = (template: EnhancedOverlayTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  return (
    <>
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="text-primary">معرض نماذج الطبقة العلوية</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              جاري تحميل النماذج...
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              لا توجد نماذج محفوظة حتى الآن
              <br />
              <span className="text-sm">احفظ إعدادات طبقة علوية لإنشاء نموذج جديد</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <h4 className="font-medium truncate">{template.name}</h4>
                      {template.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openPreview(template)}
                        title="معاينة"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadTemplate(template)}
                        className="text-primary hover:text-primary"
                        title="تحميل النموذج"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id!)}
                        className="text-destructive hover:text-destructive"
                        title="حذف النموذج"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {template.preview_image_url ? (
                    <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
                      <img 
                        src={template.preview_image_url} 
                        alt={`معاينة ${template.name}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => openPreview(template)}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center text-muted-foreground">
                                <div class="text-center">
                                  <div class="w-8 h-8 mx-auto mb-2 opacity-50">
                                    <svg fill="currentColor" viewBox="0 0 20 20">
                                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                    </svg>
                                  </div>
                                  <p class="text-xs">لا توجد معاينة</p>
                                </div>
                              </div>
                            `;
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg border bg-muted flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">لا توجد معاينة</p>
                      </div>
                    </div>
                  )}
                  
                   <div className="flex items-center justify-between">
                     <Badge variant="secondary" className="text-xs">
                       طبقة علوية
                     </Badge>
                      <div className="text-xs text-muted-foreground">
                        {template.created_at ? formatShortDateInArabic(template.created_at) : 'تاريخ غير محدد'}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* مربع حوار المعاينة */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              معاينة نموذج: {selectedTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              {selectedTemplate.preview_image_url && (
                <div className="aspect-video rounded-lg overflow-hidden border">
                  <img 
                    src={selectedTemplate.preview_image_url} 
                    alt={`معاينة ${selectedTemplate.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {selectedTemplate.description && (
                <div>
                  <h4 className="font-medium mb-2">الوصف:</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate.description}
                  </p>
                </div>
              )}
              
                <div>
                  <h4 className="font-medium mb-2">إعدادات النموذج:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">تدرج الطبقة العلوية: </span>
                      <span>{selectedTemplate.use_gradient ? 'مفعل' : 'غير مفعل'}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">نوع التدرج: </span>
                      <span>{selectedTemplate.gradient_type === 'linear' ? 'خطي' : selectedTemplate.gradient_type === 'radial' ? 'دائري' : 'مخروطي'}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">زاوية التدرج: </span>
                      <span>{selectedTemplate.gradient_angle}°</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">شفافية عامة: </span>
                      <span>{selectedTemplate.global_opacity}%</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">اللون الأول: </span>
                      <span>{selectedTemplate.first_color} ({selectedTemplate.first_color_opacity}%)</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">اللون الثاني: </span>
                      <span>{selectedTemplate.second_color} ({selectedTemplate.second_color_opacity}%)</span>
                    </div>
                  </div>
                  
                  {/* معاينة التدرج */}
                  <div className="mt-4">
                    <h5 className="font-medium mb-2">معاينة التدرج:</h5>
                    <div 
                      className="w-full h-16 rounded-md border"
                      style={{ 
                        background: generateGradientCSS(selectedTemplate),
                        opacity: selectedTemplate.global_opacity / 100
                      }}
                    />
                  </div>
                </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    loadTemplate(selectedTemplate);
                    setIsPreviewOpen(false);
                  }}
                  className="flex-1"
                >
                  تحميل النموذج
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};