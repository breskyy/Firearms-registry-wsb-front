import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Search, Shield, CreditCard } from "lucide-react";
import { citizenService } from "../../services/citizenService";
import { wpaService } from "../../services/wpaService";
import type {
  PermitApplicationDto,
  PromiseApplicationDto,
  WpaPermitApplicationDto,
  WpaPromiseApplicationDto,
} from "../../types/api";

const PERMIT_TYPE_LABELS: Record<string, string> = {
  "0": "Sportowe",
  "1": "Kolekcjonerskie",
  "2": "Ochrony osobistej",
  "3": "Łowieckie",
  "4": "Inne",
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
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-none px-2 py-0.5 rounded-full">Wymaga uzupełnienia</Badge>;
    default:
      return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

type AnyPermit = PermitApplicationDto | WpaPermitApplicationDto;
type AnyPromise = PromiseApplicationDto | WpaPromiseApplicationDto;

function isWpaPermit(a: AnyPermit): a is WpaPermitApplicationDto {
  return "citizenName" in a;
}

function isWpaPromise(a: AnyPromise): a is WpaPromiseApplicationDto {
  return "citizenName" in a;
}

function getPermitTypeLabel(app: AnyPermit) {
  const typeName = app.requestedPermitTypeName || String(app.requestedPermitType);
  return PERMIT_TYPE_LABELS[typeName] ?? typeName;
}

export function ApplicationsList() {
  const navigate = useNavigate();
  const isOfficer = localStorage.getItem("userRole") === "officer";

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [permitApps, setPermitApps] = useState<AnyPermit[]>([]);
  const [promiseApps, setPromiseApps] = useState<AnyPromise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (isOfficer) {
          const [pa, pra] = await Promise.all([
            wpaService.getPermitApplications({ page: 1, pageSize: 100 }),
            wpaService.getPromiseApplications({ page: 1, pageSize: 100 }),
          ]);
          setPermitApps(pa.items);
          setPromiseApps(pra.items);
        } else {
          const [pa, pra] = await Promise.all([
            citizenService.getPermitApplications(),
            citizenService.getPromiseApplications(),
          ]);
          setPermitApps(pa);
          setPromiseApps(pra);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOfficer]);

  const filterPermit = (apps: AnyPermit[]) =>
    apps.filter((a) => {
      const search = searchTerm.toLowerCase();
      const typeName = getPermitTypeLabel(a);
      const matchSearch =
        !searchTerm ||
        a.id.toLowerCase().includes(search) ||
        typeName.toLowerCase().includes(search) ||
        (isWpaPermit(a) ? a.citizenName.toLowerCase().includes(search) || a.citizenPesel.includes(search) : a.reason.toLowerCase().includes(search));
      const matchStatus = statusFilter === "all" || a.statusName === statusFilter;
      return matchSearch && matchStatus;
    });

  const filterPromise = (apps: AnyPromise[]) =>
    apps.filter((a) => {
      const search = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        a.id.toLowerCase().includes(search) ||
        a.requestedWeaponType.toLowerCase().includes(search) ||
        a.permitNumber.toLowerCase().includes(search) ||
        (isWpaPromise(a) && (a.citizenName.toLowerCase().includes(search) || a.citizenPesel.includes(search)));
      const matchStatus = statusFilter === "all" || a.statusName === statusFilter;
      return matchSearch && matchStatus;
    });

  const filteredPermit = filterPermit(permitApps);
  const filteredPromise = filterPromise(promiseApps);

  if (loading) {
    return (
      <div className="pt-2">
        <div className="mb-6 px-1">
          <div className="h-8 w-40 bg-muted animate-pulse rounded-lg mb-2" />
          <div className="h-4 w-56 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
          {isOfficer ? "Wnioski" : "Moje sprawy"}
        </h1>
        <p className="text-muted-foreground">
          {isOfficer ? "Wszystkie wnioski w systemie" : "Lista Twoich wniosków"}
        </p>
      </div>

      <Card className="mb-6 rounded-2xl border-none shadow-sm">
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="search" className="text-sm font-medium mb-2 block">Wyszukaj</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isOfficer ? "Imię, PESEL, typ, numer pozwolenia..." : "Typ broni, numer pozwolenia..."}
                  className="min-h-[44px] pl-10"
                />
              </div>
            </div>
            <div>
              <label htmlFor="statusFilter" className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="statusFilter" className="min-h-[44px]"><SelectValue /></SelectTrigger>
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

      <Tabs defaultValue="permits" className="space-y-6">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="permits" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Pozwolenia ({filteredPermit.length})</span>
          </TabsTrigger>
          <TabsTrigger value="promises" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Promesy ({filteredPromise.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="permits" className="mt-0">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Wnioski o pozwolenie</CardTitle>
              <CardDescription>{isOfficer ? "Wszyscy wnioskodawcy" : "Wnioski o wydanie pozwolenia na broń"}</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPermit.length > 0 ? (
                <div className="space-y-3">
                  {filteredPermit.map((app) => (
                    <div
                      key={app.id}
                      className={`bg-muted/30 rounded-xl p-4 hover:bg-muted/50 transition-colors ${isOfficer ? "cursor-pointer active:scale-[0.99]" : ""}`}
                      onClick={isOfficer ? () => navigate(`/applications/${app.id}?type=permit`) : undefined}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-base">
                            Pozwolenie — {getPermitTypeLabel(app)}
                          </h3>
                          {getStatusBadge(app.statusName)}
                        </div>
                        {isWpaPermit(app) ? (
                          <p className="text-sm text-muted-foreground">{app.citizenName} • PESEL: {app.citizenPesel}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground line-clamp-2">{app.reason}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Data złożenia: {formatDate(app.createdAt)}</p>
                        {app.statusName === "RequiresCorrection" && app.correctionNotes && (
                          <div className="bg-orange-50 rounded-lg p-2 text-xs text-orange-900">
                            <strong>Uwagi:</strong> {app.correctionNotes}
                          </div>
                        )}
                        {!isOfficer && app.statusName === "RequiresCorrection" && (
                          <Button
                            className="mt-2 min-h-[44px] rounded-xl"
                            onClick={() => navigate(`/applications/${app.id}/correction?type=permit`)}
                          >
                            Uzupelnij wniosek
                          </Button>
                        )}
                        {app.statusName === "Rejected" && app.rejectionReason && (
                          <div className="bg-red-50 rounded-lg p-2 text-xs text-red-900">
                            <strong>Powód odrzucenia:</strong> {app.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="mb-3">Brak wniosków o pozwolenie</p>
                  {!isOfficer && (
                    <Button className="rounded-xl" onClick={() => navigate("/applications/new/permit")}>
                      Złóż wniosek
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promises" className="mt-0">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Wnioski o e-Promesę</CardTitle>
              <CardDescription>{isOfficer ? "Wszyscy wnioskodawcy" : "Wnioski o wydanie promesy na zakup broni"}</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPromise.length > 0 ? (
                <div className="space-y-3">
                  {filteredPromise.map((app) => (
                    <div
                      key={app.id}
                      className={`bg-muted/30 rounded-xl p-4 hover:bg-muted/50 transition-colors ${isOfficer ? "cursor-pointer active:scale-[0.99]" : ""}`}
                      onClick={isOfficer ? () => navigate(`/applications/${app.id}?type=promise`) : undefined}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-base">{app.requestedWeaponType}</h3>
                          {getStatusBadge(app.statusName)}
                        </div>
                        {isWpaPromise(app) && (
                          <p className="text-sm text-muted-foreground">{app.citizenName} • PESEL: {app.citizenPesel}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Pozwolenie: {app.permitNumber} • Ilość: {app.requestedQuantity}
                        </p>
                        <p className="text-xs text-muted-foreground">Data złożenia: {formatDate(app.createdAt)}</p>
                        {app.statusName === "RequiresCorrection" && app.correctionNotes && (
                          <div className="bg-orange-50 rounded-lg p-2 text-xs text-orange-900">
                            <strong>Uwagi:</strong> {app.correctionNotes}
                          </div>
                        )}
                        {!isOfficer && app.statusName === "RequiresCorrection" && (
                          <Button
                            className="mt-2 min-h-[44px] rounded-xl"
                            onClick={() => navigate(`/applications/${app.id}/correction?type=promise`)}
                          >
                            Uzupelnij wniosek
                          </Button>
                        )}
                        {app.statusName === "Rejected" && app.rejectionReason && (
                          <div className="bg-red-50 rounded-lg p-2 text-xs text-red-900">
                            <strong>Powód odrzucenia:</strong> {app.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="mb-3">Brak wniosków o promesę</p>
                  {!isOfficer && (
                    <Button className="rounded-xl" onClick={() => navigate("/applications/new/promise")}>
                      Złóż wniosek o promesę
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
