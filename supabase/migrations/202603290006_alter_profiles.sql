-- Replace full_name with first_name + last_name
alter table public.profiles
  drop column if exists full_name,
  drop column if exists onboarding_complete;

alter table public.profiles
  add column first_name              text,
  add column last_name               text,
  add column country_code            text,
  add column city                    text,
  add column languages               jsonb                   not null default '[]',
  add column desired_roles           jsonb                   not null default '[]',
  add column experience_level        public.experience_level not null default 'unknown',
  add column mobility                public.mobility_type    not null default 'unknown',
  add column remote_preference       public.remote_type      not null default 'unknown',
  add column salary_expectation_min  integer                 check (salary_expectation_min > 0),
  add column salary_currency         text,
  add column is_profile_complete     boolean                 not null default false;

create index profiles_country_code_idx      on public.profiles (country_code);
create index profiles_experience_level_idx  on public.profiles (experience_level);
