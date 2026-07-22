/**
 * Public env only — safe to import from Client Components.
 * Never put secrets here.
 *
 * IMPORTANT: Next.js only inlines NEXT_PUBLIC_* vars that are referenced
 * as static property access (process.env.NEXT_PUBLIC_FOO). Dynamic
 * process.env[name] breaks in the browser and looks "unconfigured".
 */

export function getPublicSupabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  return value || undefined;
}

export function getPublicSupabaseAnonKey() {
  // Supabase dashboard may label this "anon" or "publishable"
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  return value || undefined;
}

export function isSupabaseConfigured() {
  return Boolean(getPublicSupabaseUrl() && getPublicSupabaseAnonKey());
}

export function getAppUrl() {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return vercel.startsWith("http") ? vercel.replace(/\/$/, "") : `https://${vercel}`;
  }

  return "http://localhost:3000";
}
