import { createAdminClient } from "@/lib/supabase/admin";
import { ensureProfile } from "@/lib/account/api";

export type BuyerRequestInput = {
  title: string;
  description: string;
  categorySlug?: string | null;
  city?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  contactNumber?: string | null;
  status?: string;
};

function mapRequest(row: {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category_slug: string | null;
  city: string | null;
  budget_min: number | null;
  budget_max: number | null;
  contact_number: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    categorySlug: row.category_slug,
    city: row.city,
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    contactNumber: row.contact_number,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listOpenBuyerRequests() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("buyer_requests")
    .select("*")
    .eq("status", "OPEN")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("buyer_requests missing?", error.message);
    return [];
  }
  return (data ?? []).map(mapRequest);
}

export async function listMyBuyerRequests(userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("buyer_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map(mapRequest);
}

export async function createBuyerRequest(
  user: { id: string; email?: string | null },
  input: BuyerRequestInput,
) {
  await ensureProfile({ id: user.id, email: user.email });
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("buyer_requests")
    .insert({
      user_id: user.id,
      title: input.title,
      description: input.description,
      category_slug: input.categorySlug ?? null,
      city: input.city ?? null,
      budget_min: input.budgetMin ?? null,
      budget_max: input.budgetMax ?? null,
      contact_number: input.contactNumber ?? null,
      status: "OPEN",
    })
    .select("*")
    .single();
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const, request: mapRequest(data) };
}

export async function updateBuyerRequest(userId: string, requestId: string, input: BuyerRequestInput) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("buyer_requests")
    .update({
      title: input.title,
      description: input.description,
      category_slug: input.categorySlug ?? null,
      city: input.city ?? null,
      budget_min: input.budgetMin ?? null,
      budget_max: input.budgetMax ?? null,
      contact_number: input.contactNumber ?? null,
      status: input.status ?? "OPEN",
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();
  if (error || !data) return { ok: false as const, message: error?.message || "Request not found." };
  return { ok: true as const, request: mapRequest(data) };
}

export async function deleteBuyerRequest(userId: string, requestId: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("buyer_requests").delete().eq("id", requestId).eq("user_id", userId);
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const };
}
