"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setStatus("error");
      setTimeout(() => router.replace("/login"), 2000);
      return;
    }

    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const code = params.get("code");
    const error = params.get("error");

    if (error) {
      setStatus("error");
      setTimeout(() => router.replace("/login"), 2000);
      return;
    }

    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ data: { session }, error }) => {
          if (error) {
            setStatus("error");
            setTimeout(() => router.replace("/login"), 2000);
            return;
          }
          if (session) {
            if (typeof window !== "undefined") window.history.replaceState({}, "", "/auth/callback");
            setStatus("done");
            router.replace("/matches");
          } else {
            setStatus("error");
            setTimeout(() => router.replace("/login"), 2000);
          }
        });
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus("done");
        router.replace("/matches");
      } else {
        setStatus("error");
        setTimeout(() => router.replace("/login"), 2000);
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#3F1414] text-[#F5F0E8] px-4">
      {status === "loading" && <p className="text-[#D4C9BC]">Signing you in…</p>}
      {status === "done" && <p className="text-[#D4C9BC]">Redirecting to matches…</p>}
      {status === "error" && (
        <p className="text-[#D4C9BC]">Something went wrong. Redirecting to sign in…</p>
      )}
    </div>
  );
}
