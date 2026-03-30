export type FitLabel = "Good fit" | "Partial fit" | "Low fit";

export type MatchResult = {
  score: number;     // 0–100
  label: FitLabel;
  matched: string[]; // job skills found in user's skill set
  missing: string[]; // job skills the user is missing
};

/** Normalize a skill string: lowercase, trim, collapse internal whitespace. */
function normalize(skill: string): string {
  return skill.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Deterministic match between a user's detected skills and a job's required skills.
 *
 * Formula: score = (matched_skills / job_required_skills) * 100
 * Threshold: Good fit ≥ 70 · Partial fit ≥ 40 · Low fit < 40
 * Fallback: score = 0 when either list is empty.
 */
export function computeMatch(userSkills: string[], jobRequiredSkills: string[]): MatchResult {
  if (userSkills.length === 0 || jobRequiredSkills.length === 0) {
    return { score: 0, label: "Low fit", matched: [], missing: jobRequiredSkills };
  }

  const userSet = new Set(userSkills.map(normalize));

  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of jobRequiredSkills) {
    if (userSet.has(normalize(skill))) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  const score = Math.round((matched.length / jobRequiredSkills.length) * 100);
  const label: FitLabel = score >= 70 ? "Good fit" : score >= 40 ? "Partial fit" : "Low fit";

  return { score, label, matched, missing };
}
