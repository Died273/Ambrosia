export interface ProfileQuestion {
  id: string;
  section: "core_values" | "emotional_depth" | "lifestyle_vision";
  label: string;
  placeholder?: string;
  type: "text" | "textarea" | "select";
  options?: { value: string; label: string }[];
}

export const PROFILE_SECTIONS = [
  { id: "core_values", title: "Core Values", subtitle: "What you stand for" },
  { id: "emotional_depth", title: "Emotional Depth", subtitle: "How you connect" },
  { id: "lifestyle_vision", title: "Lifestyle & Vision", subtitle: "How you want to live" },
] as const;

export const PROFILE_QUESTIONS: ProfileQuestion[] = [
  {
    id: "value_1",
    section: "core_values",
    label: "What does trust mean to you in a relationship?",
    type: "textarea",
    placeholder: "Share in a few sentences...",
  },
  {
    id: "value_2",
    section: "core_values",
    label: "One value you won't compromise on",
    type: "text",
    placeholder: "e.g. Honesty, Growth, Family",
  },
  {
    id: "emotional_1",
    section: "emotional_depth",
    label: "How do you like to be supported when you're going through a hard time?",
    type: "textarea",
    placeholder: "Share what helps you feel seen...",
  },
  {
    id: "emotional_2",
    section: "emotional_depth",
    label: "What makes you feel most connected to someone?",
    type: "textarea",
    placeholder: "Conversation, shared experiences, silence...",
  },
  {
    id: "lifestyle_1",
    section: "lifestyle_vision",
    label: "Where do you see yourself in 5 years?",
    type: "textarea",
    placeholder: "Location, life stage, dreams...",
  },
  {
    id: "lifestyle_2",
    section: "lifestyle_vision",
    label: "Ideal weekend with a partner looks like...",
    type: "textarea",
    placeholder: "Describe your ideal...",
  },
];
