import Link from "next/link";

import { ProductDemo } from "@/components/landing/product-demo";
import { Reveal } from "@/components/landing/reveal";

// ─── Primitives ───────────────────────────────────────────────────────────────

function Divider() {
  return <div className="h-px w-full bg-slate-100" />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ══ DARK ZONE ══════════════════════════════════════════════════════════ */}
      <div className="bg-slate-950">

        {/* ── Nav ─────────────────────────────────────────────────────────── */}
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white">
            Career Agent
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-medium text-slate-400 transition hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-8 items-center rounded-lg bg-white px-4 text-xs font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Get access
            </Link>
          </div>
        </nav>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="hero-spotlight mx-auto max-w-4xl px-6 pb-14 pt-20 text-center">
          <p className="hero-label inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            UAE Career Intelligence
          </p>
          <h1 className="hero-h1 mt-6 text-6xl font-semibold leading-[1.08] tracking-tight text-white sm:text-7xl">
            Every serious application,
            <br />
            <span className="text-slate-500">done with precision.</span>
          </h1>
          <p className="hero-body mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-400">
            Career Agent reads your CV, analyses every UAE role you view, and
            tells you exactly where you stand — fit score, real gaps, a
            tailored message. Ready before the deadline.
          </p>
          <div className="hero-cta mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-xl bg-white px-8 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Start for free
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center rounded-xl border border-slate-700 px-8 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Sign in
            </Link>
          </div>
          <p className="hero-hint mt-4 text-xs text-slate-600">
            No credit card. UAE roles only. Serious candidates.
          </p>
        </section>

        {/* ── Social proof ────────────────────────────────────────────────── */}
        <div className="hero-proof border-t border-slate-800/60 py-5">
          <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            Roles from leading UAE employers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6">
            {["Noon", "Careem", "G42", "ADNOC", "FAB", "Mastercard", "e&", "Mubadala"].map(
              (co) => (
                <span key={co} className="text-xs font-semibold text-slate-500">
                  {co}
                </span>
              )
            )}
          </div>
        </div>

        {/* ── Product demo ────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-6 pb-20 pt-10">
          <Reveal>
            <ProductDemo dark />
          </Reveal>
        </section>
      </div>

      {/* ══ LIGHT ZONE ════════════════════════════════════════════════════════= */}

      {/* ── Value props ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
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
                <span className="text-xs font-semibold tracking-[0.2em] text-slate-300">
                  {item.number}
                </span>
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
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            How it works
          </p>
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Career Agent
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Stop applying blindly.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Senior engineers who know their exact fit close faster.
              <br />
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
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            Career Agent
          </span>
          <span className="text-xs text-slate-400">UAE-first career intelligence</span>
        </div>
      </footer>
    </div>
  );
}
