import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

import type { MatchOutput } from "./match-agent";

// ─── Contract ─────────────────────────────────────────────────────────────────

export const actionOutputSchema = z.object({
  should_apply: z.boolean(),
  rationale: z.string(),
  next_steps: z.array(z.string()),
  message_draft: z.string(),
  cover_note: z.string(),
  cv_improvement_points: z.array(z.string()),
});

export type ActionOutput = z.infer<typeof actionOutputSchema>;

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildPrompt(
  profile: Record<string, unknown>,
  job: Record<string, unknown>,
  match: MatchOutput,
): string {
  const gaps = match.gaps.length > 0 ? match.gaps.join(", ") : "none identified";
  const strengths = match.strengths.length > 0 ? match.strengths.join(", ") : "none identified";

  return `You are a career advisor for the Gulf tech job market.
Based on the match analysis below, give specific and practical application guidance.
Return JSON only — no markdown, no extra text.

CANDIDATE SUMMARY: ${profile.professional_summary ?? "not provided"}
CANDIDATE NAME: ${profile.first_name ?? ""} ${profile.last_name ?? ""}

JOB: ${job.title} at ${job.company} (${job.location ?? ""})

MATCH ANALYSIS:
- Score: ${match.score}/100
- Recommendation: ${match.recommendation}
- Strengths: ${strengths}
- Gaps: ${gaps}

Return exactly this JSON structure:
{
  "should_apply": <true if score >= 40 AND recommendation is apply or maybe, false otherwise>,
  "rationale": "<1–2 sentences: why apply or why not, specific to this candidate and job>",
  "next_steps": ["<concrete action 1>", "<concrete action 2>", "<concrete action 3>"],
  "message_draft": "<short professional intro message, 2–3 sentences, mention role and one key strength>",
  "cover_note": "<focused cover note, 2–3 sentences, highlight fit and address one gap>",
  "cv_improvement_points": ["<specific CV change 1>", "<specific CV change 2>"]
}

Rules:
- Be specific to this candidate and job, not generic
- If gaps are significant, name them in the rationale
- message_draft and cover_note should be ready to use with minimal editing
- next_steps should be actionable within 1 week`;
}

// ─── Normalizer (safe pre-Zod coercion) ──────────────────────────────────────

function normalize(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null) {
    return {
      should_apply: false,
      rationale: "",
      next_steps: [],
      message_draft: "",
      cover_note: "",
      cv_improvement_points: [],
    };
  }
  const o = raw as Record<string, unknown>;
  return {
    should_apply: typeof o.should_apply === "boolean" ? o.should_apply : false,
    rationale: typeof o.rationale === "string" ? o.rationale : "",
    next_steps: Array.isArray(o.next_steps) ? o.next_steps.map(String) : [],
    message_draft: typeof o.message_draft === "string" ? o.message_draft : "",
    cover_note: typeof o.cover_note === "string" ? o.cover_note : "",
    cv_improvement_points: Array.isArray(o.cv_improvement_points) ? o.cv_improvement_points.map(String) : [],
  };
}

// ─── Agent ────────────────────────────────────────────────────────────────────

export const ACTION_MODEL = "claude-sonnet-4-6";
export const ACTION_PROMPT_VERSION = "v1";

export async function runActionAgent(
  profile: Record<string, unknown>,
  job: Record<string, unknown>,
  match: MatchOutput,
  apiKey: string,
): Promise<ActionOutput> {
  const anthropic = new Anthropic({ apiKey });

  const message = await anthropic.messages.create({
    model: ACTION_MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: buildPrompt(profile, job, match) }],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonText = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed: unknown = JSON.parse(jsonText);

  return actionOutputSchema.parse(normalize(parsed));
}
