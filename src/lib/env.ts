/**
 * Server secrets — do not import from Client Components.
 * Avoid `server-only` here: the custom Socket.IO Node server (tsx) also imports this.
 */

import { getPublicSupabaseUrl } from "@/lib/env-public";

function read(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function assertServerRuntime() {
  if (typeof window !== "undefined") {
    throw new Error("Server secrets cannot be used in the browser");
  }
}

/** Server-only. Never import into client components. */
export function getServiceRoleKey() {
  assertServerRuntime();
  return read("SUPABASE_SERVICE_ROLE_KEY");
}

export function isServiceRoleConfigured() {
  assertServerRuntime();
  return Boolean(getPublicSupabaseUrl() && getServiceRoleKey());
}

// Re-export public helpers for server modules that already import from env.
export {
  getAppUrl,
  getPublicSupabaseAnonKey,
  getPublicSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/env-public";
