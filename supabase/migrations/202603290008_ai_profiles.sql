create table public.ai_profiles (
  id                   uuid                    not null default gen_random_uuid(),
  profile_id           uuid                    not null,
  cv_id                uuid                    not null,
  professional_summary text,
  detected_skills      jsonb                   not null default '[]',
  detected_languages   jsonb                   not null default '[]',
  seniority_estimate   public.experience_level not null default 'unknown',
  strengths            jsonb                   not null default '[]',
  weaknesses           jsonb                   not null default '[]',
  target_roles         jsonb                   not null default '[]',
  industry_hints       jsonb,
  mobility_assessment  public.mobility_type    not null default 'unknown',
  confidence_score     numeric(4,3)            not null default 0.0
                                               check (confidence_score >= 0.0 and confidence_score <= 1.0),
  model_name           text                    not null,
  prompt_version       text                    not null,
  source_hash          text,
  created_at           timestamptz             not null default now(),
  updated_at           timestamptz             not null default now(),

  constraint ai_profiles_pkey            primary key (id),
  constraint ai_profiles_profile_id_fkey foreign key (profile_id) references public.profiles (id) on delete cascade,
  constraint ai_profiles_cv_id_fkey      foreign key (cv_id)      references public.cvs     (id) on delete cascade
);

create index ai_profiles_profile_id_idx             on public.ai_profiles (profile_id);
create index ai_profiles_profile_id_created_at_idx  on public.ai_profiles (profile_id, created_at desc);
