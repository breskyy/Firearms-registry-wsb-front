import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { AlertCircle, CreditCard, Shield } from "lucide-react";
import { CitizenNavIconTile } from "../components/citizen/CitizenNavIconTile";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { citizenService } from "../../services/citizenService";
import { getApiErrorMessage } from "../../lib/apiErrors";
import type { PermitApplicationDto, PermitDto, PermitType, PromiseApplicationDto } from "../../types/api";

const PERMIT_TYPE_LABELS: Record<PermitType, string> = {
  Sport: "Sportowe",
  Hunting: "Łowieckie",
  Collection: "Kolekcjonerskie",
  Protection: "Ochrony osobistej",
  Other: "Inne",
};

const PERMIT_TYPE_VALUES: Record<string, number> = {
  Sport: 0,
  Collection: 1,
  Protection: 2,
  Hunting: 3,
  Other: 4,
};

export function ApplicationCorrection() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = (searchParams.get("type") as "permit" | "promise") || "permit";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [permitApp, setPermitApp] = useState<PermitApplicationDto | null>(null);
  const [promiseApp, setPromiseApp] = useState<PromiseApplicationDto | null>(null);
  const [permits, setPermits] = useState<PermitDto[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [permitForm, setPermitForm] = useState({
    requestedPermitType: "Sport",
    reason: "",
    medicalCertificate: null as File | null,
    psychologicalCertificate: null as File | null,
  });

  const [promiseForm, setPromiseForm] = useState({
    permitId: "",
    requestedWeaponType: "",
    requestedQuantity: 1,
  });

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        if (type === "permit") {
          const apps = await citizenService.getPermitApplications();
          const app = apps.find((item) => item.id === id) ?? null;
          setPermitApp(app);
          if (app) {
            setPermitForm({
              requestedPermitType: app.requestedPermitTypeName ?? String(app.requestedPermitType),
              reason: app.reason,
              medicalCertificate: null,
              psychologicalCertificate: null,
            });
          }
        } else {
          const [apps, permitList] = await Promise.all([
            citizenService.getPromiseApplications(),
            citizenService.getPermits(),
          ]);
          const app = apps.find((item) => item.id === id) ?? null;
          setPromiseApp(app);
          setPermits(permitList.filter((permit) => permit.statusName === "Active" && permit.availableSlots > 0));
          if (app) {
            setPromiseForm({
              permitId: app.permitId,
              requestedWeaponType: app.requestedWeaponType,
              requestedQuantity: app.requestedQuantity,
            });
          }
        }
      } catch {
        toast.error("Nie udało się pobrać wniosku");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, type]);

  const app = type === "permit" ? permitApp : promiseApp;

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!app) nextErrors.form = "Nie znaleziono wniosku";
    if (app && app.statusName !== "RequiresCorrection") {
      nextErrors.form = "Ten wniosek nie wymaga już uzupełnienia";
    }
    if (type === "permit") {
      if (permitForm.reason.length < 20) nextErrors.reason = "Uzasadnienie musi mieć minimum 20 znaków";
    } else {
      if (!promiseForm.permitId) nextErrors.permitId = "Wybierz pozwolenie";
      if (promiseForm.requestedWeaponType.length < 5) nextErrors.requestedWeaponType = "Opis broni musi mieć minimum 5 znaków";
      if (promiseForm.requestedQuantity < 1) nextErrors.requestedQuantity = "Ilość musi być większa niż 0";
      const selectedPermit = permits.find((permit) => permit.id === promiseForm.permitId);
      if (selectedPermit && promiseForm.requestedQuantity > selectedPermit.availableSlots) {
        nextErrors.requestedQuantity = `Maksymalna ilość dla tego pozwolenia: ${selectedPermit.availableSlots}`;
      }
    }
    return nextErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      if (type === "permit") {
        await citizenService.updatePermitApplicationCorrection(id, {
          requestedPermitType: PERMIT_TYPE_VALUES[permitForm.requestedPermitType] as any,
          reason: permitForm.reason,
        });
        if (permitForm.medicalCertificate || permitForm.psychologicalCertificate) {
          await citizenService.uploadPermitApplicationAttachments(id, {
            medicalCertificate: permitForm.medicalCertificate,
            psychologicalCertificate: permitForm.psychologicalCertificate,
          });
        }
      } else {
        await citizenService.updatePromiseApplicationCorrection(id, promiseForm);
      }
      toast.success("Uzupełnienie wysłane", {
        description: "Wniosek wrócił do urzędu ze statusem „Złożony”.",
      });
      navigate("/applications");
    } catch (err: unknown) {
      toast.error("Nie udało się wysłać uzupełnienia", {
        description: getApiErrorMessage(err),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-2 space-y-4">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-64 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-1">Uzupełnij wniosek</h1>
        <p className="text-muted-foreground">Popraw dane zgodnie z uwagami urzędu i wyślij ponownie</p>
      </div>

      {app?.correctionNotes && (
        <Card className="mb-4 rounded-2xl border-none shadow-sm bg-orange-50/60">
          <CardContent className="p-4 flex gap-3 text-orange-900">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm mb-1">Uwagi urzędu</p>
              <p className="text-sm">{app.correctionNotes}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <CitizenNavIconTile className="scale-90 [&_svg]:h-5 [&_svg]:w-5 p-2.5">
                {type === "permit" ? <Shield /> : <CreditCard />}
              </CitizenNavIconTile>
              <div>
                <CardTitle className="text-lg">
                  {type === "permit" ? "Wniosek o pozwolenie" : "Wniosek o e-Promese"}
                </CardTitle>
                <CardDescription>Po wysłaniu status zmieni się na „Złożony”</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors.form && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{errors.form}</p>}

            {type === "permit" ? (
              <>
                <div>
                  <Label htmlFor="requestedPermitType">Rodzaj pozwolenia</Label>
                  <Select
                    value={permitForm.requestedPermitType}
                    onValueChange={(value) => setPermitForm({ ...permitForm, requestedPermitType: value })}
                  >
                    <SelectTrigger id="requestedPermitType" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PERMIT_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reason">Uzasadnienie</Label>
                  <Textarea
                    id="reason"
                    value={permitForm.reason}
                    onChange={(e) => setPermitForm({ ...permitForm, reason: e.target.value })}
                    className="min-h-[140px] mt-2 rounded-xl"
                  />
                  {errors.reason && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{errors.reason}</p>}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label htmlFor="medicalCertificate">Nowe zaświadczenie lekarskie</Label>
                    <Input
                      id="medicalCertificate"
                      type="file"
                      accept="application/pdf,image/jpeg,image/png"
                      onChange={(e) => setPermitForm({ ...permitForm, medicalCertificate: e.target.files?.[0] ?? null })}
                      className="mt-2"
                    />
                    {permitForm.medicalCertificate && <p className="text-xs text-muted-foreground mt-1 truncate">{permitForm.medicalCertificate.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="psychologicalCertificate">Nowe zaświadczenie psychologiczne</Label>
                    <Input
                      id="psychologicalCertificate"
                      type="file"
                      accept="application/pdf,image/jpeg,image/png"
                      onChange={(e) => setPermitForm({ ...permitForm, psychologicalCertificate: e.target.files?.[0] ?? null })}
                      className="mt-2"
                    />
                    {permitForm.psychologicalCertificate && <p className="text-xs text-muted-foreground mt-1 truncate">{permitForm.psychologicalCertificate.name}</p>}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Jeśli urząd poprosił tylko o zmianę uzasadnienia, pliki możesz zostawić puste. Jeśli brakuje zaświadczeń, dodaj nowe pliki (PDF, JPG lub PNG).
                </p>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="permitId">Pozwolenie</Label>
                  <Select
                    value={promiseForm.permitId}
                    onValueChange={(value) => setPromiseForm({ ...promiseForm, permitId: value })}
                  >
                    <SelectTrigger id="permitId" className="mt-2">
                      <SelectValue placeholder="Wybierz pozwolenie" />
                    </SelectTrigger>
                    <SelectContent>
                      {permits.map((permit) => (
                        <SelectItem key={permit.id} value={permit.id}>
                          {permit.permitNumber} — wolne miejsca w pozwoleniu: {permit.availableSlots}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.permitId && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{errors.permitId}</p>}
                </div>
                <div>
                  <Label htmlFor="requestedWeaponType">Typ broni</Label>
                  <Input
                    id="requestedWeaponType"
                    value={promiseForm.requestedWeaponType}
                    onChange={(e) => setPromiseForm({ ...promiseForm, requestedWeaponType: e.target.value })}
                    className="mt-2"
                    maxLength={100}
                  />
                  {errors.requestedWeaponType && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{errors.requestedWeaponType}</p>}
                </div>
                <div>
                  <Label htmlFor="requestedQuantity">Ilość</Label>
                  <Input
                    id="requestedQuantity"
                    type="number"
                    min={1}
                    value={promiseForm.requestedQuantity}
                    onChange={(e) => setPromiseForm({ ...promiseForm, requestedQuantity: Number(e.target.value) })}
                    className="mt-2"
                  />
                  {errors.requestedQuantity && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{errors.requestedQuantity}</p>}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Button type="submit" disabled={submitting || !app} className="w-full min-h-[52px] rounded-xl font-semibold">
          {submitting ? "Wysyłanie..." : "Wyślij uzupełnienie"}
        </Button>
      </form>
    </div>
  );
}
