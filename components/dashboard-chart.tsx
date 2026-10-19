"use client";

import { useEffect, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DayTotal = { day: string; focusMinutes: number; screenMinutes: number };

export function DashboardChart({ data }: { data: DayTotal[] }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  return (
    <div>
      <div className="dashboard-chart" role="img" aria-label="Daily focus and tracked screen-time minutes for the last seven days">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }} barGap={4}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 10 }} />
            <Tooltip
              cursor={{ fill: "var(--surface-muted)", opacity: 0.6 }}
              contentStyle={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }}
              formatter={(value, name) => [`${value} min`, name === "focusMinutes" ? "Focus time" : "Tracked screen time"]}
              labelStyle={{ color: "var(--muted)", fontWeight: 700 }}
            />
            <Legend verticalAlign="top" align="right" height={30} iconType="circle" iconSize={7} formatter={(value) => value === "focusMinutes" ? "Focus" : "Screen time"} />
            <Bar dataKey="focusMinutes" name="focusMinutes" fill="var(--brand)" radius={[5, 5, 0, 0]} maxBarSize={24} animationDuration={450} isAnimationActive={!reducedMotion} />
            <Bar dataKey="screenMinutes" name="screenMinutes" fill="var(--chart-secondary)" radius={[5, 5, 0, 0]} maxBarSize={24} animationDuration={500} isAnimationActive={!reducedMotion} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Focus and tracked screen time for the last seven days, in minutes</caption>
        <thead><tr><th scope="col">Day</th><th scope="col">Focus time</th><th scope="col">Tracked screen time</th></tr></thead>
        <tbody>{data.map((item) => <tr key={item.day}><th scope="row">{item.day}</th><td>{item.focusMinutes}</td><td>{item.screenMinutes}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
