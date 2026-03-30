-- Add required_skills to jobs for Phase 3 deterministic matching.
-- This is a minimal column addition, not a schema redesign.
alter table public.jobs
  add column if not exists required_skills jsonb not null default '[]';
