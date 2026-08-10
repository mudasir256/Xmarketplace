import Link from "next/link";
import { Suspense } from "react";
import { CategoryListingsSection } from "@/components/location/category-listings-section";
import { CatalogGridSkeleton, Skeleton } from "@/components/skeletons/skeleton";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MARKETPLACE_CATEGORIES, MARKETPLACE_CITIES } from "@/lib/marketplace";

function CategoryListingsFallback() {
  return (
    <div>
      <Skeleton className="mb-4 h-4 w-64" />
      <CatalogGridSkeleton count={8} />
    </div>
  );
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{
    city?: string;
    lat?: string;
    lng?: string;
    radius?: string;
    area?: string;
  }>;
}) {
  const { categorySlug } = await params;
  const query = await searchParams;
  const city = query.city?.trim() || undefined;

  const known = MARKETPLACE_CATEGORIES.find((category) => category.slug === categorySlug);
  const title =
    known?.name ??
    (categorySlug === "all"
      ? city
        ? `Ads in ${city}`
        : "All cities"
      : categorySlug === "featured"
        ? "Featured"
        : categorySlug.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()));

  const subtitle =
    categorySlug === "all"
      ? city
        ? `Listings posted in ${city}`
        : "Listings near your selected location"
      : known
        ? `${known.name} ads near your selected location`
        : "Browse marketplace ads";

  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] bg-surface py-[42px]">
        <div className="mx-auto w-[min(1180px,calc(100%_-_32px))] max-[760px]:w-[min(100%_-_24px,1180px)]">
          <div className="mb-[18px] flex gap-2 text-xs text-muted">
            <Link href="/" className="hover:text-orange">
              Marketplace
            </Link>
            <span>/</span>
            <span>{title}</span>
          </div>

          <div className="mb-5 flex items-end justify-between gap-5">
            <div>
              <h2 className="m-0 text-[clamp(22px,3vw,30px)] tracking-[-0.7px] text-navy">{title}</h2>
              <p className="mt-1.5 mb-0 text-sm text-muted">{subtitle}</p>
            </div>
          </div>

          {categorySlug === "all" ? (
            <div className="mb-6 flex flex-wrap gap-2">
              <Link
                href="/category/all"
                className={`rounded-full px-3.5 py-2 text-xs font-extrabold ${
                  !city
                    ? "bg-navy text-white"
                    : "border border-line bg-white text-[#526177] hover:border-orange hover:text-orange"
                }`}
              >
                All cities
              </Link>
              {MARKETPLACE_CITIES.map((cityName) => (
                <Link
                  key={cityName}
                  href={`/category/all?city=${encodeURIComponent(cityName)}`}
                  className={`rounded-full px-3.5 py-2 text-xs font-extrabold ${
                    city === cityName
                      ? "bg-navy text-white"
                      : "border border-line bg-white text-[#526177] hover:border-orange hover:text-orange"
                  }`}
                >
                  {cityName}
                </Link>
              ))}
            </div>
          ) : null}

          {categorySlug !== "all" ? (
            <div className="mb-6 flex flex-wrap gap-2">
              <Link
                href="/category/all"
                className="rounded-full border border-line bg-white px-3.5 py-2 text-xs font-extrabold text-[#526177] hover:border-orange hover:text-orange"
              >
                All categories
              </Link>
              {MARKETPLACE_CATEGORIES.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className={`rounded-full px-3.5 py-2 text-xs font-extrabold ${
                    category.slug === categorySlug
                      ? "bg-navy text-white"
                      : "border border-line bg-white text-[#526177] hover:border-orange hover:text-orange"
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          ) : null}

          <Suspense fallback={<CategoryListingsFallback />}>
            <CategoryListingsSection categorySlug={categorySlug} searchParams={query} />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
