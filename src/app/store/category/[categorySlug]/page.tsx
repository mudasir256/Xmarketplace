import { CatalogCard } from "@/components/catalog-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listActiveStoreProducts, listStoreCategories } from "@/lib/store/catalog";

export default async function StoreCategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const [items, categories] = await Promise.all([
    listActiveStoreProducts({ categorySlug }),
    listStoreCategories(),
  ]);

  const matched = categories.find((c) => c.slug === categorySlug);
  const title =
    matched?.name ||
    (categorySlug === "all"
      ? "All products"
      : categorySlug === "new-arrivals"
        ? "New arrivals"
        : categorySlug === "featured"
          ? "Featured"
          : categorySlug === "sale"
            ? "Sale"
            : categorySlug.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()));

  return (
    <>
      <SiteHeader mode="store" />
      <main className="min-h-[70vh] bg-surface py-[42px]">
        <div className="mx-auto w-[min(1180px,calc(100%_-_32px))] max-[760px]:w-[min(100%_-_24px,1180px)]">
          <div className="mb-[18px] flex gap-2 text-xs text-muted">
            Official Store / {title}
          </div>
          <div className="mb-5 flex items-end justify-between gap-5">
            <div>
              <h2 className="m-0 text-[clamp(22px,3vw,30px)] tracking-[-0.7px] text-navy">
                {title}
              </h2>
              <p className="mt-1.5 mb-0 text-sm text-muted">
                {items.length} product{items.length === 1 ? "" : "s"} from the official store
              </p>
            </div>
          </div>
          {items.length ? (
            <div className="grid grid-cols-4 gap-[18px] max-[1050px]:grid-cols-3 max-[760px]:grid-cols-2 max-[760px]:gap-2.5">
              {items.map((item) => (
                <CatalogCard item={item} store key={item.slug} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">
              No products in this category yet. Add them from admin Store products.
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
