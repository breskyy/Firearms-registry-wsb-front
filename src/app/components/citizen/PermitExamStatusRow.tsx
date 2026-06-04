import { Badge } from "../ui/badge";
import { CitizenNavIconTile } from "./CitizenNavIconTile";
import { DateStatusMeta } from "../DateStatusMeta";
import { cn } from "../ui/utils";
import { formatMedicalAlertDate } from "../../../lib/medicalAlerts";
import {
  examIcon,
  examLabel,
  getExamStatusTileClass,
  type ExamStatus,
  type PermitExamEntry,
} from "../../../lib/permitExams";

export function ExamStatusBadge({
  status,
  daysLeft,
}: {
  status: ExamStatus;
  daysLeft?: number | null;
}) {
  if (status === "missing") {
    return <Badge className="bg-slate-100 text-slate-800 border-none rounded-full">Brak danych</Badge>;
  }
  if (status === "expired") {
    return <Badge variant="destructive" className="rounded-full">Wygasło</Badge>;
  }
  if (status === "expiring") {
    if (daysLeft != null && daysLeft <= 7) {
      return (
        <Badge className="bg-red-100 text-red-800 border-none rounded-full">
          Pilne ({daysLeft} dni)
        </Badge>
      );
    }
    return <Badge className="bg-amber-100 text-amber-800 border-none rounded-full">Wygasa</Badge>;
  }
  return <Badge className="bg-emerald-100 text-emerald-800 border-none rounded-full">Aktualne</Badge>;
}

function statusBadge(entry: PermitExamEntry) {
  return <ExamStatusBadge status={entry.status} daysLeft={entry.daysLeft} />;
}

type PermitExamStatusRowProps = {
  entry: PermitExamEntry;
  className?: string;
  pendingRenewalLabel?: string | null;
};

export function PermitExamStatusRow({ entry, className, pendingRenewalLabel }: PermitExamStatusRowProps) {
  const showWarningBlock =
    (entry.status === "expired" || entry.status === "missing") && !pendingRenewalLabel;
  const Icon = examIcon(entry.examType);
  return (
    <div className={cn("flex items-start gap-3 py-3 first:pt-0 last:pb-0", className)}>
      <CitizenNavIconTile
        className={cn(
          "self-center shrink-0 scale-90 [&_svg]:h-5 [&_svg]:w-5 p-2.5",
          getExamStatusTileClass(entry.status),
        )}
      >
        <Icon />
      </CitizenNavIconTile>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm leading-snug text-foreground">{examLabel(entry.examType)}</h4>

        <DateStatusMeta className="mt-1" emphasizeDate statusBadge={statusBadge(entry)}>
          {entry.expiryDate
            ? `${formatMedicalAlertDate(entry.expiryDate)}${
                entry.daysLeft != null && entry.daysLeft < 0
                  ? ` (${Math.abs(entry.daysLeft)} dni temu)`
                  : entry.daysLeft != null && entry.daysLeft >= 0
                    ? ` (za ${entry.daysLeft} dni)`
                    : ""
              }`
            : "Brak daty ważności w rejestrze"}
        </DateStatusMeta>

        {entry.alertMessage && (
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">{entry.alertMessage}</p>
        )}

        {pendingRenewalLabel && (
          <p className="text-xs text-muted-foreground bg-muted/40 border border-border/80 rounded-xl p-2.5 mt-2 leading-relaxed">
            <span className="font-medium text-foreground">Zgłoszenie w WPA:</span> {pendingRenewalLabel}
          </p>
        )}

        {showWarningBlock && (
          <p className="text-xs text-muted-foreground bg-muted/40 border border-border/80 rounded-xl p-2.5 mt-2 leading-relaxed">
            <span className="font-medium text-foreground">Wymagane działanie:</span>{" "}
            {entry.status === "missing"
              ? "Brakuje potwierdzonej daty ważności w rejestrze. Złóż odnowienie z zaświadczeniami do WPA."
              : "Odnów badanie i złóż nowe zaświadczenia w systemie — urzędnik zaktualizuje pozwolenie po weryfikacji."}
          </p>
        )}
      </div>
    </div>
  );
}
