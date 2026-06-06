import { http, HttpResponse } from 'msw';
import * as db from '../db';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const mockPayments = new Map<string, { amount: number; status: string }>();

function buildPaymentResponse(app: { id: string; feeAmount: number; paymentStatus: string; paymentStatusName: string; paymentReferenceId?: string | null }, paymentUrl?: string | null) {
  return {
    applicationId: app.id,
    feeAmount: app.feeAmount,
    paymentStatus: app.paymentStatus,
    paymentStatusName: app.paymentStatusName,
    paymentReferenceId: app.paymentReferenceId ?? null,
    paymentUrl: paymentUrl ?? null,
  };
}

export const citizenHandlers = [
  // ── Profile ────────────────────────────────────────────────────────────────
  http.get(`${BASE}/citizen/me`, () =>
    HttpResponse.json({
      id: db.IDS.citizenProfile,
      firstName: 'Jan',
      lastName: 'Kowalski',
      peselMasked: '90010*****',
      address: 'ul. Testowa 1, 00-001 Warszawa',
      documentNumber: 'ABC123456',
      weaponBookNumber: 'WB-2024-00001',
      createdAt: new Date(Date.now() - 400 * 86_400_000).toISOString(),
    })
  ),

  // ── Permits ────────────────────────────────────────────────────────────────
  http.get(`${BASE}/citizen/me/permits`, () => HttpResponse.json(db.permits)),

  // ── Permit applications ────────────────────────────────────────────────────
  http.get(`${BASE}/citizen/me/permit-applications`, () =>
    HttpResponse.json(db.permitApplications.map(({ citizenId, citizenName, citizenPesel, reviewedByOfficerName, ...rest }) => rest))
  ),

  http.post(`${BASE}/citizen/me/permit-applications`, async ({ request }) => {
    const body = await request.json() as { requestedPermitType?: number | string; reason?: string };
    const permitTypeNames = ['Sport', 'Collection', 'Protection', 'Hunting', 'Other'] as const;
    const requestedPermitType =
      typeof body.requestedPermitType === 'number'
        ? body.requestedPermitType
        : permitTypeNames.indexOf(body.requestedPermitType as (typeof permitTypeNames)[number]);
    const requestedPermitTypeName =
      typeof body.requestedPermitType === 'string'
        ? body.requestedPermitType
        : permitTypeNames[requestedPermitType] ?? 'Sport';
    const app = {
      id: db.uid(),
      citizenId: db.IDS.citizenProfile,
      citizenName: 'Jan Kowalski',
      citizenPesel: '90010*****',
      requestedPermitType,
      requestedPermitTypeName,
      reason: body.reason,
      medicalExamExpiryDate: body.medicalExamExpiryDate ?? null,
      psychologicalExamExpiryDate: body.psychologicalExamExpiryDate ?? null,
      status: 'Submitted',
      statusName: 'Submitted',
      rejectionReason: null,
      correctionNotes: null,
      createdAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedByOfficerName: null,
      feeAmount: 242,
      paymentStatus: 'Pending',
      paymentStatusName: 'Pending',
      paymentReferenceId: null,
      attachments: [],
    };
    db.permitApplications.push(app);
    return HttpResponse.json(app, { status: 201 });
  }),

  http.put(`${BASE}/citizen/me/permit-applications/:id/correction`, async ({ params, request }) => {
    const app = db.permitApplications.find((a) => a.id === params.id);
    if (!app) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const body = await request.json() as any;
    const permitTypeNames = ['Sport', 'Collection', 'Protection', 'Hunting', 'Other'] as const;
    const requestedPermitType =
      typeof body.requestedPermitType === 'number'
        ? body.requestedPermitType
        : permitTypeNames.indexOf(body.requestedPermitType as (typeof permitTypeNames)[number]);
    const requestedPermitTypeName =
      typeof body.requestedPermitType === 'string'
        ? body.requestedPermitType
        : permitTypeNames[requestedPermitType] ?? 'Sport';
    Object.assign(app, {
      requestedPermitType,
      requestedPermitTypeName,
      reason: body.reason,
      medicalExamExpiryDate: body.medicalExamExpiryDate ?? app.medicalExamExpiryDate,
      psychologicalExamExpiryDate: body.psychologicalExamExpiryDate ?? app.psychologicalExamExpiryDate,
      status: 'Submitted',
      statusName: 'Submitted',
      correctionNotes: null,
    });
    return HttpResponse.json(app);
  }),

  http.post(`${BASE}/citizen/me/permit-applications/:id/attachments`, async ({ params, request }) => {
    const app = db.permitApplications.find((a) => a.id === params.id);
    if (!app) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }

    const uploaded: Array<{
      id: string;
      attachmentType: string;
      attachmentTypeName: string;
      fileName: string;
      contentType: string;
      fileSize: number;
      createdAt: string;
    }> = [];

    const addAttachment = (
      type: 'MedicalCertificate' | 'PsychologicalCertificate',
      file: File,
    ) => {
      app.attachments = app.attachments.filter(
        (existing: { attachmentType: string }) => existing.attachmentType !== type,
      );
      const att = {
        id: db.uid(),
        attachmentType: type,
        attachmentTypeName: type,
        fileName: file.name || (type === 'MedicalCertificate' ? 'badanie-lekarskie.pdf' : 'badanie-psychologiczne.pdf'),
        contentType: file.type || 'application/pdf',
        fileSize: file.size,
        createdAt: new Date().toISOString(),
      };
      app.attachments.push(att);
      uploaded.push(att);
    };

    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const medical = formData.get('medicalCertificate');
      const psychological = formData.get('psychologicalCertificate');
      const medicalExpiry = formData.get('medicalExamExpiryDate');
      const psychologicalExpiry = formData.get('psychologicalExamExpiryDate');
      if (typeof medicalExpiry === 'string' && medicalExpiry) {
        app.medicalExamExpiryDate = medicalExpiry.includes('T')
          ? medicalExpiry
          : `${medicalExpiry}T00:00:00Z`;
      }
      if (typeof psychologicalExpiry === 'string' && psychologicalExpiry) {
        app.psychologicalExamExpiryDate = psychologicalExpiry.includes('T')
          ? psychologicalExpiry
          : `${psychologicalExpiry}T00:00:00Z`;
      }
      if (medical instanceof File && medical.size > 0) {
        addAttachment('MedicalCertificate', medical);
      }
      if (psychological instanceof File && psychological.size > 0) {
        addAttachment('PsychologicalCertificate', psychological);
      }
    } else {
      addAttachment('MedicalCertificate', new File(['mock'], 'badanie-lekarskie.pdf', { type: 'application/pdf' }));
      addAttachment(
        'PsychologicalCertificate',
        new File(['mock'], 'badanie-psychologiczne.pdf', { type: 'application/pdf' }),
      );
    }

    if (uploaded.length === 0) {
      return HttpResponse.json({ message: 'At least one certificate file is required' }, { status: 400 });
    }

    return HttpResponse.json(app.attachments, { status: 200 });
  }),

  http.post(`${BASE}/citizen/me/permit-applications/:id/payment/initiate`, ({ params }) => {
    const app = db.permitApplications.find((a) => a.id === params.id);
    if (!app) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const paymentId = `PAY-${db.uid().slice(0, 12).toUpperCase()}`;
    app.paymentReferenceId = paymentId;
    mockPayments.set(paymentId, { amount: app.feeAmount ?? 242, status: 'Pending' });
    return HttpResponse.json(buildPaymentResponse(app, `https://mock-payment.example.com/pay/${paymentId}`));
  }),

  http.post(`${BASE}/citizen/me/permit-applications/:id/payment/confirm`, async ({ params, request }) => {
    const app = db.permitApplications.find((a) => a.id === params.id);
    if (!app) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const body = await request.json() as { paymentId?: string };
    if (!body.paymentId || app.paymentReferenceId !== body.paymentId) {
      return HttpResponse.json({ message: 'Payment reference does not match this application' }, { status: 409 });
    }
    mockPayments.set(body.paymentId, { amount: app.feeAmount ?? 242, status: 'Completed' });
    app.paymentStatus = 'Submitted';
    app.paymentStatusName = 'Submitted';
    return HttpResponse.json(buildPaymentResponse(app));
  }),

  http.post(`${BASE}/citizen/me/permit-applications/:id/payment-proof`, async ({ params, request }) => {
    const app = db.permitApplications.find((a) => a.id === params.id);
    if (!app) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const formData = await request.formData();
    const file = formData.get('paymentProof');
    const fileName = file instanceof File ? file.name : 'dowod-wplaty.pdf';
    app.attachments = app.attachments.filter((a: { attachmentType: string }) => a.attachmentType !== 'PaymentProof');
    const att = {
      id: db.uid(),
      attachmentType: 'PaymentProof',
      attachmentTypeName: 'PaymentProof',
      fileName,
      contentType: 'application/pdf',
      fileSize: file instanceof File ? file.size : 1024,
      createdAt: new Date().toISOString(),
    };
    app.attachments.push(att);
    app.paymentStatus = 'Submitted';
    app.paymentStatusName = 'Submitted';
    return HttpResponse.json(att);
  }),

  // ── Promise applications ───────────────────────────────────────────────────
  http.get(`${BASE}/citizen/me/promise-applications`, () =>
    HttpResponse.json(db.promiseApplications.map(({ citizenId, citizenName, citizenPesel, reviewedByOfficerName, ...rest }) => rest))
  ),

  http.post(`${BASE}/citizen/me/promise-applications`, async ({ request }) => {
    const body = await request.json() as any;
    const permit = db.permits.find((p) => p.id === body.permitId);
    const app = {
      id: db.uid(),
      citizenId: db.IDS.citizenProfile,
      citizenName: 'Jan Kowalski',
      citizenPesel: '90010*****',
      permitId: body.permitId,
      permitNumber: permit?.permitNumber ?? '',
      permitType: permit?.permitTypeName ?? '',
      requestedWeaponType: body.requestedWeaponType,
      requestedQuantity: body.requestedQuantity,
      status: 'Submitted',
      statusName: 'Submitted',
      rejectionReason: null,
      correctionNotes: null,
      createdAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedByOfficerName: null,
      feeAmount: (body.requestedQuantity ?? 1) * 17,
      paymentStatus: 'Pending',
      paymentStatusName: 'Pending',
      paymentReferenceId: null,
      attachments: [],
    };
    db.promiseApplications.push(app);
    return HttpResponse.json(app, { status: 201 });
  }),

  http.put(`${BASE}/citizen/me/promise-applications/:id/correction`, async ({ params, request }) => {
    const app = db.promiseApplications.find((a) => a.id === params.id);
    if (!app) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const body = await request.json() as any;
    Object.assign(app, {
      requestedWeaponType: body.requestedWeaponType,
      requestedQuantity: body.requestedQuantity,
      status: 'Submitted',
      statusName: 'Submitted',
      correctionNotes: null,
    });
    return HttpResponse.json(app);
  }),

  http.post(`${BASE}/citizen/me/promise-applications/:id/payment/initiate`, ({ params }) => {
    const app = db.promiseApplications.find((a) => a.id === params.id);
    if (!app) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const paymentId = `PAY-${db.uid().slice(0, 12).toUpperCase()}`;
    app.paymentReferenceId = paymentId;
    mockPayments.set(paymentId, { amount: app.feeAmount ?? 17, status: 'Pending' });
    return HttpResponse.json(buildPaymentResponse(app, `https://mock-payment.example.com/pay/${paymentId}`));
  }),

  http.post(`${BASE}/citizen/me/promise-applications/:id/payment/confirm`, async ({ params, request }) => {
    const app = db.promiseApplications.find((a) => a.id === params.id);
    if (!app) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const body = await request.json() as { paymentId?: string };
    if (!body.paymentId || app.paymentReferenceId !== body.paymentId) {
      return HttpResponse.json({ message: 'Payment reference does not match this application' }, { status: 409 });
    }
    app.paymentStatus = 'Submitted';
    app.paymentStatusName = 'Submitted';
    return HttpResponse.json(buildPaymentResponse(app));
  }),

  http.post(`${BASE}/citizen/me/promise-applications/:id/payment-proof`, async ({ params, request }) => {
    const app = db.promiseApplications.find((a) => a.id === params.id);
    if (!app) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const formData = await request.formData();
    const file = formData.get('paymentProof');
    const fileName = file instanceof File ? file.name : 'dowod-wplaty.pdf';
    app.attachments = (app.attachments ?? []).filter((a: { attachmentType: string }) => a.attachmentType !== 'PaymentProof');
    const att = {
      id: db.uid(),
      attachmentType: 'PaymentProof',
      attachmentTypeName: 'PaymentProof',
      fileName,
      contentType: 'application/pdf',
      fileSize: file instanceof File ? file.size : 1024,
      createdAt: new Date().toISOString(),
    };
    app.attachments.push(att);
    app.paymentStatus = 'Submitted';
    app.paymentStatusName = 'Submitted';
    return HttpResponse.json(att);
  }),

  // ── Promises ───────────────────────────────────────────────────────────────
  http.get(`${BASE}/citizen/me/promises`, () => HttpResponse.json(db.promises)),

  // ── Firearms ───────────────────────────────────────────────────────────────
  http.get(`${BASE}/citizen/me/firearms`, () =>
    HttpResponse.json(db.firearms.map(({ ownershipHistory, ...f }) => f))
  ),

  http.get(`${BASE}/citizen/me/firearms/:id`, ({ params }) => {
    const f = db.firearms.find((f) => f.id === params.id);
    if (!f) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(f);
  }),

  http.post(`${BASE}/citizen/me/firearms/:id/report-lost`, ({ params }) => {
    const f = db.firearms.find((f) => f.id === params.id);
    if (f) { f.status = 'Lost'; f.statusName = 'Lost'; }
    return new HttpResponse(null, { status: 204 });
  }),

  // ── Transfer requests ──────────────────────────────────────────────────────
  http.get(`${BASE}/citizen/me/transfer-requests`, () => HttpResponse.json(db.transferRequests)),

  http.post(`${BASE}/citizen/me/transfer-requests`, async ({ request }) => {
    const body = await request.json() as any;
    const firearm = db.firearms.find((f) => f.id === body.firearmId);
    const req = {
      id: db.uid(),
      firearmId: body.firearmId,
      firearmDescription: firearm
        ? `${firearm.brand} ${firearm.model} (${firearm.serialNumber})`
        : body.firearmId,
      buyerName: null,
      transferType: body.transferType,
      transferTypeName: body.transferType,
      status: 'PendingAcceptance',
      statusName: 'PendingAcceptance',
      transactionDate: null,
      createdAt: new Date().toISOString(),
      isSeller: true,
      isBuyer: false,
    };
    db.transferRequests.push(req);
    return HttpResponse.json(req, { status: 201 });
  }),

  http.post(`${BASE}/citizen/me/transfer-requests/:id/accept`, ({ params }) => {
    const req = db.transferRequests.find((r) => r.id === params.id);
    if (req) { req.status = 'Accepted'; req.statusName = 'Accepted'; }
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${BASE}/citizen/me/transfer-requests/:id/reject`, ({ params }) => {
    const req = db.transferRequests.find((r) => r.id === params.id);
    if (req) { req.status = 'Rejected'; req.statusName = 'Rejected'; }
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${BASE}/citizen/me/transfer-requests/:id/cancel`, ({ params }) => {
    const req = db.transferRequests.find((r) => r.id === params.id);
    if (req) { req.status = 'Cancelled'; req.statusName = 'Cancelled'; }
    return new HttpResponse(null, { status: 204 });
  }),

  // ── Medical alerts ─────────────────────────────────────────────────────────
  http.get(`${BASE}/citizen/me/medical-alerts`, () => {
    db.syncMedicalAlertsFromPermits();
    return HttpResponse.json(db.medicalAlerts.filter((a) => !a.isResolved));
  }),
];
