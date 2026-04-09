-- PAYUNi 物流查詢用快取：查詢成功或 Notify 帶回時寫入，供後台自動帶入
alter table public.orders
  add column if not exists payuni_logistics_lgs_type text null;

alter table public.orders
  add column if not exists payuni_logistics_ship_trade_no text null;

alter table public.orders
  add column if not exists payuni_logistics_trade_type text null;

alter table public.orders
  add column if not exists payuni_logistics_return_odno text null;

comment on column public.orders.payuni_logistics_lgs_type is 'PAYUNi LgsType：B2C/C2C/HOME/C2B';
comment on column public.orders.payuni_logistics_ship_trade_no is 'PAYUNi UNi 物流序號 ShipTradeNo';
comment on column public.orders.payuni_logistics_trade_type is 'PAYUNi 宅配 TradeType：1 正物流／2 逆物流';
comment on column public.orders.payuni_logistics_return_odno is 'PAYUNi 退貨便 12 碼（查詢／Notify 帶回時快取）';
