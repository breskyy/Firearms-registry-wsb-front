import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Search, FileCheck, Info, ShieldAlert } from "lucide-react";

const CATEGORY_RULES: Array<{ permit: string; categories: string[]; color: string }> = [
  { permit: "Sportowe", categories: ["A", "B"], color: "bg-blue-50 text-blue-900" },
  { permit: "Kolekcjonerskie", categories: ["A", "B", "C"], color: "bg-emerald-50 text-emerald-900" },
  { permit: "Ochrony osobistej", categories: ["B"], color: "bg-purple-50 text-purple-900" },
  { permit: "Łowieckie", categories: ["C"], color: "bg-orange-50 text-orange-900" },
  { permit: "Inne", categories: ["A", "B", "C"], color: "bg-muted text-foreground" },
];

export function ShopDashboard() {
  const navigate = useNavigate();

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Panel sklepu</h1>
        <p className="text-muted-foreground">Weryfikacja promes i zgłaszanie sprzedaży broni palnej</p>
      </div>

      {/* Quick Actions */}
      <Card className="mb-6 rounded-2xl border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Operacje</CardTitle>
          <CardDescription>Co możesz zrobić w systemie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate("/shop/verify")}
              className="flex items-start gap-3 rounded-xl bg-muted/30 hover:bg-muted/50 p-4 text-left transition-colors min-h-[80px] active:scale-[0.99]"
            >
              <div className="bg-primary/10 p-2 rounded-xl text-primary shrink-0">
                <Search className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-foreground">Sprawdź promesę</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  Sprawdź ważność po QR lub numerze. Nie zapisuje sprzedaży.
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => navigate("/shop/sale")}
              className="flex items-start gap-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 p-4 text-left transition-colors min-h-[80px] active:scale-[0.99]"
            >
              <div className="bg-primary-foreground/15 p-2 rounded-xl shrink-0">
                <FileCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">Zarejestruj sprzedaż</div>
                <div className="text-xs opacity-90 mt-0.5 leading-snug">
                  Pełna ścieżka: zeskanuj QR, sprawdź dane, wpisz broń, zapisz.
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Workflow info */}
      <Card className="mb-6 rounded-2xl border-none shadow-sm bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-2">Procedura sprzedaży</p>
              <ol className="text-blue-700 space-y-1 list-decimal list-inside text-xs">
                <li>Klient pokazuje kod QR e-Promesy ze swojej aplikacji mObywatel.</li>
                <li>Wprowadź token QR — system sprawdza ważność, sloty, badania.</li>
                <li>Po pozytywnej weryfikacji wprowadź dane broni z faktury.</li>
                <li>Zatwierdzenie tworzy wpis w rejestrze broni i aktualizuje promesę oraz pozwolenie nabywcy w jednej transakcji.</li>
              </ol>
              <p className="text-xs text-blue-700 mt-3">
                System nie udostępnia historii Twoich sprzedaży ani statystyk — to dane audytowe widoczne tylko dla WPA.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category-permit matrix */}
      <Card className="mb-6 rounded-2xl border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg">Dopuszczalne kategorie broni wg pozwolenia</CardTitle>
          </div>
          <CardDescription>System odrzuci sprzedaż jeśli kategoria nie pasuje do typu pozwolenia kupującego.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {CATEGORY_RULES.map((rule) => (
              <div key={rule.permit} className={`rounded-xl p-3 flex items-center justify-between ${rule.color}`}>
                <p className="font-medium text-sm">Pozwolenie {rule.permit}</p>
                <div className="flex gap-1">
                  {rule.categories.map((cat) => (
                    <Badge key={cat} className="bg-background/80 text-foreground border border-current/20 rounded-full px-2 py-0.5 text-xs font-mono">
                      Kat. {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
