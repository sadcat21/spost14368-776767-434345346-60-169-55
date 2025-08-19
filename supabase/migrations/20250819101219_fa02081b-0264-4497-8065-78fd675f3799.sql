-- Ensure required extension for gen_random_uuid/bytes
create extension if not exists pgcrypto;

-- 1) Utility function for updated_at
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2) API keys table
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  key_name text not null,
  key_value text not null,
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(key_name, user_id)
);
alter table public.api_keys enable row level security;
-- Allow default service user or authenticated owners
create policy if not exists "Users can view their own API keys"
  on public.api_keys for select
  using (user_id = '00000000-0000-0000-0000-000000000000' or auth.uid()::text = user_id::text);
create policy if not exists "Users can insert their own API keys"
  on public.api_keys for insert
  with check (user_id = '00000000-0000-0000-0000-000000000000' or auth.uid()::text = user_id::text);
create policy if not exists "Users can update their own API keys"
  on public.api_keys for update
  using (user_id = '00000000-0000-0000-0000-000000000000' or auth.uid()::text = user_id::text);
create trigger if not exists update_api_keys_updated_at
  before update on public.api_keys
  for each row execute function public.update_updated_at_column();

-- 3) Facebook pages
create table if not exists public.facebook_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  page_id text not null,
  page_name text not null,
  access_token text not null,
  is_active boolean not null default true,
  category text,
  picture_url text,
  webhook_status text,
  last_activity timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(page_id, user_id)
);
-- Also ensure global uniqueness if needed by some upserts
do $$ begin
  if not exists (
    select 1 from pg_indexes where schemaname='public' and indexname='facebook_pages_page_id_key'
  ) then
    alter table public.facebook_pages add constraint facebook_pages_page_id_key unique (page_id);
  end if;
end $$;

alter table public.facebook_pages enable row level security;
create policy if not exists "Users can view their own Facebook pages"
  on public.facebook_pages for select
  using (user_id = '00000000-0000-0000-0000-000000000000' or auth.uid()::text = user_id::text);
create policy if not exists "Users can insert their own Facebook pages"
  on public.facebook_pages for insert
  with check (user_id = '00000000-0000-0000-0000-000000000000' or auth.uid()::text = user_id::text);
create policy if not exists "Users can update their own Facebook pages"
  on public.facebook_pages for update
  using (user_id = '00000000-0000-0000-0000-000000000000' or auth.uid()::text = user_id::text);
create trigger if not exists update_facebook_pages_updated_at
  before update on public.facebook_pages
  for each row execute function public.update_updated_at_column();
create index if not exists idx_facebook_pages_page_id on public.facebook_pages(page_id);

-- 4) Page events
create table if not exists public.page_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  page_id text not null,
  post_id text,
  comment_id text,
  message_id text,
  user_id text,
  user_name text,
  content text,
  status text not null default 'pending',
  auto_replied boolean not null default false,
  response_content text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.page_events enable row level security;
create policy if not exists "Anyone can view page events"
  on public.page_events for select using (true);
create policy if not exists "Service can insert page events"
  on public.page_events for insert with check (true);
create policy if not exists "Service can update page events"
  on public.page_events for update using (true);
create trigger if not exists update_page_events_updated_at
  before update on public.page_events
  for each row execute function public.update_updated_at_column();
create index if not exists idx_page_events_event_type_created_at on public.page_events(event_type, created_at desc);

-- 5) Webhook logs
create table if not exists public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  webhook_type text not null,
  page_id text,
  event_data jsonb not null,
  processed boolean not null default false,
  error_message text,
  created_at timestamptz not null default now()
);
alter table public.webhook_logs enable row level security;
create policy if not exists "Anyone can view webhook logs"
  on public.webhook_logs for select using (true);
create policy if not exists "Service can insert webhook logs"
  on public.webhook_logs for insert with check (true);

-- 6) Facebook users
create table if not exists public.facebook_users (
  id uuid primary key default gen_random_uuid(),
  facebook_id text not null unique,
  facebook_name text not null,
  facebook_email text,
  facebook_picture_url text,
  access_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login timestamptz default now()
);
alter table public.facebook_users enable row level security;
create policy if not exists "Users can view their own data"
  on public.facebook_users for select using (true);
create policy if not exists "Users can insert their own data"
  on public.facebook_users for insert with check (true);
create policy if not exists "Users can update their own data"
  on public.facebook_users for update using (true);
create trigger if not exists update_facebook_users_updated_at
  before update on public.facebook_users
  for each row execute function public.update_updated_at_column();
create index if not exists idx_facebook_users_facebook_id on public.facebook_users(facebook_id);

-- 7) Automation subscriptions
create table if not exists public.automation_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  facebook_user_id uuid references public.facebook_users(id),
  page_id text not null,
  page_name text not null,
  page_access_token text not null,
  followers_count integer default 0,
  custom_page_token text not null unique default encode(gen_random_bytes(32), 'hex'),
  subscription_start timestamptz default now(),
  subscription_end timestamptz default (now() + interval '30 days'),
  credits_total integer default 10,
  credits_used integer default 0,
  credits_remaining integer default 10,
  cronjob_id text,
  automation_active boolean default false,
  posts_per_day integer default 1,
  posts_per_week integer default 7,
  execution_times jsonb default '["09:00", "15:00", "21:00"]'::jsonb,
  content_type text default 'mixed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, page_id)
);
alter table public.automation_subscriptions enable row level security;
-- Owner policies
create policy if not exists "Users can view their own automation subscriptions"
  on public.automation_subscriptions for select
  using (auth.uid()::text = user_id::text);
create policy if not exists "Users can insert their own automation subscriptions"
  on public.automation_subscriptions for insert
  with check (auth.uid()::text = user_id::text);
create policy if not exists "Users can update their own automation subscriptions"
  on public.automation_subscriptions for update
  using (auth.uid()::text = user_id::text);
-- Allow service to read by token
create policy if not exists "Service can access automation subscriptions by token"
  on public.automation_subscriptions for select
  using (true);
create trigger if not exists update_automation_subscriptions_updated_at
  before update on public.automation_subscriptions
  for each row execute function public.update_updated_at_column();
create index if not exists idx_automation_subscriptions_token on public.automation_subscriptions(custom_page_token);

-- 8) Credit functions
create or replace function public.deduct_credits(p_custom_page_token text, p_credits_to_deduct integer default 2)
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

-- 9) Profiles table + trigger (optional but useful)
create table if not exists public.profiles (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy if not exists "Profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy if not exists "Users can update their own profile"
  on public.profiles for update using (auth.uid() = user_id);
create policy if not exists "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = user_id);
create trigger if not exists update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

-- Create trigger only if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- 10) Seed default keys (safe to re-run)
insert into public.api_keys (key_name, key_value, user_id)
values
  ('FACEBOOK_ACCESS_TOKEN', '', '00000000-0000-0000-0000-000000000000'),
  ('GEMINI_API_KEY', '', '00000000-0000-0000-0000-000000000000'),
  ('PIXABAY_API_KEY', '', '00000000-0000-0000-0000-000000000000')
on conflict (key_name, user_id) do nothing;