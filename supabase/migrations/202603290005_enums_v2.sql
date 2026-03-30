create type public.experience_level as enum (
  'intern',
  'junior',
  'mid',
  'senior',
  'lead',
  'unknown'
);

create type public.remote_type as enum (
  'onsite',
  'hybrid',
  'remote',
  'unknown'
);

create type public.employment_type as enum (
  'full_time',
  'part_time',
  'internship',
  'apprenticeship',
  'contract',
  'temporary',
  'freelance',
  'unknown'
);

create type public.mobility_type as enum (
  'local_only',
  'national',
  'international',
  'remote_only',
  'unknown'
);

create type public.application_status as enum (
  'saved',
  'planned',
  'applied',
  'interview',
  'offer',
  'rejected',
  'withdrawn'
);

create type public.job_processing_status as enum (
  'pending',
  'normalized',
  'deduped',
  'enriched',
  'failed'
);

create type public.import_run_status as enum (
  'running',
  'completed',
  'partial',
  'failed'
);

create type public.ai_recommendation as enum (
  'apply',
  'maybe',
  'skip'
);
