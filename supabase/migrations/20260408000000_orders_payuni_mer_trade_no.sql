-- 每次送 PAYUNi UPP 的 MerTradeNo；首刷與 order_number 相同，重試時改為新產生，避免平台「短時間內重複」拒絕。
-- Notify / Return 以 order_number 或 payuni_mer_trade_no 任一端比對即可。
alter table public.orders
  add column if not exists payuni_mer_trade_no text;

create index if not exists orders_payuni_mer_trade_no_idx
  on public.orders (payuni_mer_trade_no)
  where payuni_mer_trade_no is not null;
