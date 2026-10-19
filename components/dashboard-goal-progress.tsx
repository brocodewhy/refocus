"use client";

import { useEffect, useState } from "react";
import { Target } from "lucide-react";

const PLANNER_KEY = "refocus-planner-v2";

export function DashboardGoalProgress({ todayMinutes }: { todayMinutes: number }) {
  const [targetMinutes, setTargetMinutes] = useState(120);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PLANNER_KEY);
      if (!stored) return;
      const planner = JSON.parse(stored) as { goalHours?: unknown; goalMinutes?: unknown };
      const hours = Number(planner.goalHours ?? 2);
      const minutes = Number(planner.goalMinutes ?? 0);
      if (Number.isFinite(hours) && Number.isFinite(minutes)) {
        setTargetMinutes(Math.min(1440, Math.max(0, hours * 60 + minutes)));
      }
    } catch {}
  }, []);

  const progress = targetMinutes > 0 ? Math.min(100, (todayMinutes / targetMinutes) * 100) : 0;
  const remaining = Math.max(0, targetMinutes - todayMinutes);

  return (
    <section className="goal-progress-panel rounded-[28px] border border-slate-100 bg-white p-6 shadow-soft sm:p-7" aria-labelledby="daily-goal-title">
      <div className="flex items-center justify-between">
        <div>
          <h2 id="daily-goal-title" className="text-sm font-bold text-ink">Daily study goal</h2>
          <p className="mt-1 text-xs text-muted">Completed focus time</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><Target size={21} /></div>
      </div>
      <div className="mt-7 flex items-end gap-2">
        <span className="text-5xl font-extrabold tracking-tight text-ink">{todayMinutes}</span>
        <span className="mb-1 text-sm text-muted">of {targetMinutes} min</span>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Daily focus goal progress" aria-valuemin={0} aria-valuemax={Math.max(1, targetMinutes)} aria-valuenow={Math.min(todayMinutes, targetMinutes)}>
        <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-500" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-3 text-xs text-muted">
        {targetMinutes === 0 ? "Set a daily goal in Goals & planner." : remaining === 0 ? "You reached your daily focus goal." : `${remaining} minutes to reach today's goal.`}
      </p>
    </section>
  );
}