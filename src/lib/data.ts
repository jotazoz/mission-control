import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import os from "node:os";
import { cache } from "react";

export const HERMES_HOME = join(os.homedir(), ".hermes");
export const CRON_DIR = join(HERMES_HOME, "cron");
export const PROFILE_DIR = join(HERMES_HOME, "profiles", "carreira");

/** Modo demo: força dataset sanitizado mesmo com arquivos locais presentes.
 *  Na Vercel (sem ~/.hermes) o fallback acontece automaticamente. */
export const DEMO_MODE = process.env.DEMO_MODE === "1" || process.env.NEXT_PUBLIC_DEMO_MODE === "1";

function temDadosLocais(): boolean {
  return existsSync(join(CRON_DIR, "jobs.json"));
}

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
  if (DEMO_MODE || !temDadosLocais()) return demoJobs();
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
  if (DEMO_MODE || !temDadosLocais()) return demoExecucoes();
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
  if (DEMO_MODE || !temDadosLocais()) return demoSessoes();
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

/** Série de custo por dia (últimos 14 dias) — para o gráfico. */
export const getCustoSerie = cache((): { dia: string; custo: number }[] => {
  if (DEMO_MODE || !temDadosLocais()) return demoCustoSerie();
  const sess = getSessoes(5000);
  const dias: { dia: string; custo: number }[] = [];
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  for (let i = 13; i >= 0; i--) {
    const d = new Date(hoje.getTime() - i * 86400_000);
    dias.push({
      dia: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      custo: 0,
    });
  }
  for (const x of sess) {
    if (!x.started_at || !x.custo) continue;
    const d = new Date(x.started_at);
    d.setHours(0, 0, 0, 0);
    const idx = dias.findIndex((dd) => dd.dia === d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }));
    if (idx >= 0) dias[idx].custo += x.custo;
  }
  return dias;
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
  if (DEMO_MODE || !temDadosLocais()) return demoUsoPorJob();
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
  if (DEMO_MODE || !temDadosLocais()) return demoMemorias();
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
  if (DEMO_MODE || !temDadosLocais()) return { ok: false, erro: "modo demo — sem escrita local" };
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
  if (DEMO_MODE || !temDadosLocais()) return demoBriefing();
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

/* ------------------------------------------------------------------ */
/* dataset demo (sanitizado) — usado na Vercel ou com DEMO_MODE=1     */
/* ------------------------------------------------------------------ */

const AGORA = Date.now();
const H = 3600_000;
const D = 24 * H;

function demoJobs(): CronJob[] {
  const mk = (
    id: string, nome: string, schedule: string, lastStatus: string | null,
    lastOffset: number | null, nextOffset: number, noAgent = false
  ): CronJob => ({
    id, nome, schedule, enabled: true, state: "scheduled", no_agent: noAgent,
    deliver: "telegram:demo",
    last_run_at: lastOffset != null ? AGORA - lastOffset : null,
    last_status: lastStatus,
    last_error: null,
    last_delivery_error: null,
    next_run_at: AGORA + nextOffset,
  });
  return [
    mk("job-morning-brief", "Briefing de sistema ☀️", "15 8 * * *", "ok", 26 * H, 22 * H),
    mk("job-email", "Briefing de e-mails", "0 9 * * *", "ok", 3 * H, 9 * H),
    mk("job-vagas", "Pipeline de vagas diário", "30 7 * * 1-5", "ok", 30 * H, 26 * H),
    mk("job-sync", "Sincronização de vagas (planilha)", "0 8 * * *", "ok", 30 * H, 10 * H),
    mk("job-content", "Curadoria de pautas (conteúdo)", "0 8 * * *", "ok", 30 * H, 10 * H),
    mk("job-watchdog", "Watchdog de automações", "*/30 * * * *", "ok", 0.2 * H, 0.3 * H, true),
    mk("job-client", "Monitoramento de clientes", "0 9,15 * * 1-5", "ok", 4 * H, 5 * H),
    mk("job-resumo", "Resumo semanal (Notion)", "0 18 * * 0", "ok", 4 * D, 3 * D),
    mk("job-panorama", "Edição semanal do jornal", "0 18 * * 0", "error", 1 * D, 6 * D),
    mk("job-pesquisa", "Pesquisa de mercado semanal", "0 10 * * 1", "ok", 3 * D, 4 * D),
    mk("job-estudo", "Lembrete de estudo", "0 9 * * 6", null, null, 2 * D),
    mk("job-curriculo", "Lembrete currículo EN", "0 10 * * 6", null, null, 2 * D),
  ];
}

