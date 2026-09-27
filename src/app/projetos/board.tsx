"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PROJETOS,
  STATUS_META,
  AREA_META,
  PRIORIDADE_META,
  type Area,
  type Projeto,
  type Status,
} from "@/lib/projetos";

type View = "board" | "tabela" | "timeline";

const HOJE = new Date("2026-09-27T12:00:00-03:00");
const ORDEM_STATUS: Status[] = ["backlog", "analise", "progresso", "feito", "arquivado"];
const STORAGE_KEY = "mc_projetos_override_v1";

function dias(desde?: string): number | null {
  if (!desde) return null;
  const d = new Date(desde + "T12:00:00-03:00").getTime();
  return Math.round((HOJE.getTime() - d) / 86400000);
}

function fmtData(iso?: string): string {
  if (!iso) return "—";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a.slice(2)}`;
}

export default function Board({ projetos }: { projetos: Projeto[] }) {
  const [overrides, setOverrides] = useState<Record<string, Status>>({});
  const [view, setView] = useState<View>("board");
  const [q, setQ] = useState("");
  const [areas, setAreas] = useState<Area[]>([]);
  const [prios, setPrios] = useState<string[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [selId, setSelId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setOverrides(JSON.parse(raw));
    } catch {}
  }, []);

  const salvar = (novo: Record<string, Status>) => {
    setOverrides(novo);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(novo));
    } catch {}
  };

  const efetivos = useMemo(
    () => projetos.map((p) => ({ ...p, status: overrides[p.id] ?? p.status })),
    [projetos, overrides],
  );

  const filtrados = useMemo(
    () =>
      efetivos.filter((p) => {
        if (areas.length && !areas.includes(p.area)) return false;
        if (prios.length && !prios.includes(p.prioridade)) return false;
        if (q.trim()) {
          const alvo = `${p.nome} ${p.resumo} ${p.proximaAcao ?? ""} ${(p.stack ?? []).join(" ")}`.toLowerCase();
          if (!alvo.includes(q.toLowerCase().trim())) return false;
        }
        return true;
      }),
    [efetivos, areas, prios, q],
  );

  const porStatus = (s: Status) => filtrados.filter((p) => p.status === s);

  const stats = useMemo(() => {
    const ativos = efetivos.filter((p) => p.status === "progresso" || p.status === "analise" || p.status === "backlog");
    return {
      total: efetivos.length,
      progresso: efetivos.filter((p) => p.status === "progresso").length,
      analise: efetivos.filter((p) => p.status === "analise").length,
      backlog: efetivos.filter((p) => p.status === "backlog").length,
      feito: efetivos.filter((p) => p.status === "feito").length,
      arquivado: efetivos.filter((p) => p.status === "arquivado").length,
      alta: ativos.filter((p) => p.prioridade === "alta").length,
      mediaProgresso: ativos.length
        ? Math.round(ativos.reduce((a, p) => a + p.progresso, 0) / ativos.length)
        : 0,
    };
  }, [efetivos]);

  const parados = useMemo(
    () =>
      efetivos
        .filter((p) => (p.status === "progresso" || p.status === "analise") && (dias(p.atualizado) ?? 0) >= 7)
        .sort((a, b) => (dias(b.atualizado) ?? 0) - (dias(a.atualizado) ?? 0)),
    [efetivos],
  );

  const prazos = useMemo(
    () =>
      efetivos
        .filter((p) => p.prazo && p.status !== "feito" && p.status !== "arquivado")
        .sort((a, b) => (a.prazo! < b.prazo! ? -1 : 1)),
    [efetivos],
  );

  const alertas = efetivos.filter((p) => p.alerta);

  const toggle = <T,>(arr: T[], v: T, set: (x: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const selecionado = selId ? efetivos.find((p) => p.id === selId) ?? null : null;

  // ───────────────────────── render ─────────────────────────
  return (
    <div className="space-y-5">
      {/* barra de controles */}
      <div className="card space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border border-slate-800 bg-[#0b0e14] p-0.5">
            {(["board", "tabela", "timeline"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded px-3 py-1.5 text-[12px] font-medium capitalize transition ${
                  view === v ? "bg-sky-500/20 text-sky-300" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {v === "board" ? "▦ Board" : v === "tabela" ? "☰ Tabela" : "⏱ Roadmap"}
              </button>
            ))}
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar projeto, stack, próxima ação…"
            className="min-w-[220px] flex-1 rounded-md border border-slate-800 bg-[#0b0e14] px-3 py-1.5 text-[13px] text-slate-200 placeholder:text-slate-600 focus:border-sky-600 focus:outline-none"
          />
          {Object.keys(overrides).length > 0 && (
            <button
              onClick={() => salvar({})}
              className="rounded-md border border-amber-700/50 bg-amber-500/10 px-3 py-1.5 text-[12px] font-medium text-amber-400 hover:bg-amber-500/20"
              title="Reverte todas as movimentações feitas no board"
            >
              ↺ Resetar movimentos
            </button>
          )}
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(efetivos, null, 2)], { type: "application/json" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "projetos-jp.json";
              a.click();
            }}
            className="rounded-md border border-slate-800 px-3 py-1.5 text-[12px] font-medium text-slate-400 hover:text-slate-200"
          >
            ↓ JSON
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10.5px] uppercase tracking-wide text-slate-600">Área</span>
          {(Object.keys(AREA_META) as Area[]).map((a) => {
            const on = areas.includes(a);
            return (
              <button
                key={a}
                onClick={() => toggle(areas, a, setAreas)}
                className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition"
                style={{
                  borderColor: on ? AREA_META[a].cor : "#1e293b",
                  color: on ? AREA_META[a].cor : "#64748b",
                  background: on ? `${AREA_META[a].cor}1a` : "transparent",
                }}
              >
                {AREA_META[a].label}
              </button>
            );
          })}
          <span className="mx-1 h-4 w-px bg-slate-800" />
          <span className="mr-1 text-[10.5px] uppercase tracking-wide text-slate-600">Prioridade</span>
          {(["alta", "media", "baixa"] as const).map((p) => {
            const on = prios.includes(p);
            return (
              <button
                key={p}
                onClick={() => toggle(prios, p, setPrios)}
                className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition"
                style={{
                  borderColor: on ? PRIORIDADE_META[p].cor : "#1e293b",
                  color: on ? PRIORIDADE_META[p].cor : "#64748b",
                  background: on ? `${PRIORIDADE_META[p].cor}1a` : "transparent",
                }}
              >
                {PRIORIDADE_META[p].label}
              </button>
            );
          })}
          {(areas.length > 0 || prios.length > 0 || q) && (
            <button
              onClick={() => {
                setAreas([]);
                setPrios([]);
                setQ("");
              }}
              className="ml-1 text-[11px] text-slate-500 underline hover:text-slate-300"
            >
              limpar filtros
            </button>
          )}
        </div>
        <div className="text-[11px] text-slate-600">
          Mostrando <span className="font-semibold text-slate-400">{filtrados.length}</span> de {stats.total} projetos ·
          média de progresso dos ativos <span className="font-semibold text-slate-400">{stats.mediaProgresso}%</span>
        </div>
      </div>

      {/* painel do PM */}
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="card">
          <h3 className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-slate-300">
            ⏳ Parados há 7 dias ou mais
          </h3>
          {parados.length === 0 ? (
            <p className="text-[12px] text-slate-600">Nada parado. 🎉</p>
          ) : (
            <ul className="space-y-1.5">
              {parados.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="truncate text-slate-300">{p.nome}</span>
                  <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10.5px] font-medium text-amber-400">
                    {dias(p.atualizado)}d
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h3 className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-slate-300">
            📅 Próximos marcos
          </h3>
          {prazos.length === 0 ? (
            <p className="text-[12px] text-slate-600">Nenhum marco datado em aberto.</p>
          ) : (
            <ul className="space-y-1.5">
              {prazos.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="truncate text-slate-300">{p.nome}</span>
                  <span className="shrink-0 font-mono text-[10.5px] text-sky-400">{fmtData(p.prazo)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h3 className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-slate-300">
            ⚠️ Precisa de atenção
          </h3>
          {alertas.length === 0 ? (
            <p className="text-[12px] text-slate-600">Sem pendências de infra.</p>
          ) : (
            <ul className="space-y-1.5">
              {alertas.map((p) => (
                <li key={p.id} className="text-[12px] leading-snug">
                  <span className="font-medium text-rose-400">{p.nome}:</span>{" "}
                  <span className="text-slate-400">{p.alerta}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {view === "board" && (
        <div className="flex gap-2.5 overflow-x-auto pb-2">
          {ORDEM_STATUS.map((s) => {
            const itens = porStatus(s);
            const meta = STATUS_META[s];
            return (
              <div
                key={s}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragId) salvar({ ...overrides, [dragId]: s });
                  setDragId(null);
                }}
                className={`flex min-w-[178px] flex-1 flex-col rounded-lg border bg-[#0c1017] transition ${
                  dragId ? "border-sky-700/60 bg-sky-950/20" : "border-slate-800"
                }`}
              >
                <div className="flex items-center gap-1.5 border-b border-slate-800 px-2.5 py-2">
                  <span className="text-[13px]">{meta.emoji}</span>
                  <span className="truncate text-[12px] font-semibold text-slate-200">{meta.label}</span>
                  <span
                    className="ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10.5px] font-bold"
                    style={{ background: `${meta.cor}22`, color: meta.cor }}
                  >
                    {itens.length}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 p-1.5">
                  {itens.map((p) => (
                    <CardProjeto
                      key={p.id}
                      p={p}
                      draggable
                      onDragStart={() => setDragId(p.id)}
                      onClick={() => setSelId(p.id)}
                    />
                  ))}
                  {itens.length === 0 && (
                    <div className="rounded-md border border-dashed border-slate-800 py-6 text-center text-[11px] text-slate-600">
                      arraste um projeto pra cá
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "tabela" && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-[12px]">
            <thead className="border-b border-slate-800 text-[10.5px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2.5">Projeto</th>
                <th className="px-3 py-2.5">Área</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Prior.</th>
                <th className="px-3 py-2.5 w-32">Progresso</th>
                <th className="px-3 py-2.5">Início</th>
                <th className="px-3 py-2.5">Atualizado</th>
                <th className="px-3 py-2.5">Prazo</th>
              </tr>
            </thead>
            <tbody>
              {filtrados
                .slice()
                .sort(
                  (a, b) =>
                    STATUS_META[a.status].ordem - STATUS_META[b.status].ordem ||
                    a.nome.localeCompare(b.nome),
                )
                .map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelId(p.id)}
                    className="cursor-pointer border-b border-slate-800/60 hover:bg-slate-800/30"
                  >
                    <td className="px-3 py-2.5 font-medium text-slate-200">
                      {p.nome}
                      {p.alerta && <span className="ml-1.5 text-rose-400">⚠</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      <span style={{ color: AREA_META[p.area].cor }}>{AREA_META[p.area].label}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span style={{ color: STATUS_META[p.status].cor }}>
                        {STATUS_META[p.status].emoji} {STATUS_META[p.status].label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5" style={{ color: PRIORIDADE_META[p.prioridade].cor }}>
                      {PRIORIDADE_META[p.prioridade].label}
                    </td>
                    <td className="px-3 py-2.5">
                      <Barra v={p.progresso} />
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-slate-500">{fmtData(p.inicio)}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-slate-500">{fmtData(p.atualizado)}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-sky-400">{fmtData(p.prazo)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "timeline" && <Roadmap projetos={filtrados} onSelect={setSelId} />}

      {selecionado && <Detalhe p={selecionado} onClose={() => setSelId(null)} />}
    </div>
  );
}

function Barra({ v }: { v: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full"
          style={{
            width: `${v}%`,
            background: v >= 100 ? "#34d399" : v >= 50 ? "#38bdf8" : "#fbbf24",
          }}
        />
      </div>
      <span className="w-8 text-right font-mono text-[10.5px] text-slate-500">{v}%</span>
    </div>
  );
}

function CardProjeto({
  p,
  draggable,
  onDragStart,
  onClick,
}: {
  p: Projeto;
  draggable?: boolean;
  onDragStart?: () => void;
  onClick?: () => void;
}) {
  const d = dias(p.atualizado);
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      className={`cursor-pointer rounded-lg border border-slate-800 bg-[#0e1219] p-2.5 transition hover:border-slate-600 hover:bg-[#111621] ${
        draggable ? "active:cursor-grabbing" : ""
      }`}
    >
      <div className="mb-1.5 flex items-start justify-between gap-1.5">
        <span className="text-[12px] font-semibold leading-tight text-slate-100">{p.nome}</span>
        <span
          className="shrink-0 rounded px-1 py-0.5 text-[9px] font-bold uppercase"
          style={{ background: `${PRIORIDADE_META[p.prioridade].cor}1f`, color: PRIORIDADE_META[p.prioridade].cor }}
        >
          {p.prioridade}
        </span>
      </div>
      <p className="mb-1.5 line-clamp-2 text-[10.5px] leading-snug text-slate-400">{p.resumo}</p>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ background: `${AREA_META[p.area].cor}1a`, color: AREA_META[p.area].cor }}
        >
          {AREA_META[p.area].label}
        </span>
        {p.alerta && <span className="text-[10.5px] text-rose-400">⚠ atenção</span>}
      </div>
      <Barra v={p.progresso} />
      {p.proximaAcao && (
        <p className="mt-2 line-clamp-2 border-t border-slate-800/70 pt-2 text-[11px] leading-snug text-slate-500">
          <span className="text-slate-600">→ </span>
          {p.proximaAcao}
        </p>
      )}
      <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-slate-600">
        <span>{p.prazo ? `marco ${fmtData(p.prazo)}` : "sem marco"}</span>
        <span>{d === null ? "" : `${d}d atrás`}</span>
      </div>
    </div>
  );
}

function Roadmap({ projetos, onSelect }: { projetos: Projeto[]; onSelect: (id: string) => void }) {
  const meses = useMemo(() => {
    const mapa = new Map<string, Projeto[]>();
    projetos.forEach((p) => {
      if (!p.inicio) return;
      const k = p.inicio.slice(0, 7);
      if (!mapa.has(k)) mapa.set(k, []);
      mapa.get(k)!.push(p);
    });
    return [...mapa.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
  }, [projetos]);

  const nomeMes = (k: string) => {
    const [a, m] = k.split("-");
    const nomes = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    return `${nomes[+m - 1]}/${a.slice(2)}`;
  };

  return (
    <div className="space-y-4">
      {meses.map(([mes, itens]) => (
        <div key={mes} className="flex gap-4">
          <div className="w-20 shrink-0 pt-1">
            <div className="font-mono text-[12px] font-bold text-sky-400">{nomeMes(mes)}</div>
            <div className="text-[10px] text-slate-600">{itens.length} proj.</div>
          </div>
          <div className="flex flex-1 flex-wrap gap-2 border-l border-slate-800 pl-4">
            {itens
              .slice()
              .sort((a, b) => STATUS_META[a.status].ordem - STATUS_META[b.status].ordem)
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelect(p.id)}
                  className="w-[240px] rounded-lg border border-slate-800 bg-[#0e1219] p-2.5 text-left transition hover:border-slate-600"
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: STATUS_META[p.status].cor }}
                    />
                    <span className="truncate text-[12px] font-semibold text-slate-200">{p.nome}</span>
                  </div>
                  <Barra v={p.progresso} />
                  <div className="mt-1.5 text-[10px] text-slate-600">
                    {STATUS_META[p.status].emoji} {STATUS_META[p.status].label} · {AREA_META[p.area].label}
                  </div>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Detalhe({ p, onClose }: { p: Projeto; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-700 bg-[#0e1219] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-bold text-slate-100">{p.nome}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
              <span style={{ color: AREA_META[p.area].cor }}>{AREA_META[p.area].label}</span>
              <span className="text-slate-700">·</span>
              <span style={{ color: STATUS_META[p.status].cor }}>
                {STATUS_META[p.status].emoji} {STATUS_META[p.status].label}
              </span>
              <span className="text-slate-700">·</span>
              <span style={{ color: PRIORIDADE_META[p.prioridade].cor }}>
                prioridade {PRIORIDADE_META[p.prioridade].label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200">
            ✕
          </button>
        </div>

        <p className="mb-4 text-[13px] leading-relaxed text-slate-300">{p.resumo}</p>

        <div className="mb-4">
          <div className="mb-1 text-[10.5px] uppercase tracking-wide text-slate-500">Progresso</div>
          <Barra v={p.progresso} />
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3 text-center">
          {[
            { l: "Início", v: fmtData(p.inicio) },
            { l: "Atualizado", v: fmtData(p.atualizado) },
            { l: "Marco", v: fmtData(p.prazo) },
          ].map((x) => (
            <div key={x.l} className="rounded-md border border-slate-800 bg-[#0b0e14] p-2">
              <div className="text-[10px] uppercase text-slate-600">{x.l}</div>
              <div className="font-mono text-[12px] text-slate-300">{x.v}</div>
            </div>
          ))}
        </div>

        {p.proximaAcao && (
          <div className="mb-4 rounded-md border border-sky-900/50 bg-sky-500/5 p-3">
            <div className="mb-1 text-[10.5px] uppercase tracking-wide text-sky-400">Próxima ação</div>
            <p className="text-[12.5px] leading-snug text-slate-300">{p.proximaAcao}</p>
          </div>
        )}

        {p.alerta && (
          <div className="mb-4 rounded-md border border-rose-900/50 bg-rose-500/5 p-3">
            <div className="mb-1 text-[10.5px] uppercase tracking-wide text-rose-400">Atenção</div>
            <p className="text-[12.5px] leading-snug text-slate-300">{p.alerta}</p>
          </div>
        )}

        {p.stack && p.stack.length > 0 && (
          <div className="mb-4">
            <div className="mb-1.5 text-[10.5px] uppercase tracking-wide text-slate-500">Stack</div>
            <div className="flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <span key={s} className="rounded border border-slate-800 bg-[#0b0e14] px-2 py-0.5 text-[11px] text-slate-400">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {p.parceiro && (
          <div className="mb-4 text-[12px] text-slate-400">
            <span className="text-slate-600">Parceiro: </span>
            {p.parceiro}
          </div>
        )}

        {p.links && p.links.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {p.links.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-slate-700 bg-[#0b0e14] px-3 py-1.5 text-[12px] font-medium text-sky-400 hover:border-sky-700 hover:text-sky-300"
              >
                ↗ {l.label}
              </a>
            ))}
          </div>
        )}

        {p.nota && (
          <p className="border-t border-slate-800 pt-3 text-[11.5px] italic leading-snug text-slate-500">{p.nota}</p>
        )}
      </div>
    </div>
  );
}
