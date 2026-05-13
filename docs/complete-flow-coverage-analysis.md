# Analiza pokrycia: UI ↔ Backend Flow

Data: 2026-05-12  
Dokument bazowy: `firearms-workflow.md`

---

## 📊 MATRYCA POKRYCIA FUNKCJONALNOŚCI

| # | Funkcjonalność (Backend Flow) | Endpoint API | UI Component | Status | Priorytet |
|---|-------------------------------|--------------|--------------|--------|-----------|
| **1. REJESTRACJA I LOGIN** |
| 1.1 | Login do systemu | `POST /auth/login` | `LoginPage.tsx` | ⚠️ CZĘŚCIOWE | 🔴 KRYTYCZNY |
| 1.2 | Sprawdzenie sesji | `GET /auth/me` | — | ❌ BRAK | 🟡 ŚREDNI |
| **2. CITIZEN: WNIOSEK O POZWOLENIE** |
| 2.1 | Złożenie wniosku o pozwolenie | `POST /citizen/me/permit-applications` | `ApplicationForm.tsx` | ⚠️ CZĘŚCIOWE | 🔴 KRYTYCZNY |
| 2.2 | Lista moich wniosków o pozwolenie | `GET /citizen/me/permit-applications` | — | ❌ BRAK | 🟠 WYSOKI |
| 2.3 | Szczegóły wniosku | `GET /citizen/me/permit-applications/{id}` | — | ❌ BRAK | 🟡 ŚREDNI |
| **3. WPA: ROZPATRYWANIE WNIOSKÓW O POZWOLENIE** |
| 3.1 | Lista wniosków o pozwolenie | `GET /wpa/permit-applications?status=` | — | ❌ BRAK | 🔴 KRYTYCZNY |
| 3.2 | Szczegóły wniosku | `GET /wpa/permit-applications/{id}` | — | ❌ BRAK | 🔴 KRYTYCZNY |
| 3.3 | Oznacz jako w trakcie | `POST /wpa/permit-applications/{id}/mark-under-review` | — | ❌ BRAK | 🟡 ŚREDNI |
| 3.4 | Zatwierdź wniosek | `POST /wpa/permit-applications/{id}/approve` | — | ❌ BRAK | 🔴 KRYTYCZNY |
| 3.5 | Wezwij do korekty | `POST /wpa/permit-applications/{id}/require-correction` | — | ❌ BRAK | 🟠 WYSOKI |
| 3.6 | Odrzuć wniosek | `POST /wpa/permit-applications/{id}/reject` | — | ❌ BRAK | 🟠 WYSOKI |
| **4. CITIZEN: SPRAWDZANIE POZWOLEŃ** |
| 4.1 | Lista moich pozwoleń | `GET /citizen/me/permits` | `CitizenDashboard.tsx` | ⚠️ MOCK DATA | 🔴 KRYTYCZNY |
| 4.2 | Wyświetlanie availableSlots | — | — | ❌ BRAK | 🟠 WYSOKI |
| 4.3 | Wyświetlanie dat badań | — | — | ❌ BRAK | 🟠 WYSOKI |
| **5. CITIZEN: WNIOSEK O E-PROMESĘ** |
| 5.1 | Złożenie wniosku o promesę | `POST /citizen/me/promise-applications` | `ApplicationForm.tsx` | ❌ ZŁY FORMULARZ | 🔴 KRYTYCZNY |
| 5.2 | Lista moich wniosków o promesę | `GET /citizen/me/promise-applications` | `ApplicationsList.tsx` | ⚠️ MOCK DATA | 🟠 WYSOKI |
| **6. WPA: ROZPATRYWANIE WNIOSKÓW O PROMESĘ** |
| 6.1 | Lista wniosków o promesę | `GET /wpa/promise-applications?status=Paid` | `OfficerDashboard.tsx` | ⚠️ MOCK DATA | 🔴 KRYTYCZNY |
| 6.2 | Szczegóły wniosku | `GET /wpa/promise-applications/{id}` | `ApplicationDetails.tsx` | ⚠️ NIEZWERYFIKOWANY | 🟠 WYSOKI |
| 6.3 | Oznacz jako w trakcie | `POST /wpa/promise-applications/{id}/mark-under-review` | — | ❌ BRAK | 🟡 ŚREDNI |
| 6.4 | Zatwierdź (tworzy promesę) | `POST /wpa/promise-applications/{id}/approve` | `DecisionPage.tsx` | ⚠️ CZĘŚCIOWE | 🟠 WYSOKI |
| 6.5 | Wezwij do korekty | `POST /wpa/promise-applications/{id}/require-correction` | `DecisionPage.tsx` | ⚠️ CZĘŚCIOWE | 🟠 WYSOKI |
| 6.6 | Odrzuć | `POST /wpa/promise-applications/{id}/reject` | `DecisionPage.tsx` | ⚠️ CZĘŚCIOWE | 🟠 WYSOKI |
| **7. CITIZEN: PROMESA Z QR** |
| 7.1 | Lista moich promes | `GET /citizen/me/promises` | — | ❌ BRAK | 🔴 KRYTYCZNY |
| 7.2 | Wyświetlanie QR kodu | — | — | ❌ BRAK | 🔴 KRYTYCZNY |
| 7.3 | Wyświetlanie expiryDate | — | — | ❌ BRAK | 🟠 WYSOKI |
| 7.4 | Wyświetlanie remainingQuantity | — | — | ❌ BRAK | 🟡 ŚREDNI |
| **8. SHOP: SPRZEDAŻ** |
| 8.1 | Weryfikacja promesy (QR) | `POST /shop/verify-permit` | `ShopVerification.tsx` | ⚠️ BRAK QR | 🔴 KRYTYCZNY |
| 8.2 | Rejestracja sprzedaży | `POST /shop/firearms/register-sale` | `NewSaleDrawer.tsx` | ⚠️ BŁĘDNE POLA | 🔴 KRYTYCZNY |
| **9. CITIZEN: REJESTR BRONI** |
| 9.1 | Lista mojej broni | `GET /citizen/me/firearms` | `WeaponRegistry.tsx` | ⚠️ MOCK DATA | 🟠 WYSOKI |
| 9.2 | Szczegóły + historia | `GET /citizen/me/firearms/{id}` | — | ❌ BRAK | 🟡 ŚREDNI |
| **10. CITIZEN: TRANSFER BRONI** |
| 10.1 | Inicjuj transfer | `POST /citizen/me/transfer-requests` | — | ❌ BRAK | 🟠 WYSOKI |
| 10.2 | Lista transferów | `GET /citizen/me/transfer-requests` | — | ❌ BRAK | 🟠 WYSOKI |
| 10.3 | Akceptuj transfer | `POST /citizen/me/transfer-requests/{id}/accept` | — | ❌ BRAK | 🟠 WYSOKI |
| 10.4 | Odrzuć transfer | `POST /citizen/me/transfer-requests/{id}/reject` | — | ❌ BRAK | 🟠 WYSOKI |
| **11. CITIZEN: ZGŁOSZENIE UTRATY** |
| 11.1 | Zgłoś utratę/kradzież | `POST /citizen/me/firearms/{id}/report-lost` | — | ❌ BRAK | 🟡 ŚREDNI |
| **12. ALERTY MEDYCZNE** |
| 12.1 | Citizen: moje alerty | `GET /citizen/me/medical-alerts` | — | ❌ BRAK | 🟠 WYSOKI |
| 12.2 | WPA: wszystkie alerty | `GET /wpa/medical-alerts?resolved=false` | — | ❌ BRAK | 🟠 WYSOKI |
| **13. WPA: ZARZĄDZANIE** |
| 13.1 | Lista obywateli | `GET /wpa/citizens` | — | ❌ BRAK | 🟠 WYSOKI |
| 13.2 | Szczegóły obywatela | `GET /wpa/citizens/{id}` | — | ❌ BRAK | 🟠 WYSOKI |
| 13.3 | Wyszukiwarka broni | `GET /wpa/firearms?serialNumber=...` | — | ❌ BRAK | 🟠 WYSOKI |
| 13.4 | Zawieszenie pozwolenia | `POST /wpa/permits/{id}/suspend` | — | ❌ BRAK | 🟡 ŚREDNI |
| 13.5 | Cofnięcie pozwolenia | `POST /wpa/permits/{id}/revoke` | — | ❌ BRAK | 🟡 ŚREDNI |
| 13.6 | Przywrócenie pozwolenia | `POST /wpa/permits/{id}/restore` | — | ❌ BRAK | 🟡 ŚREDNI |

