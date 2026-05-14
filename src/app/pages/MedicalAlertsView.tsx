import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { AlertTriangle, CheckCircle, XCircle, Calendar, Shield, FileText } from "lucide-react";
import { useNavigate } from "react-router";
import { citizenService } from "../../services/citizenService";
import type { PermitDto } from "../../types/api";

type AlertItem = {
  id: string;
  permitId: string;
  permitNumber: string;
  alertType: "MedicalExamExpiring" | "MedicalExamExpired" | "PsychologicalExamExpiring" | "PsychologicalExamExpired";
  expiryDate: string;
  daysUntilExpiry: number;
};

function computeAlerts(permits: PermitDto[]): AlertItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const WARN_DAYS = 30;
  const alerts: AlertItem[] = [];

  permits
    .filter((p) => p.statusName === "Active")
    .forEach((p) => {
      const fields: { type: "Medical" | "Psychological"; date: string | null }[] = [
        { type: "Medical", date: p.medicalExamExpiryDate },
        { type: "Psychological", date: p.psychologicalExamExpiryDate },
      ];

      fields.forEach(({ type, date }) => {
        if (!date) return;
        const expiry = new Date(date);
        expiry.setHours(0, 0, 0, 0);
        const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

        if (diff <= 0) {
          alerts.push({
            id: `${p.id}-${type}-expired`,
            permitId: p.id,
            permitNumber: p.permitNumber,
            alertType: type === "Medical" ? "MedicalExamExpired" : "PsychologicalExamExpired",
            expiryDate: date,
            daysUntilExpiry: diff,
          });
        } else if (diff <= WARN_DAYS) {
          alerts.push({
            id: `${p.id}-${type}-expiring`,
            permitId: p.id,
            permitNumber: p.permitNumber,
            alertType: type === "Medical" ? "MedicalExamExpiring" : "PsychologicalExamExpiring",
            expiryDate: date,
            daysUntilExpiry: diff,
          });
        }
      });
    });

  return alerts;
}

function getAlertTypeLabel(type: string) {
  switch (type) {
    case "MedicalExamExpiring": return "Badanie lekarskie wkrótce wygasa";
    case "PsychologicalExamExpiring": return "Badanie psychologiczne wkrótce wygasa";
    case "MedicalExamExpired": return "Badanie lekarskie wygasło";
    case "PsychologicalExamExpired": return "Badanie psychologiczne wygasło";
    default: return type;
  }
}

