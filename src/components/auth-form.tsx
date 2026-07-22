"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import logo from "../../xmarketplacelogo.png";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup" | "forgot-password" | "update-password";

const content = {
  login: {
    title: "Welcome back",
    subtitle: "Sign in to your marketplace account",
    submit: "Log in",
  },
  signup: {
    title: "Create your account",
    subtitle: "Start buying and selling on X Marketplace",
    submit: "Sign up",
  },
  "forgot-password": {
    title: "Forgot your password?",
    subtitle: "Enter your email and we'll send you a reset link",
    submit: "Send reset link",
  },
  "update-password": {
    title: "Choose a new password",
    subtitle: "Enter a secure password for your account",
    submit: "Update password",
  },
} as const;

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const copy = content[mode];
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  function getClient() {
    if (!configured) {
      setMessage({ type: "error", text: "Authentication is not configured yet. Add your Supabase environment variables." });
      return null;
    }
    return createClient();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if ((mode === "signup" || mode === "update-password") && password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    const supabase = getClient();
    if (!supabase) return;

    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/account");
        router.refresh();
      }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`,
          },
        });
        if (error) throw error;
        if (data.session) {
          router.push("/account");
          router.refresh();
        } else {
          setMessage({ type: "success", text: "Account created. Check your email to confirm your account." });
        }
      }

      if (mode === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
        });
        if (error) throw error;
        setMessage({ type: "success", text: "Password reset link sent. Check your inbox." });
      }

      if (mode === "update-password") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMessage({ type: "success", text: "Password updated. You can now continue to your account." });
        window.setTimeout(() => router.push("/account"), 900);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
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
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/account` },
    });
    if (error) {
      setMessage({ type: "error", text: error.message });
      setLoading(false);
    }
  }

  const needsEmail = mode !== "update-password";
  const needsPassword = mode !== "forgot-password";

  return (
    <main className="auth-shell grid min-h-svh place-items-center px-[18px] py-[42px] max-[760px]:px-3 max-[760px]:py-[18px]">
      <section className="w-[min(100%,430px)] rounded-[18px] border border-[#ffffff7a] bg-white px-[30px] pb-7 pt-[34px] shadow-[0_24px_70px_#001e2e70] max-[760px]:rounded-2xl max-[760px]:px-5 max-[760px]:pb-6 max-[760px]:pt-7">
        <Link className="mx-auto mb-[10px] block w-[210px] max-[760px]:w-[190px]" href="/" aria-label="X Marketplace home">
          <Image className="h-auto w-full" src={logo} alt="X Marketplace" priority />
        </Link>
        <h1 className="m-0 text-center text-2xl font-bold tracking-[-.4px] text-brand-navy">{copy.title}</h1>
        <p className="mt-[7px] text-center text-[13px] leading-6 text-brand-muted">{copy.subtitle}</p>

        <form className="mt-6 grid gap-[15px]" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label className="grid gap-[7px]">
              <span className="text-xs font-bold text-[#3b4859]">Full name</span>
              <div className="flex h-[47px] items-center gap-[9px] rounded-[10px] border border-[#d8dee5] bg-white px-3 transition-[border-color,box-shadow] duration-200 focus-within:border-[#00859a] focus-within:shadow-[0_0_0_3px_#00859a18]">
                <UserRound className="size-[17px] shrink-0 text-[#929dab]" />
                <input className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-brand-ink outline-0 placeholder:text-[#a4adb8]" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" autoComplete="name" />
              </div>
            </label>
          )}

          {needsEmail && (
            <label className="grid gap-[7px]">
              <span className="text-xs font-bold text-[#3b4859]">Email address</span>
              <div className="flex h-[47px] items-center gap-[9px] rounded-[10px] border border-[#d8dee5] bg-white px-3 transition-[border-color,box-shadow] duration-200 focus-within:border-[#00859a] focus-within:shadow-[0_0_0_3px_#00859a18]">
                <Mail className="size-[17px] shrink-0 text-[#929dab]" />
                <input className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-brand-ink outline-0 placeholder:text-[#a4adb8]" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" />
              </div>
            </label>
          )}

          {needsPassword && (
            <label className="grid gap-[7px]">
              <span className="text-xs font-bold text-[#3b4859]">{mode === "update-password" ? "New password" : "Password"}</span>
              <div className="flex h-[47px] items-center gap-[9px] rounded-[10px] border border-[#d8dee5] bg-white px-3 transition-[border-color,box-shadow] duration-200 focus-within:border-[#00859a] focus-within:shadow-[0_0_0_3px_#00859a18]">
                <LockKeyhole className="size-[17px] shrink-0 text-[#929dab]" />
                <input
                  className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-brand-ink outline-0 placeholder:text-[#a4adb8]"
                  required
                  minLength={6}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button type="button" className="grid h-[34px] w-[30px] place-items-center border-0 bg-transparent p-0 text-[#8995a3] hover:text-brand-navy" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="size-[17px]" /> : <Eye className="size-[17px]" />}
                </button>
              </div>
            </label>
          )}

          {(mode === "signup" || mode === "update-password") && (
            <label className="grid gap-[7px]">
              <span className="text-xs font-bold text-[#3b4859]">Confirm password</span>
              <div className="flex h-[47px] items-center gap-[9px] rounded-[10px] border border-[#d8dee5] bg-white px-3 transition-[border-color,box-shadow] duration-200 focus-within:border-[#00859a] focus-within:shadow-[0_0_0_3px_#00859a18]">
                <LockKeyhole className="size-[17px] shrink-0 text-[#929dab]" />
                <input className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-brand-ink outline-0 placeholder:text-[#a4adb8]" required minLength={6} type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter password again" autoComplete="new-password" />
              </div>
            </label>
          )}

          {mode === "login" && <Link className="-mt-[5px] justify-self-end text-xs font-bold text-brand-orange" href="/forgot-password">Forgot password?</Link>}

          {message && (
            <p className={`m-0 rounded-lg px-3 py-[10px] text-xs leading-[1.45] ${
              message.type === "error" ? "bg-[#fff0f1] text-[#9f1c28]" : "bg-[#eaf8f0] text-[#14683a]"
            }`} role="status">{message.text}</p>
          )}
          <button className="min-h-12 rounded-[10px] border-0 bg-[linear-gradient(100deg,var(--color-brand-orange),#ff9b17)] text-sm font-black text-white shadow-[0_8px_18px_#ff4d1230] transition-[transform,box-shadow] duration-200 enabled:hover:-translate-y-px enabled:hover:shadow-[0_10px_22px_#ff4d1240] disabled:cursor-wait disabled:opacity-65" disabled={loading} type="submit">
            {loading ? "Please wait..." : copy.submit}
          </button>
        </form>

        {(mode === "login" || mode === "signup") && (
          <>
            <div className="auth-divider my-[21px] flex items-center gap-3 text-[11px] text-[#909aa7]"><span>or</span></div>
            <button className="flex min-h-12 w-full items-center justify-center gap-[11px] rounded-[10px] border border-[#d8dee5] bg-white text-[13px] font-bold text-[#303d4f] enabled:hover:border-[#aeb9c4] enabled:hover:bg-[#f8fafb] disabled:cursor-wait disabled:opacity-65" type="button" onClick={handleGoogleLogin} disabled={loading}>
              <span className="font-sans text-[19px] font-black text-[#4285f4]">G</span>
              Continue with Google
            </button>
          </>
        )}

        <p className="mt-[18px] text-center text-xs text-[#657184] [&_a]:font-black [&_a]:text-brand-orange">
          {mode === "login" && <>Don&apos;t have an account? <Link href="/signup">Sign up</Link></>}
          {mode === "signup" && <>Already have an account? <Link href="/login">Log in</Link></>}
          {mode === "forgot-password" && <><Link href="/login">Back to log in</Link></>}
          {mode === "update-password" && <><Link href="/login">Back to log in</Link></>}
        </p>
      </section>
    </main>
  );
}
