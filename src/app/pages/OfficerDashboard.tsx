import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { FileText, Clock, CheckCircle, XCircle, Shield, CreditCard, AlertTriangle, Search, User } from "lucide-react";

export function OfficerDashboard() {
  const navigate = useNavigate();

  // Mock data
  const stats = {
    pendingPermits: 8,
    pendingPromises: 7,
    approvedToday: 3,
    rejectedToday: 1,
    totalApplications: 245,
    medicalAlerts: 5,
  };

  const pendingPermitApplications = [
    {
      id: "WNI-POZW-2026-001234",
      applicant: "Jan Kowalski",
      pesel: "90010112345",
      requestedPermitType: "Sport",
      status: "Paid",
      submittedDate: "2026-04-10",
      priority: "normal",
    },
    {
      id: "WNI-POZW-2026-001233",
      applicant: "Anna Nowak",
      pesel: "85032298765",
      requestedPermitType: "Hunting",
      status: "Paid",
      submittedDate: "2026-04-09",
      priority: "normal",
    },
    {
      id: "WNI-POZW-2026-001232",
      applicant: "Piotr Wiśniewski",
      pesel: "78121556789",
      requestedPermitType: "Sport",
      status: "UnderReview",
      submittedDate: "2026-04-08",
      priority: "high",
    },
  ];

  const pendingPromiseApplications = [
    {
      id: "WNI-PROM-2026-000456",
      applicant: "Tomasz Lewandowski",
      pesel: "92050143210",
      permitNumber: "POZ-2025-034",
      requestedWeaponType: "Pistolet CZ 75 9mm",
      requestedQuantity: 1,
      status: "Paid",
      submittedDate: "2026-05-01",
      priority: "normal",
    },
    {
      id: "WNI-PROM-2026-000455",
      applicant: "Katarzyna Nowak",
      pesel: "88110287654",
      permitNumber: "POZ-2024-078",
      requestedWeaponType: "Karabin sportowy .22LR",
      requestedQuantity: 1,
      status: "Paid",
      submittedDate: "2026-04-30",
      priority: "normal",
    },
    {
      id: "WNI-PROM-2026-000454",
      applicant: "Marek Kowalski",
      pesel: "75030165432",
      permitNumber: "POZ-2023-012",
      requestedWeaponType: "Rewolwer .357 Magnum",
      requestedQuantity: 1,
      status: "UnderReview",
      submittedDate: "2026-04-28",
      priority: "high",
    },
  ];

  const medicalAlerts = [
    {
      id: "ALERT-001",
      citizenName: "Jan Kowalski",
      citizenPesel: "90010112345",
      medicalAlertType: "MedicalExamExpiring",
      expiryDate: "2026-05-20",
      daysUntilExpiry: 7,
    },
    {
      id: "ALERT-002",
      citizenName: "Anna Nowak",
      citizenPesel: "85032298765",
      medicalAlertType: "PsychologicalExamExpired",
      expiryDate: "2026-05-10",
      daysUntilExpiry: -3,
    },
    {
      id: "ALERT-003",
      citizenName: "Piotr Wiśniewski",
      citizenPesel: "78121556789",
      medicalAlertType: "MedicalExamExpiring",
      expiryDate: "2026-05-25",
      daysUntilExpiry: 12,
    },
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="rounded-full px-2 py-0.5">Wysoki priorytet</Badge>;
      case "normal":
        return <Badge variant="secondary" className="rounded-full px-2 py-0.5">Normalny</Badge>;
      default:
        return <Badge className="rounded-full px-2 py-0.5">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200 border-none px-2 py-0.5 rounded-full">Opłacony</Badge>;
      case "UnderReview":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none px-2 py-0.5 rounded-full">W weryfikacji</Badge>;
      default:
        return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
    }
  };

  const getAlertTypeBadge = (type: string, daysUntilExpiry: number) => {
    const isExpired = daysUntilExpiry <= 0;
    const isUrgent = daysUntilExpiry > 0 && daysUntilExpiry <= 7;

    if (isExpired) {
      return <Badge variant="destructive" className="rounded-full px-2 py-0.5">Wygasło</Badge>;
    } else if (isUrgent) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-none px-2 py-0.5 rounded-full">Pilne</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none px-2 py-0.5 rounded-full">Uwaga</Badge>;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case "MedicalExamExpiring":
        return "Badanie lekarskie wygasa";
      case "PsychologicalExamExpiring":
        return "Badanie psychologiczne wygasa";
      case "MedicalExamExpired":
        return "Badanie lekarskie wygasło";
      case "PsychologicalExamExpired":
        return "Badanie psychologiczne wygasło";
      default:
        return type;
    }
  };

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
                <p className="text-2xl font-bold">{stats.pendingPermits}</p>
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
                <p className="text-2xl font-bold">{stats.pendingPromises}</p>
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
                <p className="text-2xl font-bold">{stats.medicalAlerts}</p>
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
                <p className="text-2xl font-bold">{stats.approvedToday}</p>
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
                <p className="text-2xl font-bold">{stats.rejectedToday}</p>
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
            <span className="ml-1">({pendingPermitApplications.length})</span>
          </TabsTrigger>
          <TabsTrigger value="promises" className="rounded-xl min-h-[44px] data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Promesy</span>
            <span className="sm:hidden">Prom.</span>
            <span className="ml-1">({pendingPromiseApplications.length})</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="rounded-xl min-h-[44px] data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Alerty</span>
            <span className="sm:hidden">Alert.</span>
            <span className="ml-1">({medicalAlerts.length})</span>
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
              <div className="space-y-3">
                {pendingPermitApplications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-muted/30 rounded-2xl p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-2">
                          <h3 className="flex-1 font-semibold text-base">Pozwolenie - {app.requestedPermitType}</h3>
                          {getPriorityBadge(app.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Wnioskodawca: {app.applicant}
                        </p>
                        <p className="text-sm text-muted-foreground">Nr wniosku: {app.id} • Data: {app.submittedDate}</p>
                        <div className="mt-3">{getStatusBadge(app.status)}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate(`/applications/${app.id}`)}
                          variant="outline"
                          className="min-h-[44px] rounded-xl"
                        >
                          Szczegóły
                        </Button>
                        <Button
                          onClick={() => navigate(`/decision/${app.id}`)}
                          className="min-h-[44px] rounded-xl"
                        >
                          Rozpatrz
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <Button
                  onClick={() => navigate("/applications")}
                  variant="outline"
                  className="min-h-[44px] rounded-xl"
                >
                  Zobacz wszystkie wnioski
                </Button>
              </div>
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
              <div className="space-y-3">
                {pendingPromiseApplications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-muted/30 rounded-2xl p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-2">
                          <h3 className="flex-1 font-semibold text-base">{app.requestedWeaponType}</h3>
                          {getPriorityBadge(app.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Wnioskodawca: {app.applicant}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Nr wniosku: {app.id} • Data: {app.submittedDate}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Pozwolenie: {app.permitNumber} • Ilość: {app.requestedQuantity}
                        </p>
                        <div className="mt-3">{getStatusBadge(app.status)}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate(`/applications/${app.id}`)}
                          variant="outline"
                          className="min-h-[44px] rounded-xl"
                        >
                          Szczegóły
                        </Button>
                        <Button
                          onClick={() => navigate(`/decision/${app.id}`)}
                          className="min-h-[44px] rounded-xl"
                        >
                          Rozpatrz
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <Button
                  onClick={() => navigate("/applications")}
                  variant="outline"
                  className="min-h-[44px] rounded-xl"
                >
                  Zobacz wszystkie wnioski
                </Button>
              </div>
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
              <div className="space-y-3">
                {medicalAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-muted/30 rounded-2xl p-4 hover:bg-muted/50 transition-colors cursor-pointer active:scale-[0.99]"
                    onClick={() => navigate("/medical-alerts")}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-2">
                          <h3 className="flex-1 font-semibold text-base">{getAlertTypeLabel(alert.medicalAlertType)}</h3>
                          {getAlertTypeBadge(alert.medicalAlertType, alert.daysUntilExpiry)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Obywatel: {alert.citizenName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PESEL: {alert.citizenPesel}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Data wygaśnięcia: {alert.expiryDate}
                          {alert.daysUntilExpiry > 0 && ` (za ${alert.daysUntilExpiry} dni)`}
                          {alert.daysUntilExpiry <= 0 && ` (wygasło ${Math.abs(alert.daysUntilExpiry)} dni temu)`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <Button
                  onClick={() => navigate("/medical-alerts")}
                  variant="outline"
                  className="min-h-[44px] rounded-xl"
                >
                  Zobacz wszystkie alerty
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
