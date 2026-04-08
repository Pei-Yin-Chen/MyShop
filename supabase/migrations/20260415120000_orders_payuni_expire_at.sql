-- PAYUNi：ExpireDate 為「下單日（台北）+1」日曆日時，該期限日 23:59:59 後即逾期；本欄存該期限日結束後第一瞬間（台北隔日 00:00）之 UTC（timestamptz），供排程／顯示。
alter table public.orders add column if not exists payuni_expire_at timestamptz;

comment on column public.orders.payuni_expire_at is
  'PAYUNi：ExpireDate 該日曆日 23:59:59 後即逾期；此欄為該日結束後第一瞬間（台北隔日 00:00）之 UTC。顯示請用 Asia/Taipei。';

create index if not exists orders_payuni_expire_at_pending_idx
  on public.orders (payuni_expire_at)
  where status = 'pending' and payuni_expire_at is not null;
