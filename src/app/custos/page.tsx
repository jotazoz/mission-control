import { getUsoPorJob, getCustoTotal, getCustoSerie, getSaldoDeepSeek, fmtUsd, fmtTime, relTempo } from "@/lib/data";
import { Wallet, TrendingUp, CircleDollarSign, Landmark } from "lucide-react";
import GraficoCusto from "./grafico";

export const dynamic = "force-dynamic";

export default async function CustosPage() {
  const uso = getUsoPorJob();
  const custo = getCustoTotal();
  const serie = getCustoSerie();
  const saldo = await getSaldoDeepSeek();
  const totalTokens = uso.reduce((a, u) => a + u.total_tokens, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-100">Custos</h1>
        <p className="text-sm text-slate-500">
          Saldo oficial da DeepSeek + estimativas locais (USD × 5,4) de sessões e crons
        </p>
      </header>

      {/* saldo real da conta, direto da API da DeepSeek */}
      <div className={`card ${saldo.usd !== null && saldo.usd < 5 ? "border-amber-700/50" : ""}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <Landmark className="h-3.5 w-3.5 text-emerald-400" />
              <span className="stat-label">Saldo na conta DeepSeek (oficial)</span>
            </div>
            {saldo.usd !== null ? (
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${saldo.usd < 5 ? "text-amber-400" : "text-emerald-400"}`}>
                  US$ {saldo.usd.toFixed(2)}
                </span>
                <span className="text-[12px] text-slate-500">
                  ≈ R$ {(saldo.usd * 5.4).toFixed(2)}
                </span>
              </div>
            ) : (
              <div className="text-[13px] text-slate-500">
                indisponível {saldo.erro ? `(${saldo.erro})` : ""}
              </div>
            )}
            <div className="mt-1 text-[11px] text-slate-500">
              {saldo.recarregado !== null && <>recarregado US$ {saldo.recarregado.toFixed(2)}</>}
              {saldo.bruto !== null && saldo.bruto > 0 && <> · bônus US$ {saldo.bruto.toFixed(2)}</>}
            </div>
          </div>
          {saldo.usd !== null && saldo.usd < 5 && (
            <div className="rounded-md border border-amber-700/50 bg-amber-500/10 px-3 py-2 text-[12px] font-medium text-amber-400">
              ⚠️ Saldo baixo: recarregar antes que os crons parem
            </div>
          )}
        </div>
        <p className="mt-2 text-[11px] text-slate-600">
          Fonte: <span className="font-mono">GET api.deepseek.com/user/balance</span> com a chave do .env.
          É o valor real da conta (a mesma usada pelo Mac e pela VPS). Os números abaixo são estimativas locais.
        </p>
      </div>

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
