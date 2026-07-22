export type CatalogItem = {
  id: string;
  title: string;
  price: string;
  oldPrice?: string;
  image: string;
  category: string;
  location?: string;
  badge?: string;
};

export const storeItems: CatalogItem[] = [
  {
    id: "pixel-9-pro",
    title: "Google Pixel 9 Pro 256GB",
    price: "PKR 284,999",
    oldPrice: "PKR 309,999",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80",
    category: "Imported Mobiles",
    badge: "NEW",
  },
  {
    id: "premium-overshirt",
    title: "Men's Premium Textured Overshirt",
    price: "PKR 4,499",
    oldPrice: "PKR 5,999",
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80",
    category: "Clothing",
    badge: "25% OFF",
  },
  {
    id: "wireless-earbuds",
    title: "Pro Wireless Earbuds with ANC",
    price: "PKR 8,499",
    oldPrice: "PKR 10,999",
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80",
    category: "Accessories",
    badge: "BESTSELLER",
  },
  {
    id: "running-shoes",
    title: "Lightweight Performance Running Shoes",
    price: "PKR 7,999",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    category: "Shoes",
    badge: "NEW",
  },
  {
    id: "iphone-16",
    title: "Apple iPhone 16 128GB",
    price: "PKR 249,999",
    image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&w=900&q=80",
    category: "Imported Mobiles",
  },
  {
    id: "power-bank",
    title: "20,000mAh Fast Charging Power Bank",
    price: "PKR 5,499",
    oldPrice: "PKR 6,499",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    category: "Accessories",
    badge: "SALE",
  },
  {
    id: "women-sneakers",
    title: "Women's Everyday Comfort Sneakers",
    price: "PKR 6,299",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80",
    category: "Shoes",
  },
  {
    id: "linen-shirt",
    title: "Classic Linen Shirt — Summer Edit",
    price: "PKR 3,299",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
    category: "Clothing",
  },
];
