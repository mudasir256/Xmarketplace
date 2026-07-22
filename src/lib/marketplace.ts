export const MARKETPLACE_CATEGORIES = [
  { name: "Vehicles", slug: "vehicles" },
  { name: "Bikes", slug: "bikes" },
  { name: "Property Sale", slug: "property-sale" },
  { name: "Property Rent", slug: "property-rent" },
  { name: "Mobiles", slug: "mobiles" },
  { name: "Electronics", slug: "electronics" },
  { name: "Furniture", slug: "furniture" },
  { name: "Animals", slug: "animals" },
  { name: "Fashion", slug: "fashion" },
  { name: "Services", slug: "services" },
] as const;

export const MARKETPLACE_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
] as const;

export const LISTING_CONDITIONS = [
  { value: "USED", label: "Used" },
  { value: "NEW", label: "New" },
  { value: "OPEN_BOX", label: "Open box" },
] as const;

export type ListingCondition = (typeof LISTING_CONDITIONS)[number]["value"];

export function normalizeListingCondition(value: unknown): ListingCondition {
  const raw = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (raw === "NEW") return "NEW";
  if (raw === "OPEN_BOX" || raw === "OPENBOX") return "OPEN_BOX";
  return "USED";
}

export function listingConditionLabel(value: unknown) {
  const normalized = normalizeListingCondition(value);
  return LISTING_CONDITIONS.find((item) => item.value === normalized)?.label ?? "Used";
}

export const MAX_LISTING_PHOTOS = 12;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const LISTING_IMAGE_BUCKET = "listing-images";

export function slugifyTitle(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const suffix = crypto.randomUUID().slice(0, 8);
  return `${base || "listing"}-${suffix}`;
}

export function normalizeContactNumber(value: string) {
  return value.replace(/[\s()-]/g, "").trim();
}

export function isValidPkContactNumber(value: string) {
  const normalized = normalizeContactNumber(value);
  return /^(?:\+92|0)?3\d{9}$/.test(normalized);
}
