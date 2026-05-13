import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ArrowRightLeft, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function TransfersList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("incoming");

  // Mock data - transfery
  const transfers = [
    {
      id: "trf-001",
      transferNumber: "TRF-2026-00123",
      firearmBrand: "Glock",
      firearmModel: "17 Gen 5",
      firearmSerialNumber: "ABC123456",
      sellerId: "seller-001",
      sellerName: "Anna Nowak",
      buyerId: "buyer-001",
      buyerName: "Jan Kowalski",
      transferType: "Sale",
      status: "PendingAcceptance",
      initiatedDate: "2026-05-10",
      isSeller: false,
      isBuyer: true,
    },
    {
      id: "trf-002",
      transferNumber: "TRF-2026-00124",
      firearmBrand: "CZ",
      firearmModel: "75 SP-01",
      firearmSerialNumber: "XYZ789012",
      sellerId: "seller-002",
      sellerName: "Jan Kowalski",
      buyerId: "buyer-002",
      buyerName: "Piotr Wiśniewski",
      transferType: "Sale",
      status: "Accepted",
      initiatedDate: "2026-05-08",
      completedDate: "2026-05-09",
      isSeller: true,
      isBuyer: false,
    },
    {
      id: "trf-003",
      transferNumber: "TRF-2026-00125",
      firearmBrand: "Walther",
      firearmModel: "PPQ M2",
      firearmSerialNumber: "DEF456789",
      sellerId: "seller-003",
      sellerName: "Jan Kowalski",
      buyerId: "buyer-003",
      buyerName: "Maria Kowalczyk",
      transferType: "Donation",
      status: "Rejected",
      initiatedDate: "2026-05-05",
      rejectionReason: "Nie posiadam aktywnego pozwolenia",
      isSeller: true,
      isBuyer: false,
    },
  ];

  const incomingTransfers = transfers.filter((t) => t.isBuyer && t.status === "PendingAcceptance");
  const outgoingTransfers = transfers.filter((t) => t.isSeller);
  const completedTransfers = transfers.filter((t) => t.status === "Completed" || t.status === "Accepted");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PendingAcceptance":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none px-2 py-0.5 rounded-full">
            <Clock className="h-3 w-3 mr-1" />
            Oczekuje
          </Badge>
        );
      case "Accepted":
      case "Completed":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-2 py-0.5 rounded-full">
            <CheckCircle className="h-3 w-3 mr-1" />
            Zakończony
          </Badge>
        );
      case "Rejected":
        return (
          <Badge variant="destructive" className="px-2 py-0.5 rounded-full">
            <XCircle className="h-3 w-3 mr-1" />
            Odrzucony
          </Badge>
        );
      case "Cancelled":
        return (
          <Badge variant="secondary" className="px-2 py-0.5 rounded-full">
            Anulowany
          </Badge>
        );
      default:
        return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
    }
  };

  const getTransferTypeLabel = (type: string) => {
    switch (type) {
      case "Sale":
        return "Sprzedaż";
      case "Donation":
        return "Darowizna";
      case "Inheritance":
        return "Dziedziczenie";
      case "AdministrativeCorrection":
        return "Korekta administracyjna";
      default:
        return type;
    }
  };

  const handleAccept = (transferId: string, transferNumber: string) => {
    toast.success("Transfer zaakceptowany", {
      description: `Transfer ${transferNumber} został zaakceptowany. Broń zostanie przypisana do Twojego konta.`,
      duration: 5000,
    });
  };

  const handleReject = (transferId: string, transferNumber: string) => {
    toast.error("Transfer odrzucony", {
      description: `Transfer ${transferNumber} został odrzucony.`,
      duration: 5000,
    });
  };

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Transfery broni</h1>
        <p className="text-muted-foreground">Zarządzaj transferami między obywatelami</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-muted/50 p-1">
          <TabsTrigger value="incoming" className="rounded-xl">
            Przychodzące
            {incomingTransfers.length > 0 && (
              <Badge className="ml-2 bg-amber-500 hover:bg-amber-600 px-1.5 py-0 text-xs h-5 min-w-5">
                {incomingTransfers.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="rounded-xl">Wychodzące</TabsTrigger>
          <TabsTrigger value="completed" className="rounded-xl">Zakończone</TabsTrigger>
        </TabsList>

        {/* Incoming Transfers */}
        <TabsContent value="incoming" className="space-y-4">
          {incomingTransfers.length === 0 ? (
            <Card className="rounded-2xl border-none shadow-sm">
              <CardContent className="p-12 text-center">
                <ArrowRightLeft className="h-16 w-16 mx-auto mb-4 opacity-30 text-primary" />
                <p className="text-muted-foreground">Brak oczekujących transferów</p>
              </CardContent>
            </Card>
          ) : (
            incomingTransfers.map((transfer) => (
              <Card key={transfer.id} className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base">
                            {transfer.firearmBrand} {transfer.firearmModel}
                          </h3>
                          {getStatusBadge(transfer.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>
                            <span className="block">Nr transferu:</span>
                            <span className="font-mono text-foreground">{transfer.transferNumber}</span>
                          </div>
                          <div>
                            <span className="block">Nr seryjny:</span>
                            <span className="font-mono text-foreground">{transfer.firearmSerialNumber}</span>
                          </div>
                          <div>
                            <span className="block">Od:</span>
                            <span className="font-medium text-foreground">{transfer.sellerName}</span>
                          </div>
                          <div>
                            <span className="block">Typ:</span>
                            <span className="font-medium text-foreground">
                              {getTransferTypeLabel(transfer.transferType)}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="block">Data zgłoszenia:</span>
                            <span className="font-medium text-foreground">{transfer.initiatedDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {transfer.status === "PendingAcceptance" && transfer.isBuyer && (
                      <>
                        <div className="bg-amber-50 rounded-xl p-3 flex gap-3 items-start border border-amber-200">
                          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-900 leading-relaxed">
                            <strong>Wymagana akcja:</strong> Sprzedający zainicjował transfer tej broni na Twoje konto.
                            Sprawdź dane i zaakceptuj lub odrzuć transfer.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 rounded-xl min-h-[44px]"
                            onClick={() => handleReject(transfer.id, transfer.transferNumber)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Odrzuć
                          </Button>
                          <Button
                            className="flex-1 rounded-xl min-h-[44px]"
                            onClick={() => handleAccept(transfer.id, transfer.transferNumber)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Zaakceptuj
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Outgoing Transfers */}
        <TabsContent value="outgoing" className="space-y-4">
          {outgoingTransfers.length === 0 ? (
            <Card className="rounded-2xl border-none shadow-sm">
              <CardContent className="p-12 text-center">
                <ArrowRightLeft className="h-16 w-16 mx-auto mb-4 opacity-30 text-primary" />
                <p className="text-muted-foreground">Brak wychodzących transferów</p>
              </CardContent>
            </Card>
          ) : (
            outgoingTransfers.map((transfer) => (
              <Card key={transfer.id} className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-base">
                          {transfer.firearmBrand} {transfer.firearmModel}
                        </h3>
                        {getStatusBadge(transfer.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="block">Nr transferu:</span>
                          <span className="font-mono text-foreground">{transfer.transferNumber}</span>
                        </div>
                        <div>
                          <span className="block">Nr seryjny:</span>
                          <span className="font-mono text-foreground">{transfer.firearmSerialNumber}</span>
                        </div>
                        <div>
                          <span className="block">Do:</span>
                          <span className="font-medium text-foreground">{transfer.buyerName}</span>
                        </div>
                        <div>
                          <span className="block">Typ:</span>
                          <span className="font-medium text-foreground">
                            {getTransferTypeLabel(transfer.transferType)}
                          </span>
                        </div>
                        <div>
                          <span className="block">Data zgłoszenia:</span>
                          <span className="font-medium text-foreground">{transfer.initiatedDate}</span>
                        </div>
                        {transfer.completedDate && (
                          <div>
                            <span className="block">Data zakończenia:</span>
                            <span className="font-medium text-foreground">{transfer.completedDate}</span>
                          </div>
                        )}
                      </div>
                      {transfer.rejectionReason && (
                        <div className="mt-3 bg-red-50 rounded-lg p-2">
                          <p className="text-xs text-red-900">
                            <strong>Powód odrzucenia:</strong> {transfer.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Completed Transfers */}
        <TabsContent value="completed" className="space-y-4">
          {completedTransfers.length === 0 ? (
            <Card className="rounded-2xl border-none shadow-sm">
              <CardContent className="p-12 text-center">
                <ArrowRightLeft className="h-16 w-16 mx-auto mb-4 opacity-30 text-primary" />
                <p className="text-muted-foreground">Brak zakończonych transferów</p>
              </CardContent>
            </Card>
          ) : (
            completedTransfers.map((transfer) => (
              <Card key={transfer.id} className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-base">
                          {transfer.firearmBrand} {transfer.firearmModel}
                        </h3>
                        {getStatusBadge(transfer.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="block">Nr transferu:</span>
                          <span className="font-mono text-foreground">{transfer.transferNumber}</span>
                        </div>
                        <div>
                          <span className="block">Nr seryjny:</span>
                          <span className="font-mono text-foreground">{transfer.firearmSerialNumber}</span>
                        </div>
                        <div>
                          <span className="block">{transfer.isSeller ? "Do:" : "Od:"}</span>
                          <span className="font-medium text-foreground">
                            {transfer.isSeller ? transfer.buyerName : transfer.sellerName}
                          </span>
                        </div>
                        <div>
                          <span className="block">Typ:</span>
                          <span className="font-medium text-foreground">
                            {getTransferTypeLabel(transfer.transferType)}
                          </span>
                        </div>
                        <div>
                          <span className="block">Data zakończenia:</span>
                          <span className="font-medium text-foreground">{transfer.completedDate}</span>
                        </div>
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
