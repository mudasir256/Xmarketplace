import type { CatalogItem } from "@/lib/catalog";

export type MarketplaceListingCard = CatalogItem & {
  description?: string;
  contactNumber?: string | null;
  createdAt?: string;
  condition?: string | null;
};

export type MarketplaceListingDetail = MarketplaceListingCard & {
  listingId: string;
  images: string[];
  conditionLabel: string;
  postedDateLabel: string;
  seller: {
    name: string;
    phone: string | null;
    avatarUrl: string | null;
  };
  details: { label: string; value: string }[];
};

export function relativeListingTime(isoDate?: string) {
  if (!isoDate) return "Today";
  const created = new Date(isoDate).getTime();
  if (Number.isNaN(created)) return "Today";
  const diffMs = Date.now() - created;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(isoDate).toLocaleDateString("en-PK", { day: "numeric", month: "short" });
}
