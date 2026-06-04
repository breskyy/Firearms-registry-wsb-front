import type { PermitMedicalExamRenewalDto, PermitMedicalExamRenewalStatus } from '../types/api';

export const PENDING_RENEWAL_STATUSES: PermitMedicalExamRenewalStatus[] = ['Submitted', 'UnderReview'];

export function isPendingRenewalStatus(status: string) {
  return PENDING_RENEWAL_STATUSES.includes(status as PermitMedicalExamRenewalStatus);
}

export function findPendingRenewal(renewals: PermitMedicalExamRenewalDto[], permitId: string) {
  return renewals.find((r) => r.permitId === permitId && isPendingRenewalStatus(r.status));
}

export function renewalStatusLabel(status: PermitMedicalExamRenewalStatus) {
  switch (status) {
    case 'Submitted':
      return 'Oczekuje na weryfikację WPA';
    case 'UnderReview':
      return 'W trakcie weryfikacji';
    case 'Approved':
      return 'Zatwierdzone';
    case 'Rejected':
      return 'Odrzucone';
    default:
      return status;
  }
}
