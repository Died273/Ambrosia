"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push("/matches");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 px-4">
        <Link href="/" className="text-[#A89888] hover:text-[#F5F0E8] text-sm">
          ← Back
        </Link>
      </header>
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-medium text-[#F5F0E8] [font-family:var(--font-cormorant)] mb-2">
          Welcome back
        </h1>
        <p className="text-[#D4C9BC] text-sm mb-8">
          Sign in to continue to your matches.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="text-sm text-[#940128] bg-[#940128]/10 rounded-xl px-4 py-2">
              {error}
            </p>
          )}
          <label className="block">
            <span className="text-sm text-[#D4C9BC]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#550015] border border-[#800022]/30 px-4 py-3 text-[#F5F0E8] placeholder-[#A89888] focus:border-[#800022] focus:outline-none"
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-[#D4C9BC]">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#550015] border border-[#800022]/30 px-4 py-3 text-[#F5F0E8] placeholder-[#A89888] focus:border-[#800022] focus:outline-none"
              placeholder="Your password"
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#940128] text-[#F5F0E8] py-3.5 font-medium hover:bg-[#800022] transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[#D4C9BC]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#800022] hover:text-[#940128] font-medium">
            Create one
          </Link>
        </p>
      </main>
    </div>
  );
}
