import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import {
  LayoutDashboard,
  Clock,
  MessageSquare,
  Wallet,
  Brain,
  Activity,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Mission Control — Hermes HQ",
  description: "Painel de controle local do Hermes Agent: crons, sessões, custos e memória.",
};

const NAV = [
  { href: "/", label: "Visão geral", icon: LayoutDashboard },
  { href: "/crons", label: "Crons", icon: Clock },
  { href: "/sessoes", label: "Sessões", icon: MessageSquare },
  { href: "/custos", label: "Custos", icon: Wallet },
  { href: "/memoria", label: "Memória", icon: Brain },
];

const DEMO = process.env.DEMO_MODE === "1" || process.env.NEXT_PUBLIC_DEMO_MODE === "1";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-[#0b0e14] text-slate-200">
        <div className="flex min-h-screen">
          {/* sidebar */}
          <aside className="w-56 shrink-0 border-r border-slate-800 bg-[#0e1219] p-4 flex flex-col gap-1">
            <div className="mb-4 px-2 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-900/40">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-100">Mission Control</div>
                <div className="text-[10.5px] text-slate-500">Hermes HQ</div>
              </div>
            </div>
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-2.5 rounded-md px-2 py-2 text-[13px] text-slate-400 transition hover:bg-slate-800/60 hover:text-slate-100"
              >
                <n.icon className="h-4 w-4 text-slate-500" />
                {n.label}
              </Link>
            ))}
            <div className="mt-auto space-y-2 px-2 pt-4">
              {DEMO && (
                <div className="flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-1.5 text-[10.5px] font-medium text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Modo demo — dados fictícios
                </div>
              )}
              <div className="text-[10px] leading-relaxed text-slate-600">
                Lê ~/.hermes localmente.
                <br />
                Dados em tempo real.
              </div>
            </div>
          </aside>
          {/* conteúdo */}
          <main className="flex-1 p-6 max-w-6xl">{children}</main>
        </div>
      </body>
    </html>
  );
}
