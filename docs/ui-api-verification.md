# Weryfikacja zgodności UI z Backend API

Data weryfikacji: 2026-05-12

## Podsumowanie wykonawcze

### Stan ogólny: ⚠️ **CZĘŚCIOWA ZGODNOŚĆ - WYMAGA AKTUALIZACJI**

UI jest zbudowane na mockowanych danych i **NIE** jest obecnie zintegrowane z rzeczywistymi endpointami API. Wymagana jest pełna implementacja warstwy komunikacji z backendem.

---

## 1. CITIZEN - Panel obywatela

### 1.1 Dashboard (CitizenDashboard.tsx)

| Element UI | Endpoint API | Status | Uwagi |
|------------|--------------|--------|-------|
| Dane pozwolenia | `GET /api/v1/citizen/me/permits` | ❌ BRAK | Używa mockowanych danych |
| Lista wniosków | `GET /api/v1/citizen/me/promise-applications` | ❌ BRAK | Pokazuje tylko mock |
| Lista broni | `GET /api/v1/citizen/me/firearms` | ❌ BRAK | Brak integracji |
| Promesy | `GET /api/v1/citizen/me/promises` | ❌ BRAK | Brak widoku promes z QR |

**Rozbieżności koncepcyjne:**
- UI nazywa wszystko "wnioskami", API rozróżnia **promise-applications** (wnioski o promesę) i **permits** (pozwolenia)
- Brak wyświetlania aktywnych **promes z QR tokenem** - kluczowe dla flow sklepu!
- Brak wyświetlania `availableSlots`, `medicalExamExpiryDate`, `psychologicalExamExpiryDate`

### 1.2 Formularz wniosku (ApplicationForm.tsx)

**KRYTYCZNA ROZBIEŻNOŚĆ FUNKCJONALNA:**

UI implementuje: "Wniosek o pozwolenie na broń" (pełny formularz z danymi osobowymi, badaniami medycznymi)

API oczekuje: Tylko `POST /api/v1/citizen/me/promise-applications` z body:
```json
{
  "permitId": "guid",
  "requestedWeaponType": "string (max 100)",
  "requestedQuantity": 1
}
```

**Wnioski:**
- ❌ Formularz w UI nie odpowiada żadnemu endpointowi API!
- ❌ API zakłada, że obywatel **już ma pozwolenie** (permitId) i wnioskuje tylko o promesę na zakup
- Brak endpointu do składania wniosku o **pierwsze pozwolenie**
- Prawdopodobnie proces wydawania pierwszych pozwoleń jest poza zakresem obecnego API

**Zalecane działanie:**
1. Zmienić formularz na "Wniosek o e-Promesę" zgodnie z API
2. Dodać dropdown wyboru istniejącego pozwolenia (permitId)
3. Usunąć pola: dane osobowe, PESEL, adres, dokumenty medyczne (już są w systemie)
4. Pole `weaponType` → `requestedWeaponType` (max 100 znaków)
5. Dodać `requestedQuantity`

### 1.3 WeaponRegistry.tsx

| Element UI | Endpoint API | Status | Uwagi |
|------------|--------------|--------|-------|
| Lista broni | `GET /api/v1/citizen/me/firearms` | ❌ BRAK | Mock data |
| Szczegóły broni | `GET /api/v1/citizen/me/firearms/{id}` | ❌ BRAK | API zwraca historię właścicieli |

**Rozbieżności pól:**
- UI: `id`, `manufacturer`, `model`, `caliber`, `serialNumber`, `registrationDate`, `status`, `permitNumber`
- API DTO: `category` (A/B/C), `status` (Registered/Transferred/Lost/Archived)

❌ Brak pola `category` w UI
❌ UI pokazuje custom status ("aktywna"), API używa enum (Registered, Transferred, Lost, Archived)

### 1.4 Transfer broni

**CAŁKOWICIE BRAKUJĄCA FUNKCJONALNOŚĆ:**

API oferuje:
- `GET /me/transfer-requests` - lista transferów
- `POST /me/transfer-requests` - inicjuj transfer (sprzedaż/darowizna)
- `POST /me/transfer-requests/{id}/accept` - akceptuj
- `POST /me/transfer-requests/{id}/reject` - odrzuć

UI: **Brak jakiejkolwiek implementacji**

---

## 2. SHOP - Panel sklepu

### 2.1 ShopDashboard.tsx

