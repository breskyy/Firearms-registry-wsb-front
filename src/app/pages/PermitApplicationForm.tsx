import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AlertCircle, Upload, FileCheck, X } from "lucide-react";
import { toast } from "sonner";

export function PermitApplicationForm() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    requestedPermitType: "",
    reason: "",
  });
  const [medicalExamFile, setMedicalExamFile] = useState<File | null>(null);
  const [psychologicalExamFile, setPsychologicalExamFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.requestedPermitType) {
      newErrors.requestedPermitType = "Wybierz rodzaj pozwolenia";
    }
    if (!formData.reason || formData.reason.length < 20) {
      newErrors.reason = "Uzasadnienie musi zawierać minimum 20 znaków";
    }
    if (!medicalExamFile) {
      newErrors.medicalExam = "Załącz badanie lekarskie";
    }
    if (!psychologicalExamFile) {
      newErrors.psychologicalExam = "Załącz badanie psychologiczne";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Mock - symulacja wysłania
    const applicationNumber = `WNI-POZW-2026-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;

    toast.success("Wniosek o pozwolenie złożony pomyślnie", {
      description: `Nr wniosku: ${applicationNumber}. Status: Oczekuje na opłatę.`,
      duration: 5000,
    });

    navigate("/citizen");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "medical" | "psychological") => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF, JPG, PNG)
      const validTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        toast.error("Nieprawidłowy format pliku", {
          description: "Akceptowane formaty: PDF, JPG, PNG",
        });
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("Plik jest za duży", {
          description: "Maksymalny rozmiar pliku to 5MB",
        });
        return;
      }

      if (type === "medical") {
        setMedicalExamFile(file);
        setErrors({ ...errors, medicalExam: "" });
      } else {
        setPsychologicalExamFile(file);
        setErrors({ ...errors, psychologicalExam: "" });
      }
    }
  };

  const removeFile = (type: "medical" | "psychological") => {
    if (type === "medical") {
      setMedicalExamFile(null);
    } else {
      setPsychologicalExamFile(null);
    }
  };

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
          Wniosek o pozwolenie na broń
        </h1>
        <p className="text-muted-foreground">
          Złóż wniosek o wydanie pozwolenia na posiadanie broni palnej
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Informacje o wniosku</CardTitle>
            <CardDescription>
              Twoje dane osobowe są już w systemie. Podaj tylko rodzaj pozwolenia i uzasadnienie.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="requestedPermitType">
                Rodzaj pozwolenia <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.requestedPermitType}
                onValueChange={(value) => setFormData({ ...formData, requestedPermitType: value })}
              >
                <SelectTrigger id="requestedPermitType" className="min-h-[44px] mt-2 rounded-xl">
                  <SelectValue placeholder="Wybierz rodzaj pozwolenia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sport">Pozwolenie na broń sportową</SelectItem>
                  <SelectItem value="Hunting">Pozwolenie na broń myśliwską</SelectItem>
                  <SelectItem value="Collection">Pozwolenie na broń kolekcjonerską</SelectItem>
                  <SelectItem value="Protection">Pozwolenie na broń do ochrony osobistej</SelectItem>
                  <SelectItem value="Other">Inne</SelectItem>
                </SelectContent>
              </Select>
              {errors.requestedPermitType && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.requestedPermitType}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="reason">
                Uzasadnienie / Cel posiadania broni <span className="text-red-600">*</span>
              </Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Opisz szczegółowo cel, w jakim chcesz posiadać broń (minimum 20 znaków)
              </p>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="min-h-[150px] rounded-xl"
                placeholder="Np. Sport strzelecki - aktywny członek klubu strzeleckiego od 3 lat, uczestniczę w zawodach..."
              />
              <div className="flex justify-between items-center mt-2">
                {errors.reason ? (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.reason}</span>
                  </div>
                ) : (
                  <span />
                )}
                <span className="text-xs text-muted-foreground">
                  Znaków: {formData.reason.length} / 20
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Badania medyczne</CardTitle>
            <CardDescription>
              Załącz aktualne badania wymagane do wydania pozwolenia na broń
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Medical Exam */}
            <div>
              <Label htmlFor="medicalExam">
                Badanie lekarskie <span className="text-red-600">*</span>
              </Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Zaświadczenie lekarskie o braku przeciwwskazań zdrowotnych (ważne 5 lat)
              </p>

              {!medicalExamFile ? (
                <div>
                  <Label
                    htmlFor="medicalExam"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Kliknij aby wybrać plik</span>
                      </p>
                      <p className="text-xs text-muted-foreground">PDF, JPG, PNG (maks. 5MB)</p>
                    </div>
                    <Input
                      id="medicalExam"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "medical")}
                    />
                  </Label>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-muted/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-medium text-sm">{medicalExamFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(medicalExamFile.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile("medical")}
                    className="rounded-full h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {errors.medicalExam && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.medicalExam}</span>
                </div>
              )}
            </div>

            {/* Psychological Exam */}
            <div>
              <Label htmlFor="psychologicalExam">
                Badanie psychologiczne <span className="text-red-600">*</span>
              </Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Zaświadczenie psychologiczne o braku przeciwwskazań (ważne 5 lat)
              </p>

              {!psychologicalExamFile ? (
                <div>
                  <Label
                    htmlFor="psychologicalExam"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Kliknij aby wybrać plik</span>
                      </p>
                      <p className="text-xs text-muted-foreground">PDF, JPG, PNG (maks. 5MB)</p>
                    </div>
                    <Input
                      id="psychologicalExam"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "psychological")}
                    />
                  </Label>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-muted/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-medium text-sm">{psychologicalExamFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(psychologicalExamFile.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile("psychological")}
                    className="rounded-full h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {errors.psychologicalExam && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.psychologicalExam}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 space-y-2">
                <p className="font-semibold">Informacja o procesie</p>
                <ul className="text-blue-700 space-y-1 list-disc list-inside">
                  <li>Po złożeniu wniosku otrzymasz powiadomienie o konieczności opłacenia wniosku</li>
                  <li>WPA rozpatrzy Twój wniosek w ciągu 30 dni roboczych</li>
                  <li>Badania lekarskie i psychologiczne muszą być ważne przez cały proces</li>
                  <li>Możesz śledzić status wniosku w zakładce "Moje wnioski"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/citizen")}
            className="min-h-[44px] flex-1 rounded-xl"
          >
            Anuluj
          </Button>
          <Button type="submit" className="min-h-[44px] flex-1 rounded-xl">
            Złóż wniosek
          </Button>
        </div>
      </form>
    </div>
  );
}
