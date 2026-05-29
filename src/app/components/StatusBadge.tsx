import type { ReactNode } from "react";
import { Badge } from "./ui/badge";
import { cn } from "./ui/utils";
import { UNKNOWN_STATUS_LABEL, type StatusMeta } from "../../lib/statusUi";

type StatusBadgeProps = {
  meta: StatusMeta | null;
  className?: string;
  leading?: ReactNode;
};

export function StatusBadge({ meta, className, leading }: StatusBadgeProps) {
  if (!meta) {
    return (
      <Badge variant="secondary" className={cn("rounded-full px-2 py-0.5", className)}>
        {UNKNOWN_STATUS_LABEL}
      </Badge>
    );
  }

  return (
    <Badge variant={meta.variant} className={cn(meta.badgeClassName, className)}>
      {leading}
      {meta.label}
    </Badge>
  );
}
