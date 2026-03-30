-- Phase 4.5: extend ai_actions with tailored_cv output from Action Agent.

alter table public.ai_actions
  add column if not exists tailored_cv jsonb;
