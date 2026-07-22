import { requireApiUser, jsonOk } from "@/lib/account/api";
import { getOverview } from "@/lib/account/overview";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const overview = await getOverview(auth.user.id);
  return jsonOk({ overview });
}
