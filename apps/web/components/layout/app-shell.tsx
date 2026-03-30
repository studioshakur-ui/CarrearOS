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
      <aside className="hidden w-[188px] shrink-0 flex-col border-r border-[#1c1c1c] bg-[#0c0c0c] lg:flex">

        {/* Logo */}
        <Link href="/" className="block border-b border-[#1c1c1c] px-6 py-6">
          <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-white/20">
            Career Agent
          </p>
          <p className="mt-2 text-[13px] font-medium leading-snug text-white/60">
            Gulf Career<br />Intelligence
          </p>
        </Link>

        {/* Nav */}
        <div className="flex-1 px-3 py-5">
          <NavLinks />
        </div>

        {/* User */}
        <div className="border-t border-[#1c1c1c] px-5 py-5">
          <p className="truncate text-[11px] leading-5 text-white/25">{userEmail}</p>
          {logoutAction && (
            <form action={logoutAction} className="mt-2">
              <button type="submit" className="text-[10px] tracking-wide text-white/20 transition hover:text-white/45">
                Sign out
              </button>
            </form>
          )}
        </div>
      </aside>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 bg-[#f7f6f3]">
        <div className="min-h-screen px-12 py-10">
          {children}
        </div>
      </main>

    </div>
  );
}
