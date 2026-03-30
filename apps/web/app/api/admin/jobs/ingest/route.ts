import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { runJobAgent } from "@/lib/agents/job-agent";

// ─── Constants ────────────────────────────────────────────────────────────────

const MANUAL_SOURCE_KEY = "manual-input";

// ─── Schema ───────────────────────────────────────────────────────────────────

const rawJobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  description: z.string().min(50),
  location: z.string().optional(),
  country_code: z.string().length(2).optional(),
  city: z.string().optional(),
  apply_url: z.string().url().optional(),
  source_url: z.string().url().optional(),
  external_job_id: z.string().optional(),
});

const ingestBodySchema = z.object({
  jobs: z.array(rawJobSchema).min(1).max(20),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Admin auth: bearer must match service role key
  const authHeader = req.headers.get("authorization");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  let body: z.infer<typeof ingestBodySchema>;
  try {
    body = ingestBodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // ── Get or create manual-input source ──────────────────────────────────────
  let sourceId: string;
  const { data: existingSource } = await admin
    .from("job_sources")
    .select("id")
    .eq("source_key", MANUAL_SOURCE_KEY)
    .maybeSingle();

  if (existingSource) {
    sourceId = existingSource.id as string;
  } else {
    const { data: newSource, error: srcErr } = await admin
      .from("job_sources")
      .insert({
        source_key: MANUAL_SOURCE_KEY,
        source_type: "api",
        source_name: "Manual Input",
        fetch_strategy: "poll",
        is_active: true,
      })
      .select("id")
      .single();
    if (srcErr || !newSource) {
      return NextResponse.json({ error: "Failed to create job source" }, { status: 500 });
    }
    sourceId = newSource.id as string;
  }

  // ── Create import run ───────────────────────────────────────────────────────
  const { data: importRun, error: runErr } = await admin
    .from("job_import_runs")
    .insert({
      source_id: sourceId,
      run_type: "manual_internal",
      status: "running",
      fetched_count: body.jobs.length,
    })
    .select("id")
    .single();

  if (runErr || !importRun) {
    return NextResponse.json({ error: "Failed to create import run" }, { status: 500 });
  }

  // ── Process each job ────────────────────────────────────────────────────────
  const results: Array<{ title: string; status: "ok" | "error"; job_id?: string; error?: string }> = [];
  let normalizedCount = 0;
  let errorCount = 0;

  for (const raw of body.jobs) {
    try {
      const agentOutput = await runJobAgent(raw, apiKey);

      const titleNorm = slugify(raw.title);
      const companyNorm = slugify(raw.company);
      const canonicalKey = `manual-${companyNorm}-${titleNorm}`;
      const descriptionHash = sha256(raw.description).slice(0, 16);
      const contentHash = sha256(JSON.stringify({ title: raw.title, company: raw.company, description: raw.description }));

      // Insert raw job (upsert on content hash uniqueness)
      const { data: rawJob } = await admin
        .from("raw_jobs")
        .upsert(
          {
            source_id: sourceId,
            import_run_id: importRun.id as string,
            external_job_id: raw.external_job_id ?? canonicalKey,
            source_url: raw.source_url ?? null,
            apply_url: raw.apply_url ?? null,
            title_raw: raw.title,
            company_raw: raw.company,
            location_raw: raw.location ?? null,
            raw_payload: { ...raw, agent_output: agentOutput },
            content_hash: contentHash,
            processing_status: "normalized",
          },
          { onConflict: "source_id,content_hash" },
        )
        .select("id")
        .maybeSingle();

      // Upsert normalized job
      const { data: job, error: jobErr } = await admin
        .from("jobs")
        .upsert(
          {
            source_id: sourceId,
            primary_raw_job_id: rawJob?.id ?? null,
            external_job_id: raw.external_job_id ?? canonicalKey,
            canonical_key: canonicalKey,
            title: raw.title,
            title_normalized: titleNorm,
            company: raw.company,
            company_normalized: companyNorm,
            location: raw.location ?? null,
            country_code: raw.country_code ?? null,
            city: raw.city ?? null,
            remote_type: agentOutput.remote_type,
            employment_type: agentOutput.employment_type,
            experience_level: agentOutput.experience_level,
            description: raw.description,
            description_hash: descriptionHash,
            apply_url: raw.apply_url ?? null,
            source_url: raw.source_url ?? null,
            required_skills: agentOutput.required_skills,
            is_active: true,
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: "canonical_key" },
        )
        .select("id")
        .single();

      if (jobErr || !job) throw new Error(jobErr?.message ?? "Job upsert failed");

      results.push({ title: raw.title, status: "ok", job_id: job.id as string });
      normalizedCount++;
    } catch (err) {
      results.push({ title: raw.title, status: "error", error: String(err) });
      errorCount++;
    }
  }

  // ── Update import run ───────────────────────────────────────────────────────
  const finalStatus =
    errorCount === body.jobs.length ? "failed" : errorCount > 0 ? "partial" : "completed";

  await admin
    .from("job_import_runs")
    .update({
      status: finalStatus,
      finished_at: new Date().toISOString(),
      normalized_count: normalizedCount,
      error_count: errorCount,
    })
    .eq("id", importRun.id as string);

  return NextResponse.json({
    import_run_id: importRun.id,
    total: body.jobs.length,
    normalized: normalizedCount,
    errors: errorCount,
    results,
  });
}
