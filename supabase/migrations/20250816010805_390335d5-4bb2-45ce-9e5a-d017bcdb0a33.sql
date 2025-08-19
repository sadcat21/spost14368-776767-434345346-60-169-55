-- إنشاء جدول API keys لتخزين مفاتيح API المختلفة
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key_name TEXT NOT NULL,
  key_value TEXT NOT NULL,
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(key_name, user_id)
);

-- تفعيل RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لجدول api_keys
CREATE POLICY "Users can view their own API keys" 
ON public.api_keys 
FOR SELECT 
USING (user_id = '00000000-0000-0000-0000-000000000000' OR auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own API keys" 
ON public.api_keys 
FOR INSERT 
WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000' OR auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own API keys" 
ON public.api_keys 
FOR UPDATE 
USING (user_id = '00000000-0000-0000-0000-000000000000' OR auth.uid()::text = user_id::text);

-- إنشاء جدول صفحات Facebook
CREATE TABLE public.facebook_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  page_id TEXT NOT NULL,
  page_name TEXT NOT NULL,
  access_token TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  category TEXT,
  picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(page_id, user_id)
);

-- تفعيل RLS
ALTER TABLE public.facebook_pages ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لجدول facebook_pages
CREATE POLICY "Users can view their own Facebook pages" 
ON public.facebook_pages 
FOR SELECT 
USING (user_id = '00000000-0000-0000-0000-000000000000' OR auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own Facebook pages" 
ON public.facebook_pages 
FOR INSERT 
WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000' OR auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own Facebook pages" 
ON public.facebook_pages 
FOR UPDATE 
USING (user_id = '00000000-0000-0000-0000-000000000000' OR auth.uid()::text = user_id::text);

-- إنشاء جدول أحداث الصفحات
CREATE TABLE public.page_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  page_id TEXT NOT NULL,
  post_id TEXT,
  comment_id TEXT,
  message_id TEXT,
  user_id TEXT,
  user_name TEXT,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  auto_replied BOOLEAN NOT NULL DEFAULT false,
  response_content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.page_events ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لجدول page_events (عام للقراءة، محدود للكتابة)
CREATE POLICY "Anyone can view page events" 
ON public.page_events 
FOR SELECT 
USING (true);

CREATE POLICY "Service can insert page events" 
ON public.page_events 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service can update page events" 
ON public.page_events 
FOR UPDATE 
USING (true);

-- إنشاء جدول سجلات webhook
CREATE TABLE public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_type TEXT NOT NULL,
  page_id TEXT,
  event_data JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لجدول webhook_logs
CREATE POLICY "Anyone can view webhook logs" 
ON public.webhook_logs 
FOR SELECT 
USING (true);

CREATE POLICY "Service can insert webhook logs" 
ON public.webhook_logs 
FOR INSERT 
WITH CHECK (true);

-- إنشاء جدول الملفات الشخصية للمستخدمين
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لجدول profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- إنشاء دالة لتحديث timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء triggers لتحديث updated_at تلقائياً
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_facebook_pages_updated_at
  BEFORE UPDATE ON public.facebook_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_page_events_updated_at
  BEFORE UPDATE ON public.page_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- إنشاء دالة لإنشاء profile تلقائياً عند تسجيل مستخدم جديد
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY definer SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$;

-- trigger لإنشاء profile عند تسجيل مستخدم جديد
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- إدراج بعض البيانات الأساسية
INSERT INTO public.api_keys (key_name, key_value, user_id) VALUES 
('FACEBOOK_ACCESS_TOKEN', '', '00000000-0000-0000-0000-000000000000'),
('GEMINI_API_KEY', '', '00000000-0000-0000-0000-000000000000'),
('PIXABAY_API_KEY', '', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (key_name, user_id) DO NOTHING;