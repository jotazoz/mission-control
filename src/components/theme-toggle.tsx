"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const CHAVE = "mc_tema";

export default function ThemeToggle() {
  const [claro, setClaro] = useState(false);

  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE);
    const ehClaro = salvo === "light";
    setClaro(ehClaro);
    document.documentElement.classList.toggle("light", ehClaro);
  }, []);

  const alternar = () => {
    const novo = !claro;
    setClaro(novo);
    document.documentElement.classList.toggle("light", novo);
    try {
      localStorage.setItem(CHAVE, novo ? "light" : "dark");
    } catch {}
  };

  return (
    <button
      onClick={alternar}
      title={claro ? "Mudar para tema escuro" : "Mudar para tema claro"}
      aria-label="Alternar tema"
      className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-[13px] text-slate-400 transition hover:bg-slate-800/60 hover:text-slate-100"
    >
      {claro ? <Moon className="h-4 w-4 text-slate-500" /> : <Sun className="h-4 w-4 text-slate-500" />}
      {claro ? "Tema escuro" : "Tema claro"}
    </button>
  );
}
