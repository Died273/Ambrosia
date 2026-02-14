"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useApp();

  useEffect(() => {
    if (!user) {
      router.replace("/signup");
      return;
    }
  }, [user, router]);

  if (!user) return null;

  const sections = [
    {
      title: "Core Values",
      subtitle: "What you stand for",
      entries: user.coreValues ? Object.entries(user.coreValues) : [],
    },
    {
      title: "Emotional Depth",
      subtitle: "How you connect",
      entries: user.emotionalDepth ? Object.entries(user.emotionalDepth) : [],
    },
    {
      title: "Lifestyle & Vision",
      subtitle: "How you want to live",
      entries: user.lifestyleVision ? Object.entries(user.lifestyleVision) : [],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-6 px-4 border-b border-[#550015]">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/matches" className="text-[#A89888] hover:text-[#F5F0E8] text-sm">
            ← Matches
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-medium text-[#F5F0E8] [font-family:var(--font-cormorant)] mb-1">
          {user.name}
        </h1>
        <p className="text-[#D4C9BC] text-sm mb-8">
          {user.age} · {user.location}
        </p>
        {sections.map(
          (sec) =>
            sec.entries.length > 0 && (
              <section key={sec.title} className="mb-10">
                <h2 className="text-sm uppercase tracking-wider text-[#800022] font-medium mb-2">
                  {sec.title}
                </h2>
                <p className="text-[#A89888] text-xs mb-4">{sec.subtitle}</p>
                <div className="space-y-4">
                  {sec.entries.map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl bg-[#550015] border border-[#800022]/20 p-5 shadow-soft"
                    >
                      <p className="text-xs text-[#800022] font-medium mb-2">{label}</p>
                      <p className="text-[#F5F0E8] text-sm leading-relaxed whitespace-pre-wrap">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )
        )}
      </main>
    </div>
  );
}
