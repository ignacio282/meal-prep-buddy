import { z } from "zod";

import {
  activityPerWeekValues,
  heightUnitValues,
  mealsPerDayValues,
  sexValues,
  weekdayValues,
  weightUnitValues,
} from "./constants";

const emptyToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

const trimmedOptionalString = z.preprocess(
  emptyToUndefined,
  z.string().trim().min(1).max(300).optional(),
);

const likedFoodTagsSchema = z
  .array(z.string().trim().min(1).max(40))
  .max(12)
  .default([]);

const cookDaysSchema = z
  .array(z.enum(weekdayValues))
  .min(1, "Select at least one cooking day.")
  .max(7);

export const onboardingProfileSchema = z
  .object({
    age: z.coerce.number().int().min(13).max(100),
    sex: z.enum(sexValues),
    heightUnit: z.enum(heightUnitValues),
    heightFeet: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int().min(3).max(8).optional(),
    ),
    heightInches: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int().min(0).max(11).optional(),
    ),
    heightCentimeters: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int().min(120).max(250).optional(),
    ),
    initialWeight: z.coerce.number().min(70).max(700),
    weightUnit: z.enum(weightUnitValues),
    activityPerWeek: z.enum(activityPerWeekValues),
  })
  .superRefine((value, ctx) => {
    if (value.heightUnit === "imperial") {
      if (value.heightFeet === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Feet is required.",
          path: ["heightFeet"],
        });
      }

      if (value.heightInches === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Inches is required.",
          path: ["heightInches"],
        });
      }
    }

    if (
      value.heightUnit === "metric" &&
      value.heightCentimeters === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Height in centimeters is required.",
        path: ["heightCentimeters"],
      });
    }
  });

export const onboardingNutritionSchema = z.object({
  calorieTarget: z.coerce.number().int().min(1000).max(5000),
  mealsPerDay: z.enum(mealsPerDayValues),
});

export const onboardingMealPrepSchema = z.object({
  likedFoodTags: likedFoodTagsSchema,
  likedFoodNotes: trimmedOptionalString,
  dislikedFoods: trimmedOptionalString,
  dietaryRestrictions: trimmedOptionalString,
  cookDays: cookDaysSchema,
});

export const onboardingPreferencesSchema = onboardingProfileSchema
  .merge(onboardingNutritionSchema)
  .merge(onboardingMealPrepSchema);

export type OnboardingProfileInput = z.infer<typeof onboardingProfileSchema>;
export type OnboardingNutritionInput = z.infer<
  typeof onboardingNutritionSchema
>;
export type OnboardingMealPrepInput = z.infer<typeof onboardingMealPrepSchema>;
export type OnboardingPreferencesInput = z.infer<
  typeof onboardingPreferencesSchema
>;
