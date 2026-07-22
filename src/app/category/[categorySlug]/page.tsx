import { CatalogCard } from "@/components/catalog-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { marketplaceItems } from "@/lib/catalog";

export default async function CategoryPage({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params;
  const title = categorySlug.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  const filtered = categorySlug === "featured"
    ? marketplaceItems.filter((item) => item.badge)
    : categorySlug === "all"
      ? marketplaceItems
      : marketplaceItems.filter((item) => item.category.toLowerCase() === title.toLowerCase());
  const items = filtered.length ? filtered : marketplaceItems;

  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] bg-surface py-[42px]">
        <div className="mx-auto w-[min(1180px,calc(100%_-_32px))] max-[760px]:w-[min(100%_-_24px,1180px)]">
          <div className="mb-[18px] flex gap-2 text-xs text-muted">Marketplace / {title}</div>
          <div className="mb-5 flex items-end justify-between gap-5">
            <div>
              <h2 className="m-0 text-[clamp(22px,3vw,30px)] tracking-[-0.7px] text-navy">{title}</h2>
              <p className="mt-1.5 mb-0 text-sm text-muted">{items.length} listings available</p>
            </div>
            <select className="rounded-lg border border-line bg-white px-3.5 py-2.5 font-bold text-[#49576b]">
              <option>Newest first</option>
              <option>Price: Low to High</option>
            </select>
          </div>
          <div className="grid grid-cols-4 gap-[18px] max-[1050px]:grid-cols-3 max-[760px]:grid-cols-2 max-[760px]:gap-2.5">
            {items.map((item) => <CatalogCard item={item} key={item.id} />)}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
