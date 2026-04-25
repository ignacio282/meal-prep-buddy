import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns a healthy application payload", async () => {
    const response = GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      name: "Meal Prep Buddy",
      status: "ok",
    });
    expect(payload.timestamp).toEqual(expect.any(String));
  });
});
