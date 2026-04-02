-- 還原「法式檸檬塔」「巧克力閃電泡芙」為甜點分類（若曾執行過將甜點改為蛋糕的 UPDATE）
update public.products
set category = '甜點'
where id in (
  'b993393e-6194-4cf1-9e22-197b32319a2e',
  '98250ae1-b74c-4f7f-8fe5-37e6f742fe01'
);
