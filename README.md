# Meal Prep Buddy

Meal Prep Buddy is a single-user MVP web app for AI-assisted meal prep planning. This scaffold sets up the project foundation only: App Router structure, server boundaries, database wiring, validation, and minimal quality gates.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Drizzle ORM with SQLite
- Zod for validation
- Vitest and Testing Library

## Getting Started

1. Install dependencies with `corepack pnpm install`.
2. Copy `.env.example` to `.env` if you need local overrides.
3. Generate and apply the initial database migration:
   - `corepack pnpm db:generate`
   - `corepack pnpm db:migrate`
4. Start the development server with `corepack pnpm dev`.

## Scripts

- `corepack pnpm dev` runs the local development server.
- `corepack pnpm build` creates a production build.
- `corepack pnpm lint` runs ESLint.
- `corepack pnpm typecheck` runs the TypeScript compiler.
- `corepack pnpm format:check` checks formatting.
- `corepack pnpm test` runs the Vitest suite.
- `corepack pnpm db:generate` generates Drizzle SQL migrations.
- `corepack pnpm db:migrate` applies generated migrations to the local SQLite database.

## Architecture Notes

- `src/app` holds routes, layouts, and route handlers only.
- `src/features` is reserved for feature-level UI and logic by product domain.
- `src/server` holds server-only code such as repositories, services, database access, and future AI orchestration.
- `src/lib` is for shared cross-cutting utilities, constants, and environment helpers.

More detail lives in [docs/architecture.md](./docs/architecture.md).
