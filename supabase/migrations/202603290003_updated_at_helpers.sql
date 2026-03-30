-- generic trigger function: sets updated_at = now() before any update
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_cvs_updated_at
  before update on public.cvs
  for each row execute procedure public.set_updated_at();
