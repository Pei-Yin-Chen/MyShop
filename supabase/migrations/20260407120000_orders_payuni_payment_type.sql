-- PAYUNi 付款完成回傳（EncryptInfo 解密）之付款方式代碼，於 Notify / Return 更新為 paid 時寫入。
alter table public.orders add column if not exists payuni_payment_type text;

comment on column public.orders.payuni_payment_type is
  'PAYUNi 回傳之付款方式（如 PaymentType 或各通路旗標）；見 lib/payuni/payment-channel.ts';
