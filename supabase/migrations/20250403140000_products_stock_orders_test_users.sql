-- =============================================================================
-- 1) 商品：庫存、上架狀態、主圖 URL（與 product_images 第一張同步；列表／報表用）
-- 2) 訂單 + 訂單項目（對應結帳：收件人、運送方式、運費、小計、總計、狀態）
-- 3) 五名一般測試帳號（auth.users + auth.identities，觸發器會建立 profiles）
-- 4) 三筆新商品種子 + 三筆測試訂單
-- =============================================================================

-- 需 pgcrypto 產生密碼雜湊（Supabase 通常已啟用）
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- products 擴充欄位
-- -----------------------------------------------------------------------------
alter table public.products
  add column if not exists stock_quantity integer not null default 0
    constraint products_stock_quantity_nonnegative check (stock_quantity >= 0);

alter table public.products
  add column if not exists status text not null default 'active'
    constraint products_status_check check (status in ('draft', 'active', 'archived'));

alter table public.products
  add column if not exists image_url text;

comment on column public.products.stock_quantity is '庫存數量（可出貨數）';
comment on column public.products.status is 'draft=未上架, active=上架, archived=下架';
comment on column public.products.image_url is '主圖 URL（建議與 product_images sort_order 最小者一致）';

-- 由現有圖片回填主圖
update public.products p
set image_url = sub.first_url
from (
  select distinct on (pi.product_id)
    pi.product_id,
    pi.image_url as first_url
  from public.product_images pi
  order by pi.product_id, pi.sort_order asc
) sub
where p.id = sub.product_id
  and (p.image_url is null or p.image_url = '');

-- 既有 10 筆商品庫存（示意）
update public.products set stock_quantity = 48, status = 'active' where id = '04a04b55-478f-4ef7-a91a-672144764ed2';
update public.products set stock_quantity = 32, status = 'active' where id = 'f18323be-7199-4a1d-8c3c-428fc5ec8826';
update public.products set stock_quantity = 120, status = 'active' where id = '85acc9b4-ecee-4437-bbd3-d8fe5f729cd1';
update public.products set stock_quantity = 24, status = 'active' where id = 'f440241d-6f3d-4a42-bda1-5c7277b0ceb1';
update public.products set stock_quantity = 36, status = 'active' where id = '07f033c9-58bf-434e-9bba-bb2b604119e7';
update public.products set stock_quantity = 18, status = 'active' where id = '28aaef0e-a8ad-4251-8f21-583aa9645ba3';
update public.products set stock_quantity = 55, status = 'active' where id = 'e515c787-fa6d-4812-a4ae-dbb6f1b8603a';
update public.products set stock_quantity = 28, status = 'active' where id = 'fb99d83c-ec20-4a43-9025-2788ebb82454';
update public.products set stock_quantity = 22, status = 'active' where id = 'b993393e-6194-4cf1-9e22-197b32319a2e';
update public.products set stock_quantity = 40, status = 'active' where id = '98250ae1-b74c-4f7f-8fe5-37e6f742fe01';

-- -----------------------------------------------------------------------------
-- 三筆額外測試商品（含 ID、品名、價格、庫存、描述、主圖、狀態）
-- -----------------------------------------------------------------------------
insert into public.products (
  id, name, subtitle, price, category, description, full_description, details,
  rating, review_count, is_featured, display_order,
  stock_quantity, status, image_url
)
values
(
  'd0d0d0d0-0001-4000-8000-000000000001',
  '測試品｜焦糖布丁杯',
  '門市限定',
  95,
  '甜點',
  '滑順烤布丁淋上薄薄焦糖醬，單杯剛好一份。',
  '以鮮奶油與香草莢慢煮蛋奶液，隔水烘烤後冷藏定型。焦糖以小火煮至琥珀色，微苦回甘。',
  $json$[{"label":"保存方式","value":"冷藏 3 日"},{"label":"過敏原","value":"蛋、奶"}]$json$::jsonb,
  4.5, 12, false, 11,
  60, 'active',
  'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=800'
),
(
  'd0d0d0d0-0001-4000-8000-000000000002',
  '測試品｜抹茶千層切片',
  '試賣',
  210,
  '蛋糕',
  '二十層薄餅與抹茶奶油堆疊，茶韻清爽。',
  '選用宇治抹茶製作香緹奶油，餅皮以鐵板煎製，層層堆疊後冷藏定型再切片。',
  $json$[{"label":"保存方式","value":"冷藏 2 日"},{"label":"規格","value":"約 8cm 切片"}]$json$::jsonb,
  4.6, 8, false, 12,
  14, 'draft',
  'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=800'
),
(
  'd0d0d0d0-0001-4000-8000-000000000003',
  '測試品｜核桃雜糧小餐包（3入）',
  '高纖',
  135,
  '麵包',
  '核桃與雜糧揉入軟質餐包，早餐搭配咖啡剛好。',
  '使用全麥與裸麥粉，拌入烤香核桃與葵花籽，低糖配方。',
  $json$[{"label":"保存方式","value":"常溫 2 日"},{"label":"規格","value":"3 入/袋"}]$json$::jsonb,
  4.3, 20, false, 13,
  45, 'active',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800'
)
on conflict (id) do nothing;

