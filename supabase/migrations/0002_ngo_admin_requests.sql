
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
