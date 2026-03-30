create table public.matches (
  id              uuid                     not null default gen_random_uuid(),
  profile_id      uuid                     not null,
  job_id          uuid                     not null,
  ai_profile_id   uuid                     not null,
  score           integer                  not null check (score >= 0 and score <= 100),
  strengths       jsonb                    not null default '[]',
  gaps            jsonb                    not null default '[]',
  reasons         jsonb                    not null default '[]',
  recommendation  public.ai_recommendation not null,
  model_name      text                     not null,
  prompt_version  text                     not null,
  generated_at    timestamptz              not null default now(),
  expires_at      timestamptz,

  constraint matches_pkey                   primary key (id),
  constraint matches_profile_id_job_id_key  unique (profile_id, job_id),
  constraint matches_profile_id_fkey        foreign key (profile_id)    references public.profiles    (id) on delete cascade,
  constraint matches_job_id_fkey            foreign key (job_id)        references public.jobs        (id) on delete cascade,
  constraint matches_ai_profile_id_fkey     foreign key (ai_profile_id) references public.ai_profiles (id) on delete cascade
);

create index matches_profile_id_idx     on public.matches (profile_id);
create index matches_profile_score_idx  on public.matches (profile_id, score desc);
create index matches_job_id_idx         on public.matches (job_id);
create index matches_recommendation_idx on public.matches (recommendation);
