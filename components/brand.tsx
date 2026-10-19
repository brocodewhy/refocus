import { Sparkles } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-white shadow-md shadow-violet-200">
        <Sparkles size={19} />
      </div>
      {!compact && <div><div className="text-[17px] font-extrabold tracking-tight text-ink">REFOCUS</div><div className="text-[10px] tracking-wide text-muted">Notice. Refocus. Continue.</div></div>}
    </div>
  );
}
