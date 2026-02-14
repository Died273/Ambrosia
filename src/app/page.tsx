"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import NavBar from "@/components/NavBar";
import { useApp } from "@/context/AppContext";

// Landing page for Ambrosia dating app
export default function LandingPage() {
  const { user } = useApp();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <NavBar />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-24">
        <section className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium leading-tight tracking-tight text-[#F5F0E8] [font-family:var(--font-cormorant)]">
            See the person.
            <br />
            Not just their picture.
          </h1>
          <p className="text-lg sm:text-xl text-[#D4C9BC] max-w-lg mx-auto">
            A new dating app that matches you based on personality, and reveals pictures as you connect
          </p>
          <div className="pt-4">
            {user ? (
              <Button href="/matches" variant="primary">
                Go to your matches
              </Button>
            ) : (
              <Button href="/quiz" variant="primary">
                Take the Compatibility Quiz
              </Button>
            )}
          </div>
        </section>

        <section className="w-full max-w-4xl mx-auto mt-24 sm:mt-32 px-4">
          <h2 className="text-2xl sm:text-3xl font-medium text-[#F5F0E8] [font-family:var(--font-cormorant)] text-center mb-16">
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                step: "1",
                title: "Take a values-based quiz",
                description:
                  "Answer questions about what matters to you — in life and in love. No right or wrong, only honesty.",
              },
              {
                step: "2",
                title: "Get matched intentionally",
                description:
                  "We introduce you to people who align with your values and goals. No swiping. No games.",
              },
              {
                step: "3",
                title: "Reveal each other gradually",
                description:
                  "Photos stay blurred until your conversation deepens. Connection first, appearance when it matters.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl bg-[#550015]/80 p-6 sm:p-8 shadow-soft border border-[#800022]/20 transition-transform duration-300 hover:translate-y-[-2px]"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#800022]/40 text-[#F5F0E8] font-medium text-sm">
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-medium text-[#F5F0E8]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[#D4C9BC] text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="w-full py-8 px-4 border-t border-[#550015]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[#A89888] text-sm">Ambrosia</span>
          <div className="flex gap-6 text-sm text-[#A89888]">
            {user ? (
              <Link href="/matches" className="hover:text-[#D4C9BC] transition-colors">
                Matches
              </Link>
            ) : (
              <>
                <Link href="/quiz" className="hover:text-[#D4C9BC] transition-colors">
                  Quiz
                </Link>
                <Link href="/login" className="hover:text-[#D4C9BC] transition-colors">
                  Sign in
                </Link>
                <Link href="/signup" className="hover:text-[#D4C9BC] transition-colors">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
