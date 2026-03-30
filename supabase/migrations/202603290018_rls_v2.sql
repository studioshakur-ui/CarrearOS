-- User-owned tables
alter table public.ai_profiles   enable row level security;
alter table public.matches        enable row level security;
alter table public.ai_actions     enable row level security;
alter table public.applications   enable row level security;

-- Backend-managed tables (service role writes, auth users read where applicable)
alter table public.jobs           enable row level security;
alter table public.job_analyses   enable row level security;
alter table public.job_sources    enable row level security;
alter table public.job_import_runs enable row level security;
alter table public.raw_jobs       enable row level security;

-- ai_profiles: owner read only (service role writes via admin client, bypasses RLS)
create policy "ai_profiles: owner select"
  on public.ai_profiles for select
  using (profile_id = auth.uid());

-- matches: owner read only
create policy "matches: owner select"
  on public.matches for select
  using (profile_id = auth.uid());

-- ai_actions: owner read only
create policy "ai_actions: owner select"
  on public.ai_actions for select
  using (profile_id = auth.uid());

-- applications: full owner CRUD
create policy "applications: owner select"
  on public.applications for select
  using (profile_id = auth.uid());

create policy "applications: owner insert"
  on public.applications for insert
  with check (profile_id = auth.uid());

create policy "applications: owner update"
  on public.applications for update
  using    (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "applications: owner delete"
  on public.applications for delete
  using (profile_id = auth.uid());

-- jobs: any authenticated user can read active jobs
create policy "jobs: authenticated select"
  on public.jobs for select
  using (auth.uid() is not null and is_active = true);

-- job_analyses: any authenticated user can read
create policy "job_analyses: authenticated select"
  on public.job_analyses for select
  using (auth.uid() is not null);

-- job_sources, job_import_runs, raw_jobs: no user access
-- service role bypasses RLS — no policies needed for those tables
