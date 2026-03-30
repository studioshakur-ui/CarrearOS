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
    <div className="flex min-h-screen">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="hidden w-52 shrink-0 flex-col border-r border-white/[0.07] bg-[#0d0d0d] lg:flex">

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-white/[0.07]">
          <Link href="/" className="block group">
            <p className="text-[9px] font-semibold uppercase tracking-[0.26em] text-white/25">Career Agent</p>
            <p className="mt-1 text-[13px] font-semibold leading-tight text-white/75">Gulf Career<br />Intelligence</p>
          </Link>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4">
          <NavLinks />
        </div>

        {/* User footer */}
        <div className="border-t border-white/[0.07] px-4 py-4">
          <p className="truncate text-[11px] text-white/25">{userEmail}</p>
          {logoutAction && (
            <form action={logoutAction} className="mt-2">
              <button type="submit" className="text-[11px] font-medium text-white/25 transition hover:text-white/50">
                Sign out
              </button>
            </form>
          )}
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 bg-white">
        <div className="h-full min-h-screen px-10 py-10">
          {children}
        </div>
      </main>

    </div>
  );
}
