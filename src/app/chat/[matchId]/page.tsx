"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/context/AppContext";

const CONVERSATION_PROMPTS = [
  "What's something you've been thinking about lately?",
  "What does a fulfilling day look like for you?",
  "How do you usually recharge?",
  "What's a value you hold that not everyone understands?",
  "What are you most curious about right now?",
];

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = decodeURIComponent((params.matchId as string) || "");
  const {
    user,
    matches,
    getOrCreateConversation,
    sendMessage,
    getMessageCount,
    getBlurForMatch,
    setMutualReveal,
    mutualReveals,
  } = useApp();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/signup");
      return;
    }
  }, [user, router]);

  const match = matches.find((m) => m.id === matchId);
  const conversation = matchId ? getOrCreateConversation(matchId) : null;
  const messageCount = matchId ? getMessageCount(matchId) : 0;
  const blurPct = matchId ? getBlurForMatch(matchId) : 100;
  const mutualReveal = matchId ? mutualReveals.has(matchId) : false;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages.length]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !conversation) return;
    sendMessage(conversation.id, text);
    setInput("");
  };

  const handleReveal = () => {
    if (!matchId) return;
    setMutualReveal(matchId);
  };

  if (!user || !match || !conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link href="/matches" className="text-[#800022] hover:underline">
          ← Back to matches
        </Link>
      </div>
    );
  }

  const connectionLabel =
    messageCount >= 30 || mutualReveal
      ? "Connection Level: Strong"
      : messageCount >= 15
        ? "Connection Level: Growing"
        : messageCount >= 5
          ? "Connection Level: Building"
          : "Connection Level: New";

  const blurCss = blurPct === 100 ? "blur(24px)" : blurPct === 70 ? "blur(16px)" : blurPct === 40 ? "blur(8px)" : "none";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-4 px-4 border-b border-[#550015] flex items-center justify-between">
        <Link href="/matches" className="text-[#A89888] hover:text-[#F5F0E8] text-sm">
          ← Matches
        </Link>
        <span className="text-xs text-[#800022] font-medium">{connectionLabel}</span>
      </header>

      <div className="flex-1 flex flex-col sm:flex-row max-w-4xl mx-auto w-full">
        <aside className="w-full sm:w-64 p-4 border-b sm:border-b-0 sm:border-r border-[#550015] flex flex-col items-center">
          <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-[#550015] shrink-0">
            {match.profile.photoUrl ? (
              <Image
                src={match.profile.photoUrl}
                alt=""
                fill
                className="object-cover reveal-blur"
                style={{ filter: blurCss, transition: "filter 0.8s ease-out" }}
                sizes="128px"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[#A89888] text-2xl">
                ?
              </div>
            )}
          </div>
          <p className="mt-3 font-medium text-[#F5F0E8]">
            {match.profile.name}, {match.profile.age}
          </p>
          <p className="text-xs text-[#D4C9BC]">
            {messageCount >= 30 || mutualReveal
              ? "Fully revealed"
              : messageCount >= 15
                ? "40% visible"
                : messageCount >= 5
                  ? "30% visible"
                  : "Reveal through conversation"}
          </p>
          {!mutualReveal && (
            <button
              type="button"
              onClick={handleReveal}
              className="mt-4 text-xs text-[#800022] hover:text-[#940128] font-medium"
            >
              Mutual reveal
            </button>
          )}
        </aside>

        <main className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversation.messages.length === 0 && (
              <p className="text-center text-[#A89888] text-sm py-4">
                Say hello. Your connection level grows with each exchange.
              </p>
            )}
            {conversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    msg.senderId === user.id
                      ? "bg-[#800022] text-[#F5F0E8]"
                      : "bg-[#550015] text-[#F5F0E8] border border-[#800022]/30"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-[#550015] space-y-2">
            <div className="flex gap-2 flex-wrap">
              {CONVERSATION_PROMPTS.slice(0, 3).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    setInput(prompt);
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#550015] text-[#D4C9BC] hover:bg-[#800022]/30 border border-[#800022]/20"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-xl bg-[#550015] border border-[#800022]/30 px-4 py-3 text-[#F5F0E8] placeholder-[#A89888] focus:border-[#800022] focus:outline-none text-sm"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#940128] text-[#F5F0E8] px-4 py-3 text-sm font-medium hover:bg-[#800022] transition-colors shrink-0"
              >
                Send
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
