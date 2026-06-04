import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Check, Download, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { wpaService } from "../../services/wpaService";
import { getApiErrorMessage } from "../../lib/apiErrors";
import type { WpaPermitMedicalExamRenewalDto } from "../../types/api";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pl-PL");
}

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}

export function OfficerMedicalExamRenewalPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [renewal, setRenewal] = useState<WpaPermitMedicalExamRenewalDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [medicalExpiry, setMedicalExpiry] = useState("");
  const [psychExpiry, setPsychExpiry] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const load = async () => {
    if (!id) return;
    try {
      const data = await wpaService.getMedicalExamRenewalById(id);
      setRenewal(data);
      setMedicalExpiry(toDateInput(data.proposedMedicalExamExpiryDate));
      setPsychExpiry(toDateInput(data.proposedPsychologicalExamExpiryDate));
    } catch {
      setRenewal(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const downloadAttachment = async (attachmentId: string, fileName: string) => {
    if (!id) return;
    try {
      const blob = await wpaService.downloadMedicalExamRenewalAttachment(id, attachmentId);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      toast.error("Nie udało się pobrać załącznika");
    }
  };

  const handleApprove = async () => {
    if (!id || !medicalExpiry || !psychExpiry) {
      toast.error("Podaj daty ważności badań");
      return;
    }
    setActing(true);
    try {
      await wpaService.approveMedicalExamRenewal(id, {
        medicalExamExpiryDate: `${medicalExpiry}T00:00:00Z`,
        psychologicalExamExpiryDate: `${psychExpiry}T00:00:00Z`,
      });
      toast.success("Odnowienie badań zatwierdzone");
      navigate("/officer");
    } catch (err: unknown) {
      toast.error("Nie udało się zatwierdzić", { description: getApiErrorMessage(err) });
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    if (!id || !rejectReason.trim()) {
      toast.error("Podaj powód odrzucenia");
      return;
    }
    setActing(true);
    try {
      await wpaService.rejectMedicalExamRenewal(id, { reason: rejectReason.trim() });
      toast.success("Zgłoszenie odrzucone");
      navigate("/officer");
    } catch (err: unknown) {
      toast.error("Nie udało się odrzucić", { description: getApiErrorMessage(err) });
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return <div className="pt-2 h-48 rounded-2xl bg-muted animate-pulse" />;
  }

  if (!renewal) {
    return (
      <div className="pt-2 px-1">
        <p className="text-muted-foreground">Nie znaleziono zgłoszenia odnowienia badań.</p>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate("/officer")}>
          Wróć do panelu
        </Button>
      </div>
    );
  }

  const canDecide = renewal.status === "Submitted" || renewal.status === "UnderReview";

  return (
    <div className="pt-2 space-y-4">
      <Button variant="ghost" className="rounded-xl -ml-2" onClick={() => navigate("/officer")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Panel urzędnika
      </Button>

      <div className="px-1">
        <h1 className="text-xl font-bold tracking-tight">Odnowienie badań</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {renewal.citizenName} · {renewal.permitNumber} · {renewal.statusName}
        </p>
      </div>

      <Card className="rounded-2xl border-none shadow-sm">
        <CardContent className="p-4 space-y-3">
          <p className="text-sm">
            <span className="text-muted-foreground">PESEL:</span> {renewal.citizenPesel}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Typ pozwolenia:</span> {renewal.permitTypeName}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Złożono:</span> {formatDate(renewal.createdAt)}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-none shadow-sm">
        <CardContent className="p-4 space-y-3">
          <h2 className="font-semibold text-sm">Załączniki</h2>
          {renewal.attachments.map((att) => (
            <div key={att.id} className="flex items-center justify-between gap-2">
              <span className="text-sm truncate">{att.fileName}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl shrink-0"
                onClick={() => downloadAttachment(att.id, att.fileName)}
              >
                <Download className="h-4 w-4 mr-1" />
                Pobierz
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {canDecide && (
        <>
          <Card className="rounded-2xl border-none shadow-sm">
            <CardContent className="p-4 space-y-3">
              <h2 className="font-semibold text-sm">Daty po weryfikacji</h2>
              <div>
                <Label htmlFor="approve-medical">Badanie lekarskie ważne do</Label>
                <Input
                  id="approve-medical"
                  type="date"
                  className="mt-2 rounded-xl min-h-[44px]"
                  value={medicalExpiry}
                  onChange={(e) => setMedicalExpiry(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="approve-psych">Badanie psychologiczne ważne do</Label>
                <Input
                  id="approve-psych"
                  type="date"
                  className="mt-2 rounded-xl min-h-[44px]"
                  value={psychExpiry}
                  onChange={(e) => setPsychExpiry(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button
              className="min-h-[52px] rounded-xl"
              disabled={acting}
              onClick={() => void handleApprove()}
            >
              <Check className="h-4 w-4 mr-2" />
              Zatwierdź odnowienie
            </Button>
            <Textarea
              placeholder="Powód odrzucenia (wymagany przy odrzuceniu)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="rounded-xl min-h-[80px]"
            />
            <Button
              variant="destructive"
              className="min-h-[44px] rounded-xl"
              disabled={acting}
              onClick={() => void handleReject()}
            >
              <X className="h-4 w-4 mr-2" />
              Odrzuć zgłoszenie
            </Button>
          </div>
        </>
      )}

      {renewal.status === "Rejected" && renewal.rejectionReason && (
        <p className="text-sm text-red-800 bg-red-50 rounded-xl p-3">{renewal.rejectionReason}</p>
      )}
    </div>
  );
}
