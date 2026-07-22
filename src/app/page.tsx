import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, Box, LayoutGrid, Star,
} from "lucide-react";
import { AdSlider } from "@/components/ad-slider";
import { CatalogCard } from "@/components/catalog-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMarketplaceListings } from "@/lib/listings";
import animalsImage from "@/images/animals.png";
import bikeImage from "@/images/Bike.png";
import vehicleImage from "@/images/car-new.png";
import electronicsImage from "@/images/electronics.png";
import fashionImage from "@/images/Fashion.png";
import furnitureImage from "@/images/furniture.png";
import mobilesImage from "@/images/mobiles.png";
import propertyRentImage from "@/images/PropertyforRent.png";
import propertySaleImage from "@/images/PropertyforSale.png";
import servicesImage from "@/images/services.png";
import mobileScreenImage from "@/images/mobilescreen.png";

const categories = [
  { name: "Vehicles", image: vehicleImage, slug: "vehicles" },
  { name: "Bikes", image: bikeImage, slug: "bikes" },
  { name: "Property Sale", image: propertySaleImage, slug: "property-sale" },
  { name: "Property Rent", image: propertyRentImage, slug: "property-rent" },
  { name: "Mobiles", image: mobilesImage, slug: "mobiles" },
  { name: "Electronics", image: electronicsImage, slug: "electronics" },
  { name: "Furniture", image: furnitureImage, slug: "furniture" },
  { name: "Animals", image: animalsImage, slug: "animals" },
  { name: "Fashion", image: fashionImage, slug: "fashion" },
  { name: "Services", image: servicesImage, slug: "services" },
];

const popularCities = ["Rawalpindi", "Islamabad", "Lahore", "Faisalabad"];

const listingSections = [
  { title: "Vehicles", slug: "vehicles" },
  { title: "Bikes", slug: "bikes" },
  { title: "Property Sale", slug: "property-sale" },
  { title: "Property Rent", slug: "property-rent" },
  { title: "Mobiles", slug: "mobiles" },
  { title: "Electronics", slug: "electronics" },
  { title: "Furniture", slug: "furniture" },
  { title: "Animals", slug: "animals" },
  { title: "Fashion", slug: "fashion" },
  { title: "Services", slug: "services" },
];

