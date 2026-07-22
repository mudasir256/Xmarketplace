/**
 * Service-role Supabase client. Bypasses RLS — server / Node only.
 * Avoid `server-only`: custom Socket.IO server (tsx) imports chat → admin.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getPublicSupabaseUrl, getServiceRoleKey } from "@/lib/env";

function assertServerRuntime() {
  if (typeof window !== "undefined") {
    throw new Error("Admin Supabase client cannot be used in the browser");
  }
}

/**
 * Service-role client. Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createAdminClient() {
  assertServerRuntime();
  const url = getPublicSupabaseUrl();
  const key = getServiceRoleKey();

  if (!url || !key) {
    throw new Error("Server misconfigured: missing Supabase service role credentials");
  }

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function tryCreateAdminClient() {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}
