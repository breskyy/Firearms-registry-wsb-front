import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { CreditCard, FileText, Shield, ChevronRight } from "lucide-react";

export function ApplicationTypeSelect() {
  const navigate = useNavigate();

  const options = [
    {
      title: "Pozwolenie na broń",
      description: "Złóż wniosek o nowe pozwolenie na broń.",
      path: "/application/new-permit",
      icon: Shield,
      badge: "Pozwolenie",
      tone: "bg-blue-50 text-blue-700",
    },
    {
      title: "e-Promesa",
      description: "Złóż wniosek o promesę na zakup broni.",
      path: "/application/new-promise",
      icon: CreditCard,
      badge: "Zakup broni",
      tone: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="pt-2 space-y-6">
      <div className="px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
          Nowy wniosek
        </h1>
        <p className="text-muted-foreground">Wybierz typ sprawy, którą chcesz rozpocząć.</p>
      </div>

      <div className="space-y-3">
        {options.map(({ title, description, path, icon: Icon, badge, tone }) => (
          <Card
            key={path}
            className="rounded-2xl border-none shadow-sm hover:bg-muted/30 transition-colors cursor-pointer active:scale-[0.99]"
            onClick={() => navigate(path)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${tone}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold text-base text-foreground truncate">{title}</h2>
                    <Badge variant="secondary" className="rounded-full border-none px-2 py-0.5 shrink-0">
                      {badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-snug">{description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-none shadow-sm bg-muted/30">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="bg-background p-2 rounded-xl text-muted-foreground">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Masz już rozpoczętą sprawę?</p>
            <button
              type="button"
              onClick={() => navigate("/applications")}
              className="text-sm text-primary font-medium mt-1"
            >
              Przejdź do listy wniosków
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
