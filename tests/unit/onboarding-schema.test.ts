import {
  onboardingMealPrepSchema,
  onboardingPreferencesSchema,
  onboardingProfileSchema,
} from "@/features/onboarding/schema";

describe("onboarding schema", () => {
  it("accepts a valid imperial onboarding payload", () => {
    const parsed = onboardingPreferencesSchema.safeParse({
      age: "28",
      sex: "female",
      heightUnit: "imperial",
      heightFeet: "5",
      heightInches: "9",
      heightCentimeters: "",
      initialWeight: "175",
      weightUnit: "lb",
      activityPerWeek: "3-4",
      calorieTarget: "2150",
      mealsPerDay: "3",
      likedFoodTags: ["Chicken", "Rice bowls"],
      likedFoodNotes: "High-protein lunches",
      dislikedFoods: "Olives",
      dietaryRestrictions: "",
      cookDays: ["sunday", "wednesday"],
    });

    expect(parsed.success).toBe(true);

    if (parsed.success) {
      expect(parsed.data.age).toBe(28);
      expect(parsed.data.calorieTarget).toBe(2150);
      expect(parsed.data.cookDays).toEqual(["sunday", "wednesday"]);
    }
  });

  it("requires imperial height fields when height unit is imperial", () => {
    const parsed = onboardingProfileSchema.safeParse({
      age: "28",
      sex: "female",
      heightUnit: "imperial",
      heightFeet: "",
      heightInches: "",
      heightCentimeters: "",
      initialWeight: "175",
      weightUnit: "lb",
      activityPerWeek: "1-2",
    });

    expect(parsed.success).toBe(false);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      expect(fieldErrors.heightFeet?.[0]).toBe("Feet is required.");
      expect(fieldErrors.heightInches?.[0]).toBe("Inches is required.");
    }
  });

  it("requires at least one cooking day", () => {
    const parsed = onboardingMealPrepSchema.safeParse({
      likedFoodTags: [],
      likedFoodNotes: "",
      dislikedFoods: "",
      dietaryRestrictions: "",
      cookDays: [],
    });

    expect(parsed.success).toBe(false);

    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.cookDays?.[0]).toBe(
        "Select at least one cooking day.",
      );
    }
  });
});
