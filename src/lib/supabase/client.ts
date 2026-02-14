import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function createClient(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase env vars missing – running in localStorage-only mode");
    return null;
  }

  client = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  return client;
}
