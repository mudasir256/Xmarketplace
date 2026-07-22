import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Update password | X Marketplace",
  description: "Choose a new password for your X Marketplace account.",
};

type AuthPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function UpdatePasswordPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  return <AuthForm mode="update-password" initialError={params.error} />;
}
