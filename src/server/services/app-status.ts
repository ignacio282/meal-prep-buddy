import { APP_NAME } from "@/lib/constants";

export function getAppStatus() {
  return {
    name: APP_NAME,
    status: "ok" as const,
  };
}
