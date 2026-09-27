import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { CRON_DIR, isDemoMode, readJson } from "./data";

/* ------------------------------------------------------------------ */
/* Agente de e-mails do Jp                                             */
/* Lê os briefings que os 2 cron jobs de e-mail já geraram em          */
/* ~/.hermes/cron/output/<job_id>/<timestamp>.md                       */
/* ------------------------------------------------------------------ */

export const JOBS_EMAIL = [
  { turno: "manha" as const, id: "5a7011fa6cad", nome: "Briefing de e-mails", emoji: "☀️", hora: "09:00", cron: "0 9 * * *" },
  { turno: "tarde" as const, id: "6e8e22fb946b", nome: "Briefing de e-mails", emoji: "🌆", hora: "17:30", cron: "30 17 * * *" },
];

export type Turno = "manha" | "tarde";

export interface Briefing {
  turno: Turno;
  emoji: string;
  quando: number | null;
  quandoStr: string;
  arquivo: string;
  tamanho: number;
  markdown: string;
  resumo: string;
  acoes: string[];
}

export interface StatusJob {
  turno: Turno;
  emoji: string;
  nome: string;
  hora: string;
  enabled: boolean;
  lastStatus: string | null;
  lastRun: number | null;
  nextRun: number | null;
  totalBriefings: number;
}

const fmt = (iso: string) => {
  // nome do arquivo: 2026-09-27_10-15-25.md
  const m = iso.match(/(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})/);
  if (!m) return { quando: null as number | null, quandoStr: iso };
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}-03:00`);
  const quando = d.getTime();
  const quandoStr = d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return { quando, quandoStr };
};

/** Pega só o briefing de verdade (o arquivo também guarda a skill + o prompt). */
function extrairBriefing(txt: string): string {
  const linhas = txt.split("\n");
  let idx = -1;
  for (let i = linhas.length - 1; i >= 0; i--) {
    if (/^#\s*[☀🌆]\s*Briefing de e-mails/.test(linhas[i])) {
      idx = i;
      break;
    }
  }
  if (idx === -1) return "";
  // corta a linha final de instrução ("Me responde dizendo quais respostas...")
  const corpo = linhas.slice(idx);
  const fim = corpo.findIndex((l) => l.includes("Me responde dizendo quais respostas"));
  return (fim > 0 ? corpo.slice(0, fim) : corpo).join("\n").trim();
}

function extrairResumo(md: string): string {
  const linhas = md.split("\n");
  for (const l of linhas) {
    const t = l.trim();
    if (t.startsWith(">")) return t.replace(/^>\s*/, "").replace(/\*\*/g, "");
  }
  return "";
}

function extrairAcoes(md: string): string[] {
  const out: string[] = [];
  for (const l of md.split("\n")) {
    const m = l.match(/⚠️?\s*\*\*Ação:?\*\*\s*(.+)$/i);
    if (m && !/^(nenhuma|nada|aguardar)/i.test(m[1].trim())) {
      out.push(m[1].replace(/\*\*/g, "").trim());
    }
  }
  return out;
}

function lerBriefings(jobId: string, turno: Turno, emoji: string): Briefing[] {
  const dir = join(CRON_DIR, "output", jobId);
  if (!existsSync(dir)) return [];
  const arquivos = readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse()
    .slice(0, 40);
  const out: Briefing[] = [];
  for (const f of arquivos) {
    try {
      const txt = readFileSync(join(dir, f), "utf-8");
      const md = extrairBriefing(txt);
      if (!md) continue;
      const { quando, quandoStr } = fmt(f);
      out.push({
        turno,
        emoji,
        quando,
        quandoStr,
        arquivo: f,
        tamanho: txt.length,
        markdown: md,
        resumo: extrairResumo(md),
        acoes: extrairAcoes(md),
      });
    } catch {
      /* arquivo ilegível: ignora */
    }
  }
  return out;
}

export function getBriefings(): Briefing[] {
  if (isDemoMode()) return demoBriefings();
  const todos = [
    ...lerBriefings("5a7011fa6cad", "manha", "☀️"),
    ...lerBriefings("6e8e22fb946b", "tarde", "🌆"),
  ];
  return todos.sort((a, b) => (b.quando ?? 0) - (a.quando ?? 0));
}

export function getStatusJobs(): StatusJob[] {
  if (isDemoMode()) return demoStatus();
  const jobs: any = readJson(join(CRON_DIR, "jobs.json"));
  const lista: any[] = Array.isArray(jobs) ? jobs : jobs?.jobs ? Object.values(jobs.jobs) : [];
  return JOBS_EMAIL.map((j) => {
    const job = (lista as any[]).find?.((x) => x?.id === j.id);
    const dir = join(CRON_DIR, "output", j.id);
    const total = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".md")).length : 0;
    return {
      turno: j.turno,
      emoji: j.emoji,
      nome: j.nome,
      hora: j.hora,
      enabled: job?.enabled ?? true,
      lastStatus: job?.last_status ?? null,
      lastRun: job?.last_run_at ? Date.parse(job.last_run_at) : null,
      nextRun: job?.next_run_at ?? null,
      totalBriefings: total,
    };
  });
}

/* ----------------------------- demo ------------------------------- */

function demoBriefings(): Briefing[] {
  const base = new Date("2026-09-27T09:00:00-03:00").getTime();
  const md = `# ☀️ Briefing de e-mails — manhã (27/09)

> Resumo em 1 linha: 12 e-mails novos, 4 importantes. (exemplo)

## 🎯 Retorno de vagas / processos seletivos

**Recrutador exemplo — vaga de Analista de Dados** *(leu o corpo)*
- **De:** recrutador@empresa-exemplo.com — **Assunto:** Vamos conversar? — 🕐 26/09 19:01
- Convite para conversa inicial sobre vaga de dados.
- ⚠️ **Ação:** responder com janela de horários.

## 💰 Financeiro

**Assinatura exemplo**
- **Assunto:** sua fatura chegou — 🕐 26/09 12:00
- ⚠️ **Ação:** nenhuma.

## 📦 Outros / newsletters
- 5 newsletters/promoções (sem ação).`;
  return [
    {
      turno: "manha",
      emoji: "☀️",
      quando: base,
      quandoStr: "27/09/26 09:00",
      arquivo: "2026-09-27_09-00-00.md",
      tamanho: md.length,
      markdown: md,
      resumo: "12 e-mails novos, 4 importantes. (exemplo)",
      acoes: ["responder com janela de horários."],
    },
  ];
}

function demoStatus(): StatusJob[] {
  return JOBS_EMAIL.map((j) => ({
    turno: j.turno,
    emoji: j.emoji,
    nome: j.nome,
    hora: j.hora,
    enabled: true,
    lastStatus: "ok",
    lastRun: new Date("2026-09-27T09:00:00-03:00").getTime(),
    nextRun: new Date("2026-09-27T17:30:00-03:00").getTime(),
    totalBriefings: 49,
  }));
}
