import { CreditCard } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../ui/utils';
import { CITIZEN_LIST_CARD_CONTENT_CLASS, CITIZEN_NAV_ICON_TONE } from '../../utils/citizenCardUi';
import {
  formatPlnAmount,
  getApplicationPaymentStatusMeta,
} from '../../../lib/paymentUi';
import type { ApplicationPaymentStatus } from '../../../types/api';
import { CitizenPaymentMethods } from './CitizenPaymentMethods';

type Props = {
  applicationId: string;
  applicationType: 'permit' | 'promise';
  feeAmount: number;
  paymentStatus: ApplicationPaymentStatus;
  paymentStatusName: string;
  paymentRejectionComment?: string | null;
  onPaymentUpdated: () => void;
};

export function ApplicationPaymentCard({
  applicationId,
  applicationType,
  feeAmount,
  paymentStatus,
  paymentStatusName,
  paymentRejectionComment,
  onPaymentUpdated,
}: Props) {
  const paymentMeta = getApplicationPaymentStatusMeta(paymentStatusName) ?? getApplicationPaymentStatusMeta(paymentStatus);

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

          <CitizenPaymentMethods
            applicationId={applicationId}
            applicationType={applicationType}
            feeAmount={feeAmount}
            paymentStatus={paymentStatus}
            paymentRejectionComment={paymentRejectionComment}
            onUpdated={() => onPaymentUpdated()}
          />
        </div>
      </CardContent>
    </Card>
  );
}
