import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StoreCartClient } from "@/components/store/store-cart-client";

export default function CartPage() {
  return (
    <>
      <SiteHeader mode="store" />
      <main className="min-h-[70vh] bg-surface py-[42px]">
        <div className="mx-auto w-[calc(100%-32px)] max-w-[1180px] max-[760px]:w-[calc(100%-24px)]">
          <div className="mb-[18px] flex gap-2 text-xs text-muted">
            Official Store / Shopping Cart
          </div>
          <div className="mb-5">
            <h2 className="m-0 text-[clamp(22px,3vw,30px)] tracking-[-0.7px] text-navy">
              Your cart
            </h2>
            <p className="mb-0 mt-1.5 text-sm text-muted">
              Review items before checkout
            </p>
          </div>
          <StoreCartClient />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
