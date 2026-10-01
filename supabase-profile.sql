-- Run once: Supabase dashboard > SQL Editor > New query > paste > Run
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);
alter table public.user_profiles enable row level security;
create policy "read own profile" on public.user_profiles for select using (auth.uid() = id);
create policy "insert own profile" on public.user_profiles for insert with check (auth.uid() = id);
create policy "update own profile" on public.user_profiles for update using (auth.uid() = id) with check (auth.uid() = id);
