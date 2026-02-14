import type { UserProfile } from "@/lib/types";
import type { QuizAnswer } from "@/lib/types";

export type ProfileRow = {
  id: string;
  name: string;
  age: number;
  gender: string;
  dating_preference: string | null;
  location: string;
  email: string;
  photo_url: string | null;
  core_values: Record<string, string> | null;
  emotional_depth: Record<string, string> | null;
  lifestyle_vision: Record<string, string> | null;
  quiz_snapshot: QuizAnswer[] | null;
  created_at: string;
  updated_at: string;
};

export function rowToProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    gender: row.gender,
    datingPreference: row.dating_preference ?? undefined,
    location: row.location,
    email: row.email,
    photoUrl: row.photo_url ?? undefined,
    coreValues: row.core_values ?? undefined,
    emotionalDepth: row.emotional_depth ?? undefined,
    lifestyleVision: row.lifestyle_vision ?? undefined,
    quizSnapshot: row.quiz_snapshot ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export function profileToRow(
  profile: Omit<UserProfile, "id" | "createdAt"> & { id: string }
): Omit<ProfileRow, "created_at" | "updated_at"> {
  return {
    id: profile.id,
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    dating_preference: profile.datingPreference ?? null,
    location: profile.location,
    email: profile.email,
    photo_url: profile.photoUrl ?? null,
    core_values: profile.coreValues ? profile.coreValues : null,
    emotional_depth: profile.emotionalDepth ? profile.emotionalDepth : null,
    lifestyle_vision: profile.lifestyleVision ? profile.lifestyleVision : null,
    quiz_snapshot: profile.quizSnapshot ? profile.quizSnapshot : null,
  };
}
