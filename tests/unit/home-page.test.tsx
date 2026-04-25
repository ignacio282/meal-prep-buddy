// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";

import HomePage from "@/app/page";

describe("HomePage", () => {
  it("renders the landing page hero and links the main CTA to the product preview", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: "Meal prepping is simple" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /open product preview/i }),
    ).toHaveAttribute("href", "/app");
  });
});
