import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, BadgeCheck, PackageCheck, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { StoreCatalogSections } from "@/components/store/store-catalog-sections";
import { CatalogGridSkeleton, Skeleton } from "@/components/skeletons/skeleton";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

function StoreCatalogFallback() {
  return (
    <section className="bg-surface py-[38px]">
      <div className="mx-auto w-[min(1180px,calc(100%_-_32px))] space-y-8 max-[760px]:w-[min(100%_-_24px,1180px)]">
        <div className="grid grid-cols-4 gap-4 max-[760px]:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-40 rounded-2xl" />
          ))}
        </div>
        <CatalogGridSkeleton count={8} />
      </div>
    </section>
  );
}

export default async function StoreHome() {
  return (
    <>
      <SiteHeader mode="store" />
      <main>
        <section className="bg-[#fff5f0]">
          <div className="mx-auto grid min-h-[380px] w-[min(1180px,calc(100%_-_32px))] grid-cols-2 items-center overflow-hidden max-[760px]:w-[min(100%_-_24px,1180px)] max-[760px]:grid-cols-1">
            <div className="max-[760px]:pt-12 max-[760px]:pb-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#ff4d1230] bg-[#ff4d1210] px-3 py-[7px] text-[11px] font-black tracking-[1.2px] text-[#e23b06] uppercase">
                <BadgeCheck size={14} /> X Marketplace Official Store
              </span>
              <h1 className="my-[18px] mt-3 text-[clamp(38px,5vw,60px)] leading-none tracking-[-2.5px] text-navy">
                Quality products.
                <br />
                <span className="text-orange">Delivered to you.</span>
              </h1>
              <p className="max-w-[530px] leading-[1.6] text-muted">
                Shop products added from the X Market Admin — genuine stock with nationwide delivery.
              </p>
              <Link
                className="inline-flex items-center gap-2 rounded-[9px] bg-orange px-5 py-3.5 font-extrabold text-white transition hover:-translate-y-px hover:bg-orange-dark"
                href="#featured"
              >
                Shop products <ArrowRight size={17} />
              </Link>
            </div>
            <div className="store-art" aria-hidden="true">
              <div className="store-art-box main">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=900&q=80"
                  alt=""
                />
              </div>
              <div className="store-art-box small">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80"
                  alt=""
                />
              </div>
            </div>
          </div>
        </section>

        <div className="border-b border-line bg-white">
          <div className="mx-auto grid min-h-[72px] w-[min(1180px,calc(100%_-_32px))] grid-cols-4 max-[760px]:w-[min(100%_-_24px,1180px)] max-[760px]:grid-cols-2">
            <div className="flex items-center justify-center gap-2.5 border-r border-line text-[13px] font-bold text-[#3e4e64] max-[760px]:min-h-[58px] max-[760px]:border-b max-[760px]:text-[11px] [&_svg]:text-teal">
              <Truck size={20} /> Nationwide delivery
            </div>
            <div className="flex items-center justify-center gap-2.5 border-r border-line text-[13px] font-bold text-[#3e4e64] max-[760px]:min-h-[58px] max-[760px]:border-b max-[760px]:text-[11px] [&_svg]:text-teal">
              <ShieldCheck size={20} /> Secure checkout
            </div>
            <div className="flex items-center justify-center gap-2.5 border-r border-line text-[13px] font-bold text-[#3e4e64] max-[760px]:min-h-[58px] max-[760px]:border-b max-[760px]:text-[11px] [&_svg]:text-teal">
              <PackageCheck size={20} /> Genuine products
            </div>
            <div className="flex items-center justify-center gap-2.5 text-[13px] font-bold text-[#3e4e64] max-[760px]:min-h-[58px] max-[760px]:border-b max-[760px]:border-line max-[760px]:text-[11px] [&_svg]:text-teal">
              <RotateCcw size={20} /> Easy returns
            </div>
          </div>
        </div>

        <Suspense fallback={<StoreCatalogFallback />}>
          <StoreCatalogSections />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
