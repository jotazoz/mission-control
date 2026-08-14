import { getJobs, getExecucoes, fmtTime, fmtHora } from "@/lib/data";
import { Clock, History } from "lucide-react";

export const dynamic = "force-dynamic";

export default function CronsPage() {
  const jobs = getJobs();
  const execs = getExecucoes(300);
  const porJob = new Map<string, typeof execs>();
  for (const e of execs) {
    if (!porJob.has(e.job_id)) porJob.set(e.job_id, []);
    porJob.get(e.job_id)!.push(e);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-100"><Clock className="h-5 w-5 text-sky-400" /> Crons</h1>
        <p className="text-sm text-slate-500">{jobs.length} jobs · histórico de execuções em tempo real</p>
      </header>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Job</th>
              <th className="px-3 py-2.5">Schedule</th>
              <th className="px-3 py-2.5">Último run</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Próximo</th>
              <th className="px-4 py-2.5 text-right">Erros (300 exec.)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {jobs.map((j) => {
              const hist = porJob.get(j.id) ?? [];
              const errs = hist.filter((h) => h.status === "error" || h.status === "failed").length;
              const off = !j.enabled || j.state === "paused";
              return (
                <tr key={j.id} className={off ? "opacity-50" : ""}>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-slate-200">{j.nome}</div>
                    <div className="font-mono text-[10.5px] text-slate-600">{j.id}</div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11.5px] text-slate-500">
                    {j.schedule}
                    {j.no_agent && <span className="ml-1.5 text-[10px] text-sky-500">no_agent</span>}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11.5px] text-slate-400">{fmtTime(j.last_run_at)}</td>
                  <td className="px-3 py-2.5">
                    {off ? (
                      <span className="badge-off">off</span>
                    ) : j.last_status === "ok" ? (
                      <span className="badge-ok">ok</span>
                    ) : j.last_status === "error" ? (
                      <span className="badge-erro">erro</span>
                    ) : (
                      <span className="badge-off">nunca</span>
                    )}
                    {j.last_delivery_error && (
                      <div className="mt-0.5 text-[10px] text-amber-400">entrega falhou</div>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11.5px] text-slate-400">{fmtTime(j.next_run_at)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-[12px]">
                    {errs > 0 ? <span className="text-rose-400">{errs}</span> : <span className="text-slate-700">0</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* execuções recentes */}
      <div className="card">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-200"><History className="h-4 w-4 text-indigo-400" /> Execuções recentes</h2>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="sticky top-0 border-b border-slate-800 bg-[#0e1219] text-[10.5px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-2 py-2">Job</th>
                <th className="px-2 py-2">Início</th>
                <th className="px-2 py-2">Fim</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Erro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {execs.slice(0, 60).map((e, i) => {
                const nome = jobs.find((j) => j.id === e.job_id)?.nome ?? e.job_id;
                const bad = e.status === "error" || e.status === "failed";
                return (
                  <tr key={i} className={bad ? "bg-rose-500/5" : ""}>
                    <td className="px-2 py-1.5 text-slate-300">{nome}</td>
                    <td className="px-2 py-1.5 font-mono text-[11px] text-slate-500">{fmtHora(e.claimed_at)}</td>
                    <td className="px-2 py-1.5 font-mono text-[11px] text-slate-500">{fmtHora(e.finished_at)}</td>
                    <td className="px-2 py-1.5">
                      {bad ? <span className="badge-erro">{e.status}</span> : <span className="badge-ok">{e.status}</span>}
                    </td>
                    <td className="max-w-[280px] truncate px-2 py-1.5 font-mono text-[10.5px] text-rose-400/80">
                      {e.error ?? ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
