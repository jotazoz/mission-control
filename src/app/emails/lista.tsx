"use client";

import { useMemo, useState } from "react";
import type { Briefing, Turno } from "@/lib/emails";

/** Converte **negrito** em <strong> dentro de uma linha. */
function Inline({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-semibold text-slate-200">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

/** Renderizador enxuto do markdown do briefing (headers, listas, negrito, hr). */
function Markdown({ md }: { md: string }) {
  const linhas = md.split("\n");
  const blocos: React.ReactNode[] = [];
  let bufferLista: string[] = [];

  const fecharLista = (key: string) => {
    if (bufferLista.length) {
      blocos.push(
        <ul key={key} className="my-1.5 space-y-1 pl-4">
          {bufferLista.map((li, i) => (
            <li key={i} className="text-[12.5px] leading-relaxed text-slate-300 list-disc">
              <Inline texto={li} />
            </li>
          ))}
        </ul>,
      );
      bufferLista = [];
    }
  };

  linhas.forEach((linha, idx) => {
    const l = linha.trim();
    if (!l) {
      fecharLista(`ul-${idx}`);
      return;
    }
    if (l.startsWith("# ")) {
      fecharLista(`ul-${idx}`);
      blocos.push(
        <h2 key={idx} className="mt-3 mb-1 text-[15px] font-bold text-slate-100">
          <Inline texto={l.slice(2)} />
        </h2>,
      );
      return;
    }
    if (l.startsWith("## ")) {
      fecharLista(`ul-${idx}`);
      blocos.push(
        <h3
          key={idx}
          className="mt-4 mb-1.5 border-b border-slate-800 pb-1 text-[12.5px] font-semibold uppercase tracking-wide text-sky-400"
        >
          <Inline texto={l.slice(3)} />
        </h3>,
      );
      return;
    }
    if (l === "---") {
      fecharLista(`ul-${idx}`);
      blocos.push(<hr key={idx} className="my-3 border-slate-800" />);
      return;
    }
    if (l.startsWith("> ")) {
      fecharLista(`ul-${idx}`);
      blocos.push(
        <p key={idx} className="my-1.5 rounded-md border-l-2 border-sky-700 bg-sky-500/5 py-1 pl-2.5 text-[12.5px] text-slate-300">
          <Inline texto={l.slice(2)} />
        </p>,
      );
      return;
    }
    if (l.startsWith("- ") || l.startsWith("* ")) {
      bufferLista.push(l.slice(2));
      return;
    }
    fecharLista(`ul-${idx}`);
    blocos.push(
      <p key={idx} className="my-1 text-[12.5px] leading-relaxed text-slate-300">
        <Inline texto={l} />
      </p>,
    );
  });
  fecharLista("ul-fim");

  return <div className="mt-1">{blocos}</div>;
}

export default function Lista({ briefings }: { briefings: Briefing[] }) {
  const [turno, setTurno] = useState<"todos" | Turno>("todos");
  const [q, setQ] = useState("");
  const [aberto, setAberto] = useState<string | null>(briefings[0]?.arquivo ?? null);

  const filtrados = useMemo(
    () =>
      briefings.filter((b) => {
        if (turno !== "todos" && b.turno !== turno) return false;
        if (q.trim()) {
          const alvo = `${b.markdown} ${b.resumo}`.toLowerCase();
          if (!alvo.includes(q.toLowerCase().trim())) return false;
        }
        return true;
      }),
    [briefings, turno, q],
  );

  if (briefings.length === 0) {
    return (
      <div className="card text-[13px] text-slate-500">
        Nenhum briefing arquivado ainda. Eles aparecem aqui depois da primeira execução dos agentes de e-mail.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-md border border-slate-800 bg-[#0b0e14] p-0.5">
          {(
            [
              { v: "todos", l: "Todos" },
              { v: "manha", l: "☀️ Manhã" },
              { v: "tarde", l: "🌆 Tarde" },
            ] as const
          ).map((o) => (
            <button
              key={o.v}
              onClick={() => setTurno(o.v)}
              className={`rounded px-3 py-1.5 text-[12px] font-medium transition ${
                turno === o.v ? "bg-sky-500/20 text-sky-300" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar remetente, assunto, ação…"
          className="min-w-[200px] flex-1 rounded-md border border-slate-800 bg-[#0b0e14] px-3 py-1.5 text-[13px] text-slate-200 placeholder:text-slate-600 focus:border-sky-600 focus:outline-none"
        />
        <span className="text-[11px] text-slate-600">
          {filtrados.length} de {briefings.length}
        </span>
      </div>

      <div className="space-y-2">
        {filtrados.map((b) => {
          const temAcao = b.acoes.length > 0;
          const isOpen = aberto === b.arquivo;
          return (
            <div key={b.arquivo} className="overflow-hidden rounded-lg border border-slate-800 bg-[#0e1219]">
              <button
                onClick={() => setAberto(isOpen ? null : b.arquivo)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition hover:bg-slate-800/30"
              >
                <span>{b.emoji}</span>
                <span className="font-mono text-[11.5px] text-slate-400">{b.quandoStr}</span>
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-slate-300">{b.resumo}</span>
                {temAcao && (
                  <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10.5px] font-medium text-amber-400">
                    ⚠️ {b.acoes.length} ação{b.acoes.length > 1 ? "ões" : ""}
                  </span>
                )}
                <span className="shrink-0 text-slate-600">{isOpen ? "▾" : "▸"}</span>
              </button>
              {isOpen && (
                <div className="border-t border-slate-800 px-3.5 py-2">
                  <Markdown md={b.markdown} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
