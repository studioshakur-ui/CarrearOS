create table public.job_import_runs (
  id                uuid                     not null default gen_random_uuid(),
  source_id         uuid                     not null,
  run_type          text                     not null check (run_type in ('scheduled', 'manual_internal', 'retry')),
  status            public.import_run_status not null default 'running',
  started_at        timestamptz              not null default now(),
  finished_at       timestamptz,
  fetched_count     integer                  not null default 0 check (fetched_count >= 0),
  normalized_count  integer                  not null default 0 check (normalized_count >= 0),
  deduped_count     integer                  not null default 0 check (deduped_count >= 0),
  enriched_count    integer                  not null default 0 check (enriched_count >= 0),
  error_count       integer                  not null default 0 check (error_count >= 0),
  error_log         text,
  meta              jsonb,

  constraint job_import_runs_pkey            primary key (id),
  constraint job_import_runs_source_id_fkey  foreign key (source_id) references public.job_sources (id) on delete restrict
);

create index job_import_runs_source_id_idx          on public.job_import_runs (source_id);
create index job_import_runs_source_started_at_idx  on public.job_import_runs (source_id, started_at desc);
create index job_import_runs_status_idx             on public.job_import_runs (status);
