import { getUsoPorJob, getCustoTotal, getCustoSerie, fmtUsd, fmtTime, relTempo } from "@/lib/data";
import { Wallet, TrendingUp, CircleDollarSign } from "lucide-react";
import GraficoCusto from "./grafico";

export const dynamic = "force-dynamic";

export default function CustosPage() {
  const uso = getUsoPorJob();
  const custo = getCustoTotal();
  const serie = getCustoSerie();
  const totalTokens = uso.reduce((a, u) => a + u.total_tokens, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-100">Custos</h1>
        <p className="text-sm text-slate-500">
          Estimativas (USD × 5,4) · sessões do perfil carreira + auditoria de crons
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <div className="card">
          <div className="mb-1 flex items-center gap-1.5"><CircleDollarSign className="h-3.5 w-3.5 text-emerald-400" /><span className="stat-label">Hoje</span></div>
          <div className="stat">{fmtUsd(custo.dia)}</div>
        </div>
        <div className="card">
          <div className="mb-1 flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-sky-400" /><span className="stat-label">7 dias</span></div>
          <div className="stat">{fmtUsd(custo.semana)}</div>
        </div>
        <div className="card">
          <div className="mb-1 flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5 text-indigo-400" /><span className="stat-label">Mês</span></div>
          <div className="stat">{fmtUsd(custo.mes)}</div>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-2 text-sm font-semibold text-slate-200">📈 Custo por dia (14 dias)</h2>
        <GraficoCusto dados={serie} />
      </div>

      <div className="card">
        <h2 className="mb-2 text-sm font-semibold text-slate-200">
          Consumo por cron (usage_audit · últimas 1000 execuções)
        </h2>
        <p className="mb-3 text-[11.5px] text-slate-500">
          {uso.length} jobs na auditoria · {totalTokens.toLocaleString("pt-BR")} tokens totais
        </p>
        <div className="space-y-2">
          {uso.map((u) => {
            const pct = totalTokens ? Math.round((u.total_tokens / totalTokens) * 100) : 0;
            return (
              <div key={u.job_id} className="rounded-md bg-slate-800/40 px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-[13px] text-slate-300">{u.nome}</span>
                    {u.erro && <span className="badge-erro">erro</span>}
                  </div>
                  <span className="shrink-0 font-mono text-[11.5px] text-slate-500">
                    {u.runs} runs · {(u.total_tokens / 1000).toFixed(0)}k tok · {u.model}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-sky-600/70" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-0.5 text-[10.5px] text-slate-600">
                  último run {u.ultimo ? `${relTempo(u.ultimo)} (${fmtTime(u.ultimo)})` : "—"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
