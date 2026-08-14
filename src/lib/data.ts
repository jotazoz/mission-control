import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import os from "node:os";
import { cache } from "react";

export const HERMES_HOME = join(os.homedir(), ".hermes");
export const CRON_DIR = join(HERMES_HOME, "cron");
export const PROFILE_DIR = join(HERMES_HOME, "profiles", "carreira");

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function openDb(path: string): DatabaseSync {
  return new DatabaseSync(path, { readOnly: true });
}

export function readJson(path: string): any {
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

function parseDt(s: string | null | undefined): number | null {
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : t;
}

export function fmtTime(ts: number | null | undefined): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtHora(ts: number | null | undefined): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function fmtUsd(v: number | null | undefined): string {
  if (v == null) return "—";
  if (v === 0) return "R$ 0,00";
  return `R$ ${(v * 5.4).toFixed(2)}`; // ~conversão USD→BRL, estimativa
}

export function relTempo(ts: number | null | undefined): string {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min atrás`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h atrás`;
  return `${Math.round(h / 24)}d atrás`;
}

/* ------------------------------------------------------------------ */
/* crons (jobs.json + executions.db)                                  */
/* ------------------------------------------------------------------ */

export interface CronJob {
  id: string;
  nome: string;
  schedule: string;
  enabled: boolean;
  state: string;
  no_agent: boolean;
  deliver: string;
  last_run_at: number | null;
  last_status: string | null;
  last_error: string | null;
  last_delivery_error: string | null;
  next_run_at: number | null;
}

export const getJobs = cache((): CronJob[] => {
  const data = readJson(join(CRON_DIR, "jobs.json"));
  if (!data) return [];
  const jobs = Array.isArray(data) ? data : data.jobs ?? [];
  return jobs.map((j: any) => ({
    id: j.id ?? j.job_id ?? "?",
    nome: j.name ?? "?",
    schedule: typeof j.schedule === "object" ? j.schedule.display ?? j.schedule.expr ?? "" : String(j.schedule ?? ""),
    enabled: j.enabled !== false,
    state: j.state ?? "scheduled",
    no_agent: !!j.no_agent,
    deliver: j.deliver ?? "origin",
    last_run_at: parseDt(j.last_run_at),
    last_status: j.last_status ?? null,
    last_error: j.last_error ?? null,
    last_delivery_error: j.last_delivery_error ?? null,
    next_run_at: parseDt(j.next_run_at),
  }));
});

export interface Execucao {
  job_id: string;
  status: string;
  claimed_at: number | null;
  finished_at: number | null;
  error: string | null;
}

export const getExecucoes = cache((limite = 200): Execucao[] => {
  const dbPath = join(CRON_DIR, "executions.db");
  if (!existsSync(dbPath)) return [];
  try {
    const db = openDb(dbPath);
    const rows = db
      .prepare(
        "SELECT job_id, status, claimed_at, finished_at, error FROM executions ORDER BY claimed_at DESC LIMIT ?"
      )
      .all(limite) as any[];
    db.close();
    return rows.map((r) => ({
      job_id: r.job_id,
      status: r.status,
      claimed_at: parseDt(r.claimed_at),
      finished_at: parseDt(r.finished_at),
      error: r.error ?? null,
    }));
  } catch {
    return [];
  }
});

/* ------------------------------------------------------------------ */
/* sessions (state.db do perfil carreira)                             */
/* ------------------------------------------------------------------ */

export interface Sessao {
  id: string;
  titulo: string;
  fonte: string;
  started_at: number | null;
  ended_at: number | null;
  custo: number | null;
  input_tokens: number | null;
  output_tokens: number | null;
  modelo: string | null;
  mensagens: number | null;
  api_calls: number | null;
}

function stateDbPath(): string {
  const p = join(PROFILE_DIR, "state.db");
  return existsSync(p) ? p : join(HERMES_HOME, "state.db");
}

export const getSessoes = cache((limite = 50): Sessao[] => {
  try {
    const db = openDb(stateDbPath());
    const rows = db
      .prepare(
        `SELECT id, title, source, started_at, ended_at, estimated_cost_usd,
                input_tokens, output_tokens, model, message_count, api_call_count
         FROM sessions
         WHERE archived = 0 AND title IS NOT NULL AND title != ''
         ORDER BY started_at DESC LIMIT ?`
      )
      .all(limite) as any[];
    db.close();
    return rows.map((r) => ({
      id: r.id,
      titulo: r.title ?? "(sem título)",
      fonte: r.source ?? "?",
      started_at: r.started_at ? Math.round(r.started_at * 1000) : null,
      ended_at: r.ended_at ? Math.round(r.ended_at * 1000) : null,
      custo: r.estimated_cost_usd ?? null,
      input_tokens: r.input_tokens ?? null,
      output_tokens: r.output_tokens ?? null,
      modelo: r.model ?? null,
      mensagens: r.message_count ?? null,
      api_calls: r.api_call_count ?? null,
    }));
  } catch {
    return [];
  }
});

export const getCustoTotal = cache((): { mes: number; semana: number; dia: number } => {
  const sess = getSessoes(5000);
  const now = Date.now();
  const mes = new Date();
  mes.setDate(1);
  mes.setHours(0, 0, 0, 0);
  const semana = now - 7 * 86400_000;
  const dia = now - 86400_000;
  let m = 0, s = 0, d = 0;
  for (const x of sess) {
    if (!x.started_at || !x.custo) continue;
    if (x.started_at >= mes.getTime()) m += x.custo;
    if (x.started_at >= semana) s += x.custo;
    if (x.started_at >= dia) d += x.custo;
  }
  return { mes: m, semana: s, dia: d };
});

/* ------------------------------------------------------------------ */
/* custos por job (usage_audit.jsonl)                                 */
/* ------------------------------------------------------------------ */

export interface UsoJob {
  job_id: string;
  nome: string;
  runs: number;
  total_tokens: number;
  model: string;
  ultimo: number | null;
  erro: boolean;
}

export const getUsoPorJob = cache((): UsoJob[] => {
  const path = join(CRON_DIR, "usage_audit.jsonl");
  if (!existsSync(path)) return [];
  const linhas = readFileSync(path, "utf-8").split("\n").filter(Boolean);
  const jobs = getJobs();
  const porJob = new Map<string, any>();
  // últimas 1000 linhas (auditoria pode ser grande)
  for (const linha of linhas.slice(-1000)) {
    try {
      const e = JSON.parse(linha);
      const k = e.job_id ?? "?";
      if (!porJob.has(k)) {
        porJob.set(k, { job_id: k, runs: 0, total_tokens: 0, model: e.model, ultimo: null, erro: false });
      }
      const rec = porJob.get(k)!;
      rec.runs += 1;
      rec.total_tokens += e.total_tokens ?? 0;
      rec.model = e.model ?? rec.model;
      rec.ultimo = Math.max(rec.ultimo ?? 0, parseDt(e.ts) ?? 0);
      if (e.error) rec.erro = true;
    } catch {
      /* linha malformada — ignora */
    }
  }
  const nomeDe = (jid: string) => jobs.find((j) => j.id === jid)?.nome ?? jid;
  return [...porJob.values()]
    .map((u) => ({ ...u, nome: nomeDe(u.job_id) }))
    .sort((a, b) => b.total_tokens - a.total_tokens);
});

/* ------------------------------------------------------------------ */
/* memória (MEMORY.md / USER.md do perfil)                            */
/* ------------------------------------------------------------------ */

export interface Memoria {
  arquivo: string;
  titulo: string;
  conteudo: string;
  mtime: number;
  mtime_str: string;
  tamanho: number;
}

export const getMemorias = cache((): Memoria[] => {
  const dir = join(PROFILE_DIR, "memories");
  if (!existsSync(dir)) return [];
  const out: Memoria[] = [];
  for (const f of ["MEMORY.md", "USER.md"]) {
    const p = join(dir, f);
    if (!existsSync(p)) continue;
    const st = statSync(p);
    out.push({
      arquivo: f,
      titulo: f === "MEMORY.md" ? "Memória do agente (MEMORY.md)" : "Perfil do usuário (USER.md)",
      conteudo: readFileSync(p, "utf-8"),
      mtime: st.mtimeMs,
      mtime_str: new Date(st.mtimeMs).toLocaleString("pt-BR"),
      tamanho: st.size,
    });
  }
  return out;
});

export function salvarMemoria(arquivo: string, conteudo: string): { ok: boolean; erro?: string } {
  if (!["MEMORY.md", "USER.md"].includes(arquivo)) return { ok: false, erro: "arquivo inválido" };
  try {
    writeFileSync(join(PROFILE_DIR, "memories", arquivo), conteudo, "utf-8");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, erro: String(e?.message ?? e) };
  }
}

/* ------------------------------------------------------------------ */
/* último briefing de sistema (output do cron)                        */
/* ------------------------------------------------------------------ */

export const getUltimoBriefing = cache((): { texto: string; quando: number | null } | null => {
  const dir = join(CRON_DIR, "output", "cdc5683c3d01");
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse();
  if (files.length === 0) return null;
  const p = join(dir, files[0]);
  const texto = readFileSync(p, "utf-8");
  // extrai só a parte após "## Response" (a resposta do agente)
  const idx = texto.indexOf("## Response");
  return {
    texto: idx >= 0 ? texto.slice(idx + "## Response".length).trim() : texto.slice(0, 2000),
    quando: statSync(p).mtimeMs,
  };
});
