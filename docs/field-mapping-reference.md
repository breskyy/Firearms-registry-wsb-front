# Quick Reference: Mapowanie pól UI ↔ API

## 1. FORMULARZ PROMESY (Citizen)

### ❌ OBECNY ApplicationForm.tsx (NIEPOPRAWNY):
```typescript
{
  permitType: "sport",          // ← To już mamy w bazie!
  firstName: "Jan",             // ← To już mamy w bazie!
  lastName: "Kowalski",         // ← To już mamy w bazie!
  pesel: "90010112345",         // ← To już mamy w bazie!
  idNumber: "ABC123456",        // ← To już mamy w bazie!
  address: "ul. Przykładowa 1", // ← To już mamy w bazie!
  city: "Warszawa",             // ← To już mamy w bazie!
  postalCode: "00-000",         // ← To już mamy w bazie!
  phone: "+48123456789",        // ← To już mamy w bazie!
  email: "jan@example.com",     // ← To już mamy w bazie!
  weaponType: "pistol",         // ✓ Potrzebne, ale zła nazwa
  purpose: "Sport strzelecki",  // ✗ BRAK W API
  medicalCertificate: true,     // ← To już mamy w bazie!
  psychologicalTest: true,      // ← To już mamy w bazie!
  training: true,               // ← To już mamy w bazie!
  consent: true,                // ✗ Nie jest wysyłane
}
```

### ✅ POPRAWNY PromiseApplicationForm.tsx:
```typescript
// Body dla POST /api/v1/citizen/me/promise-applications
{
  permitId: "guid-wybrane-z-listy",      // ← Dropdown: GET /me/permits
  requestedWeaponType: "Pistolet 9mm",   // ← Pole tekstowe, max 100 znaków
  requestedQuantity: 1                    // ← Number input, domyślnie 1
}

// To wszystko!
```

**Kod przykładowy:**
```tsx
// 1. Pobierz pozwolenia użytkownika
const { data: permits } = await api.get('/api/v1/citizen/me/permits');

// 2. Formularz
<Select onValueChange={(val) => setPermitId(val)}>
  {permits.items.map(permit => (
    <SelectItem key={permit.id} value={permit.id}>
      {permit.permitType} • Nr {permit.permitNumber} • 
      Wolne sloty: {permit.availableSlots}
    </SelectItem>
  ))}
</Select>

<Input 
  label="Typ broni"
  placeholder="np. Pistolet sportowy Glock 17, 9mm"
  maxLength={100}
  value={requestedWeaponType}
  onChange={(e) => setRequestedWeaponType(e.target.value)}
/>

<Input 
  type="number"
  label="Ilość"
  value={requestedQuantity}
  onChange={(e) => setRequestedQuantity(Number(e.target.value))}
  min={1}
/>

// 3. Submit
await api.post('/api/v1/citizen/me/promise-applications', {
  permitId,
  requestedWeaponType,
  requestedQuantity
});
```

---

## 2. REJESTRACJA SPRZEDAŻY (Shop)

### ❌ OBECNY NewSaleDrawer.tsx:
```typescript
{
  promesaNumber: "PRO-2026-004521",  // ✗ NIE JEST WYSYŁANE
  pesel: "90010112345",              // ✗ NIE JEST WYSYŁANE
  customerName: "Jan Kowalski",      // ✗ NIE JEST WYSYŁANE
  manufacturer: "Glock",             // ⚠️ Powinno być "brand"
  model: "17 Gen 5",                 // ✓ OK
  caliber: "9mm",                    // ✓ OK
  serialNumber: "ABC123",            // ✓ OK
  productionYear: 2024,              // ✓ OK
  invoiceNumber: "FV/2026/04/123",   // ✗ NIE JEST WYSYŁANE
  saleDate: "2026-04-12",            // ✗ NIE JEST WYSYŁANE
  // BRAK qrToken!                   // ❌ KRYTYCZNE - WYMAGANE!
  // BRAK category!                  // ❌ KRYTYCZNE - WYMAGANE!
}
```

