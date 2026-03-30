create table public.jobs (
  id                  uuid                    not null default gen_random_uuid(),
  source_id           uuid                    not null,
  primary_raw_job_id  uuid,
  external_job_id     text,
  canonical_key       text                    not null,
  title               text                    not null,
  title_normalized    text                    not null,
  company             text                    not null,
  company_normalized  text                    not null,
  location            text,
  country_code        text,
  city                text,
  remote_type         public.remote_type      not null default 'unknown',
  employment_type     public.employment_type  not null default 'unknown',
  experience_level    public.experience_level not null default 'unknown',
  description         text                    not null,
  description_hash    text                    not null,
  apply_url           text,
  source_url          text,
  salary_min          integer                 check (salary_min > 0),
  salary_max          integer                 check (salary_max > 0 and (salary_min is null or salary_max >= salary_min)),
  salary_currency     text,
  published_at        timestamptz,
  first_seen_at       timestamptz             not null default now(),
  last_seen_at        timestamptz             not null default now(),
  expired_at          timestamptz,
  is_active           boolean                 not null default true,
  created_at          timestamptz             not null default now(),
  updated_at          timestamptz             not null default now(),

  constraint jobs_pkey                    primary key (id),
  constraint jobs_canonical_key_key       unique (canonical_key),
  constraint jobs_source_id_fkey          foreign key (source_id)          references public.job_sources (id) on delete restrict,
  constraint jobs_primary_raw_job_id_fkey foreign key (primary_raw_job_id) references public.raw_jobs   (id) on delete set null
);

create index jobs_is_active_idx           on public.jobs (is_active);
create index jobs_last_seen_at_idx        on public.jobs (last_seen_at desc);
create index jobs_country_code_idx        on public.jobs (country_code);
create index jobs_remote_type_idx         on public.jobs (remote_type);
create index jobs_experience_level_idx    on public.jobs (experience_level);
create index jobs_employment_type_idx     on public.jobs (employment_type);
create index jobs_company_normalized_idx  on public.jobs (company_normalized);
create index jobs_title_normalized_idx    on public.jobs (title_normalized);
