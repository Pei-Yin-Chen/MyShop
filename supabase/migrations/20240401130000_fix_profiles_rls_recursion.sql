-- 修復：policy 內對 profiles 做 EXISTS 子查詢會再次套用 RLS → infinite recursion
-- 改為使用 SECURITY DEFINER 函式（讀取 profiles 時不觸發 RLS）

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

revoke all on function public.current_user_is_admin() from public;
grant execute on function public.current_user_is_admin() to authenticated;
grant execute on function public.current_user_is_admin() to service_role;

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.current_user_is_admin());

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  using (public.current_user_is_admin());
