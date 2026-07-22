"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteMyListing, updateMyListing } from "@/lib/account/listings";
import { updateProfile } from "@/lib/account/profile";
import {
  isValidPkContactNumber,
  LISTING_CONDITIONS,
  MARKETPLACE_CITIES,
  normalizeContactNumber,
  normalizeListingCondition,
} from "@/lib/marketplace";
import { createClient } from "@/lib/supabase/server";

const conditionValues = LISTING_CONDITIONS.map((item) => item.value) as [
  (typeof LISTING_CONDITIONS)[number]["value"],
  ...(typeof LISTING_CONDITIONS)[number]["value"][],
];
const cityValues = MARKETPLACE_CITIES as unknown as [string, ...string[]];

const listingSchema = z.object({
  listingId: z.string().uuid(),
  categoryId: z.string().uuid("Select a category"),
  city: z.enum(cityValues, { error: "Select a city" }),
  title: z.string().trim().min(8).max(120),
  price: z.coerce.number().finite().min(0).max(999_999_999_999),
  condition: z.enum(conditionValues),
  contactNumber: z
    .string()
    .trim()
    .min(1)
    .refine(isValidPkContactNumber, "Enter a valid Pakistani mobile number"),
  description: z.string().trim().min(20).max(5000),
  status: z.enum(["PUBLISHED", "SOLD", "ARCHIVED"]).optional(),
});

export type ListingActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof listingSchema>, string>>;
};

export async function updateMarketplaceListingAction(
  _prev: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Please log in." };

  const parsed = listingSchema.safeParse({
    listingId: formData.get("listingId"),
    categoryId: formData.get("categoryId"),
    city: formData.get("city"),
    title: formData.get("title"),
    price: formData.get("price"),
    condition: normalizeListingCondition(formData.get("condition")),
    contactNumber: formData.get("contactNumber"),
    description: formData.get("description"),
    status: formData.get("status") || "PUBLISHED",
  });

  if (!parsed.success) {
    const fieldErrors: ListingActionState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fieldErrors)) {
        fieldErrors[key as keyof NonNullable<ListingActionState["fieldErrors"]>] = issue.message;
      }
    }
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors };
  }

  const result = await updateMyListing(user.id, parsed.data.listingId, {
    categoryId: parsed.data.categoryId,
    city: parsed.data.city,
    title: parsed.data.title,
    price: parsed.data.price,
    condition: parsed.data.condition,
    contactNumber: normalizeContactNumber(parsed.data.contactNumber),
    description: parsed.data.description,
    status: parsed.data.status ?? "PUBLISHED",
  });

  if (!result.ok) return { ok: false, message: result.message };

  revalidatePath("/account/marketplace-listings");
  revalidatePath(`/account/marketplace-listings/${parsed.data.listingId}/edit`);
  revalidatePath("/");
  return { ok: true, message: "Ad updated successfully." };
}

export async function deleteMarketplaceListingAction(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, message: "Please log in." };

  const result = await deleteMyListing(user.id, listingId);
  if (!result.ok) return result;

  revalidatePath("/account/marketplace-listings");
  revalidatePath("/");
  return { ok: true as const, message: "Ad deleted." };
}

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, message: "Please log in." };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (fullName.length < 2) return { ok: false as const, message: "Enter your name." };

  const result = await updateProfile(
    { id: user.id, email: user.email },
    { fullName, phone: phone || null },
  );
  if (!result.ok) return result;

  revalidatePath("/account/profile");
  revalidatePath("/account");
  return { ok: true as const, message: "Profile updated." };
}
