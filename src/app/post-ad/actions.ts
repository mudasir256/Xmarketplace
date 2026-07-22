"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  isValidPkContactNumber,
  LISTING_CONDITIONS,
  LISTING_IMAGE_BUCKET,
  MARKETPLACE_CITIES,
  MAX_LISTING_PHOTOS,
  MAX_PHOTO_BYTES,
  normalizeContactNumber,
  normalizeListingCondition,
  slugifyTitle,
} from "@/lib/marketplace";
import { getUserAvatarUrl, getUserDisplayName } from "@/lib/user-display";

const conditionValues = LISTING_CONDITIONS.map((item) => item.value) as [
  (typeof LISTING_CONDITIONS)[number]["value"],
  ...(typeof LISTING_CONDITIONS)[number]["value"][],
];

const cityValues = MARKETPLACE_CITIES as unknown as [string, ...string[]];

const postAdSchema = z.object({
  categoryId: z.string().uuid("Select a category"),
  city: z.enum(cityValues, { error: "Select a city" }),
  title: z.string().trim().min(8, "Title must be at least 8 characters").max(120, "Title is too long"),
  price: z.coerce.number().finite().min(0, "Price cannot be negative").max(999_999_999_999, "Price is too high"),
  condition: z.enum(conditionValues, { error: "Select a condition" }),
  contactNumber: z
    .string()
    .trim()
    .min(1, "Contact number is required")
    .refine(isValidPkContactNumber, "Enter a valid Pakistani mobile number"),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description is too long"),
});

export type PostAdState = {
  ok: boolean;
  message: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof postAdSchema> | "photos", string>>;
  listingId?: string;
};

function emptyState(message = ""): PostAdState {
  return { ok: false, message };
}

function photoExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

