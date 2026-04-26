# Meal Prep Buddy

Meal Prep Buddy is a small web app for organizing meal prep recipes.

The goal is to help someone save recipes they already trust, turn them into clear structured records, and reuse them when planning meals for the week. The app focuses on practical meal prep instead of acting like a general recipe chatbot.

## What The App Does

- Saves recipes with ingredients, steps, calories, macros, servings, prep time, tags, and source details
- Shows a recipe library in a dashboard
- Lets the user filter recipes by search, protein, cuisine, carbs, and favorites
- Suggests recipes from the saved library for weekly planning
- Supports a simple weekly plan with selected meals and a shopping list
- Stores basic user preferences such as calorie target, meals per day, cooking days, and liked foods

## Technical Stack

- Next.js with the App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Drizzle ORM
- SQLite for local development
- Zod for form and environment validation
- Vitest and Testing Library for tests

## How It Was Built

The project started with the core product idea: a single-user meal prep tool where structured recipes are more important than chat history.

From there, the app was built in layers:

1. A Next.js App Router foundation was created for the landing page, product routes, and API routes.
2. A local SQLite database was added with Drizzle ORM for recipes, preferences, and weekly planning data.
3. Reusable server repositories were added so database logic stays separate from the UI.
4. Zod schemas were added to validate recipe and onboarding form data.
5. The dashboard was built around saved recipes, filters, suggestions, weekly planning, and shopping list data.
6. Reusable UI components were added for buttons, cards, form fields, badges, empty states, and layout sections.
7. Tests were added for important behavior such as dashboard state, recipe actions, onboarding, and API health checks.

## Local Development

Install dependencies:

```bash
corepack pnpm install
```

Create a local environment file if needed:

```bash
cp .env.example .env
```

Run database migrations:

```bash
corepack pnpm db:migrate
```

Start the development server:

```bash
corepack pnpm dev
```

Open the app at:

```text
http://localhost:3000
```

## Useful Commands

```bash
corepack pnpm dev
corepack pnpm build
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm db:generate
corepack pnpm db:migrate
```

## Deployment Note

The app currently uses SQLite for local development. Before using it as a production app on Vercel, the database should be moved to a hosted database so saved recipes and preferences persist reliably.
