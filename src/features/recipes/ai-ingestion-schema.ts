import { z } from "zod";

export const aiRecipeParseRequestSchema = z.object({
  answers: z.string().trim().max(2000).optional(),
  recipeText: z.string().trim().min(30).max(12000),
});

const nullableString = z.string().trim().min(1).nullable();
const nullablePositiveInteger = z.number().int().min(1).nullable();

export const aiRecipeDraftSchema = z.object({
  caloriesPerServing: nullablePositiveInteger,
  carbGrams: nullablePositiveInteger,
  cuisine: nullableString,
  fatGrams: nullablePositiveInteger,
  ingredients: z.array(z.string().trim().min(1).max(200)).max(40),
  notes: z.string().trim().max(1200).nullable(),
  prepMinutes: nullablePositiveInteger,
  primaryProtein: nullableString,
  proteinGrams: nullablePositiveInteger,
  servings: nullablePositiveInteger,
  sourceUrl: nullableString,
  steps: z.array(z.string().trim().min(1).max(400)).max(20),
  tags: z.array(z.string().trim().min(1).max(30)).max(8),
  title: nullableString,
  totalCalories: nullablePositiveInteger,
});

export const aiRecipeParseResponseSchema = z.object({
  confidenceNotes: z.array(z.string().trim().min(1).max(180)).max(6),
  draft: aiRecipeDraftSchema,
  questions: z.array(z.string().trim().min(1).max(180)).max(6),
});

export type AiRecipeDraft = z.infer<typeof aiRecipeDraftSchema>;
export type AiRecipeParseResponse = z.infer<
  typeof aiRecipeParseResponseSchema
>;
