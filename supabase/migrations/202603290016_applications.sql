create table public.applications (
  id          uuid                      not null default gen_random_uuid(),
  profile_id  uuid                      not null,
  job_id      uuid                      not null,
  status      public.application_status not null default 'saved',
  applied_at  timestamptz,
  notes       text,
  created_at  timestamptz               not null default now(),
  updated_at  timestamptz               not null default now(),

  constraint applications_pkey                   primary key (id),
  constraint applications_profile_id_job_id_key  unique (profile_id, job_id),
  constraint applications_profile_id_fkey        foreign key (profile_id) references public.profiles (id) on delete cascade,
  constraint applications_job_id_fkey            foreign key (job_id)     references public.jobs     (id) on delete cascade
);

create index applications_profile_id_idx      on public.applications (profile_id);
create index applications_profile_status_idx  on public.applications (profile_id, status);
create index applications_job_id_idx          on public.applications (job_id);
