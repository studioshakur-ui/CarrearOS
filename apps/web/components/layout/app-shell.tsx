import Link from "next/link";

import { NavLinks } from "@/components/layout/nav-links";

type AppShellProps = {
  title: string;
  eyebrow: string;
  description: string;
  userEmail?: string;
  logoutAction?: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
};

export function AppShell({ userEmail, logoutAction, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-white">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="hidden w-[200px] shrink-0 flex-col border-r border-[#1e1e1e] bg-[#0d0d0d] lg:flex">

        {/* Logo */}
        <Link href="/" className="block border-b border-[#1e1e1e] px-5 py-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">Career Agent</p>
          <p className="mt-1.5 text-[13px] font-semibold text-white/70 leading-snug">Gulf Career<br />Intelligence</p>
        </Link>

        {/* Nav */}
        <div className="flex-1 px-2 py-3">
          <NavLinks />
        </div>

        {/* User */}
        <div className="border-t border-[#1e1e1e] px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white/50">
              {userEmail?.charAt(0).toUpperCase()}
            </div>
            <p className="truncate text-[11px] text-white/30">{userEmail}</p>
          </div>
          {logoutAction && (
            <form action={logoutAction} className="mt-2.5">
              <button type="submit" className="text-[10px] font-medium text-white/20 transition hover:text-white/50">
                Sign out →
              </button>
            </form>
          )}
        </div>
      </aside>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-w-0 flex-col">
        <main className="flex-1 px-10 py-8">
          {children}
        </main>
      </div>

    </div>
  );
}
