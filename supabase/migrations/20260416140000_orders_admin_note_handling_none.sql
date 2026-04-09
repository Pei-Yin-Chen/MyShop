-- 備註處理狀態：新增 none（無後台備註時），與 pending（有待跟進的備註）區分
alter table public.orders drop constraint if exists orders_admin_note_handling_check;

alter table public.orders add constraint orders_admin_note_handling_check
  check (admin_note_handling_status in ('none', 'pending', 'processing', 'resolved'));

update public.orders
set admin_note_handling_status = 'none'
where admin_note_body is null or trim(admin_note_body) = '';

alter table public.orders alter column admin_note_handling_status set default 'none';

comment on column public.orders.admin_note_handling_status is
  'none=未設定（無後台備註）, pending=待處理, processing=處理中, resolved=已處理';
