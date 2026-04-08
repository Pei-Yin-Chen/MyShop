-- 後台會員備註：多筆紀錄 + 建立時間 + 建立者（profiles.id）
create table public.profile_admin_note_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  constraint profile_admin_note_entries_body_len check (char_length(body) <= 8000)
);

comment on table public.profile_admin_note_entries is '後台會員備註（僅管理員）；舊版 profiles.admin_notes 已於此檔回填一筆後停用單欄編輯';
comment on column public.profile_admin_note_entries.created_by is '建立備註之管理員／操作者 profiles.id';

create index profile_admin_note_entries_profile_created_idx
  on public.profile_admin_note_entries (profile_id, created_at desc);

alter table public.profile_admin_note_entries enable row level security;

create policy "Admins can read profile admin notes"
  on public.profile_admin_note_entries for select
  using (public.current_user_is_admin());

create policy "Admins can insert profile admin notes"
  on public.profile_admin_note_entries for insert
  with check (public.current_user_is_admin());

grant select, insert on public.profile_admin_note_entries to authenticated;

-- 舊單欄備註 → 一筆歷史（時間取 profiles 更新時間或註冊時間）
insert into public.profile_admin_note_entries (profile_id, body, created_at, created_by)
select
  p.id,
  trim(p.admin_notes),
  coalesce(p.updated_at, p.created_at),
  null
from public.profiles p
where p.admin_notes is not null
  and length(trim(p.admin_notes)) > 0;

comment on column public.profiles.admin_notes is '已改為 profile_admin_note_entries；保留欄位僅相容舊資料，請勿再寫入';
