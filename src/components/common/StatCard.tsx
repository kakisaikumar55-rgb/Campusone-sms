import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  loading,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "accent" | "success" | "warning";
  loading?: boolean;
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/15 text-accent-foreground",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning",
  };

  return (
    <Card className="bg-surface-gradient relative gap-0 overflow-hidden p-5 shadow-card">
      <span className="bg-brand-gradient absolute inset-x-0 top-0 h-1" />
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-20" />
          ) : (
            <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
          )}
          {hint ? <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", tones[tone])}>
          <Icon className="size-5" />
        </span>
      </div>
    </Card>
  );
}
