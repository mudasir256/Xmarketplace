/**
 * Public env only — safe to import from Client Components.
 * Never put secrets here.
 */

function read(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function getPublicSupabaseUrl() {
  return read("NEXT_PUBLIC_SUPABASE_URL");
}

export function getPublicSupabaseAnonKey() {
  return read("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export function isSupabaseConfigured() {
  return Boolean(getPublicSupabaseUrl() && getPublicSupabaseAnonKey());
}

export function getAppUrl() {
  const explicit = read("NEXT_PUBLIC_APP_URL");
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = read("VERCEL_URL");
  if (vercel) {
    return vercel.startsWith("http") ? vercel.replace(/\/$/, "") : `https://${vercel}`;
  }

  return "http://localhost:3000";
}
