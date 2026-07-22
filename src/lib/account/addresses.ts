import { createAdminClient } from "@/lib/supabase/admin";
import { ensureProfile } from "@/lib/account/api";

export type AddressInput = {
  fullName: string;
  phone: string;
  province: string;
  city: string;
  area?: string | null;
  streetAddress: string;
  postalCode?: string | null;
  landmark?: string | null;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
};

function mapAddress(row: {
  id: string;
  full_name: string;
  phone: string;
  province: string;
  city: string;
  area: string | null;
  street_address: string;
  postal_code: string | null;
  landmark: string | null;
  is_default_shipping: boolean;
  is_default_billing: boolean;
  created_at: string;
}) {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    province: row.province,
    city: row.city,
    area: row.area,
    streetAddress: row.street_address,
    postalCode: row.postal_code,
    landmark: row.landmark,
    isDefaultShipping: row.is_default_shipping,
    isDefaultBilling: row.is_default_billing,
    createdAt: row.created_at,
  };
}

export async function listAddresses(userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map(mapAddress);
}

export async function createAddress(user: { id: string; email?: string | null }, input: AddressInput) {
  await ensureProfile({ id: user.id, email: user.email });
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("addresses")
    .insert({
      user_id: user.id,
      full_name: input.fullName,
      phone: input.phone,
      province: input.province,
      city: input.city,
      area: input.area ?? null,
      street_address: input.streetAddress,
      postal_code: input.postalCode ?? null,
      landmark: input.landmark ?? null,
      is_default_shipping: Boolean(input.isDefaultShipping),
      is_default_billing: Boolean(input.isDefaultBilling),
    })
    .select("*")
    .single();
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const, address: mapAddress(data) };
}

export async function updateAddress(userId: string, addressId: string, input: AddressInput) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("addresses")
    .update({
      full_name: input.fullName,
      phone: input.phone,
      province: input.province,
      city: input.city,
      area: input.area ?? null,
      street_address: input.streetAddress,
      postal_code: input.postalCode ?? null,
      landmark: input.landmark ?? null,
      is_default_shipping: Boolean(input.isDefaultShipping),
      is_default_billing: Boolean(input.isDefaultBilling),
    })
    .eq("id", addressId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();
  if (error || !data) return { ok: false as const, message: error?.message || "Address not found." };
  return { ok: true as const, address: mapAddress(data) };
}

export async function deleteAddress(userId: string, addressId: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("addresses").delete().eq("id", addressId).eq("user_id", userId);
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const };
}
