"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Chrome, LoaderCircle } from "lucide-react";

export function GoogleLogin() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function signIn() {
    setBusy(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken(true);
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not create your session.");
      router.replace("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign in with Google.");
      setBusy(false);
    }
  }

  return <div className="w-full">
    <button onClick={signIn} disabled={busy} className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md disabled:opacity-60">{busy ? <LoaderCircle className="animate-spin" size={18}/> : <Chrome size={18}/>} Continue with Google</button>
    {error && <p className="mt-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
  </div>;
}
