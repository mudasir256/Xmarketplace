import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Log in | X Marketplace",
  description: "Sign in to your X Marketplace account.",
};

type AuthPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  return <AuthForm mode="login" nextPath={params.next} initialError={params.error} />;
}
