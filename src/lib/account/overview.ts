import { createAdminClient } from "@/lib/supabase/admin";
import { ensureProfile } from "@/lib/account/api";
import { getFavoriteListingIds } from "@/lib/favorites";
import { getMyListings } from "@/lib/account/listings";

export async function listStoreOrders(userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("store_orders")
    .select("id, order_number, status, payment_status, grand_total, currency, placed_at, created_at")
    .eq("user_id", userId)
    .order("placed_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export type WishlistItem = {
  id: string;
  product_id: string;
  created_at: string;
  store_products:
    | { id: string; name: string; slug: string; base_price: number; product_status: string }
    | { id: string; name: string; slug: string; base_price: number; product_status: string }[]
    | null;
};

export async function listWishlist(userId: string): Promise<WishlistItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("store_wishlist")
    .select("id, product_id, created_at, store_products ( id, name, slug, base_price, product_status )")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as unknown as WishlistItem[];
}

export async function addWishlistItem(user: { id: string; email?: string | null }, productId: string) {
  await ensureProfile({ id: user.id, email: user.email });
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("store_wishlist")
    .upsert({ user_id: user.id, product_id: productId }, { onConflict: "user_id,product_id" })
    .select("*")
    .single();
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const, item: data };
}

export async function removeWishlistItem(userId: string, productId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("store_wishlist")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const };
}

export async function listNotifications(userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return [];
  return data ?? [];
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", userId);
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const };
}

export async function markAllNotificationsRead(userId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const };
}

export async function getSettings(userId: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("account_settings").select("*").eq("user_id", userId).maybeSingle();
  return (
    data ?? {
      user_id: userId,
      email_notifications: true,
      sms_notifications: false,
      profile_visibility: "public",
    }
  );
}

export async function updateSettings(
  user: { id: string; email?: string | null },
  input: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    profileVisibility?: "public" | "private";
  },
) {
  await ensureProfile({ id: user.id, email: user.email });
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("account_settings")
    .upsert(
      {
        user_id: user.id,
        email_notifications: input.emailNotifications ?? true,
        sms_notifications: input.smsNotifications ?? false,
        profile_visibility: input.profileVisibility ?? "public",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select("*")
    .single();
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const, settings: data };
}

export async function getOverview(userId: string) {
  const [listings, favoriteIds, orders, notifications] = await Promise.all([
    getMyListings(userId),
    getFavoriteListingIds(),
    listStoreOrders(userId),
    listNotifications(userId),
  ]);

  return {
    activeListings: listings.filter((item) => item.status === "PUBLISHED").length,
    storeOrders: orders.length,
    savedItems: favoriteIds.length,
    unreadNotifications: notifications.filter((item) => !item.is_read).length,
    recentNotifications: notifications.slice(0, 5),
  };
}
