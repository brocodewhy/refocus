"use client";
import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, Settings2 } from "lucide-react";

type Mode = "focus" | "short" | "long";
const defaults: Record<Mode, number> = { focus: 25, short: 5, long: 15 };
const labels: Record<Mode, string> = { focus: "Focus", short: "Short break", long: "Long break" };
export function PomodoroTimer() {
  const [durations, setDurations] = useState(defaults);
  const [mode, setMode] = useState<Mode>("focus");
  const [left, setLeft] = useState(defaults.focus * 60);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => { if (!running) return; const id = window.setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000); return () => window.clearInterval(id); }, [running]);
  useEffect(() => {
    if (left !== 0 || !running) return;
    setRunning(false);
    if (mode === "focus") {
      setCycles((n) => n + 1);
      setNotice("Focus interval complete. Take a break before the next round.");
      void fetch("/api/focus-sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ duration_minutes: durations.focus }) })
        .then(async (response) => { if (!response.ok) { const payload = await response.json().catch(() => ({})); setNotice(payload.error || "Focus interval completed, but saving failed."); } })
        .catch(() => setNotice("Focus interval completed, but could not connect to save it."));
    } else setNotice("Break complete. Ready when you are.");
  }, [left, running, mode, durations.focus]);
  function changeMode(next: Mode) { setMode(next); setLeft(durations[next] * 60); setRunning(false); setNotice(""); }
  function saveDurations() { setLeft(durations[mode] * 60); setRunning(false); setShowSettings(false); setNotice("Timer preferences updated."); }
  const mm = String(Math.floor(left / 60)).padStart(2, "0"); const ss = String(left % 60).padStart(2, "0"); const total = durations[mode] * 60; const radius = 112; const c = 2 * Math.PI * radius;
  return <div className="surface-card rounded-[28px] p-6 sm:p-9"><div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Pomodoro interval">{(Object.keys(labels) as Mode[]).map((key) => <button key={key} onClick={() => changeMode(key)} aria-pressed={mode === key} className={`rounded-full px-4 py-2 text-sm font-bold ${mode === key ? "bg-brand text-white" : "surface-subtle text-muted"}`}>{labels[key]}</button>)}</div>
    <div className="relative mx-auto my-8 flex h-64 w-64 items-center justify-center"><svg viewBox="0 0 250 250" className="absolute inset-0 h-full w-full -rotate-90"><circle cx="125" cy="125" r={radius} fill="none" stroke="var(--ring-track)" strokeWidth="10"/><circle cx="125" cy="125" r={radius} fill="none" stroke="url(#pomoGradient)" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - (total - left) / total)} className="transition-all duration-300"/><defs><linearGradient id="pomoGradient"><stop stopColor="var(--brand)"/><stop offset="1" stopColor="var(--brand-2)"/></linearGradient></defs></svg><div className="text-center"><p className="text-sm font-semibold text-muted">{labels[mode]}</p><p className="mt-2 text-5xl font-extrabold tabular-nums text-ink">{mm}:{ss}</p><p className="mt-2 text-xs text-muted">Round {cycles + 1}</p></div></div>
    <div className="flex justify-center gap-3"><button onClick={() => { if (left === 0) setLeft(total); setRunning((n) => !n); setNotice(""); }} className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-bold text-white">{running ? <><Pause size={17}/> Pause</> : <><Play size={17}/> Start</>}</button><button onClick={() => { setRunning(false); setLeft(total); setNotice(""); }} className="button-secondary" aria-label="Reset"><RotateCcw size={18}/></button><button onClick={() => setShowSettings((n) => !n)} className="button-secondary" aria-label="Timer settings"><Settings2 size={18}/></button></div>
    {showSettings && <div className="mt-6 rounded-2xl surface-subtle p-4"><h3 className="font-bold text-ink">Customize intervals</h3><div className="mt-3 grid gap-3 sm:grid-cols-3">{(Object.keys(labels) as Mode[]).map((key) => <label key={key} className="field-label">{labels[key]} (min)<input className="field-input mt-1" type="number" min="1" max="180" value={durations[key]} onChange={(e) => setDurations((old) => ({ ...old, [key]: Math.min(180, Math.max(1, Number(e.target.value) || 1)) }))}/></label>)}</div><button onClick={saveDurations} className="button-primary mt-4">Save intervals</button></div>}
    {notice && <p className="mt-4 rounded-xl bg-violet-50 p-3 text-sm text-violet-800">{notice}</p>}<p className="mt-5 text-center text-sm text-muted">Completed focus rounds: <strong className="text-ink">{cycles}</strong>. Customize the intervals to suit your study rhythm.</p>
  </div>;
}
