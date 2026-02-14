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
    category: "Core values",
    question: "What matters most to you in a long-term partner?",
    type: "single",
    options: [
      { value: "honesty", label: "Honesty and transparency" },
      { value: "growth", label: "Growth and curiosity" },
      { value: "kindness", label: "Kindness and empathy" },
      { value: "ambition", label: "Ambition and drive" },
      { value: "humor", label: "Humor and lightness" },
    ],
  },
  {
    id: "q2",
    category: "Core values",
    question: "How do you prefer to resolve conflict?",
    type: "single",
    options: [
      { value: "talk", label: "Talking it through immediately" },
      { value: "space", label: "Taking space, then reconnecting" },
      { value: "write", label: "Writing or texting first" },
      { value: "mediate", label: "Finding a middle ground together" },
    ],
  },
  {
    id: "q3",
    category: "Relationship goals",
    question: "What are you looking for right now?",
    type: "single",
    options: [
      { value: "life_partner", label: "A life partner" },
      { value: "serious", label: "Something serious, open to long-term" },
      { value: "meaningful", label: "Meaningful connection, see where it goes" },
      { value: "companionship", label: "Deep companionship and intimacy" },
    ],
  },
  {
    id: "q4",
    category: "Relationship goals",
    question: "How important is shared life vision (e.g. marriage, kids, where to live)?",
    type: "single",
    options: [
      { value: "essential", label: "Essential — we need to align" },
      { value: "important", label: "Important but can evolve" },
      { value: "flexible", label: "Flexible — connection comes first" },
    ],
  },
  {
    id: "q5",
    category: "Emotional availability",
    question: "How do you typically express affection?",
    type: "single",
    options: [
      { value: "words", label: "Words and verbal affirmation" },
      { value: "time", label: "Quality time and presence" },
      { value: "touch", label: "Physical touch and closeness" },
      { value: "acts", label: "Acts of service and care" },
    ],
  },
  {
    id: "q6",
    category: "Emotional availability",
    question: "When you're stressed, you usually...",
    type: "single",
    options: [
      { value: "share", label: "Share with my partner early" },
      { value: "process", label: "Process alone, then share" },
      { value: "support", label: "Want support without having to explain much" },
    ],
  },
  {
    id: "q7",
    category: "Communication style",
    question: "How do you prefer to stay in touch day to day?",
    type: "single",
    options: [
      { value: "frequent", label: "Frequent messages throughout the day" },
      { value: "meaningful", label: "Fewer, more meaningful exchanges" },
      { value: "calls", label: "Calls or voice notes over text" },
      { value: "mixed", label: "A mix, depending on the day" },
    ],
  },
  {
    id: "q8",
    category: "Communication style",
    question: "What makes you feel most understood?",
    type: "single",
    options: [
      { value: "listened", label: "Being listened to without judgment" },
      { value: "asked", label: "Being asked thoughtful questions" },
      { value: "mirrored", label: "When someone reflects back what I said" },
      { value: "space", label: "When someone gives me space to open up" },
    ],
  },
  {
    id: "q9",
    category: "Lifestyle preferences",
    question: "How do you like to spend weekends?",
    type: "single",
    options: [
      { value: "outdoors", label: "Outdoors, active, or exploring" },
      { value: "home", label: "At home, low-key and cozy" },
      { value: "social", label: "With friends or community" },
      { value: "mix", label: "A mix of all of the above" },
    ],
  },
  {
    id: "q10",
    category: "Lifestyle preferences",
    question: "Which best describes your approach to life?",
    type: "single",
    options: [
      { value: "planned", label: "I like plans and some structure" },
      { value: "spontaneous", label: "I thrive on spontaneity" },
      { value: "balanced", label: "Balance of both" },
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
