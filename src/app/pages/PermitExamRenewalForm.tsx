import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Brain, HeartPulse } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CertificateUploadRow } from "./permit-application/CertificateUploadRow";
import { CITIZEN_LIST_CARD_CONTENT_CLASS } from "../utils/citizenCardUi";
import { citizenService } from "../../services/citizenService";
import { getApiErrorMessage } from "../../lib/apiErrors";
import { ALLOWED_TYPES, MAX_FILE_SIZE } from "./permit-application/shared";

type RenewalFormData = {
  medicalCertificate: File | null;
  psychologicalCertificate: File | null;
  medicalExamExpiryDate: string;
  psychologicalExamExpiryDate: string;
};

function validateRenewalForm(form: RenewalFormData) {
  const e: Record<string, string> = {};
  const validateFile = (file: File | null, label: string) => {
    if (!file) return `Dodaj ${label}`;
    if (!ALLOWED_TYPES.includes(file.type)) return "Dozwolone są tylko pliki PDF, JPG albo PNG";
    if (file.size > MAX_FILE_SIZE) return "Plik może mieć maksymalnie 10 MB";
    return "";
  };
  const medErr = validateFile(form.medicalCertificate, "zaświadczenie lekarskie");
  const psychErr = validateFile(form.psychologicalCertificate, "zaświadczenie psychologiczne");
  if (medErr) e.medicalCertificate = medErr;
  if (psychErr) e.psychologicalCertificate = psychErr;
  if (!form.medicalExamExpiryDate) e.medicalExamExpiryDate = "Podaj datę ważności badania lekarskiego";
  if (!form.psychologicalExamExpiryDate) {
    e.psychologicalExamExpiryDate = "Podaj datę ważności badania psychologicznego";
  }
  const today = new Date().toISOString().slice(0, 10);
  if (form.medicalExamExpiryDate && form.medicalExamExpiryDate < today) {
    e.medicalExamExpiryDate = "Data ważności musi być dziś lub później";
  }
  if (form.psychologicalExamExpiryDate && form.psychologicalExamExpiryDate < today) {
    e.psychologicalExamExpiryDate = "Data ważności musi być dziś lub później";
  }
  return e;
}

export function PermitExamRenewalForm() {
  const { id: permitId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<RenewalFormData>({
    medicalCertificate: null,
    psychologicalCertificate: null,
    medicalExamExpiryDate: "",
    psychologicalExamExpiryDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permitId) return;
    const nextErrors = validateRenewalForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Uzupełnij formularz odnowienia badań");
      return;
    }

    setLoading(true);
    try {
      await citizenService.submitMedicalExamRenewal(permitId, {
        medicalCertificate: form.medicalCertificate!,
        psychologicalCertificate: form.psychologicalCertificate!,
        medicalExamExpiryDate: form.medicalExamExpiryDate,
        psychologicalExamExpiryDate: form.psychologicalExamExpiryDate,
      });
      toast.success("Zgłoszenie odnowienia badań zostało wysłane do WPA");
      navigate("/medical-alerts");
    } catch (err: unknown) {
      toast.error("Nie udało się wysłać zgłoszenia", {
        description: getApiErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-2 space-y-4">
      <div className="px-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-1">
          Odnowienie badań
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Złóż nowe zaświadczenia do istniejącego pozwolenia. To nie jest wniosek o nowe pozwolenie.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Card className="rounded-2xl border-none shadow-sm gap-0 overflow-hidden">
          <CardContent className={CITIZEN_LIST_CARD_CONTENT_CLASS}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-muted shrink-0">
                <HeartPulse className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-foreground">Zaświadczenia</h2>
                <p className="text-xs text-muted-foreground mt-0.5">PDF, JPG lub PNG — max 10 MB</p>
              </div>
            </div>

            <CertificateUploadRow
              id="renewal-medicalCertificate"
              label="Badanie lekarskie"
              icon={HeartPulse}
              file={form.medicalCertificate}
              expiryDate={form.medicalExamExpiryDate}
              error={errors.medicalCertificate}
              expiryError={errors.medicalExamExpiryDate}
              onFileChange={(file) => setForm({ ...form, medicalCertificate: file })}
              onExpiryDateChange={(date) => setForm({ ...form, medicalExamExpiryDate: date })}
            />
            <CertificateUploadRow
              id="renewal-psychologicalCertificate"
              label="Badanie psychologiczne"
              icon={Brain}
              file={form.psychologicalCertificate}
              expiryDate={form.psychologicalExamExpiryDate}
              error={errors.psychologicalCertificate}
              expiryError={errors.psychologicalExamExpiryDate}
              onFileChange={(file) => setForm({ ...form, psychologicalCertificate: file })}
              onExpiryDateChange={(date) => setForm({ ...form, psychologicalExamExpiryDate: date })}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          <Button type="submit" className="w-full min-h-[52px] rounded-xl" disabled={loading}>
            {loading ? "Wysyłanie..." : "Wyślij do weryfikacji WPA"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[44px] rounded-xl"
            onClick={() => navigate(-1)}
          >
            Anuluj
          </Button>
        </div>
      </form>
    </div>
  );
}
