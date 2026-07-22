import { requireApiUser, jsonOk, jsonError } from "@/lib/account/api";
import { createAddress, listAddresses } from "@/lib/account/addresses";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const addresses = await listAddresses(auth.user.id);
  return jsonOk({ addresses });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return jsonError("Invalid JSON body");

  const fullName = String(body.fullName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const province = String(body.province ?? "").trim();
  const city = String(body.city ?? "").trim();
  const streetAddress = String(body.streetAddress ?? "").trim();

  if (!fullName || !phone || !province || !city || !streetAddress) {
    return jsonError("fullName, phone, province, city, and streetAddress are required");
  }

  const result = await createAddress(
    { id: auth.user.id, email: auth.user.email },
    {
      fullName,
      phone,
      province,
      city,
      area: body.area ? String(body.area) : null,
      streetAddress,
      postalCode: body.postalCode ? String(body.postalCode) : null,
      landmark: body.landmark ? String(body.landmark) : null,
      isDefaultShipping: Boolean(body.isDefaultShipping),
      isDefaultBilling: Boolean(body.isDefaultBilling),
    },
  );

  if (!result.ok) return jsonError(result.message, 400);
  return jsonOk({ address: result.address }, 201);
}
