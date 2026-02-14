export interface QuizAnswer {
  questionId: string;
  value: string | string[];
  category: string;
}

export interface QuizState {
  answers: QuizAnswer[];
  completed: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  datingPreference?: string;
  location: string;
  email: string;
  photoUrl?: string;
  coreValues?: Record<string, string>;
  emotionalDepth?: Record<string, string>;
  lifestyleVision?: Record<string, string>;
  quizSnapshot?: QuizAnswer[];
  createdAt: number;
}

export interface Match {
  id: string;
  userId: string;
  profile: Pick<UserProfile, "id" | "name" | "age" | "photoUrl">;
  compatibilityScore: number;
  compatibilitySummary: string;
  messageCount: number;
  lastMessageAt?: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  matchId: string;
  participantIds: string[];
  messages: ChatMessage[];
  createdAt: number;
}

export type BlurLevel = 100 | 70 | 40 | 0;

export function getBlurLevel(messageCount: number, mutualReveal: boolean): BlurLevel {
  if (mutualReveal) return 0;
  if (messageCount >= 30) return 0;
  if (messageCount >= 15) return 40;
  if (messageCount >= 5) return 70;
  return 100;
}
