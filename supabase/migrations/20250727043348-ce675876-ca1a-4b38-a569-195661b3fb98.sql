-- تحديث جدول overlay_templates لإضافة إعدادات الطبقة العلوية المتقدمة
ALTER TABLE overlay_templates 
ADD COLUMN gradient_settings JSONB DEFAULT NULL,
ADD COLUMN advanced_blending_enabled BOOLEAN DEFAULT FALSE;

-- إضافة تعليق للجدول
COMMENT ON COLUMN overlay_templates.gradient_settings IS 'إعدادات التدرج المتقدمة للطبقة العلوية';
COMMENT ON COLUMN overlay_templates.advanced_blending_enabled IS 'تفعيل أو إلغاء تفعيل التحكم المتقدم في التداخل';