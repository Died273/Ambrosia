"use client";

import React, { createContext, useContext, useCallback, useState, useEffect } from "react";
import type {
  UserProfile,
  Match,
  ChatMessage,
  Conversation,
  QuizAnswer,
  QuizState,
} from "@/lib/types";
import { computeCompatibilityScore, getCompatibilitySummary } from "@/lib/compatibility";
import { getBlurLevel } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { rowToProfile, profileToRow, type ProfileRow } from "@/lib/supabase/profiles";

const STORAGE_KEYS = {
  user: "ambrosia_user",
  quiz: "ambrosia_quiz",
  matches: "ambrosia_matches",
  conversations: "ambrosia_conversations",
  mockProfiles: "ambrosia_mock_profiles",
};

export type AuthError = { message: string };

interface AppContextValue {
  user: UserProfile | null;
  quiz: QuizState | null;
  matches: Match[];
  conversations: Conversation[];
  setQuizAnswers: (answers: QuizAnswer[]) => void;
  completeQuiz: () => void;
  signUp: (profile: Omit<UserProfile, "id" | "createdAt"> & { password: string }) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => void;
  getOrCreateConversation: (matchId: string) => Conversation;
  sendMessage: (conversationId: string, text: string) => void;
  getMessageCount: (matchId: string) => number;
  getBlurForMatch: (matchId: string) => number;
  setMutualReveal: (matchId: string) => void;
  mutualReveals: Set<string>;
  refreshMatches: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const MOCK_PROFILES: UserProfile[] = [
  {
    id: "mock-1",
    name: "Jordan",
    age: 29,
    gender: "Non-binary",
    location: "Brooklyn, NY",
    email: "j@example.com",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    createdAt: Date.now(),
  },
  {
    id: "mock-2",
    name: "Alex",
    age: 31,
    gender: "Woman",
    location: "Portland, OR",
    email: "a@example.com",
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop",
    createdAt: Date.now(),
  },
  {
    id: "mock-3",
    name: "Sam",
    age: 27,
    gender: "Man",
    location: "Austin, TX",
    email: "s@example.com",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    createdAt: Date.now(),
  },
  {
    id: "mock-4",
    name: "Riley",
    age: 33,
    gender: "Woman",
    location: "Seattle, WA",
    email: "r@example.com",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    createdAt: Date.now(),
  },
  {
    id: "mock-5",
    name: "Morgan",
    age: 30,
    gender: "Man",
    location: "Denver, CO",
    email: "m@example.com",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    createdAt: Date.now(),
  },
];

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [quiz, setQuizState] = useState<QuizState | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [mutualReveals, setMutualRevealsState] = useState<Set<string>>(new Set());

