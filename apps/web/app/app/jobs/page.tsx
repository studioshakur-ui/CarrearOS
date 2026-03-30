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
      <div className="mb-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9e9b95]">Gulf Market</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#1a1916]">
          {jobsWithScores.length} Positions
        </h1>
        {!hasAiProfile && (
          <p className="mt-3 text-sm text-[#8b7355]">
            <Link href="/app/profile" className="underline underline-offset-4 decoration-[#8b7355]/40 hover:decoration-[#8b7355]">
              Complete your profile
            </Link>
            {" "}to see match scores.
          </p>
        )}
      </div>

      {/* ── Column headers ──────────────────────────────────────────────── */}
      <div className="mb-3 flex items-center justify-between border-b border-[#e2dfd9] pb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9e9b95]">Role</p>
        {hasAiProfile && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9e9b95]">Match</p>
        )}
      </div>

      {/* ── Rows ────────────────────────────────────────────────────────── */}
      <div className="divide-y divide-[#e2dfd9]">
        {jobsWithScores.map((job) => {
          const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
          const location = job.city ?? job.location;

          return (
            <Link
              key={job.id}
              href={`/app/jobs/${job.id}`}
              className="group flex items-center gap-8 py-5 transition-colors hover:bg-white/60 -mx-12 px-12"
            >
              {/* Role */}
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-[#1a1916] leading-tight group-hover:text-black">
                  {job.title}
                </p>
                <p className="mt-1 text-sm text-[#6a6761]">
                  {job.company}
                  {location && <> · {location}</>}
                  {job.remote_type && job.remote_type !== "unknown" && (
                    <> · <span className="capitalize">{(job.remote_type as string).replace(/_/g, " ")}</span></>
                  )}
                  {job.experience_level && job.experience_level !== "unknown" && (
                    <> · <span className="capitalize">{job.experience_level}</span></>
                  )}
                  {salary && <> · <span className="font-medium text-[#1a1916]">{salary}/mo</span></>}
                </p>
              </div>

              {/* Score */}
              <div className="shrink-0 flex items-center gap-6">
                {hasAiProfile && (
                  <div className="flex flex-col items-end gap-1.5 w-16">
                    <span className="text-[22px] font-semibold tabular-nums leading-none text-[#1a1916]">
                      {job.match.score}
                      <span className="text-xs font-normal text-[#9e9b95]">%</span>
                    </span>
                    <div className="h-px w-full bg-[#e2dfd9]">
                      <div
                        className="h-px bg-[#1a1916] transition-all"
                        style={{ width: `${job.match.score}%` }}
                      />
                    </div>
                  </div>
                )}
                <span className="text-[#d4d1cb] transition-transform group-hover:translate-x-0.5 duration-150 text-sm">
                  →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
