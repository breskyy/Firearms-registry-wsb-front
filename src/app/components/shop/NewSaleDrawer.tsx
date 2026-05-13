import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "../ui/drawer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { AlertCircle, ShieldCheck, User, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

interface NewSaleDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewSaleDrawer({ open, onOpenChange }: NewSaleDrawerProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const initialFormData = {
    qrToken: "", // Z weryfikacji lub skanowania
    brand: "",
    model: "",
    category: "B" as "A" | "B" | "C",
    caliber: "",
    serialNumber: "",
    productionYear: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      // Mock QR token - w prawdziwej aplikacji przychodzi z weryfikacji
      const mockQRToken = "QR-MOCK-" + Math.random().toString(36).substring(2, 15).toUpperCase();
      setFormData({ ...initialFormData, qrToken: mockQRToken });
      setErrors({});
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.qrToken) newErrors.qrToken = "Zweryfikuj promesę przed rejestracją";
    if (!formData.brand) newErrors.brand = "Wymagane";
    if (!formData.model) newErrors.model = "Wymagane";
    if (!formData.category) newErrors.category = "Wymagane";
    if (!formData.caliber) newErrors.caliber = "Wymagane";
    if (!formData.serialNumber) newErrors.serialNumber = "Wymagane";
    if (!formData.productionYear) newErrors.productionYear = "Wymagane";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      const firstErrorKey = Object.keys(newErrors)[0];
      const element = document.getElementById(`field-${firstErrorKey}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        toast.error("Proszę uzupełnić wszystkie wymagane pola formularza.");
      }
      return;
    }

    // Success - Mock register sale
    const generatedRegNum = "REG-2026-" + Math.floor(Math.random() * 10000).toString().padStart(5, '0');
    const firearmId = "FW-" + Math.random().toString(36).substring(2, 9).toUpperCase();

    onOpenChange(false);

    toast.success("Broń zarejestrowana pomyślnie", {
      description: `Nr rejestracji: ${generatedRegNum}. Broń przypisana do nabywcy. ID: ${firearmId}`,
      duration: 6000,
      className: "border-emerald-200 bg-emerald-50 text-emerald-900"
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh] flex flex-col px-0 rounded-t-3xl border-0 shadow-2xl">
        <DrawerHeader className="border-b px-4 py-4 shrink-0">
          <DrawerTitle className="text-xl font-bold tracking-tight text-foreground">Zgłoszenie nowej sprzedaży</DrawerTitle>
          <DrawerDescription className="text-sm">
            Wprowadź dane z e-Promesy oraz detale dotyczące zbywanej broni.
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative" id="drawer-scroll-area">
          <form onSubmit={handleSubmit} className="p-4 space-y-5 pb-24">
            
            {/* Hidden QR Token field */}
            <input type="hidden" value={formData.qrToken} />

            {/* Info card - QR Token */}
            <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-blue-50/50">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Token promesy</p>
                    <p className="text-blue-700 text-xs">
                      {formData.qrToken ? (
                        <span className="font-mono bg-white px-2 py-1 rounded">{formData.qrToken.substring(0, 20)}...</span>
                      ) : (
                        "Zweryfikuj promesę przed rejestracją sprzedaży"
                      )}
                    </p>
                    {errors.qrToken && <p className="text-red-500 text-xs mt-1 font-medium">{errors.qrToken}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja Broni */}
            <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-muted/20">
              <div className="h-1.5 bg-orange-400/30 w-full" />
              <CardHeader className="pb-3 pt-5 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-orange-100 p-2 rounded-xl text-orange-600 shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base">Zbywana broń</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-5">
                <div className="grid grid-cols-2 gap-4">
                  <div id="field-brand">
                    <Label htmlFor="brand" className="font-semibold text-sm">
                      Producent <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="min-h-[52px] mt-1.5 rounded-xl text-base bg-background"
                      placeholder="Glock"
                    />
                    {errors.brand && <p className="text-red-500 text-xs mt-1 font-medium">{errors.brand}</p>}
                  </div>

                  <div id="field-model">
                    <Label htmlFor="model" className="font-semibold text-sm">
                      Model <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="min-h-[52px] mt-1.5 rounded-xl text-base bg-background"
                      placeholder="17 Gen 5"
                    />
                    {errors.model && <p className="text-red-500 text-xs mt-1 font-medium">{errors.model}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div id="field-category">
                    <Label htmlFor="category" className="font-semibold text-sm">
                      Kategoria <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: "A" | "B" | "C") => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger id="category" className="min-h-[52px] mt-1.5 rounded-xl text-base bg-background">
                        <SelectValue placeholder="Kat." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="A">Kat. A (zakazana)</SelectItem>
                        <SelectItem value="B">Kat. B (pozwolenie)</SelectItem>
                        <SelectItem value="C">Kat. C (zgłoszenie)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-red-500 text-xs mt-1 font-medium">{errors.category}</p>}
                  </div>

                  <div id="field-caliber" className="col-span-2">
                    <Label htmlFor="caliber" className="font-semibold text-sm">
                      Kaliber <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.caliber}
                      onValueChange={(value) => setFormData({ ...formData, caliber: value })}
                    >
                      <SelectTrigger id="caliber" className="min-h-[52px] mt-1.5 rounded-xl text-base bg-background">
                        <SelectValue placeholder="Wybierz" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="9mm">9x19mm</SelectItem>
                        <SelectItem value=".45ACP">.45 ACP</SelectItem>
                        <SelectItem value=".22LR">.22 LR</SelectItem>
                        <SelectItem value="7.62mm">7.62x39mm</SelectItem>
                        <SelectItem value="5.56mm">5.56x45mm</SelectItem>
                        <SelectItem value="12GA">12 Gauge</SelectItem>
                        <SelectItem value="other">Inny</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.caliber && <p className="text-red-500 text-xs mt-1 font-medium">{errors.caliber}</p>}
                  </div>

                  <div id="field-serialNumber">
                    <Label htmlFor="serialNumber" className="font-semibold text-sm">
                      Nr seryjny <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="serialNumber"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      className="min-h-[52px] mt-1.5 rounded-xl text-base font-mono uppercase bg-background"
                      placeholder="SN-123"
                    />
                    {errors.serialNumber && <p className="text-red-500 text-xs mt-1 font-medium">{errors.serialNumber}</p>}
                  </div>
                </div>

                <div id="field-productionYear">
                  <Label htmlFor="productionYear" className="font-semibold text-sm">
                    Rok produkcji <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="productionYear"
                    type="number"
                    value={formData.productionYear}
                    onChange={(e) => setFormData({ ...formData, productionYear: e.target.value })}
                    className="min-h-[52px] mt-1.5 rounded-xl text-base bg-background"
                    placeholder="2024"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                  {errors.productionYear && <p className="text-red-500 text-xs mt-1 font-medium">{errors.productionYear}</p>}
                </div>
              </CardContent>
            </Card>


            {/* Niewidoczny przycisk submit do formularza - prawdziwy jest w footerze */}
            <button type="submit" id="hidden-submit" className="hidden">Submit</button>
          </form>
        </div>
        
        {/* Sticky Button na dole Drawera */}
        <div className="p-4 border-t bg-background shrink-0 mt-auto">
          <Button 
            className="w-full min-h-[56px] rounded-2xl text-[17px] font-bold shadow-sm"
            onClick={() => {
              document.getElementById("hidden-submit")?.click();
            }}
          >
            Zatwierdź i zgłoś
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