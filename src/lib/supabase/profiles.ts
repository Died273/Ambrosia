import type { UserProfile, QuizAnswer } from "@/lib/types";

/**
 * Mirrors the `profiles` table columns in Supabase (snake_case).
 */
export type ProfileRow = {
  id: string;
  name: string;
  age: number;
  gender: string;
  dating_preference: string | null;
  location: string;
  email: string;
  photo_url: string | null;
  photos: string[] | null;
  quiz_snapshot: QuizAnswer[] | null;
  created_at: string;
  updated_at: string;
};

/** Convert a Supabase row into the app's UserProfile shape. */
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
    photos: row.photos ?? undefined,
    quizSnapshot: row.quiz_snapshot ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
  };
}

/** Convert a UserProfile into the shape expected by the `profiles` table insert. */
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
    photos: profile.photos ?? null,
    quiz_snapshot: profile.quizSnapshot ?? null,
  };
}
