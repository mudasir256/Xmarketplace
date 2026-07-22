import { notFound } from "next/navigation";
import { Flag, Heart, MapPin, MessageCircle, Phone, ShieldAlert } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { marketplaceItems } from "@/lib/catalog";

export default async function ListingPage({ params }: { params: Promise<{ listingSlug: string }> }) {
  const { listingSlug } = await params;
  const listing = marketplaceItems.find((item) => item.id === listingSlug);
  if (!listing) notFound();

  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] bg-surface py-[42px]">
        <div className="mx-auto w-[min(1180px,calc(100%_-_32px))] max-[760px]:w-[min(100%_-_24px,1180px)]">
          <div className="mb-[18px] flex gap-2 text-xs text-muted"><span>Marketplace</span><span>/</span><span>{listing.category}</span><span>/</span><strong>{listing.title}</strong></div>
          <div className="grid grid-cols-[1.05fr_0.95fr] gap-[42px] rounded-2xl border border-line bg-white p-7 max-[760px]:grid-cols-1">
            <div className="min-h-[480px] overflow-hidden rounded-2xl bg-[#eef2f6] max-[760px]:min-h-[330px]">
              <img className="h-full min-h-[480px] w-full object-cover max-[760px]:min-h-[330px]" src={listing.image} alt={listing.title} />
            </div>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#fff1ec] px-3 py-[7px] text-[11px] font-black tracking-[1.2px] text-[#e23b06] uppercase">{listing.badge ?? "FRESH LISTING"}</span>
              <h1 className="mt-2 mb-3.5 text-[34px] leading-[1.15] text-navy max-[760px]:text-[27px]">{listing.title}</h1>
              <span className="text-[28px] font-black text-orange">{listing.price}</span>
              <div className="mt-3 flex items-center gap-[5px] pt-1.5 text-[13px] text-muted"><MapPin size={15} /> {listing.location}</div>
              <p className="my-[18px] text-sm leading-[1.7] text-muted">Well maintained and available for serious buyers. Contact the seller directly through X Marketplace for more details, inspection, and price discussion.</p>
              <div className="mt-6 grid grid-cols-2 gap-2.5">
                <button className="inline-flex items-center justify-center gap-2 rounded-[9px] border-0 bg-orange px-5 py-3.5 font-extrabold text-white transition hover:-translate-y-px hover:bg-orange-dark"><Phone size={18} /> Show phone</button>
                <button className="inline-flex items-center justify-center gap-2 rounded-[9px] border border-navy bg-white px-[18px] py-[13px] font-extrabold text-navy"><MessageCircle size={18} /> Chat with seller</button>
              </div>
              <button className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-[9px] border border-navy bg-white px-[18px] py-[13px] font-extrabold text-navy"><Heart size={18} /> Save listing</button>
              <div className="mt-6 border-t border-line">
                <div className="flex items-center gap-2.5 border-b border-line py-[13px] text-[13px] text-[#56657a]"><ShieldAlert size={18} /> Meet in a safe public place and inspect before paying</div>
                <div className="flex items-center gap-2.5 border-b border-line py-[13px] text-[13px] text-[#56657a]"><Flag size={18} /> Report suspicious or misleading listings</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
