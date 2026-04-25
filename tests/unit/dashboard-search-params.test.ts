import {
  parseDashboardSearchParams,
  serializeDashboardSearchParams,
} from "@/features/dashboard/search-params";

describe("dashboard search params", () => {
  it("defaults to the library view", () => {
    expect(parseDashboardSearchParams(undefined).view).toBe("library");
  });

  it("round-trips the active dashboard view", () => {
    const parsed = parseDashboardSearchParams({
      view: "weekly-plan",
      search: "chicken",
      libraryCarbs: "balanced",
      suggestionCuisine: "Mediterranean",
    });

    expect(parsed.view).toBe("weekly-plan");
    expect(parsed.libraryCarbs).toBe("balanced");
    expect(parsed.suggestionCuisine).toBe("Mediterranean");
    expect(serializeDashboardSearchParams(parsed).view).toBe("weekly-plan");
    expect(serializeDashboardSearchParams(parsed).suggestionCuisine).toBe(
      "Mediterranean",
    );
  });
});
