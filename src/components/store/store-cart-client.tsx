"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useStoreCart } from "@/providers/store-cart-provider";
import { formatStorePrice, SHIPPING_FEE_PKR } from "@/lib/store/types";

export function StoreCartClient() {
  const cart = useStoreCart();

  if (!cart.ready) {
    return <p className="text-sm text-muted">Loading cart…</p>;
  }

  if (!cart.items.length) {
    return (
      <div className="rounded-2xl border border-line bg-white p-10 text-center">
        <h2 className="mt-0 text-navy">Your cart is empty</h2>
        <p className="text-sm text-muted">Add products from the official store to continue.</p>
        <Link
          href="/store/category/all"
          className="mt-4 inline-flex rounded-[9px] bg-orange px-5 py-3 font-extrabold text-white"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[1fr_340px] gap-[22px] max-[760px]:grid-cols-1">
      <section className="rounded-2xl border border-line bg-white p-7">
        {cart.items.map((item) => (
          <div
            className="grid grid-cols-[110px_1fr_auto] items-center gap-[18px] border-b border-line py-[18px] max-[760px]:grid-cols-[80px_1fr]"
            key={item.variantId}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="h-[90px] w-[110px] rounded-[9px] object-cover max-[760px]:h-[75px] max-[760px]:w-20"
              src={item.image}
              alt={item.title}
            />
            <div>
              <Link href={`/store/product/${item.slug}`} className="font-bold text-navy hover:text-orange">
                {item.title}
              </Link>
              <p className="text-xs text-muted">Official Store</p>
              <span className="text-base font-black text-orange">
                {formatStorePrice(item.unitPrice)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-[9px]">
              <button
                type="button"
                className="rounded-lg border border-line bg-white px-3.5 py-2.5 font-bold text-[#49576b]"
                onClick={() => cart.setQuantity(item.variantId, item.quantity - 1)}
              >
                <Minus size={13} />
              </button>
              <span className="min-w-8 text-center text-sm font-bold">{item.quantity}</span>
              <button
                type="button"
                className="rounded-lg border border-line bg-white px-3.5 py-2.5 font-bold text-[#49576b]"
                onClick={() => cart.setQuantity(item.variantId, item.quantity + 1)}
              >
                <Plus size={13} />
              </button>
              <button
                type="button"
                className="rounded-lg border border-line bg-white px-3.5 py-2.5 font-bold text-[#b42318]"
                onClick={() => cart.removeItem(item.variantId)}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </section>
      <aside className="self-start rounded-2xl border border-line bg-white p-7">
        <h3 className="mt-0 text-navy">Order summary</h3>
        <div className="flex justify-between py-[9px] text-[13px] text-muted">
          <span>Subtotal ({cart.count} items)</span>
          <strong>{formatStorePrice(cart.subtotal)}</strong>
        </div>
        <div className="flex justify-between py-[9px] text-[13px] text-muted">
          <span>Shipping</span>
          <strong>{formatStorePrice(SHIPPING_FEE_PKR)}</strong>
        </div>
        <div className="mt-2.5 flex justify-between border-t border-line pt-3.5 text-lg font-black text-navy">
          <span>Total</span>
          <span>{formatStorePrice(cart.subtotal + SHIPPING_FEE_PKR)}</span>
        </div>
        <Link
          className="mt-[18px] flex items-center justify-center gap-2 rounded-[9px] border-0 bg-orange px-5 py-3.5 font-extrabold text-white transition duration-200 hover:-translate-y-px hover:bg-orange-dark"
          href="/store/checkout"
        >
          Proceed to checkout
        </Link>
      </aside>
    </div>
  );
}
