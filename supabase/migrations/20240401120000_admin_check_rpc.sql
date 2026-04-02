-- Reliable admin check for proxy / RLS edge cases (SECURITY DEFINER reads profiles)
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
