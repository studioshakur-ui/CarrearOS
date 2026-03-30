import Link from "next/link";
import { redirect } from "next/navigation";

import { PageIntro } from "@/components/layout/page-intro";
import { computeMatch, type FitLabel } from "@/lib/matching/score";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fitStyles: Record<FitLabel, string> = {
  "Good fit": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Partial fit": "bg-amber-50 text-amber-700 border-amber-200",
  "Low fit": "bg-slate-100 text-slate-500 border-slate-200",
};

function FitBadge({ label, score }: { label: FitLabel; score: number }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${fitStyles[label]}`}>
      <span>{score}%</span>
      <span className="opacity-60">·</span>
      <span>{label}</span>
    </span>
  );
}

function MetaTag({ label }: { label: string }) {
  return (
    <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs capitalize text-slate-500">
      {label.replace(/_/g, " ")}
    </span>
  );
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
      .select("id, title, company, location, remote_type, experience_level, required_skills, published_at")
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
    <div className="space-y-6">
      <PageIntro
        title="Jobs"
        description="Gulf tech roles matched against your AI profile. Scores are based on skill overlap."
      />

      {/* No AI profile warning */}
      {!hasAiProfile && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <span className="font-medium">Match scores are unavailable.</span> Generate your AI profile on the{" "}
          <Link href="/app/profile" className="underline underline-offset-2">
            Profile page
          </Link>{" "}
          to see how well you fit each role.
        </div>
      )}

      {/* Jobs list */}
      {jobsWithScores.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-6 py-10 text-center text-sm text-slate-400">
          No jobs available right now.
        </div>
      ) : (
        <div className="space-y-3">
          {jobsWithScores.map((job) => (
            <Link
              key={job.id}
              href={`/app/jobs/${job.id}`}
              className="group block rounded-2xl border border-slate-100 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 group-hover:text-slate-700">{job.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {job.company}
                    {job.location ? ` · ${job.location}` : ""}
                  </p>
                </div>
                <div className="shrink-0">
                  <FitBadge label={job.match.label} score={job.match.score} />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.experience_level && job.experience_level !== "unknown" && (
                  <MetaTag label={job.experience_level} />
                )}
                {job.remote_type && job.remote_type !== "unknown" && (
                  <MetaTag label={job.remote_type} />
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
