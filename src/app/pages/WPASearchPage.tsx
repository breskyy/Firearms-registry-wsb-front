import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Search, User, Shield, ChevronRight, AlertTriangle, ChevronLeft } from "lucide-react";
import { wpaService } from "../../services/wpaService";
import type { WpaCitizenDto, WpaFirearmSearchResult, PermitType } from "../../types/api";

const CITIZENS_PAGE_SIZE = 20;
const FIREARMS_PAGE_SIZE = 20;

function getStatusBadge(status: string) {
  switch (status) {
    case "Registered":
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-2 py-0.5 rounded-full">Zarejestrowana</Badge>;
    case "Transferred":
      return <Badge variant="secondary" className="rounded-full px-2 py-0.5">Przeniesiona</Badge>;
    case "Lost":
      return <Badge variant="destructive" className="rounded-full px-2 py-0.5">Zgubiona</Badge>;
    case "Archived":
      return <Badge variant="secondary" className="rounded-full px-2 py-0.5">Zarchiwizowana</Badge>;
    default:
      return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
  }
}

function getCategoryBadge(category: string) {
  const config: Record<string, { label: string; color: string }> = {
    A: { label: "Kat. A", color: "bg-red-100 text-red-800" },
    B: { label: "Kat. B", color: "bg-blue-100 text-blue-800" },
    C: { label: "Kat. C", color: "bg-green-100 text-green-800" },
  };
  const c = config[category] ?? { label: `Kat. ${category}`, color: "bg-muted text-muted-foreground" };
  return (
    <Badge className={`${c.color} hover:${c.color} border-none px-2 py-0.5 rounded-full text-xs`}>
      {c.label}
    </Badge>
  );
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

function PaginationControls({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPrev,
  onNext,
  loading,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPrev: () => void;
  onNext: () => void;
  loading: boolean;
}) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);
  return (
    <div className="flex items-center justify-between pt-3 border-t border-border">
      <span className="text-sm text-muted-foreground">
        {from}–{to} z {totalCount}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={page <= 1 || loading}
          className="rounded-lg h-8 px-3"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[60px] text-center">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= totalPages || loading}
          className="rounded-lg h-8 px-3"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function WPASearchPage() {
  const navigate = useNavigate();

  const [citizens, setCitizens] = useState<WpaCitizenDto[]>([]);
  const [citizensLoading, setCitizensLoading] = useState(true);
  const [citizensPage, setCitizensPage] = useState(1);
  const [citizensTotalCount, setCitizensTotalCount] = useState(0);
  const [citizensTotalPages, setCitizensTotalPages] = useState(0);

  const [firearms, setFirearms] = useState<WpaFirearmSearchResult[]>([]);
  const [firearmsLoading, setFirearmsLoading] = useState(false);
  const [firearmsPage, setFirearmsPage] = useState(1);
  const [firearmsTotalCount, setFirearmsTotalCount] = useState(0);
  const [firearmsTotalPages, setFirearmsTotalPages] = useState(0);
  const [firearmSearchType, setFirearmSearchType] = useState<"serialNumber" | "pesel" | "permitNumber" | "permitType">("serialNumber");
  const [firearmSearchTerm, setFirearmSearchTerm] = useState("");
  const [permitTypeFilter, setPermitTypeFilter] = useState<PermitType | "all">("all");

  const fetchCitizens = (page: number) => {
    setCitizensLoading(true);
    wpaService
      .getCitizens({ page, pageSize: CITIZENS_PAGE_SIZE })
      .then((r) => {
        setCitizens(r.items);
        setCitizensTotalCount(r.totalCount);
        setCitizensTotalPages(r.totalPages);
      })
      .catch(() => {})
      .finally(() => setCitizensLoading(false));
  };

  useEffect(() => {
    fetchCitizens(citizensPage);
  }, [citizensPage]);

  const doFirearmSearch = async (page: number) => {
    setFirearmsLoading(true);
    try {
      const params: Parameters<typeof wpaService.searchFirearms>[0] = { page, pageSize: FIREARMS_PAGE_SIZE };
      if (firearmSearchTerm) {
        if (firearmSearchType === "serialNumber") params!.serialNumber = firearmSearchTerm;
        else if (firearmSearchType === "pesel") params!.pesel = firearmSearchTerm;
        else if (firearmSearchType === "permitNumber") params!.permitNumber = firearmSearchTerm;
        else if (firearmSearchType === "permitType") params!.permitType = firearmSearchTerm as PermitType;
      }
      if (permitTypeFilter !== "all") params!.permitType = permitTypeFilter;
      const r = await wpaService.searchFirearms(params);
      setFirearms(r.items);
      setFirearmsTotalCount(r.totalCount);
      setFirearmsTotalPages(r.totalPages);
      setFirearmsPage(page);
    } catch {
      setFirearms([]);
      setFirearmsTotalCount(0);
      setFirearmsTotalPages(0);
    } finally {
      setFirearmsLoading(false);
    }
  };

  const searchFirearms = () => doFirearmSearch(1);

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Wyszukiwarka WPA</h1>
        <p className="text-muted-foreground">Wyszukaj obywateli i broń w centralnym rejestrze</p>
      </div>

      <Tabs defaultValue="citizens" className="space-y-6">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="citizens" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Obywatele{citizensTotalCount > 0 ? ` (${citizensTotalCount})` : ""}</span>
          </TabsTrigger>
          <TabsTrigger value="firearms" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Broń{firearmsTotalCount > 0 ? ` (${firearmsTotalCount})` : ""}</span>
          </TabsTrigger>
        </TabsList>

        {/* Citizens Tab */}
        <TabsContent value="citizens" className="mt-0 space-y-6">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Wszyscy obywatele</CardTitle>
              <CardDescription>
                {citizensTotalCount > 0
                  ? `${citizensTotalCount} obywateli w rejestrze`
                  : "Ładowanie danych rejestru..."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {citizensLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
                </div>
              ) : citizens.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {citizens.map((citizen) => (
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
                              <h3 className="font-semibold text-base text-foreground mb-1">{citizen.firstName} {citizen.lastName}</h3>
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
                                    {permit.permitTypeName}
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
                  <PaginationControls
                    page={citizensPage}
                    totalPages={citizensTotalPages}
                    totalCount={citizensTotalCount}
                    pageSize={CITIZENS_PAGE_SIZE}
                    onPrev={() => setCitizensPage((p) => p - 1)}
                    onNext={() => setCitizensPage((p) => p + 1)}
                    loading={citizensLoading}
                  />
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p>Brak obywateli w rejestrze</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Firearms Tab */}
        <TabsContent value="firearms" className="mt-0 space-y-6">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div>
                <label htmlFor="searchType" className="text-sm font-medium mb-2 block">Typ wyszukiwania</label>
                <Select value={firearmSearchType} onValueChange={(v) => setFirearmSearchType(v as typeof firearmSearchType)}>
                  <SelectTrigger id="searchType" className=""><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="serialNumber">Numer seryjny</SelectItem>
                    <SelectItem value="pesel">PESEL właściciela</SelectItem>
                    <SelectItem value="permitNumber">Numer pozwolenia</SelectItem>
                    <SelectItem value="permitType">Typ pozwolenia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="firearmSearch" className="text-sm font-medium mb-2 block">Fraza wyszukiwania</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firearmSearch"
                    value={firearmSearchTerm}
                    onChange={(e) => setFirearmSearchTerm(e.target.value)}
                    placeholder={firearmSearchType === "permitType" ? "Sport / Hunting / Collection / Protection / Other" : "Wprowadź wartość..."}
                    className="min-h-[44px] pl-10 rounded-xl"
                    onKeyDown={(e) => e.key === "Enter" && searchFirearms()}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="permitTypeFilter" className="text-sm font-medium mb-2 block">Dodatkowy filtr typu pozwolenia</label>
                <Select value={permitTypeFilter} onValueChange={(v) => setPermitTypeFilter(v as typeof permitTypeFilter)}>
                  <SelectTrigger id="permitTypeFilter" className=""><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie typy</SelectItem>
                    <SelectItem value="Sport">Sportowe</SelectItem>
                    <SelectItem value="Hunting">Łowieckie</SelectItem>
                    <SelectItem value="Collection">Kolekcjonerskie</SelectItem>
                    <SelectItem value="Protection">Ochrona</SelectItem>
                    <SelectItem value="Other">Inne</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={searchFirearms} disabled={firearmsLoading} className="w-full min-h-[44px] rounded-xl">
                <Search className="h-4 w-4 mr-2" />
                {firearmsLoading ? "Szukam..." : "Wyszukaj"}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Wyniki{firearmsTotalCount > 0 ? ` (${firearmsTotalCount})` : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {firearmsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />)}
                </div>
              ) : firearms.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {firearms.map((f) => (
                      <div key={f.id} className="bg-muted/30 rounded-2xl p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 p-3 rounded-xl mt-1">
                            <Shield className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-base text-foreground">{f.brand} {f.model}</h3>
                              {getCategoryBadge(f.category)}
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
                              <div>
                                <span className="text-muted-foreground block text-xs">Właściciel</span>
                                <span className="font-medium">{f.ownerName}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-xs">PESEL</span>
                                <span className="font-mono text-sm">{f.ownerPesel}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-xs">Nr seryjny</span>
                                <span className="font-mono text-sm">{f.serialNumber}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-xs">Kaliber</span>
                                <span className="font-medium">{f.caliber}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-xs">Pozwolenie</span>
                                <span className="font-medium">{f.permitNumber}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-xs">Data rejestracji</span>
                                <span className="font-medium">{formatDate(f.registeredAt)}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {getStatusBadge(f.status)}
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none rounded-full px-2 py-0.5 text-xs">
                                {f.permitType}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <PaginationControls
                    page={firearmsPage}
                    totalPages={firearmsTotalPages}
                    totalCount={firearmsTotalCount}
                    pageSize={FIREARMS_PAGE_SIZE}
                    onPrev={() => doFirearmSearch(firearmsPage - 1)}
                    onNext={() => doFirearmSearch(firearmsPage + 1)}
                    loading={firearmsLoading}
                  />
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p>Wprowadź kryteria i kliknij &quot;Wyszukaj&quot;</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
