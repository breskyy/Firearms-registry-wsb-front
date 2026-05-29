## Context

The app targets mobile-first layouts with `max-w-3xl` content columns. List-driven UIs already use compact typography via `citizenCardUi`:

- Tile title: `text-sm`
- Tile subtitle: `text-xs`

Form primitives diverge:

```text
Input / Textarea:  text-base  →  md:text-sm   (mobile larger than desktop)
Select trigger:    text-base  (all breakpoints)
Button default:    text-sm    ✓
```

`SearchBarWithFilters` renders a visible `Label` (`text-sm`) plus an `Input` whose placeholder inherits `text-base`, producing a visually heavy search row on WPA registry.

Exploration confirmed the user does **not** require iOS 16px input sizing.

## Goals / Non-Goals

**Goals:**

- One coherent **compact mobile scale** for body, forms, placeholders, and secondary headings.
- Search placeholder and value at **`text-sm`**, aligned with list tiles.
- Officer registry and high-traffic citizen/shop flows visually consistent at ~332px width.
- Centralize repeated section title classes in `citizenCardUi` where practical.

**Non-Goals:**

- Shrinking bottom nav labels or header logo.
- Removing touch targets.
- Typography changes outside the React app (marketing sites, etc.).

## Decisions

### 1. Target mobile type scale

| Role | Class | px |
|------|-------|-----|
| Page H1 | `text-xl` | 20 |
| Page subtitle | `text-sm` | 14 |
| Section title (list blocks) | `text-sm font-bold` | 14 |
| List tile title | `text-sm` (existing) | 14 |
| List tile meta | `text-xs` (existing) | 12 |
| Form fields + placeholder | `text-sm` | 14 |
| Label | `text-sm` (existing) | 14 |
| Stat emphasis | `text-lg` or `text-xl` | 18–20 |
| Primary CTA | inherit Button `text-sm` | 14 |

**Avoid on mobile:** `text-base` for fields/placeholders, `text-2xl` for inline stats in dense cards.

### 2. Primitives: global `text-sm`

Change `Input`, `Textarea`, and `SelectTrigger` to `text-sm` at all breakpoints. Remove `text-base md:text-sm` inversion.

Placeholder inherits field size automatically; optional `placeholder:text-muted-foreground` unchanged.

### 3. Search bar UX

- Shorten placeholder (e.g. **„Szukaj w rejestrze…”**); detailed field hints remain in filter sheet.
- Do not render visible `Label` when only `ariaLabel` is needed (prop `showLabel?: boolean`, default false for WPA search).
- Keep `min-h-[44px]` and filter button `text-sm`.

### 4. Tokens in `citizenCardUi`

Add:

```ts
export const PAGE_SECTION_TITLE_CLASS = "text-sm font-bold text-foreground leading-tight";
export const PAGE_STAT_VALUE_CLASS = "text-xl font-bold"; // was text-2xl in places
```

Migrate `WpaListSectionHeader`, officer/citizen section `h3`/`h2` that use `text-base` or `text-lg` on mobile.

### 5. Rollout order

```
1. ui primitives (Input, Textarea, Select)
2. SearchBarWithFilters + WPASearchPage
3. citizenCardUi tokens + WpaListSectionHeader, OfficerDashboard, CitizenDetailsWPA, WpaApplicationReviewBar
4. CitizenDashboard, PermitDetails, PromisesView, TransfersList
5. Shop forms + Login CTAs (drop text-base overrides)
6. DecisionPage / ReviewCollapsibleCard spot-check
```

### 6. Page H1 unchanged

Keep `text-xl md:text-2xl` on page titles — only one large element per screen preserves hierarchy after compacting body text.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| iOS zoom on small inputs | Accepted per product decision |
| Desktop forms feel smaller | Acceptable; same as mobile scale, still readable |
| Missed `text-base` overrides in pages | Grep audit in tasks; visual pass on 3 roles |
| Citizen dashboard marketing feel reduced | H1 stays xl; only section headings shrink |

## Verification

- Visual check at 320–390px width: `/officer/search`, `/officer/citizens/:id`, `/officer`, `/citizen`, `/permits/:id`, `/shop/sale`
- `npm run build`
- Confirm search placeholder no longer dominates over adjacent list tiles
