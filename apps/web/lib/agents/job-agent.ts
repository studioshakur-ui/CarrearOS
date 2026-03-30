import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

// ─── Contract ─────────────────────────────────────────────────────────────────

export const jobOutputSchema = z.object({
  required_skills: z.array(z.string()),
  experience_level: z.enum(["intern", "junior", "mid", "senior", "lead", "unknown"]),
  remote_type: z.enum(["onsite", "hybrid", "remote", "unknown"]),
  employment_type: z.enum([
    "full_time",
    "part_time",
    "internship",
    "apprenticeship",
    "contract",
    "temporary",
    "freelance",
    "unknown",
  ]),
});

export type JobOutput = z.infer<typeof jobOutputSchema>;

// ─── Normalizer ───────────────────────────────────────────────────────────────

const VALID_EXPERIENCE = ["intern", "junior", "mid", "senior", "lead", "unknown"] as const;
const VALID_REMOTE = ["onsite", "hybrid", "remote", "unknown"] as const;
const VALID_EMPLOYMENT = [
  "full_time",
  "part_time",
  "internship",
  "apprenticeship",
  "contract",
  "temporary",
  "freelance",
  "unknown",
] as const;

function normalize(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null) {
    return { required_skills: [], experience_level: "unknown", remote_type: "unknown", employment_type: "unknown" };
  }
  const o = raw as Record<string, unknown>;
  return {
    required_skills: Array.isArray(o.required_skills)
      ? o.required_skills.map(String).filter(Boolean).slice(0, 20)
      : [],
    experience_level: VALID_EXPERIENCE.includes(o.experience_level as (typeof VALID_EXPERIENCE)[number])
      ? o.experience_level
      : "unknown",
    remote_type: VALID_REMOTE.includes(o.remote_type as (typeof VALID_REMOTE)[number]) ? o.remote_type : "unknown",
    employment_type: VALID_EMPLOYMENT.includes(o.employment_type as (typeof VALID_EMPLOYMENT)[number])
      ? o.employment_type
      : "unknown",
  };
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildPrompt(job: { title: string; company: string; description: string; location?: string }): string {
  const desc = job.description.slice(0, 2_000);
  return `You are a job data normalization specialist for the Gulf region tech job market.
Analyze this job posting and extract structured data. Return JSON only — no markdown, no extra text.

JOB POSTING:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location ?? "not specified"}
- Description: ${desc}

Return exactly this JSON:
{
  "required_skills": ["<skill_1>", "<skill_2>"],
  "experience_level": "<intern|junior|mid|senior|lead|unknown>",
  "remote_type": "<onsite|hybrid|remote|unknown>",
  "employment_type": "<full_time|part_time|internship|apprenticeship|contract|temporary|freelance|unknown>"
}

Rules for required_skills:
- List specific technical skills, tools, frameworks, and languages mentioned or implied
- Use standard names: "TypeScript", "React", "PostgreSQL", "Docker", "Kubernetes", "AWS", etc.
- Include domain skills if explicitly required: "Arabic", "fintech experience", "regulatory compliance"
- Return 3–20 skills. Prefer specificity over quantity.
- Clean strings only — no special symbols, no parentheses.

Rules for experience_level:
- intern: < 1 year or "fresh graduate"
- junior: 1–2 years
- mid: 3–5 years
- senior: 6+ years or "senior" in title
- lead: team lead, principal, staff, or managerial scope
- unknown: if not determinable

Be precise. Do not invent skills not mentioned or implied.`;
}

// ─── Agent ────────────────────────────────────────────────────────────────────

export const JOB_MODEL = "claude-sonnet-4-6";
export const JOB_PROMPT_VERSION = "v1";

export async function runJobAgent(
  job: { title: string; company: string; description: string; location?: string },
  apiKey: string,
): Promise<JobOutput> {
  const anthropic = new Anthropic({ apiKey });

  const message = await anthropic.messages.create({
    model: JOB_MODEL,
    max_tokens: 512,
    messages: [{ role: "user", content: buildPrompt(job) }],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonText = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed: unknown = JSON.parse(jsonText);

  return jobOutputSchema.parse(normalize(parsed));
}
