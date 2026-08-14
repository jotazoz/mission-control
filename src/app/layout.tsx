import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mission Control — Hermes HQ",
  description: "Painel de controle local do Hermes Agent do Jp: crons, sessões, custos e memória.",
};

const NAV = [
  { href: "/", label: "Visão geral", icon: "◎" },
  { href: "/crons", label: "Crons", icon: "⏱" },
  { href: "/sessoes", label: "Sessões", icon: "💬" },
  { href: "/custos", label: "Custos", icon: "💰" },
  { href: "/memoria", label: "Memória", icon: "🧠" },
];

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
          <aside className="w-52 shrink-0 border-r border-slate-800 bg-[#0e1219] p-4 flex flex-col gap-1">
            <div className="mb-4 px-2">
              <div className="text-sm font-bold text-slate-100">Mission Control</div>
              <div className="text-[11px] text-slate-500">Hermes HQ · local</div>
            </div>
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
              >
                <span className="w-4 text-center text-slate-500">{n.icon}</span>
                {n.label}
              </Link>
            ))}
            <div className="mt-auto px-2 pt-4 text-[10px] text-slate-600">
              Lê ~/.hermes localmente.
              <br />
              Dados em tempo real.
            </div>
          </aside>
          {/* conteúdo */}
          <main className="flex-1 p-6 max-w-6xl">{children}</main>
        </div>
      </body>
    </html>
  );
}
