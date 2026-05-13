# EWeaponRegistry — API Flows dla Frontendu

System cyfrowej rejestracji broni palnej. Backend: .NET/C#, auth: JWT Bearer (HS256).

---

## Role w systemie

| Rola | Opis |
|------|------|
| `Citizen` | Obywatel — właściciel broni |
| `Shop` | Sklep/dealer broni |
| `WpaOfficer` | Urzędnik Wydziału Pozwoleń na Broń |

---

## Autoryzacja

```
POST /api/v1/auth/login
Body: { "email": "...", "password": "..." }
Response: { "token": "...", "expiresAt": "...", "user": { "id", "email", "role", "isActive" } }
```

```
GET /api/v1/auth/me   (wymaga tokenu)
Response: { "id", "email", "role", "isActive" }
```

Token JWT przekazywany jako `Authorization: Bearer <token>`.

---

## Citizen

### Profil i dane

| Metoda | Endpoint | Opis |
|--------|----------|------|
| `GET` | `/api/v1/citizen/me` | Profil obywatela (dane osobowe, PESEL maskowany — ostatnie 4 cyfry) |
| `GET` | `/api/v1/citizen/me/permits` | Lista pozwoleń |
| `GET` | `/api/v1/citizen/me/firearms` | Lista zarejestrowanej broni |
| `GET` | `/api/v1/citizen/me/firearms/{id}` | Szczegóły broni + historia właścicieli |

**PermitDto** — kluczowe pola:
- `permitType`: Sport, Collection, Protection, Hunting, Other
- `permitStatus`: Active, Suspended, Revoked, Expired
- `maxFirearms`, `usedSlots`, `availableSlots`, `isValid`
- `medicalExamExpiryDate`, `psychologicalExamExpiryDate`

**FirearmDto** — kluczowe pola:
- `category`: A, B, C
- `status`: Registered, Transferred, Lost, Archived

### E-Promesy

| Metoda | Endpoint | Opis |
|--------|----------|------|
| `GET` | `/api/v1/citizen/me/promise-applications` | Lista złożonych wniosków o promesę |
| `POST` | `/api/v1/citizen/me/promise-applications` | Złóż nowy wniosek |
| `GET` | `/api/v1/citizen/me/promises` | Lista aktywnych promesów (zawierają QR token) |

**POST promise-applications — body:**
```json
{
  "permitId": "guid",
  "requestedWeaponType": "string (max 100)",
  "requestedQuantity": 1
}
```

**PromiseApplicationDto** — statusy:
`Submitted → Paid → UnderReview → Approved / Rejected / RequiresCorrection`

**PromiseDto** — kluczowe pola:
- `qrToken` — używany w sklepie do weryfikacji
- `promiseStatus`: Draft, Submitted, Paid, UnderReview, Approved, Rejected, Active, Used, Expired
- `paymentStatus`: Pending, Paid, Refunded, Overdue
- `remainingQuantity`, `expiryDate`, `isValid`

### Transfer broni

| Metoda | Endpoint | Opis |
|--------|----------|------|
| `GET` | `/api/v1/citizen/me/transfer-requests` | Lista transferów (jako sprzedający i kupujący) |
| `POST` | `/api/v1/citizen/me/transfer-requests` | Inicjuj transfer |
| `POST` | `/api/v1/citizen/me/transfer-requests/{id}/accept` | Akceptuj przychodzący transfer |
| `POST` | `/api/v1/citizen/me/transfer-requests/{id}/reject` | Odrzuć przychodzący transfer |

**POST transfer-requests — body:**
```json
{
  "firearmId": "guid",
  "buyerPesel": "12345678901",
  "transferType": "Sale"
}
```

`transferType`: Sale, Donation, Inheritance, AdministrativeCorrection

**TransferRequestDto** — statusy:
`PendingAcceptance → Accepted → Completed`
`PendingAcceptance → Rejected / Cancelled`

Pole `isSeller` / `isBuyer` pozwala rozróżnić stronę w UI.

### Typowy flow Citizen

```
1. Login
2. Sprawdź pozwolenia (/me/permits) — weryfikuj dostępne sloty i daty badań
3. Złóż wniosek o promesę (/me/promise-applications POST)
4. Czekaj na status Approved (WPA musi zatwierdzić)
5. Odbierz aktywną promesę z QR tokenem (/me/promises)
6. Idź do sklepu — sklep skanuje QR i rejestruje broń
7. Broń pojawia się na liście (/me/firearms)

Sprzedaż broni:
1. POST /me/transfer-requests (podajesz PESEL kupującego)
2. Kupujący widzi transfer i akceptuje/odrzuca
3. Po akceptacji transfer przechodzi do Completed
```

---

## Shop

### Endpointy

| Metoda | Endpoint | Opis |
|--------|----------|------|
| `POST` | `/api/v1/shop/verify-permit` | Weryfikacja kupującego na podstawie QR tokenu lub numeru promesy |
| `POST` | `/api/v1/shop/firearms/register-sale` | Rejestracja sprzedaży broni (operacja atomowa) |

**POST verify-permit — body:**
```json
{
  "qrToken": "string",
  "promiseNumber": "string"
}
```
*(co najmniej jedno z dwóch)*

