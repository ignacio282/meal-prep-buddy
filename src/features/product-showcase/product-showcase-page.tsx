import {
  BookOpenText,
  Check,
  ChefHat,
  Clock3,
  LayoutDashboard,
  MessageCircleMore,
  Search,
  Settings2,
  Shuffle,
  Sparkles,
  Star,
  Target,
} from "lucide-react";

import { AppShellHeader } from "@/components/layout/app-shell-header";
import { NavItem } from "@/components/layout/nav-item";
import { SectionHeader } from "@/components/layout/section-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { RecipeCard } from "@/components/ui/recipe-card";
import { SearchField } from "@/components/ui/search-field";
import { SelectField } from "@/components/ui/select-field";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import { TextAreaComposer } from "@/components/ui/text-area-composer";
import { TextField } from "@/components/ui/text-field";
import { Toggle } from "@/components/ui/toggle";

const proteinOptions = [
  { label: "Chicken", value: "chicken" },
  { label: "Beef", value: "beef" },
  { label: "Turkey", value: "turkey" },
  { label: "Salmon", value: "salmon" },
] as const;

const navItems = [
  {
    icon: <LayoutDashboard className="size-5" strokeWidth={2} />,
    label: "Overview",
    meta: "01",
    active: true,
  },
  {
    icon: <MessageCircleMore className="size-5" strokeWidth={2} />,
    label: "Recipe ingestion",
    meta: "02",
    active: false,
  },
  {
    icon: <BookOpenText className="size-5" strokeWidth={2} />,
    label: "Recipe library",
    meta: "03",
    active: false,
  },
  {
    icon: <Shuffle className="size-5" strokeWidth={2} />,
    label: "Weekly pick",
    meta: "04",
    active: false,
  },
  {
    icon: <Settings2 className="size-5" strokeWidth={2} />,
    label: "Preferences",
    meta: "05",
    active: false,
  },
] as const;

