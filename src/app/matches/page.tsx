"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";

export default function MatchesPage() {
  const router = useRouter();
  const { user, matches, refreshMatches } = useApp();

  useEffect(() => {
    if (!user) {
      router.replace("/signup");
      return;
    }
    refreshMatches();
  }, [user, router, refreshMatches]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-6 px-4 sm:px-6 border-b border-[#550015]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="text-xl font-semibold tracking-tight text-[#F5F0E8] [font-family:var(--font-cormorant)]">
            Ambrosia
          </span>
          <div className="flex items-center gap-4">
            <Link href="/profile" className="text-sm text-[#D4C9BC] hover:text-[#F5F0E8]">
              {user.name}
            </Link>
            <Link href="/" className="text-sm text-[#A89888] hover:text-[#F5F0E8]">
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-medium text-[#F5F0E8] [font-family:var(--font-cormorant)] mb-2">
          Your matches
        </h1>
        <p className="text-[#D4C9BC] text-sm mb-8">
          No swiping. Start a conversation and reveal each other gradually.
        </p>

        {matches.length === 0 ? (
          <div className="rounded-2xl bg-[#550015] p-8 text-center">
            <p className="text-[#D4C9BC]">Complete the quiz and create your profile to see matches.</p>
            <Button href="/quiz" variant="primary" className="mt-4">
              Take the quiz
            </Button>
          </div>
        ) : (
          <ul className="space-y-6">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function MatchCard({ match }: { match: { id: string; profile: { name: string; age: number; photoUrl?: string }; compatibilityScore: number; compatibilitySummary: string } }) {
  return (
    <li className="rounded-2xl bg-[#550015] border border-[#800022]/20 shadow-soft overflow-hidden transition-transform duration-300 hover:border-[#800022]/40">
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        <div className="relative w-full sm:w-44 h-56 sm:h-auto sm:min-h-[200px] bg-[#3F1414] shrink-0">
          {match.profile.photoUrl ? (
            <Image
              src={match.profile.photoUrl}
              alt=""
              fill
              className="object-cover reveal-blur"
              style={{ filter: "blur(24px)" }}
              sizes="176px"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[#A89888] text-4xl">
              ?
            </div>
          )}
        </div>
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-medium text-[#F5F0E8]">
              {match.profile.name}, {match.profile.age}
            </h2>
            <p className="mt-1 text-sm text-[#800022] font-medium">
              {match.compatibilityScore}% match
            </p>
            <p className="mt-2 text-[#D4C9BC] text-sm">
              {match.compatibilitySummary}
            </p>
          </div>
          <div className="mt-4">
            <Link
              href={`/chat/${encodeURIComponent(match.id)}`}
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium bg-[#940128] text-[#F5F0E8] hover:bg-[#800022] transition-colors"
            >
              Start conversation
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}
