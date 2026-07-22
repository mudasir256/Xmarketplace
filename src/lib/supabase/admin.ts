import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getPublicSupabaseUrl, getServiceRoleKey } from "@/lib/env";

/**
 * Service-role client. Bypasses RLS — server routes / actions only.
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createAdminClient() {
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