### ✅ POPRAWNY NewSaleDrawer.tsx:
```typescript
// Body dla POST /api/v1/shop/firearms/register-sale
{
  qrToken: "token-ze-skanowania-qr",  // ← Z QR scannera lub verify-permit
  brand: "Glock",                      // ← manufacturer → brand!
  model: "17 Gen 5",                   // ✓ OK
  category: "B",                       // ← SELECT: A / B / C
  caliber: "9mm",                      // ✓ OK
  serialNumber: "ABC123",              // ✓ OK
  productionYear: 2024                 // ✓ OK (number)
}
```

**Kod przykładowy:**
```tsx
// 1. Najpierw weryfikacja (opcjonalnie)
const verifyResponse = await api.post('/api/v1/shop/verify-permit', {
  qrToken: scannedQR,  // LUB
  promiseNumber: manuallyEntered
});

// Zapisz qrToken do state
const [qrToken, setQrToken] = useState(verifyResponse.qrToken);

// 2. Formularz z category
<Select value={category} onValueChange={setCategory}>
  <SelectItem value="A">Kategoria A (zakazana)</SelectItem>
  <SelectItem value="B">Kategoria B (pozwolenie wymagane)</SelectItem>
  <SelectItem value="C">Kategoria C (zgłoszenie)</SelectItem>
</Select>

// 3. Submit
const response = await api.post('/api/v1/shop/firearms/register-sale', {
  qrToken,              // ← Z weryfikacji
  brand,                // ← manufacturer→brand
  model,
  category,             // ← A/B/C
  caliber,
  serialNumber,
  productionYear: Number(productionYear)
});

// 4. Response
const { firearmId, registrationNumber } = response.data;
toast.success(`Zarejestrowano: ${registrationNumber}`);
```

---

## 3. WERYFIKACJA PROMESY (Shop)

### ❌ OBECNY ShopVerification.tsx:
```typescript
// Body
{
  promesaNumber: "PRO-2026-004521"  // ⚠️ API oczekuje "promiseNumber"
  // BRAK qrToken option!
}
```

### ✅ POPRAWNY ShopVerification.tsx:
```typescript
// Body dla POST /api/v1/shop/verify-permit
// (co najmniej jedno z dwóch)
{
  qrToken?: "string",      // ← Opcja 1: Zeskanowany QR
  promiseNumber?: "string" // ← Opcja 2: Ręczne wpisanie
}

// Response
{
  isValid: true,
  message: "Promesa ważna",
  citizenName: "Jan Kowalski",
  permitNumber: "POZ-2025-001",
  permitType: "Sport",
  availableSlots: 2,                    // ← Wyświetl!
  weaponType: "Pistolet",
  remainingPromiseQuantity: 1,          // ← Wyświetl!
  promiseExpiryDate: "2026-10-10",      // ← Wyświetl!
  medicalExamsValid: true               // ← WAŻNE! Wyświetl!
}
```

**Kod przykładowy:**
```tsx
// Opcja A: Skanowanie QR
<Button onClick={() => startQRScanner()}>
  <QrCode /> Skanuj QR z promesy
</Button>

// Opcja B: Ręczne wpisanie
<Input 
  label="Lub wpisz numer promesy"
  placeholder="PRO-2026-XXXXXX"
  value={promiseNumber}
  onChange={(e) => setPromiseNumber(e.target.value)}
/>

// Submit
const response = await api.post('/api/v1/shop/verify-permit', {
  qrToken: scannedQR,         // jeśli zeskanowano
  promiseNumber: promiseNumber // jeśli wpisano
});

// Wyświetl WSZYSTKIE dane z response!
if (response.isValid) {
  return (
    <Card className="border-green-600">
      <CardHeader className="bg-green-50">
        <CheckCircle /> Promesa jest ważna
      </CardHeader>
      <CardContent>
        <p>Nabywca: {response.citizenName}</p>
        <p>Nr pozwolenia: {response.permitNumber}</p>
        <p>Typ: {response.permitType}</p>
        <p>Wolne sloty: {response.availableSlots}</p>
        <p>Typ broni: {response.weaponType}</p>
        <p>Pozostała ilość: {response.remainingPromiseQuantity}</p>
        <p>Ważność promesy: {response.promiseExpiryDate}</p>
        
        {!response.medicalExamsValid && (
          <Alert variant="destructive">
            <AlertCircle /> Badania medyczne NIE SĄ AKTUALNE!
          </Alert>
        )}
        
        <Button onClick={() => proceedToSale(response.qrToken)}>
          Przejdź do sprzedaży
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## 4. DECYZJA WPA (Officer)

### ❌ OBECNY DecisionPage.tsx:
```typescript
// 3 opcje radio
decision: "approve" | "reject" | "supplement"
justification: string

