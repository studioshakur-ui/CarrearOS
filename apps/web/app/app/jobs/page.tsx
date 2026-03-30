import Link from "next/link";
import { redirect } from "next/navigation";

import { computeMatch } from "@/lib/matching/score";
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

function scoreColor(score: number): { bar: string; text: string; border: string } {
  if (score >= 70) return { bar: "bg-emerald-500", text: "text-emerald-600", border: "border-l-emerald-400" };
  if (score >= 40) return { bar: "bg-amber-400",   text: "text-amber-500",   border: "border-l-amber-400" };
  if (score >= 20) return { bar: "bg-orange-300",  text: "text-orange-500",  border: "border-l-orange-300" };
  return               { bar: "bg-rose-300",    text: "text-rose-400",   border: "border-l-rose-300" };
}

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
      <div className="space-y-px">
        {jobsWithScores.map((job) => {
          const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
          const location = job.city ?? job.location;
          const isUAE = job.country_code === "AE";
          const col = scoreColor(job.match.score);
          const initials = job.company.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

          return (
            <Link
              key={job.id}
              href={`/app/jobs/${job.id}`}
              className={`group flex items-center gap-5 rounded-xl border-l-[3px] bg-white px-6 py-4 transition-all hover:bg-slate-50 hover:shadow-sm ${hasAiProfile ? col.border : "border-l-slate-200"}`}
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[11px] font-bold text-slate-600">
                {initials}
              </div>

              {/* Role info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[15px] font-semibold text-slate-950 leading-tight">
                    {job.title}
                  </span>
                  {job.match.matched.slice(0, 4).map((s: string) => (
                    <span key={s} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-px text-[10px] font-medium text-slate-600">
                      {s}
                    </span>
                  ))}
                  {job.match.matched.length > 4 && (
                    <span className="text-[10px] text-slate-400">+{job.match.matched.length - 4}</span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0">
                  <span className="text-sm font-medium text-slate-500">{job.company}</span>
                  {location && <><span className="text-slate-300">·</span><span className="text-sm text-slate-400">{location}{isUAE ? " 🇦🇪" : ""}</span></>}
                  {job.remote_type && job.remote_type !== "unknown" && <><span className="text-slate-300">·</span><span className="text-sm capitalize text-slate-400">{(job.remote_type as string).replace(/_/g, " ")}</span></>}
                  {job.experience_level && job.experience_level !== "unknown" && <><span className="text-slate-300">·</span><span className="text-sm capitalize text-slate-400">{job.experience_level}</span></>}
                  {salary && <><span className="text-slate-300">·</span><span className="text-sm font-semibold text-slate-500">{salary}/mo</span></>}
                </div>
              </div>

              {/* Score */}
              <div className="shrink-0 flex items-center gap-4">
                {hasAiProfile ? (
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-2xl font-bold tabular-nums leading-none ${col.text}`}>
                      {job.match.score}<span className="text-xs font-normal opacity-40">%</span>
                    </span>
                    <div className="h-1 w-16 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${col.bar}`} style={{ width: `${job.match.score}%` }} />
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-300">—</span>
                )}
                <span className="text-slate-200 transition-transform group-hover:translate-x-1 duration-150 text-sm">→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
