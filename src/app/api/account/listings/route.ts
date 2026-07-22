import { requireApiUser, jsonOk } from "@/lib/account/api";
import { getMyListings } from "@/lib/account/listings";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const listings = await getMyListings(auth.user.id);
  return jsonOk({ listings });
}
