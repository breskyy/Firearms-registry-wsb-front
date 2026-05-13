 ---
  1. Citizen rejestruje się w systemie                                                                                                                       

  Konto zakłada Admin (poza zakresem frontendu). Citizen dostaje email + hasło.

  POST /api/v1/auth/login
  → JWT token (rola: Citizen)

  ---
  2. Citizen składa wniosek o pozwolenie na broń

  POST /api/v1/citizen/me/permit-applications
  Body: { "requestedPermitType": "Sport", "reason": "..." }

  GET /api/v1/citizen/me/permit-applications
  → śledzi status: Submitted → UnderReview → RequiresCorrection → Approved/Rejected

  ---
  3. WPA rozpatruje wniosek o pozwolenie

  POST /api/v1/auth/login  (rola: WpaOfficer)

  GET  /api/v1/wpa/permit-applications?status=Submitted
  GET  /api/v1/wpa/permit-applications/{id}
  POST /api/v1/wpa/permit-applications/{id}/mark-under-review
  POST /api/v1/wpa/permit-applications/{id}/approve
       Body: { "maxFirearms": 5, "medicalExamExpiryDate": "...", "psychologicalExamExpiryDate": "..." }
       → tworzy aktywne pozwolenie u citizena

  POST /api/v1/wpa/permit-applications/{id}/require-correction
       Body: { "reason": "Brak zaświadczenia lekarskiego" }
  POST /api/v1/wpa/permit-applications/{id}/reject
       Body: { "reason": "..." }

  ---
  4. Citizen sprawdza swoje pozwolenie

  GET /api/v1/citizen/me/permits
  → widzi pozwolenie: status Active, availableSlots, daty badań lekarskich

  ---
  5. Citizen składa wniosek o e-promesę

  Wymaga aktywnego pozwolenia z wolnymi slotami.

  POST /api/v1/citizen/me/promise-applications
  Body: { "permitId": "...", "requestedWeaponType": "Pistolet", "requestedQuantity": 1 }

  GET /api/v1/citizen/me/promise-applications
  → śledzi status: Submitted → Paid → UnderReview → Approved/Rejected/RequiresCorrection

  ---
  6. WPA rozpatruje wniosek o promesę

  GET  /api/v1/wpa/promise-applications?status=Paid
  GET  /api/v1/wpa/promise-applications/{id}
  POST /api/v1/wpa/promise-applications/{id}/mark-under-review
  POST /api/v1/wpa/promise-applications/{id}/approve
       → tworzy aktywną promesę z QR tokenem
  POST /api/v1/wpa/promise-applications/{id}/require-correction
  POST /api/v1/wpa/promise-applications/{id}/reject

  ---
  7. Citizen idzie do sklepu z QR kodem

  GET /api/v1/citizen/me/promises
  → widzi aktywną promesę z qrToken, expiryDate, remainingQuantity

  ---
  8. Sklep obsługuje sprzedaż

  POST /api/v1/auth/login  (rola: Shop)

  POST /api/v1/shop/verify-permit
  Body: { "qrToken": "..." }
  → zwraca: isValid, citizenName, weaponType, availableSlots, medicalExamsValid, promiseExpiryDate

  POST /api/v1/shop/firearms/register-sale
  Body: { "qrToken": "...", "brand": "Glock", "model": "17", "category": "B",
          "caliber": "9mm", "serialNumber": "...", "productionYear": 2023 }
  → atomowo: tworzy broń, przypisuje do citizena, aktualizuje promesę i sloty pozwolenia

  ---
  9. Citizen widzi zarejestrowaną broń

  GET /api/v1/citizen/me/firearms
  GET /api/v1/citizen/me/firearms/{id}  → szczegóły + historia właścicieli

  ---
  10. Citizen sprzedaje broń innemu citizenowi

  POST /api/v1/citizen/me/transfer-requests
  Body: { "firearmId": "...", "buyerPesel": "12345678901", "transferType": "Sale" }
  → status: PendingAcceptance

  // Kupujący:
  GET  /api/v1/citizen/me/transfer-requests          → widzi przychodzący transfer (isBuyer: true)
  POST /api/v1/citizen/me/transfer-requests/{id}/accept
       → atomowo: zmienia właściciela, aktualizuje sloty obu stron, tworzy historię
  POST /api/v1/citizen/me/transfer-requests/{id}/reject

  ---
  11. Citizen zgłasza utratę/kradzież broni

  POST /api/v1/citizen/me/firearms/{id}/report-lost
  Body: { "description": "Skradziona z samochodu" }
  → status broni: Lost, slot pozwolenia zwolniony

  ---
  12. Alerty o wygasających badaniach

  // Citizen sprawdza swoje alerty:
  GET /api/v1/citizen/me/medical-alerts
  → typy: MedicalExamExpiring, PsychologicalExamExpiring, MedicalExamExpired, PsychologicalExamExpired

  // WPA monitoruje wszystkich:
  GET /api/v1/wpa/medical-alerts?resolved=false

  ---
  13. WPA zarządza pozwoleniami

  // Podgląd citizena:
  GET /api/v1/wpa/citizens
  GET /api/v1/wpa/citizens/{id}       → pełne dane, PESEL, pozwolenia, alerty

  // Wyszukiwarka broni:
  GET /api/v1/wpa/firearms?serialNumber=&pesel=&permitNumber=&permitType=

  // Zarządzanie pozwoleniem:
  POST /api/v1/wpa/permits/{id}/suspend   Body: { "reason": "..." }
  POST /api/v1/wpa/permits/{id}/revoke    Body: { "reason": "..." }
  POST /api/v1/wpa/permits/{id}/restore   Body: { "reason": "..." }

  ---
  Cykle życia statusów

  PermitApplication:   Submitted → UnderReview → Approved → (pozwolenie Active)
                                               ↘ Rejected
                                               ↘ RequiresCorrection

  PromiseApplication:  Submitted → Paid → UnderReview → Approved → (promesa Active)
                                                       ↘ Rejected
                                                       ↘ RequiresCorrection

  Promise:             Active → Used / Expired

  Firearm:             Registered → Transferred / Lost / Archived

  Permit:              Active ⇄ Suspended → Revoked

  TransferRequest:     PendingAcceptance → Accepted → Completed
                                         ↘ Rejected / Cancelled
