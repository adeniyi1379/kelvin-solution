-- Migration 0001: Replace Auth0 with Supabase Auth + Row Level Security
-- Run this in the Supabase SQL Editor (or via `supabase db push`).

-- ============================================================
-- 1. User roles, linked to Supabase auth users
-- ============================================================
create table public.user_roles (
  id uuid primary key references auth.users (id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

create policy "Users can view own role"
  on public.user_roles
  for select
  using (auth.uid() = id);

-- Admin helper. security definer so policies can check roles
-- without recursing through user_roles' own RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where id = auth.uid() and is_admin
  );
$$;

-- ============================================================
-- 2. Transactions: any authenticated user has full access
-- ============================================================
alter table public.transactions enable row level security;

create policy "Authenticated users manage transactions"
  on public.transactions
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================
-- 3. Phone models & services: authenticated read, admin write
-- ============================================================
alter table public.phones_597p9_models enable row level security;
alter table public.phones_597p9_services enable row level security;

create policy "Authenticated users view phone models"
  on public.phones_597p9_models
  for select
  using (auth.role() = 'authenticated');

create policy "Admins manage phone models"
  on public.phones_597p9_models
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Authenticated users view services"
  on public.phones_597p9_services
  for select
  using (auth.role() = 'authenticated');

create policy "Admins manage services"
  on public.phones_597p9_services
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- 4. Lock down unused/legacy tables (deny all access)
--    These tables are not used by the app; enabling RLS with
--    no policies blocks all access via the anon key.
-- ============================================================
alter table public.phone_models enable row level security;
alter table public.service_types enable row level security;
alter table public.profiles enable row level security;
alter table public.phones_597p9_transactions enable row level security;
alter table public.phones_597p9_user_roles enable row level security;

-- Once confirmed nothing needs them, they can be dropped:
-- drop table public.phone_models;
-- drop table public.service_types;
-- drop table public.profiles;
-- drop table public.phones_597p9_transactions;
-- drop table public.phones_597p9_user_roles;

-- ============================================================
-- Setup checklist (after running the migration):
--
-- 1. Authentication -> Sign In / Up: turn OFF "Allow new users
--    to sign up" (accounts are created by admins only).
-- 2. Authentication -> Users -> "Add user": create each staff
--    account with email + password.
-- 3. Promote an admin:
--      insert into public.user_roles (id, is_admin)
--      values ('<auth-user-uuid>', true)
--      on conflict (id) do update set is_admin = true;
-- 4. Authentication -> URL Configuration:
--      Site URL: https://kpsales.vercel.app
--      Redirect URLs: https://kpsales.vercel.app, http://localhost:5173
-- ============================================================