---

## 📈 STATYSTYKI POKRYCIA

### Według statusu:
- ✅ **PEŁNE** (działa z API): **0** (0%)
- ⚠️ **CZĘŚCIOWE** (mock data / błędne pola): **10** (23%)
- ❌ **BRAK**: **33** (77%)

### Według priorytetu:
- 🔴 **KRYTYCZNY** (blokujące podstawowy flow): **13** funkcjonalności
- 🟠 **WYSOKI** (istotne dla UX): **17** funkcjonalności
- 🟡 **ŚREDNI** (nice-to-have): **13** funkcjonalności

---

## 🔴 KRYTYCZNE BRAKI W UI (blokują podstawowy flow)

### 1. **Brak rozróżnienia: Wniosek o POZWOLENIE vs. Wniosek o PROMESĘ**

**Obecny stan:**
- `ApplicationForm.tsx` to hybryda - ma pola osobowe (dla pozwolenia) + weaponType (dla promesy)
- Nie można rozróżnić czy to wniosek o pierwsze pozwolenie, czy o promesę na broń

**Wymagane:**
```
PermitApplicationForm.tsx (NOWY)
├─ requestedPermitType (Sport/Hunting/Collection/Protection)
└─ reason (textarea - cel posiadania)

PromiseApplicationForm.tsx (NOWY)
├─ permitId (dropdown z GET /me/permits)
├─ requestedWeaponType (max 100 znaków)
└─ requestedQuantity (number)
```