| Element UI | Endpoint API | Status |
|------------|--------------|--------|
| Statystyki sprzedaży | Brak w API | ⚠️ Mock |
| Historia sprzedaży | Brak w API | ⚠️ Mock |

**Uwaga:** API Shop nie oferuje endpointu do pobierania historii sprzedaży! Tylko weryfikacja i rejestracja.

### 2.2 ShopVerification.tsx

| Element UI | Endpoint API | Status | Uwagi |
|------------|--------------|--------|-------|
| Weryfikacja promesy | `POST /api/v1/shop/verify-permit` | ⚠️ CZĘŚCIOWE | Body i response różnią się |

**Rozbieżności:**

UI przyjmuje tylko:
```typescript
promesaNumber: string
```

API oczekuje:
```json
{
  "qrToken": "string",
  "promiseNumber": "string"
}
```
(co najmniej jedno z dwóch)

**Brakujące elementy w UI:**
- ❌ Obsługa skanowania QR kodu (`qrToken`)
- ❌ Wyświetlanie `medicalExamsValid` z response
- ❌ Wyświetlanie `remainingPromiseQuantity`
- ❌ Wyświetlanie `promiseExpiryDate`

### 2.3 NewSaleDrawer.tsx

| Element UI | Endpoint API | Status | Uwagi |
|------------|--------------|--------|-------|
| Rejestracja sprzedaży | `POST /api/v1/shop/firearms/register-sale` | ⚠️ CZĘŚCIOWE | Różnice w polach |

**Mapowanie pól:**

| UI | API | Status |
|----|-----|--------|
| `promesaNumber` | — | ❌ NIEPOTRZEBNE w API |
| `pesel` | — | ❌ NIEPOTRZEBNE |
| `customerName` | — | ❌ NIEPOTRZEBNE |
| `manufacturer` | `brand` | ⚠️ NAZWA RÓŻNA |
| `model` | `model` | ✅ OK |
| `caliber` | `caliber` | ✅ OK |
| `serialNumber` | `serialNumber` | ✅ OK |
| `productionYear` | `productionYear` | ✅ OK |
| `invoiceNumber` | — | ❌ BRAK W API |
| `saleDate` | — | ❌ BRAK W API |
| — | `qrToken` | ❌ BRAK W UI (WYMAGANE!) |
| — | `category` | ❌ BRAK W UI (WYMAGANE - B/A/C) |

**KRYTYCZNE BŁĘDY:**
1. ❌ UI nie wysyła **qrToken** - jest to wymagane pole!
2. ❌ UI nie wysyła **category** (kategoria broni: A, B, C)
3. ❌ UI zbiera niepotrzebne pola (PESEL, customerName) - API ich nie potrzebuje
4. ⚠️ Pole `manufacturer` → powinno być `brand`

**RegisterSaleResponse z API:**
```json
{
  "success": true,
  "message": "string",
  "firearmId": "guid",
  "registrationNumber": "string"
}
```

UI wyświetla toast z generowanym numerem, ale nie wykorzystuje prawdziwych danych z response.

---

## 3. WPA OFFICER - Panel urzędnika

### 3.1 OfficerDashboard.tsx

| Element UI | Endpoint API | Status |
|------------|--------------|--------|
| Statystyki | — | ❌ Mock |
| Lista wniosków | `GET /api/v1/wpa/promise-applications` | ❌ BRAK |
| Alerty medyczne | `GET /api/v1/wpa/medical-alerts` | ❌ CAŁKOWICIE BRAKUJĄCE |

**Brakujące funkcjonalności:**
- ❌ Dashboard nie pokazuje alertów medycznych (MedicalExamExpiring, PsychologicalExamExpired etc.)
- ❌ Brak filtrowania wniosków po statusie (Paid, UnderReview, Approved, Rejected)

### 3.2 DecisionPage.tsx

**ZNACZĄCA ROZBIEŻNOŚĆ:**

UI oferuje 3 akcje:
1. Zatwierdź (`approve`)
2. Wezwij do uzupełnienia (`supplement`)
3. Odrzuć (`reject`)

API oferuje 4 endpointy:
1. `POST /wpa/promise-applications/{id}/mark-under-review`
2. `POST /wpa/promise-applications/{id}/approve`
3. `POST /wpa/promise-applications/{id}/reject` - body: `{ "reason": "..." }`
4. `POST /wpa/promise-applications/{id}/require-correction` - body: `{ "reason": "..." }`

