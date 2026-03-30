import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, User, Settings2, ChevronRight } from "lucide-react";

import { GenerateAiProfileButton } from "@/components/profile/generate-ai-profile-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ─── Primitives ───────────────────────────────────────────────────────────────

function SkillChip({ label, variant = "default" }: { label: string; variant?: "default" | "green" | "amber" }) {
  const styles = {
    default: "border-slate-200 bg-slate-50 text-slate-700",
    green:   "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber:   "border-amber-200 bg-amber-50 text-amber-700",
  };
  return (
    <span className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-medium ${styles[variant]}`}>
      {label}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{children}</p>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: primaryCv }, { data: aiProfile }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("cvs").select("file_name, created_at, parsed_text_status").eq("profile_id", user.id).eq("is_primary", true).maybeSingle(),
    supabase.from("ai_profiles").select("*").eq("profile_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const languages: string[]       = Array.isArray(profile?.languages)            ? (profile.languages as string[])            : [];
  const desiredRoles: string[]    = Array.isArray(profile?.desired_roles)        ? (profile.desired_roles as string[])        : [];
  const detectedSkills: string[]  = Array.isArray(aiProfile?.detected_skills)   ? (aiProfile.detected_skills as string[])   : [];
  const detectedLangs: string[]   = Array.isArray(aiProfile?.detected_languages)? (aiProfile.detected_languages as string[]) : [];
  const strengths: string[]       = Array.isArray(aiProfile?.strengths)          ? (aiProfile.strengths as string[])          : [];
  const weaknesses: string[]      = Array.isArray(aiProfile?.weaknesses)         ? (aiProfile.weaknesses as string[])         : [];
  const targetRoles: string[]     = Array.isArray(aiProfile?.target_roles)       ? (aiProfile.target_roles as string[])       : [];

  const hasProfile        = profile?.is_profile_complete ?? false;
  const hasCv             = !!primaryCv;
  const hasAiProfile      = !!aiProfile;
  const shouldAutoGenerate = hasCv && !hasAiProfile;

  return (
    <div className="space-y-8">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-950">Profile</h1>
          <p className="mt-0.5 text-sm text-slate-500">Your candidate profile and AI-generated insights</p>
        </div>
        <Link
          href="/app/onboarding"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <Settings2 className="h-3 w-3" /> Edit
        </Link>
      </div>

      {/* ── No CV ───────────────────────────────────────────────────────── */}
      {!hasCv && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-900">Upload your CV to unlock AI insights</p>
          <p className="mt-1 text-xs text-amber-700">
            We&apos;ll extract your skills, experience level, and career trajectory automatically.
          </p>
          <Link
            href="/app/onboarding"
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-amber-900 px-4 text-xs font-semibold text-white transition hover:bg-amber-800"
          >
            Set up profile &amp; upload CV <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* ── AI Insights ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <p className="text-sm font-semibold text-slate-900">AI Insights</p>
          {hasAiProfile && (
            <span className="ml-auto text-[10px] font-medium text-slate-400">
              {Math.round(Number(aiProfile.confidence_score) * 100)}% confidence
            </span>
          )}
        </div>

        <div className="p-5">
          {hasAiProfile ? (
            <div className="space-y-6">

              {/* Summary */}
              {aiProfile.professional_summary && (
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm leading-relaxed text-slate-700">{aiProfile.professional_summary as string}</p>
                </div>
              )}

              {/* Seniority */}
              {aiProfile.seniority_estimate && aiProfile.seniority_estimate !== "unknown" && (
                <div className="flex items-center gap-3">
                  <SectionLabel>Seniority</SectionLabel>
                  <span className="rounded-full border border-slate-900 bg-slate-950 px-3 py-0.5 text-[11px] font-semibold text-white capitalize">
                    {aiProfile.seniority_estimate as string}
                  </span>
                </div>
              )}

              {/* Skills */}
              {detectedSkills.length > 0 && (
                <div>
                  <SectionLabel>Skills</SectionLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {detectedSkills.map((s) => <SkillChip key={s} label={s} />)}
                  </div>
                </div>
              )}

              {/* Languages */}
              {detectedLangs.length > 0 && (
                <div>
                  <SectionLabel>Languages</SectionLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {detectedLangs.map((l) => <SkillChip key={l} label={l} variant="default" />)}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {strengths.length > 0 && (
                <div>
                  <SectionLabel>Strengths</SectionLabel>
                  <div className="space-y-1.5">
                    {strengths.map((s) => (
                      <div key={s} className="flex items-start gap-2">
                        <span className="mt-0.5 text-emerald-500 text-xs">✓</span>
                        <span className="text-sm text-slate-700">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weaknesses */}
              {weaknesses.length > 0 && (
                <div>
                  <SectionLabel>Areas to develop</SectionLabel>
                  <div className="space-y-1.5">
                    {weaknesses.map((w) => (
                      <div key={w} className="flex items-start gap-2">
                        <span className="mt-0.5 text-amber-400 text-xs">△</span>
                        <span className="text-sm text-slate-700">{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Target roles */}
              {targetRoles.length > 0 && (
                <div>
                  <SectionLabel>Target roles</SectionLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {targetRoles.map((r) => <SkillChip key={r} label={r} variant="green" />)}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <p className="text-[11px] text-slate-400">
                  {aiProfile.model_name as string} · {new Date(aiProfile.created_at as string).toLocaleDateString()}
                </p>
                <GenerateAiProfileButton />
              </div>
            </div>
          ) : hasCv ? (
            <div className="py-2 space-y-4">
              <p className="text-sm text-slate-500">
                {shouldAutoGenerate
                  ? "Starting analysis of your CV…"
                  : "Your CV is ready. Generate your AI profile to see insights."}
              </p>
              <GenerateAiProfileButton autoGenerate={shouldAutoGenerate} />
            </div>
          ) : (
            <p className="py-2 text-sm text-slate-400">Upload your CV to unlock AI-powered career insights.</p>
          )}
        </div>
      </div>

      {/* ── Identity ────────────────────────────────────────────────────── */}
      {hasProfile && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
              <User className="h-3.5 w-3.5 text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-slate-900">Identity</p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-slate-100">
            {[
              {
                label: "Name",
                value: profile?.first_name || profile?.last_name
                  ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
                  : null,
              },
              {
                label: "Location",
                value: profile?.city || profile?.country_code
                  ? `${profile.city ?? ""}, ${profile.country_code ?? ""}`.replace(/^,\s*|,\s*$/, "")
                  : null,
              },
              {
                label: "Experience",
                value: profile?.experience_level && profile.experience_level !== "unknown"
                  ? profile.experience_level
                  : null,
              },
              {
                label: "Remote",
                value: profile?.remote_preference && profile.remote_preference !== "unknown"
                  ? profile.remote_preference
                  : null,
              },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-medium text-slate-900 capitalize">
                  {value ?? <span className="font-normal text-slate-400">Not set</span>}
                </p>
              </div>
            ))}
          </div>
          {languages.length > 0 && (
            <div className="px-5 py-4 border-t border-slate-100">
              <SectionLabel>Languages</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {languages.map((l) => <SkillChip key={l} label={l} />)}
              </div>
            </div>
          )}
          {desiredRoles.length > 0 && (
            <div className="px-5 py-4 border-t border-slate-100">
              <SectionLabel>Desired roles</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {desiredRoles.map((r) => <SkillChip key={r} label={r} variant="green" />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
