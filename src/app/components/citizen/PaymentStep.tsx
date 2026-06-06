import { useState } from "react";
import { Banknote, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import { CITIZEN_LIST_CARD_CONTENT_CLASS, CITIZEN_NAV_ICON_TONE } from "../../utils/citizenCardUi";
import { citizenService } from "../../../services/citizenService";
import { getApiErrorMessage } from "../../../lib/apiErrors";
import type { ApplicationPaymentStatus } from "../../../types/api";

type PaymentApplicationKind = "permit" | "promise";

type PaymentStepProps = {
  applicationId: string;
  feeAmount: number;
  kind: PaymentApplicationKind;
  initialPaymentStatus?: ApplicationPaymentStatus;
  onCompleted?: () => void;
};

function formatPln(amount: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function PaymentStep({
  applicationId,
  feeAmount,
  kind,
  initialPaymentStatus = "Pending",
  onCompleted,
}: PaymentStepProps) {
  const [paymentStatus, setPaymentStatus] = useState<ApplicationPaymentStatus>(initialPaymentStatus);
  const [loading, setLoading] = useState(false);

  const isCompleted = paymentStatus === "Submitted" || paymentStatus === "Paid";

  const handlePay = async () => {
    setLoading(true);
    try {
      const initiated =
        kind === "permit"
          ? await citizenService.initiatePermitApplicationPayment(applicationId)
          : await citizenService.initiatePromiseApplicationPayment(applicationId);

      if (!initiated.paymentReferenceId) {
        throw new Error("Brak identyfikatora płatności");
      }

      const confirmed =
        kind === "permit"
          ? await citizenService.confirmPermitApplicationPayment(applicationId, initiated.paymentReferenceId)
          : await citizenService.confirmPromiseApplicationPayment(applicationId, initiated.paymentReferenceId);

      setPaymentStatus(confirmed.paymentStatus);
      toast.success("Opłata skarbowa opłacona", {
        description: "Dowód wpłaty zostanie zweryfikowany przez urząd WPA.",
        duration: 5000,
      });
      onCompleted?.();
    } catch (err: unknown) {
      toast.error("Nie udało się opłacić wniosku", {
        description: getApiErrorMessage(err) || "Spróbuj ponownie",
      });
    } finally {
      setLoading(false);
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
          <p className="text-2xl font-bold tracking-tight text-foreground">{formatPln(feeAmount)}</p>
        </div>

        {isCompleted ? (
          <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3">
            Płatność zarejestrowana. Urząd WPA zweryfikuje wpłatę przed rozpatrzeniem wniosku.
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-4">
              W wersji demonstracyjnej płatność jest symulowana (mock ePłatności). W produkcji nastąpiłby przekierowanie do
              systemu płatności Urzędu Miasta.
            </p>
            <Button type="button" className="w-full min-h-[44px] rounded-xl" disabled={loading} onClick={() => void handlePay()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Przetwarzanie płatności…
                </>
              ) : (
                <>Zapłać {formatPln(feeAmount)}</>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
