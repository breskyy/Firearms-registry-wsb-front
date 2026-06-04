import type { WpaMedicalAlertDto, WpaPermitMedicalExamRenewalDto } from '../types/api';
import { PENDING_RENEWAL_STATUSES, isPendingRenewalStatus } from './medicalExamRenewals';
import { getApplicationStatusMeta, type StatusMeta } from './statusUi';

const RENEWAL_STATUS_PRIORITY: Record<string, number> = {
  Submitted: 0,
  UnderReview: 1,
};

export function sortVerificationRenewals(renewals: WpaPermitMedicalExamRenewalDto[]) {
  return [...renewals]
    .filter((r) => isPendingRenewalStatus(r.status))
    .sort((a, b) => {
      const statusDiff =
        (RENEWAL_STATUS_PRIORITY[a.status] ?? 9) - (RENEWAL_STATUS_PRIORITY[b.status] ?? 9);
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export function getRenewalStatusMeta(status: string): StatusMeta | null {
  if (status === 'Submitted' || status === 'UnderReview') {
    return getApplicationStatusMeta(status);
  }
  return null;
}

export function buildWpaMedicalWorkQueue(
  renewals: WpaPermitMedicalExamRenewalDto[],
  alerts: WpaMedicalAlertDto[],
) {
  const verificationRenewals = sortVerificationRenewals(renewals);
  const pendingPermitIds = new Set(
    verificationRenewals.map((r) => r.permitId).filter((id): id is string => Boolean(id)),
  );

  const monitoringAlerts = alerts.filter((alert) => {
    if (!alert.permitId) return true;
    return !pendingPermitIds.has(alert.permitId);
  });

  const tabCount = verificationRenewals.length + monitoringAlerts.length;

  return { verificationRenewals, monitoringAlerts, tabCount };
}

export function getMedicalWorkTabCount(
  renewals: WpaPermitMedicalExamRenewalDto[],
  alerts: WpaMedicalAlertDto[],
) {
  return buildWpaMedicalWorkQueue(renewals, alerts).tabCount;
}
