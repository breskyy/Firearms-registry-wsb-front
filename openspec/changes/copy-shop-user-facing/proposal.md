## Why

Shop panel copy exposes developer terminology (token, backend, fallback, API errors) to store staff who need plain Polish operational language.

## What Changes

- Replace technical shop UI strings with user-facing Polish (kod z QR instead of token, system instead of backend).
- Fix camera and network error messages shown during shop sale flow.
- Map permit type labels in verification results to Polish.
- Add spec forbidding developer terminology in shop-facing surfaces.

## Capabilities

### New Capabilities
- `shop-user-facing-copy`: Shop UI copy standards and forbidden terminology.

## Impact

- `ShopDashboard`, `ShopSalePage`, `QrScanner`, `shopService`, `cameraErrors`, `cameraAvailability`, `apiErrors`, `api.ts` (network message).
