export const onboardingRecordId = "single-user";

export const sexValues = ["female", "male", "prefer_not_to_say"] as const;
export const activityPerWeekValues = ["0", "1-2", "3-4", "5+"] as const;
export const mealsPerDayValues = ["2", "3", "4", "5+"] as const;
export const heightUnitValues = ["imperial", "metric"] as const;
export const weightUnitValues = ["lb", "kg"] as const;
export const weekdayValues = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const sexOptions = [
  { label: "Female", value: "female" },
  { label: "Male", value: "male" },
  { label: "Prefer not to say", value: "prefer_not_to_say" },
] as const;

export const activityPerWeekOptions = [
  { label: "0 workouts", value: "0" },
  { label: "1-2 workouts", value: "1-2" },
  { label: "3-4 workouts", value: "3-4" },
  { label: "5+ workouts", value: "5+" },
] as const;

export const mealsPerDayOptions = [
  { label: "2 meals", value: "2" },
  { label: "3 meals", value: "3" },
  { label: "4 meals", value: "4" },
  { label: "5+ meals", value: "5+" },
] as const;

export const weekdayOptions = [
  { label: "Mon", value: "monday" },
  { label: "Tue", value: "tuesday" },
  { label: "Wed", value: "wednesday" },
  { label: "Thu", value: "thursday" },
  { label: "Fri", value: "friday" },
  { label: "Sat", value: "saturday" },
  { label: "Sun", value: "sunday" },
] as const;

export const foodPreferenceSuggestions = [
  "Chicken",
  "Rice bowls",
  "Pasta",
  "Tacos",
  "Salmon",
  "Stir fry",
] as const;
