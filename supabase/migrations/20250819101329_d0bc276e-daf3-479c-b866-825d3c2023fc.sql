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

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can view their own API keys" on public.api_keys;
drop policy if exists "Users can insert their own API keys" on public.api_keys;
drop policy if exists "Users can update their own API keys" on public.api_keys;

-- Allow default service user or authenticated owners
create policy "Users can view their own API keys"
  on public.api_keys for select
  using (user_id = '00000000-0000-0000-0000-000000000000' or auth.uid()::text = user_id::text);
create policy "Users can insert their own API keys"
  on public.api_keys for insert
  with check (user_id = '00000000-0000-0000-0000-000000000000' or auth.uid()::text = user_id::text);
create policy "Users can update their own API keys"
  on public.api_keys for update
  using (user_id = '00000000-0000-0000-0000-000000000000' or auth.uid()::text = user_id::text);

drop trigger if exists update_api_keys_updated_at on public.api_keys;
create trigger update_api_keys_updated_at
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

drop policy if exists "Users can view their own Facebook pages" on public.facebook_pages;
drop policy if exists "Users can insert their own Facebook pages" on public.facebook_pages;
drop policy if exists "Users can update their own Facebook pages" on public.facebook_pages;

create policy "Users can view their own Facebook pages"
  on public.facebook_pages for select
  using (user_id = '00000000-0000-0000-0000-000000000000' or auth.uid()::text = user_id::text);
create policy "Users can insert their own Facebook pages"
  on public.facebook_pages for insert
  with check (user_id = '00000000-0000-0000-0000-000000000000' or auth.uid()::text = user_id::text);
create policy "Users can update their own Facebook pages"
  on public.facebook_pages for update
  using (user_id = '00000000-0000-0000-0000-000000000000' or auth.uid()::text = user_id::text);

drop trigger if exists update_facebook_pages_updated_at on public.facebook_pages;
create trigger update_facebook_pages_updated_at
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

drop policy if exists "Anyone can view page events" on public.page_events;
drop policy if exists "Service can insert page events" on public.page_events;
drop policy if exists "Service can update page events" on public.page_events;

create policy "Anyone can view page events"
  on public.page_events for select using (true);
create policy "Service can insert page events"
  on public.page_events for insert with check (true);
create policy "Service can update page events"
  on public.page_events for update using (true);

drop trigger if exists update_page_events_updated_at on public.page_events;
create trigger update_page_events_updated_at
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

drop policy if exists "Anyone can view webhook logs" on public.webhook_logs;
drop policy if exists "Service can insert webhook logs" on public.webhook_logs;

create policy "Anyone can view webhook logs"
  on public.webhook_logs for select using (true);
create policy "Service can insert webhook logs"
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

drop policy if exists "Users can view their own data" on public.facebook_users;
drop policy if exists "Users can insert their own data" on public.facebook_users;
drop policy if exists "Users can update their own data" on public.facebook_users;

create policy "Users can view their own data"
  on public.facebook_users for select using (true);
create policy "Users can insert their own data"
  on public.facebook_users for insert with check (true);
create policy "Users can update their own data"
  on public.facebook_users for update using (true);

drop trigger if exists update_facebook_users_updated_at on public.facebook_users;
create trigger update_facebook_users_updated_at
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

drop policy if exists "Users can view their own automation subscriptions" on public.automation_subscriptions;
drop policy if exists "Users can insert their own automation subscriptions" on public.automation_subscriptions;
drop policy if exists "Users can update their own automation subscriptions" on public.automation_subscriptions;
drop policy if exists "Service can access automation subscriptions by token" on public.automation_subscriptions;

-- Owner policies
create policy "Users can view their own automation subscriptions"
  on public.automation_subscriptions for select
  using (auth.uid()::text = user_id::text);
create policy "Users can insert their own automation subscriptions"
  on public.automation_subscriptions for insert
  with check (auth.uid()::text = user_id::text);
create policy "Users can update their own automation subscriptions"
  on public.automation_subscriptions for update
  using (auth.uid()::text = user_id::text);
-- Allow service to read by token
create policy "Service can access automation subscriptions by token"
  on public.automation_subscriptions for select
  using (true);

drop trigger if exists update_automation_subscriptions_updated_at on public.automation_subscriptions;
create trigger update_automation_subscriptions_updated_at
  before update on public.automation_subscriptions
  for each row execute function public.update_updated_at_column();
create index if not exists idx_automation_subscriptions_token on public.automation_subscriptions(custom_page_token);

-- 8) Profiles table + trigger
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

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = user_id);
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = user_id);

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- 9) New user function and trigger
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