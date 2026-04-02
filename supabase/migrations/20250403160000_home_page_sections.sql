-- 首頁各區塊文案／圖片／結構化內容，供後台維護；前台以 section_key 讀取 JSON。

create table public.home_page_sections (
  section_key text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.home_page_sections is '首頁區塊：hero, featured_intro, product_gallery, brand_philosophy, shopping_rules；content 為 camelCase JSON，與 src/data/home-page-defaults.ts 一致';

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

-- 種子：與目前首頁硬編內容一致（圖片 URL 與 remote-images 相同）
insert into public.home_page_sections (section_key, content) values
(
  'hero',
  $hero${
    "eyebrow": "Pâtisserie & Boulangerie",
    "badgeLabel": "本日烘焙",
    "badgeText": "上午出爐 · 限量供應",
    "titleLine1": "以時間與溫度，",
    "titleLine2Accent": "呈現每一口的柔軟",
    "description": "蛋糕、麵包與季節甜點，堅持好原料與當日現做，\n為你的餐桌與聚會，留一點剛好的甜。",
    "primaryCta": { "label": "瀏覽品項", "href": "/products" },
    "secondaryCta": { "label": "預訂整模蛋糕", "href": "/products?category=蛋糕" },
    "images": [
      { "url": "https://images.unsplash.com/photo-1574241449413-b5c96d31e391?auto=format&fit=crop&q=80&w=1200", "alt": "草莓果粒麵包與甜點桌面陳列" },
      { "url": "https://images.unsplash.com/photo-1505976378723-9726b54e9bb9?auto=format&fit=crop&q=80&w=1200", "alt": "麵包與烘焙陳列" },
      { "url": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=1200", "alt": "可頌與酥皮" }
    ]
  }$hero$::jsonb
),
(
  'featured_intro',
  $fi${
    "title": "主廚推薦",
    "subtitle": "當日爐邊精選，蛋糕與麵包皆以細緻工法完成，適合與重要的人分享。",
    "browseAllLabel": "瀏覽所有品項",
    "browseAllHref": "/products"
  }$fi$::jsonb
),
(
  'product_gallery',
  $pg${
    "title": "店內風景",
    "subtitle": "麵粉、奶油與果香交織的空間，每一幕都是日常裡的小儀式。",
    "items": [
      { "imageUrl": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&q=80&w=800", "alt": "季節水果塔", "sortOrder": 0 },
      { "imageUrl": "https://images.unsplash.com/photo-1505976378723-9726b54e9bb9?auto=format&fit=crop&q=80&w=900", "alt": "烘焙店內風景", "sortOrder": 1 },
      { "imageUrl": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=800", "alt": "草莓奶油小杯蛋糕", "sortOrder": 2 },
      { "imageUrl": "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=800", "alt": "新鮮麵包", "sortOrder": 3 },
      { "imageUrl": "https://images.unsplash.com/photo-1702234695529-953c109b19f9?auto=format&fit=crop&q=80&w=800", "alt": "甜點小點拼盤", "sortOrder": 4 },
      { "imageUrl": "https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&q=80&w=800", "alt": "手作肉桂捲", "sortOrder": 5 }
    ]
  }$pg$::jsonb
),
(
  'brand_philosophy',
  $bp${
    "title": "品牌理念",
    "subtitle": "我們相信好的烘焙不必張揚，柔軟、香氣與餘韻，會在入口時自己說話。",
    "items": [
      { "iconKey": "wheat", "title": "嚴選食材", "description": "麵粉、奶油與雞蛋皆來自可信賴產區，減少添加，讓風味自然展開。", "bgVariant": "cream" },
      { "iconKey": "chef_hat", "title": "手工製作", "description": "從打麵、發酵到烘烤，由師傅依當日溫溼度微調，保留手作溫度。", "bgVariant": "peach" },
      { "iconKey": "heart", "title": "分享時刻", "description": "無論是早餐一片吐司或慶生蛋糕，我們希望成為你日子裡的柔軟陪伴。", "bgVariant": "rose" },
      { "iconKey": "cookie", "title": "當日精神", "description": "烘焙品以當日鮮度為優先，建議依保存建議享用，風味最佳。", "bgVariant": "sage" }
    ]
  }$bp$::jsonb
),
(
  'shopping_rules',
  $sr${
    "title": "購物說明",
    "subtitle": "為了讓您收到與店內相同品質的烘焙，以下說明請在結帳前稍加留意。",
    "items": [
      { "iconKey": "truck", "title": "宅配與門市取貨", "description": "指定區域可選宅配或到店取貨；蛋糕類建議預訂時段，確保完整交付。" },
      { "iconKey": "clock", "title": "預訂與出爐時間", "description": "整模蛋糕請提前 2–3 日預訂；麵包以當日出爐時間為主，售完為止。" },
      { "iconKey": "refrigerator", "title": "保存建議", "description": "含鮮奶油與水果之品項請冷藏並於建議期限內食用，風味較佳。" },
      { "iconKey": "credit_card", "title": "付款方式", "description": "支援信用卡、LINE Pay 與門市現金；大宗訂單可另洽對公匯款。" }
    ]
  }$sr$::jsonb
)
on conflict (section_key) do update set
  content = excluded.content,
  updated_at = now();
