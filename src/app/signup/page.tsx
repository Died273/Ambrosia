"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

type FormData = {
  name: string;
  age: string;
  gender: string;
  datingPreference: string;
  location: string;
  email: string;
  password: string;
};

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useApp();
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: "",
    age: "",
    gender: "",
    datingPreference: "",
    location: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const age = parseInt(form.age, 10);
    if (!form.name || !age || !form.gender || !form.datingPreference || !form.location || !form.email || !form.password)
      return;
    setAuthError(null);
    setLoading(true);
    const { error } = await signUp({
      name: form.name.trim(),
      age,
      gender: form.gender.trim(),
      datingPreference: form.datingPreference.trim(),
      location: form.location.trim(),
      email: form.email.trim(),
      password: form.password,
    });
    setLoading(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    router.push("/photos");
  };

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
          Create your profile
        </h1>
        <p className="text-[#D4C9BC] text-sm mb-8">
          Start with the basics. You can always edit later.
        </p>
        <p className="text-sm text-[#A89888] mb-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#800022] hover:text-[#940128]">
            Sign in
          </Link>
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {authError && (
            <p className="text-sm text-[#940128] bg-[#940128]/10 rounded-xl px-4 py-2">
              {authError}
            </p>
          )}
          <label className="block">
            <span className="text-sm text-[#D4C9BC]">Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#550015] border border-[#800022]/30 px-4 py-3 text-[#F5F0E8] placeholder-[#A89888] focus:border-[#800022] focus:outline-none"
              placeholder="Your name"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-[#D4C9BC]">Age</span>
            <input
              type="number"
              min={18}
              max={120}
              value={form.age}
              onChange={(e) => update("age", e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#550015] border border-[#800022]/30 px-4 py-3 text-[#F5F0E8] placeholder-[#A89888] focus:border-[#800022] focus:outline-none"
              placeholder="Age"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-[#D4C9BC]">Gender</span>
            <select
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#550015] border border-[#800022]/30 px-4 py-3 text-[#F5F0E8] focus:border-[#800022] focus:outline-none appearance-none cursor-pointer"
              required
            >
              <option value="">Select gender</option>
              <option value="Woman">Woman</option>
              <option value="Man">Man</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-[#D4C9BC]">Dating preference</span>
            <select
              value={form.datingPreference}
              onChange={(e) => update("datingPreference", e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#550015] border border-[#800022]/30 px-4 py-3 text-[#F5F0E8] focus:border-[#800022] focus:outline-none appearance-none cursor-pointer"
              required
            >
              <option value="">Who are you interested in?</option>
              <option value="Women">Women</option>
              <option value="Men">Men</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Everyone">Everyone</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-[#D4C9BC]">Location</span>
            <input
              type="text"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#550015] border border-[#800022]/30 px-4 py-3 text-[#F5F0E8] placeholder-[#A89888] focus:border-[#800022] focus:outline-none"
              placeholder="City, Country"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-[#D4C9BC]">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#550015] border border-[#800022]/30 px-4 py-3 text-[#F5F0E8] placeholder-[#A89888] focus:border-[#800022] focus:outline-none"
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-[#D4C9BC]">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#550015] border border-[#800022]/30 px-4 py-3 text-[#F5F0E8] placeholder-[#A89888] focus:border-[#800022] focus:outline-none"
              placeholder="Min. 8 characters"
              minLength={8}
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#940128] text-[#F5F0E8] py-3.5 font-medium hover:bg-[#800022] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating your profile..." : "Create account"}
          </button>
        </form>
      </main>
    </div>
  );
}
