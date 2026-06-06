import { useState } from "react";
import { Banknote, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { cn } from "../ui/utils";
import { CITIZEN_LIST_CARD_CONTENT_CLASS, CITIZEN_NAV_ICON_TONE } from "../../utils/citizenCardUi";
import { formatPlnAmount } from "../../../lib/paymentUi";
import type { ApplicationPaymentStatus } from "../../../types/api";
import { CitizenPaymentMethods } from "./CitizenPaymentMethods";

type PaymentApplicationKind = "permit" | "promise";

type PaymentStepProps = {
  applicationId: string;
  feeAmount: number;
  kind: PaymentApplicationKind;
  initialPaymentStatus?: ApplicationPaymentStatus;
  onCompleted?: () => void;
};

export function PaymentStep({
  applicationId,
  feeAmount,
  kind,
  initialPaymentStatus = "Pending",
  onCompleted,
}: PaymentStepProps) {
  const [paymentStatus, setPaymentStatus] = useState<ApplicationPaymentStatus>(initialPaymentStatus);

  const isCompleted = paymentStatus === "Submitted" || paymentStatus === "Paid";

  const handleUpdated = (status: ApplicationPaymentStatus) => {
    setPaymentStatus(status);
    if (status === "Submitted" || status === "Paid") {
      onCompleted?.();
    }
  };

  return (
    <Card className="rounded-2xl border-none shadow-sm gap-0 overflow-hidden">
      <CardContent className={CITIZEN_LIST_CARD_CONTENT_CLASS}>
        <div className="flex items-center gap-3 mb-3">
          <div className={cn("p-3 rounded-2xl shrink-0", CITIZEN_NAV_ICON_TONE)}>
            {isCompleted ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-600" aria-hidden />
            ) : (
              <Banknote className="h-6 w-6" aria-hidden />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-sm text-foreground">Opłata skarbowa</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {kind === "permit"
                ? "Opłata za wniosek o pozwolenie na broń (242 zł)"
                : "Opłata za zaświadczenie o nabyciu broni — promesa (17 zł × liczba sztuk)"}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-muted/50 px-4 py-3 mb-4">
          <p className="text-xs text-muted-foreground">Kwota do zapłaty</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">{formatPlnAmount(feeAmount)}</p>
        </div>

        {isCompleted ? (
          <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3">
            Płatność zarejestrowana. Urząd WPA zweryfikuje wpłatę przed rozpatrzeniem wniosku.
          </p>
        ) : (
          <CitizenPaymentMethods
            applicationId={applicationId}
            applicationType={kind}
            feeAmount={feeAmount}
            paymentStatus={paymentStatus}
            onUpdated={handleUpdated}
          />
        )}
      </CardContent>
    </Card>
  );
}
