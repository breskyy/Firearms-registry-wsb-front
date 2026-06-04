/** Shared horizontal shell for main content and WPA review bar (matches header
 *  column width; header uses max-w-7xl for wider navigation). */
export const contentColumnClass = "max-w-3xl w-full mx-auto px-4";

/** Fixed mobile bottom nav: pt-1.5 + h-12 + pb-0.375 (+ safe-area on nav itself). */
export const MOBILE_BOTTOM_NAV_HEIGHT = "3.75rem";

/** Scroll gutter between page content and the fixed bottom nav. */
export const MOBILE_MAIN_BOTTOM_GUTTER = "1.25rem";

/** Main `<main>` padding-bottom on viewports with fixed bottom nav (md+ uses md:pb-8). */
export const mobileMainPaddingBottomClass =
  "pb-[calc(3.75rem+1.25rem+env(safe-area-inset-bottom,0px))]";
