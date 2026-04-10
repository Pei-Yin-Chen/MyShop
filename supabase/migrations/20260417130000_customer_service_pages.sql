-- 客戶服務／政策頁：WYSIWYG 內文 + Footer 連結設定（home_page_sections.customer_service_footer）

create table public.customer_service_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  meta_description text,
  body_html text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_service_pages_slug_unique unique (slug),
  constraint customer_service_pages_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and char_length(slug) <= 80
  )
);

comment on table public.customer_service_pages is '前台 /[slug]（關於我們為 /about）等說明頁，內文為管理員維護之 HTML（前台 sanitize）';

create index customer_service_pages_slug_idx on public.customer_service_pages (slug);

alter table public.customer_service_pages enable row level security;

create policy "Anyone can read customer service pages"
  on public.customer_service_pages for select
  using (true);

create policy "Admins insert customer service pages"
  on public.customer_service_pages for insert
  with check (public.current_user_is_admin());

create policy "Admins update customer service pages"
  on public.customer_service_pages for update
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Admins delete customer service pages"
  on public.customer_service_pages for delete
  using (public.current_user_is_admin());

grant select on table public.customer_service_pages to anon, authenticated;
grant all on table public.customer_service_pages to service_role;

-- 示範列（內文請於後台貼上；完整 HTML 不放在此 migration）
insert into public.customer_service_pages (slug, title, meta_description, body_html) values
(
  'faq',
  '常見問題',
  '以下為示範問答，請依實際營運政策與金流物流設定更新。',
  '<p>請於後台「客戶服務」編輯頁貼上自舊靜態頁轉出的 HTML 內文。</p>'
),
(
  'shipping',
  '運送與取貨',
  '以下為示範說明，請依您合作的物流與店取流程修改。',
  '<p>請於後台「客戶服務」編輯頁貼上自舊靜態頁轉出的 HTML 內文。</p>'
),
(
  'returns',
  '取消與變更',
  '以下為示範條款，請由法律或營運顧問依實際情況審閱後再上架。',
  '<p>請於後台「客戶服務」編輯頁貼上自舊靜態頁轉出的 HTML 內文。</p>'
),
(
  'privacy',
  '隱私權政策',
  '最後更新：示範日期 2026-04-02。正式營運前請由專業顧問依適用法規修訂。',
  '<p>請於後台「客戶服務」編輯頁貼上自舊靜態頁轉出的 HTML 內文。</p>'
),
(
  'terms',
  '服務條款',
  '最後更新：示範日期 2026-04-02。正式使用前請由專業顧問審閱。',
  '<p>請於後台「客戶服務」編輯頁貼上自舊靜態頁轉出的 HTML 內文。</p>'
),
(
  'about',
  '關於我們',
  '以下為示範文案，正式上線前請替換為實際品牌故事與資訊。',
  $about$
<h2>品牌故事</h2>
<p>My Pâtisserie 從一間小工作室出發，專注蛋糕、麵包與季節甜點。我們相信好的甜點來自好的原料與耐心：當日烘焙、適度減糖，讓風味自然展開。</p>
<p>這段文字為示範用途，可在此補上創辦背景、店名由來、或與在地的連結，讓顧客更認識你們。</p>
<h2>我們的堅持</h2>
<ul>
<li>選用可追溯來源的主要原料（示範條列）</li>
<li>依季節調整菜單，減少過度加工</li>
<li>透明標示過敏原與保存方式（請於正式商品頁落實）</li>
</ul>
<h2>邀請您來坐坐</h2>
<p>門市地址、營業時間與聯絡方式可同步於頁尾「聯絡我們」區塊；若僅線上販售，可改為取貨點或客服管道說明。</p>
$about$
);

insert into public.home_page_sections (section_key, content)
values (
  'customer_service_footer',
  '{
    "links": [
      { "label": "常見問題", "href": "/faq" },
      { "label": "運送與取貨", "href": "/shipping" },
      { "label": "取消與變更", "href": "/returns" },
      { "label": "隱私權政策", "href": "/privacy" },
      { "label": "服務條款", "href": "/terms" }
    ]
  }'::jsonb
)
on conflict (section_key) do nothing;
