-- 徹底修復 profiles RLS infinite recursion：
-- 1) 函式內查詢須 SET row_security = off，否則部分環境仍會對 profiles 再套用 policy
-- 2) 先移除 public.profiles 上所有既有 policy，再重建（避免舊版 EXISTS 政策殘留）

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
  loop
    execute format('drop policy if exists %I on public.profiles', pol.policyname);
  end loop;
end $$;

create or replace function public.current_user_is_admin()
returns boolean
language sql
security definer
set search_path = public
set row_security = off
stable
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

alter function public.current_user_is_admin() owner to postgres;

revoke all on function public.current_user_is_admin() from public;
grant execute on function public.current_user_is_admin() to authenticated;
grant execute on function public.current_user_is_admin() to service_role;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.current_user_is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can update any profile"
  on public.profiles for update
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());
