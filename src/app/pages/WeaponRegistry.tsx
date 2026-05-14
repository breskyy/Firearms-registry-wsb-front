import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Shield, Search, ChevronDown, ChevronUp, AlertTriangle, ArrowRightLeft, AlertCircle } from "lucide-react";
import { Separator } from "../components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { citizenService, translateTransferError } from "../../services/citizenService";
import type { FirearmDto, TransferType } from "../../types/api";

function getStatusBadge(status: string) {
  switch (status) {
    case "Registered":
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-2 py-0.5 rounded-full">Zarejestrowana</Badge>;
    case "Transferred":
      return <Badge variant="secondary" className="rounded-full px-2 py-0.5">Przeniesiona</Badge>;
    case "Lost":
      return <Badge variant="destructive" className="rounded-full px-2 py-0.5">Zgubiona/Skradziona</Badge>;
    case "Archived":
      return <Badge variant="secondary" className="rounded-full px-2 py-0.5">Zarchiwizowana</Badge>;
    default:
      return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
  }
}

function getCategoryBadge(category: "A" | "B" | "C") {
  const config = {
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

export function WeaponRegistry() {
  const [firearms, setFirearms] = useState<FirearmDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reportLostId, setReportLostId] = useState<string | null>(null);
  const [lostDescription, setLostDescription] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [transferId, setTransferId] = useState<string | null>(null);
  const [transferForm, setTransferForm] = useState<{ buyerPesel: string; transferType: TransferType }>({
    buyerPesel: "",
    transferType: "Sale",
  });
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferErrors, setTransferErrors] = useState<Record<string, string>>({});

  const load = () => {
    setLoading(true);
    citizenService
      .getFirearms()
      .then(setFirearms)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = firearms.filter((f) => {
    const s = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      f.brand.toLowerCase().includes(s) ||
      f.model.toLowerCase().includes(s) ||
      f.serialNumber.toLowerCase().includes(s) ||
      f.caliber.toLowerCase().includes(s)
    );
  });

  const handleReportLost = async () => {
    if (!reportLostId) return;
    setReportLoading(true);
    try {
      await citizenService.reportLost(reportLostId, { description: lostDescription || undefined });
      toast.success("Utrata broni zgłoszona", {
        description: "Broń została oznaczona jako zgubiona/skradziona.",
      });
      setReportLostId(null);
      setLostDescription("");
      load();
    } catch (err: any) {
      toast.error("Błąd zgłoszenia", { description: err?.message ?? "Spróbuj ponownie" });
    } finally {
      setReportLoading(false);
    }
  };

  const reportLostFirearm = firearms.find((f) => f.id === reportLostId);
  const transferFirearm = firearms.find((f) => f.id === transferId);

  const openTransfer = (firearmId: string) => {
    setTransferId(firearmId);
    setTransferForm({ buyerPesel: "", transferType: "Sale" });
    setTransferErrors({});
  };

  const handleCreateTransfer = async () => {
    if (!transferId) return;
    const errors: Record<string, string> = {};
    if (!/^\d{11}$/.test(transferForm.buyerPesel)) {
      errors.buyerPesel = "PESEL musi składać się z 11 cyfr";
    }
    if (Object.keys(errors).length > 0) {
      setTransferErrors(errors);
      return;
    }
    setTransferErrors({});
    setTransferLoading(true);
    try {
      await citizenService.createTransferRequest({
        firearmId: transferId,
        buyerPesel: transferForm.buyerPesel,
        transferType: transferForm.transferType,
      });
      toast.success("Transfer zainicjowany", {
        description: "Nabywca otrzyma powiadomienie i będzie musiał zaakceptować transfer.",
      });
      setTransferId(null);
      load();
    } catch (err: any) {
      toast.error("Nie można zainicjować transferu", {
        description: translateTransferError(err?.message ?? "") || (err?.message ?? "Spróbuj ponownie"),
        duration: 7000,
      });
    } finally {
      setTransferLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-2 space-y-4">
        <div className="px-1">
          <div className="h-8 w-40 bg-muted animate-pulse rounded-lg mb-2" />
          <div className="h-4 w-56 bg-muted animate-pulse rounded" />
        </div>
        {[1, 2].map((i) => <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Rejestr broni</h1>
        <p className="text-muted-foreground">Twoje zarejestrowane egzemplarze</p>
      </div>

      <Card className="mb-6 rounded-2xl border-none shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Marka, model, numer seryjny, kaliber..."
              className="min-h-[44px] pl-10 rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Zarejestrowana broń ({filtered.length})</CardTitle>
          <CardDescription>
            {searchTerm ? `Wyniki wyszukiwania dla: "${searchTerm}"` : "Wszystkie egzemplarze w rejestrze"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((firearm) => (
                <div key={firearm.id} className="bg-muted/30 border border-transparent rounded-2xl overflow-hidden transition-all duration-200">
                  <div
                    className="p-4 hover:bg-muted/50 cursor-pointer active:scale-[0.99] select-none"
                    onClick={() => setExpandedId(expandedId === firearm.id ? null : firearm.id)}
                  >
                    <div className="flex gap-4 flex-1">
                      <div className="flex items-center justify-center w-14 h-14 bg-primary/10 rounded-xl shrink-0 mt-1">
                        <Shield className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-base text-foreground">
                                {firearm.brand} {firearm.model}
                              </h3>
                              {getCategoryBadge(firearm.categoryName as "A" | "B" | "C")}
                            </div>
                            <p className="text-xs font-medium text-muted-foreground">Kaliber: {firearm.caliber}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full -mt-1 -mr-2 text-muted-foreground">
                            {expandedId === firearm.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <div>
                            <span className="text-muted-foreground block">Nr seryjny:</span>
                            <span className="font-mono">{firearm.serialNumber}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Rejestracja:</span>
                            <span className="font-medium">{formatDate(firearm.registeredAt)}</span>
                          </div>
                        </div>

                        {expandedId !== firearm.id && (
                          <div className="pt-1">{getStatusBadge(firearm.statusName)}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedId === firearm.id && (
                    <div className="px-4 pb-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Separator className="bg-border mb-4" />
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wider font-semibold">Dane dokumentu</p>
                            <div className="space-y-2">
                              <div>
                                <span className="text-muted-foreground text-xs block">Status</span>
                                <div>{getStatusBadge(firearm.statusName)}</div>
                              </div>
                              {firearm.productionYear && (
                                <div>
                                  <span className="text-muted-foreground text-xs block">Rok produkcji</span>
                                  <span className="font-medium text-foreground">{firearm.productionYear}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wider font-semibold">Identyfikacja</p>
                            <div className="space-y-2">
                              <div>
                                <span className="text-muted-foreground text-xs block">Nr seryjny</span>
                                <span className="font-mono font-medium text-foreground">{firearm.serialNumber}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground text-xs block">Kategoria</span>
                                {getCategoryBadge(firearm.categoryName as "A" | "B" | "C")}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-primary/5 rounded-xl p-3 flex gap-3 items-start border border-primary/10">
                          <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Przypominamy o obowiązku posiadania legitymacji broni podczas jej noszenia.
                          </p>
                        </div>

                        {firearm.statusName === "Registered" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full rounded-xl"
                              onClick={(e) => {
                                e.stopPropagation();
                                openTransfer(firearm.id);
                              }}
                            >
                              <ArrowRightLeft className="h-4 w-4 mr-2" />
                              Transferuj
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full rounded-xl"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReportLostId(firearm.id);
                                setLostDescription("");
                              }}
                            >
                              Zgłoś utratę / kradzież
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-16 w-16 mx-auto mb-4 opacity-30 text-primary" />
              {searchTerm ? (
                <>
                  <p className="mb-2">Nie znaleziono broni spełniającej kryteria</p>
                  <Button variant="outline" onClick={() => setSearchTerm("")} className="min-h-[44px] rounded-xl mt-2">
                    Wyczyść wyszukiwanie
                  </Button>
                </>
              ) : (
                <p className="mb-4">Nie masz jeszcze zarejestrowanej broni. Broń pojawi się tutaj po zakupie w sklepie.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Lost Dialog */}
      <Dialog open={!!reportLostId} onOpenChange={(open) => !open && setReportLostId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Zgłoś utratę / kradzież</DialogTitle>
            <DialogDescription>
              {reportLostFirearm && `${reportLostFirearm.brand} ${reportLostFirearm.model} (SN: ${reportLostFirearm.serialNumber})`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-red-50 rounded-xl p-3 text-xs text-red-900">
              Zgłoszenie utraty zwolni slot w pozwoleniu. Operacja jest nieodwracalna.
            </div>
            <div>
              <Label htmlFor="lostDesc">Opis okoliczności (opcjonalnie)</Label>
              <Textarea
                id="lostDesc"
                value={lostDescription}
                onChange={(e) => setLostDescription(e.target.value)}
                className="mt-1.5 rounded-xl"
                placeholder="Np. kradzież w dniu 12.05.2026 z samochodu..."
                maxLength={500}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReportLostId(null)} className="rounded-xl">Anuluj</Button>
            <Button variant="destructive" onClick={handleReportLost} disabled={reportLoading} className="rounded-xl">
              {reportLoading ? "Zgłaszanie..." : "Zgłoś utratę"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={!!transferId} onOpenChange={(open) => !open && setTransferId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Transferuj broń</DialogTitle>
            <DialogDescription>
              {transferFirearm && `${transferFirearm.brand} ${transferFirearm.model} (SN: ${transferFirearm.serialNumber})`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-900 space-y-1">
              <p><strong>Nabywca musi już mieć:</strong> aktywne pozwolenie obejmujące tę kategorię broni, wolny slot w pozwoleniu, aktualne badania medyczne.</p>
              <p>System sprawdza wymagania od razu przy inicjacji — bez spełnienia warunków transfer nie powstanie. Po inicjacji broń pozostaje u Ciebie do akceptacji przez nabywcę.</p>
            </div>
            <div>
              <Label htmlFor="buyerPesel">PESEL nabywcy <span className="text-red-600">*</span></Label>
              <Input
                id="buyerPesel"
                inputMode="numeric"
                maxLength={11}
                value={transferForm.buyerPesel}
                onChange={(e) => setTransferForm({ ...transferForm, buyerPesel: e.target.value.replace(/\D/g, "") })}
                placeholder="11-cyfrowy PESEL"
                className="mt-1.5"
              />
              {transferErrors.buyerPesel && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{transferErrors.buyerPesel}</p>}
            </div>
            <div>
              <Label htmlFor="transferType">Rodzaj transferu <span className="text-red-600">*</span></Label>
              <Select
                value={transferForm.transferType}
                onValueChange={(v) => setTransferForm({ ...transferForm, transferType: v as TransferType })}
              >
                <SelectTrigger id="transferType" className="mt-1.5 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sale">Sprzedaż</SelectItem>
                  <SelectItem value="Donation">Darowizna</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Dziedziczenie wymaga osobnej procedury z udziałem WPA (depozyt policji, 6 miesięcy na uzyskanie pozwolenia — Ustawa o broni i amunicji, art. 14 ust. 1).
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setTransferId(null)} className="rounded-xl">Anuluj</Button>
            <Button onClick={handleCreateTransfer} disabled={transferLoading} className="rounded-xl">
              {transferLoading ? "Inicjowanie..." : "Inicjuj transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
