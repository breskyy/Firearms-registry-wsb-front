import { useRef, useState } from 'react';
import { CreditCard, Upload, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { cn } from '../ui/utils';
import { CITIZEN_LIST_CARD_CONTENT_CLASS, CITIZEN_NAV_ICON_TONE } from '../../utils/citizenCardUi';
import { citizenService } from '../../../services/citizenService';
import { getApiErrorMessage } from '../../../lib/apiErrors';
import {
  formatPlnAmount,
  getApplicationPaymentStatusMeta,
} from '../../../lib/paymentUi';
import type { ApplicationPaymentStatus } from '../../../types/api';

const FILE_ACCEPT = 'application/pdf,image/jpeg,image/png';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type Props = {
  applicationId: string;
  applicationType: 'permit' | 'promise';
  feeAmount: number;
  paymentStatus: ApplicationPaymentStatus;
  paymentStatusName: string;
  onPaymentUpdated: () => void;
};

export function ApplicationPaymentCard({
  applicationId,
  applicationType,
  feeAmount,
  paymentStatus,
  paymentStatusName,
  onPaymentUpdated,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<'mock' | 'upload' | null>(null);
  const paymentMeta = getApplicationPaymentStatusMeta(paymentStatusName) ?? getApplicationPaymentStatusMeta(paymentStatus);

  const canPay = paymentStatus === 'Pending' || paymentStatusName === 'Pending';
  const isAwaitingVerification = paymentStatus === 'Submitted' || paymentStatusName === 'Submitted';

  const handleMockPayment = async () => {
    setLoading('mock');
    try {
      const initiate =
        applicationType === 'permit'
          ? await citizenService.initiatePermitApplicationPayment(applicationId)
          : await citizenService.initiatePromiseApplicationPayment(applicationId);

      if (!initiate.paymentReferenceId) {
        throw new Error('Brak identyfikatora płatności');
      }

      const confirmed =
        applicationType === 'permit'
          ? await citizenService.confirmPermitApplicationPayment(applicationId, initiate.paymentReferenceId)
          : await citizenService.confirmPromiseApplicationPayment(applicationId, initiate.paymentReferenceId);

      toast.success('Płatność mock zakończona', {
        description: `Wpłata ${formatPlnAmount(confirmed.feeAmount)} oczekuje na weryfikację WPA.`,
      });
      onPaymentUpdated();
    } catch (err: unknown) {
      toast.error('Nie udało się opłacić wniosku', {
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
      toast.success('Dowód wpłaty przesłany', {
        description: 'Urząd zweryfikuje opłatę przed rozpatrzeniem wniosku.',
      });
      onPaymentUpdated();
    } catch (err: unknown) {
      toast.error('Nie udało się przesłać dowodu', {
        description: getApiErrorMessage(err) || 'Spróbuj ponownie',
      });
    } finally {
      setLoading(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="rounded-2xl border-none shadow-sm gap-0 overflow-hidden">
      <CardContent className={CITIZEN_LIST_CARD_CONTENT_CLASS}>
        <div className="flex items-center gap-3 mb-3">
          <div className={cn('p-3 rounded-2xl shrink-0', CITIZEN_NAV_ICON_TONE)}>
            <CreditCard className="h-6 w-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-sm text-foreground">Opłata skarbowa</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {applicationType === 'permit'
                ? 'Opłata za wniosek o pozwolenie (242 zł)'
                : 'Opłata za zaświadczenie promesy (17 zł × szt.)'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-lg font-semibold text-foreground">{formatPlnAmount(feeAmount)}</span>
            {paymentMeta && (
              <span className={paymentMeta.badgeClassName}>{paymentMeta.label}</span>
            )}
          </div>
          {paymentMeta && (
            <p className="text-xs text-muted-foreground leading-relaxed">{paymentMeta.description}</p>
          )}

          {canPay && (
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Button
                type="button"
                className="rounded-xl min-h-[44px] flex-1"
                onClick={() => void handleMockPayment()}
                disabled={loading !== null}
              >
                <Wallet className="h-4 w-4 mr-2" aria-hidden />
                {loading === 'mock' ? 'Przetwarzanie…' : 'Opłać (mock ePłatności)'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl min-h-[44px] flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading !== null}
              >
                <Upload className="h-4 w-4 mr-2" aria-hidden />
                {loading === 'upload' ? 'Wysyłanie…' : 'Prześlij dowód wpłaty'}
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

          {isAwaitingVerification && (
            <p className="text-xs text-blue-800 bg-blue-50 rounded-xl px-3 py-2">
              Wpłata została zgłoszona. WPA zweryfikuje opłatę przed przyjęciem wniosku do rozpatrzenia.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
