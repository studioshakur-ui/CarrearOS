import Link from "next/link";

// ─── Primitives ───────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{children}</p>
  );
}

function Divider() {
  return <div className="h-px w-full bg-slate-100" />;
}

// ─── Sample output mock ───────────────────────────────────────────────────────

function SampleOutput() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Noon</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">Senior React Engineer · Dubai</p>
        </div>
        <span className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white">Apply</span>
      </div>

      {/* Score row */}
      <div className="flex items-baseline gap-3 border-b border-slate-100 px-6 py-4">
        <span className="text-3xl font-semibold tracking-tight text-slate-950">84%</span>
        <span className="text-sm text-slate-500">fit — strong skill match with minor gaps</span>
      </div>

      {/* Strengths / Gaps */}
      <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
        <div className="px-6 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Strengths</p>
          {["React & TypeScript depth", "GraphQL experience", "Next.js production usage"].map((s) => (
            <p key={s} className="mt-1 flex gap-2 text-xs text-slate-700">
              <span className="text-emerald-500">✓</span> {s}
            </p>
          ))}
        </div>
        <div className="px-6 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Gaps</p>
          {["PostgreSQL at scale", "GraphQL subscriptions"].map((g) => (
            <p key={g} className="mt-1 flex gap-2 text-xs text-slate-700">
              <span className="text-amber-400">△</span> {g}
            </p>
          ))}
        </div>
      </div>

      {/* Message draft */}
      <div className="px-6 py-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Ready-to-send message</p>
        <p className="text-xs italic leading-relaxed text-slate-500">
          &ldquo;Hi [Hiring Manager], I&apos;ve been following Noon&apos;s engineering blog and I&apos;m impressed
          by your approach to performance at scale. With 5 years building React and TypeScript products, including
          two production Next.js apps with GraphQL, I believe I can contribute immediately to your frontend
          delivery pipeline…&rdquo;
        </p>
      </div>
    </div>
  );
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
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-16">
        <div className="max-w-3xl">
          <Label>UAE Career Intelligence</Label>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.1] tracking-tight text-slate-950 sm:text-6xl">
            Every serious application,<br />
            <span className="text-slate-400">done with precision.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
            Career Agent reads your CV, analyses every UAE role you view, and tells you exactly where you stand —
            fit score, real gaps, a tailored message, and an optimised CV. Ready before the deadline.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
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
          <p className="mt-5 text-xs text-slate-400">No credit card. UAE roles only. Serious candidates.</p>
        </div>
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
            },
            {
              number: "02",
              title: "Apply with confidence",
              body: "Get a tailored cover message and an optimised CV snapshot — written for the role, not generic. Ready to send, not a template.",
            },
            {
              number: "03",
              title: "Built for the Gulf",
              body: "UAE-first job data. Gulf market context. Roles from Noon, Careem, G42, ADNOC, FAB, and 15+ leading regional employers.",
            },
          ].map((item) => (
            <div key={item.number} className="space-y-3">
              <span className="text-xs font-semibold tracking-[0.2em] text-slate-300">{item.number}</span>
              <p className="text-base font-semibold text-slate-950">{item.title}</p>
              <p className="text-sm leading-7 text-slate-500">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <Label>How it works</Label>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Upload your CV",
              body: "We extract your skills, experience, and seniority level. Your AI profile is built in seconds.",
            },
            {
              step: "2",
              title: "Browse matched roles",
              body: "Every UAE job is scored against your profile. See fit percentage, matched skills, and gaps instantly.",
            },
            {
              step: "3",
              title: "Generate your kit",
              body: "One click produces a tailored message, CV optimisation notes, and a ranked application checklist.",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-500 shadow-sm">
                {item.step}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── Sample output ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <Label>Sample analysis</Label>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              The full picture,<br />not a keyword count.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">
              Every job analysis shows you the recommendation, a precise score, what makes you strong, what needs
              addressing, and the exact message to send. No filler. No generic advice.
            </p>
            <div className="mt-8 space-y-3">
              {["Recommendation in under 3 seconds", "Exact skill-level gap analysis", "Ready-to-send outreach message", "Tailored CV snapshot"].map((point) => (
                <p key={point} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {point}
                </p>
              ))}
            </div>
          </div>
          <SampleOutput />
        </div>
      </section>

      <Divider />

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="rounded-2xl bg-slate-950 px-10 py-12 text-center sm:px-16">
          <Label>
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
