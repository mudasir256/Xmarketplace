import { requireApiUser, jsonOk, jsonError } from "@/lib/account/api";
import { deleteAddress, updateAddress } from "@/lib/account/addresses";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return jsonError("Invalid JSON body");

  const result = await updateAddress(auth.user.id, id, {
    fullName: String(body.fullName ?? "").trim(),
    phone: String(body.phone ?? "").trim(),
    province: String(body.province ?? "").trim(),
    city: String(body.city ?? "").trim(),
    area: body.area ? String(body.area) : null,
    streetAddress: String(body.streetAddress ?? "").trim(),
    postalCode: body.postalCode ? String(body.postalCode) : null,
    landmark: body.landmark ? String(body.landmark) : null,
    isDefaultShipping: Boolean(body.isDefaultShipping),
    isDefaultBilling: Boolean(body.isDefaultBilling),
  });

  if (!result.ok) return jsonError(result.message, 400);
  return jsonOk({ address: result.address });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const result = await deleteAddress(auth.user.id, id);
  if (!result.ok) return jsonError(result.message, 400);
  return jsonOk({ deleted: true });
}
