import Link from "next/link";
import { redirect } from "next/navigation";

import { computeMatch, type FitLabel } from "@/lib/matching/score";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const scoreStyles: Record<FitLabel, { bar: string; text: string; bg: string }> = {
  "Good fit":    { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  "Partial fit": { bar: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50 border-amber-200" },
  "Low fit":     { bar: "bg-slate-300",   text: "text-slate-500",   bg: "bg-slate-100 border-slate-200" },
};

function ScorePill({ label, score }: { label: FitLabel; score: number }) {
  const s = scoreStyles[label];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${s.bar}`}
      />
      {score}% · {label}
    </span>
  );
}

function formatSalary(min?: number | null, max?: number | null, currency?: string | null) {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
  const curr = currency ?? "AED";
  if (min && max) return `${fmt(min)} – ${fmt(max)} ${curr}/mo`;
  if (min) return `From ${fmt(min)} ${curr}/mo`;
  return `Up to ${fmt(max!)} ${curr}/mo`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function JobsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      match: computeMatch(
        userSkills,
        Array.isArray(job.required_skills) ? (job.required_skills as string[]) : [],
      ),
    }))
    .sort((a, b) => b.match.score - a.match.score);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-950">UAE Roles</h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {jobsWithScores.length} curated positions · sorted by match
          </p>
        </div>
        {!hasAiProfile && (
          <Link
            href="/app/profile"
            className="text-xs font-medium text-amber-700 underline underline-offset-2"
          >
            Generate AI profile to see scores
          </Link>
        )}
      </div>

      {/* Jobs list */}
      {jobsWithScores.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-6 py-12 text-center text-sm text-slate-400">
          No roles available right now.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {jobsWithScores.map((job) => {
            const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
            const location = job.city ?? job.location;
            const isUAE = job.country_code === "AE";

            return (
              <Link
                key={job.id}
                href={`/app/jobs/${job.id}`}
                className="group flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50/80"
              >
                {/* Score bar */}
                <div className="hidden w-1 shrink-0 self-stretch rounded-full sm:block"
                  style={{ background: job.match.score >= 70 ? "#10b981" : job.match.score >= 40 ? "#f59e0b" : "#cbd5e1" }}
                />

                {/* Main content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
                    <p className="text-sm font-semibold text-slate-950 group-hover:text-slate-700">
                      {job.title}
                    </p>
                    {hasAiProfile && (
                      <ScorePill label={job.match.label} score={job.match.score} />
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-xs font-medium text-slate-600">{job.company}</span>
                    {location && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-400">
                          {location}{isUAE ? " 🇦🇪" : ""}
                        </span>
                      </>
                    )}
                    {job.remote_type && job.remote_type !== "unknown" && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs capitalize text-slate-400">
                          {(job.remote_type as string).replace(/_/g, " ")}
                        </span>
                      </>
                    )}
                    {job.experience_level && job.experience_level !== "unknown" && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs capitalize text-slate-400">{job.experience_level}</span>
                      </>
                    )}
                  </div>

                  {/* Matched skills + salary */}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                    {job.match.matched.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.match.matched.slice(0, 4).map((s) => (
                          <span
                            key={s}
                            className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-px text-[10px] font-medium text-emerald-700"
                          >
                            {s}
                          </span>
                        ))}
                        {job.match.matched.length > 4 && (
                          <span className="text-[10px] text-slate-400">+{job.match.matched.length - 4}</span>
                        )}
                      </div>
                    )}
                    {salary && (
                      <span className="text-[11px] font-medium text-slate-400">{salary}</span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <span className="shrink-0 text-slate-300 transition group-hover:text-slate-500">→</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
