import type { QuizAnswer } from "./types";

export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: { value: string; label: string }[];
  type: "single" | "multiple";
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    category: "Lifestyle",
    question: "How do you prefer to spend your ideal weekend?",
    type: "single",
    options: [
      { value: "outdoors", label: "Outdoors and active" },
      { value: "culture", label: "Exploring cafés and culture" },
      { value: "home", label: "Cozy at home" },
      { value: "social", label: "Socializing with friends" },
    ],
  },
  {
    id: "q2",
    category: "Social",
    question: "How social are you typically?",
    type: "single",
    options: [
      { value: "life_of_party", label: "Life of the party" },
      { value: "balanced", label: "Balanced mix of social and alone time" },
      { value: "small_gatherings", label: "Small gatherings preferred" },
      { value: "close_friends", label: "Happy with just a few close friends" },
    ],
  },
  {
    id: "q3",
    category: "Lifestyle",
    question: "How active is your lifestyle?",
    type: "single",
    options: [
      { value: "gym_regular", label: "Gym regular or athlete" },
      { value: "sometimes", label: "Workout from time to time" },
      { value: "casual", label: "Casual walks and light exercise" },
      { value: "other", label: "Prefer other activities" },
    ],
  },
  {
    id: "q4",
    category: "Communication",
    question: "How do you handle disagreements?",
    type: "single",
    options: [
      { value: "talk_immediately", label: "Talk it out immediately" },
      { value: "process_first", label: "Need time to process first" },
      { value: "middle_ground", label: "Find middle ground quickly" },
      { value: "humor", label: "Use humor to ease tension" },
    ],
  },
  {
    id: "q5",
    category: "Lifestyle",
    question: "How important is spontaneity vs. planning to you?",
    type: "single",
    options: [
      { value: "spontaneous", label: "Live for spontaneous adventures" },
      { value: "balanced", label: "Balanced approach" },
      { value: "planner", label: "Prefer having a plan" },
      { value: "structured", label: "Need structure and routine" },
    ],
  },
  {
    id: "q6",
    category: "Communication",
    question: "What's your communication style?",
    type: "single",
    options: [
      { value: "frequent_texts", label: "Frequent texts throughout the day" },
      { value: "regular_checkins", label: "Regular check-ins" },
      { value: "quality_over_quantity", label: "Quality over quantity" },
      { value: "in_person", label: "More in-person than digital" },
    ],
  },
  {
    id: "q7",
    category: "Emotional",
    question: "What's your love language?",
    type: "single",
    options: [
      { value: "acts_of_service", label: "Acts of service" },
      { value: "quality_time", label: "Quality time together" },
      { value: "words", label: "Words of affirmation" },
      { value: "physical", label: "Physical affection" },
    ],
  },
  {
    id: "q8",
    category: "Social",
    question: "Are you more introverted or outgoing?",
    type: "single",
    options: [
      { value: "outgoing", label: "Very outgoing — I thrive in social settings" },
      { value: "balanced", label: "Balanced — depends on my mood and the situation" },
      { value: "introverted", label: "Very introverted — I recharge alone" },
    ],
  },
  {
    id: "q9",
    category: "Relationship values",
    question: "What do you look for in a partner?",
    type: "single",
    options: [
      { value: "emotional_connection", label: "Deep emotional connection and understanding" },
      { value: "ambition", label: "Ambition and drive" },
      { value: "humor", label: "Sense of humor and playfulness" },
      { value: "stability", label: "Stability and reliability" },
    ],
  },
  {
    id: "q10",
    category: "Relationship values",
    question: "What energy do you look for in a partner?",
    type: "single",
    options: [
      { value: "outgoing_partner", label: "Someone outgoing and socially confident" },
      { value: "calm_partner", label: "Someone calm and more introverted" },
      { value: "balance_partner", label: "A balance of both depending on the situation" },
    ],
  },
];

export function getInitialAnswers(): Record<string, string> {
  return Object.fromEntries(QUIZ_QUESTIONS.map((q) => [q.id, ""]));
}

export function answersToQuizState(answers: Record<string, string>): QuizAnswer[] {
  return Object.entries(answers)
    .filter(([, v]) => v !== "")
    .map(([questionId, value]) => {
      const q = QUIZ_QUESTIONS.find((x) => x.id === questionId);
      return { questionId, value, category: q?.category ?? "Other" };
    });
}
