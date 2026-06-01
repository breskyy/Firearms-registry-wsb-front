import type { ComponentType, SVGProps } from "react";
import {
  HomeIcon,
  DocumentTextIcon,
  ViewfinderCircleIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassCircleIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolidIcon,
  DocumentTextIcon as DocumentTextSolidIcon,
  ViewfinderCircleIcon as ViewfinderCircleSolidIcon,
  PlusCircleIcon as PlusCircleSolidIcon,
  ClipboardDocumentListIcon as ClipboardDocumentListSolidIcon,
  MagnifyingGlassCircleIcon as MagnifyingGlassCircleSolidIcon,
  ShoppingBagIcon as ShoppingBagSolidIcon,
} from "@heroicons/react/24/solid";

export type NavIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export type MobileBottomNavItem = {
  label: string;
  path: string;
  search?: string;
  iconOutline: NavIconComponent;
  iconSolid: NavIconComponent;
};

export const CITIZEN_MOBILE_NAV: MobileBottomNavItem[] = [
  { label: "Pulpit", path: "/citizen", iconOutline: HomeIcon, iconSolid: HomeSolidIcon },
  { label: "Wnioski", path: "/applications", iconOutline: DocumentTextIcon, iconSolid: DocumentTextSolidIcon },
  { label: "Broń", path: "/weapons", iconOutline: ViewfinderCircleIcon, iconSolid: ViewfinderCircleSolidIcon },
  { label: "Nowy", path: "/application/new", iconOutline: PlusCircleIcon, iconSolid: PlusCircleSolidIcon },
];

export const OFFICER_MOBILE_NAV: MobileBottomNavItem[] = [
  { label: "Pulpit", path: "/officer", iconOutline: HomeIcon, iconSolid: HomeSolidIcon },
  { label: "Zadania", path: "/applications", iconOutline: ClipboardDocumentListIcon, iconSolid: ClipboardDocumentListSolidIcon },
  { label: "Rejestr", path: "/officer/search", iconOutline: MagnifyingGlassCircleIcon, iconSolid: MagnifyingGlassCircleSolidIcon },
];

export const SHOP_MOBILE_NAV: MobileBottomNavItem[] = [
  { label: "Pulpit", path: "/shop", iconOutline: HomeIcon, iconSolid: HomeSolidIcon },
  { label: "Sprzedaż", path: "/shop/sale", iconOutline: ShoppingBagIcon, iconSolid: ShoppingBagSolidIcon },
];

export function getMobileBottomNav(role: string): MobileBottomNavItem[] {
  switch (role) {
    case "citizen":
      return CITIZEN_MOBILE_NAV;
    case "officer":
      return OFFICER_MOBILE_NAV;
    case "shop":
      return SHOP_MOBILE_NAV;
    default:
      return [];
  }
}
