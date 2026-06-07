import { Clock, CreditCard, FileText, HeartPulse, QrCode, ShoppingBag } from "lucide-react";
import type { ApplicationProcessStep } from "../../components/citizen/ApplicationProcessNotice";

export const PERMIT_APPLICATION_PROCESS_STEPS: ApplicationProcessStep[] = [
  {
    icon: CreditCard,
    text: "Po złożeniu wniosku uiszcz opłatę skarbową 242 zł (mock ePłatności lub dowód wpłaty)",
  },
  {
    icon: Clock,
    text: "Urząd rozpatrzy wniosek w ciągu 30 dni roboczych",
  },
  {
    icon: HeartPulse,
    text: "Zaświadczenia zostaną zweryfikowane — daty ważności pojawią się w zakładce Badania",
  },
  {
    icon: FileText,
    text: "Status sprawdzisz w Moje wnioski",
  },
];

export const PROMISE_APPLICATION_PROCESS_STEPS: ApplicationProcessStep[] = [
  {
    icon: CreditCard,
    text: "Opłata 17 zł za zaświadczenie — mock ePłatności lub prześlij dowód wpłaty",
  },
  {
    icon: Clock,
    text: "Urząd rozpatrzy wniosek w ciągu 14 dni roboczych",
  },
  {
    icon: QrCode,
    text: "Po zatwierdzeniu otrzymasz e-Promesę z kodem QR",
  },
  {
    icon: ShoppingBag,
    text: "Promesa będzie ważna 6 miesięcy — kod pokaż w sklepie przy zakupie",
  },
  {
    icon: FileText,
    text: "Status sprawdzisz w Moje wnioski",
  },
];
