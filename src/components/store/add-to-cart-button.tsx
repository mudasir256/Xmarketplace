"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useStoreCart } from "@/providers/store-cart-provider";

export function AddToCartButton({
  productId,
  variantId,
  slug,
  title,
  image,
  unitPrice,
  maxQuantity = 99,
}: {
  productId: string;
  variantId: string;
  slug: string;
  title: string;
  image: string;
  unitPrice: number;
  maxQuantity?: number;
}) {
  const cart = useStoreCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [locked, setLocked] = useState(false);
  const lockRef = useRef(false);

  const max = Math.max(1, Math.min(99, Math.floor(maxQuantity || 99)));
  const outOfStock = maxQuantity <= 0;

  function changeQty(next: number) {
    setQuantity(Math.min(max, Math.max(1, next)));
  }

  function onAdd() {
    if (outOfStock || lockRef.current) return false;
    lockRef.current = true;
    setLocked(true);

    cart.addItem(
      {
        productId,
        variantId,
        slug,
        title,
        image,
        unitPrice,
      },
      quantity,
    );
    setAdded(true);
    window.setTimeout(() => {
      lockRef.current = false;
      setLocked(false);
      setAdded(false);
    }, 900);
    return true;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-extrabold tracking-wide text-[#526177] uppercase">
          Quantity
        </span>
        <div className="inline-flex items-center rounded-lg border border-line bg-[#f7f9fc]">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={outOfStock || quantity <= 1 || locked}
            onClick={() => changeQty(quantity - 1)}
            className="grid h-10 w-10 place-items-center text-navy disabled:opacity-40"
          >
            <Minus size={16} />
          </button>
          <span className="min-w-10 text-center text-sm font-black text-navy">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={outOfStock || quantity >= max || locked}
            onClick={() => changeQty(quantity + 1)}
            className="grid h-10 w-10 place-items-center text-navy disabled:opacity-40"
          >
            <Plus size={16} />
          </button>
        </div>
        <span className="text-sm text-muted">
          {outOfStock ? (
            <strong className="text-[#b42318]">Out of stock</strong>
          ) : (
            <>
              <strong className="text-navy">{maxQuantity}</strong> available
            </>
          )}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onAdd}
          disabled={locked || outOfStock}
          className="inline-flex items-center justify-center gap-2 rounded-[9px] border-0 bg-orange px-5 py-3.5 font-extrabold text-white transition hover:-translate-y-px hover:bg-orange-dark disabled:opacity-70"
        >
          <ShoppingCart size={18} />
          {added ? "Added!" : "Add to cart"}
        </button>
        <button
          type="button"
          disabled={locked || outOfStock}
          onClick={() => {
            onAdd();
            router.push("/store/cart");
          }}
          className="inline-flex items-center justify-center gap-2 rounded-[9px] border border-navy bg-white px-[18px] py-[13px] font-extrabold text-navy disabled:opacity-70"
        >
          Buy now
        </button>
      </div>
    </div>
  );
}
