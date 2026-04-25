import type { ReactNode } from "react";

type SectionHeaderProps = Readonly<{
  action?: ReactNode;
  description?: string;
  title: string;
}>;

export function SectionHeader({
  action,
  description,
  title,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h2 className="text-h2 text-foreground">{title}</h2>
        {description ? (
          <p className="text-body text-foreground-muted max-w-[42rem]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