export default async function MarketplaceHome({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city } = await searchParams;
  const listings = await getMarketplaceListings({
    city: city ? city.charAt(0).toUpperCase() + city.slice(1) : undefined,
  });

  const sectionsWithAds = listingSections
    .map((section) => ({
      ...section,
      items: listings.filter((item) => item.category === section.title).slice(0, 4),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="relative mx-auto flex min-h-[520px] w-[min(1180px,calc(100%_-_32px))] items-center max-[760px]:min-h-[560px] max-[760px]:w-[min(100%_-_24px,1180px)]">
            <div className="relative z-2 py-[76px] pb-[100px] max-[760px]:py-[70px] max-[760px]:pb-[100px]">
              <h1 className="mt-0 mb-5 max-w-[720px] text-[clamp(42px,5.8vw,72px)] leading-[1.08] tracking-[-2.5px] text-white max-[760px]:text-[42px] max-[760px]:tracking-[-1.5px]">Scale your <span className="bg-[linear-gradient(90deg,#ffb347,#ff6b38,#ff4d12)] bg-clip-text text-transparent">ideas</span><br />faster than ever</h1>
              <p className="mt-0 mb-7 max-w-[650px] text-base leading-[1.65] text-[#e1e8ed] max-[760px]:[&_br]:hidden">Discover amazing products, connect with buyers and sellers in your area,<br />and get the best deals on everything you need.</p>
              <div className="flex gap-[13px] max-[760px]:flex-wrap">
                <Link className="inline-flex items-center gap-2 rounded-[9px] bg-orange px-5 py-3.5 font-extrabold text-white transition hover:-translate-y-px hover:bg-orange-dark max-[760px]:px-3.5 max-[760px]:py-3 max-[760px]:text-xs" href="/category/all"><LayoutGrid size={17} /> Browse Categories</Link>
                <Link className="inline-flex items-center gap-[9px] rounded-[9px] border border-[#ffffff9c] bg-[#ffffff18] px-[22px] py-3.5 text-[13px] font-extrabold text-white backdrop-blur-[5px] hover:bg-[#ffffff28] max-[760px]:px-3.5 max-[760px]:py-3 max-[760px]:text-xs" href="/buyers"><Box size={17} /> Explore Buyers</Link>
              </div>
            </div>
          </div>
        </section>

        <div className="relative z-5 mx-auto mt-[-60px] mb-[26px] w-[min(1400px,calc(100%_-_32px))] max-[760px]:mt-[-52px]">
          <div className="grid grid-cols-[repeat(10,minmax(80px,1fr))] gap-[3px] overflow-x-auto rounded-[15px] border border-white bg-[rgba(255,255,255,.94)] px-[22px] pt-[21px] pb-4 shadow-[0_14px_35px_#04182f1c] backdrop-blur-[14px] max-[760px]:grid-cols-[repeat(10,82px)] max-[760px]:px-3 max-[760px]:pt-[18px] max-[760px]:pb-4">
            {categories.map((category) => (
              <Link className="grid min-w-[90px] justify-items-center gap-2.5 text-xs font-extrabold whitespace-nowrap text-[#344154] transition hover:-translate-y-0.5 hover:text-orange" href={`/category/${category.slug}`} key={category.slug}>
                <span className="grid size-[72px] place-items-center rounded-[13px] bg-[linear-gradient(145deg,#fff,#edf1f4)] text-[34px] shadow-[0_5px_12px_#0c27451f] saturate-[.95] max-[760px]:size-[55px] max-[760px]:text-[26px]">
                  <Image className="size-[94%] object-contain" src={category.image} alt="" />
                </span>
                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <AdSlider />

        <section className="bg-[#fbfcfd] px-10 pt-2 pb-11 max-[760px]:px-2 max-[760px]:pt-0">
          <div className="mx-auto w-full max-w-[1380px]">
            <div className="py-6 pb-[18px] max-[760px]:pt-[18px]">
              <div className="mb-5 flex items-end justify-between gap-5">
                <div><h2 className="m-0 text-[clamp(22px,3vw,30px)] tracking-[-0.7px] text-navy">Popular Cities</h2><p className="mt-1.5 mb-0 text-sm text-muted">Browse products in these popular locations</p></div>
                <Link className="text-sm font-extrabold whitespace-nowrap text-orange" href="/category/all">View All →</Link>
              </div>
              <div className="grid grid-cols-4 gap-3.5 max-[760px]:grid-cols-2 max-[760px]:gap-2">
                {popularCities.map((cityName) => (
                  <Link className="grid min-h-[50px] place-items-center rounded-xl border border-line bg-white text-[13px] font-extrabold text-[#26364b] shadow-[0_2px_5px_#04182f0d] transition hover:-translate-y-0.5 hover:border-[#ff4d125c] hover:text-orange hover:shadow-[0_8px_20px_#04182f10] max-[760px]:min-h-11 max-[760px]:text-xs" href={`/category/all?city=${encodeURIComponent(cityName)}`} key={cityName}>{cityName}</Link>
                ))}
              </div>
            </div>

            {sectionsWithAds.length === 0 ? (
              <section className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
                <h2 className="m-0 text-[clamp(22px,2.5vw,28px)] tracking-[-0.7px] text-navy">No ads yet</h2>
                <p className="mx-auto mt-2 mb-6 max-w-md text-sm text-muted">
                  Demo listings are removed. Ads you post will show up here by category.
                </p>
                <Link
                  className="inline-flex min-h-12 items-center gap-[9px] rounded-[9px] bg-orange px-5 text-[13px] font-black text-white shadow-[0_8px_20px_#ff4d1247] transition hover:-translate-y-0.5 hover:bg-orange-dark"
                  href="/post-ad"
                >
                  Post your first ad <ArrowRight size={18} />
                </Link>
              </section>
            ) : (
              sectionsWithAds.map((section) => (
                <section className="pt-[38px] max-[760px]:pt-[30px]" key={section.slug}>
                  <div className="mb-[18px] flex items-center justify-between gap-5">
                    <h2 className="m-0 text-[clamp(22px,2.5vw,28px)] tracking-[-0.7px] text-navy">{section.title}</h2>
                    <Link className="text-sm font-extrabold whitespace-nowrap text-orange" href={`/category/${section.slug}`}>View All →</Link>
                  </div>
                  <div className="grid grid-cols-4 gap-[18px] max-[1050px]:grid-cols-3 max-[760px]:grid-cols-2 max-[760px]:gap-2.5">
                    {section.items.map((item) => <CatalogCard item={item} key={item.id} />)}
                  </div>
                </section>
              ))
            )}
          </div>
        </section>

        <section className="sell-cta relative overflow-hidden">
          <div className="relative z-2 mx-auto grid min-h-[720px] w-[min(1180px,calc(100%_-_32px))] grid-cols-[1.05fr_0.95fr] items-center gap-8 max-[960px]:min-h-0 max-[960px]:w-[min(100%_-_24px,1180px)] max-[960px]:grid-cols-1 max-[960px]:gap-10 max-[960px]:py-14">
            <div className="relative max-w-[560px] py-[72px] max-[960px]:mx-auto max-[960px]:py-0 max-[960px]:text-center">
              <h2 className="mt-0 mb-4 text-[clamp(40px,5.4vw,64px)] leading-[1.05] font-black tracking-[-1.8px] text-white max-[760px]:text-[40px]">
                Buy &amp; Sell Faster
                <br />
                <span className="text-orange">with X Marketplace</span>
              </h2>
              <p className="m-0 max-w-[480px] text-[15px] leading-[1.7] text-[#d7e2ea] max-[960px]:mx-auto">
                The easiest way to buy and sell products across Pakistan. Post an ad in minutes and reach serious buyers near you.
              </p>

              <div className="mt-7 flex flex-wrap gap-3 max-[960px]:justify-center" aria-label="Download our mobile app">
                <a
                  className="flex h-[58px] min-w-[168px] items-center gap-2.5 rounded-[12px] border border-white/15 bg-white px-3.5 py-2 text-[#062d45] shadow-[0_10px_24px_#00182355] transition hover:-translate-y-0.5"
                  href="#"
                  aria-label="Get it on Google Play"
                >
                  <svg className="h-9 w-[31px] shrink-0" viewBox="0 0 36 40" aria-hidden="true">
                    <path fill="#00c3ff" d="M2 2.5 22.5 20 2 37.5c-.6-.7-1-1.8-1-3V5.5c0-1.2.4-2.3 1-3Z" />
                    <path fill="#00df8b" d="m2 2.5 24.2 13.8-3.7 3.7L2 2.5Z" />
                    <path fill="#ffcf00" d="m22.5 20 3.7 3.7L2 37.5 22.5 20Z" />
                    <path fill="#ff5263" d="m26.2 16.3 6.3 3.6c1 .6 1 1.6 0 2.2l-6.3 3.6-3.7-3.7v-2l3.7-3.7Z" />
                  </svg>
                  <span className="block">
                    <small className="block text-[9px] leading-none tracking-[0.2px] text-[#65717c]">GET IT ON</small>
                    <strong className="mt-[3px] block text-[18px] leading-none tracking-[-0.4px] whitespace-nowrap text-[#062d45]">Google Play</strong>
                  </span>
                </a>
                <a
                  className="flex h-[58px] min-w-[168px] items-center gap-2.5 rounded-[12px] border border-white/15 bg-white px-3.5 py-2 text-[#062d45] shadow-[0_10px_24px_#00182355] transition hover:-translate-y-0.5"
                  href="#"
                  aria-label="Download on the App Store"
                >
                  <svg className="h-9 w-[31px] shrink-0" viewBox="0 0 32 38" aria-hidden="true">
                    <path fill="currentColor" d="M26.7 20.2c0-4.7 3.9-7 4.1-7.1-2.2-3.2-5.6-3.7-6.8-3.7-2.9-.3-5.6 1.7-7 1.7-1.5 0-3.7-1.7-6.1-1.6-3.1 0-6 1.8-7.6 4.6-3.3 5.6-.8 13.9 2.3 18.5 1.5 2.2 3.3 4.7 5.7 4.6 2.3-.1 3.2-1.5 6-1.5s3.6 1.5 6 1.4c2.5 0 4.1-2.2 5.6-4.4 1.8-2.6 2.5-5.1 2.5-5.3-.1 0-4.7-1.8-4.7-7.2ZM22.1 6.4C23.3 5 24.2 3 24 .9c-1.8.1-4 1.2-5.3 2.7-1.2 1.3-2.2 3.4-1.9 5.4 2 .2 4.1-1 5.3-2.6Z" />
                  </svg>
                  <span className="block">
                    <small className="block text-[9px] leading-none tracking-[0.2px] text-[#65717c]">Download on the</small>
                    <strong className="mt-[3px] block text-[18px] leading-none tracking-[-0.4px] whitespace-nowrap text-[#062d45]">App Store</strong>
                  </span>
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 max-[960px]:justify-center">
                <div>
                  <p className="m-0 text-[28px] font-black leading-none text-white">100K+</p>
                  <p className="mt-1.5 mb-0 text-xs font-bold tracking-[0.4px] text-[#9eb0bd] uppercase">Downloads</p>
                </div>
                <div className="h-10 w-px bg-white/20 max-[960px]:hidden" />
                <div>
                  <p className="m-0 flex items-center gap-1.5 text-[28px] font-black leading-none text-white">
                    4.2 <Star size={18} className="fill-white text-white" />
                  </p>
                  <p className="mt-1.5 mb-0 text-xs font-bold tracking-[0.4px] text-[#9eb0bd] uppercase">Star Rating</p>
                </div>
                <Link
                  className="inline-flex min-h-12 items-center gap-2 rounded-[10px] bg-orange px-5 text-[13px] font-black text-white shadow-[0_10px_24px_#ff4d1247] transition hover:-translate-y-0.5 hover:bg-orange-dark"
                  href="/post-ad"
                >
                  Post a free ad <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            <div className="phone-showcase relative mx-auto flex min-h-[620px] w-full max-w-[420px] items-end justify-center max-[960px]:min-h-[520px]" aria-label="X Marketplace mobile app preview">
              <div className="phone-float-card phone-float-card--left">New Message</div>
              <div className="phone-float-card phone-float-card--right">Deal Closed</div>
              <div className="phone-frame relative z-2">
                <div className="phone-speaker" />
                <div className="phone-screen">
                  <Image
                    src={mobileScreenImage}
                    alt="X Marketplace shown on a mobile phone"
                    sizes="(max-width: 760px) 240px, 300px"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div className="phone-home-indicator" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
