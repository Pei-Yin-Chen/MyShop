-- 商品主檔：欄位對齊前台 Product（src/data/products.ts）
-- 商品圖片：一對多，以 sort_order 排序；sort_order 最小者為列表主圖（等同 image），全部列為詳情圖庫（gallery）

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subtitle text,
  price integer not null check (price >= 0),
  category text not null,
  description text not null,
  full_description text,
  details jsonb not null default '[]'::jsonb,
  rating numeric(2,1) not null check (rating >= 1 and rating <= 5),
  review_count integer not null default 0 check (review_count >= 0),
  is_featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.products is '商店商品主檔；details 為 [{ "label", "value" }]';
comment on column public.products.display_order is '預設排序（數字越小越前）';

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  unique (product_id, sort_order)
);

comment on table public.product_images is '商品多圖；同商品內 sort_order 由小到大為圖庫順序，最小 sort_order 為列表封面圖';
comment on column public.product_images.image_url is '完整 HTTPS URL（與 next/image remotePatterns 相容）或日後 Storage 公開 URL';

create index products_category_idx on public.products (category);
create index products_is_featured_idx on public.products (is_featured) where is_featured = true;
create index product_images_product_id_idx on public.product_images (product_id);

alter table public.products enable row level security;
alter table public.product_images enable row level security;

create policy "Products are viewable by everyone"
  on public.products for select
  using (true);

create policy "Admins manage products"
  on public.products for insert
  with check (public.current_user_is_admin());

create policy "Admins update products"
  on public.products for update
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Admins delete products"
  on public.products for delete
  using (public.current_user_is_admin());

create policy "Product images are viewable by everyone"
  on public.product_images for select
  using (true);

create policy "Admins manage product images"
  on public.product_images for insert
  with check (public.current_user_is_admin());

create policy "Admins update product images"
  on public.product_images for update
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Admins delete product images"
  on public.product_images for delete
  using (public.current_user_is_admin());

grant select on table public.products to anon, authenticated;
grant select on table public.product_images to anon, authenticated;

