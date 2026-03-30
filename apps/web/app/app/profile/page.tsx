import Link from "next/link";
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
      .select("file_name, created_at, parsed_text_status")
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
  const detectedLanguages: string[] = Array.isArray(aiProfile?.detected_languages)
    ? (aiProfile.detected_languages as string[])
    : [];
  const strengths: string[] = Array.isArray(aiProfile?.strengths) ? (aiProfile.strengths as string[]) : [];
  const weaknesses: string[] = Array.isArray(aiProfile?.weaknesses) ? (aiProfile.weaknesses as string[]) : [];
  const targetRoles: string[] = Array.isArray(aiProfile?.target_roles) ? (aiProfile.target_roles as string[]) : [];

  // Has the user completed enough of their profile to get useful analysis?
  const hasProfile = profile?.is_profile_complete ?? false;
  const hasCv = !!primaryCv;
  const hasAiProfile = !!aiProfile;

  // Auto-trigger analysis on first load after CV upload (no AI profile yet, but CV exists)
  const shouldAutoGenerate = hasCv && !hasAiProfile;

  return (
    <div className="space-y-6">
      <PageIntro title="Profile" description="Your candidate profile and AI-generated career insights." />

      {/* ── No CV — primary call to action ─────────────────────────────── */}
      {!hasCv && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-8 text-center">
          <p className="text-sm font-medium text-slate-700">Upload your CV to unlock AI-powered insights</p>
          <p className="mt-1 text-sm text-slate-500">
            We&apos;ll analyse your skills, experience, and career trajectory automatically.
          </p>
          <div className="mt-4">
            <Link
              href="/app/onboarding"
              className="inline-flex h-10 items-center rounded-xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Set up profile &amp; upload CV
            </Link>
          </div>
        </div>
      )}

      {/* ── AI Insights ─────────────────────────────────────────────────── */}
      <Section title="AI insights">
        {hasAiProfile ? (
          <div className="space-y-5 text-sm text-slate-700">
            {/* Summary */}
            {aiProfile.professional_summary ? (
              <p className="leading-relaxed text-slate-800">{aiProfile.professional_summary as string}</p>
            ) : null}

            {/* Skills */}
            {detectedSkills.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {detectedSkills.map((s) => (
                    <Tag key={s} label={s} />
                  ))}
                </div>
              </div>
            )}

            {/* Detected languages */}
            {detectedLanguages.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Languages</p>
                <div className="flex flex-wrap gap-1.5">
                  {detectedLanguages.map((l) => (
                    <Tag key={l} label={l} />
                  ))}
                </div>
              </div>
            )}

            {/* Seniority */}
            {aiProfile.seniority_estimate && aiProfile.seniority_estimate !== "unknown" ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Seniority</p>
                <p className="capitalize">{aiProfile.seniority_estimate as string}</p>
              </div>
            ) : null}

            {/* Strengths */}
            {strengths.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Strengths</p>
                <ul className="space-y-1 pl-4">
                  {strengths.map((s) => (
                    <li key={s} className="list-disc text-xs text-slate-600">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses / areas to develop */}
            {weaknesses.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Areas to develop</p>
                <ul className="space-y-1 pl-4">
                  {weaknesses.map((w) => (
                    <li key={w} className="list-disc text-xs text-slate-600">
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Target roles */}
            {targetRoles.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Target roles</p>
                <div className="flex flex-wrap gap-1.5">
                  {targetRoles.map((r) => (
                    <Tag key={r} label={r} />
                  ))}
                </div>
              </div>
            )}

            {/* Footer: confidence + model + date */}
            <p className="border-t border-slate-100 pt-3 text-xs text-slate-400">
              Confidence: {Math.round(Number(aiProfile.confidence_score) * 100)}% &middot;{" "}
              {aiProfile.model_name as string} &middot;{" "}
              {new Date(aiProfile.created_at as string).toLocaleDateString()}
            </p>

            {/* Re-generate option */}
            <GenerateAiProfileButton />
          </div>
        ) : hasCv ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              {shouldAutoGenerate
                ? "Starting analysis of your CV and profile…"
                : "Your CV is ready. Generate your AI profile to see insights."}
            </p>
            <GenerateAiProfileButton autoGenerate={shouldAutoGenerate} />
          </div>
        ) : (
          <p className="text-sm text-slate-400">Upload your CV to unlock AI-powered career insights.</p>
        )}
      </Section>

      {/* ── Identity ────────────────────────────────────────────────────── */}
      {hasProfile && (
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
                <span className="capitalize">{profile.experience_level}</span>
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
      )}

      {/* ── Job preferences ─────────────────────────────────────────────── */}
      {hasProfile && (
        <Section title="Job preferences">
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-medium">Remote:</span>{" "}
              {profile?.remote_preference && profile.remote_preference !== "unknown" ? (
                <span className="capitalize">{profile.remote_preference}</span>
              ) : (
                <span className="text-slate-400">Not specified</span>
              )}
            </p>
            <p>
              <span className="font-medium">Mobility:</span>{" "}
              {profile?.mobility && profile.mobility !== "unknown" ? (
                <span className="capitalize">{profile.mobility.replace(/_/g, " ")}</span>
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
      )}

      {/* ── Edit profile link ────────────────────────────────────────────── */}
      <div className="text-right">
        <Link href="/app/onboarding" className="text-xs text-slate-400 transition hover:text-slate-700">
          Edit profile &rarr;
        </Link>
      </div>
    </div>
  );
}
