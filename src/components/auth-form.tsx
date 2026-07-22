"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import logo from "../../xmarketplacelogo.png";
import { createClient } from "@/lib/supabase/client";
import {
  authQueryErrors,
  getPasswordIssues,
  isValidEmail,
  mapAuthError,
  normalizeEmail,
  normalizeName,
  passwordStrength,
  safeNextPath,
} from "@/lib/auth-utils";

type AuthMode = "login" | "signup" | "forgot-password" | "update-password";

const content = {
  login: {
    title: "Welcome back",
    subtitle: "Sign in to buy, sell, and manage your account",
    submit: "Log in",
  },
  signup: {
    title: "Create your account",
    subtitle: "Join X Marketplace in less than a minute",
    submit: "Create account",
  },
  "forgot-password": {
    title: "Forgot your password?",
    subtitle: "Enter your email and we’ll send a secure reset link",
    submit: "Send reset link",
  },
  "update-password": {
    title: "Set a new password",
    subtitle: "Choose a strong password you haven’t used before",
    submit: "Update password",
  },
} as const;

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" />
    </svg>
  );
}

function withNext(href: string, nextPath: string) {
  if (nextPath === "/account") return href;
  return `${href}?next=${encodeURIComponent(nextPath)}`;
}

export function AuthForm({
  mode,
  nextPath,
  initialError,
}: {
  mode: AuthMode;
  nextPath?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const redirectTo = safeNextPath(nextPath);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(mode === "update-password");
  const [sessionReady, setSessionReady] = useState(mode !== "update-password");
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(() =>
    initialError
      ? { type: initialError === "password-updated" ? "success" : "error", text: authQueryErrors[initialError] ?? "Something went wrong. Please try again." }
      : null,
  );

  const copy = content[mode];
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const strength = useMemo(() => passwordStrength(password), [password]);
  const needsEmail = mode !== "update-password";
  const needsPassword = mode !== "forgot-password";
  const showConfirm = mode === "signup" || mode === "update-password";
  const showGoogle = mode === "login" || mode === "signup";

  useEffect(() => {
    if (mode !== "update-password") return;

    let active = true;
    (async () => {
      if (!configured) {
        setMessage({ type: "error", text: authQueryErrors["auth-not-configured"] });
        setCheckingSession(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      if (!session) {
        setMessage({ type: "error", text: authQueryErrors["session-missing"] });
        setSessionReady(false);
      } else {
        setSessionReady(true);
      }
      setCheckingSession(false);
    })();

    return () => {
      active = false;
    };
  }, [configured, mode]);

  function getClient() {
    if (!configured) {
      setMessage({ type: "error", text: authQueryErrors["auth-not-configured"] });
      return null;
    }
    return createClient();
  }

  function validate(): string | null {
    if (mode === "signup") {
      if (normalizeName(name).length < 2) return "Enter your full name.";
    }

    if (needsEmail) {
      if (!isValidEmail(email)) return "Enter a valid email address.";
    }

    if (needsPassword) {
      const issues = getPasswordIssues(password);
      if (mode !== "login" && issues.length > 0) {
        return `Password needs ${issues.join(", ")}.`;
      }
      if (mode === "login" && password.length < 1) return "Enter your password.";
    }

    if (showConfirm && password !== confirmPassword) {
      return "Passwords do not match.";
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const validationError = validate();
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    const supabase = getClient();
    if (!supabase) return;

    const cleanEmail = normalizeEmail(email);
    const cleanName = normalizeName(name);

    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
        router.replace(redirectTo);
        router.refresh();
        return;
      }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: cleanName, name: cleanName },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          },
        });
        if (error) throw error;

        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          setMessage({
            type: "error",
            text: "An account with this email already exists. Try logging in or reset your password.",
          });
          return;
        }

        if (data.session) {
          router.replace(redirectTo);
          router.refresh();
          return;
        }

        setSentEmail(cleanEmail);
        setMessage({
          type: "success",
          text: "Account created. Check your email and confirm your address to finish signing up.",
        });
        return;
      }

      if (mode === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/update-password")}`,
        });
        if (error) throw error;
        setSentEmail(cleanEmail);
        setMessage({
          type: "success",
          text: "If an account exists for that email, a reset link is on the way. Check your inbox and spam folder.",
        });
        return;
      }

      if (mode === "update-password") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMessage({ type: "success", text: "Password updated. Taking you to your account..." });
        window.setTimeout(() => {
          router.replace("/account");
          router.refresh();
        }, 700);
      }
    } catch (error) {
      setMessage({ type: "error", text: mapAuthError(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setMessage(null);
    const supabase = getClient();
    if (!supabase) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      setMessage({ type: "error", text: mapAuthError(error) });
      setLoading(false);
    }
  }

  const strengthLabel =
    strength === "weak" ? "Weak" : strength === "okay" ? "Okay" : "Strong";
  const strengthColor =
    strength === "weak" ? "bg-[#e35d6a]" : strength === "okay" ? "bg-[#f0a202]" : "bg-[#2f9e44]";
  const strengthWidth =
    strength === "weak" ? "w-1/3" : strength === "okay" ? "w-2/3" : "w-full";

  if (checkingSession) {
    return (
      <main className="auth-shell grid min-h-svh place-items-center px-[18px] py-[42px]">
        <p className="rounded-xl bg-white px-5 py-4 text-sm text-brand-muted shadow-lg">Checking reset session...</p>
      </main>
    );
  }

  return (
    <main className="auth-shell grid min-h-svh place-items-center px-[18px] py-[42px] max-[760px]:px-3 max-[760px]:py-[18px]">
      <section className="w-[min(100%,430px)] rounded-[18px] border border-[#ffffff7a] bg-white px-[30px] pb-7 pt-[34px] shadow-[0_24px_70px_#001e2e70] max-[760px]:rounded-2xl max-[760px]:px-5 max-[760px]:pb-6 max-[760px]:pt-7">
        <Link className="mx-auto mb-[10px] block w-[210px] max-[760px]:w-[190px]" href="/" aria-label="X Marketplace home">
          <Image className="h-auto w-full" src={logo} alt="X Marketplace" priority />
        </Link>
        <h1 className="m-0 text-center text-2xl font-bold tracking-[-.4px] text-brand-navy">{copy.title}</h1>
        <p className="mt-[7px] text-center text-[13px] leading-6 text-brand-muted">{copy.subtitle}</p>

        {sentEmail && (mode === "signup" || mode === "forgot-password") ? (
          <div className="mt-6 grid gap-4 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#eaf8f0] text-[#14683a]">
              <CheckCircle2 size={26} />
            </div>
            <p className="m-0 text-[13px] leading-6 text-[#445266]">
              We sent an email to <strong className="text-brand-navy">{sentEmail}</strong>.
              {mode === "signup"
                ? " Open the confirmation link to activate your account."
                : " Open the reset link to choose a new password."}
            </p>
            <Link
              className="flex min-h-12 items-center justify-center rounded-[10px] bg-[linear-gradient(100deg,var(--color-brand-orange),#ff9b17)] text-sm font-black text-white"
              href={withNext("/login", redirectTo)}
            >
              Back to log in
            </Link>
            <button
              type="button"
              className="border-0 bg-transparent text-xs font-bold text-brand-orange"
              onClick={() => {
                setSentEmail(null);
                setMessage(null);
              }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <form className="mt-6 grid gap-[15px]" onSubmit={handleSubmit} noValidate>
              {mode === "signup" && (
                <label className="grid gap-[7px]">
                  <span className="text-xs font-bold text-[#3b4859]">Full name</span>
                  <div className="flex h-[47px] items-center gap-[9px] rounded-[10px] border border-[#d8dee5] bg-white px-3 transition-[border-color,box-shadow] duration-200 focus-within:border-[#00859a] focus-within:shadow-[0_0_0_3px_#00859a18]">
                    <UserRound className="size-[17px] shrink-0 text-[#929dab]" />
                    <input
                      className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-brand-ink outline-0 placeholder:text-[#a4adb8]"
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Your full name"
                      autoComplete="name"
                      disabled={loading}
                    />
                  </div>
                </label>
              )}

              {needsEmail && (
                <label className="grid gap-[7px]">
                  <span className="text-xs font-bold text-[#3b4859]">Email address</span>
                  <div className="flex h-[47px] items-center gap-[9px] rounded-[10px] border border-[#d8dee5] bg-white px-3 transition-[border-color,box-shadow] duration-200 focus-within:border-[#00859a] focus-within:shadow-[0_0_0_3px_#00859a18]">
                    <Mail className="size-[17px] shrink-0 text-[#929dab]" />
                    <input
                      className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-brand-ink outline-0 placeholder:text-[#a4adb8]"
                      required
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      inputMode="email"
                      disabled={loading}
                    />
                  </div>
                </label>
              )}

              {needsPassword && (
                <label className="grid gap-[7px]">
                  <span className="text-xs font-bold text-[#3b4859]">
                    {mode === "update-password" ? "New password" : "Password"}
                  </span>
                  <div className="flex h-[47px] items-center gap-[9px] rounded-[10px] border border-[#d8dee5] bg-white px-3 transition-[border-color,box-shadow] duration-200 focus-within:border-[#00859a] focus-within:shadow-[0_0_0_3px_#00859a18]">
                    <LockKeyhole className="size-[17px] shrink-0 text-[#929dab]" />
                    <input
                      className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-brand-ink outline-0 placeholder:text-[#a4adb8]"
                      required
                      minLength={mode === "login" ? 1 : 8}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder={mode === "login" ? "Your password" : "At least 8 characters"}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="grid h-[34px] w-[30px] place-items-center border-0 bg-transparent p-0 text-[#8995a3] hover:text-brand-navy"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-[17px]" /> : <Eye className="size-[17px]" />}
                    </button>
                  </div>
                  {(mode === "signup" || mode === "update-password") && password.length > 0 && (
                    <span className="grid gap-1.5">
                      <span className="h-1.5 overflow-hidden rounded-full bg-[#e8edf2]">
                        <span className={`block h-full rounded-full transition-all ${strengthColor} ${strengthWidth}`} />
                      </span>
                      <span className="text-[11px] text-[#7a8698]">Strength: {strengthLabel}</span>
                    </span>
                  )}
                </label>
              )}

              {showConfirm && (
                <label className="grid gap-[7px]">
                  <span className="text-xs font-bold text-[#3b4859]">Confirm password</span>
                  <div className="flex h-[47px] items-center gap-[9px] rounded-[10px] border border-[#d8dee5] bg-white px-3 transition-[border-color,box-shadow] duration-200 focus-within:border-[#00859a] focus-within:shadow-[0_0_0_3px_#00859a18]">
                    <LockKeyhole className="size-[17px] shrink-0 text-[#929dab]" />
                    <input
                      className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-brand-ink outline-0 placeholder:text-[#a4adb8]"
                      required
                      minLength={8}
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Enter password again"
                      autoComplete="new-password"
                      disabled={loading}
                    />
                  </div>
                </label>
              )}

              {mode === "login" && (
                <Link
                  className="-mt-[5px] justify-self-end text-xs font-bold text-brand-orange"
                  href="/forgot-password"
                >
                  Forgot password?
                </Link>
              )}

              {message && (
                <p
                  className={`m-0 rounded-lg px-3 py-[10px] text-xs leading-[1.45] ${
                    message.type === "error" ? "bg-[#fff0f1] text-[#9f1c28]" : "bg-[#eaf8f0] text-[#14683a]"
                  }`}
                  role="status"
                >
                  {message.text}
                </p>
              )}

              <button
                className="min-h-12 rounded-[10px] border-0 bg-[linear-gradient(100deg,var(--color-brand-orange),#ff9b17)] text-sm font-black text-white shadow-[0_8px_18px_#ff4d1230] transition-[transform,box-shadow] duration-200 enabled:hover:-translate-y-px enabled:hover:shadow-[0_10px_22px_#ff4d1240] disabled:cursor-wait disabled:opacity-65"
                disabled={loading || (mode === "update-password" && !sessionReady)}
                type="submit"
              >
                {loading ? "Please wait..." : copy.submit}
              </button>
            </form>

            {showGoogle && (
              <>
                <div className="auth-divider my-[21px] flex items-center gap-3 text-[11px] text-[#909aa7]">
                  <span>or</span>
                </div>
                <button
                  className="flex min-h-12 w-full items-center justify-center gap-[11px] rounded-[10px] border border-[#d8dee5] bg-white text-[13px] font-bold text-[#303d4f] enabled:hover:border-[#aeb9c4] enabled:hover:bg-[#f8fafb] disabled:cursor-wait disabled:opacity-65"
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <GoogleMark />
                  Continue with Google
                </button>
              </>
            )}
          </>
        )}

        <p className="mt-[18px] text-center text-xs text-[#657184] [&_a]:font-black [&_a]:text-brand-orange">
          {mode === "login" && (
            <>
              Don&apos;t have an account? <Link href={withNext("/signup", redirectTo)}>Sign up</Link>
            </>
          )}
          {mode === "signup" && !sentEmail && (
            <>
              Already have an account? <Link href={withNext("/login", redirectTo)}>Log in</Link>
            </>
          )}
          {mode === "forgot-password" && !sentEmail && <Link href={withNext("/login", redirectTo)}>Back to log in</Link>}
          {mode === "update-password" && (
            <Link href="/forgot-password">Need a new reset link?</Link>
          )}
        </p>
      </section>
    </main>
  );
}
