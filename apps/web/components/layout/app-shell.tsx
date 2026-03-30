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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-0 lg:gap-6 px-0 lg:px-6 py-0 lg:py-6">

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside className="hidden w-60 shrink-0 lg:flex lg:flex-col">
          <div className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm">

            {/* Logo */}
            <div className="px-5 pt-6 pb-4 border-b border-slate-100">
              <Link href="/" className="block">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Career Agent</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">Gulf Career Intelligence</p>
              </Link>
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <NavLinks />
            </div>

            {/* User footer */}
            <div className="border-t border-slate-100 px-4 py-4">
              <p className="truncate text-[11px] text-slate-500">{userEmail}</p>
              {logoutAction && (
                <form action={logoutAction} className="mt-2">
                  <button
                    type="submit"
                    className="text-[11px] font-medium text-slate-400 transition hover:text-slate-700"
                  >
                    Sign out
                  </button>
                </form>
              )}
            </div>
          </div>
        </aside>

        {/* ── Main ─────────────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-hidden rounded-none lg:rounded-2xl border-0 lg:border border-slate-200/80 bg-white shadow-sm">
          <div className="h-full overflow-y-auto px-6 py-8 sm:px-8">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
