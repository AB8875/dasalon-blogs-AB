// path: src/components/admin/DashboardCard.tsx
import type * as React from "react";

export type DashboardCardProps = {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  delta?: string;
  subtitle?: string;
  ariaLabel?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const deltaClasses = (delta?: string) => {
  if (!delta) return "bg-muted text-muted-foreground";
  // Use design tokens: destructive for negative, accent for positive/neutral
  return delta.trim().startsWith("-")
    ? "bg-destructive text-destructive-foreground"
    : "bg-accent text-accent-foreground";
};

// Export requirement: named React.FC
export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  delta,
  subtitle,
  ariaLabel,
  className,
  ...rest
}) => {
  return (
    <div
      role="group"
      tabIndex={0}
      aria-label={ariaLabel || `${title} card`}
      className={[
        // Card shell
        "relative rounded-2xl border bg-card text-card-foreground shadow-sm",
        // Spacing
        "p-4 sm:p-5",
        // Focus styles
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // Merge external className
        className || "",
      ].join(" ")}
      {...rest}
    >
      {/* Delta badge - top right */}
      {delta ? (
        <div
          className={[
            "absolute right-3 top-3 select-none rounded-full px-2 py-0.5 text-xs font-medium",
            deltaClasses(delta),
          ].join(" ")}
        >
          {delta}
        </div>
      ) : null}

      {/* Content */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {/* Icon */}
        {icon ? (
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              {icon}
            </div>
          </div>
        ) : null}

        {/* Text */}
        <div className="flex w-full flex-col">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-muted-foreground text-pretty">
              {title}
            </p>
          </div>

          <div className="mt-1">
            <div className="text-2xl font-semibold leading-none md:text-3xl">
              {value}
            </div>
            {subtitle ? (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

/*
Example usage:

import { UserPlus } from 'lucide-react'

<DashboardCard
  title="New Users"
  value={1280}
  delta="+4.2%"
  subtitle="vs last week"
  icon={<UserPlus className="h-5 w-5" />}
/>
*/
