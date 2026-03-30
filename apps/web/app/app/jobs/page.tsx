import Link from "next/link";
import { redirect } from "next/navigation";

import { computeMatch, type FitLabel } from "@/lib/matching/score";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSalary(min?: number | null, max?: number | null, currency?: string | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
  const curr = currency ?? "AED";
  if (min && max) return `${fmt(min)}–${fmt(max)} ${curr}`;
  if (min) return `${fmt(min)}+ ${curr}`;
  return `≤${fmt(max!)} ${curr}`;
}

const SCORE_CONFIG: Record<FitLabel, {
  bar: string; scoreText: string; labelText: string;
  chipBg: string; chipBorder: string; chipText: string;
  avatarBg: string; avatarText: string;
}> = {
  "Good fit": {
    bar: "bg-emerald-500", scoreText: "text-emerald-600", labelText: "text-emerald-500",
    chipBg: "bg-emerald-50", chipBorder: "border-emerald-200", chipText: "text-emerald-700",
    avatarBg: "bg-emerald-100", avatarText: "text-emerald-700",
  },
  "Partial fit": {
    bar: "bg-amber-400", scoreText: "text-amber-600", labelText: "text-amber-500",
    chipBg: "bg-amber-50", chipBorder: "border-amber-200", chipText: "text-amber-700",
    avatarBg: "bg-amber-100", avatarText: "text-amber-700",
  },
  "Low fit": {
    bar: "bg-slate-200", scoreText: "text-slate-400", labelText: "text-slate-400",
    chipBg: "bg-slate-50", chipBorder: "border-slate-200", chipText: "text-slate-500",
    avatarBg: "bg-slate-100", avatarText: "text-slate-500",
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function JobsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: jobs }, { data: aiProfile }] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, title, company, location, city, country_code, remote_type, experience_level, required_skills, published_at, salary_min, salary_max, salary_currency")
      .eq("is_active", true)
      .order("published_at", { ascending: false })
      .limit(50),
    supabase
      .from("ai_profiles")
      .select("detected_skills")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const userSkills = Array.isArray(aiProfile?.detected_skills) ? (aiProfile.detected_skills as string[]) : [];
  const hasAiProfile = !!aiProfile;

  const jobsWithScores = (jobs ?? [])
    .map((job) => ({
      ...job,
      match: computeMatch(userSkills, Array.isArray(job.required_skills) ? (job.required_skills as string[]) : []),
    }))
    .sort((a, b) => b.match.score - a.match.score);

  return (
    <div>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-end justify-between border-b border-slate-100 pb-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">UAE Roles</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            {jobsWithScores.length} positions
          </h1>
          <p className="mt-1 text-sm text-slate-400">Sorted by AI match · Gulf market only</p>
        </div>
        {!hasAiProfile && (
          <Link
            href="/app/profile"
            className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Set up AI profile to see scores
          </Link>
        )}
      </div>

      {/* ── Jobs list ───────────────────────────────────────────────────── */}
      <div className="divide-y divide-slate-100">
        {jobsWithScores.map((job) => {
          const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
          const location = job.city ?? job.location;
          const isUAE = job.country_code === "AE";
          const cfg = SCORE_CONFIG[job.match.label];
          const initials = job.company.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

          return (
            <Link
              key={job.id}
              href={`/app/jobs/${job.id}`}
              className="group flex items-center gap-5 py-4 transition-colors hover:bg-slate-50/60 -mx-10 px-10"
            >
              {/* Company avatar */}
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold ${cfg.avatarBg} ${cfg.avatarText}`}>
                {initials}
              </div>

              {/* Role info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-[15px] font-semibold text-slate-950 group-hover:text-slate-700 leading-tight">
                    {job.title}
                  </span>
                  {/* Matched skill chips */}
                  {job.match.matched.slice(0, 3).map((s: string) => (
                    <span key={s} className={`rounded-md border px-2 py-px text-[10px] font-semibold ${cfg.chipBg} ${cfg.chipBorder} ${cfg.chipText}`}>
                      {s}
                    </span>
                  ))}
                  {job.match.matched.length > 3 && (
                    <span className="text-[10px] text-slate-400">+{job.match.matched.length - 3} more</span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  <span className="text-sm font-medium text-slate-600">{job.company}</span>
                  {location && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-sm text-slate-400">{location}{isUAE ? " 🇦🇪" : ""}</span>
                    </>
                  )}
                  {job.remote_type && job.remote_type !== "unknown" && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-sm capitalize text-slate-400">{(job.remote_type as string).replace(/_/g, " ")}</span>
                    </>
                  )}
                  {job.experience_level && job.experience_level !== "unknown" && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-sm capitalize text-slate-400">{job.experience_level}</span>
                    </>
                  )}
                  {salary && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-sm font-medium text-slate-500">{salary}/mo</span>
                    </>
                  )}
                </div>
              </div>

              {/* Score — the hero metric */}
              <div className="shrink-0 flex flex-col items-end gap-1 w-20">
                {hasAiProfile ? (
                  <>
                    <span className={`text-2xl font-bold tabular-nums leading-none ${cfg.scoreText}`}>
                      {job.match.score}<span className="text-sm font-normal opacity-50">%</span>
                    </span>
                    {/* Mini progress bar */}
                    <div className="h-1 w-14 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${cfg.bar} transition-all`}
                        style={{ width: `${job.match.score}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-medium ${cfg.labelText}`}>{job.match.label}</span>
                  </>
                ) : (
                  <span className="text-sm text-slate-300">—</span>
                )}
              </div>

              {/* Arrow */}
              <span className="shrink-0 text-slate-200 transition group-hover:text-slate-400 group-hover:translate-x-0.5 duration-150">→</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
