import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  formatStorePrice,
  type StoreCategory,
  type StoreProductCard,
} from "@/lib/store/types";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=900&q=80";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  base_price: number | string;
  compare_at_price: number | string | null;
  short_description: string | null;
  description: string | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  product_status: string;
  store_categories:
    | { name: string; slug: string; image_path: string | null }
    | { name: string; slug: string; image_path: string | null }[]
    | null;
  store_product_images:
    | { storage_path: string; is_primary: boolean; display_order: number }[]
    | null;
  store_product_variants:
    | {
        id: string;
        is_active: boolean;
        price: number | string | null;
        inventory_levels?:
          | { quantity: number; reserved_quantity: number }[]
          | null;
      }[]
    | null;
};

function categoryOf(row: ProductRow) {
  const cat = Array.isArray(row.store_categories)
    ? row.store_categories[0]
    : row.store_categories;
  return cat ?? { name: "Store", slug: "all", image_path: null };
}

function imagesOf(row: ProductRow) {
  const images = [...(row.store_product_images ?? [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.display_order - b.display_order;
  });
  const paths = images.map((img) => img.storage_path).filter(Boolean);
  return paths.length ? paths : [PLACEHOLDER];
}

function variantOf(row: ProductRow) {
  const variants = (row.store_product_variants ?? []).filter((v) => v.is_active);
  return variants[0] ?? null;
}

function stockOf(
  variant: {
    inventory_levels?: { quantity: number; reserved_quantity: number }[] | null;
  } | null,
): { known: boolean; available: number } {
  if (!variant) return { known: false, available: 0 };
  const levels = variant.inventory_levels ?? [];
  if (!levels.length) return { known: false, available: 99 };
  const available = levels.reduce((sum, level) => {
    const qty = Number(level.quantity || 0) - Number(level.reserved_quantity || 0);
    return sum + Math.max(0, qty);
  }, 0);
  return { known: true, available };
}

function mapProduct(row: ProductRow): StoreProductCard {
  const category = categoryOf(row);
  const variant = variantOf(row);
  const gallery = imagesOf(row);
  const stock = stockOf(variant);
  const priceValue = Number(variant?.price ?? row.base_price ?? 0);
  const compareAtValue =
    row.compare_at_price != null ? Number(row.compare_at_price) : null;
  let badge: string | undefined;
  if (row.is_new_arrival) badge = "NEW";
  else if (row.is_featured) badge = "FEATURED";
  else if (compareAtValue != null && compareAtValue > priceValue) badge = "SALE";

  return {
    id: row.slug,
    slug: row.slug,
    title: row.name,
    price: formatStorePrice(priceValue),
    oldPrice:
      compareAtValue != null && compareAtValue > priceValue
        ? formatStorePrice(compareAtValue)
        : undefined,
    priceValue,
    compareAtValue,
    image: gallery[0],
    images: gallery,
    category: category.name,
    categorySlug: category.slug,
    badge,
    location: "Delivery across Pakistan",
    shortDescription: row.short_description,
    description: row.description,
    stockQuantity: stock.available,
    stockKnown: stock.known,
    variantId: variant?.id ?? null,
    isFeatured: row.is_featured,
    isNewArrival: row.is_new_arrival,
  };
}

const productSelect = `
  id, slug, name, base_price, compare_at_price, short_description, description,
  is_featured, is_new_arrival, product_status,
  store_categories(name, slug, image_path),
  store_product_images(storage_path, is_primary, display_order),
  store_product_variants(
    id, is_active, price,
    inventory_levels(quantity, reserved_quantity)
  )
`;

export async function listStoreCategories(): Promise<StoreCategory[]> {
  const admin = createAdminClient() as ReturnType<typeof createAdminClient> & {
    from: (table: string) => any;
  };
  const { data, error } = await admin
    .from("store_categories")
    .select("id, name, slug, description, image_path, display_order, is_active")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_path: string | null;
    display_order: number;
  }>)
    .filter((row) => !["sale", "new-arrivals", "featured", "all"].includes(row.slug))
    .map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      imagePath: row.image_path,
      displayOrder: row.display_order,
    }));
}

export async function listActiveStoreProducts(options?: {
  categorySlug?: string;
  featured?: boolean;
  newArrival?: boolean;
  limit?: number;
}): Promise<StoreProductCard[]> {
  const admin = createAdminClient() as any;
  let query = admin
    .from("store_products")
    .select(productSelect)
    .eq("product_status", "ACTIVE")
    .order("updated_at", { ascending: false });

  if (options?.featured) query = query.eq("is_featured", true);
  if (options?.newArrival) query = query.eq("is_new_arrival", true);
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let products = ((data ?? []) as ProductRow[]).map(mapProduct);

  if (options?.categorySlug && options.categorySlug !== "all") {
    const slug = options.categorySlug;
    if (slug === "featured") products = products.filter((p) => p.isFeatured);
    else if (slug === "new-arrivals") products = products.filter((p) => p.isNewArrival);
    else if (slug === "sale") {
      products = products.filter(
        (p) => p.compareAtValue != null && p.compareAtValue > p.priceValue,
      );
    } else if (slug === "mobile-phones" || slug === "imported-mobiles") {
      products = products.filter(
        (p) =>
          p.categorySlug === "mobile-phones" ||
          p.categorySlug === "imported-mobiles",
      );
    } else {
      products = products.filter((p) => p.categorySlug === slug);
    }
  }

  return products;
}

export async function getStoreProductBySlug(slug: string) {
  const admin = createAdminClient() as any;
  const { data, error } = await admin
    .from("store_products")
    .select(productSelect)
    .eq("slug", slug)
    .eq("product_status", "ACTIVE")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const card = mapProduct(data as ProductRow);
  return {
    ...card,
    productUuid: (data as ProductRow & { id: string }).id,
  };
}

export async function getStoreProductForCart(productUuid: string, variantId?: string | null) {
  const admin = createAdminClient() as any;
  const { data, error } = await admin
    .from("store_products")
    .select(productSelect)
    .eq("id", productUuid)
    .eq("product_status", "ACTIVE")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as ProductRow;
  const card = mapProduct(row);
  const variants = (row.store_product_variants ?? []).filter((v) => v.is_active);
  const variant =
    (variantId ? variants.find((v) => v.id === variantId) : null) ?? variants[0] ?? null;

  return {
    productId: row.id,
    variantId: variant?.id ?? null,
    slug: card.slug,
    title: card.title,
    image: card.image,
    unitPrice: Number(variant?.price ?? row.base_price ?? 0),
  };
}
