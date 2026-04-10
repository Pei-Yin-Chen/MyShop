-- 將頁尾「客戶服務」連結由舊版 /support/... 改為 /...
update public.home_page_sections
set content = replace(content::text, '"/support/', '"/')::jsonb
where section_key = 'customer_service_footer'
  and content::text like '%"/support/%';

comment on table public.customer_service_pages is '前台 /[slug]（關於我們為 /about）等說明頁，內文為管理員維護之 HTML（前台 sanitize）';
