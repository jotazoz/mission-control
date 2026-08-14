"use client";

import { useState } from "react";
import { salvarMemoriaAction } from "./actions";

export default function MemoriaEditor({
  arquivo,
  titulo,
  conteudoInicial,
  mtime,
}: {
  arquivo: string;
  titulo: string;
  conteudoInicial: string;
  mtime: number;
}) {
  const [conteudo, setConteudo] = useState(conteudoInicial);
  const [salvo, setSalvo] = useState<"ok" | "erro" | null>(null);
  const [msg, setMsg] = useState("");
  const [carregando, setCarregando] = useState(false);

  const sujo = conteudo !== conteudoInicial;

  async function salvar() {
    setCarregando(true);
    setSalvo(null);
    const r = await salvarMemoriaAction(arquivo, conteudo);
    setCarregando(false);
    if (r.ok) {
      setSalvo("ok");
      setMsg("Salvo com sucesso ✓");
    } else {
      setSalvo("erro");
      setMsg(r.erro ?? "Falha ao salvar");
    }
    setTimeout(() => setSalvo(null), 4000);
  }

  return (
    <div className="card">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">{titulo}</h2>
          <div className="text-[10.5px] text-slate-600">
            {arquivo} · {new Date(mtime).toLocaleString("pt-BR")}
          </div>
        </div>
        <button
          onClick={salvar}
          disabled={!sujo || carregando}
          className="rounded-md bg-sky-600 px-3 py-1.5 text-[12px] font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {carregando ? "Salvando…" : sujo ? "Salvar alterações" : "Sem alterações"}
        </button>
      </div>
      {salvo && (
        <div className={`mb-2 rounded-md px-3 py-1.5 text-[12px] ${salvo === "ok" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
          {msg}
        </div>
      )}
      <textarea
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        spellCheck={false}
        className="h-[320px] w-full resize-y rounded-md border border-slate-800 bg-[#0b0e14] p-3 font-mono text-[12px] leading-relaxed text-slate-300 outline-none focus:border-sky-700"
      />
      <p className="mt-1.5 text-[10.5px] text-slate-600">
        ⚠️ Editar memória afeta o comportamento do agente nos próximos turnos. Mude com cuidado.
      </p>
    </div>
  );
}