function demoExecucoes(): Execucao[] {
  const jobs = demoJobs();
  const out: Execucao[] = [];
  // watchdog a cada 30min nas últimas 8h
  for (let i = 0; i < 16; i++) {
    const t = AGORA - i * 0.5 * H;
    out.push({ job_id: "job-watchdog", status: "completed", claimed_at: t, finished_at: t + 3000, error: null });
  }
  const recentes: Array<[string, string, number]> = [
    ["job-email", "completed", 3 * H], ["job-content", "completed", 30 * H],
    ["job-sync", "completed", 30 * H], ["job-vagas", "completed", 30 * H],
    ["job-client", "completed", 4 * H], ["job-resumo", "completed", 4 * D],
    ["job-panorama", "error", 1 * D],
  ];
  for (const [jid, status, offset] of recentes) {
    const t = AGORA - offset;
    out.push({
      job_id: jid, status, claimed_at: t, finished_at: t + 30 * 60_000,
      error: status === "error" ? "TimeoutError: Cron job idle for 1800s — waiting for non-streaming API response" : null,
    });
  }
  return out.sort((a, b) => (b.claimed_at ?? 0) - (a.claimed_at ?? 0));
}

function demoSessoes(): Sessao[] {
  const mk = (id: string, titulo: string, fonte: string, horas: number, custo: number, tin: number, tout: number, msgs: number, calls: number): Sessao => ({
    id, titulo, fonte,
    started_at: AGORA - horas * H, ended_at: AGORA - horas * H + 20 * 60_000,
    custo, input_tokens: tin, output_tokens: tout, modelo: "claude-sonnet-4-5",
    mensagens: msgs, api_calls: calls,
  });
  return [
    mk("s1", "Planejamento semanal de conteúdo", "desktop", 2, 0.42, 240_000, 38_000, 87, 41),
    mk("s2", "Análise de concorrentes (YouTube)", "desktop", 6, 0.31, 180_000, 25_000, 64, 30),
    mk("s3", "Briefing de sistema ☀️", "cron", 26, 0.002, 1_300, 1_400, 2, 1),
    mk("s4", "Resposta a recrutador", "telegram", 30, 0.09, 60_000, 9_000, 24, 11),
    mk("s5", "Automação de pipeline de vagas", "desktop", 50, 0.88, 520_000, 120_000, 210, 98),
    mk("s6", "Revisão de dashboard de clientes", "desktop", 75, 0.27, 150_000, 21_000, 55, 26),
    mk("s7", "Relatório financeiro mensal", "desktop", 100, 0.55, 300_000, 60_000, 130, 62),
    mk("s8", "Pesquisa de mercado (freelance)", "desktop", 140, 0.38, 210_000, 33_000, 90, 42),
    mk("s9", "Edição do Panorama", "cron", 170, 0.15, 90_000, 15_000, 40, 19),
    mk("s10", "Dúvidas de BI do time", "telegram", 200, 0.11, 70_000, 12_000, 30, 14),
    mk("s11", "Curadoria NYT diária", "cron", 250, 0.08, 45_000, 8_000, 18, 8),
    mk("s12", "Estudo AI Automation (LangGraph)", "desktop", 300, 0.19, 120_000, 18_000, 48, 22),
  ];
}

