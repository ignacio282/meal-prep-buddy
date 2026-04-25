import Link from "next/link";

import { ArrowLeft, LayoutGrid, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

type AppShellHeaderProps = Readonly<{
  eyebrow: string;
  title: string;
}>;

export function AppShellHeader({ eyebrow, title }: AppShellHeaderProps) {
  return (
    <header className="bg-surface border-background-light rounded-xl border px-5 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <StatusBadge tone="highlight">{eyebrow}</StatusBadge>
          <div className="space-y-1">
            <h1 className="text-h1 text-foreground">{title}</h1>
            <p className="text-body text-foreground-muted">
              Temporary foundation page for the reusable dashboard components.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="text-button text-primary border-primary inline-flex h-12 items-center gap-2 rounded-full border px-4"
          >
            <ArrowLeft className="size-5" strokeWidth={2.2} />
            <span>Back to landing</span>
          </Link>
          <Button
            icon={<LayoutGrid className="size-5" strokeWidth={2.2} />}
            variant="tertiary"
          >
            Product preview
          </Button>
          <Button
            aria-label="Create recipe"
            icon={<Plus className="size-5" strokeWidth={2.2} />}
            variant="icon"
          />
        </div>
      </div>
    </header>
  );
}
