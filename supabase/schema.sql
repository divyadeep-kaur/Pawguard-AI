-- PawGuard · Supabase schema, roles and Row Level Security
-- Run once in Supabase → SQL Editor. Safe to re-run (idempotent where possible).
-- Roles: adopter, volunteer (self-service sign-up) and admin (NGO; granted ONLY in the database, see bottom).

create extension if not exists pgcrypto;

-- ---------- types ----------
do $$ begin create type user_role as enum ('adopter','volunteer','admin'); exception when duplicate_object then null; end $$;
do $$ begin create type animal_status as enum ('in_care','recovering','available','pending_adoption','adopted'); exception when duplicate_object then null; end $$;
do $$ begin create type app_status as enum ('pending','under_review','approved','rejected','completed'); exception when duplicate_object then null; end $$;
do $$ begin create type rescue_status as enum ('reported','accepted','in_progress','rescued','closed'); exception when duplicate_object then null; end $$;
do $$ begin create type urgency_level as enum ('low','medium','high','critical'); exception when duplicate_object then null; end $$;

-- ---------- tables ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  phone text check (phone is null or char_length(phone) <= 30),
  city text check (city is null or char_length(city) <= 80),
  role user_role not null default 'adopter',
  created_at timestamptz not null default now()
);

create table if not exists public.centres (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  address text not null check (char_length(address) <= 300),
  city text not null check (char_length(city) <= 80),
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  phone text, email text, website text,
  verified boolean not null default false,   -- only an admin can set; shown as "Verified" in UI
  is_demo boolean not null default false,    -- clearly label sample rows
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.animals (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  species text not null check (species in ('dog','cat','other')),
  breed text check (breed is null or char_length(breed) <= 80),
  age_months int check (age_months between 0 and 360),
  gender text not null default 'unknown' check (gender in ('male','female','unknown')),
  health_status text not null default 'Healthy' check (char_length(health_status) <= 160),
  vaccinated boolean not null default false,
  neutered boolean not null default false,
  description text check (description is null or char_length(description) <= 2000),
  photo_url text,
  city text check (city is null or char_length(city) <= 80),
  centre_id uuid references public.centres(id) on delete set null,
  status animal_status not null default 'in_care',  -- only 'available' shows in the marketplace
  is_demo boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create index if not exists animals_status_idx on public.animals(status);

create table if not exists public.favourites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  animal_id uuid not null references public.animals(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, animal_id)
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animals(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  status app_status not null default 'pending',
  phone text not null check (char_length(phone) between 6 and 30),
  home_type text not null check (home_type in ('house','apartment','farm','other')),
  has_other_pets boolean not null default false,
  experience text check (experience is null or char_length(experience) <= 1000),
  reason text not null check (char_length(reason) between 10 and 2000),
  admin_notes text check (admin_notes is null or char_length(admin_notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists one_open_app_per_animal on public.applications(animal_id, applicant_id)
  where status in ('pending','under_review','approved');

create table if not exists public.rescue_requests (
  id uuid primary key default gen_random_uuid(),
  ticket text unique not null default ('PG-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6))),
  reporter_id uuid references public.profiles(id) on delete set null,
  species text not null default 'dog' check (species in ('dog','cat','cow','bird','other')),
  description text not null check (char_length(description) between 5 and 2000),
  urgency urgency_level not null default 'medium',
  address text check (address is null or char_length(address) <= 300),
  city text check (city is null or char_length(city) <= 80),
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  photo_url text,
  status rescue_status not null default 'reported',
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rescue_status_idx on public.rescue_requests(status);

create table if not exists public.rescue_updates (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.rescue_requests(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  status rescue_status not null,
  note text check (note is null or char_length(note) <= 1000),
  created_at timestamptz not null default now()
);

-- ---------- helpers ----------
create or replace function public.my_role() returns user_role
language sql stable security definer set search_path = public as
$$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false) $$;

create or replace function public.is_volunteer() returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce((select role in ('volunteer','admin') from public.profiles where id = auth.uid()), false) $$;

-- ---------- new-user trigger: role comes from sign-up, but NEVER admin ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare r user_role := 'adopter';
begin
  if new.raw_user_meta_data->>'role' = 'volunteer' then r := 'volunteer'; end if;
  insert into public.profiles(id, full_name, phone, city, role)
  values (new.id,
          left(coalesce(new.raw_user_meta_data->>'full_name',''),120),
          left(new.raw_user_meta_data->>'phone',30),
          left(new.raw_user_meta_data->>'city',80), r)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- guard: only an admin (or the DB owner) may change role ----------
create or replace function public.guard_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Only an administrator can change roles' using errcode = '42501';
  end if;
  return new;
end $$;
drop trigger if exists guard_profile_trg on public.profiles;
create trigger guard_profile_trg before update on public.profiles
  for each row execute function public.guard_profile();

-- ---------- guard: verified flag on centres only by admin (policies already admin-only; belt and braces) ----------

-- ---------- application rules ----------
create or replace function public.application_before() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if not exists (select 1 from public.animals where id = new.animal_id and status = 'available') then
      raise exception 'This animal is not available for adoption' using errcode = 'P0001';
    end if;
    new.status := 'pending'; new.admin_notes := null; new.applicant_id := auth.uid();
  else
    new.updated_at := now();
  end if;
  return new;
end $$;
drop trigger if exists application_before_trg on public.applications;
create trigger application_before_trg before insert or update on public.applications
  for each row execute function public.application_before();

create or replace function public.application_after() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'approved'  then update public.animals set status = 'pending_adoption' where id = new.animal_id and status = 'available'; end if;
    if new.status = 'completed' then update public.animals set status = 'adopted' where id = new.animal_id; end if;
    if new.status = 'rejected'  then update public.animals set status = 'available' where id = new.animal_id and status = 'pending_adoption'
        and not exists (select 1 from public.applications a where a.animal_id = new.animal_id and a.id <> new.id and a.status = 'approved'); end if;
  end if;
  return new;
end $$;
drop trigger if exists application_after_trg on public.applications;
create trigger application_after_trg after update on public.applications
  for each row execute function public.application_after();

-- ---------- rescue: reporter fields forced server-side ----------
create or replace function public.rescue_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.reporter_id := auth.uid(); new.status := 'reported'; new.assigned_to := null;
  return new;
end $$;
drop trigger if exists rescue_before_insert_trg on public.rescue_requests;
create trigger rescue_before_insert_trg before insert on public.rescue_requests
  for each row execute function public.rescue_before_insert();

-- Volunteers accept & progress cases through these functions (no direct UPDATE rights).
create or replace function public.accept_rescue(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_volunteer() then raise exception 'Volunteers only' using errcode='42501'; end if;
  update public.rescue_requests set assigned_to = auth.uid(), status = 'accepted', updated_at = now()
   where id = p_id and assigned_to is null and status = 'reported';
  if not found then raise exception 'Case already taken or not open' using errcode='P0001'; end if;
  insert into public.rescue_updates(request_id, author_id, status, note) values (p_id, auth.uid(), 'accepted', 'Volunteer accepted the case');
end $$;

create or replace function public.update_rescue(p_id uuid, p_status rescue_status, p_note text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not (public.is_admin() or exists (select 1 from public.rescue_requests where id = p_id and assigned_to = auth.uid())) then
    raise exception 'Not allowed' using errcode='42501';
  end if;
  update public.rescue_requests set status = p_status, updated_at = now() where id = p_id;
  insert into public.rescue_updates(request_id, author_id, status, note) values (p_id, auth.uid(), p_status, left(p_note,1000));
end $$;

create or replace function public.assign_rescue(p_id uuid, p_volunteer uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Admins only' using errcode='42501'; end if;
  if p_volunteer is not null and not exists (select 1 from public.profiles where id = p_volunteer and role in ('volunteer','admin')) then
    raise exception 'Not a volunteer' using errcode='P0001'; end if;
  update public.rescue_requests set assigned_to = p_volunteer,
         status = case when p_volunteer is null then 'reported' when status = 'reported' then 'accepted' else status end,
         updated_at = now() where id = p_id;
  insert into public.rescue_updates(request_id, author_id, status, note)
    select id, auth.uid(), status, case when p_volunteer is null then 'Unassigned by admin' else 'Assigned by admin' end from public.rescue_requests where id = p_id;
end $$;

-- Volunteer directory for the admin assign dropdown (names only)
create or replace function public.list_volunteers() returns table(id uuid, full_name text, city text)
language sql stable security definer set search_path = public as $$
  select p.id, p.full_name, p.city from public.profiles p
  where public.is_admin() and p.role in ('volunteer','admin') order by p.full_name $$;

-- Admin analytics
create or replace function public.admin_stats() returns json
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Admins only' using errcode='42501'; end if;
  return json_build_object(
    'animals_total',      (select count(*) from animals),
    'animals_available',  (select count(*) from animals where status='available'),
    'animals_adopted',    (select count(*) from animals where status='adopted'),
    'applications_total', (select count(*) from applications),
    'applications_open',  (select count(*) from applications where status in ('pending','under_review')),
    'rescues_total',      (select count(*) from rescue_requests),
    'rescues_open',       (select count(*) from rescue_requests where status in ('reported','accepted','in_progress')),
    'rescues_done',       (select count(*) from rescue_requests where status in ('rescued','closed')),
    'volunteers',         (select count(*) from profiles where role='volunteer'),
    'adopters',           (select count(*) from profiles where role='adopter'),
    'by_status',          (select coalesce(json_object_agg(status, n),'{}'::json) from (select status, count(*) n from rescue_requests group by status) s)
  );
end $$;

-- Public: look up a rescue ticket status without exposing the row (no login needed)
create or replace function public.track_ticket(p_ticket text) returns table(ticket text, status rescue_status, urgency urgency_level, updated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select r.ticket, r.status, r.urgency, r.updated_at from public.rescue_requests r where r.ticket = upper(trim(p_ticket)) $$;

-- ---------- Row Level Security ----------
alter table public.profiles       enable row level security;
alter table public.centres        enable row level security;
alter table public.animals        enable row level security;
alter table public.favourites     enable row level security;
alter table public.applications   enable row level security;
alter table public.rescue_requests enable row level security;
alter table public.rescue_updates enable row level security;

-- profiles: see/edit own; admins see all
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- centres: public read, admin write
drop policy if exists centres_read on public.centres;
create policy centres_read on public.centres for select to anon, authenticated using (true);
drop policy if exists centres_admin on public.centres;
create policy centres_admin on public.centres for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- animals: public sees only available; admin sees/writes all
drop policy if exists animals_read on public.animals;
create policy animals_read on public.animals for select to anon, authenticated using (status = 'available' or public.is_admin());
drop policy if exists animals_admin on public.animals;
create policy animals_admin on public.animals for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- adopters need to see the animal they applied for even after status changes:
drop policy if exists animals_applicant_read on public.animals;
create policy animals_applicant_read on public.animals for select to authenticated
  using (exists (select 1 from public.applications a where a.animal_id = animals.id and a.applicant_id = auth.uid()));

-- favourites: own only
drop policy if exists fav_own on public.favourites;
create policy fav_own on public.favourites for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- applications: applicant inserts/reads own; admin reads/updates all
drop policy if exists app_insert on public.applications;
create policy app_insert on public.applications for insert to authenticated with check (applicant_id = auth.uid());
drop policy if exists app_select on public.applications;
create policy app_select on public.applications for select to authenticated using (applicant_id = auth.uid() or public.is_admin());
drop policy if exists app_admin_update on public.applications;
create policy app_admin_update on public.applications for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- rescue requests: any signed-in user may report; volunteers/admin read all; reporters read own. Writes to existing rows only via functions above (admin may also edit).
drop policy if exists rescue_insert on public.rescue_requests;
create policy rescue_insert on public.rescue_requests for insert to authenticated with check (reporter_id = auth.uid());
drop policy if exists rescue_select on public.rescue_requests;
create policy rescue_select on public.rescue_requests for select to authenticated using (public.is_volunteer() or reporter_id = auth.uid());
drop policy if exists rescue_admin on public.rescue_requests;
create policy rescue_admin on public.rescue_requests for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists rescue_admin_del on public.rescue_requests;
create policy rescue_admin_del on public.rescue_requests for delete to authenticated using (public.is_admin());

drop policy if exists upd_select on public.rescue_updates;
create policy upd_select on public.rescue_updates for select to authenticated
  using (public.is_volunteer() or exists (select 1 from public.rescue_requests r where r.id = request_id and r.reporter_id = auth.uid()));

-- Column-level hardening: authenticated users cannot insert rows into updates directly
revoke insert, update, delete on public.rescue_updates from anon, authenticated;
revoke all on public.profiles from anon;
grant execute on function public.track_ticket(text) to anon, authenticated;
revoke execute on function public.admin_stats(), public.list_volunteers(), public.assign_rescue(uuid,uuid),
  public.accept_rescue(uuid), public.update_rescue(uuid, rescue_status, text) from anon;

-- ---------- Storage (photos) ----------
insert into storage.buckets (id, name, public) values ('photos','photos', true) on conflict (id) do nothing;
drop policy if exists photos_read on storage.objects;
create policy photos_read on storage.objects for select to anon, authenticated using (bucket_id = 'photos');
drop policy if exists photos_upload on storage.objects;
create policy photos_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists photos_delete on storage.objects;
create policy photos_delete on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ---------- Realtime ----------
do $$ begin alter publication supabase_realtime add table public.rescue_requests; exception when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.applications; exception when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.animals; exception when others then null; end $$;

-- ---------- Making an NGO admin (run by the project owner, in the SQL editor, after that person has signed up) ----------
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'ngo@example.org');

-- =====================================================================================
-- 0002 · NGO / Admin role selection WITHOUT self-promotion
-- Anyone can choose "NGO / organisation" at sign-up. That only sets profiles.admin_requested = true;
-- the account stays a normal 'adopter' until an existing admin approves it (approve_admin) or the
-- project owner promotes it in the SQL editor. The very first admin is always promoted in SQL (see bottom of 0001).
-- Safe to re-run.
-- =====================================================================================
alter table public.profiles add column if not exists admin_requested boolean not null default false;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare r user_role := 'adopter'; want_admin boolean := false;
begin
  -- 'role' comes from sign-up metadata, which the user controls: only volunteer is honoured directly.
  if new.raw_user_meta_data->>'role' = 'volunteer' then r := 'volunteer';
  elsif new.raw_user_meta_data->>'role' = 'ngo' then want_admin := true;   -- request only; role stays 'adopter'
  end if;
  insert into public.profiles(id, full_name, phone, city, role, admin_requested)
  values (new.id,
          left(coalesce(new.raw_user_meta_data->>'full_name',''),120),
          left(new.raw_user_meta_data->>'phone',30),
          left(new.raw_user_meta_data->>'city',80), r, want_admin)
  on conflict (id) do nothing;
  return new;
end $$;

create or replace function public.guard_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.role is distinct from old.role then
      raise exception 'Only an administrator can change roles' using errcode = '42501';
    end if;
    if new.admin_requested is distinct from old.admin_requested then
      raise exception 'Only an administrator can change admin requests' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;

-- Pending NGO/admin requests, for the admin dashboard (admin only; includes e-mail from auth.users)
create or replace function public.list_admin_requests()
returns table(id uuid, full_name text, phone text, city text, email text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select p.id, p.full_name, p.phone, p.city, u.email::text, p.created_at
  from public.profiles p join auth.users u on u.id = p.id
  where public.is_admin() and p.admin_requested and p.role <> 'admin'
  order by p.created_at $$;

-- Approve or decline a request (admin only)
create or replace function public.resolve_admin_request(p_id uuid, p_approve boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Admins only' using errcode = '42501'; end if;
  update public.profiles
     set role = case when p_approve then 'admin'::user_role else role end, admin_requested = false
   where id = p_id and admin_requested;
  if not found then raise exception 'No pending request for that user' using errcode = 'P0001'; end if;
end $$;

revoke all on function public.list_admin_requests(), public.resolve_admin_request(uuid, boolean) from public, anon;
grant execute on function public.list_admin_requests(), public.resolve_admin_request(uuid, boolean) to authenticated;
