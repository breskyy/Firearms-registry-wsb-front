## Context

- **Dziś:** daty badań na `Permit`; załączniki tylko na `PermitApplication` (wniosek pierwszy). WPA edytuje daty bez plików.
- **Wzorzec do reuse:** upload w `CitizenController.UploadPermitApplicationAttachments` — replace per typ w obrębie jednej sprawy; walidacja PDF/JPG/PNG, max 10 MB.
- **Prawo (PL):** odnowienie = przedłożenie orzeczeń do Policji, nie nowy wniosek o pozwolenie (art. 15 ust. 4 u.o.b.a. dla wybranych celów pozwolenia).

## Goals / Non-Goals

**Goals:**

- Obywatel może złożyć **zgłoszenie odnowienia** dla konkretnego `permitId` z dwoma załącznikami i datami ważności.
- WPA przegląda zgłoszenie, pobiera pliki, **zatwierdza** (daty na pozwoleniu aktualne) lub **odrzuca** (z powodem).
- Jedno **oczekujące** zgłoszenie na pozwolenie naraz; czytelny status po stronie obywatela.
- **Audyt:** historia zgłoszeń i załączników zatwierdzonych/odrzuconych.

**Non-Goals:**

- Wersjonowanie wielu równoległych zgłoszeń pending.
- Automatyczne OCR / walidacja treści orzeczeń.

## Decisions

### 1. Stare vs nowe — co nadpisujemy?

| Warstwa | Decyzja | Uzasadnienie |
|--------|---------|--------------|
| **Daty na `Permit`** | **Nadpisujemy** przy zatwierdzeniu WPA | Jedna „aktualna prawda” dla reguł biznesowych (`medicalExamsValid`, transfery, sklep). |
| **Załączniki (pliki)** | **Nie kasujemy historii** | Każde zgłoszenie odnowienia (`PermitMedicalExamRenewal`) ma własne załączniki; zatwierdzone/odrzucone zgłoszenia zostają w DB do audytu i podglądu WPA. |
| **W obrębie jednego zgłoszenia (draft/pending)** | **Single-shot submit** (dropped from scope) | Korekta po submit przez `reject` z powodem + nowe zgłoszenie. Replace-w-pending wymagałby osobnego widoku „edytuj pending" — out of scope dla MVP. |
| **Alerty medyczne** | Po approve: **rozwiąż** pasujące alerty / przelicz z nowych dat | Status w UI obywatela wraca do `current`. |

**Odpowiedź na pytanie produktowe:** operacyjnie **daty = nadpisanie**; **pliki = historia zgłoszeń**, nie jeden slot „bieżący plik” na pozwoleniu.

### 2. Model danych (backend)

```
Permit (bez zmian struktury plików)
  ├─ medicalExamExpiryDate      ← aktualizowane tylko przy Approved renewal lub WPA override
  └─ psychologicalExamExpiryDate

PermitMedicalExamRenewal (nowe)
  ├─ PermitId, CitizenId
  ├─ Status: Submitted | UnderReview | Approved | Rejected
  ├─ ProposedMedicalExpiryDate, ProposedPsychologicalExpiryDate
  ├─ RejectionReason?, ReviewedAt?, ReviewedByOfficerId?
  └─ Attachments[] (MedicalCertificate | PsychologicalCertificate) — blob jak PermitApplicationAttachment

Unique rule: max jedno Submitted/UnderReview per PermitId
```

### 3. API (szkic)

**Citizen**

- `POST /citizen/me/permits/{permitId}/medical-exam-renewals` — multipart: pliki + daty → `Submitted`
- `GET /citizen/me/permits/{permitId}/medical-exam-renewals` — lista zgłoszeń (historia + pending)
- `GET /citizen/me/medical-exam-renewals` — opcjonalnie agregat dla pulpitu

**WPA**

- `GET /wpa/medical-exam-renewals?status=Submitted` — kolejka
- `GET /wpa/medical-exam-renewals/{id}` — szczegóły + metadane obywatela/pozwolenia
- `GET /wpa/medical-exam-renewals/{id}/attachments/{attachmentId}` — download
- `POST .../{id}/mark-under-review`
- `POST .../{id}/approve` — ustaw daty na `Permit`, status `Approved`, audit
- `POST .../{id}/reject` — `{ reason }`, status `Rejected`

**Zachować:** `PATCH /wpa/permits/{id}/medical-exams` — override bez zgłoszenia (np. dokumenty papierowe).

### 4. UI

- Obywatel: przycisk **„Złóż odnowienie badań”** na karcie pozwolenia w `/medical-alerts` i `/permits/:id` gdy `needsExamAttention`; formularz jak `CertificateUploadRow`.
- WPA: kafelek na dashboardzie (obok alertów) lub sekcja w profilu obywatela; approve/reject jak wnioski o pozwolenie.
- Po approve: ukryj CTA odnowienia; pokaż „Ostatnie zatwierdzone: data”.

### 5. Walidacja

- Daty: wymagane obie; proponowana data ważności **≥ dziś** (obowiątek przy składaniu; WPA może skorygować przy approve jeśli potrzeba).
- Pozwolenie: `Active`; obywatel = właściciel.
- Blokada nowego zgłoszenia gdy istnieje `Submitted`/`UnderReview`.

## Risks / Trade-offs

- **[Risk] Duplikacja logiki uploadu** → Wydziel wspólny helper/storage pattern z `PermitApplicationAttachment`.
- **[Risk] Spec `citizen-medical-view` zakazywał nowych endpointów** → Delta spec jawnie zdejmuje to ograniczenie.
- **[Risk] WPA nadal używa tylko ręcznego PATCH** → UI promuje flow z zgłoszeniem; PATCH w profilu jako „Korekta rejestru (bez zgłoszenia)”.
- **[Trade-off] Historia plików = większa baza** → Akceptowalne w projekcie studenckim; limit rozmiaru jak dziś 10 MB.

## Migration Plan

1. Migracja EF + seed (opcjonalnie jedno demo renewal pending).
2. Deploy backend przed frontem (front obsłuży 404 gracefully krótko).
3. MSW zsynchronizować z kontraktem API.

## Open Questions

- Czy obywatel może składać odnowienie **przed** wygaśnięciem (w oknie „wygasa”)? **Tak** — `expiring` też pokazuje CTA (zgodne z „nie wcześniej niż 3 miesiące przed” w prawie dla cyklicznych badań).
- Czy po **reject** może od razu złożyć nowe? **Tak** — brak pending po reject.
