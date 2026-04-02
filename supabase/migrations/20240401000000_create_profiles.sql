-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  email text,
  is_admin boolean default false,

  constraint full_name_length check (char_length(full_name) >= 3)
);

-- Set up Realtime!
alter publication supabase_realtime add table profiles;

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Create policies
-- 1. Everyone can read their own profile
create policy "Users can view own profile" 
  on profiles for select 
  using ( auth.uid() = id );

-- Helper: 不可在 policy 內對同表做 EXISTS（會 infinite recursion），改用 SECURITY DEFINER
create or replace function public.current_user_is_admin()
returns boolean
language sql
security definer
set search_path = public
set row_security = off
stable
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

revoke all on function public.current_user_is_admin() from public;
grant execute on function public.current_user_is_admin() to authenticated;
grant execute on function public.current_user_is_admin() to service_role;

-- 2. Admins can read all profiles
create policy "Admins can view all profiles" 
  on profiles for select 
  using ( public.current_user_is_admin() );

-- 3. Users can update their own profile
create policy "Users can update own profile" 
  on profiles for update 
  using ( auth.uid() = id )
  with check ( auth.uid() = id );

-- 4. Admins can update any profile (to promote/demote admins)
create policy "Admins can update any profile" 
  on profiles for update 
  using ( public.current_user_is_admin() )
  with check ( public.current_user_is_admin() );

-- Create a trigger to automatically create a profile entry when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, is_admin, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    false,
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