insert into public.product_images (product_id, image_url, alt_text, sort_order)
values
('d0d0d0d0-0001-4000-8000-000000000001', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=800', '焦糖布丁杯', 0),
('d0d0d0d0-0001-4000-8000-000000000002', 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=800', '抹茶千層', 0),
('d0d0d0d0-0001-4000-8000-000000000003', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800', '雜糧餐包', 0)
on conflict (product_id, sort_order) do nothing;

-- -----------------------------------------------------------------------------
-- 訂單主檔（對齊 checkout：姓名、電話、email、地址、運送方式、運費）
-- -----------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  order_number text not null unique,
  recipient_name text not null,
  recipient_phone text not null,
  recipient_email text not null,
  shipping_address text,
  shipping_method text not null check (shipping_method in ('home', 'store')),
  shipping_fee integer not null default 0 check (shipping_fee >= 0),
  subtotal integer not null check (subtotal >= 0),
  total integer not null check (total >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.orders is '訂單主檔；結帳快照與金額';
comment on column public.orders.shipping_method is 'home=宅配, store=門市自取';

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total integer not null check (line_total >= 0),
  image_url text,
  created_at timestamptz not null default now()
);

comment on table public.order_items is '訂單明細；品名與單價為下單當下快照';

create index orders_user_id_idx on public.orders (user_id);
create index orders_created_at_idx on public.orders (created_at desc);
create index order_items_order_id_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id or public.current_user_is_admin());

create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Admins insert orders"
  on public.orders for insert
  with check (public.current_user_is_admin());

create policy "Admins manage orders"
  on public.orders for update
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Admins delete orders"
  on public.orders for delete
  using (public.current_user_is_admin());

create policy "Users can view items of own orders"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or public.current_user_is_admin())
    )
  );

create policy "Users can insert items for own orders"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

create policy "Admins insert order items"
  on public.order_items for insert
  with check (public.current_user_is_admin());

create policy "Admins manage order items"
  on public.order_items for update
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Admins delete order items"
  on public.order_items for delete
  using (public.current_user_is_admin());

grant select, insert on table public.orders to authenticated;
grant select, insert on table public.order_items to authenticated;
grant all on table public.orders to service_role;
grant all on table public.order_items to service_role;

-- -----------------------------------------------------------------------------
-- 五名一般測試使用者（密碼一律 TestPass123!，僅供開發）
-- -----------------------------------------------------------------------------
do $seed_users$
declare
  inst uuid;
