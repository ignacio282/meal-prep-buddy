import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Internal table used to validate the migration workflow before product data exists.
export const scaffoldMetadata = sqliteTable("scaffold_metadata", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const userPreferences = sqliteTable("user_preferences", {
  id: text("id").primaryKey(),
  age: integer("age").notNull(),
  sex: text("sex").notNull(),
  heightUnit: text("height_unit").notNull(),
  heightFeet: integer("height_feet"),
  heightInches: integer("height_inches"),
  heightCentimeters: integer("height_centimeters"),
  initialWeight: real("initial_weight").notNull(),
  weightUnit: text("weight_unit").notNull(),
  activityPerWeek: text("activity_per_week").notNull(),
  calorieTarget: integer("calorie_target").notNull(),
  mealsPerDay: text("meals_per_day").notNull(),
  likedFoodTags: text("liked_food_tags").notNull(),
  likedFoodNotes: text("liked_food_notes"),
  dislikedFoods: text("disliked_foods"),
  dietaryRestrictions: text("dietary_restrictions"),
  cookDays: text("cook_days").notNull(),
  onboardingCompletedAt: text("onboarding_completed_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const recipes = sqliteTable("recipes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  sourceUrl: text("source_url"),
  sourceLabel: text("source_label"),
  primaryProtein: text("primary_protein").notNull(),
  cuisine: text("cuisine").notNull(),
  totalCalories: integer("total_calories").notNull(),
  caloriesPerServing: integer("calories_per_serving").notNull(),
  proteinGrams: integer("protein_grams").notNull(),
  carbGrams: integer("carb_grams").notNull(),
  fatGrams: integer("fat_grams").notNull(),
  servings: integer("servings").notNull(),
  prepMinutes: integer("prep_minutes").notNull(),
  tags: text("tags").notNull(),
  ingredients: text("ingredients").notNull(),
  steps: text("steps").notNull(),
  notes: text("notes"),
  favorite: integer("favorite", { mode: "boolean" }).notNull().default(false),
  plannedThisWeek: integer("planned_this_week", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const weeklyPlanSettings = sqliteTable("weekly_plan_settings", {
  id: text("id").primaryKey(),
  mealCount: integer("meal_count").notNull().default(1),
  updatedAt: text("updated_at").notNull(),
});

export const weeklyPlanSlots = sqliteTable("weekly_plan_slots", {
  slotIndex: integer("slot_index").primaryKey(),
  recipeId: text("recipe_id"),
  updatedAt: text("updated_at").notNull(),
});
