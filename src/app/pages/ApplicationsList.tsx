import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Search, Shield, CreditCard } from "lucide-react";

export function ApplicationsList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Determine user role based on local storage
  const userRole = localStorage.getItem("userRole") || "citizen";
  const isOfficer = userRole === "officer";
  const isShop = userRole === "shop";

  const getPageTitle = () => {
    if (isOfficer) return "Wnioski do rozpatrzenia";
    if (isShop) return "Zgłoszenia sprzedaży";
    return "Moje sprawy";
  };

  const getPageDescription = () => {
    if (isOfficer) return "Przeglądaj i rozpatruj wnioski o wydanie pozwolenia";
    if (isShop) return "Historia zarejestrowanych transakcji sprzedaży";
    return "Lista Twoich wniosków i zgłoszeń";
  };

  // Mock data - Permit Applications
  const permitApplications = [
    {
      id: "WNI-POZW-2026-001234",
      applicant: "Jan Kowalski",
      type: "Pozwolenie na broń - Sport",
      requestedPermitType: "Sport",
      reason: "Uprawiam strzelectwo sportowe w klubie AZS",
      status: "Submitted",
      submittedDate: "2026-04-10",
      priority: "normal",
    },
    {
      id: "WNI-POZW-2026-001233",
      applicant: "Anna Nowak",
      type: "Pozwolenie na broń - Łowiectwo",
      requestedPermitType: "Hunting",
      reason: "Posiadam patent myśliwski nr MY-12345",
      status: "Approved",
      submittedDate: "2026-04-05",
      priority: "normal",
    },
    {
      id: "WNI-POZW-2026-001231",
      applicant: "Maria Kowalczyk",
      type: "Pozwolenie na broń - Kolekcjonerstwo",
      requestedPermitType: "Collection",
      reason: "Prowadzę kolekcję broni historycznej",
      status: "Rejected",
      submittedDate: "2026-04-01",
      priority: "normal",
    },
  ];

  // Mock data - Promise Applications
  const promiseApplications = [
    {
      id: "WNI-PROM-2026-000456",
      applicant: "Jan Kowalski",
      type: "e-Promesa",
      permitNumber: "POZ-2025-001",
      requestedWeaponType: "Pistolet sportowy 9mm",
      requestedQuantity: 1,
      status: "Paid",
      submittedDate: "2026-05-01",
      priority: "normal",
    },
    {
      id: "WNI-PROM-2026-000455",
      applicant: "Anna Nowak",
      type: "e-Promesa",
      permitNumber: "POZ-2025-012",
      requestedWeaponType: "Karabin myśliwski kal. 308",
      requestedQuantity: 1,
      status: "Approved",
      submittedDate: "2026-04-28",
      priority: "normal",
    },
    {
      id: "WNI-PROM-2026-000454",
      applicant: "Piotr Wiśniewski",
      type: "e-Promesa",
      permitNumber: "POZ-2024-089",
      requestedWeaponType: "Rewolwer sportowy .357",
      requestedQuantity: 1,
      status: "UnderReview",
      submittedDate: "2026-04-25",
      priority: "high",
    },
    {
      id: "WNI-PROM-2026-000453",
      applicant: "Tomasz Lewandowski",
      type: "e-Promesa",
      permitNumber: "POZ-2025-034",
      requestedWeaponType: "Pistolet CZ 75 9mm",
      requestedQuantity: 1,
      status: "RequiresCorrection",
      submittedDate: "2026-04-20",
      priority: "normal",
    },
  ];

  const getStatusBadge = (status: string) => {
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
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-none px-2 py-0.5 rounded-full">Wymaga uzupełnienia</Badge>;
      default:
        return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === "high") {
      return <Badge variant="destructive" className="ml-2">Wysoki priorytet</Badge>;
    }
    return null;
  };

  const filterApplications = (apps: typeof permitApplications | typeof promiseApplications) => {
    return apps.filter((app) => {
      const matchesSearch =
        app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  const filteredPermitApplications = filterApplications(permitApplications);
  const filteredPromiseApplications = filterApplications(promiseApplications);

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
          {getPageTitle()}
        </h1>
        <p className="text-muted-foreground">
          {getPageDescription()}
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6 rounded-2xl border-none shadow-sm">
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="search" className="text-sm font-medium mb-2 block">
                Wyszukaj wniosek
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Numer wniosku, nazwisko..."
                  className="min-h-[44px] pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="statusFilter" className="text-sm font-medium mb-2 block">
                Filtruj po statusie
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="statusFilter" className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="Submitted">Złożone</SelectItem>
                  <SelectItem value="Paid">Opłacone</SelectItem>
                  <SelectItem value="UnderReview">W weryfikacji</SelectItem>
                  <SelectItem value="Approved">Zaakceptowane</SelectItem>
                  <SelectItem value="Rejected">Odrzucone</SelectItem>
                  <SelectItem value="RequiresCorrection">Wymagające uzupełnienia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Tabs */}
      <Tabs defaultValue="permits" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl h-auto p-1 bg-muted/50">
          <TabsTrigger value="permits" className="rounded-xl min-h-[44px] data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Pozwolenia ({filteredPermitApplications.length})</span>
          </TabsTrigger>
          <TabsTrigger value="promises" className="rounded-xl min-h-[44px] data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Promesy ({filteredPromiseApplications.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Permit Applications Tab */}
        <TabsContent value="permits" className="mt-0">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Wnioski o pozwolenie</CardTitle>
              <CardDescription>
                {statusFilter === "all"
                  ? "Wszystkie wnioski o wydanie pozwolenia na broń"
                  : `Wnioski ze statusem: ${statusFilter}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPermitApplications.length > 0 ? (
                <div className="space-y-3">
                  {filteredPermitApplications.map((app) => (
                    <div
                      key={app.id}
                      className="bg-muted/30 rounded-xl p-4 hover:bg-muted/50 transition-colors cursor-pointer active:scale-[0.99]"
                      onClick={() => navigate(`/applications/${app.id}`)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-1">
                            <h3 className="flex-1 font-semibold text-base">{app.type}</h3>
                            {isOfficer && getPriorityBadge(app.priority)}
                          </div>
                          {isOfficer && (
                            <p className="text-sm text-muted-foreground mb-1">
                              Wnioskodawca: {app.applicant}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">Nr wniosku: {app.id} • Data: {app.submittedDate}</p>
                          <div className="mt-3">{getStatusBadge(app.status)}</div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          {isOfficer && (app.status === "Submitted" || app.status === "Paid" || app.status === "UnderReview") && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/decision/${app.id}`);
                              }}
                              className="min-h-[44px] rounded-xl"
                            >
                              Rozpatrz
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nie znaleziono wniosków o pozwolenie spełniających kryteria</p>
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
              <CardDescription>
                {statusFilter === "all"
                  ? "Wszystkie wnioski o wydanie e-Promesy"
                  : `Wnioski ze statusem: ${statusFilter}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPromiseApplications.length > 0 ? (
                <div className="space-y-3">
                  {filteredPromiseApplications.map((app) => (
                    <div
                      key={app.id}
                      className="bg-muted/30 rounded-xl p-4 hover:bg-muted/50 transition-colors cursor-pointer active:scale-[0.99]"
                      onClick={() => navigate(`/applications/${app.id}`)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-1">
                            <h3 className="flex-1 font-semibold text-base">{app.requestedWeaponType}</h3>
                            {isOfficer && getPriorityBadge(app.priority)}
                          </div>
                          {isOfficer && (
                            <p className="text-sm text-muted-foreground mb-1">
                              Wnioskodawca: {app.applicant}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Nr wniosku: {app.id} • Data: {app.submittedDate}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Pozwolenie: {app.permitNumber} • Ilość: {app.requestedQuantity}
                          </p>
                          <div className="mt-3">{getStatusBadge(app.status)}</div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          {isOfficer && (app.status === "Paid" || app.status === "UnderReview") && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/decision/${app.id}`);
                              }}
                              className="min-h-[44px] rounded-xl"
                            >
                              Rozpatrz
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nie znaleziono wniosków o e-Promesę spełniających kryteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
