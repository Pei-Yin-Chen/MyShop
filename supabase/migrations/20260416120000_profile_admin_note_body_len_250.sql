-- 備註單筆改為 250 字以內（先截斷既有超長內容再改 constraint）
update public.profile_admin_note_entries
set body = left(body, 250)
where char_length(body) > 250;

alter table public.profile_admin_note_entries
  drop constraint if exists profile_admin_note_entries_body_len;

alter table public.profile_admin_note_entries
  add constraint profile_admin_note_entries_body_len check (char_length(body) <= 250);
