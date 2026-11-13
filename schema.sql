-- Atolie Fanos: run once in Supabase SQL Editor
create table if not exists site_config(id int primary key, data jsonb not null default '{}');
create table if not exists profiles(id uuid primary key references auth.users on delete cascade, is_admin boolean not null default false);
create table if not exists portfolio(id uuid primary key default gen_random_uuid(), title text, cat text, img text, created_at timestamptz default now());
create table if not exists presets(id uuid primary key default gen_random_uuid(), title text, price bigint default 0, descr text, img text, created_at timestamptz default now());
create table if not exists courses(id uuid primary key default gen_random_uuid(), title text, price bigint default 0, dur text, descr text, created_at timestamptz default now());
create table if not exists bookings(id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users, name text, phone text, loc text, kind text, date text, time text, note text, status text default 'جدید', created_at timestamptz default now());
create table if not exists orders(id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users, kind text, item text, amount bigint, name text, phone text, ref text, rcpt text, file text, status text default 'در انتظار تایید', created_at timestamptz default now());

create or replace function is_admin() returns boolean language sql stable security definer set search_path=public as
$$ select coalesce((select is_admin from profiles where id=auth.uid()),false) $$;

create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path=public as
$$ begin insert into profiles(id) values(new.id) on conflict do nothing; return new; end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

alter table site_config enable row level security; alter table profiles enable row level security;
alter table portfolio enable row level security; alter table presets enable row level security; alter table courses enable row level security;
alter table bookings enable row level security; alter table orders enable row level security;

create policy "own profile" on profiles for select using (id=auth.uid());
do $$ declare t text; begin
 foreach t in array array['site_config','portfolio','presets','courses'] loop
  execute format('create policy "public read" on %I for select using (true)',t);
  execute format('create policy "admin write" on %I for all using (is_admin()) with check (is_admin())',t);
 end loop;
 foreach t in array array['bookings','orders'] loop
  execute format('create policy "own insert" on %I for insert to authenticated with check (user_id=auth.uid())',t);
  execute format('create policy "own or admin read" on %I for select to authenticated using (user_id=auth.uid() or is_admin())',t);
  execute format('create policy "admin update" on %I for update using (is_admin())',t);
  execute format('create policy "admin delete" on %I for delete using (is_admin())',t);
 end loop;
end $$;

-- Storage bucket for photos and receipts
insert into storage.buckets(id,name,public) values('media','media',true) on conflict do nothing;
create policy "media public read" on storage.objects for select using (bucket_id='media');
create policy "media upload" on storage.objects for insert to authenticated with check (bucket_id='media' and (is_admin() or name like 'receipts/'||auth.uid()::text||'/%'));
create policy "media admin manage" on storage.objects for all using (bucket_id='media' and is_admin()) with check (bucket_id='media' and is_admin());

-- After you sign up on the site once, make yourself admin (change the email):
-- update profiles set is_admin=true where id=(select id from auth.users where email='YOU@EXAMPLE.COM');
