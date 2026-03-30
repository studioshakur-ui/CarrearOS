# DB Schema

## Status

Database work is scaffolded but intentionally undefined beyond migration placeholders.

## Planned first slices

- shared enums
- profiles and cvs
- `updated_at` helpers
- row-level security for profile and cv tables

## Rule

All database changes must land through migrations before application logic depends on them.
