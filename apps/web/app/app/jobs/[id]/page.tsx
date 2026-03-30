import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AnalyseJobButton } from "@/components/jobs/analyse-job-button";
import { computeMatch } from "@/lib/matching/score";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

// ─── Primitives ───────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9e9b95]">
      {children}
    </p>
  );
}

function Divider() {
  return <div className="border-t border-[#e2dfd9]" />;
}

// ─── Analysis panel ───────────────────────────────────────────────────────────

const verdictLabel = {
  apply: "Apply",
  maybe: "Consider",
  skip:  "Pass",
} as const;

function AiAnalysisPanel({ match, action }: { match: MatchData; action: ActionData }) {
  const verdict = verdictLabel[match.recommendation];

  return (
    <div className="space-y-10">

      {/* ── Decision ─────────────────────────────────────────────────────── */}
      <div className="bg-[#0c0c0c] rounded-xl px-10 py-9">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/25 mb-5">
          Recommendation
        </p>
        <div className="flex items-baseline gap-5">
          <span className="text-5xl font-semibold tracking-tight text-white">{verdict}</span>
          <span className="text-4xl font-light text-white/30">·</span>
          <span className="text-4xl font-semibold tabular-nums text-white/80">{match.score}%</span>
        </div>
        {action.rationale && (
          <p className="mt-5 text-sm leading-7 text-white/40">{action.rationale}</p>
        )}
      </div>

      {/* ── Strengths & Gaps ─────────────────────────────────────────────── */}
      {(match.strengths.length > 0 || match.gaps.length > 0) && (
        <div className="grid gap-10 grid-cols-2">
          {match.strengths.length > 0 && (
            <div>
              <SectionTitle>Strengths</SectionTitle>
              <ul className="space-y-4">
                {match.strengths.map((s) => (
                  <li key={s} className="flex gap-3 text-sm leading-6 text-[#3a3835]">
                    <span className="mt-0.5 shrink-0 text-[#8b7355]">—</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {match.gaps.length > 0 && (
            <div>
              <SectionTitle>Gaps</SectionTitle>
              <ul className="space-y-4">
                {match.gaps.map((g) => (
                  <li key={g} className="flex gap-3 text-sm leading-6 text-[#3a3835]">
                    <span className="mt-0.5 shrink-0 text-[#9e9b95]">—</span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <Divider />

      {/* ── Message draft ────────────────────────────────────────────────── */}
      {(action.cover_note || action.message_draft) && (
        <div>
          <SectionTitle>Message Draft</SectionTitle>
          <div className="rounded-lg border border-[#e2dfd9] bg-white px-8 py-7">
            <p className="text-sm leading-8 text-[#3a3835] font-light italic">
              {action.cover_note || action.message_draft}
            </p>
          </div>
        </div>
      )}

      {/* ── Next steps ───────────────────────────────────────────────────── */}
      {action.next_steps.length > 0 && (
        <>
          <Divider />
          <div>
            <SectionTitle>Next Steps</SectionTitle>
            <ol className="grid gap-4 sm:grid-cols-2">
              {action.next_steps.map((step, i) => (
                <li key={i} className="flex items-start gap-4 text-sm leading-6 text-[#1a1916]">
                  <span className="mt-0.5 shrink-0 text-[11px] font-semibold tabular-nums text-[#9e9b95]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </>
      )}

      {/* ── CV improvements ──────────────────────────────────────────────── */}
      {action.cv_improvement_points.length > 0 && (
        <>
          <Divider />
          <div>
            <SectionTitle>CV Improvements</SectionTitle>
            <ul className="grid gap-3 sm:grid-cols-2">
              {action.cv_improvement_points.map((point) => (
                <li key={point} className="flex gap-3 text-sm leading-6 text-[#1a1916]">
                  <span className="mt-0.5 shrink-0 text-[#9e9b95]">—</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* ── Tailored CV ──────────────────────────────────────────────────── */}
      {action.tailored_cv && (
        <>
          <Divider />
          <div>
            <SectionTitle>Tailored CV</SectionTitle>

            {action.tailored_cv.summary && (
              <div className="mb-8">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[#9e9b95]">Summary</p>
                <p className="text-sm leading-8 text-[#3a3835]">{action.tailored_cv.summary}</p>
              </div>
            )}

            <div className="grid gap-8 sm:grid-cols-2">
              {action.tailored_cv.experience.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[#9e9b95]">Key Achievements</p>
                  <ul className="space-y-3">
                    {action.tailored_cv.experience.map((point) => (
                      <li key={point} className="flex gap-3 text-sm leading-6 text-[#1a1916]">
                        <span className="mt-0.5 shrink-0 text-[#9e9b95]">—</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-6">
                {action.tailored_cv.skills.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[#9e9b95]">Skills to Highlight</p>
                    <p className="text-sm leading-7 text-[#1a1916]">{action.tailored_cv.skills.join("  ·  ")}</p>
                  </div>
                )}

                {action.tailored_cv.keywords.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[#9e9b95]">Keywords</p>
                    <p className="text-sm leading-7 text-[#6a6761]">{action.tailored_cv.keywords.join("  ·  ")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ id: string }> };

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: job }, { data: aiProfile }, { data: existingMatch }, { data: existingAction }] =
    await Promise.all([
      supabase.from("jobs").select("id, title, company, location, remote_type, employment_type, experience_level, description, required_skills, apply_url, salary_min, salary_max, salary_currency").eq("id", id).eq("is_active", true).single(),
      supabase.from("ai_profiles").select("detected_skills").eq("profile_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("matches").select("id, score, strengths, gaps, reasons, recommendation").eq("profile_id", user.id).eq("job_id", id).maybeSingle(),
      supabase.from("ai_actions").select("id, should_apply, rationale, next_steps, message_draft, cover_note, cv_improvement_points, tailored_cv").eq("profile_id", user.id).eq("job_id", id).maybeSingle(),
    ]);

  if (!job) notFound();

  const userSkills = Array.isArray(aiProfile?.detected_skills) ? (aiProfile.detected_skills as string[]) : [];
  const jobSkills  = Array.isArray(job.required_skills)        ? (job.required_skills as string[])        : [];
  const basicMatch = computeMatch(userSkills, jobSkills);
  const hasAiAnalysis = !!existingMatch && !!existingAction;
  const hasAiProfile  = !!aiProfile;

  const matchData: MatchData | null = existingMatch ? {
    score: existingMatch.score as number,
    strengths: Array.isArray(existingMatch.strengths) ? (existingMatch.strengths as string[]) : [],
    gaps:      Array.isArray(existingMatch.gaps)      ? (existingMatch.gaps as string[])      : [],
    reasons:   Array.isArray(existingMatch.reasons)   ? (existingMatch.reasons as string[])   : [],
    recommendation: existingMatch.recommendation as "apply" | "maybe" | "skip",
  } : null;

  const rawTailoredCv = existingAction?.tailored_cv as Record<string, unknown> | null | undefined;
  const tailoredCv: TailoredCv | null = rawTailoredCv && typeof rawTailoredCv === "object" ? {
    summary:    typeof rawTailoredCv.summary === "string" ? rawTailoredCv.summary : "",
    experience: Array.isArray(rawTailoredCv.experience) ? (rawTailoredCv.experience as string[]) : [],
    skills:     Array.isArray(rawTailoredCv.skills)     ? (rawTailoredCv.skills as string[])     : [],
    keywords:   Array.isArray(rawTailoredCv.keywords)   ? (rawTailoredCv.keywords as string[])   : [],
  } : null;

  const actionData: ActionData | null = existingAction ? {
    should_apply:          existingAction.should_apply as boolean,
    rationale:             existingAction.rationale as string,
    next_steps:            Array.isArray(existingAction.next_steps)            ? (existingAction.next_steps as string[])            : [],
    message_draft:         existingAction.message_draft as string,
    cover_note:            existingAction.cover_note as string,
    cv_improvement_points: Array.isArray(existingAction.cv_improvement_points) ? (existingAction.cv_improvement_points as string[]) : [],
    tailored_cv:           tailoredCv,
  } : null;

  const hasSalary = job.salary_min || job.salary_max;

  return (
    <div>

      {/* ── Back ────────────────────────────────────────────────────────── */}
      <Link href="/app/jobs" className="inline-flex items-center gap-2 text-[13px] text-[#9e9b95] transition hover:text-[#1a1916]">
        ← All roles
      </Link>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mt-8 mb-10 border-b border-[#e2dfd9] pb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9e9b95]">{job.company}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1a1916]">{job.title}</h1>
        <p className="mt-3 text-sm text-[#6a6761]">
          {[
            job.location,
            job.remote_type && job.remote_type !== "unknown" ? (job.remote_type as string).replace(/_/g, " ") : null,
            job.experience_level && job.experience_level !== "unknown" ? job.experience_level : null,
            hasSalary ? [
              job.salary_min ? `${Math.round((job.salary_min as number) / 1000)}k` : "",
              job.salary_max ? `${Math.round((job.salary_max as number) / 1000)}k` : "",
            ].filter(Boolean).join("–") + ` ${job.salary_currency ?? "AED"}/mo` : null,
          ].filter(Boolean).join("  ·  ")}
        </p>
      </div>

      {/* ── 2-col grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 items-start">

        {/* ── Left — AI analysis ──────────────────────────────────────── */}
        <div>
          {hasAiAnalysis && matchData && actionData ? (
            <AiAnalysisPanel match={matchData} action={actionData} />
          ) : (
            <div className="rounded-xl border border-[#e2dfd9] bg-white px-8 py-7">
              {hasAiProfile ? (
                <div className="space-y-5">
                  <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-semibold tabular-nums text-[#1a1916]">
                      {basicMatch.score}<span className="text-lg font-normal text-[#9e9b95]">%</span>
                    </span>
                    <span className="text-sm text-[#9e9b95]">skill match</span>
                  </div>
                  {basicMatch.matched.length > 0 && (
                    <p className="text-sm text-[#6a6761]">
                      <span className="font-medium text-[#1a1916]">Matching:</span>{" "}
                      {basicMatch.matched.join(", ")}
                    </p>
                  )}
                  {basicMatch.missing.length > 0 && (
                    <p className="text-sm text-[#6a6761]">
                      <span className="font-medium text-[#1a1916]">Missing:</span>{" "}
                      {basicMatch.missing.join(", ")}
                    </p>
                  )}
                  <p className="text-xs text-[#9e9b95]">
                    Basic skill match only. Run a full analysis for detailed guidance.
                  </p>
                  <AnalyseJobButton jobId={job.id} />
                </div>
              ) : (
                <p className="text-sm text-[#6a6761]">
                  <Link href="/app/profile" className="font-medium text-[#1a1916] underline underline-offset-4">
                    Build your AI profile
                  </Link>
                  {" "}to analyse this role.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Right — job info + apply (sticky) ───────────────────────── */}
        <div className="lg:sticky lg:top-10 space-y-8">

          {/* Description */}
          <div>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9e9b95]">About the Role</p>
            <p className="whitespace-pre-line text-sm leading-8 text-[#3a3835]">{job.description}</p>
          </div>

          {/* Apply */}
          {job.apply_url && (
            <div className="border-t border-[#e2dfd9] pt-7">
              <a
                href={job.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-lg bg-[#0c0c0c] px-8 text-sm font-medium text-white/80 transition hover:bg-[#1a1a1a] hover:text-white"
              >
                Apply for this role
                <span className="text-white/30">↗</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
