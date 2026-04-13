-- 宅配：管理員確認送達時間（門市自取不使用此欄）
alter table public.orders
  add column if not exists delivered_at timestamptz;

comment on column public.orders.delivered_at is
  '宅配訂單送達時間；由後台「確認送達」或將狀態改為已完成時寫入';
