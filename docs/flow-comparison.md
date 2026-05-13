# Porównanie przepływów: Obecny UI vs Backend API

## 🔴 FLOW 1: Obywatel kupuje broń

### Obecna implementacja UI (NIEPOPRAWNA):
```
1. Citizen → ApplicationForm.tsx
   ↓ Wypełnia pełny formularz (dane osobowe, PESEL, badania medyczne)
   ↓ Załącza pliki PDF
   ↓ Submit
   
2. → alert("Wniosek został złożony! Nr: WNI-2026-001235")
   
3. → CitizenDashboard pokazuje "w trakcie"
   
4. KONIEC (brak dalszego flow)
```

### Prawidłowy flow według API:
```
1. Citizen → Formularz "Wniosek o e-Promesę"
   ↓ Wybiera swoje pozwolenie (GET /me/permits → permitId)
   ↓ Wpisuje requestedWeaponType: "Pistolet sportowy 9mm"
   ↓ Wpisuje requestedQuantity: 1
   ↓ POST /citizen/me/promise-applications
   {
     "permitId": "guid-123",
     "requestedWeaponType": "Pistolet sportowy 9mm",
     "requestedQuantity": 1
   }
   
2. Backend zmienia status: Submitted → Paid (mockowane)
   
3. WpaOfficer → GET /wpa/promise-applications?status=Paid
   ↓ Widzi wniosek na liście
   ↓ POST /wpa/promise-applications/{id}/mark-under-review
   ↓ Weryfikuje dane obywatela (GET /wpa/citizens/{citizenId})
   ↓ DECYZJA:
      - POST /approve → tworzy promesę
      - POST /reject { "reason": "..." }
      - POST /require-correction { "reason": "..." }
   
4. Citizen → GET /me/promises
   ↓ Widzi aktywną promesę z QR tokenem
   ↓ Wyświetla QR kod w aplikacji
   
5. Citizen → Idzie do sklepu, pokazuje QR
   
6. Shop → Skanuje QR (qrToken) LUB wpisuje promiseNumber
   ↓ POST /shop/verify-permit { "qrToken": "xyz..." }
   ↓ Response: isValid, medicalExamsValid, availableSlots, ...
   
7. Shop → Jeśli OK, wypełnia NewSaleDrawer
   ↓ POST /shop/firearms/register-sale
   {
     "qrToken": "xyz...",
     "brand": "Glock",
     "model": "17 Gen 5",
     "category": "B",
     "caliber": "9mm",
     "serialNumber": "ABC123",
     "productionYear": 2024
   }
   ↓ Response: { firearmId, registrationNumber }
   
8. Citizen → GET /me/firearms
   ↓ Widzi nową broń na liście
   ↓ GET /me/firearms/{id} → historia właścicieli
```

---

## 🔴 FLOW 2: Transfer broni między obywatelami

### Obecna implementacja UI:
```
❌ BRAK FUNKCJONALNOŚCI
```

### Prawidłowy flow według API:
```
1. Citizen A (sprzedający) → Widok "Transfer broni"
   ↓ Wybiera swoją broń z listy
   ↓ Wpisuje PESEL kupującego (Citizen B)
   ↓ Wybiera typ transferu: Sale / Donation / Inheritance
   ↓ POST /citizen/me/transfer-requests
   {
     "firearmId": "guid-456",
     "buyerPesel": "98765432101",
     "transferType": "Sale"
   }
   
2. Citizen B → GET /me/transfer-requests
   ↓ Widzi przychodzący transfer (isBuyer=true, status=PendingAcceptance)
   ↓ DECYZJA:
      - POST /transfer-requests/{id}/accept
      - POST /transfer-requests/{id}/reject
   
3. Po akceptacji → status: Accepted → Completed
   
4. Broń zmienia właściciela:
   - Citizen A → status broni: Transferred
   - Citizen B → broń pojawia się na liście firearms
```

---

## 🔴 FLOW 3: Oficer rozpatruje wnioski

### Obecna implementacja UI:
```
1. OfficerDashboard → pokazuje mock statystyki
   
2. Klik "Rozpatrz" → DecisionPage
   ↓ Radio buttons: approve / supplement / reject
   ↓ Textarea: uzasadnienie
   ↓ Submit → alert("Decyzja zapisana")
```

### Prawidłowy flow według API:
```
1. OfficerDashboard → GET /wpa/promise-applications?status=Paid&page=1
   ↓ Lista wniosków z paginacją
   ↓ GET /wpa/medical-alerts?resolved=false
   ↓ Alerty: "Jan Kowalski - badanie psychologiczne wygasa za 7 dni"
   
2. Klik na wniosek → GET /wpa/promise-applications/{id}
   ↓ Szczegóły: citizenName, citizenPesel (pełny!), requestedWeaponType
   ↓ GET /wpa/citizens/{citizenId}
   ↓ Pełny profil: pozwolenia, historia broni, totalFirearms, activeAlerts
   
3. POST /wpa/promise-applications/{id}/mark-under-review
   ↓ Status: Paid → UnderReview
   
4. DecisionPage → 4 opcje:
   a) POST /approve
      → Status: UnderReview → Approved → Active
      → Tworzy promesę z QR tokenem dla obywatela
      
   b) POST /reject { "reason": "Brak aktualnego badania medycznego" }
      → Status: UnderReview → Rejected
      
   c) POST /require-correction { "reason": "Proszę uzupełnić dane kontaktowe" }
      → Status: UnderReview → RequiresCorrection
      
   d) (Obecnie BRAK w UI) - Cofnij do Paid
```

