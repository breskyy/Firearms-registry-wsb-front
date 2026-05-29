## Why

WPA officer screens expose English status keys, inconsistent status labels, and raw API errors to users processing applications.

## What Changes

- Unify status badges via `statusUi` on WPA review surfaces.
- Replace English status names and „sloty” with Polish operational terms.
- Route WPA error toasts through `getApiErrorMessage`.
- Fix medical alert count phrasing in search results.

## Capabilities

### New Capabilities
- `wpa-user-facing-copy`: WPA officer UI copy standards.

## Impact

- Officer dashboard, decision page, search, citizen details WPA, review bar, attachment views.
