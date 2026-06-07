# Raport błędów frontendu — e-Broń

**Ostatnia aktualizacja:** 2026-06-07  
**Status build:** `pnpm build` — OK (bez błędów blokujących)

## Znane / historyczne

| ID | Opis | Status | Data |
|----|------|--------|------|
| BUG-001 | Crash `ShopVerification.tsx` — brak importu `CardHeader` | **Naprawiono** — flow przeniesiony do `ShopSalePage` | 2026-05-29 |

## Ostrzeżenia niskiego priorytetu (nie blokujące)

- Vite: chunk główny > 500 kB — do optymalizacji w przyszłych iteracjach (code-splitting).
- MSW aktywne tylko w `import.meta.env.DEV` — na Vercel aplikacja korzysta z live API.

## Weryfikacja

```bash
pnpm build   # exit 0
```