### 2. **Brak widoku promes z QR kodem**

**Backend zwraca:**
```json
GET /citizen/me/promises
{
  "items": [{
    "id": "guid",
    "qrToken": "abc123xyz...",  // ← To trzeba wyświetlić jako QR!
    "promiseNumber": "PRO-2026-001",
    "promiseStatus": "Active",
    "expiryDate": "2026-10-10",
    "remainingQuantity": 1,
    "isValid": true
  }]
}
```

**UI potrzebuje:**
- Karta "Moje promesy" na dashboardzie obywatela
- Wyświetlanie QR kodu (biblioteka: `qrcode.react`)
- Countdown do wygaśnięcia
- Badge statusu (Active/Used/Expired)

### 3. **Brak panelu WPA dla wniosków o pozwolenia**

`OfficerDashboard.tsx` pokazuje tylko mockowane statystyki.

**Potrzebne:**
- Zakładki: "Wnioski o pozwolenia" | "Wnioski o promesy"
- Dla każdej: lista + szczegóły + akcje (approve/reject/require-correction)
- Pola approve dla pozwolenia: `maxFirearms`, `medicalExamExpiryDate`, `psychologicalExamExpiryDate`

### 4. **NewSaleDrawer: brakujące pola qrToken i category**

Bez tego sklep **nie może** zarejestrować sprzedaży!

**Poprawka:**
```diff
+ const [qrToken, setQrToken] = useState(""); // Z weryfikacji lub skanera
+ const [category, setCategory] = useState<"A"|"B"|"C">("B");

  await api.post('/shop/firearms/register-sale', {
+   qrToken,
-   manufacturer,
+   brand: manufacturer,
    model,
+   category,
    caliber,
    serialNumber,
    productionYear
  });
```

---

