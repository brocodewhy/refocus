"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Pause, Play, RotateCcw } from "lucide-react";

const presets = [15, 25, 45, 60];
export function FocusTimer() {
  const reducedMotion = useReducedMotion();
  const [minutes, setMinutes] = useState(25);
  const [customMinutes, setCustomMinutes] = useState("25");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [task, setTask] = useState("");
  const startedRef = useRef(false);
  const savedRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (secondsLeft === 0 && running && startedRef.current && !savedRef.current) {
      setRunning(false);
      savedRef.current = true;
      void saveSession();
    }
  }, [secondsLeft, running]);

  function chooseMinutes(value: number) {
    if (!Number.isInteger(value) || value < 1 || value > 240) return;
    setRunning(false); setMinutes(value); setCustomMinutes(String(value)); setSecondsLeft(value * 60); setMessage("");
    startedRef.current = false; savedRef.current = false;
  }

  async function saveSession() {
    setSaving(true);
    try {
      const response = await fetch("/api/focus-sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ duration_minutes: minutes, task: task.trim() }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not save session.");
      setMessage("Session completed and saved to your account.");
    } catch (error) {
      setMessage("Session completed, but saving failed. " + (error instanceof Error ? error.message : "Try again."));
    } finally { setSaving(false); }
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const progress = 1 - secondsLeft / (minutes * 60);
  const circumference = 2 * Math.PI * 124;

  return <div className="surface-card rounded-[28px] p-6 sm:p-9">
    <div className="mb-5"><label className="field-label" htmlFor="focus-task">What are you focusing on?</label><input id="focus-task" value={task} onChange={(e) => setTask(e.target.value)} className="field-input mt-2" placeholder="e.g. Revise Discrete Mathematics" /></div>
    <div className="flex flex-wrap justify-center gap-2">{presets.map((m) => <button type="button" key={m} onClick={() => chooseMinutes(m)} className={`rounded-full px-4 py-2 text-xs font-bold transition ${minutes === m ? "bg-brand text-white shadow-md shadow-violet-200" : "surface-subtle text-muted hover:bg-violet-50 hover:text-brand"}`}>{m} min</button>)}</div>
    <form className="mt-4 flex flex-wrap items-end justify-center gap-2" onSubmit={(e) => { e.preventDefault(); chooseMinutes(Number(customMinutes)); }}><div><label className="field-label" htmlFor="custom-minutes">Custom duration (1–240 min)</label><input id="custom-minutes" type="number" min="1" max="240" value={customMinutes} onChange={(e) => setCustomMinutes(e.target.value)} className="field-input mt-1 w-40" /></div><button className="button-secondary" type="submit">Set timer</button></form>
    <div className="relative mx-auto my-8 flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72"><svg viewBox="0 0 280 280" className="absolute inset-0 h-full w-full -rotate-90"><circle cx="140" cy="140" r="124" stroke="var(--ring-track)" strokeWidth="10" fill="none"/><motion.circle cx="140" cy="140" r="124" stroke="url(#focusGradient)" strokeWidth="10" strokeLinecap="round" fill="none" strokeDasharray={circumference} animate={{ strokeDashoffset: circumference * (1 - progress) }} transition={{ duration: .35 }} /><defs><linearGradient id="focusGradient"><stop offset="0%" stopColor="#7667E8"/><stop offset="100%" stopColor="#C084FC"/></linearGradient></defs></svg><div className="text-center"><div className="text-6xl font-extrabold tracking-tight text-ink tabular-nums">{mm}:{ss}</div><p className="mt-3 text-sm text-muted">{running ? "You're in focus mode" : secondsLeft === 0 ? "Session complete" : "Ready when you are"}</p><div className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-[11px] font-bold text-brand"><span className={`h-2 w-2 rounded-full ${running ? "animate-pulse bg-emerald-400" : "bg-violet-300"}`} />{running ? "FOCUS IN PROGRESS" : "ONE THING AT A TIME"}</div></div></div>
      <div className="relative mx-auto my-8 flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72"><svg viewBox="0 0 280 280" className="absolute inset-0 h-full w-full -rotate-90"><circle cx="140" cy="140" r="124" stroke="var(--ring-track)" strokeWidth="10" fill="none"/><motion.circle cx="140" cy="140" r="124" stroke="url(#focusGradient)" strokeWidth="10" strokeLinecap="round" fill="none" strokeDasharray={circumference} animate={{ strokeDashoffset: circumference * (1 - progress) }} transition={reducedMotion ? { duration: 0 } : { duration: .35 }} /><defs><linearGradient id="focusGradient"><stop offset="0%" stopColor="var(--brand)"/><stop offset="100%" stopColor="var(--brand-2)"/></linearGradient></defs></svg><div className="text-center"><div className="text-6xl font-extrabold tracking-tight text-ink tabular-nums">{mm}:{ss}</div><p className="mt-3 text-sm text-muted">{running ? "You're in focus mode" : secondsLeft === 0 ? "Session complete" : "Ready when you are"}</p><div className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-[11px] font-bold text-brand"><span className={`h-2 w-2 rounded-full ${running ? "animate-pulse bg-emerald-400" : "bg-violet-300"}`} />{running ? "FOCUS IN PROGRESS" : "ONE THING AT A TIME"}</div></div></div>
    <div className="flex justify-center gap-3"><button type="button" onClick={() => { if (secondsLeft === 0) { setSecondsLeft(minutes * 60); savedRef.current = false; } if (!running) startedRef.current = true; setRunning(!running); setMessage(""); }} className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700">{running ? <><Pause size={17}/> Pause</> : <><Play size={17} fill="currentColor"/> {secondsLeft === 0 ? "Start again" : "Start focus"}</>}</button><button type="button" onClick={() => { setRunning(false); setSecondsLeft(minutes * 60); setMessage(""); startedRef.current = false; savedRef.current = false; }} className="button-secondary" aria-label="Reset timer"><RotateCcw size={18}/></button></div>
    {message && <div className="mx-auto mt-5 flex max-w-md items-center justify-center gap-2 rounded-xl bg-emerald-50 p-3 text-center text-xs text-emerald-700"><CheckCircle2 size={16}/>{message}</div>}{saving && <p className="mt-3 text-center text-xs text-muted">Saving your completed session…</p>}<p className="mt-5 text-center text-xs leading-5 text-muted">Your timer is flexible. Choose a preset or enter any duration from 1 to 240 minutes.</p>
  </div>;
}
