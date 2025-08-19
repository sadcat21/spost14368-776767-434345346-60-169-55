-- إنشاء جدول لحفظ نماذج الطبقة العلوية
CREATE TABLE public.overlay_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل Row Level Security
ALTER TABLE public.overlay_templates ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسة للوصول العام للقراءة (يمكن للجميع رؤية النماذج)
CREATE POLICY "Allow public read access to overlay templates" 
ON public.overlay_templates 
FOR SELECT 
USING (true);

-- إنشاء سياسة للكتابة العامة (يمكن للجميع إضافة نماذج)
CREATE POLICY "Allow public write access to overlay templates" 
ON public.overlay_templates 
FOR INSERT 
WITH CHECK (true);

-- إنشاء سياسة للتحديث العام
CREATE POLICY "Allow public update access to overlay templates" 
ON public.overlay_templates 
FOR UPDATE 
USING (true);

-- إنشاء سياسة للحذف العام
CREATE POLICY "Allow public delete access to overlay templates" 
ON public.overlay_templates 
FOR DELETE 
USING (true);

-- إنشاء دالة لتحديث الطابع الزمني
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء مشغل لتحديث الطابع الزمني تلقائياً
CREATE TRIGGER update_overlay_templates_updated_at
BEFORE UPDATE ON public.overlay_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- إضافة فهرس للبحث السريع
CREATE INDEX idx_overlay_templates_name ON public.overlay_templates(name);
CREATE INDEX idx_overlay_templates_created_at ON public.overlay_templates(created_at DESC);