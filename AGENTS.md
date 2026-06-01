# AGENTS.md

## Cursor Cloud specific instructions

### Product scope

This repository is the **e-Broń frontend only** (React 18 + Vite 6 + TypeScript). The .NET 8 + PostgreSQL backend lives in a separate repo (`Firearms-registery-WSB`, see `README.md`). There is no `docker-compose` or backend code in this workspace.

### Install and refresh dependencies

Standard commands (also in `README.md` and `docs/development-guide.md`):

```bash
pnpm install
cp .env.example .env   # first time only; .env is gitignored
```

### Dev server

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Vite on http://localhost:5173 |
| `pnpm dev:host` | Vite bound to all interfaces (LAN testing) |
| `pnpm dev:mobile` | Vite `--mode mobile` + ngrok tunnel (needs `NGROK_AUTHTOKEN` in `.env` and backend on :5000) |
| `pnpm tunnel` | ngrok only |

**MSW (no backend):** MSW starts in dev unless `VITE_USE_MOCKS=false` (see `src/main.tsx`). For mock-only work, set `VITE_USE_MOCKS=true` in `.env` or run `VITE_USE_MOCKS=true pnpm dev`.

**Real API:** Run the backend from the external repo (`docker compose up -d` → http://localhost:5000/api/v1), set `VITE_USE_MOCKS=false`, then `pnpm dev`. Vite does not start the API.

### Build

```bash
pnpm build          # output: dist/
pnpm exec vite preview   # optional: serve dist/ locally (not a package.json script)
```

### Lint and tests

This repo has **no** ESLint, Prettier, Vitest, or Playwright scripts in `package.json`. Validation is manual; see checklists in `docs/development-guide.md`.

### Mock test accounts (MSW)

| Role | Email | Password |
|------|-------|----------|
| Citizen | `citizen@example.com` | `Citizen123!` |
| WPA officer | `officer@example.com` | `Officer123!` |
| Shop | `shop@example.com` | `Shop123!` |

Quick-login tiles appear when `VITE_SHOW_QUICK_LOGIN=true`.

### pnpm build scripts

If `pnpm install` warns about ignored build scripts (`esbuild`, `msw`, `@tailwindcss/oxide`) and `pnpm build` fails, allow those packages via `pnpm approve-builds` or `pnpm.onlyBuiltDependencies` in `package.json` (non-interactive policy preferred in CI/cloud).

### Long-running processes

Use **tmux** for `pnpm dev` and similar background servers so sessions survive across agent steps.