begin
  begin
  select i.id into inst from auth.instances i limit 1;
  if inst is null then
    select u.instance_id into inst from auth.users u where u.instance_id is not null limit 1;
  end if;

  if inst is null then
    raise notice '無法取得 instance_id，略過測試使用者種子';
    return;
  end if;

  -- 1
  if not exists (select 1 from auth.users where id = 'c01afc00-0001-4000-8000-000000000001'::uuid) then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      inst, 'c01afc00-0001-4000-8000-000000000001', 'authenticated', 'authenticated',
      'buyer01@myshop.test',
      crypt('TestPass123!', gen_salt('bf')),
      now(), '{}', '{"full_name":"一般使用者一號"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    insert into auth.identities (
      provider_id, user_id, identity_data, provider, created_at, updated_at
    ) values (
      'buyer01@myshop.test',
      'c01afc00-0001-4000-8000-000000000001',
      jsonb_build_object(
        'sub', 'c01afc00-0001-4000-8000-000000000001',
        'email', 'buyer01@myshop.test',
        'email_verified', true,
        'phone_verified', false
      ),
      'email', now(), now()
    );
  end if;

  -- 2
  if not exists (select 1 from auth.users where id = 'c01afc00-0001-4000-8000-000000000002'::uuid) then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      inst, 'c01afc00-0001-4000-8000-000000000002', 'authenticated', 'authenticated',
      'buyer02@myshop.test',
      crypt('TestPass123!', gen_salt('bf')),
      now(), '{}', '{"full_name":"一般使用者二號"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    insert into auth.identities (
      provider_id, user_id, identity_data, provider, created_at, updated_at
    ) values (
      'buyer02@myshop.test',
      'c01afc00-0001-4000-8000-000000000002',
      jsonb_build_object(
        'sub', 'c01afc00-0001-4000-8000-000000000002',
        'email', 'buyer02@myshop.test',
        'email_verified', true,
        'phone_verified', false
      ),
      'email', now(), now()
    );
  end if;

  -- 3
  if not exists (select 1 from auth.users where id = 'c01afc00-0001-4000-8000-000000000003'::uuid) then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      inst, 'c01afc00-0001-4000-8000-000000000003', 'authenticated', 'authenticated',
      'buyer03@myshop.test',
      crypt('TestPass123!', gen_salt('bf')),
      now(), '{}', '{"full_name":"一般使用者三號"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    insert into auth.identities (
      provider_id, user_id, identity_data, provider, created_at, updated_at
    ) values (
      'buyer03@myshop.test',
      'c01afc00-0001-4000-8000-000000000003',
      jsonb_build_object(
        'sub', 'c01afc00-0001-4000-8000-000000000003',
        'email', 'buyer03@myshop.test',
        'email_verified', true,
        'phone_verified', false
      ),
      'email', now(), now()
    );
  end if;

  -- 4
  if not exists (select 1 from auth.users where id = 'c01afc00-0001-4000-8000-000000000004'::uuid) then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      inst, 'c01afc00-0001-4000-8000-000000000004', 'authenticated', 'authenticated',
      'buyer04@myshop.test',
      crypt('TestPass123!', gen_salt('bf')),
      now(), '{}', '{"full_name":"一般使用者四號"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    insert into auth.identities (
      provider_id, user_id, identity_data, provider, created_at, updated_at
    ) values (
      'buyer04@myshop.test',
      'c01afc00-0001-4000-8000-000000000004',
      jsonb_build_object(
        'sub', 'c01afc00-0001-4000-8000-000000000004',
        'email', 'buyer04@myshop.test',
        'email_verified', true,
        'phone_verified', false
      ),
      'email', now(), now()
    );
  end if;

  -- 5
  if not exists (select 1 from auth.users where id = 'c01afc00-0001-4000-8000-000000000005'::uuid) then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      inst, 'c01afc00-0001-4000-8000-000000000005', 'authenticated', 'authenticated',
      'buyer05@myshop.test',
      crypt('TestPass123!', gen_salt('bf')),
      now(), '{}', '{"full_name":"一般使用者五號"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    insert into auth.identities (
      provider_id, user_id, identity_data, provider, created_at, updated_at
    ) values (
      'buyer05@myshop.test',
      'c01afc00-0001-4000-8000-000000000005',
      jsonb_build_object(
        'sub', 'c01afc00-0001-4000-8000-000000000005',
        'email', 'buyer05@myshop.test',
        'email_verified', true,
        'phone_verified', false
      ),
      'email', now(), now()
    );
  end if;
  exception
    when others then
      raise notice 'auth 測試帳號種子失敗（若 orders 未建立請改跑 20250403150000 修復遷移）: %', sqlerrm;
  end;
end;
$seed_users$;

