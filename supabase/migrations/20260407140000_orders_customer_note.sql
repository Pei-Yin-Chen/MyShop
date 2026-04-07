-- 買家結帳備註（與系統用 notes 分離）
alter table public.orders add column if not exists customer_note text;

comment on column public.orders.notes is '系統／結帳管道標記（如 payment=payuni）';
comment on column public.orders.customer_note is '買家於結帳填寫之備註，最多 500 字由應用程式限制';

-- 舊資料：notes 為 payment=… 且含換行時，將第一行保留於 notes，其餘移入 customer_note
update public.orders o
set
  customer_note = nullif(
    trim(both from substring(o.notes from strpos(o.notes, e'\n') + 1)),
    ''
  ),
  notes = substring(o.notes from 1 for strpos(o.notes, e'\n') - 1)
where o.customer_note is null
  and o.notes like 'payment=%'
  and strpos(o.notes, e'\n') > 0;