// Submit
if (decision === "approve") {
  // ??? nie wysyła nic
} else if (decision === "reject") {
  // ??? nie wysyła reason
} else if (decision === "supplement") {
  // ??? nie wysyła reason
}
```

### ✅ POPRAWNY DecisionPage.tsx:
```typescript
// 4 endpointy!

// 1. Oznacz jako w trakcie
POST /api/v1/wpa/promise-applications/{id}/mark-under-review
// Brak body

// 2. Zatwierdź
POST /api/v1/wpa/promise-applications/{id}/approve
// Brak body
// Tworzy promesę dla obywatela!

// 3. Odrzuć
POST /api/v1/wpa/promise-applications/{id}/reject
{
  "reason": "Brak aktualnego badania psychologicznego"
}

// 4. Wymagaj korekty
POST /api/v1/wpa/promise-applications/{id}/require-correction
{
  "reason": "Proszę uzupełnić dane kontaktowe"
}
```

**Kod przykładowy:**
```tsx
const [action, setAction] = useState<'under-review' | 'approve' | 'reject' | 'require-correction'>();
const [reason, setReason] = useState("");

const handleSubmit = async () => {
  const baseUrl = `/api/v1/wpa/promise-applications/${id}`;
  
  switch (action) {
    case 'under-review':
      await api.post(`${baseUrl}/mark-under-review`);
      toast.info("Oznaczono jako w trakcie rozpatrzenia");
      break;
      
    case 'approve':
      await api.post(`${baseUrl}/approve`);
      toast.success("Wniosek zatwierdzony. Promesa utworzona.");
      break;
      
    case 'reject':
      await api.post(`${baseUrl}/reject`, { reason });
      toast.error("Wniosek odrzucony");
      break;
      
    case 'require-correction':
      await api.post(`${baseUrl}/require-correction`, { reason });
      toast.warning("Wysłano wezwanie do uzupełnienia");
      break;
  }
};

// UI
<RadioGroup value={action} onValueChange={setAction}>
  <RadioGroupItem value="under-review">
    <Clock /> Oznacz jako w trakcie rozpatrzenia
  </RadioGroupItem>
  
  <RadioGroupItem value="approve">
    <CheckCircle /> Zatwierdź i wydaj promesę
  </RadioGroupItem>
  
  <RadioGroupItem value="require-correction">
    <FileWarning /> Wezwij do uzupełnienia
  </RadioGroupItem>
  
  <RadioGroupItem value="reject">
    <XCircle /> Odrzuć wniosek
  </RadioGroupItem>
</RadioGroup>

