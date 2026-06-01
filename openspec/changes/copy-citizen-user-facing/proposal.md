## Why

Citizen-facing screens mix missing Polish diacritics, acronym WPA, and technical terms (token) that confuse non-technical users.

## What Changes

- Fix diacritics and citizen copy on correction, applications list, and related flows.
- Replace WPA with plain „urząd” in citizen UI where appropriate.
- Replace token with „kod z QR” in promise QR modal.
- Route transfer/network errors through user-facing Polish messages.

## Capabilities

### New Capabilities
- `citizen-user-facing-copy`: Citizen UI copy standards.

## Impact

- Citizen pages, components, and shared error helpers used in citizen flows.
