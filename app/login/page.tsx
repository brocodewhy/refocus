import { Brand } from "@/components/brand";
import { GoogleLogin } from "@/components/google-login";
import { FadeIn } from "@/components/motion";
import { CheckCircle2, Clock3, Heart, Sparkles } from "lucide-react";

export default function LoginPage() {
  return <main className="refocus-login min-h-screen bg-white lg:grid lg:grid-cols-2">
    <section className="login-visual relative flex min-h-[44vh] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#F3F0FF] via-[#FBFAFF] to-[#F8F3FF] p-7 sm:p-12 lg:min-h-screen lg:p-16">
      <div className="soft-grid absolute inset-0 opacity-60"/>
      <div className="relative"><Brand/></div>
      <FadeIn delay={.1} className="relative my-12 max-w-xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-brand"><Sparkles size={14}/> Your space to reset</div>
        <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-6xl">Make room for <span className="text-brand">what matters.</span></h1>
        <p className="mt-5 max-w-md text-base leading-7 text-slate-600">Understand your digital habits, protect your attention, and build a focus rhythm that feels good.</p>
        <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
          {[["01","Notice"],["02","Refocus"],["03","Continue"]].map(([n,label])=><div key={label} className="rounded-2xl border border-white bg-white/80 p-3 shadow-sm"><div className="text-xs font-bold text-brand">{n}</div><div className="mt-1 text-sm font-bold text-ink">{label}</div></div>)}
        </div>
      </FadeIn>
      <div className="relative text-xs text-slate-400">A calmer digital life starts with one small step.</div>
    </section>
    <section className="flex items-center justify-center px-6 py-14 sm:px-12 lg:min-h-screen">
      <FadeIn delay={.2} className="w-full max-w-md">
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand"><Heart size={25}/></div>
        <p className="text-xs font-extrabold uppercase tracking-[.18em] text-brand">Welcome to REFOCUS</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink">Your next chapter starts here.</h2>
        <p className="mt-3 text-sm leading-6 text-muted">Sign in with Google to save your sessions, goals, and progress to your personal account.</p>
        <div className="mt-8"><GoogleLogin/></div>
        <div className="mt-7 flex items-start gap-3 rounded-2xl bg-slate-50 p-4"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500"/><p className="text-xs leading-5 text-slate-500">Your dashboard is private to your account. You can sign out whenever you like.</p></div>
        <p className="mt-8 text-center text-[11px] leading-5 text-slate-400">By continuing, you agree to use REFOCUS thoughtfully. This student prototype is not a medical tool.</p>
      </FadeIn>
    </section>
  </main>;
}
