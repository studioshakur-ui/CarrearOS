import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
      <div className="max-w-3xl rounded-[2rem] border border-white/70 bg-white/85 p-10 shadow-[0_30px_90px_-52px_rgba(15,23,42,0.4)] backdrop-blur">
        <div className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">Career Agent</div>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Premium career infrastructure, kept intentionally lean.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
          This foundation sets up the web app, the shell for authenticated surfaces, and the Supabase scaffolding
          without drifting into business logic.
        </p>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
          Supabase diagnostic endpoint: <code className="font-medium text-slate-900">/api/health/supabase</code>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/signup">Create account</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
