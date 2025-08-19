-- إنشاء جدول للمستخدمين باستخدام فيسبوك كهوية
CREATE TABLE IF NOT EXISTS public.facebook_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facebook_id TEXT NOT NULL UNIQUE,
  facebook_name TEXT NOT NULL,
  facebook_email TEXT,
  facebook_picture_url TEXT,
  access_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- تمكين Row Level Security
ALTER TABLE public.facebook_users ENABLE ROW LEVEL SECURITY;

-- إنشاء policies للوصول
CREATE POLICY "Users can view their own data" 
ON public.facebook_users 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own data" 
ON public.facebook_users 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own data" 
ON public.facebook_users 
FOR UPDATE 
USING (true);

-- تحديث جدول automation_subscriptions لربطه بـ facebook_users
ALTER TABLE public.automation_subscriptions 
ADD COLUMN IF NOT EXISTS facebook_user_id UUID REFERENCES public.facebook_users(id);

-- إنشاء فهرس للأداء
CREATE INDEX IF NOT EXISTS idx_facebook_users_facebook_id ON public.facebook_users(facebook_id);
CREATE INDEX IF NOT EXISTS idx_automation_subscriptions_facebook_user_id ON public.automation_subscriptions(facebook_user_id);

-- إنشاء trigger لتحديث updated_at
CREATE TRIGGER update_facebook_users_updated_at
BEFORE UPDATE ON public.facebook_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();