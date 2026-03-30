import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { AnalyseJobButton } from "@/components/jobs/analyse-job-button";
import { computeMatch } from "@/lib/matching/score";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ─── Style maps ───────────────────────────────────────────────────────────────

const recommendationStyles = {
  apply: {
    outer: "border-emerald-200 bg-emerald-50",
    banner: "bg-emerald-600",
    word: "Apply",
    icon: "✓",
    detail: "text-emerald-800",
    label: "Apply",
  },
  maybe: {
    outer: "border-amber-200 bg-amber-50",
    banner: "bg-amber-500",
    word: "Consider",
    icon: "△",
    detail: "text-amber-800",
    label: "Consider",
  },
  skip: {
    outer: "border-red-200 bg-red-50",
    banner: "bg-red-500",
    word: "Pass",
    icon: "✕",
    detail: "text-red-800",
    label: "Skip",
  },
} as const;

// ─── Small UI primitives ──────────────────────────────────────────────────────

function Tag({ label, variant }: { label: string; variant: "green" | "amber" | "slate" | "blue" }) {
  const styles = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    slate: "border-slate-200 bg-white text-slate-600",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
  };
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${styles[variant]}`}>{label}</span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{children}</p>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-100 bg-white p-5 ${className}`}>{children}</div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type TailoredCv = {
  summary: string;
  experience: string[];
  skills: string[];
  keywords: string[];
};

type MatchData = {
  score: number;
  strengths: string[];
  gaps: string[];
  reasons: string[];
  recommendation: "apply" | "maybe" | "skip";
};