{(action === 'reject' || action === 'require-correction') && (
  <Textarea
    label="Uzasadnienie (wymagane)"
    value={reason}
    onChange={(e) => setReason(e.target.value)}
    minLength={20}
  />
)}
```

---

## 5. LISTA BRONI (Citizen)

### ❌ OBECNY WeaponRegistry.tsx:
```typescript
{
  id: "BRN-2025-001",
  manufacturer: "Glock",     // ⚠️ W API to "brand"
  model: "Glock 17",
  caliber: "9mm",
  serialNumber: "ABC123456",
  registrationDate: "2025-03-15",
  status: "aktywna",         // ⚠️ W API to enum: Registered/Transferred/Lost/Archived
  permitNumber: "POZ-2025-001",
  // BRAK category!          // ❌ A/B/C
}
```

### ✅ POPRAWNY WeaponRegistry.tsx:
```typescript
// GET /api/v1/citizen/me/firearms
{
  items: [
    {
      id: "guid",
      brand: "Glock",              // ← manufacturer→brand
      model: "17 Gen 5",
      category: "B",               // ← A/B/C (dodaj do UI!)
      caliber: "9mm",
      serialNumber: "ABC123456",
      productionYear: 2024,
      registrationDate: "2025-03-15T10:00:00Z",
      status: "Registered",        // ← Registered/Transferred/Lost/Archived
      permitId: "guid",
      permitNumber: "POZ-2025-001"
    }
  ],
  totalCount: 2,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false
}

// GET /api/v1/citizen/me/firearms/{id} (szczegóły)
{
  ...wszystko powyżej,
  ownershipHistory: [            // ← Historia właścicieli!
    {
      ownerName: "Anna Nowak",
      ownerPesel: "********1234",
      acquiredDate: "2024-01-10T10:00:00Z",
      transferType: "Sale"
    },
    {
      ownerName: "Jan Kowalski",
      ownerPesel: "********5678",
      acquiredDate: "2025-03-15T10:00:00Z",
      transferType: "Sale"
    }
  ]
}
```

**Kod przykładowy:**
```tsx
const { data } = await api.get('/api/v1/citizen/me/firearms', {
  params: { page: 1, pageSize: 10 }
});

{data.items.map(weapon => (
  <Card key={weapon.id}>
    <h3>{weapon.brand} {weapon.model}</h3>
    <Badge>Kategoria {weapon.category}</Badge>
    <p>Kaliber: {weapon.caliber}</p>
    <p>Nr seryjny: {weapon.serialNumber}</p>
    <Badge variant={getStatusVariant(weapon.status)}>
      {mapStatus(weapon.status)}
    </Badge>
  </Card>
))}

<Pagination
  currentPage={data.page}
  totalPages={data.totalPages}
  hasNext={data.hasNextPage}
  hasPrev={data.hasPreviousPage}
/>

// Mapowanie statusu
const mapStatus = (status: string) => {
  switch (status) {
    case 'Registered': return 'Zarejestrowana';
    case 'Transferred': return 'Przeniesiona';
    case 'Lost': return 'Zgłoszona jako zgubiona';
    case 'Archived': return 'Zarchiwizowana';
    default: return status;
  }
};
```

---

## 6. STATUSY PROMESY

### API PromiseStatus enum:
```typescript
type PromiseStatus = 
  | 'Draft'          // Szkic
  | 'Submitted'      // Złożony
  | 'Paid'           // Opłacony (mockowane)
  | 'UnderReview'    // W trakcie rozpatrzenia
  | 'Approved'       // Zatwierdzony (ale jeszcze nie Active)
  | 'Rejected'       // Odrzucony
  | 'Active'         // Aktywna promesa (z QR!)
  | 'Used'           // Wykorzystana (broń kupiona)
  | 'Expired';       // Wygasła
```

### Mapowanie na UI:
```typescript
const getStatusBadge = (status: PromiseStatus) => {
  const config = {
    Draft: { label: 'Szkic', variant: 'secondary', color: 'gray' },
    Submitted: { label: 'Złożony', variant: 'secondary', color: 'blue' },
    Paid: { label: 'Opłacony', variant: 'secondary', color: 'blue' },
    UnderReview: { label: 'W trakcie weryfikacji', variant: 'secondary', color: 'amber' },
    Approved: { label: 'Zatwierdzony', variant: 'default', color: 'green' },
    Rejected: { label: 'Odrzucony', variant: 'destructive', color: 'red' },
    Active: { label: 'Aktywna', variant: 'default', color: 'emerald' },
    Used: { label: 'Wykorzystana', variant: 'secondary', color: 'gray' },
    Expired: { label: 'Wygasła', variant: 'destructive', color: 'orange' },
  };
  
  return (
    <Badge variant={config[status].variant} className={`bg-${config[status].color}-100`}>
      {config[status].label}
    </Badge>
  );
};
```

---

## 7. KATEGORIE BRONI

```typescript
type FirearmCategory = 'A' | 'B' | 'C';

