import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, CheckCircle2, AlertTriangle, Clock, UploadCloud } from "lucide-react";

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

  const statusMap = {
    success: {
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      label: "AI can read your CV",
      color: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-200",
    },
    failed: {
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
      label: "Text extraction failed — AI will use profile data only",
      color: "text-amber-700",
      bg: "bg-amber-50 border-amber-200",
    },
    pending: {
      icon: <Clock className="h-4 w-4 text-slate-400" />,
      label: "Extraction pending",
      color: "text-slate-500",
      bg: "bg-slate-50 border-slate-200",
    },
  };

  const status = textStatus && textStatus in statusMap
    ? statusMap[textStatus as keyof typeof statusMap]
    : null;

  return (
    <div className="max-w-2xl space-y-8">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-950">CV</h1>
        <p className="mt-0.5 text-sm text-slate-500">Your active CV used for AI-powered profile analysis</p>
      </div>

      {primaryCv ? (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {/* File info */}
          <div className="flex items-start gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
              <FileText className="h-5 w-5 text-slate-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{primaryCv.file_name as string}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Uploaded {new Date(primaryCv.created_at as string).toLocaleDateString()}
                {sizeKb ? ` · ${sizeKb} KB` : ""}
              </p>
            </div>
          </div>

          {/* Status */}
          {status && (
            <div className={`mx-5 mb-5 flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 ${status.bg}`}>
              {status.icon}
              <p className={`text-xs font-medium ${status.color}`}>{status.label}</p>
            </div>
          )}

          {/* Replace action */}
          <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
            <p className="text-xs text-slate-500">To replace your CV, upload a new file in onboarding.</p>
            <Link
              href="/app/onboarding"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 transition hover:text-slate-600"
            >
              <UploadCloud className="h-3.5 w-3.5" /> Replace CV →
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white">
            <UploadCloud className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No CV uploaded yet</p>
          <p className="mt-1 text-sm text-slate-500">Upload your CV to enable AI-powered career analysis.</p>
          <Link
            href="/app/onboarding"
            className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <UploadCloud className="h-4 w-4" /> Upload CV
          </Link>
        </div>
      )}
    </div>
  );
}
