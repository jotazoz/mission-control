# Mission Control — Hermes HQ

Dashboard local (Next.js 16) que mostra o estado do Hermes Agent do Jp em tempo real, lendo direto do `~/.hermes` — sem banco externo, sem API, sem deploy.

## O que mostra

| Página | Conteúdo |
|---|---|
| `/` | Visão geral: crons ativos/ok/erro, custo hoje/semana/mês, sessões recentes, último briefing ☀️, próximas execuções, alertas |
| `/crons` | Tabela dos 13 jobs + histórico de execuções com contador de erros |
| `/sessoes` | Sessões do perfil carreira: fonte, custo estimado, tokens, modelo |
| `/custos` | Consumo por cron (usage_audit) com barras + custo por período |
| `/memoria` | Editor de MEMORY.md e USER.md (salva direto no perfil) |

## Fontes de dados (tudo local, read-only exceto memória)

- `~/.hermes/cron/jobs.json` — definições/status dos crons
- `~/.hermes/cron/executions.db` — histórico de execuções (SQLite)
- `~/.hermes/profiles/carreira/state.db` — sessões, custos, tokens (SQLite)
- `~/.hermes/cron/usage_audit.jsonl` — consumo por job
- `~/.hermes/profiles/carreira/memories/MEMORY.md` + `USER.md` — memória (editável)

## Rodar

```bash
npm run dev        # http://localhost:3020
npm run build      # valida produção
npm run start      # produção na 3020
```

Leitura dos `.db` via `node:sqlite` (Node 22+, nativo — sem dependências de compilação).

## Notas

- Custo é **estimativa**: USD × 5,4 (aproximação de conversão).
- O dashboard lê o perfil `carreira` (`~/.hermes/profiles/carreira/`).
- Sem autenticação — **só rode em máquina local / rede confiável**.
- `NEXT_TELEMETRY_DISABLED=1` no `.env.local` (evita hang do build).
