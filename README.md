# e-Broń — Frontend

Frontend aplikacji do cyfrowej rejestracji i obsługi broni palnej.

## Stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS v4
- shadcn/ui + Radix UI
- React Router 7

## Wymagania

- Node.js 18+
- pnpm
- Backend EWeaponRegistry uruchomiony na `http://localhost:5000`

## Uruchomienie

```bash
# Zainstaluj zależności
pnpm install

# Uruchom serwer deweloperski
pnpm dev
```

Frontend dostępny pod: `http://localhost:5173`

## Zmienne środowiskowe

Skopiuj `.env.example` do `.env` i dostosuj jeśli backend działa pod innym adresem:

```bash
cp .env.example .env
```

Domyślnie frontend odpytuje `http://localhost:5000/api/v1`.

## Build produkcyjny

```bash
pnpm build
```

## Dane testowe

| Rola | Email | Hasło |
|------|-------|-------|
| Obywatel | citizen@example.com | Citizen123! |
| Oficer WPA | officer@example.com | Officer123! |
| Sklep | shop@example.com | Shop123! |