-- 補齊 profiles 欄位（觸發器已寫入 id / full_name / email）
update public.profiles p
set
  avatar_url = coalesce(p.avatar_url, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'),
  updated_at = now()
where p.id in (
  'c01afc00-0001-4000-8000-000000000001',
  'c01afc00-0001-4000-8000-000000000002',
  'c01afc00-0001-4000-8000-000000000003',
  'c01afc00-0001-4000-8000-000000000004',
  'c01afc00-0001-4000-8000-000000000005'
);

-- -----------------------------------------------------------------------------
-- 三筆測試訂單 + 明細（需已建立測試 auth 使用者，否則略過以免違反 user_id FK）
-- -----------------------------------------------------------------------------
do $order_seed$
begin
  begin
  if (
    select count(*)::int from auth.users
    where id in (
      'c01afc00-0001-4000-8000-000000000001',
      'c01afc00-0001-4000-8000-000000000002',
      'c01afc00-0001-4000-8000-000000000003'
    )
  ) < 3 then
    raise notice '訂單種子略過：需同時存在 buyer01～03 三筆測試帳號（請確認 auth 種子已執行）';
    return;
  end if;

  insert into public.orders (
    id, user_id, order_number, recipient_name, recipient_phone, recipient_email,
    shipping_address, shipping_method, shipping_fee, subtotal, total, status, notes
  )
  values
  (
    'e0e0e0e0-0001-4000-8000-000000000001',
    'c01afc00-0001-4000-8000-000000000001',
    'MP-20250402-0001',
    '一般使用者一號',
    '0912000111',
    'buyer01@myshop.test',
    '台北市中正區測試路 1 段 2 號 3 樓',
    'home',
    150,
    400,
    550,
    'paid',
    '測試訂單：宅配、兩項商品'
  ),
  (
    'e0e0e0e0-0001-4000-8000-000000000002',
    'c01afc00-0001-4000-8000-000000000002',
    'MP-20250402-0002',
    '一般使用者二號',
    '0922000222',
    'buyer02@myshop.test',
    null,
    'store',
    0,
    520,
    520,
    'processing',
    '測試訂單：門市自取'
  ),
  (
    'e0e0e0e0-0001-4000-8000-000000000003',
    'c01afc00-0001-4000-8000-000000000003',
    'MP-20250402-0003',
    '一般使用者三號',
    '0933000333',
    'buyer03@myshop.test',
    '新北市板橋區範例街 5 號',
    'home',
    150,
    310,
    460,
    'pending',
    '測試訂單：宅配、可頌 x2 + 肉桂捲'
  )
  on conflict (id) do nothing;

  insert into public.order_items (id, order_id, product_id, product_name, unit_price, quantity, line_total, image_url)
  values
  (
    'f0f0f0f0-0001-4000-8000-000000000001',
    'e0e0e0e0-0001-4000-8000-000000000001',
    '04a04b55-478f-4ef7-a91a-672144764ed2',
    '草莓奶油小杯蛋糕',
    180, 1, 180,
    'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=800'
  ),
  (
    'f0f0f0f0-0001-4000-8000-000000000002',
    'e0e0e0e0-0001-4000-8000-000000000001',
    'f18323be-7199-4a1d-8c3c-428fc5ec8826',
    '酸種鄉村麵包',
    220, 1, 220,
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800'
  ),
  (
    'f0f0f0f0-0001-4000-8000-000000000003',
    'e0e0e0e0-0001-4000-8000-000000000002',
    'f440241d-6f3d-4a42-bda1-5c7277b0ceb1',
    '綜合馬卡龍禮盒（8 入）',
    520, 1, 520,
    'https://images.unsplash.com/photo-1702234695529-953c109b19f9?auto=format&fit=crop&q=80&w=800'
  ),
  (
    'f0f0f0f0-0001-4000-8000-000000000004',
    'e0e0e0e0-0001-4000-8000-000000000003',
    '85acc9b4-ecee-4437-bbd3-d8fe5f729cd1',
    '法式可頌（單入）',
    95, 2, 190,
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800'
  ),
  (
    'f0f0f0f0-0001-4000-8000-000000000005',
    'e0e0e0e0-0001-4000-8000-000000000003',
    '07f033c9-58bf-434e-9bba-bb2b604119e7',
    '肉桂捲（焦糖乳酪淋醬）',
    120, 1, 120,
    'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&q=80&w=800'
  )
  on conflict (id) do nothing;
  exception
    when others then
      raise notice '訂單種子失敗: %', sqlerrm;
  end;
end;
$order_seed$;
