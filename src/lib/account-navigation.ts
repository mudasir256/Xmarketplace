export const accountNavigation = [
  { label: "Overview", slug: "" },
  { label: "Profile", slug: "profile" },
  { label: "Marketplace Listings", slug: "marketplace-listings" },
  { label: "Buyer Requests", slug: "buyer-requests" },
  { label: "My Buyer Requests", slug: "my-buyer-requests" },
  { label: "Favorites", slug: "favorites" },
  { label: "Store Orders", slug: "store-orders" },
  { label: "Addresses", slug: "addresses" },
  { label: "Wishlist", slug: "wishlist" },
  { label: "Messages", slug: "messages" },
  { label: "Notifications", slug: "notifications" },
  { label: "Settings", slug: "settings" },
] as const;

export function accountHref(slug: string) {
  if (slug === "messages") return "/messages";
  return slug ? `/account/${slug}` : "/account";
}
