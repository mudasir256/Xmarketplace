import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Forgot password | X Marketplace",
  description: "Reset your X Marketplace account password.",
};

type AuthPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  return <AuthForm mode="forgot-password" initialError={params.error} />;
}
