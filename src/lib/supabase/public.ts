import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  getPublicSupabaseAnonKey,
  getPublicSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/env-public";

/**
 * Cookie-free anon client for public catalog reads.
 * Safe on Vercel route handlers and Server Components — no session required.
 */
export function createPublicClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Server misconfigured: missing public Supabase credentials");
  }

  return createClient<Database>(getPublicSupabaseUrl()!, getPublicSupabaseAnonKey()!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function tryCreatePublicClient() {
  try {
    return createPublicClient();
  } catch {
    return null;
  }
}
