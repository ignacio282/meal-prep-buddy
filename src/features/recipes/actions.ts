"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createRecipeSchema } from "@/features/recipes/schema";
import {
  createRecipe,
  toggleRecipeFavorite,
  updateRecipe,
  updateRecipeNotes,
} from "@/server/repositories/recipes";
import { toggleRecipeInWeeklyPlan } from "@/server/repositories/weekly-plan";

function getRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getStringValues(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function revalidateRecipePaths(recipeId?: string) {
  revalidatePath("/app");
  revalidatePath("/app/recipes/new");

  if (recipeId) {
    revalidatePath(`/app/recipes/${recipeId}`);
  }
}

function parseRecipeFormData(formData: FormData) {
  return createRecipeSchema.parse({
    title: getRequiredString(formData, "title"),
    sourceUrl: getRequiredString(formData, "sourceUrl"),
    sourceLabel: getRequiredString(formData, "sourceLabel"),
    primaryProtein: getRequiredString(formData, "primaryProtein"),
    cuisine: getRequiredString(formData, "cuisine"),
    totalCalories: getRequiredString(formData, "totalCalories"),
    caloriesPerServing: getRequiredString(formData, "caloriesPerServing"),
    proteinGrams: getRequiredString(formData, "proteinGrams"),
    carbGrams: getRequiredString(formData, "carbGrams"),
    fatGrams: getRequiredString(formData, "fatGrams"),
    servings: getRequiredString(formData, "servings"),
    prepMinutes: getRequiredString(formData, "prepMinutes"),
    tags: getStringValues(formData, "tags"),
    ingredients: getStringValues(formData, "ingredients"),
    steps: getStringValues(formData, "steps"),
    notes: getRequiredString(formData, "notes"),
  });
}

export async function createRecipeAction(formData: FormData) {
  const parsedInput = parseRecipeFormData(formData);
  const recipe = createRecipe(parsedInput);

  revalidateRecipePaths(recipe.id);
  redirect(`/app/recipes/${recipe.id}?created=1`);
}

export async function updateRecipeAction(formData: FormData) {
  const recipeId = getRequiredString(formData, "recipeId");
  const parsedInput = parseRecipeFormData(formData);
  const recipe = updateRecipe(recipeId, parsedInput);

  revalidateRecipePaths(recipeId);
  redirect(`/app/recipes/${recipe?.id ?? recipeId}?updated=1`);
}

export async function updateRecipeNotesAction(formData: FormData) {
  const recipeId = getRequiredString(formData, "recipeId");
  const returnTo =
    getRequiredString(formData, "returnTo") || `/app/recipes/${recipeId}`;
  const rawNotes = getRequiredString(formData, "notes").trim();
  const notes = rawNotes.length > 0 ? rawNotes : null;

  updateRecipeNotes(recipeId, notes);
  revalidateRecipePaths(recipeId);
  redirect(returnTo);
}

export async function toggleRecipeFavoriteAction(formData: FormData) {
  const recipeId = getRequiredString(formData, "recipeId");
  const returnTo = getRequiredString(formData, "returnTo") || "/app";

  toggleRecipeFavorite(recipeId);
  revalidateRecipePaths(recipeId);
  redirect(returnTo);
}

export async function toggleRecipePlannedAction(formData: FormData) {
  const recipeId = getRequiredString(formData, "recipeId");
  const returnTo = getRequiredString(formData, "returnTo") || "/app";

  toggleRecipeInWeeklyPlan(recipeId);
  revalidateRecipePaths(recipeId);
  redirect(returnTo);
}
