import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";
import { getPublicSupabaseAnonKey, getPublicSupabaseUrl, isSupabaseConfigured } from "@/lib/env-public";

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  return createBrowserClient<Database>(getPublicSupabaseUrl()!, getPublicSupabaseAnonKey()!);
}
