"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  QUIZ_QUESTIONS,
  getInitialAnswers,
  answersToQuizState,
  type QuizQuestion,
} from "@/lib/quizQuestions";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";

const TRANSITION_MS = 320;

export default function QuizPage() {
  const router = useRouter();
  const { user, setQuizAnswers, completeQuiz } = useApp();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(getInitialAnswers());
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const pendingActionRef = useRef<{ type: "next" } | { type: "complete"; newAnswers: Record<string, string> } | null>(null);

  // Redirect logged-in users to matches
  useEffect(() => {
    if (user) router.replace("/matches");
  }, [user, router]);

  const currentQuestion = QUIZ_QUESTIONS[step];
  const progress = ((step + 1) / QUIZ_QUESTIONS.length) * 100;

  useEffect(() => {
    if (!isExiting) return;
    const timer = setTimeout(() => {
      const pending = pendingActionRef.current;
      pendingActionRef.current = null;
      setIsExiting(false);
      if (pending?.type === "next") setStep((s) => s + 1);
      else if (pending?.type === "complete") {
        setQuizAnswers(answersToQuizState(pending.newAnswers));
        completeQuiz();
        setShowSnapshot(true);
      }
    }, TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [isExiting, setQuizAnswers, completeQuiz]);

  const handleAnswer = useCallback(
    (value: string) => {
      if (!currentQuestion || isExiting) return;
      const newAnswers = { ...answers, [currentQuestion.id]: value };
      setAnswers(newAnswers);
      if (step >= QUIZ_QUESTIONS.length - 1) {
        pendingActionRef.current = { type: "complete", newAnswers };
      } else {
        pendingActionRef.current = { type: "next" };
      }
      setIsExiting(true);
    },
    [currentQuestion, step, answers, isExiting]
  );

  const handleCreateProfile = useCallback(() => {
    router.push("/signup");
  }, [router]);

  if (showSnapshot) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full rounded-2xl bg-[#550015] p-8 sm:p-10 shadow-deep border border-[#800022]/30 text-center">
          <h2 className="text-2xl sm:text-3xl font-medium text-[#F5F0E8] [font-family:var(--font-cormorant)]">
            We&apos;ve found aligned matches for you.
          </h2>
          <p className="mt-4 text-[#D4C9BC]">
            Create your profile to see who you&apos;re compatible with and start connecting.
          </p>
          <div className="mt-8">
            <Button variant="primary" onClick={handleCreateProfile}>
              Create your profile
            </Button>
          </div>
        </div>
        <Link href="/" className="mt-6 text-sm text-[#A89888] hover:text-[#D4C9BC]">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-6 px-4">
        <nav className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-[#A89888] hover:text-[#F5F0E8] text-sm">
            ← Back
          </Link>
          <span className="text-[#A89888] text-sm">
            {step + 1} of {QUIZ_QUESTIONS.length}
          </span>
        </nav>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 pb-12">
        <div className="h-1 w-full rounded-full bg-[#550015] overflow-hidden mb-8">
          <div
            className="h-full bg-[#800022] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {currentQuestion && (
          <div
            className={`transition-all duration-300 ease-out ${
              isExiting
                ? "opacity-0 -translate-y-4 pointer-events-none"
                : "opacity-100 translate-y-0"
            }`}
          >
            <QuizStepWrapper key={step}>
              <QuizStep
                question={currentQuestion}
                selectedValue={answers[currentQuestion.id]}
                onSelect={handleAnswer}
              />
            </QuizStepWrapper>
          </div>
        )}
      </div>
    </div>
  );
}

function QuizStepWrapper({ children }: { children: React.ReactNode }) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      className={`transition-all duration-300 ease-out ${
        entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {children}
    </div>
  );
}

function QuizStep({
  question,
  selectedValue,
  onSelect,
}: {
  question: QuizQuestion;
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="space-y-8">
      <p className="text-xs uppercase tracking-wider text-[#800022] font-medium">
        {question.category}
      </p>
      <h2 className="text-2xl sm:text-3xl font-medium text-[#F5F0E8] [font-family:var(--font-cormorant)] leading-snug">
        {question.question}
      </h2>
      <ul className="space-y-3">
        {question.options.map((opt) => (
          <li key={opt.value}>
            <button
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`w-full text-left rounded-xl px-5 py-4 border transition-all duration-200 ${
                selectedValue === opt.value
                  ? "border-[#800022] bg-[#800022]/20 text-[#F5F0E8]"
                  : "border-[#550015] bg-[#550015]/50 text-[#D4C9BC] hover:border-[#800022]/50 hover:bg-[#550015]"
              }`}
            >
              {opt.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
