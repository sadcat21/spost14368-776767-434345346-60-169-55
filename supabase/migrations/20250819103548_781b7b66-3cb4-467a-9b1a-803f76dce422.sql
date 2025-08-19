-- Function to create or update Facebook page
create or replace function public.upsert_facebook_page(
  p_user_id uuid,
  p_page_id text,
  p_page_name text,
  p_access_token text,
  p_picture_url text default null,
  p_category text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  result_id uuid;
begin
  insert into public.facebook_pages (
    user_id, page_id, page_name, access_token, picture_url, category, is_active
  ) values (
    p_user_id, p_page_id, p_page_name, p_access_token, p_picture_url, p_category, true
  )
  on conflict (page_id, user_id)
  do update set
    page_name = excluded.page_name,
    access_token = excluded.access_token,
    picture_url = excluded.picture_url,
    category = excluded.category,
    is_active = true,
    updated_at = now()
  returning id into result_id;
  
  return result_id;
end;
$$;

-- Function to get user's active Facebook pages
create or replace function public.get_user_facebook_pages(p_user_id uuid)
returns table(
  id uuid,
  page_id text,
  page_name text,
  picture_url text,
  category text,
  is_active boolean,
  webhook_status text,
  last_activity timestamp with time zone
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    fp.id,
    fp.page_id,
    fp.page_name,
    fp.picture_url,
    fp.category,
    fp.is_active,
    fp.webhook_status,
    fp.last_activity
  from public.facebook_pages fp
  where fp.user_id = p_user_id
  order by fp.is_active desc, fp.updated_at desc;
end;
$$;

-- Function to update webhook status
create or replace function public.update_webhook_status(
  p_page_id text,
  p_status text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.facebook_pages
  set 
    webhook_status = p_status,
    last_activity = now(),
    updated_at = now()
  where page_id = p_page_id;
  
  return found;
end;
$$;

-- Function to create automation subscription
create or replace function public.create_automation_subscription(
  p_user_id uuid,
  p_page_id text,
  p_page_name text,
  p_page_access_token text,
  p_posts_per_day integer default 1,
  p_content_type text default 'mixed',
  p_execution_times jsonb default '["09:00", "15:00", "21:00"]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  subscription_id uuid;
begin
  insert into public.automation_subscriptions (
    user_id,
    page_id,
    page_name,
    page_access_token,
    posts_per_day,
    content_type,
    execution_times,
    automation_active,
    credits_total,
    credits_remaining
  ) values (
    p_user_id,
    p_page_id,
    p_page_name,
    p_page_access_token,
    p_posts_per_day,
    p_content_type,
    p_execution_times,
    true,
    10,
    10
  )
  returning id into subscription_id;
  
  return subscription_id;
end;
$$;

-- Function to get page events with pagination
create or replace function public.get_page_events(
  p_page_id text,
  p_limit integer default 50,
  p_offset integer default 0
)
returns table(
  id uuid,
  event_type text,
  user_name text,
  content text,
  status text,
  auto_replied boolean,
  response_content text,
  created_at timestamp with time zone
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    pe.id,
    pe.event_type,
    pe.user_name,
    pe.content,
    pe.status,
    pe.auto_replied,
    pe.response_content,
    pe.created_at
  from public.page_events pe
  where pe.page_id = p_page_id
  order by pe.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;

-- Function to get analytics for a page
create or replace function public.get_page_analytics(
  p_page_id text,
  p_days integer default 7
)
returns table(
  total_events bigint,
  comments_count bigint,
  messages_count bigint,
  auto_replies_count bigint,
  pending_count bigint,
  success_count bigint,
  error_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    count(*) as total_events,
    count(*) filter (where event_type = 'comment') as comments_count,
    count(*) filter (where event_type = 'message') as messages_count,
    count(*) filter (where auto_replied = true) as auto_replies_count,
    count(*) filter (where status = 'pending') as pending_count,
    count(*) filter (where status = 'success') as success_count,
    count(*) filter (where status = 'error') as error_count
  from public.page_events
  where page_id = p_page_id
    and created_at >= now() - (p_days || ' days')::interval;
end;
$$;

-- Function to clean old webhook logs
create or replace function public.cleanup_old_webhook_logs()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.webhook_logs
  where created_at < now() - interval '30 days';
  
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- Function to get user subscription status
create or replace function public.get_user_subscription_status(p_user_id uuid)
returns table(
  has_active_subscription boolean,
  total_credits integer,
  remaining_credits integer,
  subscription_end timestamp with time zone,
  pages_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    coalesce(bool_or(automation_active and subscription_end > now()), false) as has_active_subscription,
    coalesce(sum(credits_total), 0)::integer as total_credits,
    coalesce(sum(credits_remaining), 0)::integer as remaining_credits,
    max(subscription_end) as subscription_end,
    count(*) as pages_count
  from public.automation_subscriptions
  where user_id = p_user_id;
end;
$$;

-- Function to deactivate expired subscriptions
create or replace function public.deactivate_expired_subscriptions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  update public.automation_subscriptions
  set 
    automation_active = false,
    updated_at = now()
  where automation_active = true
    and subscription_end <= now();
  
  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

-- Function to get automation schedule
create or replace function public.get_automation_schedule()
returns table(
  id uuid,
  user_id uuid,
  page_id text,
  page_name text,
  posts_per_day integer,
  execution_times jsonb,
  content_type text,
  credits_remaining integer,
  custom_page_token text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    a.id,
    a.user_id,
    a.page_id,
    a.page_name,
    a.posts_per_day,
    a.execution_times,
    a.content_type,
    a.credits_remaining,
    a.custom_page_token
  from public.automation_subscriptions a
  where a.automation_active = true
    and a.subscription_end > now()
    and a.credits_remaining > 0;
end;
$$;