**VerifyPermitResponse:**
```json
{
  "isValid": true,
  "message": "string",
  "citizenName": "string",
  "permitNumber": "string",
  "permitType": "string",
  "availableSlots": 2,
  "weaponType": "string",
  "remainingPromiseQuantity": 1,
  "promiseExpiryDate": "datetime",
  "medicalExamsValid": true
}
```

**POST register-sale — body:**
```json
{
  "qrToken": "string",
  "brand": "string (max 100)",
  "model": "string (max 100)",
  "category": "B",
  "caliber": "string (max 50)",
  "serialNumber": "string (max 100)",
  "productionYear": 2020
}
```

**RegisterSaleResponse:**
```json
{
  "success": true,
  "message": "string",
  "firearmId": "guid",
  "registrationNumber": "string"
}
```

### Typowy flow Shop

```
1. Login
2. Klient podaje QR kod lub numer promesy
3. POST /verify-permit → sprawdź isValid, medicalExamsValid, availableSlots
4. Jeśli OK → POST /register-sale z danymi broni
5. Broń zostaje przypisana do obywatela, promesa oznaczona jako użyta
```

---

## WpaOfficer

### Wgląd w dane

| Metoda | Endpoint | Query params | Opis |
|--------|----------|-------------|------|
| `GET` | `/api/v1/wpa/citizens` | `page`, `pageSize` | Lista obywateli (paginacja) |
| `GET` | `/api/v1/wpa/citizens/{id}` | — | Szczegóły obywatela z pozwoleniami |
| `GET` | `/api/v1/wpa/firearms` | `serialNumber`, `pesel`, `permitNumber`, `permitType`, `page`, `pageSize` | Wyszukiwarka broni |

**WpaCitizenDto** zawiera pełny PESEL (nie maskowany), listę pozwoleń, `totalFirearms`, `activeAlerts`.

**WpaFirearmSearchResult:** `ownerName`, `ownerPesel`, `permitNumber`, `permitType`, `status`, `category`.

### Obsługa wniosków o promesę

| Metoda | Endpoint | Opis |
|--------|----------|------|
| `GET` | `/api/v1/wpa/promise-applications` | Lista wniosków (filtr: `status`, paginacja) |
| `GET` | `/api/v1/wpa/promise-applications/{id}` | Szczegóły wniosku |
| `POST` | `/api/v1/wpa/promise-applications/{id}/mark-under-review` | Oznacz jako w trakcie rozpatrzenia |
| `POST` | `/api/v1/wpa/promise-applications/{id}/approve` | Zatwierdź (tworzy aktywną promesę) |
| `POST` | `/api/v1/wpa/promise-applications/{id}/reject` | Odrzuć — body: `{ "reason": "..." }` |
| `POST` | `/api/v1/wpa/promise-applications/{id}/require-correction` | Wymagana korekta — body: `{ "reason": "..." }` |

**WpaPromiseApplicationDto** — dodatkowe pola vs Citizen: `citizenName`, `citizenPesel`, `permitType`, `reviewedByOfficerName`.

### Alerty medyczne

| Metoda | Endpoint | Query params | Opis |
|--------|----------|-------------|------|
| `GET` | `/api/v1/wpa/medical-alerts` | `resolved` (bool), `page`, `pageSize` | Lista alertów o badaniach |

`medicalAlertType`: MedicalExamExpiring, PsychologicalExamExpiring, MedicalExamExpired, PsychologicalExamExpired

### Typowy flow WpaOfficer

```
1. Login
2. Dashboard: sprawdź alerty medyczne (/medical-alerts?resolved=false)
3. Kolejka wniosków (/promise-applications?status=Paid)
4. Otwórz wniosek → mark-under-review
5. Zweryfikuj dane obywatela (/citizens/{id})
6. Zatwierdź / odrzuć / zażądaj korekty
```

---

## Cykl życia wniosku o promesę

```
Submitted
    ↓ (opłata — mockowana)
Paid
    ↓ (WPA)
UnderReview
    ↓              ↓              ↓
Approved     Rejected    RequiresCorrection
    ↓
Active
    ↓              ↓
Used           Expired
```

---

## Paginacja

Wszystkie listy WPA i `/me` zwracają `PaginatedResult<T>`:

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

Query params: `page` (domyślnie 1), `pageSize` (domyślnie 10, max 100).

---

## Uwagi dla frontendu

- **Payment jest mockowany** — Citizen nie ma endpointu do opłacenia wniosku. Status `Paid` jest ustawiany automatycznie/przez admina. Nie buduj strony płatności.
- **PESEL**: Citizen widzi tylko ostatnie 4 cyfry (`peselMasked`). WpaOfficer widzi pełny PESEL.
- **QR token** jest w `PromiseDto` po zatwierdzeniu promesy — Citizen powinien móc go wyświetlić/skopiować.
- **TransferRequest** — pole `isSeller` / `isBuyer` w DTO pozwala w jednym widoku rozróżnić oczekujące transfery do akceptacji (isBuyer=true, status=PendingAcceptance).
- **Health check**: `GET /api/v1/health` — publiczny, bez tokenu.
