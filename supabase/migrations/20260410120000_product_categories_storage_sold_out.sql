-- 一層商品分類、售完狀態、商品圖 Storage bucket（管理員上傳）

-- -----------------------------------------------------------------------------
-- 1) product_categories
-- -----------------------------------------------------------------------------
create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint product_categories_name_unique unique (name)
);

comment on table public.product_categories is '商品分類（一層）';

create index product_categories_sort_order_idx on public.product_categories (sort_order, name);

alter table public.product_categories enable row level security;

create policy "Product categories viewable by everyone"
  on public.product_categories for select
  using (true);

create policy "Admins manage product categories"
  on public.product_categories for all
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

grant select on table public.product_categories to anon;
grant select, insert, update, delete on table public.product_categories to authenticated;

-- -----------------------------------------------------------------------------
-- 2) 由既有 products.category 建立分類並改為 category_id
-- -----------------------------------------------------------------------------
insert into public.product_categories (name, sort_order)
select d.category, row_number() over (order by d.category)
from (select distinct category from public.products) d;

alter table public.products
  add column category_id uuid references public.product_categories (id) on delete restrict;

update public.products p
set category_id = c.id
from public.product_categories c
where c.name = p.category;

alter table public.products alter column category_id set not null;

alter table public.products drop column category;

create index products_category_id_idx on public.products (category_id);

-- -----------------------------------------------------------------------------
-- 3) 狀態：上架 active、下架 archived、售完 sold_out（保留 draft）
-- -----------------------------------------------------------------------------
alter table public.products drop constraint if exists products_status_check;

alter table public.products
  add constraint products_status_check
  check (status in ('draft', 'active', 'archived', 'sold_out'));

-- -----------------------------------------------------------------------------
-- 4) Storage：公開讀、管理員寫入
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

create policy "Public read product images bucket"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

create policy "Admins upload product images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and public.current_user_is_admin()
  );

create policy "Admins update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.current_user_is_admin())
  with check (bucket_id = 'product-images' and public.current_user_is_admin());

create policy "Admins delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.current_user_is_admin());

-- -----------------------------------------------------------------------------
-- 5) 管理後台重排圖片 sort_order（避開 unique (product_id, sort_order) 衝突）
-- -----------------------------------------------------------------------------
create or replace function public.reorder_product_images(p_product_id uuid, p_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  i int := 0;
  img_id uuid;
begin
  if auth.uid() is null or not public.current_user_is_admin() then
    raise exception 'forbidden';
  end if;

  update public.product_images
  set sort_order = sort_order + 100000
  where product_id = p_product_id;

  foreach img_id in array p_ids loop
    update public.product_images
    set sort_order = i
    where id = img_id and product_id = p_product_id;
    i := i + 1;
  end loop;
end;
$$;

revoke all on function public.reorder_product_images(uuid, uuid[]) from public;
grant execute on function public.reorder_product_images(uuid, uuid[]) to authenticated;
grant execute on function public.reorder_product_images(uuid, uuid[]) to service_role;
