-- PAYUNi 回傳之 ATM／超商等離線繳費欄位（EncryptInfo 解密），與 payuni_payment_type 搭配使用
alter table public.orders add column if not exists payuni_payment_detail jsonb;

comment on column public.orders.payuni_payment_detail is
  'PAYUNi 解密欄位快照（bankType, payNo, expireDate, store 等）；見 lib/payuni/payment-detail.ts';
