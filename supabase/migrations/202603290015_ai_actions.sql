create table public.ai_actions (
  id                    uuid        not null default gen_random_uuid(),
  profile_id            uuid        not null,
  job_id                uuid        not null,
  match_id              uuid,
  should_apply          boolean     not null,
  rationale             text        not null,
  next_steps            jsonb       not null default '[]',
  message_draft         text,
  cover_note            text,
  cv_improvement_points jsonb       not null default '[]',
  model_name            text        not null,
  prompt_version        text        not null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint ai_actions_pkey                   primary key (id),
  constraint ai_actions_profile_id_job_id_key  unique (profile_id, job_id),
  constraint ai_actions_profile_id_fkey        foreign key (profile_id) references public.profiles (id) on delete cascade,
  constraint ai_actions_job_id_fkey            foreign key (job_id)     references public.jobs     (id) on delete cascade,
  constraint ai_actions_match_id_fkey          foreign key (match_id)   references public.matches  (id) on delete set null
);

create index ai_actions_profile_id_idx on public.ai_actions (profile_id);
create index ai_actions_job_id_idx     on public.ai_actions (job_id);
