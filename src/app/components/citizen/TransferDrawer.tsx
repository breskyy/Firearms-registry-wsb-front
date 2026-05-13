import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "../ui/drawer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface TransferDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  firearmId?: string;
  firearmInfo?: {
    brand: string;
    model: string;
    serialNumber: string;
  };
}

export function TransferDrawer({ open, onOpenChange, firearmId, firearmInfo }: TransferDrawerProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    buyerPesel: "",
    transferType: "Sale" as "Sale" | "Donation" | "Inheritance" | "AdministrativeCorrection",
  });

  useEffect(() => {
    if (open) {
      setFormData({
        buyerPesel: "",
        transferType: "Sale",
      });
      setErrors({});
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.buyerPesel) {
      newErrors.buyerPesel = "Wymagane";
    } else if (formData.buyerPesel.length !== 11) {
      newErrors.buyerPesel = "PESEL musi mieć 11 cyfr";
    }

    if (!formData.transferType) {
      newErrors.transferType = "Wybierz typ transferu";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Mock - symulacja utworzenia transferu
    const transferNumber = `TRF-2026-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;

    onOpenChange(false);

    toast.success("Transfer zainicjowany pomyślnie", {
      description: `Nr transferu: ${transferNumber}. Kupujący otrzymał powiadomienie o oczekującym transferze.`,
      duration: 5000,
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh] flex flex-col px-0 rounded-t-3xl border-0 shadow-2xl">
        <DrawerHeader className="border-b px-4 py-4 shrink-0">
          <DrawerTitle className="text-xl font-bold tracking-tight text-foreground">
            Transfer broni
          </DrawerTitle>
          <DrawerDescription className="text-sm">
            {firearmInfo ? `${firearmInfo.brand} ${firearmInfo.model} (SN: ${firearmInfo.serialNumber})` : "Sprzedaż lub przekazanie broni innemu obywatelowi"}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden relative p-4">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="bg-blue-50/50 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Jak działa transfer?</p>
                  <ol className="text-blue-700 space-y-1 text-xs list-decimal list-inside">
                    <li>Podaj PESEL kupującego</li>
                    <li>Kupujący otrzyma powiadomienie w aplikacji</li>
                    <li>Kupujący musi zaakceptować lub odrzucić transfer</li>
                    <li>Po akceptacji broń zmieni właściciela automatycznie</li>
                    <li>Twój slot w pozwoleniu zostanie zwolniony</li>
                  </ol>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="buyerPesel" className="font-semibold text-foreground text-sm">
                PESEL kupującego <span className="text-red-500">*</span>
              </Label>
              <Input
                id="buyerPesel"
                type="text"
                value={formData.buyerPesel}
                onChange={(e) => setFormData({ ...formData, buyerPesel: e.target.value })}
                className="min-h-[52px] mt-1.5 rounded-xl text-base font-mono bg-background"
                placeholder="12345678901"
                maxLength={11}
              />
              {errors.buyerPesel && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.buyerPesel}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Kupujący musi posiadać aktywne pozwolenie na broń
              </p>
            </div>

            <div>
              <Label htmlFor="transferType" className="font-semibold text-foreground text-sm">
                Typ transferu <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.transferType}
                onValueChange={(value: any) => setFormData({ ...formData, transferType: value })}
              >
                <SelectTrigger id="transferType" className="min-h-[52px] mt-1.5 rounded-xl text-base bg-background">
                  <SelectValue placeholder="Wybierz typ" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Sale">Sprzedaż</SelectItem>
                  <SelectItem value="Donation">Darowizna</SelectItem>
                  <SelectItem value="Inheritance">Dziedziczenie</SelectItem>
                  <SelectItem value="AdministrativeCorrection">Korekta administracyjna</SelectItem>
                </SelectContent>
              </Select>
              {errors.transferType && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.transferType}</p>
              )}
            </div>

            <button type="submit" id="hidden-submit" className="hidden">Submit</button>
          </form>
        </div>

        <div className="p-4 border-t bg-background shrink-0 mt-auto">
          <Button
            className="w-full min-h-[56px] rounded-2xl text-[17px] font-bold shadow-sm"
            onClick={() => {
              document.getElementById("hidden-submit")?.click();
            }}
          >
            Zainicjuj transfer
          </Button>
          <Button
            variant="ghost"
            className="w-full min-h-[44px] mt-2 rounded-xl text-muted-foreground font-medium"
            onClick={() => onOpenChange(false)}
          >
            Anuluj
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
