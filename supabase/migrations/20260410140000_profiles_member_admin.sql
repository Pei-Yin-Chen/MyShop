-- 後台會員管理：來源、註冊時間、備註、停用
alter table public.profiles
  add column if not exists created_at timestamptz not null default now();

alter table public.profiles
  add column if not exists member_source text not null default 'registered'
    check (member_source in ('registered', 'purchase'));

alter table public.profiles
  add column if not exists admin_notes text;

alter table public.profiles
  add column if not exists is_banned boolean not null default false;

comment on column public.profiles.created_at is '註冊／建檔時間（與 auth.users.created_at 對齊）';
comment on column public.profiles.member_source is 'registered=自行註冊；purchase=由訂單匯入之購買會員';
comment on column public.profiles.admin_notes is '後台管理員備註';
comment on column public.profiles.is_banned is '停用後無法登入（需配合應用程式檢查）';

-- 既有會員：created_at 自 auth.users 回填
update public.profiles p
set created_at = u.created_at
from auth.users u
where p.id = u.id;
