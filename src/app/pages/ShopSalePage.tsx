import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AlertCircle, ShieldCheck, CheckCircle, XCircle, QrCode } from "lucide-react";
import { toast } from "sonner";
import { shopService, translateVerifyMessage } from "../../services/shopService";
import type { FirearmCategory, VerifyPermitResponse } from "../../types/api";

export function ShopSalePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillToken = searchParams.get("qrToken") ?? "";

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState<VerifyPermitResponse | null>(null);

  const [formData, setFormData] = useState({
    qrToken: prefillToken,
    brand: "",
    model: "",
    category: "B" as FirearmCategory,
    caliber: "",
    serialNumber: "",
    productionYear: "",
  });

  useEffect(() => {
    if (prefillToken && prefillToken !== formData.qrToken) {
      setFormData((f) => ({ ...f, qrToken: prefillToken }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillToken]);

  const handleVerify = async () => {
    if (!formData.qrToken) {
      setErrors({ qrToken: "Wprowadź token QR" });
      return;
    }
    setVerifying(true);
    setErrors({});
    try {
      const r = await shopService.verifyPermit({ qrToken: formData.qrToken });
      setVerification(r);
      if (!r.isValid) {
        toast.error("Promesa nieważna", { description: translateVerifyMessage(r.message) });
      } else {
        toast.success("Promesa zweryfikowana", { description: translateVerifyMessage(r.message) });
      }
    } catch (err: any) {
      toast.error("Błąd weryfikacji", { description: err?.message ?? "Spróbuj ponownie" });
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.qrToken) newErrors.qrToken = "Wymagany";
    if (!formData.brand) newErrors.brand = "Wymagane";
    if (!formData.model) newErrors.model = "Wymagane";
    if (!formData.category) newErrors.category = "Wymagane";
    if (!formData.caliber) newErrors.caliber = "Wymagane";
    if (!formData.serialNumber) newErrors.serialNumber = "Wymagane";
    if (!formData.productionYear) newErrors.productionYear = "Wymagany";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const r = await shopService.registerSale({
        qrToken: formData.qrToken,
        brand: formData.brand,
        model: formData.model,
        category: formData.category,
        caliber: formData.caliber,
        serialNumber: formData.serialNumber,
        productionYear: parseInt(formData.productionYear, 10),
      });

      toast.success("Broń zarejestrowana", {
        description: `Nr rejestracji: ${r.registrationNumber ?? "(brak)"}. ${r.message ?? ""}`,
        duration: 6000,
      });
      navigate("/shop");
    } catch (err: any) {
      toast.error("Błąd rejestracji sprzedaży", { description: err?.message ?? "Spróbuj ponownie" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Zarejestruj sprzedaż</h1>
        <p className="text-muted-foreground">Najpierw zweryfikuj promesę po QR, następnie uzupełnij dane broni.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* QR Token verification */}
        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <QrCode className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">1. Weryfikacja promesy</CardTitle>
            </div>
            <CardDescription>Wprowadź token QR z aplikacji obywatela i sprawdź ważność.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="qrToken" className="font-semibold text-sm">
                Token QR <span className="text-red-600">*</span>
              </Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="qrToken"
                  value={formData.qrToken}
                  onChange={(e) => setFormData({ ...formData, qrToken: e.target.value })}
                  className="min-h-[52px]"
                  placeholder="Wklej zeskanowany token..."
                />
                <Button
                  type="button"
                  onClick={handleVerify}
                  disabled={verifying || !formData.qrToken}
                  className="min-h-[52px] rounded-xl whitespace-nowrap"
                >
                  {verifying ? "..." : "Sprawdź"}
                </Button>
              </div>
              {errors.qrToken && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{errors.qrToken}</p>}
            </div>

            {verification && (
              <div className={`rounded-xl p-3 text-xs ${verification.isValid ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"}`}>
                <div className="flex items-center gap-2 mb-1 font-semibold">
                  {verification.isValid ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {verification.isValid ? "Promesa ważna" : "Promesa nieważna"}
                </div>
                <p>{translateVerifyMessage(verification.message)}</p>
                {verification.isValid && (
                  <div className="mt-2 space-y-1">
                    <p><strong>Nabywca:</strong> {verification.citizenName}</p>
                    <p><strong>Pozwolenie:</strong> {verification.permitNumber} ({verification.permitType})</p>
                    <p><strong>Dopuszczalna broń:</strong> {verification.weaponType}</p>
                    <p><strong>Pozostała ilość:</strong> {verification.remainingPromiseQuantity} • Wolne sloty: {verification.availableSlots}</p>
                    <p><strong>Badania:</strong> {verification.medicalExamsValid ? "aktualne" : "wygasły"}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Firearm details */}
        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">2. Dane zbywanej broni</CardTitle>
            </div>
            <CardDescription>Dane z faktury / certyfikatu. Nr seryjny musi być unikalny.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand" className="font-semibold text-sm">Producent <span className="text-red-600">*</span></Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="min-h-[52px] mt-1.5 rounded-xl text-base"
                  placeholder="Glock"
                />
                {errors.brand && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{errors.brand}</p>}
              </div>

              <div>
                <Label htmlFor="model" className="font-semibold text-sm">Model <span className="text-red-600">*</span></Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="min-h-[52px] mt-1.5 rounded-xl text-base"
                  placeholder="17 Gen 5"
                />
                {errors.model && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{errors.model}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category" className="font-semibold text-sm">Kategoria <span className="text-red-600">*</span></Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as FirearmCategory })}
                >
                  <SelectTrigger id="category" className="min-h-[52px] mt-1.5 rounded-xl text-base">
                    <SelectValue placeholder="Kategoria" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="A">Kat. A</SelectItem>
                    <SelectItem value="B">Kat. B</SelectItem>
                    <SelectItem value="C">Kat. C</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{errors.category}</p>}
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="caliber" className="font-semibold text-sm">Kaliber <span className="text-red-600">*</span></Label>
                <Input
                  id="caliber"
                  value={formData.caliber}
                  onChange={(e) => setFormData({ ...formData, caliber: e.target.value })}
                  className="min-h-[52px] mt-1.5 rounded-xl text-base"
                  placeholder="9x19mm"
                />
                {errors.caliber && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{errors.caliber}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serialNumber" className="font-semibold text-sm">Nr seryjny <span className="text-red-600">*</span></Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="min-h-[52px] mt-1.5 uppercase"
                  placeholder="SN-123456"
                />
                {errors.serialNumber && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{errors.serialNumber}</p>}
              </div>

              <div>
                <Label htmlFor="productionYear" className="font-semibold text-sm">Rok produkcji <span className="text-red-600">*</span></Label>
                <Input
                  id="productionYear"
                  type="number"
                  value={formData.productionYear}
                  onChange={(e) => setFormData({ ...formData, productionYear: e.target.value })}
                  className="min-h-[52px] mt-1.5 rounded-xl text-base"
                  placeholder="2024"
                  min="1900"
                  max={new Date().getFullYear()}
                />
                {errors.productionYear && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{errors.productionYear}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {!verification?.isValid && formData.qrToken && (
          <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Zalecamy zweryfikować promesę przed wysłaniem formularza, ale system i tak zweryfikuje token przy zapisie.</span>
          </div>
        )}

        <Button type="submit" disabled={submitting} className="w-full min-h-[52px] rounded-xl text-base font-semibold">
          {submitting ? "Rejestrowanie..." : "Zatwierdź i zgłoś sprzedaż"}
        </Button>
      </form>
    </div>
  );
}
