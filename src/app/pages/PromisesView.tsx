import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import QRCode from "react-qr-code";
import { Clock, CheckCircle, XCircle, AlertTriangle, Copy, QrCode } from "lucide-react";
import { toast } from "sonner";
import { citizenService } from "../../services/citizenService";
import type { PromiseDto } from "../../types/api";

function getStatusBadge(status: string) {
  switch (status) {
    case "Active":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-2 py-0.5 rounded-full">
          <CheckCircle className="h-3 w-3 mr-1" />Aktywna
        </Badge>
      );
    case "Used":
      return (
        <Badge variant="secondary" className="px-2 py-0.5 rounded-full">
          <CheckCircle className="h-3 w-3 mr-1" />Wykorzystana
        </Badge>
      );
    case "Expired":
      return (
        <Badge variant="destructive" className="px-2 py-0.5 rounded-full">
          <XCircle className="h-3 w-3 mr-1" />Wygasła
        </Badge>
      );
    case "Approved":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none px-2 py-0.5 rounded-full">
          Zatwierdzona
        </Badge>
      );
    default:
      return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
  }
}

function daysUntil(dateStr: string | null): number {
  if (!dateStr) return 0;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 3600 * 24));
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

function copyText(text: string) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;left:-9999px;top:-9999px";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  return ok;
}

export function PromisesView() {
  const navigate = useNavigate();
  const [promises, setPromises] = useState<PromiseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    citizenService
      .getPromises()
      .then(setPromises)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedId && qrRef.current) {
      setTimeout(() => qrRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [selectedId]);

  const selected = promises.find((p) => p.id === selectedId) ?? null;

  if (loading) {
    return (
      <div className="pt-2 space-y-4">
        <div className="px-1">
          <div className="h-8 w-40 bg-muted animate-pulse rounded-lg mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        {[1, 2].map((i) => <div key={i} className="h-36 rounded-2xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Moje e-Promesy</h1>
        <p className="text-muted-foreground">Aktywne promesy na zakup broni z kodami QR</p>
      </div>

      {promises.length === 0 ? (
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-12 text-center">
            <QrCode className="h-16 w-16 mx-auto mb-4 opacity-30 text-primary" />
            <p className="text-muted-foreground mb-4">Nie masz żadnych promes</p>
            <Button onClick={() => navigate("/applications/new/promise")} className="min-h-[44px] rounded-xl">
              Złóż wniosek o promesę
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {promises.map((promise) => {
            const daysLeft = daysUntil(promise.expiryDate);
            const isExpiringSoon = daysLeft > 0 && daysLeft <= 14;
            const isActive = promise.statusName === "Active" || promise.statusName === "Approved";

            return (
              <Card
                key={promise.id}
                className={`rounded-2xl border-none shadow-sm transition-all ${selectedId === promise.id ? "ring-2 ring-primary" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-base text-foreground">{promise.weaponType}</h3>
                        {getStatusBadge(promise.statusName)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="block">Nr promesy:</span>
                          <span className="font-mono text-foreground">{promise.promiseNumber}</span>
                        </div>
                        <div>
                          <span className="block">Ilość:</span>
                          <span className="font-medium text-foreground">{promise.remainingQuantity} / {promise.quantity}</span>
                        </div>
                        <div>
                          <span className="block">Data wydania:</span>
                          <span className="font-medium text-foreground">{formatDate(promise.issueDate)}</span>
                        </div>
                        <div>
                          <span className="block">Ważność:</span>
                          <span className={`font-medium ${isExpiringSoon ? "text-orange-600" : "text-foreground"}`}>
                            {formatDate(promise.expiryDate)} {daysLeft > 0 && `(${daysLeft} dni)`}
                          </span>
                        </div>
                      </div>

                      {isExpiringSoon && isActive && (
                        <div className="flex items-center gap-2 mt-3 text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <span className="font-medium">Promesa wygasa za {daysLeft} dni!</span>
                        </div>
                      )}
                    </div>

                    {isActive && (
                      <div className="flex flex-col items-center gap-2">
                        <Button
                          variant={selectedId === promise.id ? "default" : "outline"}
                          size="sm"
                          className="rounded-xl px-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(selectedId === promise.id ? null : promise.id);
                          }}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          {selectedId === promise.id ? "Ukryj QR" : "Pokaż QR"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* QR Panel */}
      {selected && (selected.statusName === "Active" || selected.statusName === "Approved") && selected.qrToken && (
        <Card ref={qrRef} className="mt-6 rounded-3xl border-none shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gradient-to-br from-primary to-[#003b6b] p-6 text-center text-white">
            <h3 className="text-xl font-bold mb-1">Kod QR e-Promesy</h3>
            <p className="text-white/80 text-sm">Pokaż ten kod w sklepie podczas zakupu broni</p>
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <QRCode value={selected.qrToken} size={200} level="H" />
              </div>

              <div className="w-full bg-muted/30 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Numer promesy:</span>
                  <span className="font-mono font-semibold">{selected.promiseNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Typ broni:</span>
                  <span className="font-medium">{selected.weaponType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ilość:</span>
                  <span className="font-semibold">{selected.remainingQuantity} / {selected.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ważna do:</span>
                  <span className="font-semibold">{formatDate(selected.expiryDate)}</span>
                </div>
              </div>

              <div className="w-full">
                <Label className="text-xs text-muted-foreground mb-2 block">Token (opcjonalne wpisanie ręczne)</Label>
                <div className="flex gap-2">
                  <Input value={selected.qrToken} readOnly className="font-mono text-xs bg-muted/50 rounded-xl" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (copyText(selected.qrToken!)) {
                        toast.success("Token skopiowany do schowka");
                      } else {
                        toast.error("Nie udało się skopiować. Skopiuj ręcznie.");
                      }
                    }}
                    className="shrink-0 rounded-xl"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Card className="w-full bg-blue-50/50 border-none rounded-xl">
                <CardContent className="p-4">
                  <div className="flex gap-3 text-sm text-blue-900">
                    <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">Ważne informacje</p>
                      <ul className="text-blue-700 space-y-1 text-xs list-disc list-inside">
                        <li>Kod QR jest unikalny dla tej promesy</li>
                        <li>Sklep zeskanuje kod przed sprzedażą</li>
                        <li>Po wykorzystaniu broń pojawi się w Twoim rejestrze</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedId(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full rounded-xl min-h-[44px]"
              >
                Zamknij
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
