import Link from "next/link";
import { redirect } from "next/navigation";

import { computeMatch, type FitLabel } from "@/lib/matching/score";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSalary(min?: number | null, max?: number | null, currency?: string | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
  const curr = currency ?? "AED";
  if (min && max) return `${fmt(min)} – ${fmt(max)} ${curr}/mo`;
  if (min) return `${fmt(min)}+ ${curr}/mo`;
  return `Up to ${fmt(max!)} ${curr}/mo`;
}

const scoreMeta: Record<FitLabel, { dot: string; text: string; bg: string; border: string }> = {
  "Good fit":    { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  "Partial fit": { dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200" },
  "Low fit":     { dot: "bg-slate-300",   text: "text-slate-400",   bg: "bg-slate-100",  border: "border-slate-200" },
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
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">UAE Roles</h1>
          <p className="mt-0.5 text-sm text-slate-400">{jobsWithScores.length} curated positions · sorted by match</p>
        </div>
        {!hasAiProfile && (
          <Link
            href="/app/profile"
            className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Generate AI profile to see scores
          </Link>
        )}
      </div>

      {/* ── Jobs list ───────────────────────────────────────────────────── */}
      {jobsWithScores.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-6 py-16 text-center text-sm text-slate-400">
          No roles available right now.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto] items-center border-b border-slate-100 bg-slate-50 px-6 py-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Role</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Match</span>
          </div>

          {/* Rows */}
          {jobsWithScores.map((job, i) => {
            const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
            const location = job.city ?? job.location;
            const isUAE = job.country_code === "AE";
            const m = scoreMeta[job.match.label];

            return (
              <Link
                key={job.id}
                href={`/app/jobs/${job.id}`}
                className={`group grid grid-cols-[1fr_auto] items-center gap-6 px-6 py-4 transition-colors hover:bg-slate-50/80 ${i > 0 ? "border-t border-slate-100" : ""}`}
              >
                {/* Left: role info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-slate-950 group-hover:text-slate-700 truncate">
                      {job.title}
                    </p>
                    {/* Matched skill chips */}
                    {job.match.matched.length > 0 && (
                      <div className="hidden items-center gap-1 sm:flex">
                        {job.match.matched.slice(0, 3).map((s) => (
                          <span key={s} className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-px text-[10px] font-medium text-emerald-700">
                            {s}
                          </span>
                        ))}
                        {job.match.matched.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{job.match.matched.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-xs font-medium text-slate-600">{job.company}</span>
                    {location && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-400">{location}{isUAE ? " 🇦🇪" : ""}</span>
                      </>
                    )}
                    {job.remote_type && job.remote_type !== "unknown" && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs capitalize text-slate-400">{(job.remote_type as string).replace(/_/g, " ")}</span>
                      </>
                    )}
                    {job.experience_level && job.experience_level !== "unknown" && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs capitalize text-slate-400">{job.experience_level}</span>
                      </>
                    )}
                    {salary && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs font-medium text-slate-500">{salary}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: score */}
                <div className="flex items-center gap-3 shrink-0">
                  {hasAiProfile ? (
                    <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 ${m.bg} ${m.border}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
                      <span className={`text-xs font-bold tabular-nums ${m.text}`}>{job.match.score}%</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                  <span className="text-slate-200 transition group-hover:text-slate-400">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
