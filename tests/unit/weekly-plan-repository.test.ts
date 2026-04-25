import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "@/server/db/schema";
import {
  assignWeeklyPlanSlot,
  getWeeklyPlan,
  setWeeklyPlanMealCount,
} from "@/server/repositories/weekly-plan";

function createTestDb() {
  const sqlite = new Database(":memory:");

  sqlite.exec(`
    CREATE TABLE recipes (
      id text PRIMARY KEY NOT NULL,
      title text NOT NULL,
      source_url text,
      source_label text,
      primary_protein text NOT NULL,
      cuisine text NOT NULL,
      total_calories integer NOT NULL,
      calories_per_serving integer NOT NULL,
      protein_grams integer NOT NULL,
      carb_grams integer NOT NULL,
      fat_grams integer NOT NULL,
      servings integer NOT NULL,
      prep_minutes integer NOT NULL,
      tags text NOT NULL,
      ingredients text NOT NULL,
      steps text NOT NULL,
      notes text,
      favorite integer DEFAULT false NOT NULL,
      planned_this_week integer DEFAULT false NOT NULL,
      created_at text NOT NULL,
      updated_at text NOT NULL
    );

    CREATE TABLE weekly_plan_settings (
      id text PRIMARY KEY NOT NULL,
      meal_count integer DEFAULT 1 NOT NULL,
      updated_at text NOT NULL
    );

    CREATE TABLE weekly_plan_slots (
      slot_index integer PRIMARY KEY NOT NULL,
      recipe_id text,
      updated_at text NOT NULL
    );
  `);

  sqlite.exec(`
    INSERT INTO recipes (
      id, title, source_url, source_label, primary_protein, cuisine, total_calories,
      calories_per_serving, protein_grams, carb_grams, fat_grams, servings,
      prep_minutes, tags, ingredients, steps, notes, favorite, planned_this_week,
      created_at, updated_at
    ) VALUES (
      'recipe-1', 'Chicken Bowl', NULL, NULL, 'Chicken', 'Mediterranean', 2200,
      550, 44, 40, 18, 4,
      35, '["High protein"]', '["Chicken","Rice"]', '["Cook","Portion"]', NULL, 0, 0,
      '2026-04-20T10:00:00.000Z', '2026-04-20T10:00:00.000Z'
    );
  `);

  return drizzle(sqlite, { schema });
}

describe("weekly plan repository", () => {
  it("persists meal count changes and clears hidden slots", () => {
    const db = createTestDb();

    assignWeeklyPlanSlot(0, "recipe-1", db);
    assignWeeklyPlanSlot(1, "recipe-1", db);
    setWeeklyPlanMealCount(2, db);
    const updatedPlan = setWeeklyPlanMealCount(1, db);

    expect(updatedPlan.mealCount).toBe(1);
    expect(updatedPlan.slots[0]?.recipeId).toBe("recipe-1");
    expect(updatedPlan.slots[1]?.recipeId).toBeNull();
    expect(updatedPlan.slots[2]?.recipeId).toBeNull();
  });

  it("returns stable slot rows for the current plan", () => {
    const db = createTestDb();
    const weeklyPlan = getWeeklyPlan(db);

    expect(weeklyPlan.mealCount).toBe(1);
    expect(weeklyPlan.slots).toHaveLength(3);
    expect(weeklyPlan.slots.map((slot) => slot.slotIndex)).toEqual([0, 1, 2]);
  });
});
