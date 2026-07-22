import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { storeItems } from "@/lib/catalog";

export default function CartPage() {
  const items = storeItems.slice(0, 2);
  return (
    <>
      <SiteHeader mode="store" />
      <main className="min-h-[70vh] bg-surface py-[42px]">
        <div className="mx-auto w-[calc(100%-32px)] max-w-[1180px] max-[760px]:w-[calc(100%-24px)]">
          <div className="mb-[18px] flex gap-2 text-xs text-muted">Official Store / Shopping Cart</div>
          <div className="mb-5 flex items-end justify-between gap-5"><div><h2 className="m-0 text-[clamp(22px,3vw,30px)] tracking-[-0.7px] text-navy">Your cart</h2><p className="mb-0 mt-1.5 text-sm text-muted">2 items reserved for checkout</p></div></div>
          <div className="grid grid-cols-[1fr_340px] gap-[22px] max-[760px]:grid-cols-1">
            <section className="rounded-2xl border border-line bg-white p-7">
              {items.map((item) => (
                <div className="grid grid-cols-[110px_1fr_auto] items-center gap-[18px] border-b border-line py-[18px] max-[760px]:grid-cols-[80px_1fr]" key={item.id}>
                  <img className="h-[90px] w-[110px] rounded-[9px] object-cover max-[760px]:h-[75px] max-[760px]:w-20" src={item.image} alt={item.title} />
                  <div><strong className="text-navy">{item.title}</strong><p className="text-xs text-muted">Black · Standard</p><span className="text-base font-black text-orange">{item.price}</span></div>
                  <div className="flex flex-wrap gap-[9px]"><button className="rounded-lg border border-line bg-white px-3.5 py-2.5 font-bold text-[#49576b]"><Minus size={13} /></button><button className="rounded-lg border border-line bg-white px-3.5 py-2.5 font-bold text-[#49576b]">1</button><button className="rounded-lg border border-line bg-white px-3.5 py-2.5 font-bold text-[#49576b]"><Plus size={13} /></button><button className="rounded-lg border border-line bg-white px-3.5 py-2.5 font-bold text-[#49576b]"><Trash2 size={13} /></button></div>
                </div>
              ))}
            </section>
            <aside className="self-start rounded-2xl border border-line bg-white p-7">
              <h3 className="mt-0 text-navy">Order summary</h3>
              <div className="flex justify-between py-[9px] text-[13px] text-muted"><span>Subtotal</span><strong>PKR 289,498</strong></div>
              <div className="flex justify-between py-[9px] text-[13px] text-muted"><span>Shipping</span><span>Calculated at checkout</span></div>
              <div className="mt-2.5 flex justify-between border-t border-line pt-3.5 text-lg font-black text-navy"><span>Total</span><span>PKR 289,498</span></div>
              <Link className="mt-[18px] flex items-center justify-center gap-2 rounded-[9px] border-0 bg-orange px-5 py-3.5 font-extrabold text-white transition duration-200 hover:-translate-y-px hover:bg-orange-dark" href="/store/checkout">Proceed to checkout</Link>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
