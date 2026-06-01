import type { MedicalAlertType } from "../types/api";

export function getMedicalAlertTypeLabel(type: string) {
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
      return "Inny alert medyczny";
  }
}

export function isMedicalAlertExpired(type: string) {
  return type === "MedicalExamExpired" || type === "PsychologicalExamExpired";
}

export function getDaysUntilDueDate(dueDate: string | null | undefined) {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));
}

export function formatActiveMedicalAlertCount(count: number) {
  if (count === 1) return "1 alert medyczny";
  if (count >= 2 && count <= 4) return `${count} alerty medyczne`;
  return `${count} alertów medycznych`;
}

export function formatMedicalAlertDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export type MedicalAlertLike = {
  alertTypeName: string;
  alertType?: MedicalAlertType;
  dueDate?: string | null;
};
