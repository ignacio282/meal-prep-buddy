import { NextResponse } from "next/server";

import { onboardingPreferencesSchema } from "@/features/onboarding/schema";
import { saveOnboardingPreferences } from "@/server/services/onboarding";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsedPayload = onboardingPreferencesSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return NextResponse.json(
      {
        errors: parsedPayload.error.flatten(),
      },
      { status: 400 },
    );
  }

  const preferences = saveOnboardingPreferences(parsedPayload.data);

  return NextResponse.json({
    preferences,
    success: true,
  });
}
