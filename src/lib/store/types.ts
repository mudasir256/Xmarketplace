export type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imagePath: string | null;
  displayOrder: number;
};

export type StoreProductCard = {
  id: string;
  slug: string;
  title: string;
  price: string;
  oldPrice?: string;
  priceValue: number;
  compareAtValue: number | null;
  image: string;
  images: string[];
  category: string;
  categorySlug: string;
  badge?: string;
  location?: string;
  shortDescription: string | null;
  description: string | null;
  stockQuantity: number;
  stockKnown: boolean;
  variantId: string | null;
  isFeatured: boolean;
  isNewArrival: boolean;
};

export type CartLine = {
  productId: string;
  variantId: string;
  slug: string;
  title: string;
  image: string;
  unitPrice: number;
  quantity: number;
};

export const STORE_CART_KEY = "xm-store-cart-v3";
export const SHIPPING_FEE_PKR = 350;

export function formatStorePrice(amount: number) {
  return `PKR ${Math.round(amount).toLocaleString("en-PK")}`;
}
