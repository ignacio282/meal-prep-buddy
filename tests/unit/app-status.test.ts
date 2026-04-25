import { getAppStatus } from "@/server/services/app-status";

describe("getAppStatus", () => {
  it("returns the scaffold service status", () => {
    expect(getAppStatus()).toEqual({
      name: "Meal Prep Buddy",
      status: "ok",
    });
  });
});
