import { getBriefings, getStatusJobs } from "@/lib/emails";
import { fmtTime, relTempo, isDemoMode } from "@/lib/data";
import Lista from "./lista";
import { Mail, Sun, Moon, AlertTriangle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "E-mails — Mission Control",
  description: "Painel do agente de e-mails: briefings de manhã e tarde, histórico e ações pendentes.",
};

export default function EmailsPage() {
  const briefings = getBriefings();
  const jobs = getStatusJobs();
  const demo = isDemoMode();

  const ultimoManha = briefings.find((b) => b.turno === "manha");
  const ultimoTarde = briefings.find((b) => b.turno === "tarde");
  const acoesAbertas = [...(ultimoManha?.acoes ?? []), ...(ultimoTarde?.acoes ?? [])];

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-100">
            <Mail className="h-5 w-5 text-sky-400" /> Agente de e-mails
          </h1>
          <p className="text-sm text-slate-500">
            Acompanhamento dos briefings do Gmail · {briefings.length} arquivados
            {demo && " · modo demo (dados fictícios)"}
          </p>
        </div>
      </header>

      {/* status dos 2 jobs */}
      <div className="grid gap-3 md:grid-cols-2">
        {jobs.map((j) => (
          <div key={j.turno} className="card">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {j.turno === "manha" ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-indigo-400" />
                )}
                <span className="text-[13px] font-semibold text-slate-200">
                  {j.emoji} {j.nome} · {j.hora}
                </span>
              </div>
              {j.enabled ? (
                j.lastStatus === "ok" ? (
                  <span className="badge-ok">ativo</span>
                ) : j.lastStatus === "error" ? (
                  <span className="badge-erro">erro</span>
                ) : (
                  <span className="badge-off">nunca rodou</span>
                )
              ) : (
                <span className="badge-off">pausado</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md border border-slate-800 bg-[#0b0e14] p-2">
                <div className="text-[10px] uppercase text-slate-600">Briefings</div>
                <div className="text-[14px] font-bold text-slate-200">{j.totalBriefings}</div>
              </div>
              <div className="rounded-md border border-slate-800 bg-[#0b0e14] p-2">
                <div className="text-[10px] uppercase text-slate-600">Último</div>
                <div className="text-[12px] text-slate-300">{relTempo(j.lastRun)}</div>
              </div>
              <div className="rounded-md border border-slate-800 bg-[#0b0e14] p-2">
                <div className="text-[10px] uppercase text-slate-600">Próximo</div>
                <div className="text-[12px] text-slate-300">
                  {j.nextRun ? fmtTime(j.nextRun).split(" ")[1] ?? "—" : "—"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* pendências com ação */}
      <div className="card">
        <h2 className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-slate-200">
          <AlertTriangle className="h-4 w-4 text-amber-400" /> Ações pendentes nos últimos briefings
        </h2>
        {acoesAbertas.length === 0 ? (
          <p className="text-[12px] text-slate-600">Nada pedindo ação agora.</p>
        ) : (
          <ul className="space-y-1.5">
            {acoesAbertas.map((a, i) => (
              <li key={i} className="flex gap-2 text-[12.5px] leading-snug text-slate-300">
                <span className="shrink-0 text-amber-500">•</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* histórico */}
      <section>
        <h2 className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-slate-200">
          <Clock className="h-4 w-4 text-slate-400" /> Histórico de briefings
        </h2>
        <Lista briefings={briefings} />
      </section>

      <p className="text-[11px] leading-relaxed text-slate-600">
        Os agentes rodam todo dia às 09:00 ☀️ e às 17:30 🌆, leem os e-mails novos do Gmail e entregam um briefing
        categorizado no Telegram, com rascunho de resposta quando o e-mail pede retorno. Nada é enviado sem a sua
        aprovação, e nenhum e-mail é marcado como lido, movido ou apagado.
      </p>
    </div>
  );
}
