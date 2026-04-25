import { getAppRedirectTarget, getOnboardingRedirectTarget } from "@/features/onboarding/route-state";
import type { UserPreferences } from "@/server/repositories/user-preferences";

const preferencesFixture: UserPreferences = {
  id: "single-user",
  age: 29,
  sex: "female",
  heightUnit: "imperial",
  heightFeet: 5,
  heightInches: 8,
  heightCentimeters: null,
  initialWeight: 165,
  weightUnit: "lb",
  activityPerWeek: "3-4",
  calorieTarget: 2100,
  mealsPerDay: "3",
  likedFoodTags: ["Chicken", "Rice bowls"],
  likedFoodNotes: "High-protein lunches",
  dislikedFoods: "Olives",
  dietaryRestrictions: "None",
  cookDays: ["sunday", "wednesday"],
  onboardingCompletedAt: "2026-04-20T10:00:00.000Z",
  updatedAt: "2026-04-20T10:00:00.000Z",
};

describe("onboarding route state", () => {
  it("sends /app visitors to onboarding when no preferences exist", () => {
    expect(getAppRedirectTarget(null)).toBe("/app/onboarding");
  });

  it("keeps /app available when onboarding is complete", () => {
    expect(getAppRedirectTarget(preferencesFixture)).toBeNull();
  });

  it("sends onboarding visitors back to /app when preferences already exist", () => {
    expect(getOnboardingRedirectTarget(preferencesFixture)).toBe("/app");
  });

  it("keeps onboarding available when no preferences exist yet", () => {
    expect(getOnboardingRedirectTarget(null)).toBeNull();
  });
});
