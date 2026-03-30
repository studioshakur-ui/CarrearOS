create table public.job_sources (
  id                uuid        not null default gen_random_uuid(),
  source_key        text        not null,
  source_type       text        not null check (source_type in ('api', 'feed', 'crawler')),
  source_name       text        not null,
  base_url          text,
  fetch_strategy    text        not null check (fetch_strategy in ('poll', 'crawl')),
  is_active         boolean     not null default true,
  rate_limit_notes  text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint job_sources_pkey            primary key (id),
  constraint job_sources_source_key_key  unique (source_key)
);
