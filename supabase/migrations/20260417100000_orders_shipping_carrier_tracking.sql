-- 後台出貨：物流公司、追蹤號、出貨時間
alter table public.orders
  add column if not exists shipping_carrier text null;

alter table public.orders
  add column if not exists shipping_tracking_number text null;

alter table public.orders
  add column if not exists shipped_at timestamptz null;

alter table public.orders drop constraint if exists orders_shipping_tracking_len;
alter table public.orders add constraint orders_shipping_tracking_len
  check (shipping_tracking_number is null or char_length(shipping_tracking_number) <= 120);

comment on column public.orders.shipping_carrier is '物流公司代碼（後台出貨選擇，如 black_cat）';
comment on column public.orders.shipping_tracking_number is '物流追蹤號碼';
comment on column public.orders.shipped_at is '後台標記出貨時間';
