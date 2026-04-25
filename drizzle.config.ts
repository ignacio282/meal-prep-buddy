import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL ?? "./drizzle/local.db";

export default defineConfig({
  out: "./drizzle/migrations",
  schema: "./src/server/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
