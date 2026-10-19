
import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  Flame,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { FadeIn } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";
import { getCurrentFirebaseUser } from "@/lib/firebase-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { DashboardChart } from "@/components/dashboard-chart";
import { DashboardGoalProgress } from "@/components/dashboard-goal-progress";
import { AnimatedNumber } from "@/components/animated-number";

type UsageEntry = {
  id: string;
  app_name: string;
  minutes: number;
  entry_date: string;
};

type FocusSession = {
  id: string;
  duration_minutes: number;
  completed_at: string;
};

export default async function DashboardPage() {
  const user = await getCurrentFirebaseUser();

  let sessions: FocusSession[] = [];
  let entries: UsageEntry[] = [];
  let dataError = false;

  if (user) {
    try {
      const supabase = createAdminSupabaseClient();

      const { data: sessionData, error: sessionError } = await supabase
        .from("focus_sessions")
        .select("id, duration_minutes, completed_at")
        .eq("firebase_uid", user.uid)
        .order("completed_at", { ascending: false })
        .limit(500);

      if (sessionError) {
        dataError = true;
        console.error("Dashboard sessions load failed:", sessionError);
      } else {
        sessions = (sessionData ?? []) as FocusSession[];
      }

      const { data: usageData, error: usageError } = await supabase
        .from("usage_entries")
        .select("id, app_name, minutes, entry_date")
        .eq("firebase_uid", user.uid)
        .order("entry_date", { ascending: false })
        .limit(500);

      if (usageError) {
        dataError = true;
        console.error("Dashboard usage load failed:", usageError);
      } else {
        entries = (usageData ?? []) as UsageEntry[];
      }
    } catch (error) {
      dataError = true;
      console.error("Dashboard data load failed:", error);
    }
  }

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  const getIndiaDate = (value: string) =>
    new Date(value).toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
  const shiftIndiaDate = (dateKey: string, offset: number) => {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day + offset, 12)).toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
  };

  const todaySessions = sessions.filter(
    (session) => getIndiaDate(session.completed_at) === today
  );

  const todayMinutes = todaySessions.reduce(
    (sum, session) => sum + (Number(session.duration_minutes) || 0),
    0
  );

  const todayEntries = entries.filter(
    (entry) => entry.entry_date === today
  );

  const websiteTotals = Object.values(
    todayEntries.reduce<Record<string, UsageEntry>>((totals, entry) => {
      const key = entry.app_name.toLowerCase();
      const existing = totals[key];

      if (existing) {
        existing.minutes = Math.max(
          existing.minutes,
          Number(entry.minutes) || 0
        );
      } else {
        totals[key] = { ...entry, app_name: key };
      }

      return totals;
    }, {})
  ).sort((a, b) => b.minutes - a.minutes);

  const usageToday = websiteTotals.reduce(
    (sum, entry) => sum + entry.minutes,
    0
  );

  const activeDays = new Set(sessions.map((session) => getIndiaDate(session.completed_at)));
  let streak = 0;
  let streakDate = today;
  if (!activeDays.has(streakDate)) streakDate = shiftIndiaDate(streakDate, -1);
  while (activeDays.has(streakDate) && streak < 366) {
    streak += 1;
    streakDate = shiftIndiaDate(streakDate, -1);
  }

  const weekly = Array.from({ length: 7 }, (_, i) => {
    const dateKey = shiftIndiaDate(today, i - 6);
    const date = new Date(`${dateKey}T12:00:00+05:30`);

    return {
      day: date.toLocaleDateString("en-US", {
        weekday: "short",
        timeZone: "Asia/Kolkata",
      }),
      focusMinutes: sessions
        .filter((session) => getIndiaDate(session.completed_at) === dateKey)
        .reduce(
          (sum, session) =>
            sum + (Number(session.duration_minutes) || 0),
          0
        ),
      screenMinutes: Object.values(entries
        .filter((entry) => entry.entry_date === dateKey)
        .reduce<Record<string, number>>((totals, entry) => {
          const key = entry.app_name.toLowerCase();
          totals[key] = Math.max(totals[key] || 0, Number(entry.minutes) || 0);
          return totals;
        }, {}))
        .reduce((sum, minutes) => sum + minutes, 0),
    };
  });

  const firstName = typeof user?.name === "string" ? user.name.split(/\s+/)[0] : "there";
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const recentSessions = sessions.slice(0, 4);

  return (
    <div>
      <SectionHeading
        eyebrow="YOUR PERSONAL SPACE"
        title={`${greeting}, ${firstName}.`}
        subtitle="A clear view of your focus and digital habits, without the pressure to be perfect."
        action={
          <div className="rounded-xl border border-violet-100 bg-white px-4 py-2 text-xs font-semibold text-muted">
            Today ·{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              timeZone: "Asia/Kolkata",
            })}
          </div>
        }
      />

      {dataError && <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900" role="alert">Some dashboard data could not be loaded. The figures below may be incomplete; refresh to try again.</div>}

      <FadeIn
        className="mb-6 grid gap-4 lg:grid-cols-[1.45fr_1fr]"
        delay={0.05}
      >
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#7667E8] via-[#8778EB] to-[#B7A8FA] p-6 text-white shadow-soft sm:p-8">
          <div className="absolute -right-8 -top-10 h-48 w-48 rounded-full border-[28px] border-white/10" />
          <div className="absolute bottom-[-50px] right-28 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
              <Sparkles size={14} /> A fresh start
            </div>
            <h2 className="mt-5 max-w-md text-3xl font-extrabold leading-tight sm:text-4xl">
              Protect your attention. Make space for progress.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/80">
              One focused session is a win. Ready to begin?
            </p>
            <Link
              href="/focus"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Start a focus session <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>

        <DashboardGoalProgress todayMinutes={todayMinutes} />
      </FadeIn>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Focus minutes",
            value: todayMinutes,
            sub: "completed today",
            icon: Clock3,
            color: "bg-violet-50 text-violet-600",
          },
          {
            label: "Sessions",
            value: todaySessions.length,
            sub: "completed today",
            icon: Target,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Website time",
            value: usageToday,
            sub: "tracked today",
            icon: TrendingUp,
            color: "bg-amber-50 text-amber-600",
          },
          {
            label: "Current streak",
            value: `${streak} day${streak === 1 ? "" : "s"}`,
            sub: streak ? "consecutive active days" : "start with one focus session",
            icon: Flame,
            color: "bg-rose-50 text-rose-600",
          },
        ].map((card, i) => (
          <FadeIn key={card.label} delay={0.08 + i * 0.05}>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted">
                  {card.label}
                </span>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.color}`}
                >
                  <card.icon size={18} />
                </span>
              </div>
              <p className="mt-4 text-2xl font-extrabold text-ink">
                {typeof card.value === "number" ? <AnimatedNumber value={card.value} /> : card.value}
                {card.label === "Website time" && <span className="ml-1 text-sm font-semibold text-muted">min</span>}
              </p>
              <p className="mt-1 text-xs text-muted">{card.sub}</p>
            </div>
          </FadeIn>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-soft sm:p-6">
        <h3 className="font-extrabold text-ink">Today's tracked screen time</h3>
        <p className="mt-1 text-xs text-muted">
          App and site totals recorded for today
        </p>

        <div className="mt-4 space-y-3">
          {websiteTotals.length === 0 ? (
            <p className="text-sm text-muted">
              No screen-time entries recorded today yet.
            </p>
          ) : (
            websiteTotals.map((entry) => (
              <div
                key={entry.app_name}
                className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
              >
                <span className="text-sm font-semibold text-ink">
                  {entry.app_name}
                </span>
                <span className="text-sm font-bold text-brand">
                  {entry.minutes} min
                </span>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 border-t border-slate-100 pt-3 text-sm font-bold text-ink">
          Total tracked: {usageToday} minutes
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <FadeIn
          delay={0.15}
          className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-soft sm:p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-ink">Your focus rhythm</h3>
              <p className="mt-1 text-xs text-muted">
                Focus and tracked screen time · last 7 days
              </p>
            </div>
            <div className="rounded-lg bg-violet-50 p-2 text-brand">
              <TrendingUp size={17} />
            </div>
          </div>
          <DashboardChart data={weekly} />
        </FadeIn>

        <FadeIn delay={0.2} className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-ink">Recent focus sessions</h3>
              <p className="mt-1 text-xs text-muted">Your latest completed sessions</p>
            </div>
            <Clock3 size={18} className="text-brand" />
          </div>
          {recentSessions.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-5 text-sm text-muted">Completed sessions will appear here after your first focus timer.</div>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentSessions.map((session) => <li key={session.id} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <span className="text-sm font-semibold text-ink">{new Date(session.completed_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })}</span>
                <span className="text-sm font-bold text-brand">{session.duration_minutes} min</span>
              </li>)}
            </ul>
          )}
          <Link href="/wellbeing" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand hover:gap-3">Review digital wellbeing <ArrowUpRight size={16} /></Link>
        </FadeIn>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/streaks"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-ink transition hover:border-violet-200"
        >
          <Flame className="mr-2 inline" size={16} /> View streaks
        </Link>
        <Link
          href="/goals"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-ink transition hover:border-violet-200"
        >
          <Target className="mr-2 inline" size={16} /> Plan your day
        </Link>
      </div>
    </div>
  );
}
