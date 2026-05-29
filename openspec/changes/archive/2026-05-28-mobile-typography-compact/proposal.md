## Why

On narrow mobile layouts (~300–360px content width), several surfaces feel typographically heavy: registry search placeholders inherit `text-base` (16px) from `Input` while list tiles use `text-sm`/`text-xs`. Form primitives use an inverted pattern (`text-base` on mobile, `md:text-sm` on desktop) originally aimed at iOS input zoom, which is not a project constraint. The app needs a compact, consistent mobile type scale aligned with existing list/card patterns (`citizenCardUi`).

## What Changes

- Set form primitives (`Input`, `Textarea`, `Select`) to **`text-sm` on all breakpoints** (remove mobile `text-base`).
- Tighten **registry search** (`SearchBarWithFilters`): smaller placeholder copy, optional removal of redundant visible label.
- Add or extend **typography tokens** in `citizenCardUi` for section titles and page subheads on mobile.
- Pass **officer/WPA** surfaces: search, dashboard, citizen detail stats, review bar, section headers, filter sheet.
- Pass **citizen** surfaces: dashboard section headings, permit details hero stats, promises/transfers tiles where `text-base`/`text-lg`/`text-2xl` dominate on mobile.
- Pass **shop/login/forms**: remove ad-hoc `text-base` on fields and primary CTAs where `Button` already defaults to `text-sm`.
- Keep **page H1** at `text-xl` on mobile (single prominent title per screen); reduce secondary headings and stat numerals.

## Capabilities

### New Capabilities

- `mobile-typography-compact`: Compact mobile typography scale across primitives and role-specific pages.

### Modified Capabilities

- (none)

## Impact

- `src/app/components/ui/input.tsx`, `textarea.tsx`, `select.tsx`
- `src/app/components/search/SearchBarWithFilters.tsx`, `SearchFiltersSheet.tsx`
- `src/app/utils/citizenCardUi.ts`
- Officer: `WPASearchPage`, `OfficerDashboard`, `CitizenDetailsWPA`, `WpaListSectionHeader`, `WpaApplicationReviewBar`, `ReviewCollapsibleCard` (optional alignment)
- Citizen: `CitizenDashboard`, `PermitDetails`, `PromisesView`, `TransfersList`, `TransferDrawer`, related cards
- Shop: `ShopSalePage`, `ShopVerification`, `LoginPage`, `ApplicationCorrection`
- `DecisionPage` decision labels (mobile `text-sm` only, no `md:text-base` bump unless needed)

## Non-Goals

- iOS Safari input-zoom mitigation (explicitly out of scope).
- Changing `max-w-3xl` layout width or touch target heights (`min-h-[44px]` preserved).
- Rebranding or new font family.
- Desktop-only typography redesign (desktop may stay as-is or inherit `text-sm` where primitives change globally).
