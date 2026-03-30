import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

// ─── Contract ─────────────────────────────────────────────────────────────────

export const matchOutputSchema = z.object({
  score: z.number().int().min(0).max(100),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  reasons: z.array(z.string()),
  recommendation: z.enum(["apply", "maybe", "skip"]),
});

export type MatchOutput = z.infer<typeof matchOutputSchema>;

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildPrompt(profile: Record<string, unknown>, job: Record<string, unknown>): string {
  const skills = Array.isArray(profile.detected_skills) ? (profile.detected_skills as string[]).join(", ") : "none";
  const langs = Array.isArray(profile.detected_languages)
    ? (profile.detected_languages as string[]).join(", ")
    : "none";
  const jobSkills = Array.isArray(job.required_skills) ? (job.required_skills as string[]).join(", ") : "none";
  const desc = String(job.description ?? "").slice(0, 1200);

  return `You are a career matching specialist for the Gulf region tech job market.
Evaluate how well this candidate fits the job and return JSON only — no markdown, no extra text.

CANDIDATE:
- Summary: ${profile.professional_summary ?? "not provided"}
- Seniority: ${profile.seniority_estimate ?? "unknown"}
- Skills: ${skills}
- Languages: ${langs}

JOB:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location ?? ""}
- Required Skills: ${jobSkills}
- Level: ${job.experience_level ?? "unknown"}
- Description: ${desc}

Return exactly this JSON structure:
{
  "score": <integer 0–100, reflecting real fit — not inflated>,
  "strengths": ["<specific strength 1>", "<specific strength 2>"],
  "gaps": ["<specific gap 1>", "<specific gap 2>"],
  "reasons": ["<key reason for the score>"],
  "recommendation": "<apply|maybe|skip>"
}

Rules:
- score 70–100 = strong match → recommendation: apply
- score 40–69 = partial match → recommendation: maybe
- score 0–39 = weak match → recommendation: skip
- Be honest. Avoid optimistic bias.`;
}

// ─── Normalizer (safe pre-Zod coercion) ──────────────────────────────────────

function normalize(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null) {
    return { score: 0, strengths: [], gaps: [], reasons: [], recommendation: "maybe" };
  }
  const o = raw as Record<string, unknown>;
  const rec = String(o.recommendation ?? "maybe");
  return {
    score: typeof o.score === "number" ? Math.round(Math.min(100, Math.max(0, o.score))) : 0,
    strengths: Array.isArray(o.strengths) ? o.strengths.map(String) : [],
    gaps: Array.isArray(o.gaps) ? o.gaps.map(String) : [],
    reasons: Array.isArray(o.reasons) ? o.reasons.map(String) : [],
    recommendation: (["apply", "maybe", "skip"] as const).includes(rec as "apply" | "maybe" | "skip")
      ? rec
      : "maybe",
  };
}

// ─── Agent ────────────────────────────────────────────────────────────────────

export const MATCH_MODEL = "claude-sonnet-4-6";
export const MATCH_PROMPT_VERSION = "v1";

export async function runMatchAgent(
  profile: Record<string, unknown>,
  job: Record<string, unknown>,
  apiKey: string,
): Promise<MatchOutput> {
  const anthropic = new Anthropic({ apiKey });

  const message = await anthropic.messages.create({
    model: MATCH_MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: buildPrompt(profile, job) }],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonText = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed: unknown = JSON.parse(jsonText);

  return matchOutputSchema.parse(normalize(parsed));
}
