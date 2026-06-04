## Why

Obywatel składa zaświadczenia lekarskie i psychologiczne przy **wniosku o pozwolenie**, ale gdy badania na **już wydanym** pozwoleniu wygasną, aplikacja pokazuje tylko alert i instrukcję „idź do urzędu”. WPA może ręcznie wpisać daty (`PATCH /wpa/permits/{id}/medical-exams`) bez plików w systemie. To nie odzwierciedla realnego flow (nowe orzeczenia → weryfikacja → aktualizacja rejestru) i łamie spójność z pierwszym wnioskiem.

## What Changes

- Nowy flow **odnowienia badań do pozwolenia**: obywatel składa zgłoszenie (pliki + proponowane daty ważności), WPA weryfikuje i zatwierdza lub odrzuca.
- Backend: encja zgłoszenia odnowienia ze statusem, załącznikami i powiązaniem z `Permit`; endpointy citizen + WPA; po zatwierdzeniu aktualizacja dat na pozwoleniu i rozwiązanie alertów medycznych.
- Frontend obywatela: CTA uploadu z widoku badań / szczegółów pozwolenia gdy status `expired`, `expiring` lub `missing`; podgląd statusu zgłoszenia (oczekuje / odrzucone).
- Frontend WPA: kolejka/lista zgłoszeń odnowień, podgląd załączników, approve/reject; integracja z istniejącym profilem obywatela i alertami medycznymi.
- MSW: handlery i seed dla demo.
- **Nie** wymaga składania pełnego wniosku o **nowe** pozwolenie — to osobna sprawa administracyjna.

## Capabilities

### New Capabilities

- `permit-medical-exam-renewal`: Zgłoszenie odnowienia badań przez obywatela, weryfikacja WPA, aktualizacja dat na pozwoleniu, historia zgłoszeń.

### Modified Capabilities

- `citizen-medical-view-permit-links`: Dodać wejście w flow odnowienia; zaktualizować wymaganie kompatybilności API (nowe endpointy citizen).

## Impact

- **Backend** (`Firearms-registery-wsb-back`): Domain, EF migration, `CitizenService`, `WpaService`, kontrolery, audit log, seed.
- **Frontend**: `citizenService`, `wpaService`, typy API, `MedicalAlertsView`, `PermitDetails`, `CitizenDetailsWPA`, `OfficerDashboard`, routing, MSW.
- **Istniejący** `PATCH /wpa/permits/{id}/medical-exams`: pozostaje jako **override urzędnika** (korekta bez zgłoszenia obywatela), nie zastępuje głównego flow.

## Non-Goals

- Zmiana przepisów (np. rozszerzenie obowiązku badań co 5 lat na wszystkie typy pozwoleń) — aplikacja może nadal symulować alerty dla wszystkich typów jak dziś.
- Pełny workflow zawieszenia/przywrócenia pozwolenia przy wygasłych badaniach (osobny temat).
- Powiadomienia push / e-mail.
