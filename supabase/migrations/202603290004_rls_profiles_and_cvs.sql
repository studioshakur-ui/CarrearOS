alter table public.profiles enable row level security;
alter table public.cvs     enable row level security;

-- profiles: users read and update only their own row
create policy "profiles: owner select"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: owner update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- cvs: profile_id always equals auth.uid() because profiles.id = auth.users.id
create policy "cvs: owner select"
  on public.cvs for select
  using (profile_id = auth.uid());

create policy "cvs: owner insert"
  on public.cvs for insert
  with check (profile_id = auth.uid());

create policy "cvs: owner update"
  on public.cvs for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "cvs: owner delete"
  on public.cvs for delete
  using (profile_id = auth.uid());
