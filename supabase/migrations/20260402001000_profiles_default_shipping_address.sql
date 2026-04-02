-- Add default shipping address for member checkout prefill
alter table public.profiles
  add column if not exists default_shipping_address text;

