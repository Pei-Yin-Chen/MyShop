-- 頁尾「快速連結」：關於我們（文字與網址可於後台自訂）；「所有商品」由程式固定連至 /products。
-- 若已執行過舊版 20260417130000（無 about 列），補上「關於我們」說明頁供 /about 使用；已存在則略過。

insert into public.customer_service_pages (slug, title, meta_description, body_html)
values (
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
)
on conflict (slug) do nothing;

comment on table public.customer_service_pages is '前台 /[slug]（關於我們為 /about）等說明頁，內文為管理員維護之 HTML（前台 sanitize）';

insert into public.home_page_sections (section_key, content)
values (
  'footer_quick_links',
  '{
    "aboutLabel": "關於我們",
    "aboutHref": "/about"
  }'::jsonb
)
on conflict (section_key) do nothing;
