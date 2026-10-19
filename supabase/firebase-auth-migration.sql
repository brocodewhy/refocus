-- Additive migration for Firebase-authenticated REFOCUS routes.
-- Back up your database before running this in Supabase SQL Editor.
-- It preserves legacy user_id columns and existing rows.

alter table public.focus_sessions add column if not exists firebase_uid text;
alter table public.usage_entries add column if not exists firebase_uid text;
alter table public.focus_sessions alter column user_id drop not null;
alter table public.usage_entries alter column user_id drop not null;

create index if not exists focus_sessions_firebase_uid_completed_idx
  on public.focus_sessions (firebase_uid, completed_at desc);
create index if not exists usage_entries_firebase_uid_date_idx
  on public.usage_entries (firebase_uid, entry_date desc);

-- Existing duplicate rows must be cleaned up before creating this unique index.
create unique index if not exists usage_entries_user_app_date_unique
  on public.usage_entries (firebase_uid, app_name, entry_date) where firebase_uid is not null;
