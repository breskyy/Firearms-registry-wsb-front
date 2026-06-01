## Context

Shop staff use the sale panel under time pressure. Copy must describe actions in plain Polish without implementation terms (token, backend, API, fallback).

## Decisions

1. **Terminology**
   - Use **kod z QR** / **kod promesy** instead of *token*.
   - Use **system** instead of *backend*.
   - Use **wolne miejsca w pozwoleniu** instead of *sloty*.
   - Use **urząd** instead of *WPA* in shop-facing error text.

2. **Error surfaces**
   - Network and camera errors must not mention dev tooling (pnpm, cloudflared, localhost).
   - `translateVerifyMessage` returns a Polish fallback instead of raw API `message`.

3. **Scope**
   - Shop pages and shared libs used exclusively in shop flows (`camera*`, `shopService`, `apiErrors`).

## Non-Goals

- Citizen or WPA copy (separate changes).
- Renaming code identifiers (`qrToken` fields).
