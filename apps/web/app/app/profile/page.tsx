import { redirect } from "next/navigation";

import { PageIntro } from "@/components/layout/page-intro";
import { GenerateAiProfileButton } from "@/components/profile/generate-ai-profile-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-600">
      {label}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</p>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: primaryCv }, { data: aiProfile }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("cvs")
      .select("file_name, created_at")
      .eq("profile_id", user.id)
      .eq("is_primary", true)
      .maybeSingle(),
    supabase
      .from("ai_profiles")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const languages: string[] = Array.isArray(profile?.languages) ? (profile.languages as string[]) : [];
  const desiredRoles: string[] = Array.isArray(profile?.desired_roles) ? (profile.desired_roles as string[]) : [];
  const detectedSkills: string[] = Array.isArray(aiProfile?.detected_skills)
    ? (aiProfile.detected_skills as string[])
    : [];
  const strengths: string[] = Array.isArray(aiProfile?.strengths) ? (aiProfile.strengths as string[]) : [];
  const weaknesses: string[] = Array.isArray(aiProfile?.weaknesses) ? (aiProfile.weaknesses as string[]) : [];
  const targetRoles: string[] = Array.isArray(aiProfile?.target_roles) ? (aiProfile.target_roles as string[]) : [];

  return (
    <div className="space-y-6">
      <PageIntro title="Profile" description="Your candidate profile and AI-generated analysis." />

      {/* ── Identity ───────────────────────────────────────────────────────── */}
      <Section title="Identity">
        <div className="space-y-2 text-sm text-slate-700">
          <p>
            <span className="font-medium">Name:</span>{" "}
            {profile?.first_name || profile?.last_name ? (
              `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
            ) : (
              <span className="text-slate-400">Not set</span>
            )}
          </p>
          <p>
            <span className="font-medium">Location:</span>{" "}
            {profile?.city || profile?.country_code ? (
              `${profile.city ?? ""}, ${profile.country_code ?? ""}`.replace(/^,\s*|,\s*$/, "")
            ) : (
              <span className="text-slate-400">Not set</span>
            )}
          </p>
          <p>
            <span className="font-medium">Experience:</span>{" "}
            {profile?.experience_level && profile.experience_level !== "unknown" ? (
              profile.experience_level
            ) : (
              <span className="text-slate-400">Not specified</span>
            )}
          </p>
          {languages.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {languages.map((l) => (
                <Tag key={l} label={l} />
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* ── Preferences ────────────────────────────────────────────────────── */}
      <Section title="Job preferences">
        <div className="space-y-2 text-sm text-slate-700">
          <p>
            <span className="font-medium">Remote:</span>{" "}
            {profile?.remote_preference && profile.remote_preference !== "unknown" ? (
              profile.remote_preference
            ) : (
              <span className="text-slate-400">Not specified</span>
            )}
          </p>
          <p>
            <span className="font-medium">Mobility:</span>{" "}
            {profile?.mobility && profile.mobility !== "unknown" ? (
              profile.mobility
            ) : (
              <span className="text-slate-400">Not specified</span>
            )}
          </p>
          {desiredRoles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {desiredRoles.map((r) => (
                <Tag key={r} label={r} />
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* ── CV ─────────────────────────────────────────────────────────────── */}
      <Section title="CV">
        {primaryCv ? (
          <p className="text-sm text-slate-700">
            <span className="font-medium">{primaryCv.file_name}</span>
            <span className="ml-2 text-xs text-slate-400">
              Uploaded {new Date(primaryCv.created_at).toLocaleDateString()}
            </span>
          </p>
        ) : (
          <p className="text-sm text-slate-400">No CV uploaded yet.</p>
        )}
      </Section>

      {/* ── AI Profile ─────────────────────────────────────────────────────── */}
      <Section title="AI profile">
        {aiProfile ? (
          <div className="space-y-4 text-sm text-slate-700">
            {aiProfile.professional_summary ? (
              <p className="leading-relaxed">{aiProfile.professional_summary as string}</p>
            ) : null}

            {detectedSkills.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-500">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {detectedSkills.map((s) => (
                    <Tag key={s} label={s} />
                  ))}
                </div>
              </div>
            )}

            {strengths.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-500">Strengths</p>
                <ul className="space-y-0.5 pl-4 text-xs text-slate-600">
                  {strengths.map((s) => (
                    <li key={s} className="list-disc">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {weaknesses.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-500">Areas to develop</p>
                <ul className="space-y-0.5 pl-4 text-xs text-slate-600">
                  {weaknesses.map((w) => (
                    <li key={w} className="list-disc">
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {targetRoles.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-500">Target roles</p>
                <div className="flex flex-wrap gap-1.5">
                  {targetRoles.map((r) => (
                    <Tag key={r} label={r} />
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-slate-400">
              Confidence: {Math.round(Number(aiProfile.confidence_score) * 100)}% · {aiProfile.model_name as string} ·{" "}
              {new Date(aiProfile.created_at as string).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <p className="mb-4 text-sm text-slate-400">
            {primaryCv
              ? "No AI profile generated yet. Click below to analyse your profile."
              : "Upload a CV first to generate an AI profile."}
          </p>
        )}

        {primaryCv ? <GenerateAiProfileButton /> : null}
      </Section>
    </div>
  );
}
