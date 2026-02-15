import type { QuizAnswer } from "./types";

/**
 * Partial-compatibility map: for certain questions, some answer
 * combinations are "close" even if not identical.
 * Key format: "questionId:valueA:valueB" → score between 0 and 1.
 * Exact matches always score 1. Unlisted pairs score 0.
 */
const PARTIAL_MATCHES: Record<string, number> = {
  // Q2 social level – adjacent levels get partial credit
  "q2:life_of_party:balanced": 0.5,
  "q2:balanced:small_gatherings": 0.5,
  "q2:small_gatherings:close_friends": 0.6,
  // Q3 activity – adjacent levels
  "q3:gym_regular:sometimes": 0.5,
  "q3:sometimes:casual": 0.5,
  "q3:casual:other": 0.4,
  // Q5 spontaneity – adjacent levels
  "q5:spontaneous:balanced": 0.5,
  "q5:balanced:planner": 0.5,
  "q5:planner:structured": 0.6,
  // Q8 introversion – adjacent
  "q8:outgoing:balanced": 0.5,
  "q8:balanced:introverted": 0.5,
  // Q10 partner energy – "balance_partner" partially matches either end
  "q10:outgoing_partner:balance_partner": 0.5,
  "q10:calm_partner:balance_partner": 0.5,
};

export function computeCompatibilityScore(
  userAnswers: QuizAnswer[],
  matchAnswers: QuizAnswer[]
): number {
  const userMap = new Map(userAnswers.map((a) => [a.questionId, a.value]));
  let totalWeight = 0;
  let earned = 0;

  for (const a of matchAnswers) {
    const u = userMap.get(a.questionId);
    if (u === undefined) continue;

    totalWeight += 1;
    const uVal = Array.isArray(u) ? u.sort().join(",") : String(u);
    const mVal = Array.isArray(a.value) ? a.value.sort().join(",") : String(a.value);

    if (uVal === mVal) {
      earned += 1;
    } else {
      // Check for partial match
      const key = `${a.questionId}:${[uVal, mVal].sort().join(":")}`;
      const partial = PARTIAL_MATCHES[key];
      if (partial) earned += partial;
    }
  }

  if (totalWeight === 0) return 75;
  return Math.round((earned / totalWeight) * 40 + 60);
}

export function getCompatibilitySummary(score: number): string {
  if (score >= 90) return "Perfect Match";
  if (score >= 80) return "Amazing Match";
  if (score >= 70) return "Great Match";
  if (score >= 60) return "Good Match";
  return "Moderate Match";
}
