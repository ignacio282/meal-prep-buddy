// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";

import AppDesignSystemPage from "@/app/app/design-system/page";

describe("AppDesignSystemPage", () => {
  it("renders the temporary product showcase route", () => {
    render(<AppDesignSystemPage />);

    expect(
      screen.getByRole("heading", {
        name: "Meal Prep Buddy /app/design-system",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Buttons" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Form inputs" }),
    ).toBeInTheDocument();
  });
});
