import { requireApiUser, jsonOk } from "@/lib/account/api";
import { listStoreOrders } from "@/lib/account/overview";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const orders = await listStoreOrders(auth.user.id);
  return jsonOk({ orders });
}
