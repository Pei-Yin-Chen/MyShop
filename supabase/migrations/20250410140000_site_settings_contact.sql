-- 頁尾聯絡資訊欄位（既有資料庫若缺少鍵則合併預設值）
update public.home_page_sections
set content = content || jsonb_build_object(
  'footerContactAddress', coalesce(content->'footerContactAddress', '""'::jsonb),
  'footerContactPhone', coalesce(content->'footerContactPhone', '""'::jsonb),
  'footerContactEmail', coalesce(content->'footerContactEmail', '""'::jsonb)
)
where section_key = 'site_settings';
