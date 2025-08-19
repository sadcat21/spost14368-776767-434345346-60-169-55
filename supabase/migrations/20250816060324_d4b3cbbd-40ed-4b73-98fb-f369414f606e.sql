-- Fix security linter warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.deduct_credits(p_custom_page_token TEXT, p_credits_to_deduct INTEGER DEFAULT 2)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix security linter warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.can_execute_automation(p_custom_page_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix the handle_new_user function to set search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$;