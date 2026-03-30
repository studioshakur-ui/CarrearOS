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
    <div className="flex min-h-screen bg-[#111111]">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a0a] lg:flex">

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-white/[0.06]">
          <Link href="/" className="block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">Career Agent</p>
            <p className="mt-0.5 text-sm font-semibold text-white/80">Gulf Career Intelligence</p>
          </Link>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks />
        </div>

        {/* User footer */}
        <div className="border-t border-white/[0.06] px-4 py-4">
          <p className="truncate text-[11px] text-white/30">{userEmail}</p>
          {logoutAction && (
            <form action={logoutAction} className="mt-2">
              <button
                type="submit"
                className="text-[11px] font-medium text-white/30 transition hover:text-white/60"
              >
                Sign out
              </button>
            </form>
          )}
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden bg-[#f9f9f9]">
        <div className="h-full min-h-screen overflow-y-auto px-8 py-8 lg:px-12">
          {children}
        </div>
      </main>

    </div>
  );
}
