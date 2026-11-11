import type { MarketplaceListingCard, MarketplaceListingDetail } from "@/lib/listing-types";
import { MARKETPLACE_CATEGORIES, listingConditionLabel, type ListingCondition } from "@/lib/marketplace";

// Original fictional examples for the public demo catalog; no seller data or third-party ads.
const DEMO_DISCLAIMER = "Demo listing — not for sale.";

type CategorySlug = (typeof MARKETPLACE_CATEGORIES)[number]["slug"];
type DemoListingSeed = {
  slug: string;
  title: string;
  price: number;
  city: string;
  condition: ListingCondition;
  description: string;
};

const examples: Record<CategorySlug, DemoListingSeed[]> = {
  vehicles: [
    { slug: "compact-city-hatchback", title: "Compact city hatchback", price: 2150000, city: "Karachi", condition: "USED", description: "An example of a compact five-door car listing with a manual gearbox, fabric seats and a small luggage area. The photo illustrates the vehicle category." },
    { slug: "family-sedan", title: "Family sedan with automatic transmission", price: 4650000, city: "Lahore", condition: "USED", description: "A fictional family-car example showing how an automatic sedan, interior features and an asking price can appear in a marketplace ad." },
    { slug: "seven-seat-mpv", title: "Seven-seat family MPV", price: 5850000, city: "Islamabad", condition: "USED", description: "An illustrative seven-seat people carrier with a flexible rear seating layout. This sample demonstrates a larger family vehicle listing." },
    { slug: "small-delivery-van", title: "Small cargo delivery van", price: 2850000, city: "Faisalabad", condition: "USED", description: "A sample light commercial van listing with an enclosed cargo area. The example price and city demonstrate details a vehicle seller could provide." },
  ],
  bikes: [
    { slug: "commuter-motorcycle", title: "125cc commuter motorcycle", price: 185000, city: "Rawalpindi", condition: "USED", description: "An example commuter motorcycle with a standard riding position and a compact fuel tank. The category photo is illustrative." },
    { slug: "city-scooter", title: "City scooter with under-seat storage", price: 225000, city: "Multan", condition: "USED", description: "A fictional scooter listing illustrating a step-through design and under-seat storage. No motorcycle or seller is attached to this example." },
    { slug: "mountain-bicycle", title: "Adult mountain bicycle", price: 48000, city: "Peshawar", condition: "USED", description: "A sample bicycle ad describing flat handlebars, a geared drivetrain and a front suspension fork. The price is included only for demonstration." },
    { slug: "electric-commuter-bike", title: "Electric commuter bike", price: 165000, city: "Sialkot", condition: "NEW", description: "An illustrative electric-bike listing with a rechargeable battery and an upright riding position. Battery range and specifications would need to be confirmed on a real ad." },
  ],
  "property-sale": [
    { slug: "five-marla-house", title: "Five-marla family house", price: 19500000, city: "Lahore", condition: "USED", description: "A fictional residential property example with three bedrooms, a lounge and a small courtyard. The photograph represents the category and is not a property being offered." },
    { slug: "two-bedroom-apartment", title: "Two-bedroom city apartment", price: 12500000, city: "Karachi", condition: "USED", description: "A sample apartment listing with two bedrooms, a living area and a balcony. No address, ownership claim or real property offer is associated with this ad." },
    { slug: "ten-marla-plot", title: "Ten-marla residential plot", price: 9800000, city: "Gujranwala", condition: "USED", description: "An illustrative residential plot example showing how plot size, city and an asking price could be presented. The location does not identify any real plot." },
    { slug: "single-storey-home", title: "Single-storey courtyard home", price: 14500000, city: "Quetta", condition: "USED", description: "A fictional house example with a single-storey layout and a central courtyard. The descriptive details and price are demonstration content." },
  ],
  "property-rent": [
    { slug: "two-bedroom-flat", title: "Two-bedroom flat — monthly rent example", price: 55000, city: "Islamabad", condition: "USED", description: "A sample rental flat with two bedrooms and a separate kitchen. The displayed price represents an example monthly rent; no tenancy or viewing is available." },
    { slug: "upper-portion", title: "Upper house portion — monthly rent example", price: 42000, city: "Rawalpindi", condition: "USED", description: "An illustrative upper-portion rental listing with two rooms and a shared entrance. The city and monthly amount are fictional ad details." },
    { slug: "compact-office", title: "Compact office space — monthly rent example", price: 65000, city: "Faisalabad", condition: "USED", description: "A fictional office rental example with an open work area and a small meeting room. No real office space or rental agreement is offered." },
    { slug: "studio-apartment", title: "Studio apartment — monthly rent example", price: 30000, city: "Multan", condition: "USED", description: "A sample studio rental with a combined sleeping and living area and a kitchenette. The example amount is monthly and the category image is illustrative." },
  ],
  mobiles: [
    { slug: "android-phone-128gb", title: "Android smartphone — 128GB", price: 45000, city: "Karachi", condition: "USED", description: "An example smartphone listing with 128GB storage and a dual-camera layout. Model, battery condition and network approval would require verification in a real sale." },
    { slug: "android-phone-256gb", title: "Android smartphone — 256GB", price: 82000, city: "Lahore", condition: "OPEN_BOX", description: "A fictional open-box phone example with 256GB storage. The example shows how storage and condition can be described without representing actual stock." },
    { slug: "compact-smartphone", title: "Compact touchscreen smartphone", price: 38500, city: "Sialkot", condition: "USED", description: "A sample compact mobile phone listing with a touchscreen and a slim case. The photograph is a category illustration rather than an exact device photo." },
    { slug: "large-screen-phone", title: "Large-screen smartphone — 128GB", price: 59000, city: "Peshawar", condition: "NEW", description: "An illustrative mobile listing with a large display and 128GB storage. The example price does not indicate product availability or a manufacturer warranty." },
  ],
  electronics: [
    { slug: "work-laptop", title: "Everyday work laptop — 16GB RAM", price: 115000, city: "Islamabad", condition: "USED", description: "A fictional laptop listing describing 16GB memory, a solid-state drive and a full-size keyboard. The photo illustrates the electronics category." },
    { slug: "wireless-headphones", title: "Over-ear wireless headphones", price: 12500, city: "Rawalpindi", condition: "OPEN_BOX", description: "A sample headphone listing with over-ear cushions and a wireless connection. There is no physical item or seller associated with this example." },
    { slug: "desktop-monitor", title: "24-inch desktop monitor", price: 28500, city: "Gujranwala", condition: "USED", description: "An illustrative desktop monitor ad with a 24-inch display and an adjustable stand. Connection ports and exact specifications would belong in a real listing." },
    { slug: "home-projector", title: "Compact home projector", price: 32000, city: "Multan", condition: "NEW", description: "A fictional compact projector example showing an electronics title and price. Brightness, resolution and compatibility are not claims about an available product." },
  ],
  furniture: [
    { slug: "three-seat-sofa", title: "Three-seat fabric sofa", price: 58000, city: "Lahore", condition: "USED", description: "A sample living-room sofa listing with fabric upholstery and three seat cushions. The category photo does not depict a specific item offered for purchase." },
    { slug: "wooden-study-desk", title: "Wooden study desk with drawers", price: 22000, city: "Faisalabad", condition: "USED", description: "A fictional desk example with a flat work surface and two storage drawers. Dimensions and collection details would need to be supplied by a real seller." },
    { slug: "dining-table-set", title: "Four-seat dining table set", price: 46500, city: "Karachi", condition: "USED", description: "An illustrative dining-room listing describing a table and four chairs. The asking price and location are sample content for browsing the marketplace." },
    { slug: "bedside-table-pair", title: "Pair of bedside tables", price: 16000, city: "Sialkot", condition: "NEW", description: "A sample furniture listing for two compact bedside tables with lower shelves. This example represents a listing format rather than available inventory." },
  ],
  animals: [
    { slug: "cat-adoption-example", title: "Cat adoption listing example", price: 0, city: "Islamabad", condition: "USED", description: "A fictional pet adoption listing included to demonstrate the animals category. There is no real animal available for adoption, and no health or ownership claims are made." },
    { slug: "budgerigar-pair-example", title: "Budgerigar pair listing example", price: 6500, city: "Gujranwala", condition: "USED", description: "An illustrative bird listing showing how a pair of budgerigars might be described. The animals, example price and category photo do not represent a real offer." },
    { slug: "rabbit-listing-example", title: "Rabbit listing example", price: 4500, city: "Multan", condition: "USED", description: "A sample rabbit listing for demonstrating the marketplace layout. There is no live animal, seller contact, delivery offer or veterinary claim attached to it." },
    { slug: "aquarium-fish-example", title: "Freshwater aquarium fish example", price: 2500, city: "Quetta", condition: "USED", description: "A fictional aquarium-fish example with a sample city and price. Species, care needs and animal welfare details would require accurate information in a real listing." },
  ],
  fashion: [
    { slug: "cotton-kurta", title: "Cotton kurta — medium", price: 2800, city: "Peshawar", condition: "NEW", description: "A sample clothing listing describing a medium cotton kurta with long sleeves. The fashion photograph illustrates the category and not an exact garment for sale." },
    { slug: "casual-sneakers", title: "Everyday casual sneakers — size 42", price: 5500, city: "Rawalpindi", condition: "OPEN_BOX", description: "A fictional footwear example with a lace-up design and size 42 label. Sizing, materials and condition would need confirmation on an actual listing." },
    { slug: "canvas-shoulder-bag", title: "Canvas shoulder bag", price: 1950, city: "Lahore", condition: "NEW", description: "An illustrative accessory listing for a simple canvas bag with shoulder straps. The amount is a demonstration price and no stock is being offered." },
    { slug: "denim-jacket", title: "Classic denim jacket — large", price: 4200, city: "Quetta", condition: "USED", description: "A sample denim jacket listing with a button front and two chest pockets. This fictional example demonstrates how clothing condition can appear on an ad." },
  ],
  services: [
    { slug: "home-painting-example", title: "Interior painting service example", price: 15000, city: "Karachi", condition: "NEW", description: "An illustrative home-service listing for painting a small room. The amount is an example project price; no contractor, booking or service availability is represented." },
    { slug: "computer-setup-example", title: "Home computer setup service example", price: 3500, city: "Islamabad", condition: "NEW", description: "A fictional service listing for setting up a desktop computer and basic peripherals. The sample fee is illustrative and no technician can be contacted or booked." },
    { slug: "garden-care-example", title: "Small garden care service example", price: 5000, city: "Faisalabad", condition: "NEW", description: "A sample gardening-service ad describing a small lawn and plant-care visit. It has no real provider, scheduled visit or verified service history." },
    { slug: "maths-tutoring-example", title: "School maths tutoring service example", price: 8000, city: "Sialkot", condition: "NEW", description: "An illustrative tutoring listing with an example monthly fee for school maths support. No tutor, qualification, lesson slot or enrolment is being offered." },
  ],
};

