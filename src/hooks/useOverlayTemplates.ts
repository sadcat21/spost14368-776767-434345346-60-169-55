import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { LayerEffect } from "@/components/LayerEffectsSelector";
import type { GradientSettings } from "@/components/OverlayGradientController";
import type { AdvancedBlendingSettings } from "@/components/AdvancedBlendingController";

interface OverlayTemplate {
  id?: string;
  name: string;
  description?: string;
  preview_image_url?: string;
  settings: any; // استخدام any لتجنب مشاكل النوع مع Json
  gradient_settings?: any; // استخدام any لتجنب مشاكل النوع مع Json
  advanced_blending_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

interface TemplateData {
  layerEffect?: LayerEffect;
  advancedBlending?: AdvancedBlendingSettings;
}

export const useOverlayTemplates = () => {
  const [templates, setTemplates] = useState<OverlayTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // تحميل جميع النماذج
  const loadTemplates = async () => {
    setLoading(true);
    try {
      // استخدام localStorage للحفظ المؤقت حتى يتم إنشاء جدول overlay_templates
      const savedTemplates = localStorage.getItem('overlay_templates');
      if (savedTemplates) {
        setTemplates(JSON.parse(savedTemplates));
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('فشل في تحميل النماذج');
    } finally {
      setLoading(false);
    }
  };

  // حفظ نموذج جديد
  const saveTemplate = async (template: Omit<OverlayTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    setSaving(true);
    try {
      // استخدام localStorage للحفظ المؤقت
      const newTemplate = {
        ...template,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const savedTemplates = localStorage.getItem('overlay_templates');
      const templates = savedTemplates ? JSON.parse(savedTemplates) : [];
      templates.push(newTemplate);
      localStorage.setItem('overlay_templates', JSON.stringify(templates));

      toast.success('تم حفظ النموذج بنجاح');
      await loadTemplates();
      return newTemplate;
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('فشل في حفظ النموذج');
      return null;
    } finally {
      setSaving(false);
    }
  };

  // تحديث نموذج موجود
  const updateTemplate = async (id: string, updates: Partial<OverlayTemplate>) => {
    setSaving(true);
    try {
      // استخدام localStorage للحفظ المؤقت
      const savedTemplates = localStorage.getItem('overlay_templates');
      const templates = savedTemplates ? JSON.parse(savedTemplates) : [];
      const index = templates.findIndex((t: any) => t.id === id);
      
      if (index !== -1) {
        templates[index] = { ...templates[index], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem('overlay_templates', JSON.stringify(templates));
        toast.success('تم تحديث النموذج بنجاح');
        await loadTemplates();
        return templates[index];
      }
      
      return null;
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('فشل في تحديث النموذج');
      return null;
    } finally {
      setSaving(false);
    }
  };

  // حذف نموذج
  const deleteTemplate = async (id: string) => {
    try {
      const savedTemplates = localStorage.getItem('overlay_templates');
      const templates = savedTemplates ? JSON.parse(savedTemplates) : [];
      const filteredTemplates = templates.filter((t: any) => t.id !== id);
      localStorage.setItem('overlay_templates', JSON.stringify(filteredTemplates));
      
      toast.success('تم حذف النموذج بنجاح');
      await loadTemplates();
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('فشل في حذف النموذج');
      return false;
    }
  };

  // نسخ نموذج
  const duplicateTemplate = async (template: OverlayTemplate) => {
    const duplicatedTemplate = {
      ...template,
      name: `${template.name} - نسخة`,
      id: undefined,
      created_at: undefined,
      updated_at: undefined
    };

    return await saveTemplate(duplicatedTemplate);
  };

  // حفظ إعدادات سريعة للطبقة الحالية
  const saveCurrentLayerSettings = async (
    layerEffect: LayerEffect,
    advancedBlendingSettings?: AdvancedBlendingSettings,
    name?: string
  ) => {
    const templateName = name || `نموذج ${new Date().toLocaleDateString('ar-SA')}`;
    
    const template: Omit<OverlayTemplate, 'id' | 'created_at' | 'updated_at'> = {
      name: templateName,
      description: `نموذج محفوظ تلقائياً - ${layerEffect.label}`,
      settings: {
        layerEffect,
        advancedBlending: advancedBlendingSettings
      } as any,
      gradient_settings: layerEffect.gradientSettings as any,
      advanced_blending_enabled: !!advancedBlendingSettings
    };

    return await saveTemplate(template);
  };

  // استرجاع البيانات من النموذج مع التحويل الصحيح للأنواع
  const getTemplateData = (template: OverlayTemplate): {
    layerEffect?: LayerEffect;
    advancedBlending?: AdvancedBlendingSettings;
    gradientSettings?: GradientSettings;
  } => {
    return {
      layerEffect: template.settings?.layerEffect,
      advancedBlending: template.settings?.advancedBlending,
      gradientSettings: template.gradient_settings as GradientSettings
    };
  };

  // تحميل النماذج عند التهيئة
  useEffect(() => {
    loadTemplates();
  }, []);

  return {
    templates,
    loading,
    saving,
    loadTemplates,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    saveCurrentLayerSettings,
    getTemplateData
  };
};