"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import type { Conversation, UserProfile } from "@/lib/types";
import { getBlurLevel } from "@/lib/types";
import { getConversationMessages } from "@/lib/supabase/conversations";
import { createClient } from "@/lib/supabase/client";
import { rowToProfile, type ProfileRow } from "@/lib/supabase/profiles";

const CONVERSATION_PROMPTS = [
  "What's something you've been thinking about lately?",
  "What does a fulfilling day look like for you?",
  "How do you usually recharge?",
  "What's a value you hold that not everyone understands?",
  "What are you most curious about right now?",
];

const POLL_INTERVAL_MS = 3000;

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const matchedUserId = decodeURIComponent((params.matchId as string) || "");
  const {
    user,
    getOrCreateConversation,
    sendMessage,
    mutualReveals,
  } = useApp();

  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [matchedProfile, setMatchedProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate canonical matchId from user IDs (sorted so both users get the same ID)
  const matchId = user && matchedUserId
    ? `match-${[user.id, matchedUserId].sort().join("-")}`
    : "";

  // Derive message count and blur from local conversation state
  const mutualReveal = matchId ? mutualReveals.has(matchId) : false;
  const messageCount = conversation
    ? conversation.messages.filter((m) => m.text.length > 4).length
    : 0;
  const blurPct = getBlurLevel(messageCount, mutualReveal);

  // Poll for new messages from the database
  const conversationIdRef = useRef<string | null>(null);
  const pollMessages = useCallback(async () => {
    const convId = conversationIdRef.current;
    if (!convId) return;

    try {
      const messages = await getConversationMessages(convId);
      setConversation((prev) => {
        if (!prev) return prev;
        // Only update if message count changed (avoid unnecessary re-renders)
        if (messages.length !== prev.messages.length) {
          return { ...prev, messages };
        }
        return prev;
      });
    } catch {
      // Silently ignore poll errors
    }
  }, []);

  // Load matched user's profile and conversation
  useEffect(() => {
    if (!user || !matchedUserId) {
      router.replace("/signup");
      return;
    }

    if (!matchId) {
      setLoading(false);
      return;
    }

    let isActive = true;

    async function loadData() {
      try {
        // Load matched user's profile
        const supabase = createClient();
        if (supabase) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', matchedUserId)
            .single();

          if (!error && data && isActive) {
            setMatchedProfile(rowToProfile(data as ProfileRow));
          }
        }

        // Load or create conversation
        const conv = await getOrCreateConversation(matchId, matchedUserId);
        if (isActive) {
          conversationIdRef.current = conv.id;
          setConversation(conv);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load conversation:", error);
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isActive = false;
    };
  }, [user, matchId, matchedUserId, router, getOrCreateConversation]);

  // Set up polling interval for new messages
  useEffect(() => {
    if (!conversationIdRef.current) return;

    const interval = setInterval(pollMessages, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [conversation?.id, pollMessages]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !conversation) return;

    try {
      await sendMessage(conversation.id, text);
      setInput("");

      // Optimistically add message to UI
      const optimisticMessage = {
        id: "temp-" + Date.now(),
        conversationId: conversation.id,
        senderId: user!.id,
        text,
        timestamp: Date.now(),
      };
      setConversation((prev) =>
        prev ? { ...prev, messages: [...prev.messages, optimisticMessage] } : prev
      );
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#D4C9BC]">Loading conversation...</p>
      </div>
    );
  }

  if (!matchedProfile || !conversation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[#D4C9BC]">Could not load conversation</p>
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
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="shrink-0 w-full py-4 px-4 border-b border-[#2A2A2E] flex items-center justify-between">
        <Link href="/matches" className="text-[#A89888] hover:text-[#F5F0E8] text-sm">
          ← Matches
        </Link>
        <span className="text-xs text-[#800022] font-medium">{connectionLabel}</span>
      </header>

      <div className="flex-1 flex flex-col sm:flex-row max-w-4xl mx-auto w-full min-h-0">
        <aside className="shrink-0 w-full sm:w-64 p-4 border-b sm:border-b-0 sm:border-r border-[#2A2A2E] flex flex-col items-center sm:overflow-y-auto">
          <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-[#550015] shrink-0">
            {matchedProfile.photoUrl ? (
              <Image
                src={matchedProfile.photoUrl}
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
            {matchedProfile.name}, {matchedProfile.age}
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
        </aside>

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
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
                      ? "bg-[#940128] text-white"
                      : "bg-[#2A2A2E] text-[#F5F0E8]"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="shrink-0 p-4 border-t border-[#2A2A2E] space-y-2">
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
