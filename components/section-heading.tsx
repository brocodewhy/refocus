export function SectionHeading({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div>{eyebrow && <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.2em] text-brand">{eyebrow}</p>}<h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-[34px]">{title}</h1>{subtitle && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{subtitle}</p>}</div>{action}</div>;
}
