# Architecture

## Goal

Build a premium AI Career Copilot for Gulf hiring with a lean, auditable architecture.

## Current foundation

- `apps/web` hosts the Next.js App Router application.
- `packages/core` is reserved for shared domain types and validation helpers.
- `packages/ai` is reserved for future AI orchestration code.
- `packages/jobs` is reserved for future ingestion connectors and job-processing logic.
- `supabase` holds migration-first database setup.

## Boundaries

- No business workflows yet.
- No multi-agent framework.
- No ingestion implementation.
- No employer, billing, or social modules.