function getAlertBadge(daysLeft: number) {
  if (daysLeft <= 0) {
    return (
      <Badge variant="destructive" className="px-2 py-0.5 rounded-full">
        <XCircle className="h-3 w-3 mr-1" />Wygasło
      </Badge>
    );
  } else if (daysLeft <= 7) {
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-none px-2 py-0.5 rounded-full">
        <AlertTriangle className="h-3 w-3 mr-1" />Pilne ({daysLeft} dni)
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none px-2 py-0.5 rounded-full">
      <AlertTriangle className="h-3 w-3 mr-1" />{daysLeft} dni
    </Badge>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

export function MedicalAlertsView() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [permits, setPermits] = useState<PermitDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("expiring");

  useEffect(() => {
    citizenService
      .getPermits()
      .then((r) => {
        setPermits(r);
        setAlerts(computeAlerts(r));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const expiringAlerts = alerts.filter((a) => a.daysUntilExpiry > 0);
  const expiredAlerts = alerts.filter((a) => a.daysUntilExpiry <= 0);
  const hasPermits = permits.length > 0;

  const AlertCard = ({ alert, expired }: { alert: AlertItem; expired?: boolean }) => (
    <Card className={`rounded-2xl border-none shadow-sm ${expired ? "border-red-200 bg-red-50/30" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl shrink-0 mt-1 ${expired ? "bg-red-100" : "bg-amber-100"}`}>
            {expired
              ? <XCircle className="h-5 w-5 text-red-600" />
              : <AlertTriangle className="h-5 w-5 text-orange-500" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-semibold text-base ${expired ? "text-red-900" : ""}`}>
                {getAlertTypeLabel(alert.alertType)}
              </h3>
              {getAlertBadge(alert.daysUntilExpiry)}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className={`block ${expired ? "text-red-600/70" : "text-muted-foreground"}`}>Nr pozwolenia:</span>
                <span className={`font-mono ${expired ? "text-red-900" : "text-foreground"}`}>{alert.permitNumber}</span>
              </div>
              <div className="col-span-2">
                <span className={`block ${expired ? "text-red-600/70" : "text-muted-foreground"}`}>
                  {alert.daysUntilExpiry <= 0 ? "Wygasło:" : "Wygasa:"}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <Calendar className={`h-3 w-3 ${expired ? "text-red-600" : "text-muted-foreground"}`} />
                  <span className={`font-medium ${expired ? "text-red-900" : "text-foreground"}`}>
                    {formatDate(alert.expiryDate)}
                    {alert.daysUntilExpiry < 0 && ` (${Math.abs(alert.daysUntilExpiry)} dni temu)`}
                  </span>
                </div>
              </div>
            </div>

            {expired && (
              <div className="mt-3 bg-red-100 rounded-lg p-2">
                <p className="text-xs text-red-900">
                  <strong>Wymagane działanie:</strong> Odnów badanie i dostarcz zaświadczenie do WPA, aby odblokować pozwolenie.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="pt-2 space-y-4">
        <div className="px-1">
          <div className="h-8 w-40 bg-muted animate-pulse rounded-lg mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        {[1, 2].map((i) => <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Alerty medyczne</h1>
        <p className="text-muted-foreground">Wygasające i wygasłe badania lekarskie na Twoich pozwoleniach</p>
      </div>

      {alerts.length === 0 ? (
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-12 text-center">
            {hasPermits ? (
              <>
                <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-30 text-emerald-600" />
                <p className="text-foreground font-semibold mb-1">Wszystko w porządku</p>
                <p className="text-muted-foreground text-sm">
                  Twoje badania są aktualne. Nowe daty po odnowieniu zaświadczeń wpisuje WPA.
                </p>
                <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate("/weapons")}>
                  <Shield className="h-4 w-4 mr-2" />Moje pozwolenia
                </Button>
              </>
            ) : (
              <>
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-30 text-primary" />
                <p className="text-foreground font-semibold mb-1">Brak badań w systemie</p>
                <p className="text-muted-foreground text-sm">
                  Jako citizen dodajesz daty badań podczas składania wniosku o pozwolenie. Po wydaniu pozwolenia będą widoczne tutaj.
                </p>
                <Button className="mt-4 rounded-xl" onClick={() => navigate("/application/new")}>
                  Nowy wniosek
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-muted/50 p-1">
            <TabsTrigger value="expiring" className="rounded-xl">
              Wygasające
              {expiringAlerts.length > 0 && (
                <Badge className="ml-2 bg-amber-500 hover:bg-amber-600 px-1.5 py-0 text-xs h-5 min-w-5">
                  {expiringAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="expired" className="rounded-xl">
              Wygasłe
              {expiredAlerts.length > 0 && (
                <Badge className="ml-2 bg-red-500 hover:bg-red-600 px-1.5 py-0 text-xs h-5 min-w-5">
                  {expiredAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expiring" className="space-y-3">
            {expiringAlerts.length === 0 ? (
              <Card className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-30 text-emerald-600" />
                  <p className="text-muted-foreground">Brak wygasających badań</p>
                </CardContent>
              </Card>
            ) : (
              expiringAlerts.map((a) => <AlertCard key={a.id} alert={a} />)
            )}
          </TabsContent>

          <TabsContent value="expired" className="space-y-3">
            {expiredAlerts.length === 0 ? (
              <Card className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-30 text-emerald-600" />
                  <p className="text-muted-foreground">Brak wygasłych badań</p>
                </CardContent>
              </Card>
            ) : (
              expiredAlerts.map((a) => <AlertCard key={a.id} alert={a} expired />)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
