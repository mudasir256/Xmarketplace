import { requireApiUser, jsonOk, jsonError } from "@/lib/account/api";
import { addWishlistItem, listWishlist, removeWishlistItem } from "@/lib/account/overview";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const items = await listWishlist(auth.user.id);
  return jsonOk({ items });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const body = (await request.json().catch(() => null)) as { productId?: string } | null;
  if (!body?.productId) return jsonError("productId is required");
  const result = await addWishlistItem({ id: auth.user.id, email: auth.user.email }, body.productId);
  if (!result.ok) return jsonError(result.message, 400);
  return jsonOk({ item: result.item }, 201);
}

export async function DELETE(request: Request) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const body = (await request.json().catch(() => null)) as { productId?: string } | null;
  if (!body?.productId) return jsonError("productId is required");
  const result = await removeWishlistItem(auth.user.id, body.productId);
  if (!result.ok) return jsonError(result.message, 400);
  return jsonOk({ deleted: true });
}
