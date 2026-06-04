## Why

Po wdrożeniu odnowień badań WPA ma dwie osobne zakładki na pulpicie (**Odnowienia** i **Alerty**), które opisują tę samą sprawę medyczną z różnych stron: alert to sygnał w rejestrze (brak załączników), odnowienie to sprawa do weryfikacji (pliki + approve/reject). Urzędnik wchodzi w Alerty i nie widzi załączników — podczas gdy wzorzec **Pozwolenia / Promesy** jest jasny: jedna kolejka → szczegóły → decyzja. Trzeba ujednolicić UX WPA z tym wzorcem i z realnym flow (przedłożenie orzeczeń → weryfikacja WPA, nie nowy wniosek o pozwolenie).

## What Changes

- **BREAKING (WPA UI):** Pulpit WPA ma **3 równorzędne zakładki**: Pozwolenia, Promesy, **Badania** (zamiast 4: + Odnowienia + Alerty).
- Zakładka **Badania** składa się z dwóch sekcji listowych:
  - **Do weryfikacji** — `PermitMedicalExamRenewal` w statusie `Submitted` / `UnderReview`; kafelek jak wnioski; klik → `/officer/medical-exam-renewals/:id` (załączniki, approve/reject).
  - **Monitorowanie** — nierozwiązane `MedicalAlert` **bez** pending renewal; brak udawania weryfikacji plików; akcje: profil, zawieszenie (gdy wygasłe), ewentualnie link do korekty rejestru.
- Usunięcie osobnej zakładki **Odnowienia** i przeniesienie alertów z osobnej zakładki **Alerty** do sekcji monitorowania w **Badania**.
- Licznik na zakładce **Badania** = liczba spraw wymagających uwagi WPA (pending renewals + alerty bez zgłoszenia, bez podwójnego liczenia tego samego pozwolenia).
- Zachowanie istniejących endpointów i strony `OfficerMedicalExamRenewalPage`; zmiana głównie w `OfficerDashboard` i copy/CTA.
- Korekta rejestru (`PATCH` / profil obywatela) pozostaje ścieżką drugorzędną, nie primary na liście monitorowania.

## Capabilities

### New Capabilities

- `wpa-medical-work-queue`: Trzecia zakładka WPA „Badania”, sekcje Do weryfikacji / Monitorowanie, liczniki, nawigacja i CTA zgodne z kolejką wniosków.

### Modified Capabilities

- `wpa-dashboard-citizen-ui`: Wymagania dotyczące zakładek pulpitu WPA i sekcji alertów medycznych — zamiast osobnej zakładki alertów, wzorzec trzech zakładek i list tile.

## Impact

- **Frontend:** `OfficerDashboard.tsx` (tabs, fetch, sekcje, liczniki, CTA), ewentualnie wyciągnięcie helperów (`mergeMedicalWorkItems`, priorytetyzacja).
- **MSW:** opcjonalna korekta seed/demo, aby pokazać obie sekcje na pulpicie.
- **Backend:** brak wymaganych zmian API (reuse `GET /wpa/medical-exam-renewals`, `GET /wpa/medical-alerts`); opcjonalnie później agregat `medical-cases`.
- **Nie zmienia:** flow obywatela (`MedicalAlertsView`, `PermitExamRenewalForm`), `OfficerMedicalExamRenewalPage`, kontrakt `permit-medical-exam-renewal`.
