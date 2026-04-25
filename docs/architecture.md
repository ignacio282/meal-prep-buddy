# Architecture

## Principles

- Keep the App Router layer thin. `src/app` should compose layouts, pages, and route handlers rather than hold business logic.
- Keep server-only code inside `src/server` and guard it with `server-only` where appropriate.
- Keep feature work grouped by product domain in `src/features`.
- Validate environment variables, API inputs, and future AI outputs with `zod` before use or persistence.

## Folder Ownership

- `src/app`: route segments, layouts, metadata, and HTTP route handlers.
- `src/components`: shared UI primitives and layout components that can be reused across features.
- `src/features`: future ingestion, recipes, and settings modules.
- `src/server/db`: schema, client bootstrap, and migration entrypoints.
- `src/server/repositories`: persistence-focused data access helpers.
- `src/server/services`: orchestration and application services called by routes or server actions.
- `src/server/ai`: future OpenAI task modules and response normalization logic.
- `src/lib/env`: environment parsing and validation.
- `src/lib/constants`: cross-cutting constants that are safe to share.
- `src/types`: shared type declarations when a type does not clearly belong to a specific feature.

## Route Handler Rules

- Route handlers in `src/app/api` should parse inputs, call a service, and shape the HTTP response.
- Do not place database calls, prompt construction, or long-lived business rules directly in route files.
- Treat all persistent writes and future AI outputs as schema-driven data flows.

## Server and Client Boundary

- Server-only modules must not be imported by client components.
- Shared types and constants should stay free of Node-only APIs.
- If a module needs secrets, filesystem access, or database access, it belongs under `src/server`.
