-- Extend set_updated_at trigger to all new tables that carry an updated_at column.
-- Tables without updated_at (job_import_runs, raw_jobs, matches) are intentionally excluded.

create trigger set_ai_profiles_updated_at
  before update on public.ai_profiles
  for each row execute procedure public.set_updated_at();

create trigger set_job_sources_updated_at
  before update on public.job_sources
  for each row execute procedure public.set_updated_at();

create trigger set_jobs_updated_at
  before update on public.jobs
  for each row execute procedure public.set_updated_at();

create trigger set_job_analyses_updated_at
  before update on public.job_analyses
  for each row execute procedure public.set_updated_at();

create trigger set_ai_actions_updated_at
  before update on public.ai_actions
  for each row execute procedure public.set_updated_at();

create trigger set_applications_updated_at
  before update on public.applications
  for each row execute procedure public.set_updated_at();
