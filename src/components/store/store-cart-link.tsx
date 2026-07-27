"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useStoreCart } from "@/providers/store-cart-provider";

export function StoreCartLink() {
  const { count } = useStoreCart();

  return (
    <Link
      className="relative grid h-10 w-[34px] place-items-center rounded-lg text-[#17283c] hover:bg-[#e7edf3]"
      href="/store/cart"
      aria-label={count ? `Cart, ${count} items` : "Cart"}
    >
      <ShoppingCart size={19} />
      {count > 0 ? (
        <b className="absolute -top-1.5 right-0 grid min-w-[17px] place-items-center rounded-full bg-brand-orange px-1 text-[9px] font-extrabold text-white">
          {count > 99 ? "99+" : count}
        </b>
      ) : null}
    </Link>
  );
}
