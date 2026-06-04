## 1. Backend — domain and persistence

- [x] 1.1 Add `PermitMedicalExamRenewal` entity, status enum, and attachment entity (mirror `PermitApplicationAttachment` patterns)
- [x] 1.2 Add EF configuration, migration, and unique index (one pending renewal per permit)
- [x] 1.3 Add DTOs and service methods: submit, list (citizen), list/detail (WPA), approve, reject, download attachment
- [x] 1.4 On approve: overwrite permit exam dates, audit log, resolve matching medical alerts
- [x] 1.5 Add `CitizenController` and `WpaController` endpoints per design.md
- [x] 1.6 Extend seed data with sample expired exams and optional pending renewal

## 2. Backend — tests

- [x] 2.1 Unit tests: cannot submit second pending renewal; approve updates permit dates; reject leaves dates unchanged
- [x] 2.2 Unit tests: history retained after approve (replace-within-renewal dropped from scope; correction via reject + resubmit)

## 3. Frontend — API layer

- [x] 3.1 Add TypeScript types and `citizenService` / `wpaService` methods for renewals
- [x] 3.2 Add MSW handlers and `db` helpers for renewal CRUD and attachment download

## 4. Frontend — citizen UI

- [x] 4.1 Create `PermitExamRenewalForm` (reuse `CertificateUploadRow` / validation from permit application)
- [x] 4.2 Wire CTA + pending status into `MedicalAlertsView` and `PermitDetails`
- [x] 4.3 Update copy in `PermitExamStatusRow` when renewal is available vs pending

## 5. Frontend — WPA UI

- [x] 5.1 Add renewal queue section on `OfficerDashboard` or dedicated list route
- [x] 5.2 Add renewal review page/dialog: attachments preview/download, approve/reject
- [x] 5.3 Link from medical alert "Aktualizuj badania" to renewal detail when pending exists, else citizen profile + renewal queue
- [x] 5.4 Label existing manual date form as registry override (optional UX polish)

## 6. Verification

- [ ] 6.1 E2E manual: citizen with expired exam submits renewal → WPA approves → medical view shows current dates and `medicalExamsValid` true in shop verify
- [ ] 6.2 E2E manual: reject path allows resubmission; history shows prior rejected renewal
