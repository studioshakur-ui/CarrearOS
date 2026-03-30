import Link from "next/link";
import { BriefcaseBusiness, FileText, LayoutDashboard, UserCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  { href: "/app/onboarding", label: "Onboarding", icon: LayoutDashboard },
  { href: "/app/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/app/profile", label: "Profile", icon: UserCircle2 },
  { href: "/app/cv", label: "CV", icon: FileText },
];

type AppShellProps = {
  title: string;
  eyebrow: string;
  description: string;
  userEmail?: string;
  logoutAction?: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
};

export function AppShell({ title, eyebrow, description, userEmail, logoutAction, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-white/70 bg-white/75 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur md:flex md:flex-col">
          <Link href="/" className="rounded-2xl px-3 py-2">
            <div className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Career Agent</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">Premium Career Copilot</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Gulf-first guidance for focused job search, profile management, and CV readiness.
            </p>
          </Link>

          <nav className="mt-8 space-y-1">
            {navigation.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="rounded-3xl border border-white/70 bg-white/80 px-6 py-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">{eyebrow}</div>
            <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
              </div>
              <div className="flex flex-col items-start gap-3 lg:items-end">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Session</div>
                  <div className="mt-1 text-sm font-medium text-slate-800">{userEmail ?? "Authenticated user"}</div>
                </div>
                {logoutAction ? (
                  <form action={logoutAction}>
                    <Button variant="outline" size="sm" type="submit">
                      Log out
                    </Button>
                  </form>
                ) : null}
              </div>
            </div>
          </header>

          <main className="mt-6 flex-1 rounded-3xl border border-white/70 bg-white p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] sm:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
