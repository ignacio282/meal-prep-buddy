import {
  buildDashboardState,
  type DashboardState,
} from "@/features/dashboard/model";
import type { DashboardSearchFilters } from "@/features/dashboard/search-params";
import { listRecipes } from "@/server/repositories/recipes";
import { getWeeklyPlan } from "@/server/repositories/weekly-plan";
import type { UserPreferences } from "@/server/repositories/user-preferences";

export function getDashboardState(
  preferences: UserPreferences,
  filters: DashboardSearchFilters,
): DashboardState {
  return buildDashboardState(
    listRecipes(),
    preferences,
    filters,
    getWeeklyPlan(),
  );
}
