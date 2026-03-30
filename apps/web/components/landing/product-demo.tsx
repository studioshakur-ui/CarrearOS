"use client";

import { useEffect, useState } from "react";

// ─── Screen data ──────────────────────────────────────────────────────────────

const SCREENS = [
  {
    id: "jobs",
    url: "career-agent.io/app/jobs",
    label: "01 · UAE Roles",
    description: "Curated roles, scored against your profile before you even click.",
  },
  {
    id: "detail",
    url: "career-agent.io/app/jobs/noon-react-engineer",
    label: "02 · Fit Analysis",
    description: "Instant verdict. Exact strengths, real gaps, no guesswork.",
  },
  {
    id: "kit",
    url: "career-agent.io/app/jobs/noon-react-engineer",
    label: "03 · Application Kit",
    description: "Ready-to-send message, optimised CV, ranked checklist. One click.",
  },
] as const;

type ScreenId = (typeof SCREENS)[number]["id"];

// ─── Screen renderers ─────────────────────────────────────────────────────────

function JobsScreen() {
  const jobs = [
    { title: "Senior React Engineer", company: "Noon", city: "Dubai", score: 84, level: "Senior", remote: "Hybrid", skills: ["React", "TypeScript", "Next.js"], color: "bg-emerald-500" },
    { title: "Staff Engineer",        company: "Majid Al Futtaim", city: "Dubai", score: 71, level: "Lead",   remote: "Hybrid", skills: ["Node.js", "System Design"], color: "bg-emerald-500" },
    { title: "Senior ML Engineer",    company: "G42",              city: "Abu Dhabi", score: 48, level: "Senior", remote: "Hybrid", skills: ["Python", "PyTorch"], color: "bg-amber-400" },
    { title: "Platform Engineer",     company: "ADNOC Digital",   city: "Abu Dhabi", score: 40, level: "Senior", remote: "Onsite", skills: ["AWS", "Terraform"], color: "bg-amber-400" },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-xs font-semibold text-slate-950">UAE Roles</p>
        <p className="text-[10px] text-slate-400">20 curated positions · sorted by match</p>
      </div>
      <div className="flex-1 divide-y divide-slate-100 overflow-hidden">
        {jobs.map((job, i) => (
          <div
            key={job.title}
            className="flex items-center gap-3 px-4 py-2.5 transition-colors"
            style={{
              animationDelay: `${i * 80}ms`,
              opacity: 1,
            }}
          >
            <div className={`h-full w-0.5 self-stretch rounded-full ${job.color}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-[11px] font-semibold text-slate-900">{job.title}</p>
                <span className={`shrink-0 rounded-full px-1.5 py-px text-[9px] font-bold text-white ${job.color}`}>
                  {job.score}%
                </span>
              </div>
              <p className="mt-0.5 truncate text-[10px] text-slate-400">
                {job.company} · {job.city} 🇦🇪 · {job.remote}
              </p>
              <div className="mt-1 flex gap-1">
                {job.skills.map((s) => (
                  <span key={s} className="rounded border border-emerald-200 bg-emerald-50 px-1 text-[9px] text-emerald-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailScreen() {
  return (
    <div className="flex h-full flex-col">
      {/* Verdict banner */}
      <div className="flex items-center gap-3 bg-emerald-600 px-4 py-4">
        <span className="text-2xl font-bold text-white">Apply</span>
        <div className="h-6 w-px bg-white/30" />
        <span className="text-2xl font-semibold text-white">84%</span>
        <p className="text-[10px] leading-tight text-white/80">Strong skill match with minor gaps in PostgreSQL at scale</p>
      </div>

      <div className="flex-1 overflow-hidden px-4 py-3 space-y-3">
        {/* Strengths */}
        <div>
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-slate-400">Strengths</p>
          {["React & TypeScript depth", "GraphQL production experience", "Next.js delivery pipeline"].map((s) => (
            <p key={s} className="flex gap-1.5 text-[10px] text-slate-700 leading-5">
              <span className="text-emerald-500 shrink-0">✓</span> {s}
            </p>
          ))}
        </div>

        {/* Gaps */}
        <div>
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-slate-400">Gaps</p>
          {["PostgreSQL at scale", "GraphQL subscriptions"].map((g) => (
            <p key={g} className="flex gap-1.5 text-[10px] text-slate-700 leading-5">
              <span className="text-amber-400 shrink-0">△</span> {g}
            </p>
          ))}
        </div>

        {/* Score bar */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-slate-400">Skill match</span>
            <span className="text-[9px] font-semibold text-slate-700">84%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-[84%] rounded-full bg-emerald-500 transition-all duration-1000" />
          </div>
        </div>
      </div>
    </div>
  );
}

function KitScreen() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-slate-100 px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
          ✓ Kit ready · Noon · Senior React Engineer
        </span>
      </div>

      <div className="flex-1 overflow-hidden divide-y divide-slate-100">
        {/* Message */}
        <div className="px-4 py-3">
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-slate-400">Ready-to-send message</p>
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[10px] italic leading-[1.6] text-slate-600">
            &ldquo;Hi [Hiring Manager], I&apos;ve been following Noon&apos;s engineering blog and your approach to performance at scale.
            With 5 years building React and TypeScript products in production, including two Next.js apps with GraphQL, I can contribute immediately…&rdquo;
          </p>
        </div>

        {/* Checklist */}
        <div className="px-4 py-3">
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-slate-400">Application checklist</p>
          {[
            "Add PostgreSQL project to GitHub README",
            "Highlight Next.js performance case study",
            "Send connection request before applying",
          ].map((step, i) => (
            <div key={step} className="flex items-start gap-2 mb-1.5">
              <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border border-slate-300 text-[8px] font-bold text-slate-400">
                {i + 1}
              </span>
              <p className="text-[10px] leading-[1.5] text-slate-700">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Browser chrome wrapper ───────────────────────────────────────────────────

function BrowserChrome({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
      {/* Chrome bar */}
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-1">
          <p className="text-[10px] text-slate-400">{url}</p>
        </div>
      </div>
      {/* Content */}
      <div className="h-[340px]">{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProductDemo() {
  const [active, setActive] = useState<ScreenId>("jobs");
  const [transitioning, setTransitioning] = useState(false);

  // Auto-advance
  useEffect(() => {
    const ids: ScreenId[] = ["jobs", "detail", "kit"];
    const interval = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setActive((cur) => {
          const idx = ids.indexOf(cur);
          return ids[(idx + 1) % ids.length];
        });
        setTransitioning(false);
      }, 300);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  function switchTo(id: ScreenId) {
    if (id === active) return;
    setTransitioning(true);
    setTimeout(() => {
      setActive(id);
      setTransitioning(false);
    }, 250);
  }

  const current = SCREENS.find((s) => s.id === active)!;

  return (
    <div className="w-full">
      {/* Step tabs */}
      <div className="mb-4 flex gap-2">
        {SCREENS.map((screen) => (
          <button
            key={screen.id}
            onClick={() => switchTo(screen.id)}
            className={`flex-1 rounded-lg border px-3 py-2 text-left transition-all duration-200 ${
              screen.id === active
                ? "border-slate-900 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
            }`}
          >
            <p className="text-[9px] font-semibold uppercase tracking-widest opacity-60">
              {screen.label}
            </p>
          </button>
        ))}
      </div>

      {/* Caption */}
      <p
        className="mb-3 min-h-[1.25rem] text-xs text-slate-500 transition-opacity duration-300"
        style={{ opacity: transitioning ? 0 : 1 }}
      >
        {current.description}
      </p>

      {/* Browser */}
      <div
        className="transition-opacity duration-300"
        style={{ opacity: transitioning ? 0 : 1 }}
      >
        <BrowserChrome url={current.url}>
          {active === "jobs"   && <JobsScreen />}
          {active === "detail" && <DetailScreen />}
          {active === "kit"    && <KitScreen />}
        </BrowserChrome>
      </div>

      {/* Progress dots */}
      <div className="mt-3 flex justify-center gap-1.5">
        {SCREENS.map((screen) => (
          <button
            key={screen.id}
            onClick={() => switchTo(screen.id)}
            className={`h-1 rounded-full transition-all duration-300 ${
              screen.id === active ? "w-6 bg-slate-900" : "w-1.5 bg-slate-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
