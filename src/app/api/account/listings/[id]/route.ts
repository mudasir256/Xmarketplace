import { requireApiUser, jsonOk, jsonError } from "@/lib/account/api";
import { deleteMyListing, getMyListingById, updateMyListing } from "@/lib/account/listings";
import {
  isValidPkContactNumber,
  LISTING_CONDITIONS,
  MARKETPLACE_CITIES,
  normalizeContactNumber,
  normalizeListingCondition,
} from "@/lib/marketplace";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const listing = await getMyListingById(auth.user.id, id);
  if (!listing) return jsonError("Listing not found", 404);
  return jsonOk({ listing });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return jsonError("Invalid JSON body");

  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const categoryId = String(body.categoryId ?? "");
  const city = String(body.city ?? "");
  const condition = normalizeListingCondition(body.condition);
  const contactNumber = normalizeContactNumber(String(body.contactNumber ?? ""));
  const price = Number(body.price);
  const status = body.status ? String(body.status) : "PUBLISHED";

  if (title.length < 8) return jsonError("Title must be at least 8 characters");
  if (description.length < 20) return jsonError("Description must be at least 20 characters");
  if (!categoryId) return jsonError("categoryId is required");
  if (!(MARKETPLACE_CITIES as readonly string[]).includes(city)) return jsonError("Invalid city");
  if (!LISTING_CONDITIONS.some((item) => item.value === condition)) return jsonError("Invalid condition");
  if (!isValidPkContactNumber(contactNumber)) return jsonError("Invalid contact number");
  if (!Number.isFinite(price) || price < 0) return jsonError("Invalid price");

  const result = await updateMyListing(auth.user.id, id, {
    categoryId,
    city,
    title,
    price,
    condition,
    contactNumber,
    description,
    status,
  });

  if (!result.ok) return jsonError(result.message, 400);
  const listing = await getMyListingById(auth.user.id, id);
  return jsonOk({ listing });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const result = await deleteMyListing(auth.user.id, id);
  if (!result.ok) return jsonError(result.message, 400);
  return jsonOk({ deleted: true });
}
