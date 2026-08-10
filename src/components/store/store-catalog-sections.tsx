import Link from "next/link";
import { CatalogCard } from "@/components/catalog-card";
import { listActiveStoreProducts, listStoreCategories } from "@/lib/store/catalog";

const FALLBACK_DEPT_IMAGES: Record<string, string> = {
  clothing:
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80",
  "imported-mobiles":
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
  "mobile-phones":
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
  accessories:
    "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=80",
  shoes:
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=80",
};

function EmptyStoreState() {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
      <h3 className="mt-0 text-navy">No products yet</h3>
      <p className="mb-0 text-sm text-muted">
        Add products in the admin Official Store — they will appear here automatically.
      </p>
    </div>
  );
}

export async function StoreCatalogSections() {
  const [categories, featured, newArrivals, allProducts] = await Promise.all([
    listStoreCategories(),
    listActiveStoreProducts({ featured: true, limit: 8 }),
    listActiveStoreProducts({ newArrival: true, limit: 8 }),
    listActiveStoreProducts({ limit: 8 }),
  ]);

  const departments = categories.slice(0, 8).map((category) => ({
    title: category.name,
    subtitle: category.description || "Shop now",
    slug: category.slug,
    image:
      category.imagePath ||
      FALLBACK_DEPT_IMAGES[category.slug] ||
      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=900&q=80",
  }));

  const featuredItems = featured.length ? featured : allProducts;
  const arrivalItems = newArrivals.length
    ? newArrivals
    : allProducts.filter((p) => !featuredItems.some((f) => f.slug === p.slug)).slice(0, 8);

  return (
    <>
      <section className="py-[38px]">
        <div className="mx-auto w-[min(1180px,calc(100%_-_32px))] max-[760px]:w-[min(100%_-_24px,1180px)]">
          <div className="mb-5 flex items-end justify-between gap-5">
            <div>
              <h2 className="m-0 text-[clamp(22px,3vw,30px)] tracking-[-0.7px] text-navy">
                Shop by department
              </h2>
              <p className="mt-1.5 mb-0 text-sm text-muted">
                Categories from your admin store catalog
              </p>
            </div>
            <Link
              className="text-sm font-extrabold whitespace-nowrap text-orange"
              href="/store/category/all"
            >
              View all →
            </Link>
          </div>
          {departments.length ? (
            <div className="grid grid-cols-4 gap-[18px] max-[760px]:grid-cols-2">
              {departments.map((department) => (
                <Link
                  className="group relative min-h-[235px] overflow-hidden rounded-2xl bg-[#ddd] max-[760px]:min-h-[190px]"
                  href={`/store/category/${department.slug}`}
                  key={department.slug}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                    src={department.image}
                    alt={department.title}
                  />
                  <div className="absolute inset-0 flex flex-col justify-end bg-[linear-gradient(transparent_35%,#02152edb)] p-[22px] text-white">
                    <h3 className="mt-0 mb-1 text-[21px]">{department.title}</h3>
                    <span className="text-xs text-[#dce5ef]">{department.subtitle} →</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-line bg-white p-8 text-sm text-muted">
              No store categories yet. Seed categories in admin, then add products.
            </p>
          )}
        </div>
      </section>

      <section className="bg-surface py-[38px]" id="featured">
        <div className="mx-auto w-[min(1180px,calc(100%_-_32px))] max-[760px]:w-[min(100%_-_24px,1180px)]">
          <div className="mb-5 flex items-end justify-between gap-5">
            <div>
              <h2 className="m-0 text-[clamp(22px,3vw,30px)] tracking-[-0.7px] text-navy">
                Featured products
              </h2>
              <p className="mt-1.5 mb-0 text-sm text-muted">
                Live from admin · official store database
              </p>
            </div>
            <Link
              className="text-sm font-extrabold whitespace-nowrap text-orange"
              href="/store/category/all"
            >
              Shop all →
            </Link>
          </div>
          {featuredItems.length ? (
            <div className="grid grid-cols-4 gap-[18px] max-[1050px]:grid-cols-3 max-[760px]:grid-cols-2 max-[760px]:gap-2.5">
              {featuredItems.map((item) => (
                <CatalogCard item={item} store key={item.slug} />
              ))}
            </div>
          ) : (
            <EmptyStoreState />
          )}
        </div>
      </section>

      <section className="py-[38px]">
        <div className="mx-auto w-[min(1180px,calc(100%_-_32px))] max-[760px]:w-[min(100%_-_24px,1180px)]">
          <div className="mb-5 flex items-end justify-between gap-5">
            <div>
              <h2 className="m-0 text-[clamp(22px,3vw,30px)] tracking-[-0.7px] text-navy">
                New arrivals
              </h2>
              <p className="mt-1.5 mb-0 text-sm text-muted">Just added in X Market Admin</p>
            </div>
            <Link
              className="text-sm font-extrabold whitespace-nowrap text-orange"
              href="/store/category/new-arrivals"
            >
              See new arrivals →
            </Link>
          </div>
          {arrivalItems.length ? (
            <div className="grid grid-cols-4 gap-[18px] max-[1050px]:grid-cols-3 max-[760px]:grid-cols-2 max-[760px]:gap-2.5">
              {arrivalItems.map((item) => (
                <CatalogCard item={item} store key={item.slug} />
              ))}
            </div>
          ) : (
            <EmptyStoreState />
          )}
        </div>
      </section>
    </>
  );
}
