-- Split phone into mobile/landline for future-proofing
alter table public.profiles
  add column if not exists mobile_phone text;

alter table public.profiles
  add column if not exists landline_phone text;

-- Migrate legacy phone -> mobile_phone only if legacy column exists
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'phone'
  ) then
    execute $sql$
      update public.profiles
      set mobile_phone = coalesce(mobile_phone, phone)
      where phone is not null
        and (mobile_phone is null or mobile_phone = '')
    $sql$;
  end if;
end
$$;

-- Keep schema clean: remove legacy column
alter table public.profiles
  drop column if exists phone;

