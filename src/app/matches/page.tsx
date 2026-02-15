"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import NavBar from "@/components/NavBar";
import { fetchAllProfiles, getUserMatches, saveMatches } from "@/lib/supabase/matches";
import { generateMatches } from "@/lib/matching/generateMatches";
import type { MatchCandidate } from "@/lib/types";
import { Button } from "@/components/ui/Button";

export default function MatchesPage() {
  const router = useRouter();
  const { user } = useApp();
  const [matches, setMatches] = useState<MatchCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/signup");
      return;
    }

    loadMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  async function loadMatches() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let existingMatches: MatchCandidate[] = [];

      // Try to load existing matches first
      try {
        existingMatches = await getUserMatches(user.id);
      } catch (err) {
        // If error loading existing matches (e.g., table doesn't exist), that's okay
        console.log('No existing matches found, will generate new ones');
      }

      if (existingMatches.length > 0) {
        setMatches(existingMatches);
      } else {
        // Check if user has completed quiz
        if (!user.quizSnapshot || user.quizSnapshot.length === 0) {
          throw new Error('Please complete the quiz first to get matches');
        }

        // Generate new matches
        const allProfiles = await fetchAllProfiles();
        console.log(`Fetched ${allProfiles.length} profiles from database`);

        const newMatches = generateMatches(user, allProfiles, {
          minScore: 0 // Temporarily show ALL matches regardless of score
        });

        // Try to save to database (may fail if table doesn't exist)
        try {
          await saveMatches(user.id, newMatches);
        } catch (err) {
          console.warn('Could not save matches to database:', err);
          // Continue anyway - we can still show the matches
        }

        setMatches(newMatches);
      }
    } catch (err) {
      console.error('Error loading matches:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load matches: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  async function regenerateMatches() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const allProfiles = await fetchAllProfiles();
      const newMatches = generateMatches(user, allProfiles, {
        minScore: 0 // Temporarily show ALL matches regardless of score
      });

      // Try to save to database (may fail if table doesn't exist)
      try {
        await saveMatches(user.id, newMatches);
      } catch (err) {
        console.warn('Could not save matches to database:', err);
        // Continue anyway - we can still show the matches
      }

      setMatches(newMatches);
    } catch (err) {
      console.error('Error regenerating matches:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to regenerate matches: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="w-full py-6 px-4 sm:px-6 border-b border-[#550015]">
          <NavBar />
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-[#D4C9BC]">Finding your matches...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="w-full py-6 px-4 sm:px-6 border-b border-[#550015]">
          <NavBar />
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => loadMatches()}>Try Again</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-6 px-4 sm:px-6 border-b border-[#550015]">
        <NavBar />
      </header>

      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-medium text-[#F5F0E8] [font-family:var(--font-cormorant)]">
            Your Matches
          </h1>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#D4C9BC]">
              No matches found yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {matches.map((match) => (
              <MatchCard key={match.profile.id} match={match} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function MatchCard({ match }: { match: MatchCandidate }) {
  return (
    <div className="rounded-2xl bg-[#550015] p-6 border border-[#800022]/30 hover:border-[#800022] transition-colors">
      <div className="flex gap-6">
        <div className="w-24 h-24 rounded-xl bg-[#800022]/20 flex items-center justify-center text-3xl shrink-0 overflow-hidden">
          {match.profile.photoUrl ? (
            <img
              src={match.profile.photoUrl}
              alt={match.profile.name}
              className="w-full h-full object-cover rounded-xl"
              style={{ filter: "blur(20px)", transform: "scale(1.1)" }}
            />
          ) : (
            <span className="text-[#F5F0E8]">
              {match.profile.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-2xl font-medium text-[#F5F0E8] [font-family:var(--font-cormorant)]">
                {match.profile.name}, {match.profile.age}
              </h3>
              <p className="text-sm text-[#A89888]">{match.profile.location}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-white">
                {match.summary}
              </div>
            </div>
          </div>

          <div className="mb-4"></div>

          <Button variant="primary" href={`/chat/${match.profile.id}`}>
            Start Conversation
          </Button>
        </div>
      </div>
    </div>
  );
}
