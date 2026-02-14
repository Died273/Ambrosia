import type { QuizAnswer } from "./types";

export function computeCompatibilityScore(
  userAnswers: QuizAnswer[],
  matchAnswers: QuizAnswer[]
): number {
  const userMap = new Map(userAnswers.map((a) => [a.questionId, a.value]));
  let matches = 0;
  let total = 0;
  for (const a of matchAnswers) {
    const u = userMap.get(a.questionId);
    if (u === undefined) continue;
    total++;
    const uVal = Array.isArray(u) ? u.sort().join(",") : String(u);
    const mVal = Array.isArray(a.value) ? a.value.sort().join(",") : String(a.value);
    if (uVal === mVal) matches++;
  }
  if (total === 0) return 75;
  return Math.round((matches / total) * 40 + 60);
}

export function getCompatibilitySummary(score: number): string {
  if (score >= 90) return "Highly aligned values and vision";
  if (score >= 80) return "Strong alignment on what matters";
  if (score >= 70) return "Meaningful overlap in priorities";
  if (score >= 60) return "Good foundation for connection";
  return "Worth a deeper conversation";
}