const formatPrice = (price: number) => `PKR ${new Intl.NumberFormat("en-PK").format(price)}`;

const demoListings: MarketplaceListingCard[] = Array.from({ length: 4 }, (_, index) =>
  MARKETPLACE_CATEGORIES.map((category): MarketplaceListingCard => {
    const example = examples[category.slug][index];
    const slug = `demo-${category.slug}-${example.slug}`;
    return {
      id: slug,
      listingId: slug,
      title: example.title,
      price: formatPrice(example.price),
      image: `/demo/${category.slug}.webp`,
      category: category.name,
      location: example.city,
      badge: "DEMO",
      isDemo: true,
      description: example.description,
      contactNumber: null,
      createdAt: undefined,
      condition: example.condition,
    };
  }),
).flat();

function normalizeSearchText(text: string) {
  return text.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

export function getDemoListings(options?: {
  categorySlug?: string;
  city?: string;
  query?: string;
  limit?: number;
}): MarketplaceListingCard[] {
  const category = options?.categorySlug;
  if (category === "featured") return [];

  const city = options?.city?.normalize("NFKC").trim().toLowerCase();
  const query = normalizeSearchText(options?.query ?? "");
  const tokens = query ? query.split(" ") : [];
  const categoryName = MARKETPLACE_CATEGORIES.find((item) => item.slug === category)?.name;
  if (category && category !== "all" && !categoryName) return [];

  const matches = demoListings.filter((listing) => {
    if (categoryName && listing.category !== categoryName) return false;
    if (city && listing.location?.normalize("NFKC").toLowerCase() !== city) return false;
    const haystack = normalizeSearchText(
      `${listing.title} ${listing.description ?? ""} ${listing.location ?? ""} ${listing.category} ${listing.condition ?? ""} ${listingConditionLabel(listing.condition)}`,
    );
    return tokens.every((token) => haystack.includes(token));
  });

  const limit = options?.limit;
  return typeof limit === "number" && Number.isFinite(limit)
    ? matches.slice(0, Math.max(0, Math.trunc(limit)))
    : matches;
}

export function getDemoListingBySlug(slug: string): MarketplaceListingDetail | null {
  const listing = demoListings.find((item) => item.id === slug);
  if (!listing) return null;

  return {
    ...listing,
    description: `${DEMO_DISCLAIMER} ${listing.description ?? ""}`,
    images: [listing.image],
    conditionLabel: listingConditionLabel(listing.condition),
    postedDateLabel: "Demo listing",
    seller: { name: "Demo listing", phone: null, avatarUrl: null },
    details: [
      { label: "Listing type", value: "Demo — not for sale" },
      { label: "Category", value: listing.category },
      { label: "Example condition", value: listingConditionLabel(listing.condition) },
      { label: "Example price", value: listing.price },
      { label: "Example city", value: listing.location ?? "—" },
    ],
  };
}
