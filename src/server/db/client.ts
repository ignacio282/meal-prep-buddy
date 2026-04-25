import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { serverEnv } from "../../lib/env/server";
import * as schema from "./schema";

declare global {
  var mealPrepBuddySqlite: Database.Database | undefined;
}

const sqlite =
  globalThis.mealPrepBuddySqlite ?? new Database(serverEnv.DATABASE_URL);

if (process.env.NODE_ENV !== "production") {
  globalThis.mealPrepBuddySqlite = sqlite;
}

export const db = drizzle(sqlite, { schema });

export type DatabaseClient = typeof db;
