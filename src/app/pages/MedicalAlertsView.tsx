import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { AlertTriangle, CheckCircle, XCircle, Calendar } from "lucide-react";

export function MedicalAlertsView() {
  const [activeTab, setActiveTab] = useState("expiring");

  // Mock data - alerty medyczne
  const alerts = [
    {
      id: "alert-001",
      citizenName: "Jan Kowalski",
      citizenPesel: "********1234",
      permitNumber: "POZ-2025-001234",
      medicalAlertType: "PsychologicalExamExpiring",
      expiryDate: "2026-05-19",
      daysUntilExpiry: 7,
      isResolved: false,
    },
    {
      id: "alert-002",
      citizenName: "Anna Nowak",
      citizenPesel: "********5678",
      permitNumber: "POZ-2024-005678",
      medicalAlertType: "MedicalExamExpiring",
      expiryDate: "2026-05-26",
      daysUntilExpiry: 14,
      isResolved: false,
    },
    {
      id: "alert-003",
      citizenName: "Piotr Wiśniewski",
      citizenPesel: "********9012",
      permitNumber: "POZ-2023-009012",
      medicalAlertType: "MedicalExamExpired",
      expiryDate: "2026-05-10",
      daysUntilExpiry: -2,
      isResolved: false,
    },
  ];

  const expiringAlerts = alerts.filter((a) => !a.isResolved && a.daysUntilExpiry > 0);
  const expiredAlerts = alerts.filter((a) => !a.isResolved && a.daysUntilExpiry <= 0);

  const getAlertIcon = (type: string) => {
    if (type.includes("Expired")) {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
    return <AlertTriangle className="h-5 w-5 text-orange-500" />;
  };

  const getAlertBadge = (type: string, daysLeft: number) => {
    if (daysLeft <= 0) {
      return (
        <Badge variant="destructive" className="px-2 py-0.5 rounded-full">
          <XCircle className="h-3 w-3 mr-1" />
          Wygasło
        </Badge>
      );
    } else if (daysLeft <= 7) {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-none px-2 py-0.5 rounded-full">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Pilne ({daysLeft} dni)
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none px-2 py-0.5 rounded-full">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {daysLeft} dni
        </Badge>
      );
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case "MedicalExamExpiring":
        return "Badanie lekarskie wkrótce wygasa";
      case "PsychologicalExamExpiring":
        return "Badanie psychologiczne wkrótce wygasa";
      case "MedicalExamExpired":
        return "Badanie lekarskie wygasło";
      case "PsychologicalExamExpired":
        return "Badanie psychologiczne wygasło";
      default:
        return type;
    }
  };

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Alerty medyczne</h1>
        <p className="text-muted-foreground">
          Wygasające i wygasłe badania lekarskie i psychologiczne
        </p>
      </div>

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

        {/* Expiring Alerts */}
        <TabsContent value="expiring" className="space-y-3">
          {expiringAlerts.length === 0 ? (
            <Card className="rounded-2xl border-none shadow-sm">
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-30 text-emerald-600" />
                <p className="text-muted-foreground">Brak wygasających badań</p>
              </CardContent>
            </Card>
          ) : (
            expiringAlerts.map((alert) => (
              <Card
                key={alert.id}
                className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 p-2 rounded-xl shrink-0 mt-1">
                      {getAlertIcon(alert.medicalAlertType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-base">{alert.citizenName}</h3>
                        {getAlertBadge(alert.medicalAlertType, alert.daysUntilExpiry)}
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {getAlertTypeLabel(alert.medicalAlertType)}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground block">PESEL:</span>
                          <span className="font-mono text-foreground">{alert.citizenPesel}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Nr pozwolenia:</span>
                          <span className="font-mono text-foreground">{alert.permitNumber}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground block">Data wygaśnięcia:</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium text-foreground">{alert.expiryDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Expired Alerts */}
        <TabsContent value="expired" className="space-y-3">
          {expiredAlerts.length === 0 ? (
            <Card className="rounded-2xl border-none shadow-sm">
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-30 text-emerald-600" />
                <p className="text-muted-foreground">Brak wygasłych badań</p>
              </CardContent>
            </Card>
          ) : (
            expiredAlerts.map((alert) => (
              <Card
                key={alert.id}
                className="rounded-2xl border-none shadow-sm border-red-200 bg-red-50/30"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-xl shrink-0 mt-1">
                      {getAlertIcon(alert.medicalAlertType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-base text-red-900">{alert.citizenName}</h3>
                        {getAlertBadge(alert.medicalAlertType, alert.daysUntilExpiry)}
                      </div>

                      <p className="text-sm text-red-700 mb-3 font-medium">
                        {getAlertTypeLabel(alert.medicalAlertType)}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-red-600/70 block">PESEL:</span>
                          <span className="font-mono text-red-900">{alert.citizenPesel}</span>
                        </div>
                        <div>
                          <span className="text-red-600/70 block">Nr pozwolenia:</span>
                          <span className="font-mono text-red-900">{alert.permitNumber}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-red-600/70 block">Wygasło:</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Calendar className="h-3 w-3 text-red-600" />
                            <span className="font-medium text-red-900">
                              {alert.expiryDate} ({Math.abs(alert.daysUntilExpiry)} dni temu)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 bg-red-100 rounded-lg p-2">
                        <p className="text-xs text-red-900">
                          <strong>Wymagane działanie:</strong> Pozwolenie powinno zostać zawieszone do czasu przedłożenia aktualnych badań.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
