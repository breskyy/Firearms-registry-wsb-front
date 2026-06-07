import type { ApplicationPaymentStatus } from '../types/api';

export const PERMIT_APPLICATION_FEE = 242;
export const PROMISE_FEE_PER_CERTIFICATE = 17;

export const MOCK_BANK_TRANSFER_DETAILS = {
  accountNumber: '12 3456 7890 1234 5678 9012 3456',
  accountHolder: 'Urząd Miasta — Wydział Policji Administracyjnej (WPA)',
  bankName: 'Bank Demo S.A.',
} as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  OnlineMock: 'ePłatności (mock)',
  BankTransfer: 'Przelew bankowy',
};

type PaymentStatusMeta = {
  label: string;
  badgeClassName: string;
  description: string;
};

const BADGE_BASE = 'border-none px-2 py-0.5 rounded-full text-xs font-medium';

export const APPLICATION_PAYMENT_STATUS_META: Record<ApplicationPaymentStatus, PaymentStatusMeta> = {
  Pending: {
    label: 'Oczekuje opłaty',
    badgeClassName: `bg-amber-100 text-amber-900 ${BADGE_BASE}`,
    description: 'Opłata skarbowa nie została jeszcze zgłoszona.',
  },
  Submitted: {
    label: 'Wpłata zgłoszona',
    badgeClassName: `bg-blue-100 text-blue-800 ${BADGE_BASE}`,
    description: 'Dowód wpłaty lub płatność mock czeka na weryfikację WPA.',
  },
  Paid: {
    label: 'Opłacone',
    badgeClassName: `bg-emerald-100 text-emerald-800 ${BADGE_BASE}`,
    description: 'Opłata została zweryfikowana przez urząd.',
  },
  Failed: {
    label: 'Płatność nieudana',
    badgeClassName: `bg-red-100 text-red-800 ${BADGE_BASE}`,
    description: 'Płatność nie powiodła się — spróbuj ponownie.',
  },
  Refunded: {
    label: 'Zwrócona',
    badgeClassName: `bg-slate-100 text-slate-700 ${BADGE_BASE}`,
    description: 'Opłata została zwrócona.',
  },
};

export function getApplicationPaymentStatusMeta(status: string): PaymentStatusMeta | null {
  return APPLICATION_PAYMENT_STATUS_META[status as ApplicationPaymentStatus] ?? null;
}

export function formatPlnAmount(amount: number) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
