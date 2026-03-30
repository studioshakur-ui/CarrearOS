-- profiles: one row per auth user, created automatically on signup
create table public.profiles (
  id                  uuid        primary key references auth.users (id) on delete cascade,
  email               text        not null,
  full_name           text,
  onboarding_complete boolean     not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- cvs: a user can store multiple CV files; one is active at a time
create table public.cvs (
  id           uuid           primary key default gen_random_uuid(),
  profile_id   uuid           not null references public.profiles (id) on delete cascade,
  file_name    text           not null,
  storage_path text           not null,
  status       public.cv_status not null default 'draft',
  created_at   timestamptz    not null default now(),
  updated_at   timestamptz    not null default now()
);

create index cvs_profile_id_idx on public.cvs (profile_id);
