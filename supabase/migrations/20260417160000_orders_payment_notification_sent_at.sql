-- 付款成功通知（寄信）已送出時間；避免 PAYUNi notify 與 return 重複寄信
alter table public.orders
  add column if not exists payment_notification_sent_at timestamptz;

comment on column public.orders.payment_notification_sent_at is
  '首次付款成功通知（Resend）已發送時間';
