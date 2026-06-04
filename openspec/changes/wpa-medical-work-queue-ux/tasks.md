## 1. Queue helpers

- [x] 1.1 Add `src/lib/wpaMedicalWorkQueue.ts` — partition renewals vs alerts, dedupe by `permitId`, tab count
- [x] 1.2 Map renewal status to list tile badge (reuse status UI patterns)

## 2. Officer dashboard — Badania tab

- [x] 2.1 Replace 4-tab layout with 3 tabs (Pozwolenia, Promesy, Badania); remove `renewals` and `alerts` tabs
- [x] 2.2 Implement **Do weryfikacji** section with clickable `ApplicationListTile` → `/officer/medical-exam-renewals/:id`
- [x] 2.3 Implement **Monitorowanie** section — alerts without pending renewal; footer: Profil, Zawieś (expired only)
- [x] 2.4 Wire tab count badge per spec (no double-count per permit)
- [x] 2.5 Empty state when both sections are empty

## 3. Copy and actions cleanup

- [x] 3.1 Remove misleading CTAs from monitoring rows (`Weryfikuj odnowienie` when no renewal, `Profil i korekta dat` as primary)
- [x] 3.2 Section descriptions: clarify monitoring = citizen has not submitted renewal in system yet

## 4. Demo and verification

- [x] 4.1 Adjust MSW seed if needed so dashboard shows both sections (pending renewal + alert-only)
- [x] 4.2 Manual: officer → Badania → verify tile opens renewal with attachments; monitoring → profil / zawieś only
- [x] 4.3 Manual: after approve renewal, item leaves verification and related alert leaves monitoring
- [x] 4.4 `pnpm run build`
