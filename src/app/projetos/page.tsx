import { PROJETOS, STATUS_META, AREA_META } from "@/lib/projetos";
import Board from "./board";

export const metadata = {
  title: "Projetos — Mission Control",
  description: "Board de projetos do João Pedro: status, datas, prioridades e próximas ações.",
};

function Stat({ label, valor, cor, sub }: { label: string; valor: number | string; cor: string; sub?: string }) {
  return (
    <div className="card">
      <div className="stat-label">{label}</div>
      <div className="text-2xl font-bold" style={{ color: cor }}>
        {valor}
      </div>
      {sub && <div className="text-[11px] text-slate-500">{sub}</div>}
    </div>
  );
}

export default function ProjetosPage() {
  const ativos = PROJETOS.filter(
    (p) => p.status === "progresso" || p.status === "analise" || p.status === "backlog",
  );
  const areas = Object.keys(AREA_META).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-100">Portfólio de projetos</h1>
        <p className="text-sm text-slate-500">
          {PROJETOS.length} projetos mapeados em {areas} áreas · visão do Project Manager · atualizado em 27/09/2026
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Total" valor={PROJETOS.length} cor="#e2e8f0" sub={`${ativos.length} em aberto`} />
        <Stat
          label="Em progresso"
          valor={PROJETOS.filter((p) => p.status === "progresso").length}
          cor={STATUS_META.progresso.cor}
          sub="🔨 rodando agora"
        />
        <Stat
          label="Em análise"
          valor={PROJETOS.filter((p) => p.status === "analise").length}
          cor={STATUS_META.analise.cor}
          sub="🔍 estudando"
        />
        <Stat
          label="Concluídos"
          valor={PROJETOS.filter((p) => p.status === "feito").length}
          cor={STATUS_META.feito.cor}
          sub="✅ entregues"
        />
        <Stat
          label="Arquivados"
          valor={PROJETOS.filter((p) => p.status === "arquivado").length}
          cor={STATUS_META.arquivado.cor}
          sub="📦 encerrados"
        />
      </div>

      <div className="rounded-lg border border-slate-800 bg-[#0e1219] p-3 text-[11.5px] leading-relaxed text-slate-500">
        <span className="font-semibold text-slate-400">Como usar:</span> arraste os cartões entre as colunas para
        atualizar o status (fica salvo neste navegador) · clique num cartão para ver o detalhe completo · use os
        filtros de área e prioridade para focar · a aba <span className="text-slate-400">Roadmap</span> mostra a linha do
        tempo por mês de início.
      </div>

      <Board projetos={PROJETOS} />
    </div>
  );
}
