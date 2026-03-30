-- Add storage bucket + enriched metadata columns
alter table public.cvs
  add column storage_bucket      text,
  add column mime_type           text,
  add column size_bytes          bigint      check (size_bytes > 0),
  add column raw_text            text,
  add column parsed_text_status  text        not null default 'pending'
                                             check (parsed_text_status in ('pending', 'success', 'failed')),
  add column parsing_error       text,
  add column is_primary          boolean     not null default true;

create index cvs_profile_primary_idx on public.cvs (profile_id, is_primary);
