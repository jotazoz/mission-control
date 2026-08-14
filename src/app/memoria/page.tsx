import { getMemorias } from "@/lib/data";
import { Brain } from "lucide-react";
import MemoriaEditor from "./editor";

export const dynamic = "force-dynamic";

export default function MemoriaPage() {
  const memorias = getMemorias();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-100"><Brain className="h-5 w-5 text-fuchsia-400" /> Memória</h1>
        <p className="text-sm text-slate-500">
          O que o agente sabe sobre você e sobre o ambiente — editável (espelha ~/.hermes/profiles/carreira/memories)
        </p>
      </header>

      {memorias.length === 0 ? (
        <div className="card text-sm text-slate-500">Nenhuma memória encontrada no perfil.</div>
      ) : (
        memorias.map((m) => (
          <MemoriaEditor
            key={m.arquivo}
            arquivo={m.arquivo}
            titulo={m.titulo}
            conteudoInicial={m.conteudo}
            mtimeStr={m.mtime_str}
          />
        ))
      )}
    </div>
  );
}
