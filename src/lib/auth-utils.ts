export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export function getPasswordIssues(password: string) {
  const issues: string[] = [];
  if (password.length < 8) issues.push("at least 8 characters");
  if (!/[A-Za-z]/.test(password)) issues.push("a letter");
  if (!/[0-9]/.test(password)) issues.push("a number");
  return issues;
}

export function passwordStrength(password: string): "weak" | "okay" | "strong" {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score <= 2) return "weak";
  if (score <= 3) return "okay";
  return "strong";
}

export function safeNextPath(value?: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export function mapAuthError(error: unknown): string {
  const message =
    error && typeof error === "object" && "message" in error && typeof error.message === "string"
      ? error.message
      : "Something went wrong. Please try again.";

  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials") || lower.includes("invalid credentials")) {
    return "Incorrect email or password.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please confirm your email before signing in. Check your inbox for the link.";
  }
  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return "An account with this email already exists. Try logging in.";
  }
  if (lower.includes("password should be at least") || lower.includes("password is known")) {
    return message;
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "Network error. Check your connection and try again.";
  }
  if (lower.includes("provider is not enabled")) {
    return "Google sign-in is not enabled yet in Supabase.";
  }

  return message;
}

export const authQueryErrors: Record<string, string> = {
  "auth-not-configured": "Authentication is not configured yet. Add your Supabase environment variables.",
  "authentication-failed": "Authentication failed. Please try again.",
  "session-missing": "Your reset link is invalid or expired. Request a new password reset.",
  "password-updated": "Password updated successfully. You can sign in now.",
};
