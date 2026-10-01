-- Run once: Supabase dashboard > SQL Editor > New query > paste > Run
create table if not exists public.user_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  paid boolean not null default false,
  reference text unique,
  amount integer,
  paid_at timestamptz default now()
);
alter table public.user_access enable row level security;
-- Students can only READ their own row. Nobody can write from the browser;
-- only the Netlify functions (service role) can mark someone as paid.
create policy "read own access" on public.user_access for select using (auth.uid() = user_id);
