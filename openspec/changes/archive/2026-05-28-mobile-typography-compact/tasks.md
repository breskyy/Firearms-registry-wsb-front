## 1. Form primitives

- [x] 1.1 `Input`: replace `text-base md:text-sm` with `text-sm` only
- [x] 1.2 `Textarea`: same as Input
- [x] 1.3 `SelectTrigger`: replace `text-base` with `text-sm`
- [x] 1.4 Grep for remaining `text-base` on Input/Select className overrides in pages

## 2. Search bar

- [x] 2.1 `SearchBarWithFilters`: optional `showLabel` (default false); WPA search uses aria only
- [x] 2.2 Shorten WPA search placeholder in `WPASearchPage`
- [x] 2.3 `SearchFiltersSheet`: title `text-sm` on mobile (`text-sm md:text-lg` or token)

## 3. Typography tokens

- [x] 3.1 Add `PAGE_SECTION_TITLE_CLASS` and `PAGE_STAT_VALUE_CLASS` to `citizenCardUi.ts`
- [x] 3.2 Apply token in `WpaListSectionHeader`

## 4. Officer / WPA surfaces

- [x] 4.1 `OfficerDashboard`: section **Narzędzia** + empty states — compact headings/body on mobile
- [x] 4.2 `CitizenDetailsWPA`: stat numerals `text-2xl` → token (`text-xl`)
- [x] 4.3 `WpaApplicationReviewBar`: mobile title `text-sm`, subtitle stays small
- [x] 4.4 Spot-check `DecisionPage` mobile labels (prefer `text-sm` only)

## 5. Citizen surfaces

- [x] 5.1 `CitizenDashboard`: `text-lg` section headings → `PAGE_SECTION_TITLE_CLASS` on mobile
- [x] 5.2 `PermitDetails`: reduce `text-2xl`/`text-xl` hero stats on mobile
- [x] 5.3 `PromisesView`, `TransfersList`: card titles `text-base` → `text-sm`
- [x] 5.4 `TransferDrawer`: title and CTA typography compact

## 6. Shop / auth forms

- [x] 6.1 `ShopSalePage`: remove `text-base` from field and submit overrides
- [x] 6.2 `ShopVerification`, `LoginPage`, `ApplicationCorrection`: CTA `text-base` → default Button size
- [x] 6.3 `TransferDrawer` / citizen form pages inheriting primitives

## 7. Verification

- [x] 7.1 `npm run build`
- [x] 7.2 Visual mobile (~332px): `/officer/search` placeholder vs list tiles
- [x] 7.3 Visual mobile: `/officer/citizens/:id` stats, `/citizen`, `/permits/:id`, `/shop/sale`
- [x] 7.4 Grep audit: no stray `text-base` on form fields except documented exceptions
