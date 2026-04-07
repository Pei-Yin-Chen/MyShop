-- 待付款訂單逾時取消（由應用程式排程觸發；「建立超過幾天仍 pending」由程式／環境變數 STALE_PAYUNI_PENDING_DAYS 決定，預設 1 天）。
-- 烘焙／食品庫存不宜長期被未付款訂單佔用；信用卡多為即時授權，ATM 虛擬帳號的銀行繳費期限可能較長，若訂單較早自動取消，客人需重新下單或再開金流。
-- 僅在仍為 pending 時改為 cancelled，並將 order_items 扣庫存加回 products（同一筆交易）。
create or replace function public.cancel_pending_order_restore_stock(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item record;
  v_updated int;
begin
  update public.orders
  set status = 'cancelled', updated_at = now()
  where id = p_order_id and status = 'pending';

  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    return false;
  end if;

  for v_item in
    select product_id, quantity
    from public.order_items
    where order_id = p_order_id
  loop
    if v_item.product_id is not null then
      update public.products
      set stock_quantity = stock_quantity + v_item.quantity
      where id = v_item.product_id;
    end if;
  end loop;

  return true;
end;
$$;

revoke all on function public.cancel_pending_order_restore_stock(uuid) from public;
grant execute on function public.cancel_pending_order_restore_stock(uuid) to service_role;

comment on function public.cancel_pending_order_restore_stock(uuid) is
  '將仍為 pending 的訂單改為 cancelled 並還原商品庫存；若非 pending 則不變更並回傳 false。逾時天數由排程應用設定，非本函式參數。';
