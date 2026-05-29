## ADDED Requirements

### Requirement: Form primitives SHALL use compact text size on all viewports

System SHALL render `Input`, `Textarea`, and `Select` trigger text at `text-sm` (14px) on mobile and desktop.

#### Scenario: Input text and placeholder size

- **WHEN** user views any screen with a standard `Input` (including registry search)
- **THEN** typed text and placeholder SHALL use the same compact size (`text-sm`)
- **AND** system SHALL NOT apply `text-base` on mobile-only for those primitives

#### Scenario: Select trigger size

- **WHEN** user opens a form with `SelectTrigger`
- **THEN** the selected value and placeholder SHALL render at `text-sm`

### Requirement: Registry search SHALL use compact search field presentation

System SHALL present the officer registry search bar without typographic overweight on mobile.

#### Scenario: Search placeholder readability

- **WHEN** officer views `/officer/search` on a narrow viewport
- **THEN** the search placeholder SHALL use compact (`text-sm`) styling consistent with citizen result tiles
- **AND** the placeholder copy SHALL be concise (not a multi-field enumeration occupying the full field width)

#### Scenario: Redundant search label

- **WHEN** the search bar is configured with `aria-label` only (no user-facing field title required)
- **THEN** system SHALL NOT render a duplicate visible label above the search input

### Requirement: List section headers SHALL match list tile title scale on mobile

Section headers above application and registry lists SHALL use the same visual weight as list tile titles on mobile.

#### Scenario: WPA list section header on search and dashboard

- **WHEN** officer views list sections such as **Obywatele**, **Broń**, or dashboard application lists
- **THEN** section titles SHALL use `text-sm` bold (or shared token equivalent), not `text-base` on mobile

### Requirement: Dense stat numerals SHALL not use display-scale type on mobile

Inline statistics in compact cards (e.g. citizen detail summary) SHALL not use `text-2xl` on mobile.

#### Scenario: Citizen detail firearm and alert counts

- **WHEN** officer views citizen detail summary stats on mobile
- **THEN** numeric emphasis SHALL use at most `text-xl` (or token `PAGE_STAT_VALUE_CLASS`)
- **AND** stat labels SHALL remain `text-xs` or `text-sm`

### Requirement: Citizen dashboard section headings SHALL be compact on mobile

Citizen dashboard secondary headings SHALL align with list tile scale on mobile.

#### Scenario: Dashboard sections on mobile

- **WHEN** citizen views `/citizen` on a narrow viewport
- **THEN** section headings such as **Moje pozwolenia**, **Usługi**, and **Ostatnie wnioski** SHALL use at most `text-sm` bold on mobile
- **AND** permit card titles within the stack SHALL not exceed `text-base` on mobile unless part of page H1

### Requirement: Primary form CTAs SHALL use default button typography

Primary submit buttons SHALL not force `text-base` when the shared `Button` component already uses `text-sm`.

#### Scenario: Shop and login submit buttons

- **WHEN** user views primary submit actions on shop sale, login, or application correction flows
- **THEN** button label text SHALL inherit compact button typography (`text-sm`) unless a deliberate larger marketing CTA is specified in design

### Requirement: WPA review bar titles SHALL be compact on mobile

The sticky WPA application review bar SHALL not use `text-base` titles on the smallest breakpoints.

#### Scenario: Review bar on application detail

- **WHEN** officer views an application with the WPA review bar on mobile
- **THEN** the primary bar title SHALL use at most `text-sm` bold on the default mobile breakpoint
