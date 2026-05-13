import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Search, User, Shield, ChevronRight, AlertTriangle } from "lucide-react";

export function WPASearchPage() {
  const navigate = useNavigate();

  // Citizens search state
  const [citizenSearchTerm, setCitizenSearchTerm] = useState("");

  // Firearms search state
  const [firearmSearchType, setFirearmSearchType] = useState<"serialNumber" | "pesel" | "permitNumber" | "permitType">("serialNumber");
  const [firearmSearchTerm, setFirearmSearchTerm] = useState("");
  const [permitTypeFilter, setPermitTypeFilter] = useState("all");

  // Mock data - Citizens
  const citizens = [
    {
      id: "citizen-001",
      name: "Jan Kowalski",
      pesel: "90010112345",
      totalFirearms: 2,
      activeAlerts: 1,
      permits: [
        { permitType: "Sport", permitNumber: "POZ-2025-001", validUntil: "Bezterminowo" }
      ]
    },
    {
      id: "citizen-002",
      name: "Anna Nowak",
      pesel: "85032298765",
      totalFirearms: 1,
      activeAlerts: 0,
      permits: [
        { permitType: "Hunting", permitNumber: "POZ-2024-045", validUntil: "Bezterminowo" }
      ]
    },
    {
      id: "citizen-003",
      name: "Piotr Wiśniewski",
      pesel: "78121556789",
      totalFirearms: 3,
      activeAlerts: 2,
      permits: [
        { permitType: "Sport", permitNumber: "POZ-2023-012", validUntil: "Bezterminowo" },
        { permitType: "Collection", permitNumber: "POZ-2024-078", validUntil: "Bezterminowo" }
      ]
    },
  ];

  // Mock data - Firearms
  const firearms = [
    {
      id: "firearm-001",
      ownerName: "Jan Kowalski",
      ownerPesel: "90010112345",
      permitNumber: "POZ-2025-001",
      permitType: "Sport",
      brand: "Glock",
      model: "Glock 17",
      category: "B" as "A" | "B" | "C",
      caliber: "9mm",
      serialNumber: "ABC123456",
      status: "Registered",
      registrationDate: "2025-03-15",
    },
    {
      id: "firearm-002",
      ownerName: "Anna Nowak",
      ownerPesel: "85032298765",
      permitNumber: "POZ-2024-045",
      permitType: "Hunting",
      brand: "CZ",
      model: "CZ 75 SP-01",
      category: "B" as "A" | "B" | "C",
      caliber: "9mm",
      serialNumber: "XYZ789012",
      status: "Registered",
      registrationDate: "2024-11-20",
    },
    {
      id: "firearm-003",
      ownerName: "Piotr Wiśniewski",
      ownerPesel: "78121556789",
      permitNumber: "POZ-2023-012",
      permitType: "Sport",
      brand: "Sig Sauer",
      model: "P226",
      category: "B" as "A" | "B" | "C",
      caliber: ".40 S&W",
      serialNumber: "SIG998877",
      status: "Registered",
      registrationDate: "2023-08-10",
    },
  ];

  const filteredCitizens = citizens.filter((citizen) => {
    const searchLower = citizenSearchTerm.toLowerCase();
    return (
      citizen.name.toLowerCase().includes(searchLower) ||
      citizen.pesel.includes(searchLower) ||
      citizen.permits.some(p => p.permitNumber.toLowerCase().includes(searchLower))
    );
  });

  const filteredFirearms = firearms.filter((firearm) => {
    const searchLower = firearmSearchTerm.toLowerCase();

    let matchesSearch = false;
    switch (firearmSearchType) {
      case "serialNumber":
        matchesSearch = firearm.serialNumber.toLowerCase().includes(searchLower);
        break;
      case "pesel":
        matchesSearch = firearm.ownerPesel.includes(searchLower);
        break;
      case "permitNumber":
        matchesSearch = firearm.permitNumber.toLowerCase().includes(searchLower);
        break;
      case "permitType":
        matchesSearch = firearm.permitType.toLowerCase().includes(searchLower);
        break;
    }

    const matchesPermitType = permitTypeFilter === "all" || firearm.permitType === permitTypeFilter;

    return matchesSearch && matchesPermitType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Registered":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-2 py-0.5 rounded-full">Zarejestrowana</Badge>;
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

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Wyszukiwarka WPA</h1>
        <p className="text-muted-foreground">Wyszukaj obywateli i broń w centralnym rejestrze</p>
      </div>

      <Tabs defaultValue="citizens" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl h-auto p-1 bg-muted/50">
          <TabsTrigger value="citizens" className="rounded-xl min-h-[44px] data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Obywatele ({filteredCitizens.length})</span>
          </TabsTrigger>
          <TabsTrigger value="firearms" className="rounded-xl min-h-[44px] data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Broń ({filteredFirearms.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Citizens Search Tab */}
        <TabsContent value="citizens" className="mt-0 space-y-6">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardContent className="p-4">
              <div>
                <label htmlFor="citizenSearch" className="text-sm font-medium mb-2 block">
                  Wyszukaj obywatela
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="citizenSearch"
                    value={citizenSearchTerm}
                    onChange={(e) => setCitizenSearchTerm(e.target.value)}
                    placeholder="Imię, nazwisko, PESEL, numer pozwolenia..."
                    className="min-h-[44px] pl-10 rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Wyniki wyszukiwania</CardTitle>
              <CardDescription>
                {citizenSearchTerm
                  ? `Znaleziono ${filteredCitizens.length} wyników dla: "${citizenSearchTerm}"`
                  : "Wprowadź dane do wyszukania"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredCitizens.length > 0 ? (
                <div className="space-y-3">
                  {filteredCitizens.map((citizen) => (
                    <div
                      key={citizen.id}
                      className="bg-muted/30 rounded-2xl p-4 hover:bg-muted/50 transition-colors cursor-pointer active:scale-[0.99]"
                      onClick={() => navigate(`/wpa/citizens/${citizen.id}`)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="bg-primary/10 p-3 rounded-xl">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-base text-foreground mb-1">{citizen.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">PESEL: {citizen.pesel}</p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">
                                {citizen.totalFirearms} {citizen.totalFirearms === 1 ? "egzemplarz" : "egzemplarze"}
                              </Badge>
                              {citizen.activeAlerts > 0 && (
                                <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-xs flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  {citizen.activeAlerts} {citizen.activeAlerts === 1 ? "alert" : "alerty"}
                                </Badge>
                              )}
                              {citizen.permits.map((permit, idx) => (
                                <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none rounded-full px-2 py-0.5 text-xs">
                                  {permit.permitType}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p>
                    {citizenSearchTerm
                      ? "Nie znaleziono obywateli spełniających kryteria"
                      : "Wprowadź kryteria wyszukiwania"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Firearms Search Tab */}
        <TabsContent value="firearms" className="mt-0 space-y-6">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div>
                <label htmlFor="searchType" className="text-sm font-medium mb-2 block">
                  Typ wyszukiwania
                </label>
                <Select value={firearmSearchType} onValueChange={(v) => setFirearmSearchType(v as typeof firearmSearchType)}>
                  <SelectTrigger id="searchType" className="min-h-[44px] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="serialNumber">Numer seryjny</SelectItem>
                    <SelectItem value="pesel">PESEL właściciela</SelectItem>
                    <SelectItem value="permitNumber">Numer pozwolenia</SelectItem>
                    <SelectItem value="permitType">Typ pozwolenia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="firearmSearch" className="text-sm font-medium mb-2 block">
                  Wyszukaj broń
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firearmSearch"
                    value={firearmSearchTerm}
                    onChange={(e) => setFirearmSearchTerm(e.target.value)}
                    placeholder={`Wprowadź ${firearmSearchType === "serialNumber" ? "numer seryjny" : firearmSearchType === "pesel" ? "PESEL" : firearmSearchType === "permitNumber" ? "numer pozwolenia" : "typ pozwolenia"}...`}
                    className="min-h-[44px] pl-10 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="permitTypeFilter" className="text-sm font-medium mb-2 block">
                  Filtruj po typie pozwolenia
                </label>
                <Select value={permitTypeFilter} onValueChange={setPermitTypeFilter}>
                  <SelectTrigger id="permitTypeFilter" className="min-h-[44px] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie typy</SelectItem>
                    <SelectItem value="Sport">Sportowe</SelectItem>
                    <SelectItem value="Hunting">Łowieckie</SelectItem>
                    <SelectItem value="Collection">Kolekcjonerskie</SelectItem>
                    <SelectItem value="Protection">Ochrona</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Wyniki wyszukiwania</CardTitle>
              <CardDescription>
                {firearmSearchTerm
                  ? `Znaleziono ${filteredFirearms.length} wyników`
                  : "Wprowadź dane do wyszukania"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredFirearms.length > 0 ? (
                <div className="space-y-3">
                  {filteredFirearms.map((firearm) => (
                    <div
                      key={firearm.id}
                      className="bg-muted/30 rounded-2xl p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-xl mt-1">
                          <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-base text-foreground">
                              {firearm.brand} {firearm.model}
                            </h3>
                            {getCategoryBadge(firearm.category)}
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
                            <div>
                              <span className="text-muted-foreground block text-xs">Właściciel</span>
                              <span className="font-medium">{firearm.ownerName}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-xs">PESEL</span>
                              <span className="font-mono text-sm">{firearm.ownerPesel}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-xs">Nr seryjny</span>
                              <span className="font-mono text-sm">{firearm.serialNumber}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-xs">Kaliber</span>
                              <span className="font-medium">{firearm.caliber}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-xs">Pozwolenie</span>
                              <span className="font-medium">{firearm.permitNumber}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-xs">Data rejestracji</span>
                              <span className="font-medium">{firearm.registrationDate}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {getStatusBadge(firearm.status)}
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none rounded-full px-2 py-0.5 text-xs">
                              {firearm.permitType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p>
                    {firearmSearchTerm
                      ? "Nie znaleziono broni spełniającej kryteria"
                      : "Wprowadź kryteria wyszukiwania"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
