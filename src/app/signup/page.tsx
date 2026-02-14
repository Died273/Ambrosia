"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  PROFILE_SECTIONS,
  PROFILE_QUESTIONS,
  type ProfileQuestion,
} from "@/lib/profileQuestions";

type FormData = {
  name: string;
  age: string;
  gender: string;
  datingPreference: string;
  location: string;
  email: string;
  password: string;
  [key: string]: string;
};

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useApp();
  const [phase, setPhase] = useState<"basics" | "profile" | "done">("basics");
  const [authError, setAuthError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: "",
    age: "",
    gender: "",
    datingPreference: "",
    location: "",
    email: "",
    password: "",
  });

  const handleBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const age = parseInt(form.age, 10);
    if (!form.name || !age || !form.gender || !form.datingPreference || !form.location || !form.email || !form.password)
      return;
    setPhase("profile");
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const coreValues: Record<string, string> = {};
    const emotionalDepth: Record<string, string> = {};
    const lifestyleVision: Record<string, string> = {};
    PROFILE_QUESTIONS.forEach((q) => {
      const v = form[q.id];
      if (!v) return;
      if (q.section === "core_values") coreValues[q.label] = v;
      else if (q.section === "emotional_depth") emotionalDepth[q.label] = v;
      else lifestyleVision[q.label] = v;
    });
    const { error } = await signUp({
      name: form.name.trim(),
      age: parseInt(form.age, 10),
      gender: form.gender.trim(),
      datingPreference: form.datingPreference.trim(),
      location: form.location.trim(),
      email: form.email.trim(),
      password: form.password,
      coreValues,
      emotionalDepth,
      lifestyleVision,
    });
    if (error) {
      setAuthError(error.message);
      return;
    }
    setPhase("done");
    router.push("/matches");
  };

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (phase === "basics") {
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
          <p className="text-sm text-[#A89888] mb-4">
            Already have an account?{" "}
            <Link href="/login" className="text-[#800022] hover:text-[#940128]">
              Sign in
            </Link>
          </p>
          <button
            type="button"
            onClick={async () => {
              setAuthError(null);
              setGoogleLoading(true);
              const { error } = await signInWithGoogle();
              setGoogleLoading(false);
              if (error) setAuthError(error.message);
            }}
            disabled={googleLoading}
            className="w-full rounded-xl bg-[#550015] border border-[#800022]/40 text-[#F5F0E8] py-3.5 font-medium hover:bg-[#800022]/30 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
              <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </button>
          <div className="relative mb-6">
            <span className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#550015]" />
            </span>
            <span className="relative flex justify-center text-xs text-[#A89888]">or</span>
          </div>
          <form onSubmit={handleBasicSubmit} className="space-y-5">
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
              className="w-full rounded-xl bg-[#940128] text-[#F5F0E8] py-3.5 font-medium hover:bg-[#800022] transition-colors"
            >
              Continue to profile depth
            </button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 px-4">
        <button
          type="button"
          onClick={() => setPhase("basics")}
          className="text-[#A89888] hover:text-[#F5F0E8] text-sm"
        >
          ← Back
        </button>
      </header>
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-8 pb-16">
        <h1 className="text-2xl font-medium text-[#F5F0E8] [font-family:var(--font-cormorant)] mb-2">
          A little more about you
        </h1>
        <p className="text-[#D4C9BC] text-sm mb-8">
          These answers appear on your profile and help others connect with you.
        </p>
        <form onSubmit={handleProfileSubmit} className="space-y-8">
          {PROFILE_SECTIONS.map((sec) => (
            <section key={sec.id} className="space-y-4">
              <h2 className="text-lg font-medium text-[#F5F0E8]">{sec.title}</h2>
              <p className="text-sm text-[#A89888]">{sec.subtitle}</p>
              {PROFILE_QUESTIONS.filter((q) => q.section === sec.id).map((q) => (
                <ProfileField
                  key={q.id}
                  question={q}
                  value={form[q.id] ?? ""}
                  onChange={(v) => update(q.id, v)}
                />
              ))}
            </section>
          ))}
          {authError && (
            <p className="text-sm text-[#940128] bg-[#940128]/10 rounded-xl px-4 py-2">
              {authError}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-xl bg-[#940128] text-[#F5F0E8] py-3.5 font-medium hover:bg-[#800022] transition-colors"
          >
            See my matches
          </button>
        </form>
      </main>
    </div>
  );
}

function ProfileField({
  question,
  value,
  onChange,
}: {
  question: ProfileQuestion;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputClass =
    "mt-1 w-full rounded-xl bg-[#550015] border border-[#800022]/30 px-4 py-3 text-[#F5F0E8] placeholder-[#A89888] focus:border-[#800022] focus:outline-none";
  return (
    <label className="block">
      <span className="text-sm text-[#D4C9BC]">{question.label}</span>
      {question.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass + " min-h-[100px] resize-y"}
          placeholder={question.placeholder}
        />
      ) : (
        <input
          type={question.type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          placeholder={question.placeholder}
        />
      )}
    </label>
  );
}