// Opis kategorii (dla tooltipów)
const categoryInfo = {
  A: {
    name: 'Kategoria A',
    description: 'Broń zakazana - posiadanie wyłącznie z wyjątkowym pozwoleniem',
    examples: 'Broń automatyczna, pociski przeciwpancerne'
  },
  B: {
    name: 'Kategoria B',
    description: 'Broń wymagająca pozwolenia',
    examples: 'Pistolety, rewolwery, karabiny kulowe'
  },
  C: {
    name: 'Kategoria C',
    description: 'Broń podlegająca zgłoszeniu',
    examples: 'Strzelby gładkolufowe, broń myśliwska'
  }
};

// UI Select
<Select value={category} onValueChange={setCategory}>
  <SelectTrigger>
    <SelectValue placeholder="Wybierz kategorię broni" />
  </SelectTrigger>
  <SelectContent>
    {Object.entries(categoryInfo).map(([key, info]) => (
      <SelectItem key={key} value={key}>
        <div className="flex flex-col">
          <span className="font-semibold">{info.name}</span>
          <span className="text-xs text-muted-foreground">{info.examples}</span>
        </div>
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

## 8. PAGINACJA (WSZYSTKIE LISTY)

### ✅ Standard dla wszystkich GET endpointów:

```typescript
// Request
GET /api/v1/citizen/me/firearms?page=2&pageSize=20

// Response
{
  items: [...],           // Aktualna strona danych
  totalCount: 156,        // Łączna liczba rekordów
  page: 2,                // Aktualna strona
  pageSize: 20,           // Rozmiar strony
  totalPages: 8,          // Łączna liczba stron
  hasNextPage: true,      // Czy jest następna strona
  hasPreviousPage: true   // Czy jest poprzednia strona
}
```

**Komponent paginacji:**
```tsx
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between mt-4">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Poprzednia
      </Button>
      
      <span className="text-sm text-muted-foreground">
        Strona {currentPage} z {totalPages}
      </span>
      
      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Następna
      </Button>
    </div>
  );
}
```

---

## 9. QUICK FIXES - CHECKLIST

### NewSaleDrawer.tsx
- [ ] Zmień `manufacturer` → `brand`
- [ ] Dodaj `category` select (A/B/C)
- [ ] Dodaj state `qrToken` (z weryfikacji)
- [ ] Usuń pola: `promesaNumber`, `pesel`, `customerName`, `invoiceNumber`, `saleDate`
- [ ] Wyślij tylko: `{ qrToken, brand, model, category, caliber, serialNumber, productionYear }`

### ShopVerification.tsx
- [ ] Dodaj opcję skanowania QR (`qrToken`)
- [ ] Zmień `promesaNumber` → `promiseNumber`
- [ ] Wyświetl `availableSlots`, `remainingPromiseQuantity`, `promiseExpiryDate`
- [ ] Dodaj alert jeśli `!medicalExamsValid`

### ApplicationForm.tsx
- [ ] Przepisz CAŁKOWICIE na PromiseApplicationForm
- [ ] 3 pola: `permitId` (dropdown), `requestedWeaponType`, `requestedQuantity`
- [ ] Usuń WSZYSTKIE pola osobowe i dokumenty

### DecisionPage.tsx
- [ ] Dodaj 4. opcję: "Oznacz jako w trakcie rozpatrzenia"
- [ ] Wyślij `{ reason }` w body dla reject i require-correction

### WeaponRegistry.tsx
- [ ] Dodaj `category` badge (A/B/C)
- [ ] Zmień `manufacturer` → `brand`
- [ ] Mapuj statusy: Registered → "Zarejestrowana" etc.
- [ ] Dodaj paginację
