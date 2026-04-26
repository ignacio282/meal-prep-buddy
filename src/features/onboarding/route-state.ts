import type { UserPreferences } from "@/server/repositories/user-preferences";

export function getAppRedirectTarget(preferences: UserPreferences | null) {
  return preferences ? null : "/app/onboarding";
}

export function getOnboardingRedirectTarget(
  preferences: UserPreferences | null,
) {
  return preferences ? "/app" : null;
}
