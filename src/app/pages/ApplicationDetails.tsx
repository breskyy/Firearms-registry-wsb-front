import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { User, Shield, AlertCircle, ArrowLeft } from "lucide-react";
import { wpaService } from "../../services/wpaService";
import type { WpaPermitApplicationDto, WpaPromiseApplicationDto } from "../../types/api";

const PERMIT_TYPE_LABELS: Record<string, string> = {
  Sport: "Sportowe",
  Hunting: "Łowieckie",
  Collection: "Kolekcjonerskie",
  Protection: "Ochrony osobistej",
  Other: "Inne",
};

function getStatusBadge(status: string) {
  switch (status) {
    case "Submitted":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none px-2 py-0.5 rounded-full">Złożony</Badge>;
    case "Paid":
      return <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200 border-none px-2 py-0.5 rounded-full">Opłacony</Badge>;
    case "UnderReview":
      return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none px-2 py-0.5 rounded-full">W weryfikacji</Badge>;
    case "Approved":
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-2 py-0.5 rounded-full">Zatwierdzony</Badge>;
    case "Rejected":
      return <Badge variant="destructive" className="rounded-full px-2 py-0.5">Odrzucony</Badge>;
    case "RequiresCorrection":
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-none px-2 py-0.5 rounded-full">Do uzupełnienia</Badge>;
    default:
      return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
  }
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(s: string) {
  return new Date(s).toLocaleString("pl-PL");
}

export function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = (searchParams.get("type") as "permit" | "promise") || "permit";
  const isOfficer = localStorage.getItem("userRole") === "officer";

  const [permitApp, setPermitApp] = useState<WpaPermitApplicationDto | null>(null);
  const [promiseApp, setPromiseApp] = useState<WpaPromiseApplicationDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const promise = type === "permit"
      ? wpaService.getPermitApplicationById(id).then((d) => { setPermitApp(d); setPromiseApp(null); })
      : wpaService.getPromiseApplicationById(id).then((d) => { setPromiseApp(d); setPermitApp(null); });
    promise.catch(() => {}).finally(() => setLoading(false));
  }, [id, type]);

  if (loading) {
    return (
      <div className="pt-2 space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-48 rounded-2xl bg-muted animate-pulse" />
        <div className="h-32 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  const app = permitApp ?? promiseApp;
  if (!app) {
    return (
      <div className="pt-2">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-2 min-h-[44px] rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót
        </Button>
        <p className="text-muted-foreground">Nie znaleziono wniosku.</p>
      </div>
    );
  }

  const title = permitApp
    ? `Wniosek o pozwolenie — ${PERMIT_TYPE_LABELS[permitApp.requestedPermitTypeName] ?? permitApp.requestedPermitTypeName}`
    : promiseApp
      ? `Wniosek o promesę — ${promiseApp.requestedWeaponType}`
      : "Wniosek";

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-2 min-h-[44px] rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót
        </Button>
        <div className="flex items-start justify-between mb-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex-1 pr-4">{title}</h1>
          <div className="mt-1">{getStatusBadge(app.statusName)}</div>
        </div>
        <p className="text-muted-foreground">Nr wniosku: <span className="font-mono">{app.id}</span></p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Rejection / correction */}
          {app.statusName === "Rejected" && app.rejectionReason && (
            <Card className="rounded-2xl border-none shadow-sm bg-red-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-xl text-red-600">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg text-red-900">Powód odrzucenia</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-red-800 text-sm">{app.rejectionReason}</p>
              </CardContent>
            </Card>
          )}

          {app.statusName === "RequiresCorrection" && app.correctionNotes && (
            <Card className="rounded-2xl border-none shadow-sm bg-orange-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg text-orange-900">Wezwanie do uzupełnienia</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-orange-900 text-sm">{app.correctionNotes}</p>
              </CardContent>
            </Card>
          )}

          {/* Applicant Info */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-xl text-primary"><User className="h-5 w-5" /></div>
                <CardTitle className="text-lg">Dane wnioskodawcy</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Imię i nazwisko</p>
                <p className="font-medium">{app.citizenName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">PESEL</p>
                <p className="font-medium font-mono">{app.citizenPesel}</p>
              </div>
            </CardContent>
          </Card>

          {/* Application body */}
          {permitApp && (
            <Card className="rounded-2xl border-none shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary"><Shield className="h-5 w-5" /></div>
                  <CardTitle className="text-lg">Informacje o pozwoleniu</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Rodzaj pozwolenia</p>
                  <p className="font-medium">{PERMIT_TYPE_LABELS[permitApp.requestedPermitTypeName] ?? permitApp.requestedPermitTypeName}</p>
                </div>
                <Separator className="bg-border" />
                <div>
                  <p className="text-xs text-muted-foreground">Uzasadnienie</p>
                  <p className="text-sm bg-muted/30 rounded-lg p-3 mt-1">{permitApp.reason}</p>
                </div>
                <Separator className="bg-border" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Ważność bad. lekarskiego</p>
                    <p className="font-medium">{permitApp.medicalExamExpiryDate ? formatDate(permitApp.medicalExamExpiryDate) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ważność bad. psychologicznego</p>
                    <p className="font-medium">{permitApp.psychologicalExamExpiryDate ? formatDate(permitApp.psychologicalExamExpiryDate) : "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {promiseApp && (
            <Card className="rounded-2xl border-none shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary"><Shield className="h-5 w-5" /></div>
                  <CardTitle className="text-lg">Informacje o promesie</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Pozwolenie bazowe</p>
                  <p className="font-medium font-mono">{promiseApp.permitNumber}</p>
                  <p className="text-xs text-muted-foreground mt-1">({promiseApp.permitType})</p>
                </div>
                <Separator className="bg-border" />
                <div>
                  <p className="text-xs text-muted-foreground">Wnioskowana broń</p>
                  <p className="font-medium">{promiseApp.requestedWeaponType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ilość</p>
                  <p className="font-medium">{promiseApp.requestedQuantity} szt.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Aktualny status</p>
                {getStatusBadge(app.statusName)}
              </div>
              <Separator className="bg-border" />
              <div>
                <p className="text-xs text-muted-foreground">Data złożenia</p>
                <p className="font-medium">{formatDateTime(app.createdAt)}</p>
              </div>
              {app.reviewedAt && (
                <div>
                  <p className="text-xs text-muted-foreground">Data rozpatrzenia</p>
                  <p className="font-medium">{formatDateTime(app.reviewedAt)}</p>
                </div>
              )}
              {app.reviewedByOfficerName && (
                <div>
                  <p className="text-xs text-muted-foreground">Urzędnik</p>
                  <p className="font-medium">{app.reviewedByOfficerName}</p>
                </div>
              )}

              {isOfficer && (app.statusName === "Submitted" || app.statusName === "UnderReview" || app.statusName === "Paid" || app.statusName === "RequiresCorrection") && (
                <>
                  <Separator className="bg-border" />
                  <Button className="w-full rounded-xl mt-2" onClick={() => navigate(`/decision/${app.id}?type=${type}`)}>
                    Przejdź do decyzji
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Required so the ID interpolation has access to the discriminated app variant.
// (kept above; nothing to do here)
