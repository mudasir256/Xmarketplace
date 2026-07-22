type AuthLikeUser = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
  identities?: Array<{ provider?: string; identity_data?: Record<string, unknown> | null }> | null;
};

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export function getUserDisplayName(user: AuthLikeUser) {
  const meta = user.user_metadata ?? {};
  const google = user.identities?.find((identity) => identity.provider === "google")?.identity_data ?? {};
  const anyIdentity = user.identities?.[0]?.identity_data ?? {};

  return (
    firstString(meta.full_name, meta.name, google.full_name, google.name, anyIdentity.full_name, anyIdentity.name) ||
    user.email?.split("@")[0] ||
    "Seller"
  );
}

export function normalizeAvatarUrl(url: string | null | undefined) {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Google profile photos sometimes block hotlinking; request a stable size.
  if (trimmed.includes("googleusercontent.com")) {
    return trimmed.replace(/=s\d+(-c)?$/, "=s128-c");
  }

  return trimmed;
}

export function getUserAvatarUrl(user: AuthLikeUser) {
  const meta = user.user_metadata ?? {};
  const google = user.identities?.find((identity) => identity.provider === "google")?.identity_data ?? {};
  const anyIdentity = user.identities?.[0]?.identity_data ?? {};

  return normalizeAvatarUrl(
    firstString(
      meta.avatar_url,
      meta.picture,
      meta.avatar,
      google.avatar_url,
      google.picture,
      anyIdentity.avatar_url,
      anyIdentity.picture,
    ),
  );
}

export function getInitialsAvatarDataUrl(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "XM";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ff7a3d"/>
          <stop offset="100%" stop-color="#ff4d12"/>
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="64" fill="url(#g)"/>
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="700" fill="#ffffff">
        ${initials}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