## 🟠 WYSOKIE BRAKI W UI

### 5. Transfer broni (cały moduł)

**Backend flow:**
```
Sprzedający → POST /me/transfer-requests { firearmId, buyerPesel, transferType }
Kupujący → GET /me/transfer-requests (widzi isBuyer: true)
Kupujący → POST /me/transfer-requests/{id}/accept
```

**UI potrzebuje:**
- Przycisk "Sprzedaj/Przekaż" w WeaponRegistry przy każdej broni
- Drawer z formularzem transferu
- Widok przychodzących transferów (lista + akcje: accept/reject)
- Badge `isSeller` / `isBuyer` do rozróżnienia ról

### 6. Alerty medyczne

**Backend:**
- Citizen: `GET /me/medical-alerts`
- WPA: `GET /wpa/medical-alerts?resolved=false`

**UI potrzebuje:**
- CitizenDashboard: Banner z alertem "Badanie psychologiczne wygasa za 7 dni!"
- OfficerDashboard: Karta "Alerty medyczne" z listą obywateli
- Filtrowanie: MedicalExamExpiring | PsychologicalExamExpiring | Expired

### 7. Wyszukiwarki WPA

**Backend:**
- `GET /wpa/citizens?page=1`
- `GET /wpa/firearms?serialNumber=ABC123&pesel=...`

**UI potrzebuje:**
- Nowa strona: `/wpa/search`
- Zakładki: "Obywatele" | "Broń"
- Formularze wyszukiwania z wieloma filtrami
- Wyniki z paginacją

---

## 🟡 ŚREDNIE BRAKI W UI

### 8. Zgłoszenie utraty broni

```tsx
// WeaponRegistry - przy każdej broni
<Button variant="destructive" onClick={() => reportLost(weapon.id)}>
  <AlertTriangle /> Zgłoś utratę/kradzież
</Button>

// Dialog
<Dialog>
  <DialogContent>
    <h3>Zgłoszenie utraty broni</h3>
    <Textarea 
      label="Opis okoliczności"
      placeholder="np. Skradziona z samochodu w dniu..."
    />
    <Button onClick={async () => {
      await api.post(`/citizen/me/firearms/${id}/report-lost`, { description });
      toast.warning("Zgłoszono utratę. Slot pozwolenia został zwolniony.");
    }}>
      Zgłoś utratę
    </Button>
  </DialogContent>
</Dialog>
```

### 9. Zarządzanie pozwoleniami przez WPA

**Backend:**
- `POST /wpa/permits/{id}/suspend` - zawieszenie
- `POST /wpa/permits/{id}/revoke` - cofnięcie
- `POST /wpa/permits/{id}/restore` - przywrócenie

**UI potrzebuje:**
- W szczegółach obywatela: akcje na każdym pozwoleniu
- Dialog z polem `reason` (wymagane!)
- Badge statusu: Active | Suspended | Revoked

---

## ✅ CZY BACKEND POKRYWA WSZYSTKO CO POTRZEBNE DLA UI?

### TAK! Backend jest KOMPLETNY. Pokrywa:

✅ **Pełen cykl życia pozwoleń:**
- Wniosek → Rozpatrzenie → Pozwolenie Active → Zawieszenie/Cofnięcie

✅ **Pełen cykl życia promes:**
- Wniosek → Rozpatrzenie → Promesa Active z QR → Wykorzystana

✅ **Pełen cykl życia broni:**
- Zakup w sklepie → Transfer właściciela → Zgłoszenie utraty

✅ **Monitorowanie:**
- Alerty medyczne dla obywateli i WPA
- Wyszukiwarki obywateli i broni

✅ **Zarządzanie:**
- Suspend/Revoke/Restore pozwoleń przez WPA

### ❌ Jedyne braki w Backend (opcjonalne):

1. **Brak historii akcji WPA** - może przydać się audit log:
   - Kto i kiedy zatwierdził wniosek
   - Kto i kiedy zawiesił pozwolenie
   
