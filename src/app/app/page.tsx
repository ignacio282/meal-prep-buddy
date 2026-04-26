import { redirect } from "next/navigation";

import { DashboardHomePage } from "@/features/dashboard/dashboard-home-page";
import {
  parseDashboardSearchParams,
  serializeDashboardSearchParams,
} from "@/features/dashboard/search-params";
import { getAppRedirectTarget } from "@/features/onboarding/route-state";
import { getOnboardingPreferences } from "@/server/services/onboarding";
import { getDashboardState } from "@/server/services/dashboard";

export const dynamic = "force-dynamic";

type AppEntryPageProps = Readonly<{
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}>;

export default async function AppEntryPage({
  searchParams,
}: AppEntryPageProps) {
  const preferences = getOnboardingPreferences();
  const redirectTarget = getAppRedirectTarget(preferences);

  if (redirectTarget) {
    redirect(redirectTarget);
  }

  if (!preferences) {
    return null;
  }

  const filters = parseDashboardSearchParams(await searchParams);
  const dashboardState = getDashboardState(preferences, filters);
  const returnToParams = new URLSearchParams();

  Object.entries(serializeDashboardSearchParams(filters)).forEach(
    ([key, value]) => {
      if (value) {
        returnToParams.set(key, value);
      }
    },
  );

  const returnTo = returnToParams.toString()
    ? `/app?${returnToParams.toString()}`
    : "/app";

  return (
    <DashboardHomePage
      dashboardState={dashboardState}
      filters={filters}
      returnTo={returnTo}
    />
  );
}