**Mapowanie:**
- ✅ `approve` → `/approve` - OK
- ⚠️ `reject` → `/reject` - OK, ale wymaga `reason` w body
- ⚠️ `supplement` → `/require-correction` - OK, ale wymaga `reason` w body
- ❌ **Brak przycisku "Oznacz jako w trakcie rozpatrzenia"** (`mark-under-review`)

### 3.3 ApplicationDetails.tsx

**BRAK W PROJEKCIE** - plik nie został przeczytany, ale routing istnieje: `/applications/:id`

Powinien wywoływać:
- `GET /api/v1/wpa/promise-applications/{id}` (dla oficera)
- `GET /api/v1/citizen/me/promise-applications` (dla obywatela - brak dedykowanego endpointu dla pojedynczego!)

### 3.4 Wyszukiwarka broni i obywateli

**CAŁKOWICIE BRAKUJĄCA FUNKCJONALNOŚĆ:**

API WPA oferuje:
- `GET /api/v1/wpa/citizens` (paginacja)
- `GET /api/v1/wpa/citizens/{id}` (szczegóły + pozwolenia)
- `GET /api/v1/wpa/firearms` (query: serialNumber, pesel, permitNumber, permitType, paginacja)

UI: **Brak jakiejkolwiek wyszukiwarki**

---

## 4. AUTORYZACJA

### LoginPage.tsx

Prawdopodobnie wywołuje `POST /api/v1/auth/login`, ale nie zweryfikowano kodu.

**Brakujące:**
- ❌ Wywołanie `GET /api/v1/auth/me` po zalogowaniu
- ❌ Obsługa tokenu JWT w nagłówkach (`Authorization: Bearer <token>`)
- ❌ Zapisywanie `expiresAt` i odświeżanie sesji

---

## 5. PAGINACJA

**Status:** ❌ **BRAK IMPLEMENTACJI**

