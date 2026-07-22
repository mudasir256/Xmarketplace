import { requireApiUser, jsonOk, jsonError } from "@/lib/account/api";
import { createBuyerRequest, listOpenBuyerRequests } from "@/lib/account/buyer-requests";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const requests = await listOpenBuyerRequests();
  return jsonOk({ requests });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return jsonError("Invalid JSON body");

  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  if (title.length < 5 || description.length < 10) {
    return jsonError("Title and description are required");
  }

  const result = await createBuyerRequest(
    { id: auth.user.id, email: auth.user.email },
    {
      title,
      description,
      categorySlug: body.categorySlug ? String(body.categorySlug) : null,
      city: body.city ? String(body.city) : null,
      budgetMin: body.budgetMin == null ? null : Number(body.budgetMin),
      budgetMax: body.budgetMax == null ? null : Number(body.budgetMax),
      contactNumber: body.contactNumber ? String(body.contactNumber) : null,
    },
  );

  if (!result.ok) {
    return jsonError(
      result.message.includes("buyer_requests")
        ? "Buyer requests table is missing. Run the latest Supabase migration."
        : result.message,
      400,
    );
  }

  return jsonOk({ request: result.request }, 201);
}
