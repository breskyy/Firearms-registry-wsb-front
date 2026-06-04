import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { EmptyStateCard } from "../components/EmptyStateCard";
import { Tabs, TabsContent } from "../components/ui/tabs";
import { AppTabsList } from "../components/ui/AppTabsList";
import { AppTabTrigger } from "../components/ui/AppTabTrigger";
import { CheckCircle, ChevronRight, Shield, ClipboardList, AlertTriangle, FileUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { cn } from "../components/ui/utils";
import { CitizenNavIconTile } from "../components/citizen/CitizenNavIconTile";
import { PermitExamStatusRow } from "../components/citizen/PermitExamStatusRow";
import {
  CITIZEN_LIST_CARD_CLASS,
  CITIZEN_LIST_CARD_CONTENT_CLASS,
  CITIZEN_TILE_SUBTITLE_CLASS,
} from "../utils/citizenCardUi";
import { useNavigate } from "react-router";
import { citizenService } from "../../services/citizenService";
import type { CitizenMedicalAlertDto, PermitDto, PermitMedicalExamRenewalDto } from "../../types/api";
import { findPendingRenewal, renewalStatusLabel } from "../../lib/medicalExamRenewals";
import {
  filterPermitGroupsNeedingAttention,
  groupEntriesByPermit,
  mapPermitExamEntries,
  needsExamAttention,
  sortPermitGroupsByAttentionPriority,
  worstExamStatus,
  type PermitExamGroup,
} from "../../lib/permitExams";

const PERMIT_TYPE_LABELS: Record<string, string> = {
  Sport: "Sportowe",
  Hunting: "Łowieckie",
  Collection: "Kolekcjonerskie",
  Protection: "Ochrony osobistej",
  Other: "Inne",
};

export function MedicalAlertsView() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<CitizenMedicalAlertDto[]>([]);
  const [permits, setPermits] = useState<PermitDto[]>([]);
  const [renewals, setRenewals] = useState<PermitMedicalExamRenewalDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    Promise.all([
      citizenService.getMedicalAlerts(),
      citizenService.getPermits(),
      citizenService.getMedicalExamRenewals(),
    ])
      .then(([alertsRes, permitsRes, renewalsRes]) => {
        setAlerts(alertsRes);
        setPermits(permitsRes);
        setRenewals(renewalsRes);
      })
      .catch(() => {
        setAlerts([]);
        setPermits([]);
        setRenewals([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const examEntries = useMemo(() => mapPermitExamEntries(permits, alerts), [permits, alerts]);
  const allGroups = useMemo(() => groupEntriesByPermit(examEntries), [examEntries]);
  const attentionGroups = useMemo(
    () => sortPermitGroupsByAttentionPriority(filterPermitGroupsNeedingAttention(allGroups)),
    [allGroups],
  );
  const activePermits = permits.filter((permit) => permit.statusName === "Active");

  const PermitExamGroupCard = ({ group }: { group: PermitExamGroup }) => {
    const permitType = PERMIT_TYPE_LABELS[group.permitTypeName] ?? group.permitTypeName;
    const tone = worstExamStatus(group.exams);
    const pending = findPendingRenewal(renewals, group.permitId);
    const showRenewalCta = needsExamAttention(tone) && !pending;

    return (
      <Card className={cn(CITIZEN_LIST_CARD_CLASS, "bg-card overflow-hidden")}>
        <CardContent className={CITIZEN_LIST_CARD_CONTENT_CLASS}>
          <button
            type="button"
            className="flex w-full items-center gap-3 text-left rounded-xl -m-1 p-1 active:scale-[0.99]"
            onClick={() => navigate(`/permits/${group.permitId}`)}
          >
            <CitizenNavIconTile>
              <Shield />
            </CitizenNavIconTile>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Pozwolenie</p>
              <h3 className="font-semibold text-sm leading-snug text-foreground font-mono">{group.permitNumber}</h3>
              <p className={cn(CITIZEN_TILE_SUBTITLE_CLASS, "mt-0.5")}>{permitType}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground self-center" aria-hidden />
          </button>

          <div className="mt-3 pt-3 border-t border-border/80 divide-y divide-border/80">
            {group.exams.map((entry) => (
              <PermitExamStatusRow
                key={entry.id}
                entry={entry}
                pendingRenewalLabel={pending ? renewalStatusLabel(pending.status) : null}
              />
            ))}
          </div>

          {pending && (
            <p className="text-xs text-muted-foreground bg-muted/40 border border-border/80 rounded-xl p-2.5 mt-3 leading-relaxed">
              <span className="font-medium text-foreground">Zgłoszenie wysłane:</span>{" "}
              {renewalStatusLabel(pending.status)}. Nie możesz złożyć drugiego odnowienia do czasu decyzji WPA.
            </p>
          )}
          {showRenewalCta && (
            <Button
              className="w-full mt-3 min-h-[44px] rounded-xl"
              onClick={() => navigate(`/permits/${group.permitId}/renew-exams`)}
            >
              <FileUp className="h-4 w-4 mr-2" aria-hidden />
              Złóż odnowienie badań
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderGroups = (groups: PermitExamGroup[]) =>
    groups.map((group) => <PermitExamGroupCard key={group.permitId} group={group} />);

  if (loading) {
    return (
      <div className="pt-2 space-y-4">
        <div className="px-1">
          <div className="h-8 w-40 bg-muted animate-pulse rounded-lg mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-1">Badania medyczne</h1>
        <p className="text-muted-foreground">
          Wszystkie badania lekarskie i psychologiczne powiązane z aktywnymi pozwoleniami
        </p>
      </div>

      {activePermits.length === 0 ? (
        <EmptyStateCard
          icon={CheckCircle}
          iconClassName="text-emerald-600"
          title="Brak aktywnych pozwoleń"
          description="Gdy pozwolenie zostanie aktywowane, badania pojawią się automatycznie w tym widoku."
          emphasizeTitle
          action={{
            label: "Moje pozwolenia",
            variant: "outline",
            onClick: () => navigate("/weapons"),
            icon: <Shield className="h-4 w-4 mr-2" aria-hidden />,
          }}
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <AppTabsList className="grid grid-cols-2">
            <AppTabTrigger value="all" label="Wszystkie" icon={ClipboardList} count={allGroups.length} />
            <AppTabTrigger value="attention" label="Wymaga uwagi" icon={AlertTriangle} count={attentionGroups.length} />
          </AppTabsList>

          <TabsContent value="all" className="space-y-3">
            {allGroups.length === 0 ? (
              <EmptyStateCard
                icon={CheckCircle}
                iconClassName="text-emerald-600"
                title="Brak danych o badaniach dla aktywnych pozwoleń"
              />
            ) : (
              renderGroups(allGroups)
            )}
          </TabsContent>

          <TabsContent value="attention" className="space-y-3">
            {attentionGroups.length === 0 ? (
              <EmptyStateCard
                icon={CheckCircle}
                iconClassName="text-emerald-600"
                title="Wszystko aktualne"
                description="Żadne badanie nie wygasa, nie wygasło ani nie ma brakującej daty w rejestrze."
                emphasizeTitle
              />
            ) : (
              renderGroups(attentionGroups)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
