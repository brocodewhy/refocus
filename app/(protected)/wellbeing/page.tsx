import { UsageLogger } from "@/components/usage-logger";
import { FadeIn } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";
import { Heart, Info } from "lucide-react";

export default function WellbeingPage() {
 return <div><SectionHeading eyebrow="NOTICE YOUR PATTERNS" title="Digital wellbeing." subtitle="Record your app usage and reflect on where your attention goes. Entries are manual — REFOCUS cannot automatically read device screen-time data."/><FadeIn><UsageLogger/></FadeIn><div className="mt-5 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4"><Info className="mt-0.5 shrink-0 text-blue-600" size={18}/><p className="text-xs leading-5 text-blue-800">These insights are based on the data you enter. They are not a diagnosis or a judgement about how you use technology.</p></div><div className="mt-5 rounded-2xl border border-rose-100 bg-white p-5"><div className="flex items-center gap-2 text-rose-500"><Heart size={18}/><h3 className="text-sm font-extrabold text-ink">Reflect gently</h3></div><p className="mt-2 text-sm leading-6 text-muted">Ask yourself: Was this time intentional? Did it help me rest, connect, learn, or complete something important?</p></div></div>;
}
