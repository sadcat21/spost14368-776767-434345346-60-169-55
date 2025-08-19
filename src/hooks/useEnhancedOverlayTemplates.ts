import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EnhancedOverlayTemplate {
  id?: string;
  name: string;
  description?: string;
  preview_image_url?: string;
  
  // إعدادات التدرج الأساسية
  use_gradient: boolean;
  gradient_type: 'linear' | 'radial' | 'conic';
  gradient_angle: number;
  
  // موضع المركز للتدرج الدائري
  center_x: number;
  center_y: number;
  
  // إعدادات الحجم
  gradient_size: number;
  use_sharp_stops: boolean;
  
  // اللون الأول
  first_color: string;
  first_color_opacity: number;
  first_color_position: number;
  
  // اللون الثاني
  second_color: string;
  second_color_opacity: number;
  second_color_position: number;
  
  // ألوان إضافية
  additional_colors?: Array<{
    color: string;
    opacity: number;
    position: number;
  }>;
  
  // إعدادات الخلط المتقدمة
  blend_mode: string;
  advanced_blending_enabled: boolean;
  advanced_blending_settings?: any;
  
  // إعدادات الشفافية
  global_opacity: number;
  
  // إعدادات إضافية
  additional_settings?: any;
  
  created_at?: string;
  updated_at?: string;
}

