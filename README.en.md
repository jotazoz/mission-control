# Mission Control — Hermes HQ

A local dashboard (Next.js 16) showing the real-time state of the Hermes Agent, reading directly from `~/.hermes` — no external database, no API, no deploy needed.

> ⚠️ Project lives in `~/mission-control` (outside Desktop) because macOS TCC blocks launchd processes from accessing `~/Desktop` — the LaunchAgent `com.mission-control.server` starts the server with the Mac. A symlink exists at `~/Desktop/projetos/mission-control` pointing here.

## 🚀 Live demo

**[mission-control.chuvadedados.com](https://mission-control.chuvadedados.com)** — public deployment (Vercel) with a **sanitized demo dataset** (no personal data). Perfect for portfolios/recruiters.

![Mission Control dashboard](public/screenshot-dashboard.png)

## What it shows

| Page | Content |
|---|---|
| `/` | Overview: active cron jobs ok/error, cost today/week/month, recent sessions, latest morning brief ☀️, upcoming runs, alerts |
| `/crons` | Jobs table + execution history with error counters |
| `/sessoes` | Sessions (carreira profile): source, estimated cost, tokens, model |
| `/custos` | Daily cost chart (14 days) + per-cron consumption bars |
| `/memoria` | MEMORY.md and USER.md editor (saves straight to the profile) |

## For recruiters — what this project demonstrates

1. **AI agent observability**: a control layer (crons, failures, costs, memory) around an autonomous agent system — the "mission control" most setups lack.
2. **Next.js 16 + App Router + Tailwind 4 + Recharts + lucide-react**: modern dashboard, server components, interactive charts.
3. **Dependency-free SQLite**: direct reads of databases and files via native `node:sqlite` (Node 22) — zero compile deps, lean architecture.
4. **Safe demo architecture**: the same code runs real data (local) or a sanitized dataset (Vercel) via `DEMO_MODE` — personal data never leaks.
5. **Real automation**: the dashboard monitors an agent running 13 real cron jobs (briefings, job pipeline, content curation) — not a fictional project.

**Stack**: Next.js 16.3 · React 19 · Tailwind 4 · Recharts · lucide-react · node:sqlite

## Data sources (all local, read-only except memory)

- `~/.hermes/cron/jobs.json` — cron definitions/status
- `~/.hermes/cron/executions.db` — execution history (SQLite)
- `~/.hermes/profiles/carreira/state.db` — sessions, costs, tokens (SQLite)
- `~/.hermes/cron/usage_audit.jsonl` — per-job consumption
- `~/.hermes/profiles/carreira/memories/MEMORY.md` + `USER.md` — memory (editable)

## Run locally

```bash
npm install
npm run dev        # http://localhost:3020 (real data from ~/.hermes)
DEMO_MODE=1 npm run dev   # sanitized demo dataset
npm run build      # production build
npm run start      # production on 3020
```

## Vercel deployment

- Connect the repo on Vercel (Git integration) — **zero env vars needed**
- Without `~/.hermes` in the environment, the app enters **demo mode automatically**
- Every `git push` to `main` redeploys

## Notes

- Cost is an **estimate**: USD × 5.4 (conversion approximation).
- The dashboard reads the `carreira` profile (`~/.hermes/profiles/carreira/`).
- No authentication — **run only on a local machine / trusted network**.
- `NEXT_TELEMETRY_DISABLED=1` in `.env.local` (avoids build hang).