type ActionData = {
  should_apply: boolean;
  rationale: string;
  next_steps: string[];
  message_draft: string;
  cover_note: string;
  cv_improvement_points: string[];
  tailored_cv: TailoredCv | null;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FitCard({ match, rationale }: { match: MatchData; rationale: string }) {
  const rec = recommendationStyles[match.recommendation];
  return (
    <div className={`overflow-hidden rounded-2xl border ${rec.outer}`}>
      {/* ── Instant verdict banner ── */}
      <div className={`flex items-center gap-4 px-6 py-5 ${rec.banner}`}>
        <span className="text-4xl font-bold tracking-tight text-white">{rec.word}</span>
        <div className="h-8 w-px bg-white/30" />
        <span className="text-4xl font-semibold text-white">{match.score}%</span>
        <p className="ml-1 max-w-sm text-sm leading-snug text-white/80">{rationale}</p>
      </div>

      {/* ── Details ── */}
      <div className="divide-y divide-slate-200/60 px-6">
        {match.strengths.length > 0 && (
          <div className="py-4">
            <SectionLabel>Strengths</SectionLabel>
            <ul className="space-y-1.5">
              {match.strengths.map((s) => (
                <li key={s} className="flex gap-2 text-sm text-slate-700">
                  <span className="mt-0.5 text-emerald-500">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {match.gaps.length > 0 && (
          <div className="py-4">
            <SectionLabel>Gaps</SectionLabel>
            <ul className="space-y-1.5">
              {match.gaps.map((g) => (
                <li key={g} className="flex gap-2 text-sm text-slate-700">
                  <span className="mt-0.5 text-amber-500">△</span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
        )}

        {match.reasons.length > 0 && (
          <div className="py-4">
            <SectionLabel>Why this score</SectionLabel>
            <ul className="space-y-1 pl-4">
              {match.reasons.map((r) => (
                <li key={r} className="list-disc text-sm text-slate-600">
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageCard({ message, label }: { message: string; label: string }) {
  return (
    <Card>
      <SectionLabel>{label}</SectionLabel>
      <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 italic">
        {message}
      </p>
    </Card>
  );
}

function ChecklistCard({ steps }: { steps: string[] }) {
  return (
    <Card>
      <SectionLabel>Application checklist</SectionLabel>
      <ol className="space-y-2">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-300 text-xs font-semibold text-slate-400">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </Card>
  );
}

function OptimizedCvCard({ cv }: { cv: TailoredCv }) {
  return (
    <Card>
      <SectionLabel>Optimized CV</SectionLabel>
      <p className="mb-1 text-xs text-slate-400">Tailored to this role — review before using</p>

      {cv.summary && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-slate-500">Summary</p>
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
            {cv.summary}
          </p>
        </div>
      )}

      {cv.experience.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-500">Key achievements</p>
          <ul className="space-y-1.5 pl-4">
            {cv.experience.map((point) => (
              <li key={point} className="list-disc text-sm text-slate-700">
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {cv.skills.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-500">Skills to highlight</p>
          <div className="flex flex-wrap gap-1.5">
            {cv.skills.map((s) => (
              <Tag key={s} label={s} variant="green" />
            ))}
          </div>
        </div>
      )}

      {cv.keywords.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-500">Keywords to include</p>
          <div className="flex flex-wrap gap-1.5">
            {cv.keywords.map((k) => (
              <Tag key={k} label={k} variant="blue" />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function AiAnalysisPanel({ match, action }: { match: MatchData; action: ActionData }) {
  return (
    <div className="space-y-4">
      <FitCard match={match} rationale={action.rationale} />

      {action.cover_note && <MessageCard message={action.cover_note} label="Cover note" />}

      {action.message_draft && <MessageCard message={action.message_draft} label="Ready-to-send message" />}

      {action.next_steps.length > 0 && <ChecklistCard steps={action.next_steps} />}

      {action.tailored_cv && <OptimizedCvCard cv={action.tailored_cv} />}

      {action.cv_improvement_points.length > 0 && (
        <Card>
          <SectionLabel>CV improvements</SectionLabel>
          <ul className="space-y-1 pl-4">
            {action.cv_improvement_points.map((point) => (
              <li key={point} className="list-disc text-sm text-slate-600">
                {point}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
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

  const [{ data: job }, { data: aiProfile }, { data: existingMatch }, { data: existingAction }] =
    await Promise.all([
      supabase
        .from("jobs")
        .select(
          "id, title, company, location, remote_type, employment_type, experience_level, description, required_skills, apply_url, salary_min, salary_max, salary_currency",
        )
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
      supabase
        .from("matches")
        .select("id, score, strengths, gaps, reasons, recommendation")
        .eq("profile_id", user.id)
        .eq("job_id", id)
        .maybeSingle(),
      supabase
        .from("ai_actions")
        .select(
          "id, should_apply, rationale, next_steps, message_draft, cover_note, cv_improvement_points, tailored_cv",
        )
        .eq("profile_id", user.id)
        .eq("job_id", id)
        .maybeSingle(),
    ]);

  if (!job) notFound();

  const userSkills = Array.isArray(aiProfile?.detected_skills) ? (aiProfile.detected_skills as string[]) : [];
  const jobSkills = Array.isArray(job.required_skills) ? (job.required_skills as string[]) : [];
  const basicMatch = computeMatch(userSkills, jobSkills);

  const hasAiAnalysis = !!existingMatch && !!existingAction;
  const hasAiProfile = !!aiProfile;
  const hasSalary = job.salary_min || job.salary_max;

  const matchData: MatchData | null = existingMatch
    ? {
        score: existingMatch.score as number,
        strengths: Array.isArray(existingMatch.strengths) ? (existingMatch.strengths as string[]) : [],
        gaps: Array.isArray(existingMatch.gaps) ? (existingMatch.gaps as string[]) : [],
        reasons: Array.isArray(existingMatch.reasons) ? (existingMatch.reasons as string[]) : [],
        recommendation: existingMatch.recommendation as "apply" | "maybe" | "skip",
      }
    : null;

  const rawTailoredCv = existingAction?.tailored_cv as Record<string, unknown> | null | undefined;
  const tailoredCv: TailoredCv | null =
    rawTailoredCv && typeof rawTailoredCv === "object"
      ? {
          summary: typeof rawTailoredCv.summary === "string" ? rawTailoredCv.summary : "",
          experience: Array.isArray(rawTailoredCv.experience) ? (rawTailoredCv.experience as string[]) : [],
          skills: Array.isArray(rawTailoredCv.skills) ? (rawTailoredCv.skills as string[]) : [],
          keywords: Array.isArray(rawTailoredCv.keywords) ? (rawTailoredCv.keywords as string[]) : [],
        }
      : null;

  const actionData: ActionData | null = existingAction
    ? {
        should_apply: existingAction.should_apply as boolean,
        rationale: existingAction.rationale as string,
        next_steps: Array.isArray(existingAction.next_steps) ? (existingAction.next_steps as string[]) : [],
        message_draft: existingAction.message_draft as string,
        cover_note: existingAction.cover_note as string,
        cv_improvement_points: Array.isArray(existingAction.cv_improvement_points)
          ? (existingAction.cv_improvement_points as string[])
          : [],
        tailored_cv: tailoredCv,
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Back */}
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

      {/* ── Analysis ────────────────────────────────────────────────────────────── */}
      {hasAiAnalysis && matchData && actionData ? (
        <AiAnalysisPanel match={matchData} action={actionData} />
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
          {hasAiProfile ? (
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-slate-900">{basicMatch.score}%</span>
                <span className="text-sm text-slate-500">{basicMatch.label}</span>
              </div>

              {jobSkills.length > 0 && (
                <div className="space-y-2">
                  {basicMatch.matched.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs text-slate-400">
                        Matching skills ({basicMatch.matched.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {basicMatch.matched.map((s) => (
                          <Tag key={s} label={s} variant="green" />
                        ))}
                      </div>
                    </div>
                  )}
                  {basicMatch.missing.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs text-slate-400">
                        Missing skills ({basicMatch.missing.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {basicMatch.missing.map((s) => (
                          <Tag key={s} label={s} variant="amber" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-400">
                Basic skill match only. Run a full analysis for detailed guidance.
              </p>
              <AnalyseJobButton jobId={job.id} />
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Generate your{" "}
              <Link href="/app/profile" className="font-medium text-slate-800 underline underline-offset-2">
                AI profile
              </Link>{" "}
              first, then come back to analyse this job.
            </p>
          )}
        </div>
      )}

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
