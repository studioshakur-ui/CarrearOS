import Link from "next/link";

import { ProductDemo } from "@/components/landing/product-demo";
import { Reveal } from "@/components/landing/reveal";

// ─── Primitives ───────────────────────────────────────────────────────────────

function Label({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${light ? "text-slate-500" : "text-slate-400"}`}>
      {children}
    </p>
  );
}

function Divider() {
  return <div className="h-px w-full bg-slate-100" />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-950">Career Agent</span>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-xs font-medium text-slate-500 transition hover:text-slate-900">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center rounded-xl bg-slate-950 px-5 text-xs font-semibold text-white transition hover:bg-slate-700"
          >
            Get access
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 pb-10 pt-16">
        <div className="max-w-2xl">
          <p className="hero-label">
            <Label>UAE Career Intelligence</Label>
          </p>
          <h1 className="hero-h1 mt-5 text-5xl font-semibold leading-[1.1] tracking-tight text-slate-950 sm:text-6xl">
            Every serious application,<br />
            <span className="text-slate-400">done with precision.</span>
          </h1>
          <p className="hero-body mt-7 max-w-xl text-lg leading-8 text-slate-600">
            Career Agent reads your CV, analyses every UAE role you view, and tells you exactly where you stand —
            fit score, real gaps, a tailored message, and an optimised CV. Ready before the deadline.
          </p>
          <div className="hero-cta mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-xl bg-slate-950 px-8 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Start for free
            </Link>
            <Link href="/login" className="text-sm font-medium text-slate-500 transition hover:text-slate-800">
              Already have an account →
            </Link>
          </div>
          <p className="hero-hint mt-5 text-xs text-slate-400">No credit card. UAE roles only. Serious candidates.</p>
        </div>
      </section>

      {/* ── Product demo ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-6 pb-16">
        <Reveal>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:items-start">
            {/* Left: context */}
            <div className="pt-2">
              <Label>Live demo</Label>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                From job list<br />to application kit.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-500">
                See exactly how Career Agent works — matched jobs, instant verdict, and the full kit in three steps.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { n: "1", t: "Browse scored roles", d: "Jobs ranked by your exact skill match before you open a single one." },
                  { n: "2", t: "Instant fit analysis", d: "Apply, Consider, or Pass — visible in under 3 seconds with reasons." },
                  { n: "3", t: "One-click kit", d: "Tailored message, CV snapshot, and a checklist generated on demand." },
                ].map((item) => (
                  <div key={item.n} className="flex gap-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-bold text-slate-400 shadow-sm">
                      {item.n}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.t}</p>
                      <p className="mt-0.5 text-xs leading-5 text-slate-500">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: animated demo */}
            <ProductDemo />
          </div>
        </Reveal>
      </section>

      <Divider />

      {/* ── Value props ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-3">
          {[
            {
              number: "01",
              title: "Know your exact fit",
              body: "No more guessing whether to apply. See a precise match score against every role, with the exact strengths and gaps that drive it.",
              delay: 0,
            },
            {
              number: "02",
              title: "Apply with confidence",
              body: "Get a tailored cover message and an optimised CV snapshot — written for the role, not generic. Ready to send, not a template.",
              delay: 120,
            },
            {
              number: "03",
              title: "Built for the Gulf",
              body: "UAE-first job data. Gulf market context. Roles from Noon, Careem, G42, ADNOC, FAB, and 15+ leading regional employers.",
              delay: 240,
            },
          ].map((item) => (
            <Reveal key={item.number} delay={item.delay}>
              <div className="space-y-3">
                <span className="text-xs font-semibold tracking-[0.2em] text-slate-300">{item.number}</span>
                <p className="text-base font-semibold text-slate-950">{item.title}</p>
                <p className="text-sm leading-7 text-slate-500">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <Reveal>
          <Label>How it works</Label>
        </Reveal>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Upload your CV",
              body: "We extract your skills, experience, and seniority level. Your AI profile is built in seconds.",
              delay: 0,
            },
            {
              step: "2",
              title: "Browse matched roles",
              body: "Every UAE job is scored against your profile. See fit percentage, matched skills, and gaps instantly.",
              delay: 100,
            },
            {
              step: "3",
              title: "Generate your kit",
              body: "One click produces a tailored message, CV optimisation notes, and a ranked application checklist.",
              delay: 200,
            },
          ].map((item) => (
            <Reveal key={item.step} delay={item.delay}>
              <div className="flex gap-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-500 shadow-sm">
                  {item.step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1.5 text-sm leading-6 text-slate-500">{item.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <Reveal>
          <div className="rounded-2xl bg-slate-950 px-10 py-12 text-center sm:px-16">
            <Label light>
              <span className="text-slate-500">Career Agent</span>
            </Label>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Stop applying blindly.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Senior engineers who know their exact fit close faster.<br />
              Build yours today.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center rounded-xl bg-white px-8 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Create your profile
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center rounded-xl border border-slate-700 px-8 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Sign in
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="mx-auto max-w-5xl px-6 py-8">
        <Divider />
        <div className="mt-6 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Career Agent</span>
          <span className="text-xs text-slate-400">UAE-first career intelligence</span>
        </div>
      </footer>
    </div>
  );
}
