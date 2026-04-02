-- 法式檸檬塔主圖改為指定 Unsplash（列表／詳情 sort_order 最小者）
update public.product_images
set
  image_url = 'https://images.unsplash.com/photo-1689777257135-87028e052391?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  alt_text = '法式檸檬塔'
where product_id = 'b993393e-6194-4cf1-9e22-197b32319a2e'
  and sort_order = 0;
