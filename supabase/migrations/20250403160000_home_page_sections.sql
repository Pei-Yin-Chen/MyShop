-- 首頁各區塊文案／圖片／結構化內容，供後台維護；前台以 section_key 讀取 JSON。

create table public.home_page_sections (
  section_key text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.home_page_sections is '首頁區塊：hero, featured_intro, product_gallery, brand_philosophy, shopping_rules, site_settings；content 為 camelCase JSON，與 src/data/home-page-defaults.ts 一致';

alter table public.home_page_sections enable row level security;

create policy "Home page sections are viewable by everyone"
  on public.home_page_sections for select
  using (true);

create policy "Admins manage home page sections"
  on public.home_page_sections for insert
  with check (public.current_user_is_admin());

create policy "Admins update home page sections"
  on public.home_page_sections for update
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Admins delete home page sections"
  on public.home_page_sections for delete
  using (public.current_user_is_admin());

grant select on table public.home_page_sections to anon, authenticated;
grant all on table public.home_page_sections to service_role;

-- 種子資料：通用範例內容，與 src/data/home-page-defaults.ts 一致
insert into public.home_page_sections (section_key, content) values
(
  'site_settings',
  $ss${
    "siteTitle": "我的商店",
    "siteDescription": "",
    "siteLogoUrl": "",
    "footerLogoUrl": "",
    "footerTagline": "精選商品與貼心服務，線上輕鬆選購。",
    "footerContactAddress": "",
    "footerContactPhone": "",
    "footerContactEmail": ""
  }$ss$::jsonb
),
(
  'hero',
  $hero${
    "eyebrow": "Welcome to Our Store",
    "badgeLabel": "最新上架",
    "badgeText": "精選商品 · 限量供應",
    "titleLine1": "用心挑選，",
    "titleLine2Accent": "為你呈現最好的品質",
    "description": "我們精心挑選每一件商品，堅持品質與服務，\n為你的生活增添一份美好。",
    "primaryCta": { "label": "瀏覽商品", "href": "/products" },
    "secondaryCta": { "label": "了解更多", "href": "/about" },
    "images": [
      { "url": "https://images.unsplash.com/photo-1574241449413-b5c96d31e391?auto=format&fit=crop&q=80&w=1200", "alt": "範例圖片 1" },
      { "url": "https://images.unsplash.com/photo-1505976378723-9726b54e9bb9?auto=format&fit=crop&q=80&w=1200", "alt": "範例圖片 2" },
      { "url": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=1200", "alt": "範例圖片 3" }
    ]
  }$hero$::jsonb
),
(
  'featured_intro',
  $fi${
    "title": "精選推薦",
    "subtitle": "以下是我們目前主打的精選商品，數量有限，售完將以新品替補。",
    "browseAllLabel": "瀏覽全部商品",
    "browseAllHref": "/products"
  }$fi$::jsonb
),
(
  'product_gallery',
  $pg${
    "enabled": true,
    "title": "精選圖集",
    "subtitle": "用影像記錄我們的品牌故事，每一幕都值得細細品味。",
    "items": [
      { "imageUrl": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&q=80&w=800", "alt": "範例圖片 1", "sortOrder": 0 },
      { "imageUrl": "https://images.unsplash.com/photo-1505976378723-9726b54e9bb9?auto=format&fit=crop&q=80&w=900", "alt": "範例圖片 2", "sortOrder": 1 },
      { "imageUrl": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=800", "alt": "範例圖片 3", "sortOrder": 2 },
      { "imageUrl": "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=800", "alt": "範例圖片 4", "sortOrder": 3 },
      { "imageUrl": "https://images.unsplash.com/photo-1702234695529-953c109b19f9?auto=format&fit=crop&q=80&w=800", "alt": "範例圖片 5", "sortOrder": 4 },
      { "imageUrl": "https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&q=80&w=800", "alt": "範例圖片 6", "sortOrder": 5 }
    ]
  }$pg$::jsonb
),
(
  'brand_philosophy',
  $bp${
    "enabled": true,
    "title": "品牌理念",
    "subtitle": "我們堅持品質與用心，讓每一個細節都能傳遞價值。",
    "items": [
      { "iconKey": "wheat", "title": "嚴選品質", "description": "每一件商品皆經過嚴格篩選，確保品質值得信賴。", "bgVariant": "cream" },
      { "iconKey": "chef_hat", "title": "專業服務", "description": "由專業團隊為您提供完善的購物體驗與售後支援。", "bgVariant": "peach" },
      { "iconKey": "heart", "title": "用心經營", "description": "我們重視每一位顧客的需求，用心打造最好的服務。", "bgVariant": "rose" },
      { "iconKey": "cookie", "title": "持續創新", "description": "不斷推出新品與優化服務，為您帶來更多驚喜。", "bgVariant": "sage" }
    ]
  }$bp$::jsonb
),
(
  'shopping_rules',
  $sr${
    "enabled": true,
    "title": "購物說明",
    "subtitle": "以下為購物相關注意事項，請在結帳前稍加留意。",
    "items": [
      { "iconKey": "truck", "title": "配送方式", "description": "支援宅配到府與門市自取，依商品類型提供合適的配送選項。" },
      { "iconKey": "clock", "title": "訂單處理時間", "description": "訂單成立後將於 1–3 個工作天內處理出貨，特殊商品請留意備註。" },
      { "iconKey": "shield_check", "title": "退換貨政策", "description": "商品如有瑕疵可於收到後 7 日內申請退換貨，詳情請參閱退換貨說明。" },
      { "iconKey": "credit_card", "title": "付款方式", "description": "支援信用卡、行動支付與轉帳等多元付款方式。" }
    ]
  }$sr$::jsonb
)
on conflict (section_key) do update set
  content = excluded.content,
  updated_at = now();
