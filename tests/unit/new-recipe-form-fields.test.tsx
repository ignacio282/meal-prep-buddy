// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";

import { NewRecipeFormFields } from "@/features/recipes/new-recipe-form-fields";

const proteinOptions = [
  { label: "Chicken", value: "Chicken" },
  { label: "Tofu", value: "Tofu" },
];

const cuisineOptions = [
  { label: "American", value: "American" },
  { label: "Mediterranean", value: "Mediterranean" },
];

describe("NewRecipeFormFields", () => {
  it("filters existing tag suggestions and adds a selected tag", () => {
    const { container } = render(
      <NewRecipeFormFields
        cuisineOptions={cuisineOptions}
        existingIngredients={["Chicken breast", "Cooked rice"]}
        existingTags={["High protein", "Meal prep"]}
        proteinOptions={proteinOptions}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Search or add a tag"), {
      target: { value: "high" },
    });

    expect(
      screen.getByRole("button", { name: "High protein" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Meal prep" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "High protein" }));

    expect(
      screen.getByRole("button", { name: "Remove tag High protein" }),
    ).toBeInTheDocument();

    const hiddenTags = container.querySelectorAll(
      'input[type="hidden"][name="tags"]',
    );

    expect(hiddenTags).toHaveLength(1);
    expect(hiddenTags[0]).toHaveValue("High protein");
  });

  it("shows an add action for a new tag when no suggestion matches", () => {
    render(
      <NewRecipeFormFields
        cuisineOptions={cuisineOptions}
        existingIngredients={["Chicken breast", "Cooked rice"]}
        existingTags={["High protein", "Meal prep"]}
        proteinOptions={proteinOptions}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Search or add a tag"), {
      target: { value: "Freezer friendly" },
    });

    expect(
      screen.getByRole("button", { name: "Add new tag" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add new tag" }));

    expect(
      screen.getByRole("button", { name: "Remove tag Freezer friendly" }),
    ).toBeInTheDocument();
  });

  it("filters ingredients and shows an add action for a new ingredient", () => {
    render(
      <NewRecipeFormFields
        cuisineOptions={cuisineOptions}
        existingIngredients={[
          "Chicken breast",
          "Cooked rice",
          "Broccoli florets",
        ]}
        existingTags={["High protein"]}
        proteinOptions={proteinOptions}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText("Search or add an ingredient"),
      {
        target: { value: "rice" },
      },
    );

    expect(
      screen.getByRole("button", { name: "Cooked rice" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Chicken breast" }),
    ).not.toBeInTheDocument();

    fireEvent.change(
      screen.getByPlaceholderText("Search or add an ingredient"),
      {
        target: { value: "Greek yogurt" },
      },
    );

    expect(
      screen.getByRole("button", { name: "Add new ingredient" }),
    ).toBeInTheDocument();
  });

  it("adds ingredients and steps, removes them, and keeps hidden inputs in sync", () => {
    const { container } = render(
      <NewRecipeFormFields
        cuisineOptions={cuisineOptions}
        existingIngredients={["Chicken breast", "Cooked rice"]}
        existingTags={["High protein"]}
        proteinOptions={proteinOptions}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText("Search or add an ingredient"),
      {
        target: { value: "Cooked rice" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Cooked rice" }));

    fireEvent.change(
      screen.getByPlaceholderText("Season and sear the chicken."),
      {
        target: { value: "Season and sear the chicken." },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Add step" }));

    expect(
      screen.getByRole("button", { name: "Remove ingredient Cooked rice" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Season and sear the chicken."),
    ).toBeInTheDocument();

    let ingredientInputs = container.querySelectorAll(
      'input[type="hidden"][name="ingredients"]',
    );
    let stepInputs = container.querySelectorAll(
      'input[type="hidden"][name="steps"]',
    );

    expect(ingredientInputs).toHaveLength(1);
    expect(ingredientInputs[0]).toHaveValue("Cooked rice");
    expect(stepInputs).toHaveLength(1);
    expect(stepInputs[0]).toHaveValue("Season and sear the chicken.");

    fireEvent.click(
      screen.getByRole("button", { name: "Remove ingredient Cooked rice" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove step 1" }));

    ingredientInputs = container.querySelectorAll(
      'input[type="hidden"][name="ingredients"]',
    );
    stepInputs = container.querySelectorAll(
      'input[type="hidden"][name="steps"]',
    );

    expect(
      screen.queryByText("Season and sear the chicken."),
    ).not.toBeInTheDocument();
    expect(ingredientInputs).toHaveLength(0);
    expect(stepInputs).toHaveLength(0);
  });
});