-- 種子使用固定隨機樣式 UUID（重跑遷移 id 不變）；若不要寫死 id，可改為不帶 id 欄位讓 default gen_random_uuid() 產生
insert into public.products (id, name, subtitle, price, category, description, full_description, details, rating, review_count, is_featured, display_order)
values
(
  '04a04b55-478f-4ef7-a91a-672144764ed2',
  '草莓奶油小杯蛋糕',
  '每日限量 · 季節限定',
  180,
  '蛋糕',
  '小杯盛裝的鬆軟蛋糕體，上層擠上草莓風味奶油，再點綴一顆鮮草莓。',
  '這款小杯蛋糕是我們季節限定的明星產品。我們選用大湖當季草莓，製作成酸甜適中的草莓奶油，搭配口感輕盈的戚風蛋糕體。小巧的杯裝設計，不僅方便食用，更能鎖住蛋糕的濕潤度，是下午茶的最佳選擇。',
  $json$[{"label":"主要原料","value":"日本麵粉、法國奶油、當季草莓、農場雞蛋"},{"label":"保存方式","value":"冷藏保存 2 日"},{"label":"過敏原","value":"本產品含麩質、蛋、奶製品"}]$json$::jsonb,
  4.7, 86, true, 1
),
(
  'f18323be-7199-4a1d-8c3c-428fc5ec8826',
  '酸種鄉村麵包',
  '天然發酵 · 歐式經典',
  220,
  '麵包',
  '長時間發酵，外脆內軟，麥香溫潤。',
  '遵循傳統法式工法，使用自家培養的天然酵母，經過 24 小時低溫長時發酵。外皮呈現迷人的焦糖色澤與酥脆口感，內部則保有豐富的氣孔與濕潤彈性，帶有淡淡的天然微酸與濃郁麥香。',
  $json$[{"label":"主要原料","value":"石磨全麥粉、天然酵母、海鹽、過濾水"},{"label":"保存方式","value":"常溫 2 日，冷凍可保存 2 週"},{"label":"食用建議","value":"回烤後口感更佳，適合搭配奶油或濃湯"}]$json$::jsonb,
  4.8, 214, true, 2
),
(
  '85acc9b4-ecee-4437-bbd3-d8fe5f729cd1',
  '法式可頌（單入）',
  '純手工疊層 · 奶油香氣',
  95,
  '麵包',
  '奶油層次分明，烘烤至金黃酥脆。',
  '經典的法式工藝展現。我們使用法國 AOP 認證奶油，透過反覆的摺疊與低溫發酵，打造出 16 層完美的蜂巢狀層次。每一口都能感受到外層的極致酥脆與內裡的柔軟香醇。',
  $json$[{"label":"主要原料","value":"法國 AOP 奶油、日本麵粉、鮮乳"},{"label":"保存方式","value":"常溫 1 日，建議當日食用"},{"label":"規格","value":"約 65g ± 5g"}]$json$::jsonb,
  4.6, 402, true, 3
),
(
  'f440241d-6f3d-4a42-bda1-5c7277b0ceb1',
  '綜合馬卡龍禮盒（8 入）',
  '法式浪漫 · 繽紛午茶',
  520,
  '蛋糕',
  '低甜度內餡，色彩柔和，送禮體面。',
  '精選四款經典口味：鹽之花焦糖、宇治抹茶、覆盆子荔枝、馬達加斯加香草。我們特別調整了減糖配方，讓馬卡龍保有外酥內 Q 的迷人觸感，卻不會過於甜膩，完美呈現食材原味。',
  $json$[{"label":"口味","value":"焦糖、抹茶、覆盆子、香草（各 2 入）"},{"label":"保存方式","value":"冷藏 5 日，冷凍 10 日"},{"label":"包裝","value":"附品牌精緻禮盒與提袋"}]$json$::jsonb,
  4.9, 63, false, 4
),
(
  '07f033c9-58bf-434e-9bba-bb2b604119e7',
  '肉桂捲（焦糖乳酪淋醬）',
  '溫暖香氣 · 濃郁淋醬',
  120,
  '麵包',
  '溫暖肉桂香氣，淋上自製乳酪糖霜。',
  '選用頂級錫蘭肉桂粉，香氣溫和不辛辣。麵團加入大量鮮乳與雞蛋，口感介於麵包與蛋糕之間。出爐後淋上厚厚的自製焦糖乳酪淋醬，鹹甜交織的滋味讓人欲罷不能。',
  $json$[{"label":"主要原料","value":"錫蘭肉桂、奶油乳酪、黑糖、核桃"},{"label":"保存方式","value":"常溫 1 日，冷藏 3 日"},{"label":"加熱建議","value":"微波 20 秒或烤箱 150度回烤 3 分鐘"}]$json$::jsonb,
  4.5, 178, false, 5
),
(
  '28aaef0e-a8ad-4251-8f21-583aa9645ba3',
  '季節水果塔（單片）',
  '新鮮採收 · 酥脆塔皮',
  180,
  '蛋糕',
  '酥脆塔皮與卡士達，鋪上當日新鮮水果。',
  '手工捏製的甜酥塔皮，填入香草籽熬煮的濃郁卡士達醬。上方鋪滿主廚當日在市場挑選的最優質水果，每一口都是季節的滋味。水果種類隨季節更換，帶給你不同的驚喜。',
  $json$[{"label":"主要原料","value":"當季水果、大溪地香草籽、手工塔皮"},{"label":"保存方式","value":"冷藏保存 1 日"},{"label":"規格","value":"3.5 吋塔皮切片"}]$json$::jsonb,
  4.7, 95, false, 6
),
(
  'e515c787-fa6d-4812-a4ae-dbb6f1b8603a',
  '草莓果粒牛奶麵包（單入）',
  '柔軟質地 · 酸甜驚喜',
  160,
  '麵包',
  '柔軟麵包裡藏著酸甜的草莓果粒，每一口都咬得到果香。',
  '專為草莓愛好者設計。麵團中加入大量鮮乳與草莓果泥，揉入低溫烘乾的草莓果粒，保留了果肉的口感與濃縮香氣。外層撒上薄薄的糖粉，像是冬日的初雪般迷人。',
  $json$[{"label":"主要原料","value":"草莓乾、鮮乳、日本麵粉、煉乳"},{"label":"保存方式","value":"常溫 2 日"},{"label":"特色","value":"不添加人工香料與色素"}]$json$::jsonb,
  4.4, 52, true, 7
),
(
  'fb99d83c-ec20-4a43-9025-2788ebb82454',
  '手作布里歐吐司（半條）',
  '雲朵口感 · 蛋奶豐沛',
  190,
  '麵包',
  '蛋奶香氣飽滿，撕開如雲朵般柔軟。',
  '布里歐（Brioche）是法國最富盛名的麵包之一。我們的配方含有超過 25% 的優質奶油與大量農場雞蛋，完全不加一滴水。長時間低溫發酵讓風味更顯層次，口感細緻如絲綢，直接撕著吃就是最高享受。',
  $json$[{"label":"主要原料","value":"發酵奶油、農場雞蛋、日本麵粉"},{"label":"保存方式","value":"常溫 2 日，冷凍 1 週"},{"label":"規格","value":"約 250g (半條)"}]$json$::jsonb,
  4.6, 131, false, 8
),
(
  'b993393e-6194-4cf1-9e22-197b32319a2e',
  '法式檸檬塔（單片）',
  '清爽酸香 · 經典塔皮',
  165,
  '甜點',
  '自製檸檬凝乳與酥脆甜塔皮，酸度明亮不刮舌。',
  '選用新鮮黃檸與奶油慢煮成凝乳，塔皮以冷奶油切拌烘烤至金黃。頂層可選配輕盈義式蛋白霜或糖粉點綴，是午後最解膩的一塊。',
  $json$[{"label":"主要原料","value":"奶油、雞蛋、黃檸、日本麵粉"},{"label":"保存方式","value":"冷藏 2 日"},{"label":"過敏原","value":"含麩質、蛋、奶製品"}]$json$::jsonb,
  4.7, 74, false, 9
),
(
  '98250ae1-b74c-4f7f-8fe5-37e6f742fe01',
  '巧克力閃電泡芙（單入）',
  '苦甜淋面 · 內餡滑順',
  110,
  '甜點',
  '脆皮泡芙填入巧克力卡士達，表層鏡面巧克力淋醬。',
  '使用 62% 調溫巧克力製作淋面與內餡，卡士達以鮮奶油調和口感。建議冷藏後食用，一刀切下可感受脆皮與內餡的對比。',
  $json$[{"label":"主要原料","value":"巧克力、鮮奶油、雞蛋、日本麵粉"},{"label":"保存方式","value":"冷藏 2 日"},{"label":"規格","value":"約 9cm 長"}]$json$::jsonb,
  4.6, 88, false, 10
);

