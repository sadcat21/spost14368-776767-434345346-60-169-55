-- إنشاء جدول محسّن لإعدادات الطبقة العلوية
CREATE TABLE public.enhanced_overlay_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  
  -- إعدادات التدرج الأساسية
  use_gradient BOOLEAN NOT NULL DEFAULT false,
  gradient_type TEXT CHECK (gradient_type IN ('linear', 'radial', 'conic')) DEFAULT 'linear',
  gradient_angle NUMERIC DEFAULT 0, -- درجة الزاوية (0-360)
  
  -- موضع المركز للتدرج الدائري
  center_x NUMERIC DEFAULT 50, -- نسبة مئوية (0-100)
  center_y NUMERIC DEFAULT 50, -- نسبة مئوية (0-100)
  
  -- إعدادات الحجم
  gradient_size NUMERIC DEFAULT 100, -- نسبة مئوية
  use_sharp_stops BOOLEAN DEFAULT false,
  
  -- اللون الأول
  first_color TEXT DEFAULT '#000000',
  first_color_opacity NUMERIC DEFAULT 100 CHECK (first_color_opacity >= 0 AND first_color_opacity <= 100),
  first_color_position NUMERIC DEFAULT 0 CHECK (first_color_position >= 0 AND first_color_position <= 100),
  
  -- اللون الثاني
  second_color TEXT DEFAULT '#ffffff',
  second_color_opacity NUMERIC DEFAULT 100 CHECK (second_color_opacity >= 0 AND second_color_opacity <= 100),
  second_color_position NUMERIC DEFAULT 100 CHECK (second_color_position >= 0 AND second_color_position <= 100),
  
  -- ألوان إضافية (JSON للمرونة)
  additional_colors JSONB DEFAULT '[]',
  
  -- إعدادات الخلط المتقدمة
  blend_mode TEXT DEFAULT 'normal',
  advanced_blending_enabled BOOLEAN DEFAULT false,
  advanced_blending_settings JSONB,
  
  -- إعدادات الشفافية
  global_opacity NUMERIC DEFAULT 100 CHECK (global_opacity >= 0 AND global_opacity <= 100),
  
  -- إعدادات إضافية (مرونة للمستقبل)
  additional_settings JSONB DEFAULT '{}',
  
  -- طوابع زمنية
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تمكين Row Level Security
ALTER TABLE public.enhanced_overlay_templates ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الوصول العامة (يمكن تعديلها لاحقاً حسب الحاجة)
CREATE POLICY "Allow public read access to enhanced overlay templates" 
ON public.enhanced_overlay_templates 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public write access to enhanced overlay templates" 
ON public.enhanced_overlay_templates 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to enhanced overlay templates" 
ON public.enhanced_overlay_templates 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access to enhanced overlay templates" 
ON public.enhanced_overlay_templates 
FOR DELETE 
USING (true);

-- إنشاء trigger لتحديث الوقت تلقائياً
CREATE TRIGGER update_enhanced_overlay_templates_updated_at
  BEFORE UPDATE ON public.enhanced_overlay_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_enhanced_overlay_templates_name ON public.enhanced_overlay_templates(name);
CREATE INDEX idx_enhanced_overlay_templates_gradient_type ON public.enhanced_overlay_templates(gradient_type);
CREATE INDEX idx_enhanced_overlay_templates_created_at ON public.enhanced_overlay_templates(created_at DESC);

-- إدراج بعض النماذج الأساسية كأمثلة
INSERT INTO public.enhanced_overlay_templates (
  name, description, use_gradient, gradient_type, gradient_angle,
  center_x, center_y, gradient_size, use_sharp_stops,
  first_color, first_color_opacity, first_color_position,
  second_color, second_color_opacity, second_color_position
) VALUES 
(
  'تدرج دائري كلاسيكي',
  'تدرج دائري بزاوية 210° مع شفافية كاملة',
  true,
  'radial',
  210,
  50,
  50,
  100,
  true,
  '#000000',
  100,
  60,
  '#ffffff',
  100,
  15
),
(
  'تدرج خطي بسيط',
  'تدرج خطي أساسي من الأسود إلى الأبيض',
  true,
  'linear',
  90,
  50,
  50,
  100,
  false,
  '#000000',
  80,
  0,
  '#ffffff',
  20,
  100
),
(
  'تدرج مخروطي ملون',
  'تدرج مخروطي بألوان متعددة',
  true,
  'conic',
  0,
  50,
  50,
  100,
  false,
  '#ff0000',
  70,
  0,
  '#0000ff',
  70,
  100
);