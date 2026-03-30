import Link from "next/link";
import { redirect } from "next/navigation";

import { GenerateAiProfileButton } from "@/components/profile/generate-ai-profile-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  const languages:      string[] = Array.isArray(profile?.languages)            ? (profile.languages as string[])            : [];
  const desiredRoles:   string[] = Array.isArray(profile?.desired_roles)        ? (profile.desired_roles as string[])        : [];
  const detectedSkills: string[] = Array.isArray(aiProfile?.detected_skills)    ? (aiProfile.detected_skills as string[])    : [];
  const detectedLangs:  string[] = Array.isArray(aiProfile?.detected_languages) ? (aiProfile.detected_languages as string[]) : [];
  const strengths:      string[] = Array.isArray(aiProfile?.strengths)          ? (aiProfile.strengths as string[])          : [];
  const weaknesses:     string[] = Array.isArray(aiProfile?.weaknesses)         ? (aiProfile.weaknesses as string[])         : [];
  const targetRoles:    string[] = Array.isArray(aiProfile?.target_roles)       ? (aiProfile.target_roles as string[])       : [];

  const hasProfile       = profile?.is_profile_complete ?? false;
  const hasCv            = !!primaryCv;
  const hasAiProfile     = !!aiProfile;
  const shouldAutoGenerate = hasCv && !hasAiProfile;

  return (
    <div className="max-w-2xl space-y-14">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between border-b border-[#e2dfd9] pb-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9e9b95]">Career Agent</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#1a1916]">Profile</h1>
        </div>
        <Link href="/app/onboarding" className="text-[12px] text-[#9e9b95] transition hover:text-[#1a1916] underline underline-offset-4">
          Edit
        </Link>
      </div>

      {/* ── No CV notice ────────────────────────────────────────────────── */}
      {!hasCv && (
        <div className="rounded-lg border border-[#e2dfd9] bg-white px-8 py-7">
          <p className="text-sm font-medium text-[#1a1916]">No CV on file</p>
          <p className="mt-2 text-sm leading-7 text-[#6a6761]">
            Upload your CV to enable AI-powered analysis of your profile and role matches.
          </p>
          <Link
            href="/app/onboarding"
            className="mt-5 inline-flex h-10 items-center rounded-lg bg-[#0c0c0c] px-6 text-sm font-medium text-white/80 transition hover:bg-[#1a1a1a] hover:text-white"
          >
            Upload CV
          </Link>
        </div>
      )}

      {/* ── AI Insights ─────────────────────────────────────────────────── */}
      <div>
        <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9e9b95]">AI Insights</p>

        {hasAiProfile ? (
          <div className="space-y-10">

            {/* Summary */}
            {aiProfile.professional_summary && (
              <p className="text-sm leading-8 text-[#3a3835]">
                {aiProfile.professional_summary as string}
              </p>
            )}

            {/* Seniority */}
            {aiProfile.seniority_estimate && aiProfile.seniority_estimate !== "unknown" && (
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9e9b95]">Seniority</p>
                <p className="text-sm font-semibold capitalize text-[#1a1916]">
                  {aiProfile.seniority_estimate as string}
                </p>
              </div>
            )}

            {/* Skills */}
            {detectedSkills.length > 0 && (
              <div>
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9e9b95]">Skills</p>
                <p className="text-sm leading-8 text-[#1a1916]">
                  {detectedSkills.join("  ·  ")}
                </p>
              </div>
            )}

            {/* Languages */}
            {detectedLangs.length > 0 && (
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9e9b95]">Languages</p>
                <p className="text-sm text-[#1a1916]">{detectedLangs.join("  ·  ")}</p>
              </div>
            )}

            {/* Strengths */}
            {strengths.length > 0 && (
              <div>
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9e9b95]">Strengths</p>
                <ul className="space-y-3">
                  {strengths.map((s) => (
                    <li key={s} className="flex gap-3 text-sm leading-6 text-[#1a1916]">
                      <span className="shrink-0 text-[#8b7355]">—</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {weaknesses.length > 0 && (
              <div>
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9e9b95]">Areas to Develop</p>
                <ul className="space-y-3">
                  {weaknesses.map((w) => (
                    <li key={w} className="flex gap-3 text-sm leading-6 text-[#6a6761]">
                      <span className="shrink-0 text-[#9e9b95]">—</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Target roles */}
            {targetRoles.length > 0 && (
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9e9b95]">Target Roles</p>
                <p className="text-sm text-[#1a1916]">{targetRoles.join("  ·  ")}</p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-[#e2dfd9] pt-6 flex items-center justify-between">
              <p className="text-[11px] text-[#9e9b95]">
                {aiProfile.model_name as string} · {Math.round(Number(aiProfile.confidence_score) * 100)}% confidence · {new Date(aiProfile.created_at as string).toLocaleDateString()}
              </p>
              <GenerateAiProfileButton />
            </div>
          </div>
        ) : hasCv ? (
          <div className="space-y-4">
            <p className="text-sm text-[#6a6761]">
              {shouldAutoGenerate ? "Analysing your CV…" : "Ready to generate your AI profile."}
            </p>
            <GenerateAiProfileButton autoGenerate={shouldAutoGenerate} />
          </div>
        ) : (
          <p className="text-sm text-[#9e9b95]">Upload your CV to unlock AI-powered career insights.</p>
        )}
      </div>

      {/* ── Identity ────────────────────────────────────────────────────── */}
      {hasProfile && (
        <div>
          <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9e9b95]">Identity</p>
          <div className="space-y-5">
            {[
              { label: "Name", value: profile?.first_name || profile?.last_name ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() : null },
              { label: "Location", value: profile?.city || profile?.country_code ? `${profile.city ?? ""}, ${profile.country_code ?? ""}`.replace(/^,\s*|,\s*$/, "") : null },
              { label: "Experience", value: profile?.experience_level && profile.experience_level !== "unknown" ? profile.experience_level : null },
              { label: "Remote", value: profile?.remote_preference && profile.remote_preference !== "unknown" ? profile.remote_preference : null },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-baseline gap-8">
                <p className="w-24 shrink-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9e9b95]">{label}</p>
                <p className="text-sm font-medium capitalize text-[#1a1916]">
                  {value ?? <span className="font-normal text-[#c4c1bb]">—</span>}
                </p>
              </div>
            ))}
            {languages.length > 0 && (
              <div className="flex items-baseline gap-8">
                <p className="w-24 shrink-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9e9b95]">Languages</p>
                <p className="text-sm text-[#1a1916]">{languages.join("  ·  ")}</p>
              </div>
            )}
            {desiredRoles.length > 0 && (
              <div className="flex items-baseline gap-8">
                <p className="w-24 shrink-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9e9b95]">Target</p>
                <p className="text-sm text-[#1a1916]">{desiredRoles.join("  ·  ")}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
