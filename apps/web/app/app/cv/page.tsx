import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CvPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: primaryCv } = await supabase
    .from("cvs")
    .select("file_name, created_at, size_bytes, parsed_text_status")
    .eq("profile_id", user.id)
    .eq("is_primary", true)
    .maybeSingle();

  const sizeKb     = primaryCv?.size_bytes ? Math.round((primaryCv.size_bytes as number) / 1024) : null;
  const textStatus = primaryCv?.parsed_text_status as string | undefined;

  const statusText = textStatus === "success"
    ? "Extracted — AI can read your CV"
    : textStatus === "failed"
    ? "Extraction failed — AI will use profile data only"
    : textStatus === "pending"
    ? "Extraction pending"
    : null;

  return (
    <div className="max-w-2xl space-y-14">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="border-b border-[#e2dfd9] pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9e9b95]">Career Agent</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#1a1916]">CV</h1>
      </div>

      {primaryCv ? (
        <div className="space-y-8">

          {/* File */}
          <div>
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9e9b95]">Active Document</p>
            <p className="text-base font-semibold text-[#1a1916]">{primaryCv.file_name as string}</p>
            <p className="mt-1 text-sm text-[#9e9b95]">
              Uploaded {new Date(primaryCv.created_at as string).toLocaleDateString()}
              {sizeKb ? `  ·  ${sizeKb} KB` : ""}
            </p>
          </div>

          {/* Status */}
          {statusText && (
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9e9b95]">Text Extraction</p>
              <p className={`text-sm ${textStatus === "success" ? "text-[#8b7355]" : "text-[#6a6761]"}`}>
                {statusText}
              </p>
            </div>
          )}

          {/* Replace */}
          <div className="border-t border-[#e2dfd9] pt-7">
            <p className="text-sm text-[#6a6761]">To replace your CV, upload a new file via onboarding.</p>
            <Link
              href="/app/onboarding"
              className="mt-4 inline-flex h-10 items-center rounded-lg bg-[#0c0c0c] px-6 text-sm font-medium text-white/80 transition hover:bg-[#1a1a1a] hover:text-white"
            >
              Replace CV
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-[#6a6761]">
            No CV on file. Upload your CV to enable AI-powered analysis of your profile and role matches.
          </p>
          <Link
            href="/app/onboarding"
            className="inline-flex h-10 items-center rounded-lg bg-[#0c0c0c] px-6 text-sm font-medium text-white/80 transition hover:bg-[#1a1a1a] hover:text-white"
          >
            Upload CV
          </Link>
        </div>
      )}
    </div>
  );
}
