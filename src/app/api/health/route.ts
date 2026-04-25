import { NextResponse } from "next/server";

import { getAppStatus } from "@/server/services/app-status";

export function GET() {
  const status = getAppStatus();

  return NextResponse.json({
    ...status,
    timestamp: new Date().toISOString(),
  });
}
