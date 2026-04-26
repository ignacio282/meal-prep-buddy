import { eq } from "drizzle-orm";

import { onboardingRecordId } from "@/features/onboarding/constants";
import type { OnboardingPreferencesInput } from "@/features/onboarding/schema";
import { db } from "@/server/db";
import type { DatabaseClient } from "@/server/db/client";
import { userPreferences } from "@/server/db/schema";
import { parseStringArrayField } from "@/server/repositories/json-fields";

type UserPreferencesRow = typeof userPreferences.$inferSelect;

export type UserPreferences = Omit<
  UserPreferencesRow,
  "likedFoodTags" | "cookDays"
> & {
  likedFoodTags: string[];
  cookDays: string[];
};

function mapRowToPreferences(row: UserPreferencesRow): UserPreferences {
  return {
    ...row,
    likedFoodTags: parseStringArrayField(row.likedFoodTags),
    cookDays: parseStringArrayField(row.cookDays),
  };
}

export function getUserPreferences(dbClient: DatabaseClient = db) {
  const row = dbClient
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.id, onboardingRecordId))
    .get();

  return row ? mapRowToPreferences(row) : null;
}

export function upsertUserPreferences(
  input: OnboardingPreferencesInput,
  dbClient: DatabaseClient = db,
) {
  const timestamp = new Date().toISOString();

  dbClient
    .insert(userPreferences)
    .values({
      id: onboardingRecordId,
      age: input.age,
      sex: input.sex,
      heightUnit: input.heightUnit,
      heightFeet: input.heightFeet ?? null,
      heightInches: input.heightInches ?? null,
      heightCentimeters: input.heightCentimeters ?? null,
      initialWeight: input.initialWeight,
      weightUnit: input.weightUnit,
      activityPerWeek: input.activityPerWeek,
      calorieTarget: input.calorieTarget,
      mealsPerDay: input.mealsPerDay,
      likedFoodTags: JSON.stringify(input.likedFoodTags),
      likedFoodNotes: input.likedFoodNotes ?? null,
      dislikedFoods: input.dislikedFoods ?? null,
      dietaryRestrictions: input.dietaryRestrictions ?? null,
      cookDays: JSON.stringify(input.cookDays),
      onboardingCompletedAt: timestamp,
      updatedAt: timestamp,
    })
    .onConflictDoUpdate({
      target: userPreferences.id,
      set: {
        age: input.age,
        sex: input.sex,
        heightUnit: input.heightUnit,
        heightFeet: input.heightFeet ?? null,
        heightInches: input.heightInches ?? null,
        heightCentimeters: input.heightCentimeters ?? null,
        initialWeight: input.initialWeight,
        weightUnit: input.weightUnit,
        activityPerWeek: input.activityPerWeek,
        calorieTarget: input.calorieTarget,
        mealsPerDay: input.mealsPerDay,
        likedFoodTags: JSON.stringify(input.likedFoodTags),
        likedFoodNotes: input.likedFoodNotes ?? null,
        dislikedFoods: input.dislikedFoods ?? null,
        dietaryRestrictions: input.dietaryRestrictions ?? null,
        cookDays: JSON.stringify(input.cookDays),
        onboardingCompletedAt: timestamp,
        updatedAt: timestamp,
      },
    })
    .run();

  return getUserPreferences(dbClient);
}
