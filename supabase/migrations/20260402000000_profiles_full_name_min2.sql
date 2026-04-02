-- Allow 2-character names (common in zh-TW)
alter table public.profiles
  drop constraint if exists full_name_length;

alter table public.profiles
  add constraint full_name_length check (char_length(full_name) >= 2);

