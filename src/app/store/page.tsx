import Link from "next/link";
import { ArrowRight, BadgeCheck, PackageCheck, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { CatalogCard } from "@/components/catalog-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { storeItems } from "@/lib/catalog";

const departments = [
  { title: "Clothing", subtitle: "Men, women & kids", slug: "clothing", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80" },
  { title: "Imported Mobiles", subtitle: "Apple, Samsung & Pixel", slug: "mobile-phones", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80" },
  { title: "Accessories", subtitle: "Power up your tech", slug: "accessories", image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=80" },
  { title: "Shoes", subtitle: "Everyday & sports", slug: "shoes", image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=80" },
];

export default function StoreHome() {
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
              <h1 className="my-[18px] mt-3 text-[clamp(38px,5vw,60px)] leading-none tracking-[-2.5px] text-navy">Quality products.<br /><span className="text-orange">Delivered to you.</span></h1>
              <p className="max-w-[530px] leading-[1.6] text-muted">Shop original imported mobiles, fashion, accessories and shoes—all backed by reliable delivery and dedicated customer support.</p>
              <Link className="inline-flex items-center gap-2 rounded-[9px] bg-orange px-5 py-3.5 font-extrabold text-white transition hover:-translate-y-px hover:bg-orange-dark" href="#featured">Shop new arrivals <ArrowRight size={17} /></Link>
            </div>
            <div className="store-art" aria-hidden="true">
              <div className="store-art-box main">
                <img src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=900&q=80" alt="" />
              </div>
              <div className="store-art-box small">
                <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80" alt="" />
              </div>
            </div>
          </div>
        </section>

        <div className="border-b border-line bg-white">
          <div className="mx-auto grid min-h-[72px] w-[min(1180px,calc(100%_-_32px))] grid-cols-4 max-[760px]:w-[min(100%_-_24px,1180px)] max-[760px]:grid-cols-2">
            <div className="flex items-center justify-center gap-2.5 border-r border-line text-[13px] font-bold text-[#3e4e64] max-[760px]:min-h-[58px] max-[760px]:border-b max-[760px]:text-[11px] [&_svg]:text-teal"><Truck size={20} /> Nationwide delivery</div>
            <div className="flex items-center justify-center gap-2.5 border-r border-line text-[13px] font-bold text-[#3e4e64] max-[760px]:min-h-[58px] max-[760px]:border-b max-[760px]:text-[11px] [&_svg]:text-teal"><ShieldCheck size={20} /> Secure checkout</div>
            <div className="flex items-center justify-center gap-2.5 border-r border-line text-[13px] font-bold text-[#3e4e64] max-[760px]:min-h-[58px] max-[760px]:border-b max-[760px]:text-[11px] [&_svg]:text-teal"><PackageCheck size={20} /> Genuine products</div>
            <div className="flex items-center justify-center gap-2.5 text-[13px] font-bold text-[#3e4e64] max-[760px]:min-h-[58px] max-[760px]:border-b max-[760px]:border-line max-[760px]:text-[11px] [&_svg]:text-teal"><RotateCcw size={20} /> Easy returns</div>
          </div>
        </div>

        <section className="py-[38px]">
          <div className="mx-auto w-[min(1180px,calc(100%_-_32px))] max-[760px]:w-[min(100%_-_24px,1180px)]">
            <div className="mb-5 flex items-end justify-between gap-5">
              <div><h2 className="m-0 text-[clamp(22px,3vw,30px)] tracking-[-0.7px] text-navy">Shop by department</h2><p className="mt-1.5 mb-0 text-sm text-muted">Everything you need, carefully selected</p></div>
              <Link className="text-sm font-extrabold whitespace-nowrap text-orange" href="/store/category/all">View all →</Link>
            </div>
            <div className="grid grid-cols-4 gap-[18px] max-[760px]:grid-cols-2">
              {departments.map((department) => (
                <Link className="group relative min-h-[235px] overflow-hidden rounded-2xl bg-[#ddd] max-[760px]:min-h-[190px]" href={`/store/category/${department.slug}`} key={department.slug}>
                  <img className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]" src={department.image} alt={department.title} />
                  <div className="absolute inset-0 flex flex-col justify-end bg-[linear-gradient(transparent_35%,#02152edb)] p-[22px] text-white">
                    <h3 className="mt-0 mb-1 text-[21px]">{department.title}</h3>
                    <span className="text-xs text-[#dce5ef]">{department.subtitle} →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface py-[38px]" id="featured">
          <div className="mx-auto w-[min(1180px,calc(100%_-_32px))] max-[760px]:w-[min(100%_-_24px,1180px)]">
            <div className="mb-5 flex items-end justify-between gap-5">
              <div><h2 className="m-0 text-[clamp(22px,3vw,30px)] tracking-[-0.7px] text-navy">Featured products</h2><p className="mt-1.5 mb-0 text-sm text-muted">Popular picks from our official collection</p></div>
              <Link className="text-sm font-extrabold whitespace-nowrap text-orange" href="/store/category/featured">Shop all →</Link>
            </div>
            <div className="grid grid-cols-4 gap-[18px] max-[1050px]:grid-cols-3 max-[760px]:grid-cols-2 max-[760px]:gap-2.5">
              {storeItems.slice(0, 4).map((item) => <CatalogCard item={item} store key={item.id} />)}
            </div>
          </div>
        </section>

        <section className="py-[38px]">
          <div className="mx-auto w-[min(1180px,calc(100%_-_32px))] max-[760px]:w-[min(100%_-_24px,1180px)]">
            <div className="mb-5 flex items-end justify-between gap-5">
              <div><h2 className="m-0 text-[clamp(22px,3vw,30px)] tracking-[-0.7px] text-navy">New arrivals</h2><p className="mt-1.5 mb-0 text-sm text-muted">Just landed at X Marketplace</p></div>
              <Link className="text-sm font-extrabold whitespace-nowrap text-orange" href="/store/category/new-arrivals">See new arrivals →</Link>
            </div>
            <div className="grid grid-cols-4 gap-[18px] max-[1050px]:grid-cols-3 max-[760px]:grid-cols-2 max-[760px]:gap-2.5">
              {storeItems.slice(4).map((item) => <CatalogCard item={item} store key={item.id} />)}
            </div>
          </div>
        </section>

        <section className="mx-auto mb-[42px] flex min-h-[132px] w-[min(1180px,calc(100%_-_32px))] items-center justify-between gap-7 rounded-[18px] bg-[linear-gradient(110deg,#003049,#07587b)] px-[34px] py-7 text-white shadow-[0_16px_36px_#0030492b] max-[760px]:mb-[26px] max-[760px]:w-[min(100%_-_24px,1180px)] max-[760px]:flex-col max-[760px]:items-start max-[760px]:px-[22px] max-[760px]:py-[26px]">
          <div><h2 className="mt-0 mb-[7px] text-[clamp(22px,3vw,30px)] text-white">Style, tech and more—at better prices.</h2><p className="m-0 text-[13px] text-[#d5e7ec]">Join our newsletter for launches, offers and members-only deals.</p></div>
          <Link className="shrink-0 rounded-[9px] bg-orange px-[17px] py-3 text-xs font-extrabold whitespace-nowrap text-white shadow-[0_5px_14px_#ff4d1230] transition hover:-translate-y-px hover:bg-orange-dark" href="/signup">Create your account →</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
