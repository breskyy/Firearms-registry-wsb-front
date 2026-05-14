import api from './api';
import type {
  VerifyPermitRequest,
  VerifyPermitResponse,
  RegisterSaleRequest,
  RegisterSaleResponse,
} from '../types/api';

const CATEGORY_VALUES: Record<string, number> = { A: 0, B: 1, C: 2 };

const PROMISE_STATUS_PL: Record<string, string> = {
  Draft: 'szkic',
  Submitted: 'złożona',
  Paid: 'opłacona',
  UnderReview: 'w weryfikacji',
  Approved: 'zatwierdzona',
  Rejected: 'odrzucona',
  Active: 'aktywna',
  Used: 'w całości wykorzystana',
  Expired: 'wygasła',
};

export function translateVerifyMessage(message: string): string {
  if (!message) return '';
  if (message === 'Promise not found') return 'Nie znaleziono promesy o podanym tokenie/numerze.';
  if (message === 'Promise has expired') return 'Promesa wygasła (termin ważności minął).';
  if (message === 'Promise has been fully used') return 'Promesa została w całości wykorzystana — wszystkie dozwolone sztuki zostały już sprzedane.';
  if (message === 'Associated permit is not valid') return 'Powiązane pozwolenie obywatela nie jest aktywne (zawieszone/cofnięte/wygasłe).';
  if (message === 'Verification successful') return 'Weryfikacja zakończona sukcesem.';

  const m = message.match(/^Promise is not active \(status: (\w+)\)$/);
  if (m) {
    const status = m[1];
    const pl = PROMISE_STATUS_PL[status] ?? status;
    if (status === 'Used') return 'Promesa została w całości wykorzystana — limit egzemplarzy wyczerpany. Obywatel musi złożyć nowy wniosek.';
    if (status === 'Expired') return 'Promesa wygasła — minął 3-miesięczny termin ważności.';
    if (status === 'Rejected') return 'Promesa została odrzucona przez WPA.';
    return `Promesa ma status "${pl}" i nie pozwala na rejestrację sprzedaży.`;
  }

  return message;
}

export const shopService = {
  async verifyPermit(data: VerifyPermitRequest): Promise<VerifyPermitResponse> {
    return api.post<VerifyPermitResponse>('/shop/verify-permit', data);
  },

  async registerSale(data: RegisterSaleRequest): Promise<RegisterSaleResponse> {
    const payload = {
      ...data,
      category: typeof data.category === 'string' ? CATEGORY_VALUES[data.category] : data.category,
    };
    return api.post<RegisterSaleResponse>('/shop/firearms/register-sale', payload);
  },
};
