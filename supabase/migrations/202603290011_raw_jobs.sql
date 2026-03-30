create table public.raw_jobs (
  id                 uuid                         not null default gen_random_uuid(),
  source_id          uuid                         not null,
  import_run_id      uuid                         not null,
  external_job_id    text,
  source_url         text,
  apply_url          text,
  title_raw          text,
  company_raw        text,
  location_raw       text,
  raw_payload        jsonb                        not null,
  content_hash       text                         not null,
  processing_status  public.job_processing_status not null default 'pending',
  processing_error   text,
  fetched_at         timestamptz                  not null default now(),
  created_at         timestamptz                  not null default now(),

  constraint raw_jobs_pkey                     primary key (id),
  constraint raw_jobs_source_id_fkey           foreign key (source_id)       references public.job_sources      (id) on delete restrict,
  constraint raw_jobs_import_run_id_fkey       foreign key (import_run_id)   references public.job_import_runs  (id) on delete restrict,
  constraint raw_jobs_source_content_hash_key  unique (source_id, content_hash)
);

create index raw_jobs_source_id_idx          on public.raw_jobs (source_id);
create index raw_jobs_import_run_id_idx      on public.raw_jobs (import_run_id);
create index raw_jobs_content_hash_idx       on public.raw_jobs (content_hash);
create index raw_jobs_processing_status_idx  on public.raw_jobs (processing_status);
create index raw_jobs_external_job_id_idx    on public.raw_jobs (external_job_id);
