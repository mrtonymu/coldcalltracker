"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getAnalyticsData } from "@/lib/actions";
import MotivationWrapper from "@/components/MotivationWrapper";

const outcomeColors: Record<string, string> = {
  no_answer: "#71717a",
  voicemail: "#3b82f6",
  callback: "#f59e0b",
  interested: "#10b981",
  not_interested: "#ef4444",
  closed: "#a855f7",
  whatsapp: "#22c55e",
};

const outcomeLabels: Record<string, string> = {
  no_answer: "No Answer",
  voicemail: "Voicemail",
  callback: "Callback",
  interested: "Interested",
  not_interested: "Not Interested",
  closed: "Closed",
  whatsapp: "WhatsApp",
};

type AnalyticsData = {
  dailyTrend: { date: string; count: number }[];
  outcomeDistribution: { outcome: string; count: number }[];
};

const tickStyle = { fill: "#a1a1aa", fontSize: 11 };

const tooltipStyle = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "8px",
  color: "#f4f4f5",
};

export default function AnalyticsPage() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAnalyticsData(days)
      .then(setData)
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <div className="flex gap-2">
          {[7, 30].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                days === d
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 h-72 animate-pulse" />
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 h-72 animate-pulse" />
        </div>
      ) : (
        <>
          {/* Daily trend */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-5">
              Daily Calls — Last {days} Days
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.dailyTrend} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="date"
                  tick={tickStyle}
                  tickFormatter={(d: string) => d.slice(5)}
                />
                <YAxis tick={tickStyle} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [String(v), "Calls"]} labelStyle={{ color: "#f4f4f5" }} itemStyle={{ color: "#d4d4d8" }} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Outcome distribution */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-5">
              Outcome Breakdown — Last {days} Days
            </h2>
            {data.outcomeDistribution.length === 0 ? (
              <p className="text-zinc-500 text-center py-12">No call data in this period</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={data.outcomeDistribution.map((d) => ({
                    ...d,
                    label: outcomeLabels[d.outcome] || d.outcome,
                  }))}
                  margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="label" tick={tickStyle} />
                  <YAxis tick={tickStyle} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [String(v), "Calls"]} labelStyle={{ color: "#f4f4f5" }} itemStyle={{ color: "#d4d4d8" }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.outcomeDistribution.map((entry, i) => (
                      <Cell key={i} fill={outcomeColors[entry.outcome] || "#71717a"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
      <MotivationWrapper />
    </div>
  );
}
