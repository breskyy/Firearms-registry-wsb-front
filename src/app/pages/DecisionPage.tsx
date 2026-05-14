import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { AlertCircle, CheckCircle, XCircle, FileWarning, Clock, FileText, Image as ImageIcon, Eye } from "lucide-react";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import { wpaService } from "../../services/wpaService";
import type { WpaPermitApplicationDto, WpaPromiseApplicationDto, PermitDto } from "../../types/api";
import { AttachmentPreviewDialog } from "../components/wpa/AttachmentPreviewDialog";

const PERMIT_TYPE_LABELS: Record<string, string> = {
  Sport: "Sportowe",
  Hunting: "Łowieckie",
  Collection: "Kolekcjonerskie",
  Protection: "Ochrony osobistej",
  Other: "Inne",
};

type Decision = "mark-under-review" | "approve" | "reject" | "require-correction";

const APPROVABLE_PROMISE_STATUSES = ["UnderReview", "Paid"];
const APPROVABLE_PERMIT_STATUSES = ["Submitted", "UnderReview"];
const REVIEWABLE_PROMISE_STATUSES = ["Submitted", "Paid"];
const REVIEWABLE_PERMIT_STATUSES = ["Submitted"];

export function DecisionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const type = (searchParams.get("type") as "permit" | "promise") || "permit";

  const [permitApp, setPermitApp] = useState<WpaPermitApplicationDto | null>(null);
  const [promiseApp, setPromiseApp] = useState<WpaPromiseApplicationDto | null>(null);
  const [linkedPermit, setLinkedPermit] = useState<PermitDto | null>(null);
  const [citizenPermits, setCitizenPermits] = useState<PermitDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [decision, setDecision] = useState<Decision | null>(null);
  const [justification, setJustification] = useState("");
  const [maxFirearms, setMaxFirearms] = useState<string>("1");
  const [medicalExpiry, setMedicalExpiry] = useState("");
  const [psychologicalExpiry, setPsychologicalExpiry] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<{ id: string; fileName: string; contentType: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setLinkedPermit(null);
    setCitizenPermits([]);
    const fetcher = type === "permit"
      ? wpaService.getPermitApplicationById(id).then((d) => { setPermitApp(d); setPromiseApp(null); })
      : wpaService.getPromiseApplicationById(id).then(async (d) => {
          setPromiseApp(d);
          setPermitApp(null);
          try {
            const citizen = await wpaService.getCitizenById(d.citizenId);
            setCitizenPermits(citizen.permits);
            setLinkedPermit(citizen.permits.find((p) => p.id === d.permitId) ?? null);
          } catch {
            // citizen lookup not critical
          }
        });
    fetcher
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, type]);

  const app = permitApp ?? promiseApp;

  useEffect(() => {
    if (permitApp) {
      if (permitApp.medicalExamExpiryDate) setMedicalExpiry(permitApp.medicalExamExpiryDate.slice(0, 10));
      if (permitApp.psychologicalExamExpiryDate) setPsychologicalExpiry(permitApp.psychologicalExamExpiryDate.slice(0, 10));
    }
  }, [permitApp]);

  const canMarkUnderReview = app
    ? type === "permit"
      ? REVIEWABLE_PERMIT_STATUSES.includes(app.statusName)
      : REVIEWABLE_PROMISE_STATUSES.includes(app.statusName)
    : false;

  const canApprove = app
    ? type === "permit"
      ? APPROVABLE_PERMIT_STATUSES.includes(app.statusName)
      : APPROVABLE_PROMISE_STATUSES.includes(app.statusName)
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !app) return;

    const newErrors: Record<string, string> = {};
    if (!decision) newErrors.decision = "Musisz podjąć decyzję";

    if (decision === "mark-under-review" && !canMarkUnderReview) {
      newErrors.decision = "Tego wniosku nie mozna juz oznaczyc jako weryfikowany";
    }
    if (decision === "approve" && !canApprove) {
      newErrors.decision = type === "promise"
        ? "Najpierw oznacz wniosek jako weryfikowany, dopiero potem zatwierdz promese"
        : "Tego wniosku nie mozna zatwierdzic w obecnym statusie";
    }

    if (decision === "reject" || decision === "require-correction") {
      if (!justification || justification.length < 20) {
        newErrors.justification = "Uzasadnienie musi zawierać minimum 20 znaków";
      }
    }

    if (decision === "approve" && type === "permit") {
      const n = parseInt(maxFirearms, 10);
      if (!Number.isFinite(n) || n < 1 || n > 50) {
        newErrors.maxFirearms = "Podaj wartość 1–50";
      }
      if (!medicalExpiry) newErrors.medicalExpiry = "Wpisz datę po weryfikacji zaświadczenia lekarskiego";
      if (!psychologicalExpiry) newErrors.psychologicalExpiry = "Wpisz datę po weryfikacji zaświadczenia psychologicznego";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      if (type === "permit") {
        if (decision === "mark-under-review") await wpaService.markPermitApplicationUnderReview(id);
        else if (decision === "approve") await wpaService.approvePermitApplication(id, {
          maxFirearms: parseInt(maxFirearms, 10),
          medicalExamExpiryDate: `${medicalExpiry}T00:00:00Z`,
          psychologicalExamExpiryDate: `${psychologicalExpiry}T00:00:00Z`,
        });
        else if (decision === "reject") await wpaService.rejectPermitApplication(id, { reason: justification });
        else if (decision === "require-correction") await wpaService.requirePermitApplicationCorrection(id, { reason: justification });
      } else {
        if (decision === "mark-under-review") await wpaService.markPromiseApplicationUnderReview(id);
        else if (decision === "approve") await wpaService.approvePromiseApplication(id);
        else if (decision === "reject") await wpaService.rejectPromiseApplication(id, { reason: justification });
        else if (decision === "require-correction") await wpaService.requirePromiseApplicationCorrection(id, { reason: justification });
      }
      const messages: Record<Decision, string> = {
        "mark-under-review": "Wniosek oznaczony jako weryfikowany",
        approve: "Wniosek zatwierdzony",
        reject: "Wniosek odrzucony",
        "require-correction": "Wezwanie do uzupełnienia wysłane",
      };
      toast.success(messages[decision!]);
      navigate("/officer");
    } catch (err: any) {
      toast.error("Błąd zapisu decyzji", { description: err?.message ?? "Spróbuj ponownie" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-2 space-y-4">
        <div className="h-8 w-40 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 rounded-2xl bg-muted animate-pulse" />
        <div className="h-64 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="pt-2">
        <p className="text-muted-foreground">Nie znaleziono wniosku.</p>
      </div>
    );
  }

  const appTitle = permitApp
    ? `Wniosek o pozwolenie — ${PERMIT_TYPE_LABELS[permitApp.requestedPermitTypeName] ?? permitApp.requestedPermitTypeName}`
    : promiseApp
      ? `Wniosek o promesę — ${promiseApp.requestedWeaponType}`
      : "Wniosek";

  const handleAttachmentOpen = (attachmentId: string, fileName: string, contentType: string) => {
    setPreviewAttachment({ id: attachmentId, fileName, contentType });
  };

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Rozpatrz wniosek</h1>
        <p className="text-muted-foreground">Wydaj decyzję administracyjną lub wezwij do uzupełnienia</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Card className="rounded-2xl border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Dane wniosku</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Rodzaj wniosku</p>
                  <p className="font-medium text-foreground">{appTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wnioskodawca</p>
                  <p className="font-medium text-foreground">{app.citizenName} (PESEL: {app.citizenPesel})</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium text-foreground">{app.statusName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data złożenia</p>
                  <p className="font-medium text-foreground">{new Date(app.createdAt).toLocaleString("pl-PL")}</p>
                </div>
                {permitApp && (
                  <div>
                    <p className="text-sm text-muted-foreground">Uzasadnienie obywatela</p>
                    <p className="text-sm text-foreground bg-muted/30 rounded-lg p-3 mt-1">{permitApp.reason}</p>
                  </div>
                )}
                {promiseApp && (
                  <div>
                    <p className="text-sm text-muted-foreground">Wnioskowana broń / ilość</p>
                    <p className="font-medium">{promiseApp.requestedWeaponType} • {promiseApp.requestedQuantity} szt.</p>
                  </div>
                )}
                {permitApp && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Załączniki do weryfikacji</p>
                      {permitApp.attachments?.length > 0 && (
                        <span className="text-xs text-muted-foreground">{permitApp.attachments.length} {permitApp.attachments.length === 1 ? "plik" : "pliki"}</span>
                      )}
                    </div>
                    {permitApp.attachments?.length > 0 ? (
                      <div className="space-y-2">
                        {permitApp.attachments.map((attachment) => {
                          const isImage = attachment.contentType.startsWith("image/");
                          return (
                            <button
                              key={attachment.id}
                              type="button"
                              onClick={() => handleAttachmentOpen(attachment.id, attachment.fileName, attachment.contentType)}
                              className="w-full flex items-center justify-between gap-3 rounded-xl bg-muted/30 p-3 text-left hover:bg-muted/50 border border-transparent hover:border-primary/20 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`p-2 rounded-lg ${isImage ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                  {isImage ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {attachment.attachmentTypeName === "MedicalCertificate" ? "Zaświadczenie lekarskie" : "Zaświadczenie psychologiczne"}
                                    {" • "}
                                    {(attachment.fileSize / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-primary font-medium shrink-0">
                                <Eye className="h-4 w-4" />
                                Podgląd
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-xl bg-orange-50 p-3 text-sm text-orange-900">
                        Brak załączonych zaświadczeń. Wezwij obywatela do uzupełnienia.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {promiseApp && (
              <Card className="rounded-2xl border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Pozwolenie bazowe i badania obywatela</CardTitle>
                  <CardDescription>
                    Promesa może być wydana tylko jeśli pozwolenie jest aktywne, ma wolne sloty i obowywatel ma aktualne badania.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {linkedPermit ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Numer pozwolenia</p>
                          <p className="font-medium font-mono">{linkedPermit.permitNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Typ</p>
                          <p className="font-medium">
                            {PERMIT_TYPE_LABELS[linkedPermit.permitTypeName] ?? linkedPermit.permitTypeName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <p className={`font-medium ${linkedPermit.statusName === "Active" ? "text-emerald-700" : "text-red-600"}`}>
                            {linkedPermit.statusName === "Active" ? "Aktywne" : linkedPermit.statusName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Wolne sloty</p>
                          <p className={`font-medium ${linkedPermit.availableSlots > 0 ? "text-emerald-700" : "text-red-600"}`}>
                            {linkedPermit.availableSlots} z {linkedPermit.maxFirearms}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Ważne do</p>
                          <p className="font-medium">{new Date(linkedPermit.expiryDate).toLocaleDateString("pl-PL")}</p>
                        </div>
                      </div>

                      <Separator className="bg-border" />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(() => {
                          const today = new Date();
                          const med = linkedPermit.medicalExamExpiryDate ? new Date(linkedPermit.medicalExamExpiryDate) : null;
                          const psy = linkedPermit.psychologicalExamExpiryDate ? new Date(linkedPermit.psychologicalExamExpiryDate) : null;
                          const medValid = med && med >= today;
                          const psyValid = psy && psy >= today;
                          return (
                            <>
                              <div className={`rounded-xl p-3 ${medValid ? "bg-emerald-50" : "bg-red-50"}`}>
                                <p className="text-xs text-muted-foreground">Bad. lekarskie ważne do</p>
                                <p className={`font-semibold ${medValid ? "text-emerald-900" : "text-red-900"}`}>
                                  {med ? med.toLocaleDateString("pl-PL") : "Brak danych"}
                                  {!medValid && med && " (wygasło)"}
                                </p>
                              </div>
                              <div className={`rounded-xl p-3 ${psyValid ? "bg-emerald-50" : "bg-red-50"}`}>
                                <p className="text-xs text-muted-foreground">Bad. psychologiczne ważne do</p>
                                <p className={`font-semibold ${psyValid ? "text-emerald-900" : "text-red-900"}`}>
                                  {psy ? psy.toLocaleDateString("pl-PL") : "Brak danych"}
                                  {!psyValid && psy && " (wygasło)"}
                                </p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                      Nie udało się pobrać pozwolenia bazowego ({promiseApp.permitNumber}). Sprawdź, czy istnieje i czy jest aktywne.
                      {citizenPermits.length > 0 && (
                        <p className="mt-2 text-xs">Pozwolenia obywatela: {citizenPermits.map((p) => p.permitNumber).join(", ")}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {permitApp && canApprove && (
              <Card className="rounded-2xl border-none shadow-sm bg-emerald-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Ważność badań po weryfikacji</CardTitle>
                  <CardDescription>
                    Wpisz daty ważności wynikające z dostarczonych zaświadczeń. Zostaną one zapisane na pozwoleniu przy zatwierdzeniu wniosku.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="medExp">Bad. lekarskie ważne do <span className="text-red-600">*</span></Label>
                      <Input
                        id="medExp"
                        type="date"
                        value={medicalExpiry}
                        onChange={(e) => setMedicalExpiry(e.target.value)}
                        className="min-h-[44px] mt-1.5 rounded-xl bg-background"
                      />
                      {errors.medicalExpiry && <p className="text-xs text-red-600 mt-1">{errors.medicalExpiry}</p>}
                    </div>
                    <div>
                      <Label htmlFor="psyExp">Bad. psychologiczne ważne do <span className="text-red-600">*</span></Label>
                      <Input
                        id="psyExp"
                        type="date"
                        value={psychologicalExpiry}
                        onChange={(e) => setPsychologicalExpiry(e.target.value)}
                        className="min-h-[44px] mt-1.5 rounded-xl bg-background"
                      />
                      {errors.psychologicalExpiry && <p className="text-xs text-red-600 mt-1">{errors.psychologicalExpiry}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-2xl border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Działanie</CardTitle>
                <CardDescription>Wybierz akcję i podaj uzasadnienie</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <RadioGroup
                    value={decision || ""}
                    onValueChange={(value) => setDecision(value as Decision)}
                    className="grid gap-3"
                  >
                    <Label htmlFor="mark-under-review" className={`flex items-start space-x-3 border rounded-xl p-4 transition-colors ${canMarkUnderReview ? "cursor-pointer" : "cursor-not-allowed opacity-60"} ${decision === 'mark-under-review' ? 'bg-blue-50/50 border-blue-200' : 'border-border hover:bg-muted/50'}`}>
                      <RadioGroupItem value="mark-under-review" id="mark-under-review" className="mt-1" disabled={!canMarkUnderReview} />
                      <div className="flex-1 flex items-start gap-3">
                        <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-base text-foreground mb-0.5">Oznacz jako weryfikowany</p>
                          <p className="text-sm text-muted-foreground">Zmiana statusu na &quot;W weryfikacji&quot;</p>
                        </div>
                      </div>
                    </Label>

                    <Label htmlFor="approve" className={`flex items-start space-x-3 border rounded-xl p-4 transition-colors ${canApprove ? "cursor-pointer" : "cursor-not-allowed opacity-60"} ${decision === 'approve' ? 'bg-emerald-50/50 border-emerald-200' : 'border-border hover:bg-muted/50'}`}>
                      <RadioGroupItem value="approve" id="approve" className="mt-1" disabled={!canApprove} />
                      <div className="flex-1 flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-base text-foreground mb-0.5">Zatwierdź wniosek</p>
                          <p className="text-sm text-muted-foreground">{type === "permit" ? "Wygeneruj pozwolenie na broń" : "Wygeneruj aktywną promesę"}</p>
                        </div>
                      </div>
                    </Label>

                    <Label htmlFor="require-correction" className={`flex items-start space-x-3 border rounded-xl p-4 cursor-pointer transition-colors ${decision === 'require-correction' ? 'bg-orange-50/50 border-orange-200' : 'border-border hover:bg-muted/50'}`}>
                      <RadioGroupItem value="require-correction" id="require-correction" className="mt-1" />
                      <div className="flex-1 flex items-start gap-3">
                        <FileWarning className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-base text-foreground mb-0.5">Wezwij do uzupełnienia</p>
                          <p className="text-sm text-muted-foreground">Wniosek posiada braki formalne lub dokumentacyjne</p>
                        </div>
                      </div>
                    </Label>

                    <Label htmlFor="reject" className={`flex items-start space-x-3 border rounded-xl p-4 cursor-pointer transition-colors ${decision === 'reject' ? 'bg-red-50/50 border-red-200' : 'border-border hover:bg-muted/50'}`}>
                      <RadioGroupItem value="reject" id="reject" className="mt-1" />
                      <div className="flex-1 flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-base text-foreground mb-0.5">Odrzuć wniosek</p>
                          <p className="text-sm text-muted-foreground">Wydaj negatywną decyzję z uzasadnieniem</p>
                        </div>
                      </div>
                    </Label>
                  </RadioGroup>
                  {type === "promise" && !canApprove && (
                    <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                      Najpierw oznacz wniosek jako weryfikowany. Zatwierdzenie promesy bedzie dostepne po zmianie statusu na "UnderReview".
                    </div>
                  )}
                  {errors.decision && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.decision}</span>
                    </div>
                  )}
                </div>

                {decision === "approve" && type === "permit" && (
                  <>
                    <Separator className="bg-border" />
                    <div className="space-y-4">
                      <p className="text-sm font-semibold">Parametry wydawanego pozwolenia</p>
                      <div>
                        <Label htmlFor="maxFirearms">Maksymalna liczba broni (1–50) <span className="text-red-600">*</span></Label>
                        <Input
                          id="maxFirearms"
                          type="number"
                          min={1}
                          max={50}
                          value={maxFirearms}
                          onChange={(e) => setMaxFirearms(e.target.value)}
                          className="min-h-[44px] mt-1.5 rounded-xl"
                        />
                        {errors.maxFirearms && (
                          <p className="text-xs text-red-600 mt-1">{errors.maxFirearms}</p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Daty ważności badań wpisz w sekcji <strong>&quot;Ważność badań po weryfikacji&quot;</strong> wyżej na stronie.
                      </p>
                    </div>
                  </>
                )}

                {decision && decision !== "approve" && (
                  <>
                    <Separator className="bg-border" />
                    <div className="space-y-2">
                      <Label htmlFor="justification">
                        {decision === "mark-under-review" ? "Notatka (opcjonalne)" : "Uzasadnienie decyzji / Treść wezwania"}
                        {decision !== "mark-under-review" && <span className="text-red-600"> *</span>}
                      </Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        {decision === "mark-under-review"
                          ? "Możesz dodać notatkę wewnętrzną (opcjonalne)."
                          : "Podaj szczegóły decyzji (minimum 20 znaków)."}
                      </p>
                      <Textarea
                        id="justification"
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        className="min-h-[150px] rounded-xl"
                        placeholder={decision === "mark-under-review" ? "Notatka wewnętrzna..." : "Treść uzasadnienia..."}
                      />
                      <div className="flex justify-between items-center mt-1">
                        {errors.justification ? (
                          <div className="flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <span>{errors.justification}</span>
                          </div>
                        ) : <span />}
                        {decision !== "mark-under-review" && (
                          <span className="text-xs text-muted-foreground">Znaków: {justification.length} / 20</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Button type="submit" disabled={submitting} className="min-h-[52px] w-full rounded-xl text-base font-semibold">
              {submitting ? "Zapisywanie..." : "Zatwierdź i wyślij"}
            </Button>
          </form>
        </div>

        <div className="space-y-4">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Wytyczne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Weryfikacja:</strong> sprawdź ważność badań medycznych, zgodność danych obywatela oraz zasadność uzasadnienia.</p>
                <p><strong className="text-foreground">Braki:</strong> wybierz &quot;Wezwij do uzupełnienia&quot; i wskaż konkretne braki.</p>
                <p><strong className="text-foreground">Odrzucenie:</strong> wymaga uzasadnienia zgodnie z k.p.a. art. 107 § 1 pkt 6.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {previewAttachment && permitApp && (
        <AttachmentPreviewDialog
          open={!!previewAttachment}
          onOpenChange={(open) => { if (!open) setPreviewAttachment(null); }}
          fileName={previewAttachment.fileName}
          contentType={previewAttachment.contentType}
          fetchBlob={() => wpaService.downloadPermitApplicationAttachment(permitApp.id, previewAttachment.id)}
        />
      )}
    </div>
  );
}
