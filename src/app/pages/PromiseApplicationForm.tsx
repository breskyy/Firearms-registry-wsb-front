import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AlertCircle, Shield, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";

export function PromiseApplicationForm() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    permitId: "",
    requestedWeaponType: "",
    requestedQuantity: 1,
  });

  // Mock data - lista pozwoleń użytkownika
  const userPermits = [
    {
      id: "permit-001",
      permitNumber: "POZ-2025-001234",
      permitType: "Sport",
      availableSlots: 3,
      maxFirearms: 5,
      isValid: true,
    },
    {
      id: "permit-002",
      permitNumber: "POZ-2024-005678",
      permitType: "Hunting",
      availableSlots: 1,
      maxFirearms: 2,
      isValid: true,
    },
  ];

  const selectedPermit = userPermits.find((p) => p.id === formData.permitId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.permitId) {
      newErrors.permitId = "Wybierz pozwolenie";
    }
    if (!formData.requestedWeaponType || formData.requestedWeaponType.length < 5) {
      newErrors.requestedWeaponType = "Typ broni musi zawierać minimum 5 znaków";
    }
    if (!formData.requestedQuantity || formData.requestedQuantity < 1) {
      newErrors.requestedQuantity = "Ilość musi być większa niż 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Mock - symulacja wysłania
    const applicationNumber = `WNI-PROM-2026-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;

    toast.success("Wniosek o e-Promesę złożony pomyślnie", {
      description: `Nr wniosku: ${applicationNumber}. Status: Oczekuje na opłatę.`,
      duration: 5000,
    });

    navigate("/citizen");
  };

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
          Wniosek o e-Promesę
        </h1>
        <p className="text-muted-foreground">
          Złóż wniosek o promesę na zakup konkretnej broni palnej
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Wybierz pozwolenie</CardTitle>
            <CardDescription>
              Promesa jest wydawana w ramach posiadanego pozwolenia na broń
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="permitId">
                Pozwolenie <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.permitId}
                onValueChange={(value) => setFormData({ ...formData, permitId: value })}
              >
                <SelectTrigger id="permitId" className="min-h-[44px] mt-2 rounded-xl">
                  <SelectValue placeholder="Wybierz pozwolenie" />
                </SelectTrigger>
                <SelectContent>
                  {userPermits.map((permit) => (
                    <SelectItem key={permit.id} value={permit.id} disabled={!permit.isValid || permit.availableSlots === 0}>
                      <div className="flex flex-col py-1">
                        <span className="font-semibold">
                          {permit.permitType} • {permit.permitNumber}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Wolne sloty: {permit.availableSlots} / {permit.maxFirearms}
                          {permit.availableSlots === 0 && " (Brak wolnych miejsc)"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.permitId && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.permitId}</span>
                </div>
              )}
            </div>

            {selectedPermit && (
              <Card className="bg-muted/30 border-none rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-xl shrink-0">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm">Pozwolenie {selectedPermit.permitType}</h3>
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-2 py-0.5 rounded-full text-xs">
                          Aktywne
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="block">Numer:</span>
                          <span className="font-mono text-foreground">{selectedPermit.permitNumber}</span>
                        </div>
                        <div>
                          <span className="block">Dostępne miejsca:</span>
                          <span className="font-semibold text-foreground">
                            {selectedPermit.availableSlots} / {selectedPermit.maxFirearms}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Dane broni</CardTitle>
            <CardDescription>
              Opisz typ broni, którą planujesz kupić
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="requestedWeaponType">
                Typ broni <span className="text-red-600">*</span>
              </Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Np. "Pistolet sportowy Glock 17, kaliber 9mm" (max 100 znaków)
              </p>
              <Input
                id="requestedWeaponType"
                value={formData.requestedWeaponType}
                onChange={(e) => setFormData({ ...formData, requestedWeaponType: e.target.value })}
                className="min-h-[44px] rounded-xl"
                placeholder="Pistolet sportowy Glock 17, 9mm"
                maxLength={100}
              />
              <div className="flex justify-between items-center mt-2">
                {errors.requestedWeaponType ? (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.requestedWeaponType}</span>
                  </div>
                ) : (
                  <span />
                )}
                <span className="text-xs text-muted-foreground">
                  {formData.requestedWeaponType.length} / 100
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="requestedQuantity">
                Ilość <span className="text-red-600">*</span>
              </Label>
              <Input
                id="requestedQuantity"
                type="number"
                value={formData.requestedQuantity}
                onChange={(e) => setFormData({ ...formData, requestedQuantity: Number(e.target.value) })}
                className="min-h-[44px] mt-2 rounded-xl"
                min={1}
                max={selectedPermit?.availableSlots || 1}
              />
              {errors.requestedQuantity && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.requestedQuantity}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 space-y-2">
                <p className="font-semibold">Co dalej?</p>
                <ul className="text-blue-700 space-y-1 text-sm list-disc list-inside">
                  <li>Po złożeniu wniosku opłać promesę (mockowane)</li>
                  <li>WPA rozpatrzy wniosek w ciągu 14 dni</li>
                  <li>Po zatwierdzeniu otrzymasz promesę z kodem QR</li>
                  <li>Promesa będzie ważna przez 6 miesięcy</li>
                  <li>Kod QR pokaż w sklepie przy zakupie broni</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/citizen")}
            className="min-h-[44px] flex-1 rounded-xl"
          >
            Anuluj
          </Button>
          <Button type="submit" className="min-h-[44px] flex-1 rounded-xl">
            Złóż wniosek
          </Button>
        </div>
      </form>
    </div>
  );
}
