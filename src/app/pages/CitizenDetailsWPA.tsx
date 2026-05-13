import { useParams, useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { ArrowLeft, User, Shield, AlertTriangle, FileText, Calendar, CheckCircle, XCircle } from "lucide-react";

export function CitizenDetailsWPA() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data
  const citizen = {
    id: id || "citizen-001",
    name: "Jan Kowalski",
    pesel: "90010112345",
    dateOfBirth: "1990-01-01",
    address: "ul. Słoneczna 15/3, 00-001 Warszawa",
    email: "jan.kowalski@example.com",
    phone: "+48 123 456 789",
    totalFirearms: 2,
    activeAlerts: 1,
    permits: [
      {
        permitType: "Sport",
        permitNumber: "POZ-2025-001",
        issueDate: "2025-01-10",
        validUntil: "Bezterminowo",
        availableSlots: 3,
        usedSlots: 2,
      }
    ],
    medicalExams: {
      medicalExam: {
        issueDate: "2024-12-01",
        expiryDate: "2026-12-01",
        isValid: true,
        daysUntilExpiry: 567,
      },
      psychologicalExam: {
        issueDate: "2025-01-15",
        expiryDate: "2026-05-20",
        isValid: true,
        daysUntilExpiry: 7,
      }
    },
    firearms: [
      {
        id: "firearm-001",
        brand: "Glock",
        model: "Glock 17",
        category: "B" as "A" | "B" | "C",
        caliber: "9mm",
        serialNumber: "ABC123456",
        status: "Registered",
        registrationDate: "2025-03-15",
        permitNumber: "POZ-2025-001",
      },
      {
        id: "firearm-002",
        brand: "CZ",
        model: "CZ 75 SP-01",
        category: "B" as "A" | "B" | "C",
        caliber: "9mm",
        serialNumber: "XYZ789012",
        status: "Registered",
        registrationDate: "2025-04-20",
        permitNumber: "POZ-2025-001",
      },
    ],
    applicationHistory: [
      {
        id: "WNI-PROM-2026-000456",
        type: "e-Promesa",
        status: "Approved",
        submittedDate: "2026-05-01",
        decisionDate: "2026-05-03",
      },
      {
        id: "WNI-POZW-2026-001234",
        type: "Pozwolenie - Sport",
        status: "Approved",
        submittedDate: "2025-12-15",
        decisionDate: "2026-01-10",
      },
    ],
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Registered":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-2 py-0.5 rounded-full">Zarejestrowana</Badge>;
      case "Approved":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-2 py-0.5 rounded-full">Zaakceptowany</Badge>;
      case "Transferred":
        return <Badge variant="secondary" className="rounded-full px-2 py-0.5">Przeniesiona</Badge>;
      case "Lost":
        return <Badge variant="destructive" className="rounded-full px-2 py-0.5">Zgubiona</Badge>;
      default:
        return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: "A" | "B" | "C") => {
    const config = {
      A: { label: "Kat. A", color: "bg-red-100 text-red-800" },
      B: { label: "Kat. B", color: "bg-blue-100 text-blue-800" },
      C: { label: "Kat. C", color: "bg-green-100 text-green-800" },
    };
    return (
      <Badge className={`${config[category].color} hover:${config[category].color} border-none px-2 py-0.5 rounded-full text-xs`}>
        {config[category].label}
      </Badge>
    );
  };

  const getExamStatusBadge = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 0) {
      return <Badge variant="destructive" className="rounded-full px-2 py-0.5">Wygasło</Badge>;
    } else if (daysUntilExpiry <= 7) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-none px-2 py-0.5 rounded-full">Pilne</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none px-2 py-0.5 rounded-full">Wkrótce wygasa</Badge>;
    } else {
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-2 py-0.5 rounded-full">Aktualne</Badge>;
    }
  };

  return (
    <div className="pt-2">
      {/* Header */}
      <div className="mb-6 px-1">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 -ml-2 min-h-[44px] rounded-xl"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót do wyszukiwania
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Szczegóły obywatela</h1>
        <p className="text-muted-foreground">Pełny profil i historia aktywności</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{citizen.name}</CardTitle>
                  <CardDescription>PESEL: {citizen.pesel}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Data urodzenia</p>
                  <p className="font-medium">{citizen.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Telefon</p>
                  <p className="font-medium">{citizen.phone}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="font-medium">{citizen.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Adres zamieszkania</p>
                <p className="font-medium">{citizen.address}</p>
              </div>

              <Separator className="bg-border" />

              <div className="flex gap-3">
                <div className="flex-1 bg-muted/30 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Egzemplarze broni</p>
                  <p className="text-2xl font-bold">{citizen.totalFirearms}</p>
                </div>
                <div className="flex-1 bg-muted/30 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Aktywne alerty</p>
                  <p className="text-2xl font-bold text-orange-600">{citizen.activeAlerts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Exams */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Badania medyczne</CardTitle>
              <CardDescription>Status badań lekarskich i psychologicznych</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/30 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-base mb-1">Badanie lekarskie</h3>
                    <p className="text-sm text-muted-foreground">Wymagane co 5 lat</p>
                  </div>
                  {getExamStatusBadge(citizen.medicalExams.medicalExam.daysUntilExpiry)}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Data wydania</p>
                    <p className="font-medium">{citizen.medicalExams.medicalExam.issueDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Wygasa</p>
                    <p className="font-medium">{citizen.medicalExams.medicalExam.expiryDate}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {citizen.medicalExams.medicalExam.daysUntilExpiry > 0
                    ? `Pozostało ${citizen.medicalExams.medicalExam.daysUntilExpiry} dni`
                    : `Wygasło ${Math.abs(citizen.medicalExams.medicalExam.daysUntilExpiry)} dni temu`}
                </p>
              </div>

              <div className="bg-muted/30 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-base mb-1">Badanie psychologiczne</h3>
                    <p className="text-sm text-muted-foreground">Wymagane co 5 lat</p>
                  </div>
                  {getExamStatusBadge(citizen.medicalExams.psychologicalExam.daysUntilExpiry)}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Data wydania</p>
                    <p className="font-medium">{citizen.medicalExams.psychologicalExam.issueDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Wygasa</p>
                    <p className="font-medium">{citizen.medicalExams.psychologicalExam.expiryDate}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {citizen.medicalExams.psychologicalExam.daysUntilExpiry > 0
                    ? `Pozostało ${citizen.medicalExams.psychologicalExam.daysUntilExpiry} dni`
                    : `Wygasło ${Math.abs(citizen.medicalExams.psychologicalExam.daysUntilExpiry)} dni temu`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Firearms */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Zarejestrowana broń ({citizen.firearms.length})</CardTitle>
              <CardDescription>Lista broni w posiadaniu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {citizen.firearms.map((firearm) => (
                  <div key={firearm.id} className="bg-muted/30 rounded-xl p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-primary/10 p-2 rounded-lg mt-0.5">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base">
                            {firearm.brand} {firearm.model}
                          </h3>
                          {getCategoryBadge(firearm.category)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Kaliber: {firearm.caliber} • Nr seryjny: {firearm.serialNumber}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Pozwolenie</p>
                        <p className="font-medium">{firearm.permitNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Data rejestracji</p>
                        <p className="font-medium">{firearm.registrationDate}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      {getStatusBadge(firearm.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Application History */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Historia wniosków ({citizen.applicationHistory.length})</CardTitle>
              <CardDescription>Wszystkie wnioski złożone przez obywatela</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {citizen.applicationHistory.map((app) => (
                  <div key={app.id} className="bg-muted/30 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-base mb-1">{app.type}</h3>
                        <p className="text-sm text-muted-foreground">Nr wniosku: {app.id}</p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Data złożenia</p>
                        <p className="font-medium">{app.submittedDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Data decyzji</p>
                        <p className="font-medium">{app.decisionDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Permits */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Pozwolenia ({citizen.permits.length})</CardTitle>
              <CardDescription>Aktywne pozwolenia na broń</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {citizen.permits.map((permit, idx) => (
                <div key={idx} className="bg-muted/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">{permit.permitType}</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Numer pozwolenia</p>
                      <p className="font-medium">{permit.permitNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Data wydania</p>
                      <p className="font-medium">{permit.issueDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ważność</p>
                      <p className="font-medium">{permit.validUntil}</p>
                    </div>
                    <Separator className="bg-border my-2" />
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground mb-1">Dostępne sloty</p>
                      <p className="font-bold text-lg">
                        {permit.availableSlots} / {permit.availableSlots + permit.usedSlots}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Alerts */}
          {citizen.activeAlerts > 0 && (
            <Card className="rounded-2xl border-none shadow-sm bg-orange-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-lg">Alerty ({citizen.activeAlerts})</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-xl p-3">
                  <p className="text-sm font-semibold mb-1">Badanie psychologiczne wygasa wkrótce</p>
                  <p className="text-xs text-muted-foreground">
                    Data wygaśnięcia: {citizen.medicalExams.psychologicalExam.expiryDate}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pozostało: {citizen.medicalExams.psychologicalExam.daysUntilExpiry} dni
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full min-h-[40px] rounded-lg"
                    onClick={() => navigate("/medical-alerts")}
                  >
                    Zobacz szczegóły alertu
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Akcje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full min-h-[44px] rounded-xl justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Zobacz wszystkie wnioski
              </Button>
              <Button variant="outline" className="w-full min-h-[44px] rounded-xl justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Historia aktywności
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
