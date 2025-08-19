-- إنشاء جدول لتخزين أحداث الصفحات
CREATE TABLE IF NOT EXISTS public.page_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL CHECK (event_type IN ('comment', 'message', 'reaction', 'post', 'webhook')),
    page_id TEXT,
    post_id TEXT,
    comment_id TEXT,
    message_id TEXT,
    user_id TEXT,
    user_name TEXT,
    content TEXT,
    post_content TEXT,
    response_content TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('success', 'failed', 'pending')),
    error_message TEXT,
    auto_replied BOOLEAN DEFAULT false,
    is_offensive BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_page_events_created_at ON public.page_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_events_page_id ON public.page_events(page_id);
CREATE INDEX IF NOT EXISTS idx_page_events_event_type ON public.page_events(event_type);
CREATE INDEX IF NOT EXISTS idx_page_events_status ON public.page_events(status);

-- تفعيل Row Level Security
ALTER TABLE public.page_events ENABLE ROW LEVEL SECURITY;

-- سياسة للقراءة (جميع المستخدمين يمكنهم القراءة)
CREATE POLICY "Anyone can view page events" 
ON public.page_events 
FOR SELECT 
USING (true);

-- سياسة للإدراج (جميع المستخدمين يمكنهم الإدراج للمعلومات العامة)
CREATE POLICY "Anyone can insert page events" 
ON public.page_events 
FOR INSERT 
WITH CHECK (true);

-- سياسة للتحديث (جميع المستخدمين يمكنهم التحديث)
CREATE POLICY "Anyone can update page events" 
ON public.page_events 
FOR UPDATE 
USING (true);

-- إنشاء دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger لتحديث updated_at
DROP TRIGGER IF EXISTS update_page_events_updated_at ON public.page_events;
CREATE TRIGGER update_page_events_updated_at
    BEFORE UPDATE ON public.page_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();