API zwraca:
```json
{
  "items": [...],
  "totalCount": 50,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

Wszystkie listy w UI (ApplicationsList, WeaponRegistry, OfficerDashboard) używają prostych array bez paginacji.

**Wymagane:**
- Dodać komponenty paginacji
- Obsłużyć query params `page` i `pageSize`
- Pokazywać informacje o liczbie stron

---

## 6. STATUSY I ENUMERATORY

### 6.1 PermitType (rodzaje pozwoleń)

| API | UI (ApplicationForm) |
|-----|----------------------|
| Sport | "sport" (Pozwolenie na broń sportową) ✅ |
| Collection | "collecting" ⚠️ (powinno być "collection") |
| Protection | "protection" ✅ |
| Hunting | "hunting" ✅ (Pozwolenie na broń myśliwską) |
| Other | ❌ Brak |

### 6.2 PromiseStatus

API: `Draft, Submitted, Paid, UnderReview, Approved, Rejected, Active, Used, Expired`

UI: Używa uproszczonych statusów po polsku:
- "w trakcie"
- "zaakceptowany"
- "odrzucony"

❌ Brak mapowania na dokładne statusy API!

### 6.3 FirearmCategory

API: `A, B, C`

UI: **Brak pola category w NewSaleDrawer i WeaponRegistry**

### 6.4 TransferType

API: `Sale, Donation, Inheritance, AdministrativeCorrection`

UI: **Funkcjonalność transferu w ogóle nie istnieje**

---

## 7. KLUCZOWE BRAKUJĄCE FUNKCJONALNOŚCI

### Obywatel:
1. ❌ **Wyświetlanie aktywnych promes z QR tokenem** (`GET /me/promises`)
2. ❌ **Transfer/sprzedaż broni** (cały moduł)
3. ❌ Wyświetlanie dat ważności badań medycznych i psychologicznych
4. ❌ Wyświetlanie dostępnych slotów (`availableSlots`, `usedSlots`, `maxFirearms`)
5. ❌ Historia właścicieli broni (`GET /me/firearms/{id}`)

### Sklep:
6. ❌ **Obsługa skanowania QR kodu** w weryfikacji i sprzedaży
7. ❌ Wysyłanie `qrToken` przy rejestracji sprzedaży
8. ❌ Wysyłanie `category` broni przy rejestracji
9. ❌ Wyświetlanie `medicalExamsValid`, `remainingPromiseQuantity` po weryfikacji

### Oficer:
10. ❌ **Dashboard z alertami medycznymi** (`GET /wpa/medical-alerts`)
11. ❌ Akcja "Oznacz jako w trakcie rozpatrzenia"
12. ❌ **Wyszukiwarka obywateli** (`GET /wpa/citizens`)
13. ❌ **Wyszukiwarka broni** (`GET /wpa/firearms`)
14. ❌ Widok szczegółów obywatela z pełnym PESEL (`GET /wpa/citizens/{id}`)
15. ❌ Filtrowanie wniosków po statusie (Paid, UnderReview, etc.)

### Globalne:
16. ❌ **Paginacja** we wszystkich listach
17. ❌ **Integracja z prawdziwym API** - wszystkie komponenty używają mock data
18. ❌ Obsługa błędów API i komunikatów
19. ❌ Loading states podczas wywołań API

---

## 8. ZALECENIA IMPLEMENTACYJNE

### Priorytet 1 - KRYTYCZNE (bez tego system nie działa):
1. **Utworzyć warstwę API service** (axios/fetch) z obsługą JWT
2. **Zaimplementować POST /citizen/me/promise-applications** - poprawny formularz promesy
3. **Dodać pole `qrToken` w NewSaleDrawer** i POST /shop/firearms/register-sale
4. **Dodać pole `category` (A/B/C)** w NewSaleDrawer
5. **Zaimplementować wyświetlanie promes z QR** (`GET /me/promises`)
6. **Poprawić mapowanie pól** manufacturer→brand w formularzu sklepu

### Priorytet 2 - WYSOKIE (istotne funkcjonalności):
7. Dodać moduł transferu broni dla obywatela
8. Zaimplementować alerty medyczne na dashboardzie oficera
9. Dodać wyszukiwarkę obywateli i broni dla WPA
10. Dodać paginację do wszystkich list
11. Poprawić mapowanie statusów (API enum → UI)

### Priorytet 3 - ŚREDNIE:
12. Wyświetlać availableSlots, daty badań medycznych
13. Historia właścicieli broni
14. Akcja "mark-under-review" dla oficera
15. Dodać widok szczegółów pojedynczego wniosku (ApplicationDetails)

---

## 9. PODSUMOWANIE TECHNICZNE

### Co działa dobrze:
✅ UX/UI zgodne z wytycznymi mObywatel 2.0  
✅ Struktura komponentów i routing  
✅ Drawer zamiast podstron (zgodnie z wymaganiami)  
✅ Toasty po akcjach  
✅ Responsive design  

### Co wymaga naprawy:
❌ **Całkowity brak integracji z API** - wszystko to mock data  
❌ **Formularz wniosku nie odpowiada strukturze API**  
❌ **Brakujące kluczowe funkcje** (QR, transfery, alerty medyczne)  
❌ **Niepoprawne mapowanie pól** (manufacturer/brand, brak category)  
❌ **Brak paginacji**  

---

## 10. PLAN DZIAŁANIA

### Krok 1: Architektura komunikacji
- [ ] Utworzyć `/src/services/api.ts` z axios + JWT interceptory
- [ ] Utworzyć `/src/services/` dla każdej roli: `citizenService.ts`, `shopService.ts`, `wpaService.ts`
- [ ] Dodać `.env` z `VITE_API_BASE_URL`

### Krok 2: Typy TypeScript
- [ ] Utworzyć `/src/types/api.ts` z interfejsami dla wszystkich DTO z dokumentacji

### Krok 3: Citizen
- [ ] Podmienić mock data w CitizenDashboard na API calls
- [ ] Przepisać ApplicationForm na PromiseApplicationForm
- [ ] Dodać widok Promesy z QR kodem
- [ ] Zaimplementować moduł transferów

### Krok 4: Shop
- [ ] Dodać skanowanie QR w ShopVerification i NewSaleDrawer
- [ ] Poprawić pola formularza (qrToken, category, brand)
- [ ] Połączyć z prawdziwym API

### Krok 5: WPA
- [ ] Dodać dashboard alertów medycznych
- [ ] Zaimplementować wyszukiwarki
- [ ] Poprawić DecisionPage (wszystkie 4 akcje)
- [ ] Dodać paginację

### Krok 6: Testy
- [ ] Przetestować pełny flow: login → złóż wniosek → WPA zatwierdza → promesa z QR → sklep weryfikuje QR → sprzedaż → broń w rejestrze
