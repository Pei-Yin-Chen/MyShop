-- 後台會員列表：與應用程式 computeMemberAccountStatus 對齊的帳號狀態（供篩選／列表顯示）
create or replace view public.profiles_admin_list
with (security_invoker = true)
as
select
  p.*,
  (
    case
      when p.is_banned then 'banned'
      when greatest(
        coalesce(p.updated_at, p.created_at),
        coalesce(
          (
            select max(greatest(o.created_at, o.updated_at))
            from public.orders o
            where o.user_id = p.id
          ),
          coalesce(p.updated_at, p.created_at)
        )
      ) < (now() at time zone 'utc') - interval '180 days'
      then 'dormant'
      when (
        select count(*)::int
        from public.orders o
        where o.user_id = p.id
          and o.status in ('paid', 'processing', 'shipped', 'completed')
      ) > 2
      then 'repeat_buyer'
      else 'active'
    end
  )::text as admin_account_status
from public.profiles p;

comment on view public.profiles_admin_list is '後台會員列表：含 admin_account_status（與 member-account-status.ts 規則一致）';

grant select on public.profiles_admin_list to authenticated;
grant select on public.profiles_admin_list to service_role;
