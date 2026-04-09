-- 補齊 site_settings 的 Footer 欄位（既有資料庫若缺少鍵則合併預設值）
update public.home_page_sections
set content = content || jsonb_build_object(
  'footerLogoUrl', coalesce(content->'footerLogoUrl', '""'::jsonb),
  'footerTagline', coalesce(
    content->'footerTagline',
    '"精選商品與貼心服務，線上輕鬆選購。"'::jsonb
  )
)
where section_key = 'site_settings';
