import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";
import { getPublicSupabaseAnonKey, getPublicSupabaseUrl, isSupabaseConfigured } from "@/lib/env-public";

export async function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Server misconfigured: missing public Supabase credentials");
  }

  const cookieStore = await cookies();
  const url = getPublicSupabaseUrl()!;
  const anonKey = getPublicSupabaseAnonKey()!;

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies. Middleware refreshes sessions.
        }
      },
    },
  });
}
