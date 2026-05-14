import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { FileText, Clock, CheckCircle, XCircle, Shield, CreditCard, AlertTriangle, Search } from "lucide-react";
import { wpaService } from "../../services/wpaService";
import type { WpaPermitApplicationDto, WpaPromiseApplicationDto, WpaMedicalAlertDto } from "../../types/api";

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
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-2 py-0.5 rounded-full">Zaakceptowany</Badge>;
    case "Rejected":
      return <Badge variant="destructive" className="rounded-full px-2 py-0.5">Odrzucony</Badge>;
    case "RequiresCorrection":
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-none px-2 py-0.5 rounded-full">Do uzupełnienia</Badge>;
    default:
      return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
  }
}

function getAlertTypeLabel(type: string) {
  switch (type) {
    case "MedicalExamExpiring": return "Badanie lekarskie wygasa";
    case "PsychologicalExamExpiring": return "Badanie psychologiczne wygasa";
    case "MedicalExamExpired": return "Badanie lekarskie wygasło";
    case "PsychologicalExamExpired": return "Badanie psychologiczne wygasło";
    default: return type;
  }
}

function getAlertBadge(type: string) {
  if (type === "MedicalExamExpired" || type === "PsychologicalExamExpired") {
    return <Badge variant="destructive" className="rounded-full px-2 py-0.5">Wygasło</Badge>;
  }
  return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none px-2 py-0.5 rounded-full">Uwaga</Badge>;
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

export function OfficerDashboard() {
  const navigate = useNavigate();
  const [permitApps, setPermitApps] = useState<WpaPermitApplicationDto[]>([]);
  const [promiseApps, setPromiseApps] = useState<WpaPromiseApplicationDto[]>([]);
  const [alerts, setAlerts] = useState<WpaMedicalAlertDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pa, pra, al] = await Promise.all([
          wpaService.getPermitApplications({ page: 1, pageSize: 20 }),
          wpaService.getPromiseApplications({ page: 1, pageSize: 20 }),
          wpaService.getMedicalAlerts({ page: 1, pageSize: 20, resolved: false }),
        ]);
        setPermitApps(pa.items);
        setPromiseApps(pra.items);
        setAlerts(al.items);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pendingPermits = permitApps.filter((a) => a.statusName === "Submitted" || a.statusName === "UnderReview");
  const pendingPromises = promiseApps.filter((a) => a.statusName === "Submitted" || a.statusName === "Paid" || a.statusName === "UnderReview");
  const approvedToday = [...permitApps, ...promiseApps].filter((a) => {
    if (a.statusName !== "Approved" || !a.reviewedAt) return false;
    const d = new Date(a.reviewedAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;
  const rejectedToday = [...permitApps, ...promiseApps].filter((a) => {
    if (a.statusName !== "Rejected" || !a.reviewedAt) return false;
    const d = new Date(a.reviewedAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  if (loading) {
    return (
      <div className="pt-2">
        <div className="mb-6 px-1">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-lg mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Panel urzędnika WPA</h1>
        <p className="text-muted-foreground">Rozpatrywanie wniosków i zarządzanie decyzjami administracyjnymi</p>
      </div>

      {/* Statistics */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5 mb-6">
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Pozwolenia</p>
                <p className="text-2xl font-bold">{pendingPermits.length}</p>
              </div>
              <div className="bg-blue-50 p-2 rounded-full">
                <Shield className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Promesy</p>
                <p className="text-2xl font-bold">{pendingPromises.length}</p>
              </div>
              <div className="bg-blue-50 p-2 rounded-full">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Alerty medyczne</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
              <div className="bg-orange-50 p-2 rounded-full">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Zatwierdzone</p>
                <p className="text-2xl font-bold">{approvedToday}</p>
              </div>
              <div className="bg-emerald-50 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Odrzucone</p>
                <p className="text-2xl font-bold">{rejectedToday}</p>
              </div>
              <div className="bg-red-50 p-2 rounded-full">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3 px-1 text-foreground">Narzędzia WPA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="rounded-2xl border-none shadow-sm hover:bg-muted/30 transition-colors cursor-pointer active:scale-[0.98]" onClick={() => navigate("/wpa/search")}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-base mb-0.5">Wyszukiwarka</h4>
                <p className="text-xs text-muted-foreground">Szukaj obywateli i broni w rejestrze</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm hover:bg-muted/30 transition-colors cursor-pointer active:scale-[0.98]" onClick={() => navigate("/applications")}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-base mb-0.5">Wszystkie wnioski</h4>
                <p className="text-xs text-muted-foreground">Przeglądaj archiwum wniosków</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pending Work Tabs */}
      <Tabs defaultValue="permits" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 rounded-2xl h-auto p-1 bg-muted/50">
          <TabsTrigger value="permits" className="rounded-xl min-h-[44px] data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Pozwolenia</span>
            <span className="sm:hidden">Pozw.</span>
            <span className="ml-1">({pendingPermits.length})</span>
          </TabsTrigger>
          <TabsTrigger value="promises" className="rounded-xl min-h-[44px] data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Promesy</span>
            <span className="sm:hidden">Prom.</span>
            <span className="ml-1">({pendingPromises.length})</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="rounded-xl min-h-[44px] data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Alerty</span>
            <span className="sm:hidden">Alert.</span>
            <span className="ml-1">({alerts.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Permit Applications Tab */}
        <TabsContent value="permits" className="mt-0">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Wnioski o pozwolenie na broń</CardTitle>
              <CardDescription>Oczekujące wnioski do rozpatrzenia</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPermits.length > 0 ? (
                <div className="space-y-3">
                  {pendingPermits.map((app) => (
                    <div key={app.id} className="bg-muted/30 rounded-2xl p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-2">
                            <h3 className="flex-1 font-semibold text-base">
                              Pozwolenie — {PERMIT_TYPE_LABELS[app.requestedPermitTypeName] ?? app.requestedPermitTypeName}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">Wnioskodawca: {app.citizenName}</p>
                          <p className="text-sm text-muted-foreground">PESEL: {app.citizenPesel} • Data: {formatDate(app.createdAt)}</p>
                          <div className="mt-3">{getStatusBadge(app.statusName)}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => navigate(`/applications/${app.id}?type=permit`)} variant="outline" className="min-h-[44px] rounded-xl">
                            Szczegóły
                          </Button>
                          <Button onClick={() => navigate(`/decision/${app.id}?type=permit`)} className="min-h-[44px] rounded-xl">
                            Rozpatrz
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Brak oczekujących wniosków o pozwolenie</p>
                </div>
              )}

              {permitApps.length > 0 && (
                <div className="mt-4 text-center">
                  <Button onClick={() => navigate("/applications")} variant="outline" className="min-h-[44px] rounded-xl">
                    Zobacz wszystkie wnioski
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promise Applications Tab */}
        <TabsContent value="promises" className="mt-0">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Wnioski o e-Promesę</CardTitle>
              <CardDescription>Oczekujące wnioski do rozpatrzenia</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPromises.length > 0 ? (
                <div className="space-y-3">
                  {pendingPromises.map((app) => (
                    <div key={app.id} className="bg-muted/30 rounded-2xl p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-2">
                            <h3 className="flex-1 font-semibold text-base">{app.requestedWeaponType}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">Wnioskodawca: {app.citizenName}</p>
                          <p className="text-sm text-muted-foreground">PESEL: {app.citizenPesel} • Data: {formatDate(app.createdAt)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Pozwolenie: {app.permitNumber} • Ilość: {app.requestedQuantity}
                          </p>
                          <div className="mt-3">{getStatusBadge(app.statusName)}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => navigate(`/applications/${app.id}?type=promise`)} variant="outline" className="min-h-[44px] rounded-xl">
                            Szczegóły
                          </Button>
                          <Button onClick={() => navigate(`/decision/${app.id}?type=promise`)} className="min-h-[44px] rounded-xl">
                            Rozpatrz
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Brak oczekujących wniosków o promesę</p>
                </div>
              )}

              {promiseApps.length > 0 && (
                <div className="mt-4 text-center">
                  <Button onClick={() => navigate("/applications")} variant="outline" className="min-h-[44px] rounded-xl">
                    Zobacz wszystkie wnioski
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Alerts Tab */}
        <TabsContent value="alerts" className="mt-0">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Alerty medyczne</CardTitle>
              <CardDescription>Wygasające i wygasłe badania lekarskie</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="bg-muted/30 rounded-2xl p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-2">
                            <h3 className="flex-1 font-semibold text-base">{getAlertTypeLabel(alert.alertTypeName)}</h3>
                            {getAlertBadge(alert.alertTypeName)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">Obywatel: {alert.citizenName}</p>
                          <p className="text-sm text-muted-foreground">PESEL: {alert.citizenPesel}</p>
                          {alert.dueDate && (
                            <p className="text-xs text-muted-foreground mt-1">Data wygaśnięcia: {formatDate(alert.dueDate)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Brak aktywnych alertów medycznych</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
