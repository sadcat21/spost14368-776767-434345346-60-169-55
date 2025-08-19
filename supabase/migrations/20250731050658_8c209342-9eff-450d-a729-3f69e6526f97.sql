-- Create overlay_templates table
CREATE TABLE public.overlay_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  settings JSONB NOT NULL DEFAULT '{}',
  gradient_settings JSONB,
  advanced_blending_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enhanced_overlay_templates table
CREATE TABLE public.enhanced_overlay_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  use_gradient BOOLEAN NOT NULL DEFAULT false,
  gradient_type TEXT NOT NULL DEFAULT 'linear' CHECK (gradient_type IN ('linear', 'radial', 'conic')),
  gradient_angle INTEGER NOT NULL DEFAULT 0,
  center_x INTEGER NOT NULL DEFAULT 50,
  center_y INTEGER NOT NULL DEFAULT 50,
  gradient_size INTEGER NOT NULL DEFAULT 100,
  use_sharp_stops BOOLEAN NOT NULL DEFAULT false,
  first_color TEXT NOT NULL DEFAULT '#000000',
  first_color_opacity INTEGER NOT NULL DEFAULT 100,
  first_color_position INTEGER NOT NULL DEFAULT 0,
  second_color TEXT NOT NULL DEFAULT '#ffffff',
  second_color_opacity INTEGER NOT NULL DEFAULT 100,
  second_color_position INTEGER NOT NULL DEFAULT 100,
  additional_colors JSONB DEFAULT '[]',
  blend_mode TEXT NOT NULL DEFAULT 'normal',
  advanced_blending_enabled BOOLEAN NOT NULL DEFAULT false,
  advanced_blending_settings JSONB,
  global_opacity INTEGER NOT NULL DEFAULT 100,
  additional_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.overlay_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_overlay_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for overlay_templates (public access for templates)
CREATE POLICY "Anyone can view overlay templates" 
ON public.overlay_templates 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create overlay templates" 
ON public.overlay_templates 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update overlay templates" 
ON public.overlay_templates 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete overlay templates" 
ON public.overlay_templates 
FOR DELETE 
USING (true);

-- Create RLS policies for enhanced_overlay_templates (public access for templates)
CREATE POLICY "Anyone can view enhanced overlay templates" 
ON public.enhanced_overlay_templates 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create enhanced overlay templates" 
ON public.enhanced_overlay_templates 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update enhanced overlay templates" 
ON public.enhanced_overlay_templates 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete enhanced overlay templates" 
ON public.enhanced_overlay_templates 
FOR DELETE 
USING (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_overlay_templates_updated_at
  BEFORE UPDATE ON public.overlay_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enhanced_overlay_templates_updated_at
  BEFORE UPDATE ON public.enhanced_overlay_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();