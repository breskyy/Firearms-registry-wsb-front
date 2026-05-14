// In-memory mock store — mirrors backend seed data
// Arrays are mutable so POST/PUT handlers can update state within a session.

const daysFromNow = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

export const IDS = {
  citizenUser:   'u-citizen-001',
  officerUser:   'u-officer-001',
  shopUser:      'u-shop-001',
  adminUser:     'u-admin-001',
  citizenProfile:'cp-001',
  permit1:       'permit-001',
  promise1:      'promise-001',
  firearm1:      'firearm-001',
  permitApp1:    'pa-001-approved',
  permitApp2:    'pa-002-submitted',
  promiseApp1:   'pra-001-approved',
  promiseApp2:   'pra-002-submitted',
  alert1:        'alert-001',
};

// ── Permits ───────────────────────────────────────────────────────────────────

export const permits: any[] = [
  {
    id: IDS.permit1,
    permitNumber: 'PZ-2024-00001',
    permitType: 'Sport',
    permitTypeName: 'Sport',
    status: 'Active',
    statusName: 'Active',
    issueDate: daysAgo(365),
    expiryDate: daysFromNow(4 * 365),
    maxFirearms: 5,
    usedSlots: 1,
    availableSlots: 4,
    isValid: true,
    medicalExamExpiryDate: daysFromNow(365),
    psychologicalExamExpiryDate: daysFromNow(365),
  },
];

// ── Promises ──────────────────────────────────────────────────────────────────

export const promises: any[] = [
  {
    id: IDS.promise1,
    promiseNumber: 'PROM-2024-00001',
    weaponType: 'Pistolet sportowy 9mm',
    quantity: 2,
    usedQuantity: 1,
    remainingQuantity: 1,
    status: 'Active',
    statusName: 'Active',
    feeAmount: 17.00,
    paymentStatus: 'Paid',
    paymentStatusName: 'Paid',
    qrToken: 'QR-TEST-TOKEN-12345678',
    issueDate: daysAgo(10),
    expiryDate: daysFromNow(90),
    isValid: true,
  },
];

// ── Firearms ──────────────────────────────────────────────────────────────────

export const firearms: any[] = [
  {
    id: IDS.firearm1,
    brand: 'Glock',
    model: '17 Gen5',
    category: 'B',
    categoryName: 'B',
    caliber: '9x19mm Parabellum',
    serialNumber: 'GLOCK-2024-00001',
    productionYear: 2024,
    status: 'Registered',
    statusName: 'Registered',
    registeredAt: daysAgo(180),
    ownershipHistory: [
      {
        id: 'hist-001',
        previousOwnerName: null,
        newOwnerName: 'Jan Kowalski',
        transferType: 'Sale',
        transferTypeName: 'Sale',
        transferDate: daysAgo(180),
        notes: 'Initial purchase from authorized dealer',
      },
    ],
  },
];

// ── Permit applications ───────────────────────────────────────────────────────

export const permitApplications: any[] = [
  {
    id: IDS.permitApp1,
    citizenId: IDS.citizenProfile,
    citizenName: 'Jan Kowalski',
    citizenPesel: '90010*****',
    requestedPermitType: 'Sport',
    requestedPermitTypeName: 'Sport',
    reason: 'Uprawianie sportu strzeleckiego w klubie sportowym. Planuję uczestniczyć w zawodach regionalnych i ogólnopolskich.',
    medicalExamExpiryDate: daysFromNow(365),
    psychologicalExamExpiryDate: daysFromNow(365),
    status: 'Approved',
    statusName: 'Approved',
    rejectionReason: null,
    correctionNotes: null,
    createdAt: daysAgo(400),
    reviewedAt: daysAgo(370),
    reviewedByOfficerName: 'sgt. Mariusz Nowak',
    attachments: [
      {
        id: 'att-001',
        attachmentType: 'MedicalCertificate',
        attachmentTypeName: 'MedicalCertificate',
        fileName: 'zaswiadczenie_lekarskie.pdf',
        contentType: 'application/pdf',
        fileSize: 245760,
        createdAt: daysAgo(400),
      },
      {
        id: 'att-002',
        attachmentType: 'PsychologicalCertificate',
        attachmentTypeName: 'PsychologicalCertificate',
        fileName: 'zaswiadczenie_psychologiczne.pdf',
        contentType: 'application/pdf',
        fileSize: 189440,
        createdAt: daysAgo(400),
      },
    ],
  },
  {
    id: IDS.permitApp2,
    citizenId: IDS.citizenProfile,
    citizenName: 'Jan Kowalski',
    citizenPesel: '90010*****',
    requestedPermitType: 'Collection',
    requestedPermitTypeName: 'Collection',
    reason: 'Kolekcjonowanie historycznej broni palnej z okresu II Rzeczpospolitej. Posiadam odpowiednie warunki przechowywania i ubezpieczenie.',
    medicalExamExpiryDate: null,
    psychologicalExamExpiryDate: null,
    status: 'Submitted',
    statusName: 'Submitted',
    rejectionReason: null,
    correctionNotes: null,
    createdAt: daysAgo(14),
    reviewedAt: null,
    reviewedByOfficerName: null,
    attachments: [
      {
        id: 'att-003',
        attachmentType: 'MedicalCertificate',
        attachmentTypeName: 'MedicalCertificate',
        fileName: 'badanie_lekarskie_2024.pdf',
        contentType: 'application/pdf',
        fileSize: 320000,
        createdAt: daysAgo(14),
      },
    ],
  },
];