2. **Brak powiadomień push/email** - ale to może być poza zakresem

3. **Brak exportu danych** - np. PDF z pozwoleniem, raport CSV z broni

---

## 📋 PLAN IMPLEMENTACJI

### FAZA 1: Fundamenty (tydzień 1)
**Cel: Podstawowy flow działa z prawdziwym API**

1. ✅ Utworzyć `/src/services/api.ts` + axios + JWT interceptor
2. ✅ Utworzyć `/src/types/api.ts` z interfejsami DTO
3. ✅ Utworzyć `/src/services/`:
   - `authService.ts`
   - `citizenService.ts`
   - `shopService.ts`
   - `wpaService.ts`

### FAZA 2: Citizen - Wnioski (tydzień 1-2)
**Cel: Obywatel może złożyć wniosek o pozwolenie i promesę**

4. ✅ **Nowy:** `PermitApplicationForm.tsx`
   - 2 pola: `requestedPermitType`, `reason`
   - POST /citizen/me/permit-applications

5. ✅ **Nowy:** `PromiseApplicationForm.tsx`
   - 3 pola: `permitId` (dropdown), `requestedWeaponType`, `requestedQuantity`
   - POST /citizen/me/promise-applications

6. ✅ **Refactor:** `ApplicationsList.tsx`
   - Zakładki: "Wnioski o pozwolenia" | "Wnioski o promesy"
   - GET /me/permit-applications + GET /me/promise-applications

7. ✅ **Nowy:** `ApplicationDetails.tsx`
   - Wyświetla szczegóły wniosku
   - GET /citizen/me/permit-applications/{id}
   - GET /citizen/me/promise-applications/{id}

### FAZA 3: Citizen - Promesy i broń (tydzień 2)
**Cel: Obywatel widzi promesy z QR i swoją broń**

8. ✅ **Nowy:** `PromisesView.tsx` (karta na dashboardzie)
   - GET /citizen/me/promises
   - Wyświetlanie QR kodu (biblioteka: `react-qr-code`)
   - Countdown do wygaśnięcia

9. ✅ **Refactor:** `CitizenDashboard.tsx`
   - GET /citizen/me/permits (prawdziwe dane)
   - Wyświetlanie availableSlots, dat badań
   - Link do promes z QR

10. ✅ **Refactor:** `WeaponRegistry.tsx`
    - GET /citizen/me/firearms?page=1
    - Dodać category badge (A/B/C)
    - Dodać paginację
    - Mapowanie statusów (Registered→"Zarejestrowana")

### FAZA 4: WPA - Wnioski o pozwolenia (tydzień 2-3)
**Cel: WPA może rozpatrywać wnioski o pozwolenia**

11. ✅ **Nowy:** `PermitApplicationsListWPA.tsx`
    - GET /wpa/permit-applications?status=Submitted
    - Filtrowanie po statusie
    - Paginacja

12. ✅ **Nowy:** `PermitApplicationDecisionPage.tsx`
    - GET /wpa/permit-applications/{id}
    - 4 akcje: mark-under-review / approve / require-correction / reject
    - Dla approve: pola `maxFirearms`, `medicalExamExpiryDate`, `psychologicalExamExpiryDate`

13. ✅ **Refactor:** `OfficerDashboard.tsx`
    - Zakładki: "Pozwolenia" | "Promesy" | "Alerty"
    - GET /wpa/permit-applications?status=Submitted
    - GET /wpa/promise-applications?status=Paid
    - GET /wpa/medical-alerts?resolved=false

### FAZA 5: WPA - Wnioski o promesy (tydzień 3)
**Cel: WPA może rozpatrywać wnioski o promesy**

14. ✅ **Refactor:** `DecisionPage.tsx`
    - Obsługa OBIE ścieżek: permit-applications i promise-applications
    - 4 akcje zamiast 3
    - Body z `reason` dla reject/require-correction

### FAZA 6: Shop - QR i sprzedaż (tydzień 3)
**Cel: Sklep może weryfikować QR i rejestrować sprzedaż**

