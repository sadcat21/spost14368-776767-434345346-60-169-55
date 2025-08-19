-- Fix facebook_user_id column type from uuid to text
ALTER TABLE public.automation_subscriptions 
ALTER COLUMN facebook_user_id TYPE text;

-- Update the user_id column to also be text for consistency with Facebook user IDs
ALTER TABLE public.automation_subscriptions 
ALTER COLUMN user_id TYPE text;