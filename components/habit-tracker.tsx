"use client";
import { useEffect, useState } from "react";
import { Check, Plus, Trash2, Leaf } from "lucide-react";
type Habit = { id: string; title: string; checks: string[] };
const KEY = "refocus-habits-v1";
function dayKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; }
export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]); const [name, setName] = useState(""); const [ready, setReady] = useState(false);
  useEffect(() => { try { const raw = localStorage.getItem(KEY); if (raw) setHabits(JSON.parse(raw)); } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(habits)); }, [habits, ready]);
  const today = dayKey();
  function add(e: React.FormEvent) { e.preventDefault(); if (!name.trim()) return; setHabits((old) => [...old, { id: crypto.randomUUID(), title: name.trim(), checks: [] }]); setName(""); }
  function toggle(habit: Habit) { setHabits((old) => old.map((item) => item.id !== habit.id ? item : { ...item, checks: item.checks.includes(today) ? item.checks.filter((key) => key !== today) : [...item.checks, today] })); }
  function currentStreak(habit: Habit) { let count = 0; const d = new Date(); if (!habit.checks.includes(dayKey(d))) d.setDate(d.getDate()-1); while (habit.checks.includes(dayKey(d)) && count < 366) { count++; d.setDate(d.getDate()-1); } return count; }
  return <section className="surface-card mt-5 rounded-[26px] p-6 sm:p-8"><div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Leaf size={19}/></div><div><h2 className="text-lg font-extrabold text-ink">Daily habits</h2><p className="mt-1 text-sm text-muted">Create small routines and check them off each day. Habits are saved in this browser.</p></div></div>
    <form onSubmit={add} className="mt-5 flex gap-2"><input className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Add a habit, e.g. Read for 20 minutes" maxLength={100} required/><button className="button-primary shrink-0" type="submit"><Plus size={16}/> Add habit</button></form>
    <div className="mt-4 grid gap-2 sm:grid-cols-2">{habits.length === 0 ? <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-sm text-muted sm:col-span-2">No habits yet. Add one routine you want to practice consistently.</div> : habits.map((habit) => { const done = habit.checks.includes(today); const streak = currentStreak(habit); return <div key={habit.id} className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3"><button type="button" onClick={() => toggle(habit)} aria-label={done ? "Undo today's habit" : "Complete today's habit"} className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${done ? "border-emerald-500 bg-emerald-500 text-white" : "border-[var(--border)] text-transparent hover:border-brand"}`}><Check size={16}/></button><div className="min-w-0 flex-1"><p className={`text-sm font-bold ${done ? "text-muted line-through" : "text-ink"}`}>{habit.title}</p><p className="mt-1 text-xs text-muted">{streak} day streak · {habit.checks.length} completions</p></div><button type="button" className="button-icon !border-0 !p-2 text-muted hover:!text-rose-500" aria-label="Delete habit" onClick={() => setHabits((old) => old.filter((item) => item.id !== habit.id))}><Trash2 size={15}/></button></div>; })}</div>
  </section>;
}
