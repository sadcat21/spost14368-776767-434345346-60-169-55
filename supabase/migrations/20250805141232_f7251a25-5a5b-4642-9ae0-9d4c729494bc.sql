-- إنشاء جدول لحفظ مفاتيح API
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  key_name TEXT NOT NULL,
  key_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, key_name)
);

-- إنشاء جدول لحفظ صفحات الفيسبوك
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
  UNIQUE(user_id, page_id)
);

-- إنشاء جدول لحفظ رسائل الفيسبوك
CREATE TABLE public.facebook_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT NOT NULL UNIQUE,
  page_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT,
  message_text TEXT,
  message_type TEXT DEFAULT 'text',
  is_read BOOLEAN DEFAULT false,
  replied BOOLEAN DEFAULT false,
  reply_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول لحفظ تعليقات الفيسبوك
CREATE TABLE public.facebook_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id TEXT NOT NULL UNIQUE,
  post_id TEXT NOT NULL,
  page_id TEXT NOT NULL,
  commenter_id TEXT NOT NULL,
  commenter_name TEXT,
  comment_text TEXT NOT NULL,
  parent_comment_id TEXT,
  is_replied BOOLEAN DEFAULT false,
  reply_text TEXT,
  sentiment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول للردود التلقائية
CREATE TABLE public.auto_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id TEXT NOT NULL,
  trigger_keywords TEXT[] DEFAULT '{}',
  reply_message TEXT NOT NULL,
  reply_type TEXT NOT NULL DEFAULT 'message', -- 'message' أو 'comment'
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول لسجل الأنشطة
CREATE TABLE public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_type TEXT NOT NULL,
  page_id TEXT,
  event_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS للجداول
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات RLS للوصول العام (بما أن النظام يستخدم معرف افتراضي)
CREATE POLICY "Allow public access to api_keys" ON public.api_keys FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to facebook_pages" ON public.facebook_pages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to facebook_messages" ON public.facebook_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to facebook_comments" ON public.facebook_comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to auto_replies" ON public.auto_replies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to webhook_logs" ON public.webhook_logs FOR ALL USING (true) WITH CHECK (true);

-- إنشاء triggers للتحديث التلقائي للـ updated_at
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_facebook_pages_updated_at
  BEFORE UPDATE ON public.facebook_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_facebook_messages_updated_at
  BEFORE UPDATE ON public.facebook_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_facebook_comments_updated_at
  BEFORE UPDATE ON public.facebook_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_auto_replies_updated_at
  BEFORE UPDATE ON public.auto_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_facebook_messages_page_id ON public.facebook_messages(page_id);
CREATE INDEX idx_facebook_messages_sender_id ON public.facebook_messages(sender_id);
CREATE INDEX idx_facebook_comments_page_id ON public.facebook_comments(page_id);
CREATE INDEX idx_facebook_comments_post_id ON public.facebook_comments(post_id);
CREATE INDEX idx_auto_replies_page_id ON public.auto_replies(page_id);
CREATE INDEX idx_webhook_logs_created_at ON public.webhook_logs(created_at);
CREATE INDEX idx_webhook_logs_processed ON public.webhook_logs(processed);