import { DashboardHomePage } from "@/features/dashboard/dashboard-home-page";
import { getVeteranPreviewDashboardState } from "@/features/dashboard/mock-data";
import {
  parseDashboardSearchParams,
  serializeDashboardSearchParams,
} from "@/features/dashboard/search-params";

export const dynamic = "force-dynamic";

type DashboardPreviewPageProps = Readonly<{
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}>;

export default async function DashboardPreviewPage({
  searchParams,
}: DashboardPreviewPageProps) {
  const filters = parseDashboardSearchParams(await searchParams);
  const previewFilters = {
    ...filters,
    suggestionProtein: filters.suggestionProtein || "Chicken",
  };
  const returnToParams = new URLSearchParams();

  Object.entries(serializeDashboardSearchParams(previewFilters)).forEach(
    ([key, value]) => {
      if (value) {
        returnToParams.set(key, value);
      }
    },
  );

  const returnTo = returnToParams.toString()
    ? `/app/dashboard-preview?${returnToParams.toString()}`
    : "/app/dashboard-preview";
  const buildPreviewRecipeHref = (recipeId: string) => {
    const recipeParams = new URLSearchParams(returnToParams);

    recipeParams.set("preview", "veteran");

    return `/app/recipes/${recipeId}?${recipeParams.toString()}`;
  };

  return (
    <DashboardHomePage
      addRecipeHref="/app/recipes/new"
      basePath="/app/dashboard-preview"
      buildRecipeHref={buildPreviewRecipeHref}
      dashboardState={getVeteranPreviewDashboardState(previewFilters)}
      filters={previewFilters}
      previewMode
      previewStatus="Preview"
      returnTo={returnTo}
    />
  );
}