  useEffect(() => {
    setQuizState(loadJson(STORAGE_KEYS.quiz, null));
    setMatches(loadJson(STORAGE_KEYS.matches, []));
    setConversations(loadJson(STORAGE_KEYS.conversations, []));
    const revealed = loadJson<string[]>(STORAGE_KEYS.matches + "_reveals", []);
    setMutualRevealsState(new Set(revealed));

    const supabase = createClient();
    if (supabase) {
      const fetchProfileWithRetry = (userId: string, retries = 3) => {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single()
          .then(({ data, error }) => {
            if (!error && data) setUser(rowToProfile(data as ProfileRow));
            else if (retries > 0) {
              setTimeout(() => fetchProfileWithRetry(userId, retries - 1), 500);
            } else setUser(null);
          });
      };

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) fetchProfileWithRetry(session.user.id);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session?.user) {
          setUser(null);
          return;
        }
        fetchProfileWithRetry(session.user.id);
      });
      return () => subscription.unsubscribe();
    } else {
      setUser(loadJson(STORAGE_KEYS.user, null));
    }
  }, []);

  const persistUser = useCallback((u: UserProfile | null) => {
    setUser(u);
    saveJson(STORAGE_KEYS.user, u);
  }, []);

  const persistConversations = useCallback((c: Conversation[]) => {
    setConversations(c);
    saveJson(STORAGE_KEYS.conversations, c);
  }, []);

  const setQuizAnswers = useCallback((answers: QuizAnswer[]) => {
    const state: QuizState = { answers, completed: false };
    setQuizState(state);
    saveJson(STORAGE_KEYS.quiz, state);
  }, []);

  const completeQuiz = useCallback(() => {
    setQuizState((prev) => (prev ? { ...prev, completed: true } : null));
    saveJson(STORAGE_KEYS.quiz, { answers: loadJson(STORAGE_KEYS.quiz, { answers: [] }).answers, completed: true });
  }, []);

  const signUp = useCallback(
    async (profile: Omit<UserProfile, "id" | "createdAt"> & { password: string }): Promise<{ error: AuthError | null }> => {
      const supabase = createClient();
      if (supabase) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: profile.email,
          password: profile.password,
        });
        if (authError)
          return { error: { message: authError.message } };
        const userId = authData.user?.id;
        if (!userId) return { error: { message: "Sign up failed" } };
        const { password: _p, ...profileWithoutPassword } = profile;
        const row = profileToRow({ ...profileWithoutPassword, id: userId });
        const { error: insertError } = await supabase.from("profiles").insert({
          ...row,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        if (insertError) return { error: { message: insertError.message } };
        setUser(rowToProfile({ ...row, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as ProfileRow));
        const quizData = loadJson<QuizState>(STORAGE_KEYS.quiz, { answers: [], completed: false });
        const mockProfiles = MOCK_PROFILES.map((p) => ({ ...p, quizSnapshot: quizData.answers as QuizAnswer[] }));
        const newMatches: Match[] = mockProfiles.map((p) => {
          const score = computeCompatibilityScore(quizData.answers || [], p.quizSnapshot || []);
          return {
            id: "match-" + p.id,
            userId: p.id,
            profile: { id: p.id, name: p.name, age: p.age, photoUrl: p.photoUrl },
            compatibilityScore: score,
            compatibilitySummary: getCompatibilitySummary(score),
            messageCount: 0,
          };
        });
        setMatches(newMatches);
        saveJson(STORAGE_KEYS.matches, newMatches);
        return { error: null };
      }
      const newUser: UserProfile = {
        ...profile,
        id: "user-" + Date.now(),
        createdAt: Date.now(),
      };
      persistUser(newUser);
      const quizData = loadJson<QuizState>(STORAGE_KEYS.quiz, { answers: [], completed: false });
      const mockProfiles = MOCK_PROFILES.map((p) => ({ ...p, quizSnapshot: quizData.answers as QuizAnswer[] }));
      const newMatches: Match[] = mockProfiles.map((p) => {
        const score = computeCompatibilityScore(quizData.answers || [], p.quizSnapshot || []);
        return {
          id: "match-" + p.id,
          userId: p.id,
          profile: { id: p.id, name: p.name, age: p.age, photoUrl: p.photoUrl },
          compatibilityScore: score,
          compatibilitySummary: getCompatibilitySummary(score),
          messageCount: 0,
        };
      });
      setMatches(newMatches);
      saveJson(STORAGE_KEYS.matches, newMatches);
      return { error: null };
    },
    [persistUser]
  );

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    const supabase = createClient();
    if (!supabase) return { error: { message: "Supabase not configured" } };
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) return { error: { message: authError.message } };
    if (!data.user) return { error: { message: "Sign in failed" } };
    const { data: profileRow, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();
    if (profileError || !profileRow) return { error: { message: "Profile not found" } };
    setUser(rowToProfile(profileRow as ProfileRow));
    setMatches(loadJson(STORAGE_KEYS.matches, []));
    return { error: null };
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<{ error: AuthError | null }> => {
    const supabase = createClient();
    if (!supabase) return { error: { message: "Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env" } };
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) return { error: { message: error.message } };
    return { error: null };
  }, []);

  const signOut = useCallback(() => {
    const supabase = createClient();
    if (supabase) supabase.auth.signOut();
    persistUser(null);
    setMatches([]);
    setConversations([]);
    setMutualRevealsState(new Set());
    saveJson(STORAGE_KEYS.matches, []);
    saveJson(STORAGE_KEYS.conversations, []);
    saveJson(STORAGE_KEYS.matches + "_reveals", []);
  }, [persistUser]);

  const refreshMatches = useCallback(() => {
    const stored = loadJson<Match[]>(STORAGE_KEYS.matches, []);
    setMatches(stored);
  }, []);

  const getOrCreateConversation = useCallback(
    (matchId: string): Conversation => {
      const match = matches.find((m) => m.id === matchId);
      const participantIds = user ? [user.id, match?.userId ?? ""] : [];
      let conv = conversations.find(
        (c) => c.matchId === matchId
      );
      if (conv) return conv;
      conv = {
        id: "conv-" + matchId + "-" + Date.now(),
        matchId,
        participantIds,
        messages: [],
        createdAt: Date.now(),
      };
      const next = [...conversations, conv];
      setConversations(next);
      saveJson(STORAGE_KEYS.conversations, next);
      return conv;
    },
    [conversations, matches, user]
  );

  const sendMessage = useCallback(
    (conversationId: string, text: string) => {
      if (!user) return;
      const msg: ChatMessage = {
        id: "msg-" + Date.now(),
        conversationId,
        senderId: user.id,
        text,
        timestamp: Date.now(),
      };
      setConversations((prev) => {
        const next = prev.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, msg] }
            : c
        );
        saveJson(STORAGE_KEYS.conversations, next);
        return next;
      });
      setMatches((prev) => {
        const conv = conversations.find((c) => c.id === conversationId);
        if (!conv) return prev;
        const newCount = (conv.messages.length + 1);
        const next = prev.map((m) =>
          m.id === conv.matchId ? { ...m, messageCount: newCount, lastMessageAt: Date.now() } : m
        );
        saveJson(STORAGE_KEYS.matches, next);
        return next;
      });
    },
    [user, conversations]
  );

  const getMessageCount = useCallback(
    (matchId: string) => {
      const conv = conversations.find((c) => c.matchId === matchId);
      return conv ? conv.messages.length : 0;
    },
    [conversations]
  );

  const getBlurForMatch = useCallback(
    (matchId: string) => {
      const revealed = mutualReveals.has(matchId);
      const conv = conversations.find((c) => c.matchId === matchId);
      const totalCount = conv ? conv.messages.length : 0;
      return getBlurLevel(totalCount, revealed);
    },
    [conversations, mutualReveals]
  );

  const setMutualReveal = useCallback((matchId: string) => {
    setMutualRevealsState((prev) => {
      const next = new Set(prev);
      next.add(matchId);
      saveJson(STORAGE_KEYS.matches + "_reveals", [...next]);
      return next;
    });
  }, []);

  const value: AppContextValue = {
    user,
    quiz,
    matches,
    conversations,
    setQuizAnswers,
    completeQuiz,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    getOrCreateConversation,
    sendMessage,
    getMessageCount,
    getBlurForMatch,
    setMutualReveal,
    mutualReveals,
    refreshMatches,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
