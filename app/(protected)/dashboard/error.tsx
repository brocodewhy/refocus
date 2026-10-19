"use client";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="surface-card rounded-2xl border p-6" role="alert">
      <p className="eyebrow">DASHBOARD UNAVAILABLE</p>
      <h1 className="mt-2 text-xl font-bold text-ink">Your overview could not load.</h1>
      <p className="mt-2 text-sm text-muted">Your saved data is unchanged. Try loading the dashboard again.</p>
      <button className="button-primary mt-5" onClick={() => reset()}>Try again</button>
    </section>
  );
}