import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";

import { PageIntro } from "@/components/layout/page-intro";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CvPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: primaryCv } = await supabase
    .from("cvs")
    .select("file_name, created_at, size_bytes, parsed_text_status")
    .eq("profile_id", user.id)
    .eq("is_primary", true)
    .maybeSingle();

  const sizeKb = primaryCv?.size_bytes ? Math.round((primaryCv.size_bytes as number) / 1024) : null;
  const textStatus = primaryCv?.parsed_text_status as string | undefined;

  return (
    <div className="space-y-6">
      <PageIntro title="CV" description="Your active CV is used for AI-powered profile analysis." />

      {primaryCv ? (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white">
              <FileText className="h-5 w-5 text-slate-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{primaryCv.file_name as string}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Uploaded {new Date(primaryCv.created_at as string).toLocaleDateString()}
                {sizeKb ? ` · ${sizeKb} KB` : ""}
              </p>
              {textStatus ? (
                <p className="mt-1 text-xs text-slate-400">
                  Text extraction:{" "}
                  <span
                    className={
                      textStatus === "success"
                        ? "text-emerald-600"
                        : textStatus === "failed"
                          ? "text-amber-600"
                          : "text-slate-400"
                    }
                  >
                    {textStatus === "success"
                      ? "Done — AI can read your CV"
                      : textStatus === "failed"
                        ? "Could not extract text — AI will use profile data only"
                        : "Pending"}
                  </span>
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-500">To replace your CV, go to the onboarding page and upload a new file.</p>
            <Link
              href="/app/onboarding"
              className="mt-2 inline-block text-xs font-medium text-slate-700 underline-offset-2 hover:underline"
            >
              Go to onboarding &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">No CV uploaded yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Upload your CV to enable AI-powered career analysis.
          </p>
          <Link
            href="/app/onboarding"
            className="mt-4 inline-flex h-10 items-center rounded-xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Upload CV
          </Link>
        </div>
      )}
    </div>
  );
}
