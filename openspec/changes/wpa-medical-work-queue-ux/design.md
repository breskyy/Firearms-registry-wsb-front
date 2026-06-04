## Context

- Change `permit-medical-exam-renewal` dostarczył encję/API/stronę weryfikacji WPA z załącznikami.
- `OfficerDashboard` dodał **4 zakładki** (Pozwolenia, Promesy, Odnowienia, Alerty), co rozjechało mentalny model z dwoma tabami wniosków.
- **Prawo (PL):** odnowienie = przedłożenie orzeczeń do organu Policji przy już wydanym pozwoleniu (art. 15 ust. 4 u.o.b.a. dla ochrony osobistej / osób i mienia); cykliczne co 5 lat. To **nie** wniosek o nowe pozwolenie — ale **w UI WPA** sprawa wygląda jak **kolejka do rozpatrzenia** (analogia do wniosku z załącznikami).

## Goals / Non-Goals

**Goals:**

- Trzecia równorzędna zakładka **Badania** na pulpicie WPA (obok Pozwolenia, Promesy).
- Jednoznaczne rozdzielenie: **Do weryfikacji** (jest zgłoszenie z plikami) vs **Monitorowanie** (tylko alert, obywatel jeszcze nie złożył lub czeka).
- Primary CTA na wierszu zależny od stanu; klik w sprawę do weryfikacji → istniejąca strona renewal.
- Licznik zakładki bez duplikatu tego samego `permitId` (renewal pending + alert).

**Non-Goals:**

- Nowy endpoint agregujący `medical-cases` (front łączy dwa GET w pierwszej iteracji).
- Przebudowa `OfficerMedicalExamRenewalPage` na pełny klon `ApplicationDetails` / `WpaApplicationReviewBar` (możliwy follow-up).
- Zmiana logiki backendu alertów lub renewal.
- Osobna strona WPA `/officer/medical-alerts` (lista zostaje na pulpicie).

## Decisions

### 1. Trzy zakładki zamiast czterech

| Opcja | Verdict |
|-------|---------|
| 4 taby (status quo) | Odrzucone — duplikacja i zły primary na alertach |
| 3 taby: Badania scalone | **Wybrane** — zgodne z decyzją produktową użytkownika |
| 2 taby + podstrona | Odrzucone — gorsza widoczność kolejki |

`AppTabsList`: `grid-cols-3` na mobile i desktop (Pozwolenia | Promesy | Badania).

### 2. Struktura zakładki Badania

```
TabsContent "medical"
├── WpaListSectionHeader "Do weryfikacji"
│   └── ApplicationListTile[]  ← renewals Submitted/UnderReview
│       onClick → /officer/medical-exam-renewals/:id
├── WpaListSectionHeader "Monitorowanie"
│   └── ApplicationListTile[]  ← alerts resolved=false, permit bez pending renewal
│       footer: Profil | Zawieś (expired) | (bez "weryfikuj" bez renewal)
└── EmptyState gdy obie sekcje puste
```

Sortowanie **Do weryfikacji**: `Submitted` przed `UnderReview`, potem `createdAt` desc (jak pending wnioski).

### 3. Licznik zakładki

```ts
count = pendingRenewals.length + alertsWithoutPendingRenewal.length
```

`alertsWithoutPendingRenewal` = alert z `permitId`, dla którego nie ma renewal w `Submitted`/`UnderReview`. Alert dla permitu z pending renewal **nie** zwiększa licznika monitorowania (sprawa już w pierwszej sekcji).

### 4. CTA i copy

| Stan | Primary | Nie pokazuj jako primary |
|------|---------|---------------------------|
| Pending renewal | Kafelek → strona renewal (cały tile klikalny jak wniosek) | — |
| Alert, brak renewal | Tile informacyjny; footer: Profil, Zawieś jeśli expired | „Weryfikuj załączniki”, „Korekta dat” |
| Alert + renewal pending | Tylko w sekcji Do weryfikacji | Nie duplikuj w Monitorowaniu |

Korekta rejestru: tylko z profilu obywatela (`CitizenDetailsWPA`), etykieta już „Korekta dat w rejestrze”.

### 5. Dane — front-only merge

- Równoległy fetch: `getMedicalExamRenewals`, `getMedicalAlerts({ resolved: false })` (jak dziś).
- Helper `buildWpaMedicalWorkQueue(renewals, alerts)` w `src/lib/wpaMedicalWorkQueue.ts` (nowy plik).

### 6. MSW / demo

- Upewnić się, że seed pokazuje: (a) renewal pending, (b) alert bez renewal — do testów obu sekcji.

## Risks / Trade-offs

- **[Risk] Dwa requesty, krótki desync** → Akceptowalne w MVP; spinner na całej zakładce.
- **[Risk] Licznik nieintuicyjny** → Opis w `description` sekcji monitorowania: „Obywatel nie złożył jeszcze odnowienia w systemie”.
- **[Trade-off] Brak review bar jak w ApplicationDetails** → Szybsza dostawa; strona renewal wystarczy na MVP.

## Migration Plan

1. Zmiana `OfficerDashboard` — usunąć taby `renewals` i `alerts`, dodać `medical`.
2. Ręczny test: officer login → Badania → obie sekcje → approve renewal → alert znika z monitorowania.
3. Brak zmiany API / migracji DB.

## Open Questions

- Czy w **Do weryfikacji** pokazać badge statusu (`Złożone` / `W weryfikacji`) identycznie jak `StatusBadge` na wnioskach? **Domyślnie: tak** — reuse `getApplicationStatusMeta` lub mapowanie renewal status → meta.
