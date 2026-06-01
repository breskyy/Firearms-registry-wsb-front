import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

export type EmptyStateAction = {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline";
  className?: string;
  "aria-label"?: string;
  icon?: ReactNode;
};

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  emphasizeTitle?: boolean;
  iconClassName?: string;
  action?: EmptyStateAction;
  footer?: ReactNode;
  className?: string;
};

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  emphasizeTitle = false,
  iconClassName = "text-primary",
  action,
  footer,
  className,
}: Props) {
  const hasFooter = Boolean(action || footer);

  return (
    <Card className={cn("rounded-2xl border-none shadow-sm", className)}>
      <CardContent className="p-12 text-center">
        <Icon className={cn("h-16 w-16 mx-auto mb-4 opacity-30", iconClassName)} aria-hidden />
        <p
          className={cn(
            emphasizeTitle || description
              ? "text-foreground font-semibold mb-1"
              : cn("text-muted-foreground", hasFooter && "mb-4"),
          )}
        >
          {title}
        </p>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
        {action && (
          <Button
            type="button"
            variant={action.variant ?? "default"}
            onClick={action.onClick}
            className={cn(
              "min-h-[44px] rounded-xl",
              (description || emphasizeTitle) && "mt-4",
              action.className,
            )}
            aria-label={action["aria-label"] ?? action.label}
          >
            {action.icon}
            {action.label}
          </Button>
        )}
        {footer}
      </CardContent>
    </Card>
  );
}
