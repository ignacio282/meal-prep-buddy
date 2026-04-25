import { redirect } from "next/navigation";

import { OnboardingPage } from "@/features/onboarding/onboarding-page";
import { getOnboardingRedirectTarget } from "@/features/onboarding/route-state";
import { getOnboardingPreferences } from "@/server/services/onboarding";

export const dynamic = "force-dynamic";

export default function AppOnboardingPage() {
  const preferences = getOnboardingPreferences();
  const redirectTarget = getOnboardingRedirectTarget(preferences);

  if (redirectTarget) {
    redirect(redirectTarget);
  }

  return <OnboardingPage />;
}
