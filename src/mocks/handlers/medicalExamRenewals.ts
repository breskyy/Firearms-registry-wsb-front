import { http, HttpResponse } from 'msw';
import * as db from '../db';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const toIso = (date: string) => (date.includes('T') ? date : `${date}T00:00:00Z`);

function mapRenewal(r: (typeof db.medicalExamRenewals)[number]) {
  const permit = db.permits.find((p) => p.id === r.permitId);
  const citizen = db.wpaCitizens.find((c) => c.id === r.citizenId);
  return {
    ...r,
    permitNumber: permit?.permitNumber ?? r.permitNumber,
    permitTypeName: permit?.permitTypeName ?? permit?.permitType,
    citizenName: citizen ? `${citizen.firstName} ${citizen.lastName}` : 'Jan Kowalski',
    citizenPesel: citizen?.pesel ?? '90010112345',
  };
}

export const medicalExamRenewalHandlers = [
  http.get(`${BASE}/citizen/me/medical-exam-renewals`, () =>
    HttpResponse.json(
      db.medicalExamRenewals
        .filter((r) => r.citizenId === db.IDS.citizenProfile)
        .map(mapRenewal),
    ),
  ),

  http.get(`${BASE}/citizen/me/permits/:permitId/medical-exam-renewals`, ({ params }) => {
    const permitId = String(params.permitId);
    return HttpResponse.json(
      db.medicalExamRenewals
        .filter((r) => r.permitId === permitId && r.citizenId === db.IDS.citizenProfile)
        .map(mapRenewal),
    );
  }),

  http.post(`${BASE}/citizen/me/permits/:permitId/medical-exam-renewals`, async ({ params, request }) => {
    const permitId = String(params.permitId);
    const permit = db.permits.find((p) => p.id === permitId && p.citizenId === db.IDS.citizenProfile);
    if (!permit) return HttpResponse.json({ message: 'Permit not found' }, { status: 404 });
    if (db.getPendingRenewalForPermit(permitId)) {
      return HttpResponse.json({ message: 'A medical exam renewal is already pending for this permit' }, { status: 409 });
    }

    const form = await request.formData();
    const medicalDate = String(form.get('medicalExamExpiryDate') ?? '');
    const psychDate = String(form.get('psychologicalExamExpiryDate') ?? '');
    const medicalFile = form.get('medicalCertificate') as File | null;
    const psychFile = form.get('psychologicalCertificate') as File | null;

    if (!medicalDate || !psychDate || !medicalFile || !psychFile) {
      return HttpResponse.json({ message: 'Both certificates and dates are required' }, { status: 400 });
    }

    const renewal = {
      id: `renewal-${db.uid()}`,
      permitId,
      permitNumber: permit.permitNumber,
      citizenId: db.IDS.citizenProfile,
      status: 'Submitted',
      statusName: 'Submitted',
      proposedMedicalExamExpiryDate: toIso(medicalDate),
      proposedPsychologicalExamExpiryDate: toIso(psychDate),
      rejectionReason: null,
      reviewedAt: null,
      createdAt: new Date().toISOString(),
      attachments: [
        {
          id: `ratt-${db.uid()}`,
          attachmentType: 'MedicalCertificate',
          attachmentTypeName: 'MedicalCertificate',
          fileName: medicalFile.name || 'badanie-lekarskie.pdf',
          contentType: medicalFile.type || 'application/pdf',
          fileSize: medicalFile.size,
          createdAt: new Date().toISOString(),
        },
        {
          id: `ratt-${db.uid()}`,
          attachmentType: 'PsychologicalCertificate',
          attachmentTypeName: 'PsychologicalCertificate',
          fileName: psychFile.name || 'badanie-psychologiczne.pdf',
          contentType: psychFile.type || 'application/pdf',
          fileSize: psychFile.size,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    db.medicalExamRenewals.unshift(renewal);
    return HttpResponse.json(mapRenewal(renewal), { status: 201 });
  }),

  http.get(`${BASE}/wpa/medical-exam-renewals`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = Number(url.searchParams.get('page') ?? 1);
    const pageSize = Number(url.searchParams.get('pageSize') ?? 20);

    let items = db.medicalExamRenewals.map(mapRenewal);
    if (status) {
      items = items.filter((r) => r.status === status);
    } else {
      items = items.filter((r) => db.PENDING_RENEWAL_STATUSES.has(r.status));
    }

    return HttpResponse.json(db.paginate(items, page, pageSize));
  }),

  http.get(`${BASE}/wpa/medical-exam-renewals/:id`, ({ params }) => {
    const renewal = db.medicalExamRenewals.find((r) => r.id === params.id);
    if (!renewal) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(mapRenewal(renewal));
  }),

  http.get(`${BASE}/wpa/medical-exam-renewals/:renewalId/attachments/:attachmentId`, ({ params }) => {
    const renewal = db.medicalExamRenewals.find((r) => r.id === params.renewalId);
    const att = renewal?.attachments?.find((a: { id: string }) => a.id === params.attachmentId);
    if (!att) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return new HttpResponse(new Uint8Array([0x25, 0x50, 0x44, 0x46]), {
      headers: { 'Content-Type': att.contentType, 'Content-Disposition': `attachment; filename="${att.fileName}"` },
    });
  }),

  http.post(`${BASE}/wpa/medical-exam-renewals/:id/mark-under-review`, ({ params }) => {
    const renewal = db.medicalExamRenewals.find((r) => r.id === params.id);
    if (!renewal) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    renewal.status = 'UnderReview';
    renewal.statusName = 'UnderReview';
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${BASE}/wpa/medical-exam-renewals/:id/approve`, async ({ params, request }) => {
    const renewal = db.medicalExamRenewals.find((r) => r.id === params.id);
    if (!renewal) return HttpResponse.json({ message: 'Not found' }, { status: 404 });

    const body = (await request.json().catch(() => ({}))) as {
      medicalExamExpiryDate?: string;
      psychologicalExamExpiryDate?: string;
    };

    const permit = db.permits.find((p) => p.id === renewal.permitId);
    if (permit) {
      permit.medicalExamExpiryDate = body.medicalExamExpiryDate
        ? toIso(body.medicalExamExpiryDate)
        : renewal.proposedMedicalExamExpiryDate;
      permit.psychologicalExamExpiryDate = body.psychologicalExamExpiryDate
        ? toIso(body.psychologicalExamExpiryDate)
        : renewal.proposedPsychologicalExamExpiryDate;
    }

    renewal.status = 'Approved';
    renewal.statusName = 'Approved';
    renewal.reviewedAt = new Date().toISOString();
    db.resolveMedicalAlertsForPermit(renewal.permitId);
    db.syncMedicalAlertsFromPermits();

    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${BASE}/wpa/medical-exam-renewals/:id/reject`, async ({ params, request }) => {
    const renewal = db.medicalExamRenewals.find((r) => r.id === params.id);
    if (!renewal) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const body = (await request.json()) as { reason?: string };
    renewal.status = 'Rejected';
    renewal.statusName = 'Rejected';
    renewal.rejectionReason = body.reason ?? 'Odrzucono';
    renewal.reviewedAt = new Date().toISOString();
    return new HttpResponse(null, { status: 204 });
  }),
];
