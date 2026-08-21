-- Migration 0002: Repair broken RLS (infinite recursion 42P17)
--
-- Symptom: queries to phones_597p9_models / phones_597p9_services fail with
--   "infinite recursion detected in policy for relation \"phones_597p9_user_roles\""
-- Cause: pre-existing self-referencing policies on legacy tables became active
-- when RLS was enabled by migration 0001.
-- Fix: drop EVERY policy on the app tables, remove stale helper functions,
-- then rebuild clean policies. Safe to run multiple times.

-- ============================================================
-- 1. Drop all existing policies on app tables (by name lookup)
-- ============================================================
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'transactions',
        'phones_597p9_models',
        'phones_597p9_services',
        'user_roles',
        'phone_models',
        'service_types',
        'profiles',
        'phones_597p9_transactions',
        'phones_597p9_user_roles'
      )
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- ============================================================
-- 2. Remove stale/duplicate helper functions (all overloads)
--    Old versions of these queried legacy tables without
--    security definer, causing the recursion.
-- ============================================================
drop function if exists public.is_admin();
drop function if exists public.is_admin(text);
drop function if exists public.get_user_role(text);
drop function if exists public.get_user_role();

-- ============================================================
-- 3. Ensure user_roles exists with the correct shape
-- ============================================================
create table if not exists public.user_roles (
  id uuid primary key references auth.users (id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.user_roles add column if not exists is_admin boolean;
alter table public.user_roles add column if not exists created_at timestamptz not null default now();

alter table public.user_roles enable row level security;

create policy "Users can view own role"
  on public.user_roles
  for select
  using (auth.uid() = id);

-- Admin helper: security definer so it bypasses RLS on user_roles
-- (this is what prevents recursion).
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
-- 4. Transactions: any authenticated user, full access
-- ============================================================
alter table public.transactions enable row level security;

create policy "Authenticated users manage transactions"
  on public.transactions
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================
-- 5. Phone models & services: authenticated read, admin write
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
-- 6. Legacy tables: RLS on, NO policies => deny all access
--    (their old self-referencing policies were removed in step 1)
-- ============================================================
alter table public.phone_models enable row level security;
alter table public.service_types enable row level security;
alter table public.profiles enable row level security;
alter table public.phones_597p9_transactions enable row level security;
alter table public.phones_597p9_user_roles enable row level security;

-- ============================================================
-- 7. IMPORTANT - promote your admin (user_roles is currently empty!)
--    Run this once you know your auth user's uuid, e.g.:
--      select id, email from auth.users;
--    then:
--      insert into public.user_roles (id, is_admin)
--      values ('<your-user-uuid>', true)
--      on conflict (id) do update set is_admin = true;
-- ============================================================
