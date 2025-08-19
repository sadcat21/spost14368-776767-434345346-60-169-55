-- Drop RLS policies that depend on user_id column
DROP POLICY IF EXISTS "Users can view their own automation subscriptions" ON public.automation_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own automation subscriptions" ON public.automation_subscriptions;
DROP POLICY IF EXISTS "Users can update their own automation subscriptions" ON public.automation_subscriptions;

-- Drop the foreign key constraint if it exists
ALTER TABLE public.automation_subscriptions 
DROP CONSTRAINT IF EXISTS automation_subscriptions_facebook_user_id_fkey;

-- Fix facebook_user_id column type from uuid to text
ALTER TABLE public.automation_subscriptions 
ALTER COLUMN facebook_user_id TYPE text;

-- Update the user_id column to also be text for consistency with Facebook user IDs
ALTER TABLE public.automation_subscriptions 
ALTER COLUMN user_id TYPE text;

-- Recreate RLS policies with correct text comparison
CREATE POLICY "Users can view their own automation subscriptions" 
ON public.automation_subscriptions 
FOR SELECT 
USING ((auth.uid())::text = user_id);

CREATE POLICY "Users can insert their own automation subscriptions" 
ON public.automation_subscriptions 
FOR INSERT 
WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Users can update their own automation subscriptions" 
ON public.automation_subscriptions 
FOR UPDATE 
USING ((auth.uid())::text = user_id);