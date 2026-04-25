import { desc, eq } from "drizzle-orm";

import type {
  CreateRecipeInput,
  UpdateRecipeInput,
} from "@/features/recipes/schema";
import { db } from "@/server/db";
import type { DatabaseClient } from "@/server/db/client";
import { recipes } from "@/server/db/schema";

type RecipeRow = typeof recipes.$inferSelect;

export type SavedRecipe = Omit<RecipeRow, "ingredients" | "steps" | "tags"> & {
  ingredients: string[];
  steps: string[];
  tags: string[];
};

function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function mapRowToRecipe(row: RecipeRow): SavedRecipe {
  return {
    ...row,
    tags: parseJsonArray(row.tags),
    ingredients: parseJsonArray(row.ingredients),
    steps: parseJsonArray(row.steps),
  };
}

export function listRecipes(dbClient: DatabaseClient = db) {
  return dbClient
    .select()
    .from(recipes)
    .orderBy(desc(recipes.createdAt))
    .all()
    .map(mapRowToRecipe);
}

export function getRecipeById(id: string, dbClient: DatabaseClient = db) {
  const row = dbClient.select().from(recipes).where(eq(recipes.id, id)).get();

  return row ? mapRowToRecipe(row) : null;
}

export function createRecipe(
  input: CreateRecipeInput,
  dbClient: DatabaseClient = db,
) {
  const timestamp = new Date().toISOString();
  const id = crypto.randomUUID();

  dbClient
    .insert(recipes)
    .values({
      id,
      title: input.title,
      sourceUrl: input.sourceUrl ?? null,
      sourceLabel: input.sourceLabel ?? null,
      primaryProtein: input.primaryProtein,
      cuisine: input.cuisine,
      totalCalories: input.totalCalories,
      caloriesPerServing: input.caloriesPerServing,
      proteinGrams: input.proteinGrams,
      carbGrams: input.carbGrams,
      fatGrams: input.fatGrams,
      servings: input.servings,
      prepMinutes: input.prepMinutes,
      tags: JSON.stringify(input.tags),
      ingredients: JSON.stringify(input.ingredients),
      steps: JSON.stringify(input.steps),
      notes: input.notes ?? null,
      favorite: false,
      plannedThisWeek: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .run();

  const recipe = getRecipeById(id, dbClient);

  if (!recipe) {
    throw new Error("Expected recipe to exist immediately after creation.");
  }

  return recipe;
}

export function updateRecipe(
  id: string,
  input: UpdateRecipeInput,
  dbClient: DatabaseClient = db,
) {
  const existingRecipe = getRecipeById(id, dbClient);

  if (!existingRecipe) {
    return null;
  }

  dbClient
    .update(recipes)
    .set({
      title: input.title,
      sourceUrl: input.sourceUrl ?? null,
      sourceLabel: input.sourceLabel ?? null,
      primaryProtein: input.primaryProtein,
      cuisine: input.cuisine,
      totalCalories: input.totalCalories,
      caloriesPerServing: input.caloriesPerServing,
      proteinGrams: input.proteinGrams,
      carbGrams: input.carbGrams,
      fatGrams: input.fatGrams,
      servings: input.servings,
      prepMinutes: input.prepMinutes,
      tags: JSON.stringify(input.tags),
      ingredients: JSON.stringify(input.ingredients),
      steps: JSON.stringify(input.steps),
      notes: input.notes ?? existingRecipe.notes,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(recipes.id, id))
    .run();

  return getRecipeById(id, dbClient);
}

export function updateRecipeNotes(
  id: string,
  notes: string | null,
  dbClient: DatabaseClient = db,
) {
  const existingRecipe = getRecipeById(id, dbClient);

  if (!existingRecipe) {
    return null;
  }

  dbClient
    .update(recipes)
    .set({
      notes,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(recipes.id, id))
    .run();

  return getRecipeById(id, dbClient);
}

export function toggleRecipeFavorite(id: string, dbClient: DatabaseClient = db) {
  const existingRecipe = getRecipeById(id, dbClient);

  if (!existingRecipe) {
    return null;
  }

  dbClient
    .update(recipes)
    .set({
      favorite: !existingRecipe.favorite,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(recipes.id, id))
    .run();

  return getRecipeById(id, dbClient);
}

export function toggleRecipePlannedThisWeek(
  id: string,
  dbClient: DatabaseClient = db,
) {
  const existingRecipe = getRecipeById(id, dbClient);

  if (!existingRecipe) {
    return null;
  }

  dbClient
    .update(recipes)
    .set({
      plannedThisWeek: !existingRecipe.plannedThisWeek,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(recipes.id, id))
    .run();

  return getRecipeById(id, dbClient);
}
