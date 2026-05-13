import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { QRCodeSVG } from "react-qr-code";
import { Clock, CheckCircle, XCircle, AlertTriangle, Copy, QrCode } from "lucide-react";
import { toast } from "sonner";

export function PromisesView() {
  const navigate = useNavigate();
  const [selectedPromiseId, setSelectedPromiseId] = useState<string | null>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Scroll to QR code when promise is selected
  useEffect(() => {
    if (selectedPromiseId && qrCodeRef.current) {
      setTimeout(() => {
        qrCodeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [selectedPromiseId]);

  // Mock data - lista promes
  const promises = [
    {
      id: "promise-001",
      promiseNumber: "PROM-2026-001234",
      qrToken: "QR-ABC-123-XYZ-789-MOCK-TOKEN",
      promiseStatus: "Active",
      requestedWeaponType: "Pistolet sportowy Glock 17, 9mm",
      remainingQuantity: 1,
      requestedQuantity: 1,
      expiryDate: "2026-11-12",
      issueDate: "2026-05-12",
      permitNumber: "POZ-2025-001234",
    },
    {
      id: "promise-002",
      promiseNumber: "PROM-2026-001235",
      qrToken: "QR-DEF-456-UVW-012-MOCK-TOKEN",
      promiseStatus: "Used",
      requestedWeaponType: "Karabinek myśliwski CZ 527, kaliber 7.62mm",
      remainingQuantity: 0,
      requestedQuantity: 1,
      expiryDate: "2026-10-10",
      issueDate: "2026-04-10",
      permitNumber: "POZ-2024-005678",
    },
  ];

  const selectedPromise = promises.find((p) => p.id === selectedPromiseId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-2 py-0.5 rounded-full">
            <CheckCircle className="h-3 w-3 mr-1" />
            Aktywna
          </Badge>
        );
      case "Used":
        return (
          <Badge variant="secondary" className="px-2 py-0.5 rounded-full">
            <CheckCircle className="h-3 w-3 mr-1" />
            Wykorzystana
          </Badge>
        );
      case "Expired":
        return (
          <Badge variant="destructive" className="px-2 py-0.5 rounded-full">
            <XCircle className="h-3 w-3 mr-1" />
            Wygasła
          </Badge>
        );
      default:
        return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date("2026-05-12"); // Mock data date
    const expiry = new Date(expiryDate);
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diff;
  };

  const copyQRToken = (token: string) => {
    // Use legacy fallback method directly since Clipboard API is blocked
    const textArea = document.createElement("textarea");
    textArea.value = token;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        toast.success("Token skopiowany do schowka");
      } else {
        toast.error("Nie udało się skopiować tokenu. Skopiuj ręcznie.");
      }
    } catch (err) {
      document.body.removeChild(textArea);
      console.error("Failed to copy:", err);
      toast.error("Nie udało się skopiować tokenu. Skopiuj ręcznie.");
    }
  };

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Moje e-Promesy</h1>
        <p className="text-muted-foreground">
          Aktywne promesy na zakup broni z kodami QR
        </p>
      </div>

      {promises.length === 0 ? (
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-12 text-center">
            <QrCode className="h-16 w-16 mx-auto mb-4 opacity-30 text-primary" />
            <p className="text-muted-foreground mb-4">Nie masz żadnych promes</p>
            <Button
              onClick={() => navigate("/application/new-promise")}
              className="min-h-[44px] rounded-xl"
            >
              Złóż wniosek o promesę
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {promises.map((promise) => {
            const daysLeft = getDaysUntilExpiry(promise.expiryDate);
            const isExpiringSoon = daysLeft > 0 && daysLeft <= 14;

            return (
              <Card
                key={promise.id}
                className={`rounded-2xl border-none shadow-sm transition-all ${
                  selectedPromiseId === promise.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-base text-foreground">
                          {promise.requestedWeaponType}
                        </h3>
                        {getStatusBadge(promise.promiseStatus)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="block">Nr promesy:</span>
                          <span className="font-mono text-foreground">{promise.promiseNumber}</span>
                        </div>
                        <div>
                          <span className="block">Pozwolenie:</span>
                          <span className="font-medium text-foreground">{promise.permitNumber}</span>
                        </div>
                        <div>
                          <span className="block">Data wydania:</span>
                          <span className="font-medium text-foreground">{promise.issueDate}</span>
                        </div>
                        <div>
                          <span className="block">Ważność:</span>
                          <span className={`font-medium ${isExpiringSoon ? "text-orange-600" : "text-foreground"}`}>
                            {promise.expiryDate} {daysLeft > 0 && `(${daysLeft} dni)`}
                          </span>
                        </div>
                      </div>

                      {isExpiringSoon && promise.promiseStatus === "Active" && (
                        <div className="flex items-center gap-2 mt-3 text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <span className="font-medium">Promesa wygasa za {daysLeft} dni!</span>
                        </div>
                      )}
                    </div>

                    {promise.promiseStatus === "Active" && (
                      <div className="flex flex-col items-center gap-2">
                        <Button
                          variant={selectedPromiseId === promise.id ? "default" : "outline"}
                          size="sm"
                          className="rounded-xl h-auto px-4 py-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPromiseId(selectedPromiseId === promise.id ? null : promise.id);
                          }}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          {selectedPromiseId === promise.id ? "Ukryj QR" : "Pokaż QR"}
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

      {/* QR Code Modal/Dialog */}
      {selectedPromise && selectedPromise.promiseStatus === "Active" && (
        <Card ref={qrCodeRef} className="mt-6 rounded-3xl border-none shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gradient-to-br from-primary to-[#003b6b] p-6 text-center text-white">
            <h3 className="text-xl font-bold mb-1">Kod QR e-Promesy</h3>
            <p className="text-white/80 text-sm">Pokaż ten kod w sklepie podczas zakupu broni</p>
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              {/* QR Code */}
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <QRCodeSVG value={selectedPromise.qrToken} size={200} level="H" />
              </div>

              {/* Promise Details */}
              <div className="w-full bg-muted/30 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Numer promesy:</span>
                  <span className="font-mono font-semibold">{selectedPromise.promiseNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Typ broni:</span>
                  <span className="font-medium">{selectedPromise.requestedWeaponType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ilość:</span>
                  <span className="font-semibold">
                    {selectedPromise.remainingQuantity} / {selectedPromise.requestedQuantity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ważna do:</span>
                  <span className="font-semibold">{selectedPromise.expiryDate}</span>
                </div>
              </div>

              {/* Token */}
              <div className="w-full">
                <Label className="text-xs text-muted-foreground mb-2 block">Token (opcjonalne wpisanie ręczne)</Label>
                <div className="flex gap-2">
                  <Input
                    value={selectedPromise.qrToken}
                    readOnly
                    className="font-mono text-xs bg-muted/50 rounded-xl"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyQRToken(selectedPromise.qrToken)}
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
                        <li>Promesa zostanie automatycznie wykorzystana po zakupie</li>
                        <li>Po wykorzystaniu broń pojawi się w Twoim rejestrze</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedPromiseId(null);
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

// Import Label from ui
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
