import "server-only";

import { getPublicSupabaseUrl } from "@/lib/env-public";

function read(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

/** Server-only. Never import into client components. */
export function getServiceRoleKey() {
  return read("SUPABASE_SERVICE_ROLE_KEY");
}

export function isServiceRoleConfigured() {
  return Boolean(getPublicSupabaseUrl() && getServiceRoleKey());
}

// Re-export public helpers for server modules that already import from env.
export {
  getAppUrl,
  getPublicSupabaseAnonKey,
  getPublicSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/env-public";
