/** Camera API requires a secure context (HTTPS or localhost). */
export function isSecureCameraContext(): boolean {
  return typeof window !== "undefined" && window.isSecureContext === true;
}

export const INSECURE_CONTEXT_MESSAGE =
  "Aparat wymaga bezpiecznego połączenia (HTTPS). Wpisz kod promesy ręcznie w zakładce „Kod QR”.";
