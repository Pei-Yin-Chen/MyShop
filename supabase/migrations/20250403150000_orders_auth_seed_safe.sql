-- 修復：先前遷移若在 auth 種子失敗，整筆交易回滾會連 orders 表一併消失。
-- 此檔：確保 public.orders / public.order_items 存在；auth 種子失敗不影響 DDL；
--       若無法建立測試帳號，改以 user_id = NULL 寫入三筆訂單（仍可在 SQL Editor / Table Editor 查看）。

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- 訂單表（若已存在則略過）
-- -----------------------------------------------------------------------------
create table if not exists public.orders (
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

create table if not exists public.order_items (
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

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- 政策可重跑
drop policy if exists "Users can view own orders" on public.orders;
drop policy if exists "Users can insert own orders" on public.orders;
drop policy if exists "Admins insert orders" on public.orders;
drop policy if exists "Admins manage orders" on public.orders;
drop policy if exists "Admins delete orders" on public.orders;

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

drop policy if exists "Users can view items of own orders" on public.order_items;
drop policy if exists "Users can insert items for own orders" on public.order_items;
drop policy if exists "Admins insert order items" on public.order_items;
drop policy if exists "Admins manage order items" on public.order_items;
drop policy if exists "Admins delete order items" on public.order_items;

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
-- 五名測試帳號（失敗只記 NOTICE，不中斷遷移）
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
      raise notice '無法取得 instance_id（auth.instances 空且尚無任何使用者），略過 auth 測試帳號種子';
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

    raise notice '測試帳號種子完成（若已存在則略過）';
  exception
    when others then
      raise notice 'auth 測試帳號種子失敗（訂單表仍會保留）: %', sqlerrm;
  end;
end
$seed_users$;

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
-- 三筆測試訂單：有 buyer01～03 則綁 user_id；否則訪客單（user_id IS NULL）
-- -----------------------------------------------------------------------------
do $order_seed$
declare
  n int;
begin
  begin
    select count(*)::int into n from auth.users
    where id in (
      'c01afc00-0001-4000-8000-000000000001',
      'c01afc00-0001-4000-8000-000000000002',
      'c01afc00-0001-4000-8000-000000000003'
    );

    if n >= 3 then
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
    else
      insert into public.orders (
        id, user_id, order_number, recipient_name, recipient_phone, recipient_email,
        shipping_address, shipping_method, shipping_fee, subtotal, total, status, notes
      )
      values
      (
        'e0e0e0e0-0001-4000-8000-000000000001',
        null,
        'MP-20250402-0001',
        '訪客測試一',
        '0912000111',
        'guest01@myshop.test',
        '台北市中正區測試路 1 段 2 號 3 樓',
        'home',
        150,
        400,
        550,
        'paid',
        '測試訂單（無對應測試帳號，user_id 為 NULL）'
      ),
      (
        'e0e0e0e0-0001-4000-8000-000000000002',
        null,
        'MP-20250402-0002',
        '訪客測試二',
        '0922000222',
        'guest02@myshop.test',
        null,
        'store',
        0,
        520,
        520,
        'processing',
        '測試訂單（無對應測試帳號，user_id 為 NULL）'
      ),
      (
        'e0e0e0e0-0001-4000-8000-000000000003',
        null,
        'MP-20250402-0003',
        '訪客測試三',
        '0933000333',
        'guest03@myshop.test',
        '新北市板橋區範例街 5 號',
        'home',
        150,
        310,
        460,
        'pending',
        '測試訂單（無對應測試帳號，user_id 為 NULL）'
      )
      on conflict (id) do nothing;
    end if;

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

    raise notice '訂單種子完成';
  exception
    when others then
      raise notice '訂單種子失敗: %', sqlerrm;
  end;
end
$order_seed$;