---

## 🔴 FLOW 4: Alerty medyczne (BRAKUJĄCE)

### Obecna implementacja UI:
```
❌ BRAK FUNKCJONALNOŚCI
```

### Prawidłowy flow według API:
```
1. OfficerDashboard → GET /wpa/medical-alerts?resolved=false&page=1
   ↓ Lista alertów:
   
   {
     "medicalAlertType": "MedicalExamExpiring",
     "citizenName": "Jan Kowalski",
     "citizenPesel": "90010112345",
     "expiryDate": "2026-05-20",
     "daysUntilExpiry": 8
   }
   
2. Filtrowanie:
   - MedicalExamExpiring (wkrótce wygasa)
   - PsychologicalExamExpiring
   - MedicalExamExpired (już wygasło!)
   - PsychologicalExamExpired
   
3. Akcje:
   - Klik na alert → GET /wpa/citizens/{id}
   - Wyślij powiadomienie do obywatela
   - Oznacz jako rozwiązane (?resolved=true)
```

---

## 🔴 FLOW 5: Wyszukiwarka broni/obywateli (BRAKUJĄCE)

### Obecna implementacja UI:
```
❌ BRAK FUNKCJONALNOŚCI
```

### Prawidłowy flow według API:
```
=== Wyszukiwarka obywateli ===

GET /wpa/citizens?page=1&pageSize=20
→ Lista wszystkich obywateli (paginowana)

GET /wpa/citizens/{id}
→ Szczegóły:
  - Pełny PESEL (nie maskowany!)
  - Lista pozwoleń (permits[])
  - totalFirearms
  - activeAlerts
  
---

=== Wyszukiwarka broni ===

GET /wpa/firearms?serialNumber=ABC123&page=1
GET /wpa/firearms?pesel=90010112345&page=1
GET /wpa/firearms?permitNumber=POZ-2025-001&page=1
GET /wpa/firearms?permitType=Sport&page=1

Response:
{
  "items": [
    {
      "ownerName": "Jan Kowalski",
      "ownerPesel": "90010112345",
      "permitNumber": "POZ-2025-001",
      "permitType": "Sport",
      "status": "Registered",
      "category": "B",
      "serialNumber": "ABC123",
      ...
    }
  ],
  "totalCount": 1,
  "page": 1,
  ...
}
```

---

## 📊 STATYSTYKA ZGODNOŚCI

| Moduł | Zgodność UI↔API | Priorytet naprawy |
|-------|-----------------|-------------------|
| **Citizen: Dashboard** | 10% (mock data) | 🔴 KRYTYCZNY |
| **Citizen: Formularz promesy** | 0% (zły formularz) | 🔴 KRYTYCZNY |
| **Citizen: Lista broni** | 20% (mock) | 🟠 WYSOKI |
| **Citizen: Promesa z QR** | 0% (brak) | 🔴 KRYTYCZNY |
| **Citizen: Transfer broni** | 0% (brak) | 🟠 WYSOKI |
| **Shop: Weryfikacja** | 40% (brak QR) | 🔴 KRYTYCZNY |
| **Shop: Sprzedaż** | 50% (błędne pola) | 🔴 KRYTYCZNY |
| **Officer: Dashboard** | 10% (mock) | 🟡 ŚREDNI |
| **Officer: Alerty medyczne** | 0% (brak) | 🟠 WYSOKI |
| **Officer: Decyzje** | 60% (brak 1 akcji) | 🟡 ŚREDNI |
| **Officer: Wyszukiwarki** | 0% (brak) | 🟠 WYSOKI |
| **Paginacja globalna** | 0% (brak) | 🟠 WYSOKI |

---

## ✅ NAJBARDZIEJ PILNE DO NAPRAWY

### 1. QR Token (BLOKUJĄCE!)
Bez tego sklepy nie mogą rejestrować sprzedaży.

**Trzeba:**
- Dodać `qrToken` w NewSaleDrawer (pole hidden z state)
- Dodać `qrToken` w ShopVerification (opcja skanowania)
- Wyświetlać QR kod w widoku promesy obywatela

### 2. Formularz promesy (BLOKUJĄCE!)
Obecny ApplicationForm.tsx jest bezużyteczny.

**Trzeba:**
- Przepisać na 3-polowy formularz: permitId + requestedWeaponType + requestedQuantity
- Dropdown wyboru pozwolenia (GET /me/permits)
- Usunąć wszystkie pola osobowe

### 3. Category broni (BLOKUJĄCE!)
API wymaga pola `category` (A/B/C), UI go nie wysyła.

**Trzeba:**
- Dodać dropdown w NewSaleDrawer: `<Select> <SelectItem value="A">Kategoria A</SelectItem> ...`

### 4. Integracja API (BLOKUJĄCE!)
Wszystko to mock data.

**Trzeba:**
- Utworzyć `/src/services/api.ts`
- Dodać axios + JWT interceptor
- Podmienić wszystkie `mockData` na `await api.get(...)`

---

## 🎯 REKOMENDOWANY PLAN

**Tydzień 1:**
- Integracja API (auth, services, typy)
- Naprawa formularza promesy
- Dodanie QR token do sklepu

**Tydzień 2:**
- Paginacja
- Alerty medyczne WPA
- Wyszukiwarki WPA

**Tydzień 3:**
- Moduł transferu broni
- Historia właścicieli
- Testy E2E całego flow
