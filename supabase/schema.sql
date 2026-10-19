-- Run this in Supabase Dashboard -> SQL Editor -> New query.
-- Tables are scoped to the signed-in user using Row Level Security.

create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  firebase_uid text,
  duration_minutes integer not null check (duration_minutes between 1 and 240),
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.usage_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  firebase_uid text,
  app_name text not null check (char_length(app_name) between 1 and 120),
  minutes integer not null check (minutes between 1 and 1440),
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.focus_sessions enable row level security;
alter table public.usage_entries enable row level security;

drop policy if exists "Users can read own focus sessions" on public.focus_sessions;
create policy "Users can read own focus sessions" on public.focus_sessions for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own focus sessions" on public.focus_sessions;
create policy "Users can insert own focus sessions" on public.focus_sessions for insert with check (auth.uid() = user_id);
drop policy if exists "Users can delete own focus sessions" on public.focus_sessions;
create policy "Users can delete own focus sessions" on public.focus_sessions for delete using (auth.uid() = user_id);

drop policy if exists "Users can read own usage entries" on public.usage_entries;
create policy "Users can read own usage entries" on public.usage_entries for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own usage entries" on public.usage_entries;
create policy "Users can insert own usage entries" on public.usage_entries for insert with check (auth.uid() = user_id);
drop policy if exists "Users can delete own usage entries" on public.usage_entries;
create policy "Users can delete own usage entries" on public.usage_entries for delete using (auth.uid() = user_id);

create index if not exists focus_sessions_user_completed_idx on public.focus_sessions (user_id, completed_at desc);
create index if not exists usage_entries_user_date_idx on public.usage_entries (user_id, entry_date desc);

-- Firebase-authenticated server routes use firebase_uid (Firebase UIDs are strings).
create index if not exists focus_sessions_firebase_uid_completed_idx
  on public.focus_sessions (firebase_uid, completed_at desc);
create index if not exists usage_entries_firebase_uid_date_idx
  on public.usage_entries (firebase_uid, entry_date desc);
create unique index if not exists usage_entries_user_app_date_unique
  on public.usage_entries (firebase_uid, app_name, entry_date) where firebase_uid is not null;
