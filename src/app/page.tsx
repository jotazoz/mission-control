import {
  getJobs,
  getExecucoes,
  getSessoes,
  getCustoTotal,
  getUltimoBriefing,
  fmtTime,
  fmtHora,
  fmtUsd,
  relTempo,
} from "@/lib/data";
import { Bot, Wallet, MessageSquare, AlertTriangle, Sun, CalendarClock, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

function BadgeStatus({ status }: { status: string | null }) {
  if (status === "ok") return <span className="badge-ok">ok</span>;
  if (status === "error") return <span className="badge-erro">erro</span>;
  return <span className="badge-off">nunca</span>;
}

export default function Home() {
  const jobs = getJobs();
  const execs = getExecucoes(60);
  const sessoes = getSessoes(15);
  const custo = getCustoTotal();
  const briefing = getUltimoBriefing();

  const ativos = jobs.filter((j) => j.enabled && j.state !== "paused");
  const comErro = ativos.filter((j) => j.last_status === "error" || j.last_delivery_error);
  const ok = ativos.filter((j) => j.last_status === "ok").length;
  const nunca = ativos.filter((j) => !j.last_status);
  const execErros = execs.filter((e) => e.status === "error" || e.status === "failed");
  const agora = Date.now();
  const proximos = ativos
    .filter((j) => j.next_run_at && j.next_run_at > agora)
    .sort((a, b) => (a.next_run_at ?? 0) - (b.next_run_at ?? 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-100">Visão geral</h1>
        <p className="text-sm text-slate-500">
          Estado do sistema em {new Date().toLocaleString("pt-BR")} — dados lidos do ~/.hermes
        </p>
      </header>

      {/* linha de stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="card">
          <div className="mb-1 flex items-center gap-1.5"><Bot className="h-3.5 w-3.5 text-sky-400" /><span className="stat-label">Crons ativos</span></div>
          <div className="stat">{ativos.length}</div>
          <div className="text-[11px] text-slate-500">{ok} ok · {comErro.length} com problema</div>
        </div>
        <div className="card">
          <div className="mb-1 flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5 text-emerald-400" /><span className="stat-label">Custo hoje</span></div>
          <div className="stat">{fmtUsd(custo.dia)}</div>
          <div className="text-[11px] text-slate-500">semana {fmtUsd(custo.semana)}</div>
        </div>
        <div className="card">
          <div className="mb-1 flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5 text-indigo-400" /><span className="stat-label">Sessões (7d)</span></div>
          <div className="stat">{sessoes.filter((s) => s.started_at && s.started_at > agora - 7 * 86400000).length}</div>
          <div className="text-[11px] text-slate-500">última {relTempo(sessoes[0]?.started_at)}</div>
        </div>
        <div className="card">
          <div className="mb-1 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-rose-400" /><span className="stat-label">Execuções com erro</span></div>
          <div className="stat text-rose-400">{execErros.length}</div>
          <div className="text-[11px] text-slate-500">últimas 60 execuções</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* próximo briefing */}
        <div className="card">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-200"><Sun className="h-4 w-4 text-amber-400" /> Último briefing de sistema</h2>
            {briefing && <span className="text-[11px] text-slate-500">{relTempo(briefing.quando)}</span>}
          </div>
          {briefing ? (
            <pre className="whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed text-slate-400">
              {briefing.texto}
            </pre>
          ) : (
            <p className="text-sm text-slate-500">Nenhum briefing gerado ainda.</p>
          )}
        </div>

        {/* próximos runs */}
        <div className="card">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-200"><CalendarClock className="h-4 w-4 text-sky-400" /> Próximas execuções</h2>
          <div className="space-y-2">
            {proximos.length === 0 && <p className="text-sm text-slate-500">Nada agendado.</p>}
            {proximos.map((j) => (
              <div key={j.id} className="flex items-center justify-between rounded-md bg-slate-800/40 px-3 py-2">
                <span className="truncate text-[13px] text-slate-300">{j.nome}</span>
                <span className="ml-2 shrink-0 font-mono text-[12px] text-slate-500">
                  {fmtHora(j.next_run_at)} · {j.schedule}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* crons com problema */}
      {(comErro.length > 0 || nunca.length > 0) && (
        <div className="card border-rose-900/40">
          <h2 className="mb-2 text-sm font-semibold text-rose-300">🔴 Precisa de atenção</h2>
          <div className="space-y-2">
            {comErro.map((j) => (
              <div key={j.id} className="flex flex-col gap-0.5 rounded-md bg-rose-500/5 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-rose-200">{j.nome}</span>
                  <BadgeStatus status={j.last_status} />
                </div>
                {j.last_error && <code className="font-mono text-[11px] text-rose-400/80">{j.last_error.slice(0, 140)}</code>}
                {j.last_delivery_error && (
                  <code className="font-mono text-[11px] text-amber-400/80">entrega: {j.last_delivery_error.slice(0, 140)}</code>
                )}
              </div>
            ))}
            {/* só alerta "nunca rodou" se o horário agendado JÁ PASSOU (senão é normal) */}
            {nunca
              .filter((j) => j.next_run_at && j.next_run_at < agora)
              .map((j) => (
                <div key={j.id} className="flex items-center justify-between rounded-md bg-amber-500/5 px-3 py-2">
                  <span className="text-[13px] text-slate-300">{j.nome}</span>
                  <span className="badge-warn">nunca rodou · horário passou</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* últimas sessões */}
      <div className="card">
        <h2 className="mb-2 text-sm font-semibold text-slate-200">💬 Sessões recentes</h2>
        <div className="space-y-1.5">
          {sessoes.slice(0, 8).map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-slate-800/30">
              <div className="flex min-w-0 items-center gap-2">
                <span className="badge-off shrink-0">{s.fonte}</span>
                <span className="truncate text-[13px] text-slate-300">{s.titulo}</span>
              </div>
              <div className="flex shrink-0 items-center gap-3 font-mono text-[11px] text-slate-500">
                <span>{fmtUsd(s.custo)}</span>
                <span>{fmtTime(s.started_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
