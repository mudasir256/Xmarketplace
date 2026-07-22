import { requireApiUser, jsonOk, jsonError } from "@/lib/account/api";
import { deleteBuyerRequest, updateBuyerRequest } from "@/lib/account/buyer-requests";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return jsonError("Invalid JSON body");

  const result = await updateBuyerRequest(auth.user.id, id, {
    title: String(body.title ?? "").trim(),
    description: String(body.description ?? "").trim(),
    categorySlug: body.categorySlug ? String(body.categorySlug) : null,
    city: body.city ? String(body.city) : null,
    budgetMin: body.budgetMin == null ? null : Number(body.budgetMin),
    budgetMax: body.budgetMax == null ? null : Number(body.budgetMax),
    contactNumber: body.contactNumber ? String(body.contactNumber) : null,
    status: body.status ? String(body.status) : "OPEN",
  });

  if (!result.ok) return jsonError(result.message, 400);
  return jsonOk({ request: result.request });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const result = await deleteBuyerRequest(auth.user.id, id);
  if (!result.ok) return jsonError(result.message, 400);
  return jsonOk({ deleted: true });
}
