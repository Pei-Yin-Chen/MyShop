-- 後台訂單備註：orders.admin_note_body / admin_note_handling_status（每筆訂單一筆）
alter table public.orders
  add column if not exists admin_note_body text null;

alter table public.orders
  add column if not exists admin_note_handling_status text not null default 'pending';

alter table public.orders drop constraint if exists orders_admin_note_body_len;
alter table public.orders add constraint orders_admin_note_body_len
  check (admin_note_body is null or char_length(admin_note_body) <= 250);

alter table public.orders drop constraint if exists orders_admin_note_handling_check;
alter table public.orders add constraint orders_admin_note_handling_check
  check (admin_note_handling_status in ('pending', 'processing', 'resolved'));

comment on column public.orders.admin_note_body is '後台訂單備註（僅管理員）；每筆訂單最多一筆';
comment on column public.orders.admin_note_handling_status is 'pending=待處理, processing=處理中, resolved=已處理';

-- 若曾套用舊版 order_admin_note_entries，合併至 orders 後刪表（新環境不會有此表）
do $m$
begin
  if to_regclass('public.order_admin_note_entries') is not null then
    update public.orders o
    set
      admin_note_body = sub.body,
      admin_note_handling_status = sub.handling_status
    from (
      select distinct on (order_id) order_id, body, handling_status
      from public.order_admin_note_entries
      order by order_id, created_at desc
    ) sub
    where o.id = sub.order_id;

    drop table public.order_admin_note_entries cascade;
  end if;
end;
$m$;
