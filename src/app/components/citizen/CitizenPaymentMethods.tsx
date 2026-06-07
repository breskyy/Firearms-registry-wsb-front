import { useRef, useState } from 'react';
import { Building2, CreditCard, ExternalLink, Loader2, Upload, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { citizenService } from '../../../services/citizenService';
import { getApiErrorMessage } from '../../../lib/apiErrors';
import {
  formatPlnAmount,
  MOCK_BANK_TRANSFER_DETAILS,
} from '../../../lib/paymentUi';
import type { ApplicationPaymentStatus, PaymentMethod } from '../../../types/api';

const FILE_ACCEPT = 'application/pdf,image/jpeg,image/png';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type ApplicationKind = 'permit' | 'promise';

type Props = {
  applicationId: string;
  applicationType: ApplicationKind;
  feeAmount: number;
  paymentStatus: ApplicationPaymentStatus;
  paymentRejectionComment?: string | null;
  onUpdated: (status: ApplicationPaymentStatus) => void;
};

function buildTransferTitle(applicationId: string, kind: ApplicationKind) {
  return kind === 'permit'
    ? `Opłata skarbowa — wniosek o pozwolenie ${applicationId}`
    : `Opłata skarbowa — promesa ${applicationId}`;
}

export function CitizenPaymentMethods({
  applicationId,
  applicationType,
  feeAmount,
  paymentStatus,
  paymentRejectionComment,
  onUpdated,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState<'initiate' | 'confirm' | 'upload' | null>(null);
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);
  const [mockRedirectUrl, setMockRedirectUrl] = useState<string | null>(null);

  const canPay = paymentStatus === 'Pending';
  const isAwaitingVerification = paymentStatus === 'Submitted';

  const handleInitiateOnline = async () => {
    setLoading('initiate');
    try {
      const initiated =
        applicationType === 'permit'
          ? await citizenService.initiatePermitApplicationPayment(applicationId)
          : await citizenService.initiatePromiseApplicationPayment(applicationId);

      if (!initiated.paymentReferenceId) {
        throw new Error('Brak identyfikatora płatności');
      }

      setPendingPaymentId(initiated.paymentReferenceId);
      setMockRedirectUrl(initiated.paymentUrl ?? null);
      toast.info('Przekierowanie do mock ePłatności', {
        description: 'W wersji demo symulujemy powrót z bramki płatniczej.',
      });
    } catch (err: unknown) {
      toast.error('Nie udało się rozpocząć płatności', {
        description: getApiErrorMessage(err) || 'Spróbuj ponownie',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleConfirmOnline = async () => {
    if (!pendingPaymentId) return;
    setLoading('confirm');
    try {
      const confirmed =
        applicationType === 'permit'
          ? await citizenService.confirmPermitApplicationPayment(applicationId, pendingPaymentId)
          : await citizenService.confirmPromiseApplicationPayment(applicationId, pendingPaymentId);

      onUpdated(confirmed.paymentStatus);
      setPendingPaymentId(null);
      setMockRedirectUrl(null);
      toast.success('Płatność online zarejestrowana', {
        description: 'Urząd WPA zweryfikuje wpłatę przed rozpatrzeniem wniosku.',
      });
    } catch (err: unknown) {
      toast.error('Nie udało się potwierdzić płatności', {
        description: getApiErrorMessage(err) || 'Spróbuj ponownie',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleUploadProof = async (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Plik jest za duży', { description: 'Maksymalny rozmiar to 10 MB.' });
      return;
    }

    setLoading('upload');
    try {
      if (applicationType === 'permit') {
        await citizenService.uploadPermitApplicationPaymentProof(applicationId, file);
      } else {
        await citizenService.uploadPromiseApplicationPaymentProof(applicationId, file);
      }
      onUpdated('Submitted');
      toast.success('Dowód wpłaty przesłany', {
        description: 'Urząd zweryfikuje opłatę przed rozpatrzeniem wniosku.',
      });
    } catch (err: unknown) {
      toast.error('Nie udało się przesłać dowodu', {
        description: getApiErrorMessage(err) || 'Spróbuj ponownie',
      });
    } finally {
      setLoading(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isAwaitingVerification) {
    return (
      <p className="text-xs text-blue-800 bg-blue-50 rounded-xl px-3 py-2">
        Wpłata została zgłoszona. WPA zweryfikuje opłatę przed przyjęciem wniosku do rozpatrzenia.
      </p>
    );
  }

  if (!canPay) return null;

  return (
    <div className="space-y-4">
      {paymentRejectionComment && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-xs text-red-900">
          <p className="font-semibold mb-1">Urząd odrzucił poprzedni dowód wpłaty</p>
          <p className="leading-relaxed whitespace-pre-wrap">{paymentRejectionComment}</p>
          <p className="mt-1.5 text-red-800">Opłać ponownie i prześlij poprawny dowód.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setSelectedMethod('OnlineMock')}
          className={cn(
            'rounded-xl border p-3 text-left transition-colors min-h-[72px]',
            selectedMethod === 'OnlineMock' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40',
          )}
        >
          <div className="flex items-start gap-2">
            <Wallet className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
            <div>
              <p className="text-sm font-semibold">Opłać online</p>
              <p className="text-xs text-muted-foreground mt-0.5">Mock ePłatności (symulacja bramki)</p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedMethod('BankTransfer')}
          className={cn(
            'rounded-xl border p-3 text-left transition-colors min-h-[72px]',
            selectedMethod === 'BankTransfer' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40',
          )}
        >
          <div className="flex items-start gap-2">
            <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
            <div>
              <p className="text-sm font-semibold">Przelew bankowy</p>
              <p className="text-xs text-muted-foreground mt-0.5">Wpłata na rachunek WPA + dowód PDF/JPG/PNG</p>
            </div>
          </div>
        </button>
      </div>

      {selectedMethod === 'OnlineMock' && (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 space-y-3">
          {!pendingPaymentId ? (
            <>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Po kliknięciu zostaniesz przekierowany do mock bramki płatniczej. W produkcji byłby to system ePłatności Urzędu Miasta.
              </p>
              <Button
                type="button"
                className="w-full rounded-xl min-h-[44px]"
                disabled={loading !== null}
                onClick={() => void handleInitiateOnline()}
              >
                {loading === 'initiate' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden />
                    Przekierowanie…
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" aria-hidden />
                    Przejdź do płatności {formatPlnAmount(feeAmount)}
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-lg bg-background border px-3 py-2 text-xs space-y-1">
                <p className="font-medium flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  Symulacja powrotu z bramki płatniczej
                </p>
                {mockRedirectUrl && (
                  <p className="text-muted-foreground break-all">URL: {mockRedirectUrl}</p>
                )}
                <p className="text-muted-foreground">ID płatności: {pendingPaymentId}</p>
              </div>
              <Button
                type="button"
                className="w-full rounded-xl min-h-[44px]"
                disabled={loading !== null}
                onClick={() => void handleConfirmOnline()}
              >
                {loading === 'confirm' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden />
                    Potwierdzanie…
                  </>
                ) : (
                  'Potwierdź opłatę (mock powrót z bramki)'
                )}
              </Button>
            </>
          )}
        </div>
      )}

      {selectedMethod === 'BankTransfer' && (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 space-y-3">
          <p className="text-xs font-semibold text-foreground">Dane do przelewu</p>
          <dl className="grid gap-1.5 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Odbiorca</dt>
              <dd className="text-right font-medium">{MOCK_BANK_TRANSFER_DETAILS.accountHolder}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Bank</dt>
              <dd className="text-right">{MOCK_BANK_TRANSFER_DETAILS.bankName}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Nr rachunku</dt>
              <dd className="text-right font-mono">{MOCK_BANK_TRANSFER_DETAILS.accountNumber}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Kwota</dt>
              <dd className="text-right font-semibold">{formatPlnAmount(feeAmount)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground mb-0.5">Tytuł przelewu</dt>
              <dd className="font-mono text-[11px] break-all bg-background rounded px-2 py-1 border">
                {buildTransferTitle(applicationId, applicationType)}
              </dd>
            </div>
          </dl>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl min-h-[44px]"
            disabled={loading !== null}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" aria-hidden />
            {loading === 'upload' ? 'Wysyłanie…' : 'Prześlij potwierdzenie przelewu (PDF/JPG/PNG)'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={FILE_ACCEPT}
            className="hidden"
            onChange={(e) => void handleUploadProof(e.target.files?.[0] ?? null)}
          />
        </div>
      )}
    </div>
  );
}
