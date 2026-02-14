"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function NavBar() {
  const { user } = useApp();

  return (
    <nav className="max-w-5xl mx-auto flex items-center justify-between">
      <Link
        href="/"
        className="text-xl font-semibold tracking-tight text-[#F5F0E8] [font-family:var(--font-cormorant)] hover:text-[#D4C9BC] transition-colors"
      >
        Ambrosia
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link
              href="/matches"
              className="text-[#D4C9BC] hover:text-[#F5F0E8] text-sm font-medium transition-colors"
            >
              Matches
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-xl bg-[#550015] border border-[#800022]/30 px-4 py-2 text-sm font-medium text-[#F5F0E8] hover:bg-[#800022]/40 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
              {user.name}
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-[#D4C9BC] hover:text-[#F5F0E8] text-sm font-medium transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-[#940128] px-4 py-2 text-sm font-medium text-[#F5F0E8] hover:bg-[#800022] transition-colors"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