15. ✅ **Refactor:** `ShopVerification.tsx`
    - Opcja skanowania QR (qrToken) LUB ręczne (promiseNumber)
    - Wyświetlanie WSZYSTKICH pól z response
    - Alert jeśli !medicalExamsValid

16. ✅ **Refactor:** `NewSaleDrawer.tsx`
    - Dodać state `qrToken` (z weryfikacji)
    - Dodać `category` select (A/B/C)
    - Zmienić `manufacturer` → `brand`
    - Usunąć: pesel, customerName, invoiceNumber, saleDate

### FAZA 7: Transfer broni (tydzień 4)
**Cel: Obywatele mogą sprzedawać broń sobie nawzajem**

17. ✅ **Nowy:** `TransferDrawer.tsx`
    - Formularz: firearmId, buyerPesel, transferType (Sale/Donation/Inheritance)
    - POST /citizen/me/transfer-requests

18. ✅ **Nowy:** `TransfersList.tsx`
    - GET /citizen/me/transfer-requests
    - Rozróżnienie: isSeller / isBuyer
    - Akcje: accept / reject (dla isBuyer)

19. ✅ **Update:** `WeaponRegistry.tsx`
    - Przycisk "Sprzedaj/Przekaż" przy każdej broni

### FAZA 8: Alerty i wyszukiwarki (tydzień 4)
**Cel: Monitoring i zarządzanie**

20. ✅ **Nowy:** `MedicalAlertsView.tsx` (WPA)
    - GET /wpa/medical-alerts?resolved=false
    - Filtry: Expiring / Expired
    - Typy: Medical / Psychological

21. ✅ **Update:** `CitizenDashboard.tsx`
    - Banner z GET /citizen/me/medical-alerts
    - "Twoje badanie psychologiczne wygasa za 7 dni!"

22. ✅ **Nowy:** `WPASearchPage.tsx`
    - Zakładki: "Obywatele" | "Broń"
    - GET /wpa/citizens
    - GET /wpa/firearms?serialNumber=...
    - Paginacja

### FAZA 9: Zarządzanie pozwoleniami (tydzień 5)
**Cel: WPA może zawieszać/cofać pozwolenia**

23. ✅ **Nowy:** `CitizenDetailsWPA.tsx`
    - GET /wpa/citizens/{id}
    - Lista pozwoleń z akcjami: suspend / revoke / restore
    - Dialog z polem `reason`

24. ✅ **Nowy:** `ReportLostDialog.tsx`
    - POST /citizen/me/firearms/{id}/report-lost
    - Pole `description`

---

## 🎯 PODSUMOWANIE

### ❌ CZY UI POKRYWA PEŁNY FLOW BACKENDU?
**NIE - 77% funkcjonalności brakuje lub jest na mock data.**

Największe luki:
- Brak rozróżnienia permit-applications vs promise-applications
- Brak widoku promes z QR kodem
- Brak panelu WPA dla wniosków o pozwolenia
- Brak transferu broni
- Brak alertów medycznych
- Brak wyszukiwarek WPA
- Brak zarządzania pozwoleniami (suspend/revoke)

### ✅ CZY BACKEND POKRYWA PEŁNE POTRZEBY UI?
**TAK - Backend jest kompletny i pokrywa 100% wymaganych funkcjonalności.**

Workflow jest logiczny i kompletny od początku (rejestracja) do końca (transfer/utrata broni).

### 📅 SZACOWANY CZAS IMPLEMENTACJI
**4-5 tygodni** przy pełnym zaangażowaniu (zakładając 1 full-time developer).

---

## ✅ NASTĘPNE KROKI

1. **Pilne:** Czy mam zacząć implementację od Fazy 1 (fundamenty API)?
2. **Opcja:** Mogę najpierw stworzyć boilerplate dla wszystkich serwisów + typów DTO
3. **Pytanie:** Czy preferujesz inny priorytet niż zaproponowany plan 9-fazowy?
