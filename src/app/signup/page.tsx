import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign up | X Marketplace",
  description: "Create your X Marketplace account.",
};

type AuthPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function SignupPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  return <AuthForm mode="signup" nextPath={params.next} initialError={params.error} />;
}
