import { notFound } from "next/navigation";
import { Heart, PackageCheck, RotateCcw, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { storeItems } from "@/lib/catalog";

export default async function StoreProductPage({ params }: { params: Promise<{ productSlug: string }> }) {
  const { productSlug } = await params;
  const product = storeItems.find((item) => item.id === productSlug);
  if (!product) notFound();

  return (
    <>
      <SiteHeader mode="store" />
      <main className="min-h-[70vh] bg-surface py-[42px]">
        <div className="mx-auto w-[min(1180px,calc(100%_-_32px))] max-[760px]:w-[min(100%_-_24px,1180px)]">
          <div className="mb-[18px] flex gap-2 text-xs text-muted"><span>Store</span><span>/</span><span>{product.category}</span><span>/</span><strong>{product.title}</strong></div>
          <div className="grid grid-cols-[1.05fr_0.95fr] gap-[42px] rounded-2xl border border-line bg-white p-7 max-[760px]:grid-cols-1">
            <div className="min-h-[480px] overflow-hidden rounded-2xl bg-[#eef2f6] max-[760px]:min-h-[330px]">
              <img className="h-full min-h-[480px] w-full object-cover max-[760px]:min-h-[330px]" src={product.image} alt={product.title} />
            </div>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#e9f8fa] px-3 py-[7px] text-[11px] font-black tracking-[1.2px] text-[#078a95] uppercase"><PackageCheck size={14} /> Official Store</span>
              <h1 className="mt-2 mb-3.5 text-[34px] leading-[1.15] text-navy max-[760px]:text-[27px]">{product.title}</h1>
              <div>
                <span className="text-[28px] font-black text-orange">{product.price}</span>
                {product.oldPrice && <span className="ml-[7px] text-xs font-medium text-[#96a0ae] line-through">{product.oldPrice}</span>}
              </div>
              <p className="my-[18px] text-sm leading-[1.7] text-muted">Original product sourced by X Marketplace. Carefully inspected, securely packed, and available for delivery across Pakistan.</p>
              <span className="mt-[18px] mb-[9px] block text-xs font-black tracking-[0.6px] text-navy uppercase">Choose color</span>
              <div className="flex flex-wrap gap-[9px]">
                <button className="rounded-lg border border-orange bg-[#fff5f1] px-3.5 py-2.5 font-bold text-orange">Black</button>
                <button className="rounded-lg border border-line bg-white px-3.5 py-2.5 font-bold text-[#49576b]">White</button>
                <button className="rounded-lg border border-line bg-white px-3.5 py-2.5 font-bold text-[#49576b]">Blue</button>
              </div>
              <span className="mt-[18px] mb-[9px] block text-xs font-black tracking-[0.6px] text-navy uppercase">Choose variant</span>
              <div className="flex flex-wrap gap-[9px]">
                <button className="rounded-lg border border-orange bg-[#fff5f1] px-3.5 py-2.5 font-bold text-orange">Standard</button>
                <button className="rounded-lg border border-line bg-white px-3.5 py-2.5 font-bold text-[#49576b]">Premium</button>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-2.5">
                <button className="inline-flex items-center justify-center gap-2 rounded-[9px] border-0 bg-orange px-5 py-3.5 font-extrabold text-white transition hover:-translate-y-px hover:bg-orange-dark"><ShoppingCart size={18} /> Add to cart</button>
                <button className="inline-flex items-center justify-center gap-2 rounded-[9px] border border-navy bg-white px-[18px] py-[13px] font-extrabold text-navy"><Heart size={18} /> Wishlist</button>
              </div>
              <div className="mt-6 border-t border-line">
                <div className="flex items-center gap-2.5 border-b border-line py-[13px] text-[13px] text-[#56657a]"><Truck size={18} /> Nationwide delivery in 2–5 working days</div>
                <div className="flex items-center gap-2.5 border-b border-line py-[13px] text-[13px] text-[#56657a]"><ShieldCheck size={18} /> Authenticity and secure checkout guaranteed</div>
                <div className="flex items-center gap-2.5 border-b border-line py-[13px] text-[13px] text-[#56657a]"><RotateCcw size={18} /> 7-day return policy on eligible items</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
