import type { ComponentType, SVGProps } from "react";
import { cn } from "./ui/utils";

type NavIcon = ComponentType<SVGProps<SVGSVGElement>>;

type Props = {
  iconOutline: NavIcon;
  iconSolid: NavIcon;
  active: boolean;
};

/** Aktywny: Heroicons solid + primary; nieaktywny: outline + muted. */
export function MobileBottomNavIcon({ iconOutline, iconSolid, active }: Props) {
  const Icon = active ? iconSolid : iconOutline;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center transition-colors",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2 : 1.75} aria-hidden />
    </span>
  );
}