-- Unsplash URL 與 src/data/remote-images.ts 相同參數；檸檬塔、泡芙為「甜點」分類
insert into public.product_images (product_id, image_url, alt_text, sort_order) values
-- 1 草莓奶油小杯蛋糕
('04a04b55-478f-4ef7-a91a-672144764ed2', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=800', '草莓奶油小杯蛋糕主視角', 0),
('04a04b55-478f-4ef7-a91a-672144764ed2', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&q=80&w=800', '水果塔風格特寫', 1),
('04a04b55-478f-4ef7-a91a-672144764ed2', 'https://images.unsplash.com/photo-1702234695529-953c109b19f9?auto=format&fit=crop&q=80&w=800', '馬卡龍與甜點陳列', 2),
-- 2 酸種鄉村麵包
('f18323be-7199-4a1d-8c3c-428fc5ec8826', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800', '酸種鄉村麵包', 0),
('f18323be-7199-4a1d-8c3c-428fc5ec8826', 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=800', '麵包陳列', 1),
('f18323be-7199-4a1d-8c3c-428fc5ec8826', 'https://images.unsplash.com/photo-1505976378723-9726b54e9bb9?auto=format&fit=crop&q=80&w=800', '店內麵包架', 2),
-- 3 可頌
('85acc9b4-ecee-4437-bbd3-d8fe5f729cd1', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800', '法式可頌', 0),
('85acc9b4-ecee-4437-bbd3-d8fe5f729cd1', 'https://images.unsplash.com/photo-1505976378723-9726b54e9bb9?auto=format&fit=crop&q=80&w=800', '烘焙坊陳列', 1),
('85acc9b4-ecee-4437-bbd3-d8fe5f729cd1', 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=800', '多款麵包', 2),
-- 4 馬卡龍
('f440241d-6f3d-4a42-bda1-5c7277b0ceb1', 'https://images.unsplash.com/photo-1702234695529-953c109b19f9?auto=format&fit=crop&q=80&w=800', '綜合馬卡龍', 0),
('f440241d-6f3d-4a42-bda1-5c7277b0ceb1', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=800', '甜點小杯', 1),
('f440241d-6f3d-4a42-bda1-5c7277b0ceb1', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&q=80&w=800', '水果塔', 2),
-- 5 肉桂捲
('07f033c9-58bf-434e-9bba-bb2b604119e7', 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&q=80&w=800', '肉桂捲', 0),
('07f033c9-58bf-434e-9bba-bb2b604119e7', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800', '鄉村麵包搭配情境', 1),
('07f033c9-58bf-434e-9bba-bb2b604119e7', 'https://images.unsplash.com/photo-1505976378723-9726b54e9bb9?auto=format&fit=crop&q=80&w=800', '店內烘焙', 2),
-- 6 水果塔
('28aaef0e-a8ad-4251-8f21-583aa9645ba3', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&q=80&w=800', '季節水果塔', 0),
('28aaef0e-a8ad-4251-8f21-583aa9645ba3', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=800', '草莓甜點', 1),
('28aaef0e-a8ad-4251-8f21-583aa9645ba3', 'https://images.unsplash.com/photo-1702234695529-953c109b19f9?auto=format&fit=crop&q=80&w=800', '馬卡龍禮盒情境', 2),
-- 7 草莓果粒牛奶麵包
('e515c787-fa6d-4812-a4ae-dbb6f1b8603a', 'https://images.unsplash.com/photo-1574241449413-b5c96d31e391?auto=format&fit=crop&q=80&w=800', '草莓果粒牛奶麵包', 0),
('e515c787-fa6d-4812-a4ae-dbb6f1b8603a', 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=800', '麵包列', 1),
('e515c787-fa6d-4812-a4ae-dbb6f1b8603a', 'https://images.unsplash.com/photo-1505976378723-9726b54e9bb9?auto=format&fit=crop&q=80&w=900', '麵包店陳列', 2),
-- 8 布里歐吐司
('fb99d83c-ec20-4a43-9025-2788ebb82454', 'https://images.unsplash.com/photo-1505976378723-9726b54e9bb9?auto=format&fit=crop&q=80&w=800', '手作布里歐吐司情境', 0),
('fb99d83c-ec20-4a43-9025-2788ebb82454', 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=800', '吐司與麵包', 1),
('fb99d83c-ec20-4a43-9025-2788ebb82454', 'https://images.unsplash.com/photo-1505976378723-9726b54e9bb9?auto=format&fit=crop&q=80&w=900', '烘焙陳列細節', 2),
-- 9 檸檬塔（專用圖：檸檬／塔類）
('b993393e-6194-4cf1-9e22-197b32319a2e', 'https://images.unsplash.com/photo-1689777257135-87028e052391?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '法式檸檬塔', 0),
('b993393e-6194-4cf1-9e22-197b32319a2e', 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&q=80&w=800', '檸檬與甜點製作', 1),
('b993393e-6194-4cf1-9e22-197b32319a2e', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&q=80&w=800', '塔類甜點參考', 2),
-- 10 巧克力閃電泡芙
('98250ae1-b74c-4f7f-8fe5-37e6f742fe01', 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&q=80&w=800', '巧克力閃電泡芙', 0),
('98250ae1-b74c-4f7f-8fe5-37e6f742fe01', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800', '巧克力甜點', 1),
('98250ae1-b74c-4f7f-8fe5-37e6f742fe01', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=800', '精緻甜點盤飾', 2);