// ── Promise applications ──────────────────────────────────────────────────────

export const promiseApplications: any[] = [
  {
    id: IDS.promiseApp1,
    citizenId: IDS.citizenProfile,
    citizenName: 'Jan Kowalski',
    citizenPesel: '90010*****',
    permitId: IDS.permit1,
    permitNumber: 'PZ-2024-00001',
    permitType: 'Sport',
    requestedWeaponType: 'Pistolet sportowy 9mm',
    requestedQuantity: 2,
    status: 'Approved',
    statusName: 'Approved',
    rejectionReason: null,
    correctionNotes: null,
    createdAt: daysAgo(25),
    reviewedAt: daysAgo(15),
    reviewedByOfficerName: 'sgt. Mariusz Nowak',
  },
  {
    id: IDS.promiseApp2,
    citizenId: IDS.citizenProfile,
    citizenName: 'Jan Kowalski',
    citizenPesel: '90010*****',
    permitId: IDS.permit1,
    permitNumber: 'PZ-2024-00001',
    permitType: 'Sport',
    requestedWeaponType: 'Karabinek sportowy CZ 457, kaliber .22LR',
    requestedQuantity: 1,
    status: 'Submitted',
    statusName: 'Submitted',
    rejectionReason: null,
    correctionNotes: null,
    createdAt: daysAgo(3),
    reviewedAt: null,
    reviewedByOfficerName: null,
  },
];

// ── Transfer requests (starts empty) ─────────────────────────────────────────

export const transferRequests: any[] = [];

// ── Medical alerts ────────────────────────────────────────────────────────────

export const medicalAlerts: any[] = [
  {
    id: IDS.alert1,
    permitId: IDS.permit1,
    permitNumber: 'PZ-2024-00001',
    alertType: 'MedicalExamExpiring',
    alertTypeName: 'MedicalExamExpiring',
    message: 'Badanie lekarskie wygasa za mniej niż 60 dni. Odwiedź lekarza i zaktualizuj zaświadczenie.',
    dueDate: daysFromNow(45),
    isResolved: false,
    createdAt: daysAgo(1),
  },
];

// ── WPA citizen snapshot ──────────────────────────────────────────────────────

export const wpaCitizen: any = {
  id: IDS.citizenProfile,
  userId: IDS.citizenUser,
  firstName: 'Jan',
  lastName: 'Kowalski',
  pesel: '90010*****',
  address: 'ul. Testowa 1, 00-001 Warszawa',
  documentNumber: 'ABC123456',
  weaponBookNumber: 'WB-2024-00001',
  createdAt: daysAgo(400),
  permits: [{ permitNumber: 'PZ-2024-00001', permitTypeName: 'Sport' }],
  totalFirearms: 1,
  activeAlerts: 1,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function paginate<T>(items: T[], page = 1, pageSize = 20) {
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    items: items.slice((safePage - 1) * pageSize, safePage * pageSize),
    totalCount,
    page: safePage,
    pageSize,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
}

export function uid() {
  return Math.random().toString(36).slice(2, 11);
}