export function ProductShowcasePage() {
  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 sm:py-6 xl:px-8">
      <div className="mx-auto flex w-full max-w-[78rem] flex-col gap-6">
        <AppShellHeader
          eyebrow="Product foundation"
          title="Meal Prep Buddy /app/design-system"
        />

        <div className="grid gap-6 xl:grid-cols-[16rem_1fr]">
          <aside className="space-y-6">
            <SurfaceCard className="space-y-2 p-3">
              {navItems.map((item) => (
                <NavItem
                  key={item.label}
                  active={item.active}
                  icon={item.icon}
                  label={item.label}
                  meta={item.meta}
                />
              ))}
            </SurfaceCard>

            <SurfaceCard className="space-y-4 p-4">
              <p className="text-title text-foreground">Layout primitives</p>
              <p className="text-caption text-foreground-muted">
                Light shell, centered content, soft-surface cards, and compact
                navigation are the base for future dashboard screens.
              </p>
              <StatusBadge tone="highlight">Temporary design system page</StatusBadge>
            </SurfaceCard>
          </aside>

          <div className="space-y-6">
            <SurfaceCard className="space-y-6 p-5 sm:p-6">
              <SectionHeader
                title="Buttons"
                description="Primary, secondary, tertiary, and icon-only actions aligned with the Figma button set."
                action={<StatusBadge tone="info">48px height</StatusBadge>}
              />
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-caption text-foreground-muted">Default</p>
                  <div className="flex flex-wrap gap-3">
                    <Button icon={<Sparkles className="size-5" strokeWidth={2.2} />}>
                      Primary
                    </Button>
                    <Button
                      icon={<Sparkles className="size-5" strokeWidth={2.2} />}
                      variant="secondary"
                    >
                      Secondary
                    </Button>
                    <Button
                      icon={<Sparkles className="size-5" strokeWidth={2.2} />}
                      variant="tertiary"
                    >
                      Tertiary
                    </Button>
                    <Button
                      aria-label="Favorite recipe"
                      icon={<Star className="size-5" strokeWidth={2.2} />}
                      variant="icon"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-caption text-foreground-muted">
                    Hover, focus, disabled
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      icon={<Sparkles className="size-5" strokeWidth={2.2} />}
                      visualState="hover"
                    >
                      Hover
                    </Button>
                    <Button
                      icon={<Sparkles className="size-5" strokeWidth={2.2} />}
                      variant="secondary"
                      visualState="focus"
                    >
                      Focus
                    </Button>
                    <Button
                      disabled
                      icon={<Sparkles className="size-5" strokeWidth={2.2} />}
                    >
                      Disabled
                    </Button>
                  </div>
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-6 p-5 sm:p-6">
              <SectionHeader
                title="Form inputs"
                description="The initial dashboard form set follows the Figma inputs and adds the minimum missing states for ingestion and preferences."
                action={<StatusBadge tone="success">Foundation ready</StatusBadge>}
              />
              <div className="grid gap-5 xl:grid-cols-2">
                <TextField
                  defaultValue="2,150 calories"
                  helperText="Used for meal prep defaults later."
                  label="Calories"
                />
                <TextField
                  defaultValue="Needs review"
                  errorText="Macro ranges should be set before saving."
                  label="Protein target"
                  visualState="focus"
                />
                <SearchField
                  defaultValue="Chicken bowls"
                  label="Search recipes"
                  placeholder="Search a recipe"
                />
                <SearchField
                  disabled
                  label="Search recipes"
                  placeholder="Search a recipe"
                />
                <SelectField
                  helperText="Matches the Figma selector pattern."
                  label="Protein"
                  onState="closed"
                  options={[...proteinOptions]}
                  selectedValue="chicken"
                />
                <SelectField
                  label="Protein"
                  onState="open"
                  options={[...proteinOptions]}
                  selectedValue="chicken"
                />
              </div>

              <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
                <TextAreaComposer
                  defaultValue="Add a recipe from a link or paste the full recipe text here. Keep the ingredient list, macros, and prep steps together."
                  helperText="Temporary multiline input for the ingestion/chat entry point."
                  label="Recipe ingestion"
                  visualState="focus"
                />
                <div className="space-y-4">
                  <Toggle
                    checked
                    description="Use saved calorie targets when reviewing recipes."
                    label="Apply meal prep defaults"
                    leading={<Target className="size-5" strokeWidth={2} />}
                  />
                  <Toggle
                    description="Show serving-based macro summaries in the library."
                    label="Highlight macros"
                    leading={<Check className="size-5" strokeWidth={2} />}
                  />
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-6 p-5 sm:p-6">
              <SectionHeader
                title="Chips and tags"
                description="Category pills, active filters, and preference tags stay compact and reusable."
                action={<StatusBadge tone="warning">Selected states</StatusBadge>}
              />
              <div className="flex flex-wrap gap-3">
                <Chip>Asian</Chip>
                <Chip>High protein</Chip>
                <Chip selected>Selected filter</Chip>
                <Chip removable selected>
                  Active preference
                </Chip>
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-6 p-5 sm:p-6">
              <SectionHeader
                title="Cards"
                description="Recipe cards come from Figma; supporting cards fill the minimum dashboard needs without inventing a new visual language."
                action={<StatusBadge tone="highlight">Surface system</StatusBadge>}
              />

              <div className="grid gap-4 xl:grid-cols-3">
                <StatCard
                  detail="Structured recipe entries available for weekly planning."
                  icon={<ChefHat className="size-5" strokeWidth={2} />}
                  label="Saved recipes"
                  value="24"
                />
                <StatCard
                  detail="Recipes already aligned to calorie defaults."
                  icon={<Target className="size-5" strokeWidth={2} />}
                  label="Ready to prep"
                  value="12"
                />
                <StatCard
                  detail="Current shortlist for the next random weekly pick."
                  icon={<Shuffle className="size-5" strokeWidth={2} />}
                  label="Weekly pool"
                  value="6"
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.15fr_0.95fr]">
                <RecipeCard
                  calories="1010 cal"
                  category="Asian"
                  duration="40 min"
                  favorited
                  macros={["32g protein", "45g carbs", "14g fat"]}
                  secondaryCalories="510 cal"
                  title="Grilled Chicken & Sweet Potato"
                  variant="full"
                />
                <div className="space-y-4">
                  <RecipeCard
                    calories="1010 cal"
                    category="Asian"
                    duration="40 min"
                    macros={["32g protein", "45g carbs", "14g fat"]}
                    secondaryCalories="510 cal"
                    title="Grilled Chicken & Sweet Potato"
                    variant="condensed"
                  />
                  <EmptyState
                    actionLabel="Add first recipe"
                    description="Future library and weekly-planning screens can reuse this block whenever the user has no saved recipes yet."
                    icon={<BookOpenText className="size-5" strokeWidth={2} />}
                    title="No recipes saved yet"
                  />
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-6 p-5 sm:p-6">
              <SectionHeader
                title="Feedback and status"
                description="Simple feedback surfaces cover setup guidance, ingestion review, and dashboard status without building full flows yet."
                action={<StatusBadge tone="info">Lean coverage</StatusBadge>}
              />

              <div className="flex flex-wrap gap-3">
                <StatusBadge tone="success">Ready to save</StatusBadge>
                <StatusBadge tone="warning">Needs review</StatusBadge>
                <StatusBadge tone="info">Library synced</StatusBadge>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                <AlertBanner title="Recipe review needed" tone="warning">
                  The imported recipe is missing one macro value, so it should be
                  confirmed before it becomes a reusable library entry.
                </AlertBanner>
                <AlertBanner title="Preferences saved" tone="success">
                  Meal prep defaults can now be reused in future recipe reviews.
                </AlertBanner>
                <AlertBanner title="Weekly pick preview" tone="info">
                  Random recipe selection will draw only from structured saved
                  recipes, not from chat history.
                </AlertBanner>
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-6 p-5 sm:p-6">
              <SectionHeader
                title="Navigation and shell"
                description="This temporary page also demonstrates the dashboard entry structure the landing CTA now points to."
                action={
                  <StatusBadge tone="highlight">
                    Route: /app/design-system
                  </StatusBadge>
                }
              />
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <AlertBanner title="Product entry point" tone="info">
                    The main hero CTA on the landing page now leads here so the
                    product area has a clear, stable entry path while screens are
                    still being built.
                  </AlertBanner>
                  <div className="bg-background-light rounded-xl p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge tone="highlight">Dashboard shell</StatusBadge>
                      <StatusBadge tone="success">Reusable components</StatusBadge>
                      <StatusBadge tone="info">No product logic yet</StatusBadge>
                    </div>
                  </div>
                </div>
                <SurfaceCard className="space-y-4 p-4" tone="raised">
                  <p className="text-title text-foreground">Flow coverage</p>
                  <div className="space-y-3">
                    <div className="text-body text-foreground flex items-center gap-3">
                      <Settings2 className="text-primary size-5" strokeWidth={2} />
                      <span>User setup and preferences</span>
                    </div>
                    <div className="text-body text-foreground flex items-center gap-3">
                      <MessageCircleMore
                        className="text-primary size-5"
                        strokeWidth={2}
                      />
                      <span>Recipe ingestion through chat</span>
                    </div>
                    <div className="text-body text-foreground flex items-center gap-3">
                      <Search className="text-primary size-5" strokeWidth={2} />
                      <span>Recipe library and browsing</span>
                    </div>
                    <div className="text-body text-foreground flex items-center gap-3">
                      <Clock3 className="text-primary size-5" strokeWidth={2} />
                      <span>Recipe details and prep metadata</span>
                    </div>
                    <div className="text-body text-foreground flex items-center gap-3">
                      <Shuffle className="text-primary size-5" strokeWidth={2} />
                      <span>Random weekly recipe selection</span>
                    </div>
                  </div>
                </SurfaceCard>
              </div>
            </SurfaceCard>
          </div>
        </div>
      </div>
    </main>
  );
}