function demoCustoSerie(): { dia: string; custo: number }[] {
  // padrão realista: picos nos dias de semana (crons de trabalho), vales no fim de semana
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const pesos = [0.22, 0.9, 1.15, 0.75, 1.3, 0.95, 0.45, 0.18, 0.85, 1.05, 0.6, 1.2, 0.8, 0.35];
  return pesos.map((p, i) => {
    const d = new Date(hoje.getTime() - (13 - i) * 86400_000);
    return {
      dia: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      custo: Math.round(p * 100) / 100,
    };
  });
}

function demoUsoPorJob(): UsoJob[] {
  const mk = (job_id: string, nome: string, runs: number, tokens: number, ultimoH: number, erro = false): UsoJob => ({
    job_id, nome, runs, total_tokens: tokens, model: "claude-sonnet-4-5", ultimo: AGORA - ultimoH * H, erro,
  });
  return [
    mk("job-vagas", "Pipeline de vagas diário", 18, 3_200_000, 30),
    mk("job-sync", "Sincronização de vagas (planilha)", 18, 2_400_000, 30),
    mk("job-content", "Curadoria de pautas (conteúdo)", 14, 1_800_000, 30),
    mk("job-client", "Monitoramento de clientes", 26, 1_200_000, 4),
    mk("job-email", "Briefing de e-mails", 18, 900_000, 3),
    mk("job-pesquisa", "Pesquisa de mercado semanal", 4, 700_000, 100),
    mk("job-resumo", "Resumo semanal (Notion)", 4, 450_000, 100, true),
    mk("job-panorama", "Edição semanal do jornal", 4, 300_000, 30, true),
    mk("job-morning-brief", "Briefing de sistema ☀️", 18, 60_000, 26),
  ];
}

function demoMemorias(): Memoria[] {
  return [
    {
      arquivo: "MEMORY.md",
      titulo: "Memória do agente (MEMORY.md)",
      conteudo:
        "Prefere relatórios executivos: 1 página, números primeiro, ação no final. §\n" +
        "Canal de conteúdo: produção semanal (YouTube + newsletter), pipeline em planilha compartilhada. §\n" +
        "Crons críticos: briefing matinal 8h15 (Telegram), pipeline de vagas 7h30 seg-sex, watchdog a cada 30min. §\n" +
        "Lição: dashboards só mostram o que ajuda a decidir — se não responde 'o que faço agora?', cortar. §\n" +
        "Provedor principal com timeout de 240s + fallback automático para evitar hang de crons.",
      mtime: AGORA - 2 * D,
      mtime_str: new Date(AGORA - 2 * D).toLocaleString("pt-BR"),
      tamanho: 640,
    },
    {
      arquivo: "USER.md",
      titulo: "Perfil do usuário (USER.md)",
      conteudo:
        "Responde em português brasileiro. §\n" +
        "Analista de dados em transição para AI Automation Specialist. §\n" +
        "Prefere revisar antes de qualquer ação irreversível — aprovação explícita sempre. §\n" +
        "Inglês avançado, aberto a oportunidades remotas e internacionais. §\n" +
        "Manhãs são sagradas para foco; briefing deve caber em 30 segundos.",
      mtime: AGORA - 1 * D,
      mtime_str: new Date(AGORA - 1 * D).toLocaleString("pt-BR"),
      tamanho: 410,
    },
  ];
}

function demoBriefing() {
  return {
    texto:
      "# ☀️ Briefing de sistema — demo\n" +
      "> Tudo ok: 12 automações rodaram, 0 erros nas últimas 24h.\n\n" +
      "## ⚙️ Automações (últimas 24h)\n" +
      "✅ Todas as 12 automações rodaram sem erro — briefings, pipeline de vagas, monitoramento de clientes e watchdog.\n\n" +
      "## 📅 Hoje\n" +
      "- 🛡️ Watchdog de automações — a cada 30min\n" +
      "- 🌆 Briefing de e-mails — 17:30\n\n" +
      "## 🎯 Próxima ação\n" +
      "Nada urgente — sistema 100% saudável; foco do dia: o pipeline de conteúdo.",
    quando: AGORA - 26 * H,
  };
}
