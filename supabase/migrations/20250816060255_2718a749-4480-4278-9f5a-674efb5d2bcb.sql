-- Create automation_subscriptions table for managing user credits and subscriptions
CREATE TABLE public.automation_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  page_id TEXT NOT NULL,
  page_name TEXT NOT NULL,
  page_access_token TEXT NOT NULL,
  followers_count INTEGER DEFAULT 0,
  custom_page_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  subscription_start TIMESTAMPTZ DEFAULT now(),
  subscription_end TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  credits_total INTEGER DEFAULT 10,
  credits_used INTEGER DEFAULT 0,
  credits_remaining INTEGER DEFAULT 10,
  cronjob_id TEXT,
  automation_active BOOLEAN DEFAULT false,
  posts_per_day INTEGER DEFAULT 1,
  posts_per_week INTEGER DEFAULT 7,
  execution_times JSONB DEFAULT '["09:00", "15:00", "21:00"]'::jsonb,
  content_type TEXT DEFAULT 'mixed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, page_id)
);

-- Enable Row Level Security
ALTER TABLE public.automation_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for automation_subscriptions
CREATE POLICY "Users can view their own automation subscriptions" 
ON public.automation_subscriptions 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own automation subscriptions" 
ON public.automation_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own automation subscriptions" 
ON public.automation_subscriptions 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service can access automation subscriptions by token" 
ON public.automation_subscriptions 
FOR SELECT 
USING (true);

-- Create function to update credits and check automation status
CREATE OR REPLACE FUNCTION public.deduct_credits(p_custom_page_token TEXT, p_credits_to_deduct INTEGER DEFAULT 2)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_remaining INTEGER;
BEGIN
  -- Check current credits and deduct
  UPDATE public.automation_subscriptions 
  SET 
    credits_used = credits_used + p_credits_to_deduct,
    credits_remaining = credits_remaining - p_credits_to_deduct,
    updated_at = now()
  WHERE custom_page_token = p_custom_page_token
    AND credits_remaining >= p_credits_to_deduct
    AND automation_active = true
    AND subscription_end > now()
  RETURNING credits_remaining INTO current_remaining;
  
  -- If no rows updated, operation failed
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- If credits are exhausted, disable automation
  IF current_remaining <= 0 THEN
    UPDATE public.automation_subscriptions 
    SET automation_active = false
    WHERE custom_page_token = p_custom_page_token;
  END IF;
  
  RETURN true;
END;
$$;

-- Create function to check if automation is allowed
CREATE OR REPLACE FUNCTION public.can_execute_automation(p_custom_page_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_allowed BOOLEAN := false;
BEGIN
  SELECT 
    (automation_active = true 
     AND credits_remaining >= 2 
     AND subscription_end > now())
  INTO is_allowed
  FROM public.automation_subscriptions
  WHERE custom_page_token = p_custom_page_token;
  
  RETURN COALESCE(is_allowed, false);
END;
$$;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_automation_subscriptions_updated_at
BEFORE UPDATE ON public.automation_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();