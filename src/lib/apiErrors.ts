/** User-facing message from API / fetch failures */
export function getApiErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;

  if (err instanceof TypeError) {
    return "Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.";
  }

  if (err instanceof Error) {
    return err.message || "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.";
  }

  if (typeof err === "object" && err !== null) {
    const body = err as { message?: string; title?: string; detail?: string; errors?: string[] };
    const parts = [body.message, body.title, body.detail].filter(Boolean);
    if (body.errors?.length) parts.push(...body.errors);
    if (parts.length > 0) return parts.join(" — ");
  }

  return "Nie udało się połączyć z serwerem. Spróbuj ponownie za chwilę.";
}
