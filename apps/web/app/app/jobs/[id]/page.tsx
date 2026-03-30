import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { computeMatch, type FitLabel } from "@/lib/matching/score";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fitStyles: Record<FitLabel, { card: string; badge: string }> = {
  "Good fit": {
    card: "border-emerald-200 bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
  },
  "Partial fit": {
    card: "border-amber-200 bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
  },
  "Low fit": {
    card: "border-slate-200 bg-slate-50",
    badge: "bg-slate-100 text-slate-600",
  },
};

function SkillTag({ label, variant }: { label: string; variant: "matched" | "missing" | "neutral" }) {
  const styles = {
    matched: "border-emerald-200 bg-emerald-50 text-emerald-700",
    missing: "border-amber-200 bg-amber-50 text-amber-700",
    neutral: "border-slate-200 bg-white text-slate-600",
  };
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${styles[variant]}`}>{label}</span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ id: string }>;
};

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: job }, { data: aiProfile }] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, title, company, location, country_code, city, remote_type, employment_type, experience_level, description, required_skills, apply_url, salary_min, salary_max, salary_currency, published_at")
      .eq("id", id)
      .eq("is_active", true)
      .single(),
    supabase
      .from("ai_profiles")
      .select("detected_skills")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!job) notFound();

  const userSkills = Array.isArray(aiProfile?.detected_skills) ? (aiProfile.detected_skills as string[]) : [];
  const jobSkills = Array.isArray(job.required_skills) ? (job.required_skills as string[]) : [];
  const match = computeMatch(userSkills, jobSkills);
  const style = fitStyles[match.label];

  const hasSalary = job.salary_min || job.salary_max;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/app/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All jobs
      </Link>

      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{job.company}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{job.title}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          {job.location && <span>{job.location}</span>}
          {job.remote_type && job.remote_type !== "unknown" && (
            <>
              <span className="text-slate-300">·</span>
              <span className="capitalize">{job.remote_type.replace(/_/g, " ")}</span>
            </>
          )}
          {job.experience_level && job.experience_level !== "unknown" && (
            <>
              <span className="text-slate-300">·</span>
              <span className="capitalize">{job.experience_level}</span>
            </>
          )}
          {hasSalary && (
            <>
              <span className="text-slate-300">·</span>
              <span>
                {job.salary_min ? job.salary_min.toLocaleString() : ""}
                {job.salary_min && job.salary_max ? " – " : ""}
                {job.salary_max ? job.salary_max.toLocaleString() : ""}
                {job.salary_currency ? ` ${job.salary_currency}` : ""}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Match score card */}
      <div className={`rounded-2xl border p-5 ${style.card}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Match score</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-slate-900">{match.score}%</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.badge}`}>
                {match.label}
              </span>
            </div>
          </div>
          {!aiProfile && (
            <p className="max-w-xs text-right text-xs text-slate-500">
              Generate your{" "}
              <Link href="/app/profile" className="underline underline-offset-2">
                AI profile
              </Link>{" "}
              for an accurate score.
            </p>
          )}
        </div>

        {/* Skill breakdown */}
        {jobSkills.length > 0 && (
          <div className="mt-4 space-y-3">
            {match.matched.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-500">
                  Matching skills ({match.matched.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {match.matched.map((s) => (
                    <SkillTag key={s} label={s} variant="matched" />
                  ))}
                </div>
              </div>
            )}
            {match.missing.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-500">
                  Skills to develop ({match.missing.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {match.missing.map((s) => (
                    <SkillTag key={s} label={s} variant="missing" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Job description</p>
        <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{job.description}</p>
      </div>

      {/* Apply CTA */}
      {job.apply_url && (
        <a
          href={job.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Apply for this role
          <ExternalLink className="h-3.5 w-3.5 opacity-70" />
        </a>
      )}
    </div>
  );
}
