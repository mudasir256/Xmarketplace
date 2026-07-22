import { requireApiUser, jsonOk } from "@/lib/account/api";
import { listMyBuyerRequests } from "@/lib/account/buyer-requests";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const requests = await listMyBuyerRequests(auth.user.id);
  return jsonOk({ requests });
}
