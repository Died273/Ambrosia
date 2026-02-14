"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();
      if (!supabase) {
        router.replace("/login");
        return;
      }

      try {
        const { data, error: authError } = await supabase.auth.getSession();

        if (authError) {
          setError(authError.message);
          setTimeout(() => router.replace("/login"), 2000);
          return;
        }

        if (data.session) {
          router.replace("/matches");
        } else {
          router.replace("/login");
        }
      } catch {
        setError("Authentication failed");
        setTimeout(() => router.replace("/login"), 2000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#3F1414] text-[#F5F0E8] px-4">
      {error ? (
        <div className="text-center">
          <p className="text-[#940128] mb-2">{error}</p>
          <p className="text-[#D4C9BC] text-sm">Redirecting to login…</p>
        </div>
      ) : (
        <p className="text-[#D4C9BC]">Confirming your account…</p>
      )}
    </div>
  );
}
