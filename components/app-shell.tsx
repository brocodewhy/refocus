"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity, BarChart3, CalendarDays, Check, ChevronRight, CircleUserRound,
  Clock3, LayoutDashboard, LogOut, Moon, Settings, Sparkles, Sun, Target,
  Timer, UserRound, X, Camera, Flame,
} from "lucide-react";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Brand } from "@/components/brand";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, group: "WORKSPACE" },
  { href: "/focus", label: "Focus studio", icon: Clock3, group: "WORKSPACE" },
  { href: "/pomodoro", label: "Pomodoro timer", icon: Timer, group: "WORKSPACE" },
  { href: "/goals", label: "Goals & planner", icon: CalendarDays, group: "WORKSPACE" },
  { href: "/streaks", label: "Habits & streaks", icon: Flame, group: "INSIGHTS" },
  { href: "/wellbeing", label: "Digital wellbeing", icon: Activity, group: "INSIGHTS" },
  { href: "/settings", label: "Settings", icon: Settings, group: "ACCOUNT" },
];
type Profile = { name: string; avatar: string };

export function AppShell({ children, userEmail, userName, avatar }: { children: React.ReactNode; userEmail: string; userName: string; avatar?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<Profile>({ name: userName || "", avatar: avatar || "" });
  const [draftName, setDraftName] = useState(userName || "");
  const [draftAvatar, setDraftAvatar] = useState(avatar || "");
  const [theme, setTheme] = useState("light");
  const [dateLabel, setDateLabel] = useState("");
  const dialogRef = useRef<HTMLFormElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("refocus-profile-v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile({ name: parsed.name || userName, avatar: parsed.avatar || avatar || "" });
        setDraftName(parsed.name || userName);
        setDraftAvatar(parsed.avatar || avatar || "");
      }
      const savedTheme = localStorage.getItem("refocus-theme") || "light";
      setTheme(savedTheme);
      document.documentElement.dataset.theme = savedTheme;
    } catch {}
    setDateLabel(new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
  }, [userName, avatar]);

  useEffect(() => {
    if (!profileOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusable = () => dialog?.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex='-1'])");
    focusable()?.[0]?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [profileOpen]);

  async function handleSignOut() {
    setSigningOut(true);
    try { await fetch("/api/auth/session", { method: "DELETE" }); await firebaseSignOut(auth); }
    finally { router.push("/login"); router.refresh(); }
  }

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const next = { name: draftName.trim() || userName || "Your account", avatar: draftAvatar };
    try { localStorage.setItem("refocus-profile-v1", JSON.stringify(next)); }
    catch { alert("This photo is too large to save. Please choose a smaller image."); return; }
    setProfile(next); setProfileOpen(false);
  }

  function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 1_500_000) { alert("Choose an image under 1.5 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => setDraftAvatar(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("refocus-theme", next); } catch {}
  }

  const grouped = ["WORKSPACE", "INSIGHTS", "ACCOUNT"];
  const firstName = (profile.name || userName || "there").trim().split(/\s+/)[0];

  return (
    <div className="app-frame min-h-screen md:flex">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className="sidebar md:fixed md:inset-y-0 md:flex md:w-[264px] md:flex-col">
        <div className="sidebar-brand"><Link href="/dashboard" aria-label="REFOCUS home"><Brand /></Link></div>
        <div className="workspace-switch"><div className="workspace-mark"><Sparkles size={16}/></div><div className="min-w-0"><p>Personal workspace</p><span>YOUR SPACE TO FOCUS</span></div><ChevronRight size={15} className="workspace-chevron"/></div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {grouped.map(group => <div className="nav-group" key={group}>
            <p className="nav-group-label">{group}</p>
            {links.filter(item => item.group === group).map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
              return <Link key={href} href={href} className={`nav-link ${active ? "nav-link-active" : ""}`} aria-current={active ? "page" : undefined}>
                <span className="nav-icon"><Icon size={17} strokeWidth={1.9}/></span><span>{label}</span>{active && <motion.span layoutId="active-navigation-dot" className="nav-active-dot" transition={reducedMotion ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.32 }}/ >}
              </Link>;
            })}
          </div>)}
        </nav>
        <div className="sidebar-note"><div className="sidebar-note-icon"><Activity size={17}/></div><p className="sidebar-note-title">Progress, not pressure.</p><p className="sidebar-note-copy">Build a rhythm that feels good to you. Small steps count.</p><div className="sidebar-note-line"><span/></div></div>
        <div className="sidebar-profile">
          <button className="profile-trigger" onClick={() => { setDraftName(profile.name || userName); setDraftAvatar(profile.avatar || avatar || ""); setProfileOpen(true); }}>
            {profile.avatar ? <img src={profile.avatar} alt="Profile" className="profile-avatar"/> : <div className="profile-avatar profile-avatar-fallback"><CircleUserRound size={20}/></div>}
            <span className="profile-copy"><strong>{profile.name || userName || "Your account"}</strong><small>{userEmail || "Personal account"}</small></span><span className="profile-edit-mark"><ChevronRight size={15}/></span>
          </button>
          <button onClick={handleSignOut} disabled={signingOut} title="Sign out" aria-label="Sign out" className="signout-button"><LogOut size={16}/></button>
        </div>
      </aside>

      <main id="main-content" tabIndex={-1} className="main-area min-w-0 flex-1 md:ml-[264px]">
        <header className="topbar"><div className="topbar-context"><span className="topbar-kicker"><span className="status-dot"/> YOUR FOCUS SPACE</span><span className="topbar-date">{dateLabel}</span></div><div className="topbar-actions"><button onClick={toggleTheme} className="topbar-icon-button" title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} aria-label="Toggle theme">{theme === "dark" ? <Sun size={17}/> : <Moon size={17}/>}</button><button className="topbar-user" onClick={() => { setDraftName(profile.name || userName); setDraftAvatar(profile.avatar || avatar || ""); setProfileOpen(true); }} aria-label="Edit profile">{profile.avatar ? <img src={profile.avatar} alt=""/> : <span>{firstName.charAt(0).toUpperCase()}</span>}</button></div></header>
        <div className="main-content"><div className="page-content page-enter" key={pathname}>{children}</div><footer className="app-footer"><span>REFOCUS</span><span>Make room for what matters.</span></footer></div>
      </main>

      <AnimatePresence>
      {profileOpen && <motion.div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setProfileOpen(false); }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : .18 }}>
        <motion.form ref={dialogRef} onSubmit={saveProfile} className="profile-modal surface-card" role="dialog" aria-modal="true" aria-labelledby="profile-title" initial={{ opacity: 0, y: 8, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: .985 }} transition={reducedMotion ? { duration: 0 } : { type: "spring", bounce: 0, duration: .3 }}>
          <div className="profile-modal-heading"><div><p className="eyebrow">YOUR ACCOUNT</p><h2 id="profile-title">Edit profile</h2><p>Make this space feel like yours.</p></div><button type="button" onClick={() => setProfileOpen(false)} className="button-icon" aria-label="Close"><X size={18}/></button></div>
          <div className="profile-photo-row">{draftAvatar ? <img src={draftAvatar} alt="Profile preview" className="profile-photo-preview"/> : <div className="profile-photo-preview profile-avatar-fallback"><UserRound size={28}/></div>}<div><label className="button-secondary cursor-pointer"><Camera size={16}/> Choose photo<input className="sr-only" type="file" accept="image/*" onChange={onAvatar}/></label><p className="field-hint">JPG or PNG, up to 1.5 MB</p></div></div>
          <label className="field-label mt-5">Display name<input className="field-input mt-2" value={draftName} onChange={(e) => setDraftName(e.target.value)} maxLength={60} placeholder="Your name"/></label>
          <label className="field-label mt-4">Email<input className="field-input mt-2 opacity-70" value={userEmail} readOnly/></label>
          <p className="field-hint mt-3">Your name and photo are saved in this browser on this device.</p>
          <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setProfileOpen(false)} className="button-secondary">Cancel</button><button type="submit" className="button-primary"><Check size={15}/> Save changes</button></div>
        </motion.form>
      </motion.div>}
      </AnimatePresence>
    </div>
  );
}
