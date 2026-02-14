"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import NavBar from "@/components/NavBar";

export default function MatchesPage() {
  const router = useRouter();
  const { user } = useApp();

  useEffect(() => {
    if (!user) {
      router.replace("/signup");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-6 px-4 sm:px-6 border-b border-[#550015]">
        <NavBar />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium text-[#F5F0E8] [font-family:var(--font-cormorant)] text-center">
          Launching soon
        </h1>
        <p className="mt-4 text-[#D4C9BC] text-center max-w-md">
          We&apos;re putting the finishing touches on your matches. Stay tuned.
        </p>
      </main>
    </div>
  );
}
