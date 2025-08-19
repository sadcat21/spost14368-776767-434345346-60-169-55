-- Create the deduct_credits function
create or replace function public.deduct_credits(p_custom_page_token text, p_credits_to_deduct integer default 1)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_remaining integer;
begin
  update public.automation_subscriptions
  set 
    credits_used = credits_used + p_credits_to_deduct,
    credits_remaining = credits_remaining - p_credits_to_deduct,
    updated_at = now()
  where custom_page_token = p_custom_page_token
    and credits_remaining >= p_credits_to_deduct
    and automation_active = true
    and subscription_end > now()
  returning credits_remaining into current_remaining;

  if not found then
    return false;
  end if;

  if current_remaining <= 0 then
    update public.automation_subscriptions
    set automation_active = false
    where custom_page_token = p_custom_page_token;
  end if;

  return true;
end;
$$;

-- Add the can_execute_automation function
create or replace function public.can_execute_automation(p_custom_page_token text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  is_allowed boolean := false;
begin
  select 
    (automation_active = true and credits_remaining >= 2 and subscription_end > now())
  into is_allowed
  from public.automation_subscriptions
  where custom_page_token = p_custom_page_token;

  return coalesce(is_allowed, false);
end;
$$;

-- Create function to reset daily credits
create or replace function public.reset_daily_credits()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.automation_subscriptions
  set 
    credits_remaining = credits_total,
    credits_used = 0,
    updated_at = now()
  where subscription_end > now()
    and automation_active = true;
end;
$$;

-- Create function to get automation status
create or replace function public.get_automation_status(p_custom_page_token text)
returns table(
  active boolean,
  credits_remaining integer,
  credits_total integer,
  subscription_end timestamp with time zone,
  posts_per_day integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    automation_active,
    a.credits_remaining,
    a.credits_total,
    a.subscription_end,
    a.posts_per_day
  from public.automation_subscriptions a
  where a.custom_page_token = p_custom_page_token;
end;
$$;

-- Create function to extend subscription
create or replace function public.extend_subscription(p_user_id uuid, p_days integer default 30)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.automation_subscriptions
  set 
    subscription_end = case 
      when subscription_end > now() then subscription_end + (p_days || ' days')::interval
      else now() + (p_days || ' days')::interval
    end,
    automation_active = true,
    updated_at = now()
  where user_id = p_user_id;

  return found;
end;
$$;

-- Create indexes for better performance
create index if not exists idx_automation_subscriptions_user_id on public.automation_subscriptions(user_id);
create index if not exists idx_automation_subscriptions_page_token on public.automation_subscriptions(custom_page_token);
create index if not exists idx_automation_subscriptions_active on public.automation_subscriptions(automation_active) where automation_active = true;

create index if not exists idx_facebook_pages_user_id on public.facebook_pages(user_id);
create index if not exists idx_facebook_pages_page_id on public.facebook_pages(page_id);

create index if not exists idx_page_events_page_id on public.page_events(page_id);
create index if not exists idx_page_events_created_at on public.page_events(created_at);
create index if not exists idx_page_events_status on public.page_events(status);

create index if not exists idx_webhook_logs_created_at on public.webhook_logs(created_at);
create index if not exists idx_webhook_logs_page_id on public.webhook_logs(page_id);