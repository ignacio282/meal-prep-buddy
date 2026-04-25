import { onboardingPreferencesSchema } from "@/features/onboarding/schema";
import {
  getUserPreferences,
  upsertUserPreferences,
  type UserPreferences,
} from "@/server/repositories/user-preferences";

export function getOnboardingPreferences() {
  return getUserPreferences();
}

export function hasCompletedOnboarding() {
  return Boolean(getUserPreferences());
}

export function saveOnboardingPreferences(input: unknown): UserPreferences {
  const parsedInput = onboardingPreferencesSchema.parse(input);
  const savedPreferences = upsertUserPreferences(parsedInput);

  if (!savedPreferences) {
    throw new Error("Expected preferences to exist after saving onboarding.");
  }

  return savedPreferences;
}
