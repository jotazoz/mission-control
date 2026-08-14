"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function GraficoCusto({ dados }: { dados: { dia: string; custo: number }[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dados} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="custoGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="dia" tick={{ fill: "#64748b", fontSize: 11 }} stroke="#1e293b" />
          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} stroke="#1e293b" tickFormatter={(v: number) => `R$${v.toFixed(2)}`} />
          <Tooltip
            contentStyle={{
              background: "#0e1219",
              border: "1px solid #1e293b",
              borderRadius: 8,
              fontSize: 12,
              color: "#e2e8f0",
            }}
            labelStyle={{ color: "#94a3b8" }}
            formatter={(v) => [`R$ ${Number(v).toFixed(2)}`, "Custo"]}
          />
          <Area
            type="monotone"
            dataKey="custo"
            stroke="#38bdf8"
            strokeWidth={2}
            fill="url(#custoGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