export const useEnhancedOverlayTemplates = () => {
  const [templates, setTemplates] = useState<EnhancedOverlayTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // تحميل جميع النماذج المحسّنة
  const loadTemplates = async () => {
    setLoading(true);
    try {
      // استخدام localStorage للحفظ المؤقت حتى يتم إنشاء جدول enhanced_overlay_templates
      const savedTemplates = localStorage.getItem('enhanced_overlay_templates');
      if (savedTemplates) {
        setTemplates(JSON.parse(savedTemplates));
      }
    } catch (error) {
      console.error('Error loading enhanced templates:', error);
      toast.error('فشل في تحميل النماذج المحسّنة');
    } finally {
      setLoading(false);
    }
  };

  // حفظ نموذج جديد
  const saveTemplate = async (template: Omit<EnhancedOverlayTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    setSaving(true);
    try {
      // استخدام localStorage للحفظ المؤقت
      const newTemplate = {
        ...template,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const savedTemplates = localStorage.getItem('enhanced_overlay_templates');
      const templates = savedTemplates ? JSON.parse(savedTemplates) : [];
      templates.push(newTemplate);
      localStorage.setItem('enhanced_overlay_templates', JSON.stringify(templates));

      toast.success('تم حفظ النموذج المحسّن بنجاح');
      await loadTemplates();
      return newTemplate;
    } catch (error) {
      console.error('Error saving enhanced template:', error);
      toast.error('فشل في حفظ النموذج المحسّن');
      return null;
    } finally {
      setSaving(false);
    }
  };

  // تحديث نموذج موجود
  const updateTemplate = async (id: string, updates: Partial<EnhancedOverlayTemplate>) => {
    setSaving(true);
    try {
      // استخدام localStorage للحفظ المؤقت
      const savedTemplates = localStorage.getItem('enhanced_overlay_templates');
      const templates = savedTemplates ? JSON.parse(savedTemplates) : [];
      const index = templates.findIndex((t: any) => t.id === id);
      
      if (index !== -1) {
        templates[index] = { ...templates[index], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem('enhanced_overlay_templates', JSON.stringify(templates));
        toast.success('تم تحديث النموذج المحسّن بنجاح');
        await loadTemplates();
        return templates[index];
      }
      
      return null;
    } catch (error) {
      console.error('Error updating enhanced template:', error);
      toast.error('فشل في تحديث النموذج المحسّن');
      return null;
    } finally {
      setSaving(false);
    }
  };

  // حذف نموذج
  const deleteTemplate = async (id: string) => {
    try {
      const savedTemplates = localStorage.getItem('enhanced_overlay_templates');
      const templates = savedTemplates ? JSON.parse(savedTemplates) : [];
      const filteredTemplates = templates.filter((t: any) => t.id !== id);
      localStorage.setItem('enhanced_overlay_templates', JSON.stringify(filteredTemplates));
      
      toast.success('تم حذف النموذج المحسّن بنجاح');
      await loadTemplates();
      return true;
    } catch (error) {
      console.error('Error deleting enhanced template:', error);
      toast.error('فشل في حذف النموذج المحسّن');
      return false;
    }
  };

  // نسخ نموذج
  const duplicateTemplate = async (template: EnhancedOverlayTemplate) => {
    const duplicatedTemplate = {
      ...template,
      name: `${template.name} - نسخة`,
      id: undefined,
      created_at: undefined,
      updated_at: undefined
    };

    return await saveTemplate(duplicatedTemplate);
  };

  // إنشاء نموذج من الإعدادات الحالية
  const createFromCurrentSettings = async (
    name: string,
    settings: {
      use_gradient: boolean;
      gradient_type: 'linear' | 'radial' | 'conic';
      gradient_angle: number;
      center_x: number;
      center_y: number;
      gradient_size: number;
      use_sharp_stops: boolean;
      first_color: string;
      first_color_opacity: number;
      first_color_position: number;
      second_color: string;
      second_color_opacity: number;
      second_color_position: number;
      additional_colors?: Array<{color: string; opacity: number; position: number}>;
      blend_mode?: string;
      advanced_blending_enabled?: boolean;
      global_opacity?: number;
    },
    description?: string
  ) => {
    const template: Omit<EnhancedOverlayTemplate, 'id' | 'created_at' | 'updated_at'> = {
      name,
      description: description || `نموذج محفوظ - ${new Date().toLocaleDateString('ar-SA')}`,
      use_gradient: settings.use_gradient,
      gradient_type: settings.gradient_type,
      gradient_angle: settings.gradient_angle,
      center_x: settings.center_x,
      center_y: settings.center_y,
      gradient_size: settings.gradient_size,
      use_sharp_stops: settings.use_sharp_stops,
      first_color: settings.first_color,
      first_color_opacity: settings.first_color_opacity,
      first_color_position: settings.first_color_position,
      second_color: settings.second_color,
      second_color_opacity: settings.second_color_opacity,
      second_color_position: settings.second_color_position,
      additional_colors: settings.additional_colors || [],
      blend_mode: settings.blend_mode || 'normal',
      advanced_blending_enabled: settings.advanced_blending_enabled || false,
      global_opacity: settings.global_opacity || 100
    };

    return await saveTemplate(template);
  };

  // تطبيق إعدادات نموذج
  const applyTemplate = (template: EnhancedOverlayTemplate) => {
    return {
      use_gradient: template.use_gradient,
      gradient_type: template.gradient_type,
      gradient_angle: template.gradient_angle,
      center_x: template.center_x,
      center_y: template.center_y,
      gradient_size: template.gradient_size,
      use_sharp_stops: template.use_sharp_stops,
      first_color: template.first_color,
      first_color_opacity: template.first_color_opacity,
      first_color_position: template.first_color_position,
      second_color: template.second_color,
      second_color_opacity: template.second_color_opacity,
      second_color_position: template.second_color_position,
      additional_colors: template.additional_colors || [],
      blend_mode: template.blend_mode,
      advanced_blending_enabled: template.advanced_blending_enabled,
      global_opacity: template.global_opacity,
      additional_settings: template.additional_settings
    };
  };

  // تحويل التدرج إلى CSS
  const generateGradientCSS = (template: EnhancedOverlayTemplate): string => {
    if (!template.use_gradient) return '';

    const { gradient_type, gradient_angle, center_x, center_y, gradient_size } = template;
    const { first_color, first_color_opacity, first_color_position } = template;
    const { second_color, second_color_opacity, second_color_position } = template;

    // تحويل الشفافية إلى قيم alpha
    const firstAlpha = first_color_opacity / 100;
    const secondAlpha = second_color_opacity / 100;

    // تحويل الألوان إلى rgba
    const firstColorRgba = `${first_color}${Math.round(firstAlpha * 255).toString(16).padStart(2, '0')}`;
    const secondColorRgba = `${second_color}${Math.round(secondAlpha * 255).toString(16).padStart(2, '0')}`;

    let gradientCSS = '';

    switch (gradient_type) {
      case 'linear':
        gradientCSS = `linear-gradient(${gradient_angle}deg, ${firstColorRgba} ${first_color_position}%, ${secondColorRgba} ${second_color_position}%)`;
        break;
      case 'radial':
        gradientCSS = `radial-gradient(circle ${gradient_size}% at ${center_x}% ${center_y}%, ${firstColorRgba} ${first_color_position}%, ${secondColorRgba} ${second_color_position}%)`;
        break;
      case 'conic':
        gradientCSS = `conic-gradient(from ${gradient_angle}deg at ${center_x}% ${center_y}%, ${firstColorRgba} ${first_color_position}%, ${secondColorRgba} ${second_color_position}%)`;
        break;
    }

    // إضافة الألوان الإضافية إذا وجدت
    if (template.additional_colors && template.additional_colors.length > 0) {
      const additionalStops = template.additional_colors.map(color => {
        const alpha = color.opacity / 100;
        const colorRgba = `${color.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
        return `${colorRgba} ${color.position}%`;
      }).join(', ');
      
      gradientCSS = gradientCSS.replace(')', `, ${additionalStops})`);
    }

    return gradientCSS;
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
    createFromCurrentSettings,
    applyTemplate,
    generateGradientCSS
  };
};