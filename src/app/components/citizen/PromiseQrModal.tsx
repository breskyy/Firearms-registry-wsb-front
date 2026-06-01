import QRCode from "react-qr-code";
import { Clock, Copy, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { cn } from "../ui/utils";
import type { PromiseDto } from "../../../types/api";

interface PromiseQrModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promiseData: PromiseDto | null;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

function fallbackCopy(text: string): boolean {
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

export function PromiseQrModal({ open, onOpenChange, promiseData }: PromiseQrModalProps) {
  if (!promiseData || !promiseData.qrToken) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(promiseData.qrToken!);
      } else if (!fallbackCopy(promiseData.qrToken!)) {
        throw new Error("copy-failed");
      }
      toast.success("Kod skopiowany do schowka");
    } catch {
      toast.error("Nie udało się skopiować. Skopiuj ręcznie.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 rounded-2xl sm:rounded-3xl p-0 overflow-hidden border-none shadow-xl bg-white [&>button]:hidden",
          "w-[calc(100vw-1rem)] max-w-[min(100vw-1rem,20rem)] sm:max-w-xl",
          "max-h-[calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-0.75rem)] sm:max-h-[92vh]",
          "top-[max(0.5rem,env(safe-area-inset-top,0px))] translate-y-0 sm:top-[50%] sm:translate-y-[-50%]",
        )}
      >
        <div className="relative z-10 shrink-0 bg-gradient-to-br from-[#0069e8] via-[#008cf0] to-[#00a6e8] px-4 pt-4 pb-3 sm:p-6 text-center text-white">
          <DialogClose
            className="absolute right-3 top-3 sm:right-4 sm:top-4 inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70"
            aria-label="Zamknij okno kodu QR"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </DialogClose>
          <DialogHeader className="text-center gap-1 sm:gap-2">
            <DialogTitle className="text-base sm:text-xl font-bold pr-8">Kod QR e-Promesy</DialogTitle>
            <DialogDescription className="text-white/80 text-xs sm:text-sm leading-snug">
              Pokaż w sklepie przy zakupie broni
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="overflow-y-auto overscroll-contain bg-white flex-1 min-h-0 px-3 py-3 sm:p-6">
          <div className="flex flex-col items-center gap-2.5 sm:gap-4">
            <div className="bg-background p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-border">
              <QRCode value={promiseData.qrToken} size={148} level="H" className="sm:hidden h-auto w-full max-w-[148px]" />
              <QRCode value={promiseData.qrToken} size={200} level="H" className="hidden sm:block h-auto w-full max-w-[200px]" />
            </div>

            <div className="w-full bg-card rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm shadow-sm border border-border">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Numer:</span>
                <span className="font-mono font-semibold text-right">{promiseData.promiseNumber}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Typ:</span>
                <span className="font-medium text-right">{promiseData.weaponType}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Ilość:</span>
                <span className="font-semibold text-right">
                  {promiseData.remainingQuantity} / {promiseData.quantity}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Ważna do:</span>
                <span className="font-semibold text-right">{formatDate(promiseData.expiryDate)}</span>
              </div>
            </div>

            <div className="w-full">
              <Label className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2 block">
                <span className="sm:hidden">Kod ręczny (sklep)</span>
                <span className="hidden sm:inline">Kod z QR (do wpisania ręcznego w sklepie)</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={promiseData.qrToken}
                  readOnly
                  className="font-mono text-[10px] sm:text-xs bg-background rounded-xl border-border min-h-[40px] sm:min-h-[44px] h-9 sm:h-auto"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => void handleCopy()}
                  className="shrink-0 rounded-xl min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px]"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Card className="w-full bg-blue-50/60 border-none rounded-xl sm:rounded-2xl shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <div className="flex gap-2 sm:gap-3 text-xs sm:text-sm text-blue-900">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-semibold mb-0.5 sm:mb-1">Ważne</p>
                    <p className="text-blue-700 text-[10px] sm:text-xs leading-snug sm:hidden">
                      Kod jednorazowy — sklep skanuje przed sprzedażą; broń trafi do rejestru po zakupie.
                    </p>
                    <ul className="hidden sm:block text-blue-700 space-y-1 text-xs list-disc list-inside">
                      <li>Kod QR jest unikalny dla tej promesy</li>
                      <li>Sklep zeskanuje kod przed sprzedażą</li>
                      <li>Po wykorzystaniu broń pojawi się w Twoim rejestrze</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="button"
              className="w-full min-h-[40px] sm:min-h-[44px] rounded-xl text-sm"
              onClick={() => onOpenChange(false)}
            >
              Zamknij
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
