import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, 
  Copy, 
  Trash2, 
  Edit, 
  Eye, 
  Palette, 
  Layers, 
  Settings,
  Plus,
  Download,
  Upload,
  Sparkles,
  Wand2
 } from "lucide-react";
import { toast } from "sonner";
import { useEnhancedOverlayTemplates, type EnhancedOverlayTemplate } from "@/hooks/useEnhancedOverlayTemplates";
import { formatDateTimeForFiles } from "@/utils/dateUtils";

interface EnhancedOverlayTemplateManagerProps {
  onApplyTemplate?: (settings: any) => void;
  currentSettings?: any;
}

export const EnhancedOverlayTemplateManager: React.FC<EnhancedOverlayTemplateManagerProps> = ({
  onApplyTemplate,
  currentSettings
}) => {
  const {
    templates,
    loading,
    saving,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    createFromCurrentSettings,
    applyTemplate,
    generateGradientCSS
  } = useEnhancedOverlayTemplates();

  const [selectedTemplate, setSelectedTemplate] = useState<EnhancedOverlayTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<EnhancedOverlayTemplate>>({});
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // إعدادات النموذج الافتراضية للإنشاء الجديد
  const defaultTemplate: Omit<EnhancedOverlayTemplate, 'id' | 'created_at' | 'updated_at'> = {
    name: '',
    description: '',
    use_gradient: true,
    gradient_type: 'radial',
    gradient_angle: 210,
    center_x: 50,
    center_y: 50,
    gradient_size: 100,
    use_sharp_stops: true,
    first_color: '#000000',
    first_color_opacity: 100,
    first_color_position: 60,
    second_color: '#ffffff',
    second_color_opacity: 100,
    second_color_position: 15,
    blend_mode: 'normal',
    advanced_blending_enabled: false,
    global_opacity: 100
  };

  const handleCreateTemplate = () => {
    setEditForm(defaultTemplate);
    setIsCreateDialogOpen(true);
  };

  const handleEditTemplate = (template: EnhancedOverlayTemplate) => {
    setEditForm(template);
    setSelectedTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!editForm.name?.trim()) {
      toast.error('يجب إدخال اسم النموذج');
      return;
    }

    if (selectedTemplate?.id) {
      // تحديث نموذج موجود
      await updateTemplate(selectedTemplate.id, editForm);
    } else {
      // إنشاء نموذج جديد
      await saveTemplate(editForm as Omit<EnhancedOverlayTemplate, 'id' | 'created_at' | 'updated_at'>);
    }

    setIsEditDialogOpen(false);
    setIsCreateDialogOpen(false);
    setEditForm({});
    setSelectedTemplate(null);
  };

  const handleApplyTemplate = (template: EnhancedOverlayTemplate) => {
    if (onApplyTemplate) {
      const settings = applyTemplate(template);
      onApplyTemplate(settings);
      // فرض إعادة تحديث الواجهة
      setTimeout(() => {
        onApplyTemplate(settings);
      }, 100);
      toast.success(`تم تطبيق النموذج: ${template.name}`);
    }
  };

  const handleSaveCurrentSettings = async () => {
    if (!currentSettings) {
      toast.error('لا توجد إعدادات حالية لحفظها');
      return;
    }

    const name = `نموذج ${formatDateTimeForFiles()}`;
    await createFromCurrentSettings(name, currentSettings);
  };

  // اقتراح اسم ووصف ذكي للنموذج
  const handleGenerateNameDescription = async () => {
    if (!editForm.first_color || !editForm.second_color) {
      toast.error('يرجى إدخال الألوان أولاً');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const supabase = (window as any).supabase;
      const response = await supabase.functions.invoke('gemini-suggestions', {
        body: {
          type: 'suggest_name_description',
          settings: editForm
        }
      });
      const result = response.data;
      
      if (result.name && result.description) {
        setEditForm({
          ...editForm,
          name: result.name,
          description: result.description
        });
        toast.success('تم إنشاء الاسم والوصف بذكاء!');
      } else {
        toast.error('فشل في إنشاء الاسم والوصف');
      }
    } catch (error) {
      console.error('Error generating name/description:', error);
      toast.error('فشل في الاتصال بخدمة الذكاء الاصطناعي');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // اقتراح إعدادات ذكية
  const handleGenerateSmartSettings = async () => {
    setIsGeneratingAI(true);
    try {
      const context = editForm.description || 'تدرج جميل للطبقة العلوية';
      const supabase = (window as any).supabase;
      const response = await supabase.functions.invoke('gemini-suggestions', {
        body: {
          type: 'suggest_smart_settings',
          description: context
        }
      });

      const result = response.data;
      
      if (result.settings) {
        setEditForm({
          ...editForm,
          ...result.settings,
          use_gradient: true
        });
        toast.success(result.explanation || 'تم إنشاء إعدادات ذكية!');
      } else {
        toast.error('فشل في إنشاء الإعدادات الذكية');
      }
    } catch (error) {
      console.error('Error generating smart settings:', error);
      toast.error('فشل في الاتصال بخدمة الذكاء الاصطناعي');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const renderTemplateCard = (template: EnhancedOverlayTemplate) => {
    const gradientCSS = generateGradientCSS(template);
    
    return (
      <Card key={template.id} className="group hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleApplyTemplate(template)}
                title="تطبيق النموذج"
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditTemplate(template)}
                title="تعديل النموذج"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => duplicateTemplate(template)}
                title="نسخ النموذج"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTemplate(template.id!)}
                title="حذف النموذج"
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* معاينة التدرج */}
          <div 
            className="w-full h-16 rounded-md mb-3 border"
            style={{ 
              background: gradientCSS || '#f0f0f0',
              opacity: template.global_opacity / 100
            }}
          />
          
          {/* معلومات النموذج */}
          <div className="space-y-2 text-xs text-muted-foreground">
            {template.description && (
              <p className="line-clamp-2">{template.description}</p>
            )}
            
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                {template.gradient_type === 'linear' ? 'خطي' : 
                 template.gradient_type === 'radial' ? 'دائري' : 'مخروطي'}
              </Badge>
              
              {template.use_sharp_stops && (
                <Badge variant="outline" className="text-xs">توقفات حادة</Badge>
              )}
              
              {template.advanced_blending_enabled && (
                <Badge variant="outline" className="text-xs">خلط متقدم</Badge>
              )}
              
              <Badge variant="outline" className="text-xs">
                {template.global_opacity}% شفافية
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderEditDialog = () => (
    <Dialog open={isEditDialogOpen || isCreateDialogOpen} onOpenChange={(open) => {
      setIsEditDialogOpen(open);
      setIsCreateDialogOpen(open);
      if (!open) {
        setEditForm({});
        setSelectedTemplate(null);
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {selectedTemplate ? 'تعديل النموذج' : 'إنشاء نموذج جديد'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">معلومات أساسية</TabsTrigger>
            <TabsTrigger value="gradient">إعدادات التدرج</TabsTrigger>
            <TabsTrigger value="colors">الألوان</TabsTrigger>
            <TabsTrigger value="advanced">متقدم</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">اسم النموذج *</Label>
                <Input
                  id="name"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  placeholder="أدخل اسم النموذج"
                />
              </div>
              <div>
                <Label htmlFor="preview_url">رابط صورة المعاينة</Label>
                <Input
                  id="preview_url"
                  value={editForm.preview_image_url || ''}
                  onChange={(e) => setEditForm({...editForm, preview_image_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={editForm.description || ''}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                placeholder="وصف النموذج..."
                rows={3}
              />
            </div>

            {/* أزرار الذكاء الاصطناعي */}
            <div className="flex gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateNameDescription}
                disabled={isGeneratingAI}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isGeneratingAI ? 'جاري الإنشاء...' : 'اقتراح اسم ووصف ذكي'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateSmartSettings}
                disabled={isGeneratingAI}
                className="flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                {isGeneratingAI ? 'جاري الإنشاء...' : 'إعدادات ذكية'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="gradient" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="use_gradient"
                checked={editForm.use_gradient || false}
                onCheckedChange={(checked) => setEditForm({...editForm, use_gradient: checked})}
              />
              <Label htmlFor="use_gradient">استخدام التدرج</Label>
            </div>

            {editForm.use_gradient && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>نوع التدرج</Label>
                    <Select
                      value={editForm.gradient_type || 'linear'}
                      onValueChange={(value) => setEditForm({...editForm, gradient_type: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">خطي</SelectItem>
                        <SelectItem value="radial">دائري</SelectItem>
                        <SelectItem value="conic">مخروطي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>الزاوية ({editForm.gradient_angle || 0}°)</Label>
                    <Slider
                      value={[editForm.gradient_angle || 0]}
                      onValueChange={([value]) => setEditForm({...editForm, gradient_angle: value})}
                      max={360}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>حجم التدرج ({editForm.gradient_size || 100}%)</Label>
                    <Slider
                      value={[editForm.gradient_size || 100]}
                      onValueChange={([value]) => setEditForm({...editForm, gradient_size: value})}
                      max={200}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>موضع المركز X ({editForm.center_x || 50}%)</Label>
                    <Slider
                      value={[editForm.center_x || 50]}
                      onValueChange={([value]) => setEditForm({...editForm, center_x: value})}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>موضع المركز Y ({editForm.center_y || 50}%)</Label>
                    <Slider
                      value={[editForm.center_y || 50]}
                      onValueChange={([value]) => setEditForm({...editForm, center_y: value})}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="use_sharp_stops"
                    checked={editForm.use_sharp_stops || false}
                    onCheckedChange={(checked) => setEditForm({...editForm, use_sharp_stops: checked})}
                  />
                  <Label htmlFor="use_sharp_stops">استخدام التوقفات الحادة</Label>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="colors" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {/* اللون الأول */}
              <div className="space-y-3">
                <h4 className="font-medium">اللون الأول</h4>
                <div>
                  <Label>اللون</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={editForm.first_color || '#000000'}
                      onChange={(e) => setEditForm({...editForm, first_color: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={editForm.first_color || '#000000'}
                      onChange={(e) => setEditForm({...editForm, first_color: e.target.value})}
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div>
                  <Label>الشفافية ({editForm.first_color_opacity || 100}%)</Label>
                  <Slider
                    value={[editForm.first_color_opacity || 100]}
                    onValueChange={([value]) => setEditForm({...editForm, first_color_opacity: value})}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>موضع البداية ({editForm.first_color_position || 0}%)</Label>
                  <Slider
                    value={[editForm.first_color_position || 0]}
                    onValueChange={([value]) => setEditForm({...editForm, first_color_position: value})}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* اللون الثاني */}
              <div className="space-y-3">
                <h4 className="font-medium">اللون الثاني</h4>
                <div>
                  <Label>اللون</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={editForm.second_color || '#ffffff'}
                      onChange={(e) => setEditForm({...editForm, second_color: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={editForm.second_color || '#ffffff'}
                      onChange={(e) => setEditForm({...editForm, second_color: e.target.value})}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
                <div>
                  <Label>الشفافية ({editForm.second_color_opacity || 100}%)</Label>
                  <Slider
                    value={[editForm.second_color_opacity || 100]}
                    onValueChange={([value]) => setEditForm({...editForm, second_color_opacity: value})}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>موضع النهاية ({editForm.second_color_position || 100}%)</Label>
                  <Slider
                    value={[editForm.second_color_position || 100]}
                    onValueChange={([value]) => setEditForm({...editForm, second_color_position: value})}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* معاينة التدرج */}
            {editForm.use_gradient && (
              <div className="mt-6">
                <Label>معاينة التدرج</Label>
                <div 
                  className="w-full h-24 rounded-md border mt-2"
                  style={{ 
                    background: generateGradientCSS(editForm as EnhancedOverlayTemplate) || '#f0f0f0',
                    opacity: (editForm.global_opacity || 100) / 100
                  }}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div>
              <Label>الشفافية العامة ({editForm.global_opacity || 100}%)</Label>
              <Slider
                value={[editForm.global_opacity || 100]}
                onValueChange={([value]) => setEditForm({...editForm, global_opacity: value})}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>نمط الخلط</Label>
              <Select
                value={editForm.blend_mode || 'normal'}
                onValueChange={(value) => setEditForm({...editForm, blend_mode: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">عادي</SelectItem>
                  <SelectItem value="multiply">ضرب</SelectItem>
                  <SelectItem value="screen">شاشة</SelectItem>
                  <SelectItem value="overlay">تراكب</SelectItem>
                  <SelectItem value="soft-light">إضاءة ناعمة</SelectItem>
                  <SelectItem value="hard-light">إضاءة قوية</SelectItem>
                  <SelectItem value="color-dodge">تجنب اللون</SelectItem>
                  <SelectItem value="color-burn">حرق اللون</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="advanced_blending"
                checked={editForm.advanced_blending_enabled || false}
                onCheckedChange={(checked) => setEditForm({...editForm, advanced_blending_enabled: checked})}
              />
              <Label htmlFor="advanced_blending">تمكين الخلط المتقدم</Label>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditDialogOpen(false);
              setIsCreateDialogOpen(false);
              setEditForm({});
              setSelectedTemplate(null);
            }}
          >
            إلغاء
          </Button>
          <Button onClick={handleSaveTemplate} disabled={saving}>
            {saving ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">إدارة نماذج الطبقة العلوية المحسّنة</h3>
        <div className="flex gap-2">
          {currentSettings && (
            <Button variant="outline" onClick={handleSaveCurrentSettings}>
              <Save className="w-4 h-4 ml-2" />
              حفظ الإعدادات الحالية
            </Button>
          )}
          <Button onClick={handleCreateTemplate}>
            <Plus className="w-4 h-4 ml-2" />
            إنشاء نموذج جديد
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(renderTemplateCard)}
          {templates.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد نماذج محفوظة</p>
              <p className="text-sm">ابدأ بإنشاء نموذج جديد أو احفظ الإعدادات الحالية</p>
            </div>
          )}
        </div>
      )}

      {renderEditDialog()}
    </div>
  );
};