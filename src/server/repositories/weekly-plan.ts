import { eq, gte } from "drizzle-orm";

import type { DatabaseClient } from "@/server/db/client";
import { db } from "@/server/db/client";
import { weeklyPlanSettings, weeklyPlanSlots } from "@/server/db/schema";
import { getRecipeById } from "@/server/repositories/recipes";

export type WeeklyPlanMealCount = 1 | 2 | 3;

export type WeeklyPlanSlot = {
  recipeId: string | null;
  slotIndex: number;
  updatedAt: string;
};

export type WeeklyPlan = {
  mealCount: WeeklyPlanMealCount;
  slots: WeeklyPlanSlot[];
  updatedAt: string;
};

const CURRENT_WEEKLY_PLAN_ID = "current";
const ALL_SLOT_INDEXES = [0, 1, 2] as const;

function normalizeMealCount(value: number): WeeklyPlanMealCount {
  if (value <= 1) {
    return 1;
  }

  if (value >= 3) {
    return 3;
  }

  return 2;
}

function ensureWeeklyPlan(dbClient: DatabaseClient) {
  const settings = dbClient
    .select()
    .from(weeklyPlanSettings)
    .where(eq(weeklyPlanSettings.id, CURRENT_WEEKLY_PLAN_ID))
    .get();

  const timestamp = new Date().toISOString();

  if (!settings) {
    dbClient
      .insert(weeklyPlanSettings)
      .values({
        id: CURRENT_WEEKLY_PLAN_ID,
        mealCount: 1,
        updatedAt: timestamp,
      })
      .run();
  }

  const existingSlots = dbClient.select().from(weeklyPlanSlots).all();
  const existingIndexes = new Set(existingSlots.map((slot) => slot.slotIndex));

  ALL_SLOT_INDEXES.forEach((slotIndex) => {
    if (!existingIndexes.has(slotIndex)) {
      dbClient
        .insert(weeklyPlanSlots)
        .values({
          slotIndex,
          recipeId: null,
          updatedAt: timestamp,
        })
        .run();
    }
  });
}

export function getWeeklyPlan(dbClient: DatabaseClient = db): WeeklyPlan {
  ensureWeeklyPlan(dbClient);

  const settings = dbClient
    .select()
    .from(weeklyPlanSettings)
    .where(eq(weeklyPlanSettings.id, CURRENT_WEEKLY_PLAN_ID))
    .get();
  const slots = dbClient
    .select()
    .from(weeklyPlanSlots)
    .orderBy(weeklyPlanSlots.slotIndex)
    .all();

  return {
    mealCount: normalizeMealCount(settings?.mealCount ?? 1),
    slots: slots.map((slot) => ({
      slotIndex: slot.slotIndex,
      recipeId: slot.recipeId,
      updatedAt: slot.updatedAt,
    })),
    updatedAt: settings?.updatedAt ?? new Date().toISOString(),
  };
}

export function setWeeklyPlanMealCount(
  nextMealCount: number,
  dbClient: DatabaseClient = db,
) {
  ensureWeeklyPlan(dbClient);

  const mealCount = normalizeMealCount(nextMealCount);
  const timestamp = new Date().toISOString();

  dbClient
    .update(weeklyPlanSettings)
    .set({
      mealCount,
      updatedAt: timestamp,
    })
    .where(eq(weeklyPlanSettings.id, CURRENT_WEEKLY_PLAN_ID))
    .run();

  dbClient
    .update(weeklyPlanSlots)
    .set({
      recipeId: null,
      updatedAt: timestamp,
    })
    .where(gte(weeklyPlanSlots.slotIndex, mealCount))
    .run();

  return getWeeklyPlan(dbClient);
}

export function assignWeeklyPlanSlot(
  slotIndex: number,
  recipeId: string | null,
  dbClient: DatabaseClient = db,
) {
  ensureWeeklyPlan(dbClient);

  if (!ALL_SLOT_INDEXES.includes(slotIndex as (typeof ALL_SLOT_INDEXES)[number])) {
    return getWeeklyPlan(dbClient);
  }

  if (recipeId && !getRecipeById(recipeId, dbClient)) {
    return getWeeklyPlan(dbClient);
  }

  dbClient
    .update(weeklyPlanSlots)
    .set({
      recipeId,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(weeklyPlanSlots.slotIndex, slotIndex))
    .run();

  return getWeeklyPlan(dbClient);
}

export function clearRecipeFromWeeklyPlan(
  recipeId: string,
  dbClient: DatabaseClient = db,
) {
  ensureWeeklyPlan(dbClient);

  dbClient
    .update(weeklyPlanSlots)
    .set({
      recipeId: null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(weeklyPlanSlots.recipeId, recipeId))
    .run();

  return getWeeklyPlan(dbClient);
}

export function toggleRecipeInWeeklyPlan(
  recipeId: string,
  dbClient: DatabaseClient = db,
) {
  const plan = getWeeklyPlan(dbClient);
  const existingSlot = plan.slots.find((slot) => slot.recipeId === recipeId);

  if (existingSlot) {
    return clearRecipeFromWeeklyPlan(recipeId, dbClient);
  }

  const openSlot = plan.slots
    .filter((slot) => slot.slotIndex < plan.mealCount)
    .find((slot) => !slot.recipeId);

  if (!openSlot) {
    return plan;
  }

  return assignWeeklyPlanSlot(openSlot.slotIndex, recipeId, dbClient);
}
