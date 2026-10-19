import { redirect } from "next/navigation";
import { getCurrentFirebaseUser } from "@/lib/firebase-admin";
import { AppShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  let user = null;
  try { user = await getCurrentFirebaseUser(); } catch { redirect("/login?message=setup_required"); }
  if (!user) redirect("/login");
  const email = user.email || "";
  const name = user.name || email.split("@")[0] || "Your account";
  const avatar = user.picture || null;
  return <AppShell userEmail={email} userName={name} avatar={avatar}>{children}</AppShell>;
}
