create table public.job_analyses (
  id                  uuid                    not null default gen_random_uuid(),
  job_id              uuid                    not null,
  short_summary       text,
  detected_skills     jsonb                   not null default '[]',
  detected_languages  jsonb                   not null default '[]',
  detected_seniority  public.experience_level not null default 'unknown',
  quality_flags       jsonb                   not null default '[]',
  keywords            jsonb,
  model_name          text                    not null,
  prompt_version      text                    not null,
  created_at          timestamptz             not null default now(),
  updated_at          timestamptz             not null default now(),

  constraint job_analyses_pkey        primary key (id),
  constraint job_analyses_job_id_key  unique (job_id),
  constraint job_analyses_job_id_fkey foreign key (job_id) references public.jobs (id) on delete cascade
);
