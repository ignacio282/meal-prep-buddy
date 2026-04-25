import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

const positiveInteger = z.coerce.number().int().min(1);

export const createRecipeSchema = z.object({
  title: z.string().trim().min(1).max(120),
  sourceUrl: z.preprocess(
    emptyToUndefined,
    z.string().trim().url().max(400).optional(),
  ),
  sourceLabel: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(1).max(80).optional(),
  ),
  primaryProtein: z.string().trim().min(1).max(40),
  cuisine: z.string().trim().min(1).max(40),
  totalCalories: positiveInteger.max(4000),
  caloriesPerServing: positiveInteger.max(2000),
  proteinGrams: positiveInteger.max(250),
  carbGrams: positiveInteger.max(300),
  fatGrams: positiveInteger.max(200),
  servings: positiveInteger.max(20),
  prepMinutes: positiveInteger.max(480),
  tags: z.array(z.string().trim().min(1).max(30)).max(8),
  ingredients: z.array(z.string().trim().min(1).max(200)).min(1).max(40),
  steps: z.array(z.string().trim().min(1).max(400)).min(1).max(20),
  notes: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(1200).optional(),
  ),
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = CreateRecipeInput;
