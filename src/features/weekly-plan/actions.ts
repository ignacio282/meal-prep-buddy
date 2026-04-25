"use server";

import { revalidatePath } from "next/cache";

import {
  assignWeeklyPlanSlot,
  setWeeklyPlanMealCount,
  type WeeklyPlanMealCount,
} from "@/server/repositories/weekly-plan";

export type WeeklyPlanActionState = {
  mealCount: WeeklyPlanMealCount;
  slots: Array<{
    recipeId: string | null;
    slotIndex: number;
  }>;
};

function toActionState(mealCount: number, slots: Array<{ recipeId: string | null; slotIndex: number }>): WeeklyPlanActionState {
  const normalizedMealCount =
    mealCount <= 1 ? 1 : mealCount >= 3 ? 3 : 2;

  return {
    mealCount: normalizedMealCount,
    slots: slots.map((slot) => ({
      slotIndex: slot.slotIndex,
      recipeId: slot.recipeId,
    })),
  };
}

function revalidateWeeklyPlanPaths() {
  revalidatePath("/app");
  revalidatePath("/app/dashboard-preview");
}

export async function setWeeklyPlanMealCountAction(nextMealCount: number) {
  const plan = setWeeklyPlanMealCount(nextMealCount);

  revalidateWeeklyPlanPaths();

  return toActionState(plan.mealCount, plan.slots);
}

export async function assignWeeklyPlanSlotAction(
  slotIndex: number,
  recipeId: string | null,
) {
  const plan = assignWeeklyPlanSlot(slotIndex, recipeId);

  revalidateWeeklyPlanPaths();

  return toActionState(plan.mealCount, plan.slots);
}
