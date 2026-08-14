import { getSessoes, fmtTime, fmtUsd, relTempo } from "@/lib/data";

export const dynamic = "force-dynamic";

function FonteBadge({ fonte }: { fonte: string }) {
  const map: Record<string, string> = {
    desktop: "badge-ok",
    telegram: "badge-warn",
    cron: "badge-off",
    whatsapp: "badge-off",
    slack: "badge-off",
  };
  return <span className={map[fonte] ?? "badge-off"}>{fonte}</span>;
}

export default function SessoesPage() {
  const sessoes = getSessoes(200);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-100">Sessões</h1>
        <p className="text-sm text-slate-500">
          {sessoes.length} sessões recentes do perfil carreira · custo estimado por sessão
        </p>
      </header>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Sessão</th>
              <th className="px-3 py-2.5">Fonte</th>
              <th className="px-3 py-2.5">Início</th>
              <th className="px-3 py-2.5 text-right">Custo</th>
              <th className="px-3 py-2.5 text-right">Tokens in</th>
              <th className="px-3 py-2.5 text-right">Tokens out</th>
              <th className="px-4 py-2.5">Modelo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sessoes.map((s) => (
              <tr key={s.id} className="hover:bg-slate-800/20">
                <td className="max-w-[340px] px-4 py-2.5">
                  <div className="truncate font-medium text-slate-200">{s.titulo}</div>
                  <div className="text-[10.5px] text-slate-600">
                    {s.mensagens != null && `${s.mensagens} msgs`}
                    {s.api_calls != null && ` · ${s.api_calls} chamadas`}
                  </div>
                </td>
                <td className="px-3 py-2.5"><FonteBadge fonte={s.fonte} /></td>
                <td className="px-3 py-2.5 font-mono text-[11.5px] text-slate-400">
                  {fmtTime(s.started_at)}
                  <span className="ml-1.5 text-slate-600">({relTempo(s.started_at)})</span>
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-[12px] text-slate-300">{fmtUsd(s.custo)}</td>
                <td className="px-3 py-2.5 text-right font-mono text-[11.5px] text-slate-500">
                  {s.input_tokens != null ? s.input_tokens.toLocaleString("pt-BR") : "—"}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-[11.5px] text-slate-500">
                  {s.output_tokens != null ? s.output_tokens.toLocaleString("pt-BR") : "—"}
                </td>
                <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500">{s.modelo ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
