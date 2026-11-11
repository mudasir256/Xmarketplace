import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Clock3,
  FileText,
  ListChecks,
  MapPin,
  Share2,
  ShieldAlert,
} from "lucide-react";
import { FavoriteButton } from "@/components/favorite-button";
import { ListingGallery } from "@/components/listing-gallery";
import { ListingSellerPanel } from "@/components/listing-seller-panel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getFavoriteListingIds } from "@/lib/favorites";
import { getMarketplaceListingBySlug } from "@/lib/listings";
import { getDemoListingBySlug } from "@/lib/demo-listings";

export async function generateMetadata({ params }: { params: Promise<{ listingSlug: string }> }): Promise<Metadata> {
  const demo = getDemoListingBySlug((await params).listingSlug);
  return demo ? { title: `${demo.title} (Demo)`, robots: { index: false, follow: true } } : {};
}

export default async function ListingPage({ params }: { params: Promise<{ listingSlug: string }> }) {
  const { listingSlug } = await params;
  const listing = await getMarketplaceListingBySlug(listingSlug);
  if (!listing) notFound();

  const favoriteIds = listing.isDemo ? [] : await getFavoriteListingIds();
  const isFavorited = favoriteIds.includes(listing.listingId);

  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] bg-surface">
        <div className="mx-auto w-[min(1180px,calc(100%_-_32px))] py-5 max-[760px]:w-[min(100%_-_24px,1180px)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <Link href="/" className="font-bold text-navy hover:text-orange">
                Marketplace
              </Link>
              <span>/</span>
              <span>{listing.category}</span>
              <span>/</span>
              <strong className="text-navy">{listing.title}</strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Share listing"
                className="grid size-10 place-items-center rounded-full border border-line bg-white text-navy"
              >
                <Share2 size={17} />
              </button>
              {!listing.isDemo ? (
                <FavoriteButton
                  listingId={listing.listingId}
                  initialFavorited={isFavorited}
                  iconSize={17}
                  className="grid size-10 place-items-center rounded-full border border-line bg-white text-navy disabled:opacity-70"
                />
              ) : null}
            </div>
          </div>

          {listing.isDemo ? (
            <div className="mb-5 rounded-2xl border border-[#ffd7b8] bg-[#fff8f1] px-5 py-4 text-sm text-navy">
              <p className="m-0 font-extrabold">Demo listing — not for sale.</p>
              <p className="mb-0 mt-1 leading-relaxed text-[#5b4635]">
                This fictional example shows how marketplace ads look. The item and price are illustrative; no seller is offering it for sale.
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-[1.35fr_0.75fr] items-start gap-5 max-[960px]:grid-cols-1">
            <div className="grid gap-4">
              <ListingGallery images={listing.images} title={listing.title} />

              <section className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_24px_#04182f0a]">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-[#fff1ec] px-3 py-1 text-[11px] font-black tracking-[0.8px] text-orange uppercase">
                    {listing.isDemo ? "DEMO" : listing.badge ?? "Fresh listing"}
                  </span>
                  <span className="inline-flex rounded-full bg-[#eef6ff] px-3 py-1 text-[11px] font-black tracking-[0.8px] text-[#1d4f79] uppercase">
                    {listing.conditionLabel}
                  </span>
                </div>
                <p className="m-0 text-[32px] font-black leading-none text-orange max-[760px]:text-[26px]">{listing.price}</p>
                <h1 className="mt-3 mb-3 text-[28px] leading-[1.2] font-extrabold capitalize text-navy max-[760px]:text-[22px]">
                  {listing.title}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3f6f9] px-3 py-1.5 text-xs font-bold text-[#526177]">
                    <MapPin size={13} /> {listing.location || "Pakistan"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3f6f9] px-3 py-1.5 text-xs font-bold text-[#526177]">
                    <Clock3 size={13} /> {listing.isDemo ? "Sample ad" : listing.postedDateLabel}
                  </span>
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_24px_#04182f0a]">
                <div className="flex items-center gap-2 border-b border-line px-5 py-3.5 text-sm font-extrabold text-navy">
                  <ListChecks size={16} className="text-[#3b82f6]" /> Product Details
                </div>
                <dl className="m-0">
                  {listing.details.map((detail, index) => (
                    <div
                      key={detail.label}
                      className={`grid grid-cols-2 gap-3 px-5 py-2.5 text-sm ${
                        index % 2 === 0 ? "bg-white" : "bg-[#f7f9fb]"
                      }`}
                    >
                      <dt className="m-0 text-muted">{detail.label}</dt>
                      <dd className="m-0 text-right font-extrabold text-navy">{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_24px_#04182f0a]">
                <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-navy">
                  <span className="grid size-7 place-items-center rounded-full bg-[#efe7ff] text-[#7c3aed]">
                    <FileText size={14} />
                  </span>
                  Description
                </div>
                <p className="m-0 whitespace-pre-wrap text-sm leading-[1.75] text-[#445366]">
                  {listing.description || "No description provided."}
                </p>
              </section>

              <section className="rounded-2xl border border-[#ffd7b8] bg-[#fff8f1] p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-navy">
                  <ShieldAlert size={16} className="text-orange" /> Safety Tips
                </div>
                <ol className="m-0 list-decimal space-y-2 pl-5 text-sm leading-[1.6] text-[#5b4635]">
                  <li>
                    <strong>Meet in public places</strong>
                    <div className="text-[#7a6552]">عوامی جگہوں پر ملیں</div>
                  </li>
                  <li>
                    <strong>Check the item before payment</strong>
                    <div className="text-[#7a6552]">ادائیگی سے پہلے چیز چیک کریں</div>
                  </li>
                  <li>
                    <strong>Don&apos;t send money in advance</strong>
                    <div className="text-[#7a6552]">پیشگی رقم نہ بھیجیں</div>
                  </li>
                </ol>
              </section>
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              {listing.isDemo ? (
                <aside className="rounded-[18px] border border-line bg-white p-5 shadow-[0_8px_24px_#04182f0d]">
                  <h2 className="mb-3 mt-0 text-lg font-extrabold text-navy">Explore a demo ad</h2>
                  <p className="m-0 text-sm leading-relaxed text-muted">
                    This sample has no seller or contact details. To sell an item you own, create a real marketplace ad with your own photos and information.
                  </p>
                  <Link
                    href="/post-ad"
                    className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-orange px-4 py-3 text-sm font-extrabold text-white"
                  >
                    Post a real ad
                  </Link>
                </aside>
              ) : (
                <ListingSellerPanel
                  sellerName={listing.seller.name}
                  phone={listing.seller.phone}
                  avatarUrl={listing.seller.avatarUrl}
                  listingSlug={listing.id}
                  listingTitle={listing.title}
                  listingImage={listing.images[0] || listing.image}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