export async function submitMarketplaceAd(_prev: PostAdState, formData: FormData): Promise<PostAdState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return emptyState("Please log in to post an ad.");
  }

  const parsed = postAdSchema.safeParse({
    categoryId: formData.get("categoryId"),
    city: formData.get("city"),
    title: formData.get("title"),
    price: formData.get("price"),
    condition: normalizeListingCondition(formData.get("condition")),
    contactNumber: formData.get("contactNumber"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    const fieldErrors: PostAdState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fieldErrors)) {
        fieldErrors[key as keyof NonNullable<PostAdState["fieldErrors"]>] = issue.message;
      }
    }
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors };
  }

  const photos = formData
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (photos.length === 0) {
    return {
      ok: false,
      message: "Please add at least one photo.",
      fieldErrors: { photos: "Add at least one photo" },
    };
  }

  if (photos.length > MAX_LISTING_PHOTOS) {
    return {
      ok: false,
      message: `You can upload up to ${MAX_LISTING_PHOTOS} photos.`,
      fieldErrors: { photos: `Maximum ${MAX_LISTING_PHOTOS} photos` },
    };
  }

  for (const photo of photos) {
    if (!photo.type.startsWith("image/")) {
      return {
        ok: false,
        message: "Only image files are allowed.",
        fieldErrors: { photos: "Only image files are allowed" },
      };
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return {
        ok: false,
        message: "Each photo must be 5 MB or smaller.",
        fieldErrors: { photos: "Each photo must be 5 MB or smaller" },
      };
    }
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return emptyState("Server is missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env and restart.");
  }

  // Ensure a profile row exists (FK target for marketplace_listings.user_id).
  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      full_name: getUserDisplayName(user),
      avatar_path: getUserAvatarUrl(user),
    },
    { onConflict: "id" },
  );

  if (profileError) {
    console.error("Failed to ensure profile", profileError);
    return emptyState("Could not prepare your seller profile. Please try again.");
  }

  const { data: category, error: categoryError } = await admin
    .from("marketplace_categories")
    .select("id")
    .eq("id", parsed.data.categoryId)
    .eq("is_active", true)
    .maybeSingle();

  if (categoryError || !category) {
    return {
      ok: false,
      message: "Selected category is not available.",
      fieldErrors: { categoryId: "Select a valid category" },
    };
  }

  const slug = slugifyTitle(parsed.data.title);
  const contactNumber = normalizeContactNumber(parsed.data.contactNumber);
  const latitudeRaw = Number(formData.get("latitude"));
  const longitudeRaw = Number(formData.get("longitude"));
  const areaFromForm = String(formData.get("area") ?? "").trim() || null;

  const { cityCenter } = await import("@/lib/location");
  const fallback = cityCenter(parsed.data.city);
  const latitude = Number.isFinite(latitudeRaw) ? latitudeRaw : fallback.latitude;
  const longitude = Number.isFinite(longitudeRaw) ? longitudeRaw : fallback.longitude;
  const area = areaFromForm || fallback.area;

  // Service role bypasses RLS so PUBLISHED inserts work even if policies are outdated.
  const listingPayload = {
    user_id: user.id,
    category_id: parsed.data.categoryId,
    title: parsed.data.title,
    slug,
    description: parsed.data.description,
    price: parsed.data.price,
    condition: normalizeListingCondition(parsed.data.condition),
    contact_number: contactNumber,
    city: parsed.data.city,
    area,
    latitude,
    longitude,
    status: "PUBLISHED" as const,
    published_at: new Date().toISOString(),
  };

  let listing: { id: string } | null = null;
  let listingError: { message?: string; code?: string; details?: string; hint?: string } | null = null;

  {
    const result = await admin.from("marketplace_listings").insert(listingPayload).select("id").single();
    listing = result.data;
    listingError = result.error;
  }

  // Older Supabase projects may be missing area/lat/lng — retry without them so posting still works.
  const missingLocationColumn =
    listingError &&
    /area|latitude|longitude|schema cache|Could not find/i.test(
      `${listingError.message ?? ""} ${listingError.details ?? ""} ${listingError.hint ?? ""}`,
    );

  if (missingLocationColumn) {
    console.warn(
      "marketplace_listings is missing location columns. Run: npm run db:locations (or supabase/fix_listing_area.sql)",
      listingError,
    );
    const { area: _area, latitude: _lat, longitude: _lng, ...withoutLocation } = listingPayload;
    const retry = await admin.from("marketplace_listings").insert(withoutLocation).select("id").single();
    listing = retry.data;
    listingError = retry.error;
  }

  if (listingError || !listing) {
    console.error("Failed to create listing", listingError);
    const message = listingError?.message || "Could not create your ad. Please try again.";
    if (/area|latitude|longitude|schema cache|Could not find/i.test(message)) {
      return emptyState(
        "Your database is missing location columns (area/latitude/longitude). In Supabase SQL Editor run supabase/fix_listing_area.sql, then try again.",
      );
    }
    return emptyState(message);
  }

  const uploadedPaths: string[] = [];

  try {
    for (const [index, photo] of photos.entries()) {
      const path = `${user.id}/${listing.id}/${index + 1}-${crypto.randomUUID()}.${photoExtension(photo)}`;
      const { error: uploadError } = await supabase.storage.from(LISTING_IMAGE_BUCKET).upload(path, photo, {
        contentType: photo.type || "image/jpeg",
        upsert: false,
      });

      if (uploadError) {
        // Fall back to service-role upload if storage RLS blocks the user session.
        const { error: adminUploadError } = await admin.storage.from(LISTING_IMAGE_BUCKET).upload(path, photo, {
          contentType: photo.type || "image/jpeg",
          upsert: false,
        });
        if (adminUploadError) {
          throw new Error(adminUploadError.message || uploadError.message || "Photo upload failed");
        }
      }

      uploadedPaths.push(path);
    }

    const imageRows = uploadedPaths.map((storage_path, index) => ({
      listing_id: listing.id,
      storage_path,
      alt_text: parsed.data.title,
      display_order: index,
      is_primary: index === 0,
    }));

    const { error: imagesError } = await admin.from("marketplace_listing_images").insert(imageRows);
    if (imagesError) {
      throw new Error(imagesError.message || "Could not save photo records");
    }
  } catch (error) {
    console.error("Listing photo pipeline failed", error);
    if (uploadedPaths.length > 0) {
      await admin.storage.from(LISTING_IMAGE_BUCKET).remove(uploadedPaths);
    }
    await admin.from("marketplace_listings").delete().eq("id", listing.id);
    return emptyState(error instanceof Error ? error.message : "Could not upload photos. Please try again.");
  }

  return {
    ok: true,
    message: "Your ad is live. It will appear on the marketplace now.",
    listingId: listing.id,
  };
}
