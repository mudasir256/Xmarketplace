import { notFound } from "next/navigation";
import { PackageCheck, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { ProductImageGallery } from "@/components/store/product-image-gallery";
import { getStoreProductBySlug } from "@/lib/store/catalog";

export default async function StoreProductPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await params;
  const product = await getStoreProductBySlug(productSlug);
  if (!product) notFound();

  const shortText = product.shortDescription?.trim() || null;
  const fullText = product.description?.trim() || null;
  const showBoth =
    Boolean(shortText && fullText) &&
    shortText!.toLowerCase() !== fullText!.toLowerCase();

  return (
    <>
      <SiteHeader mode="store" />
      <main className="min-h-[70vh] bg-surface py-[42px]">
        <div className="mx-auto w-[min(1180px,calc(100%_-_32px))] max-[760px]:w-[min(100%_-_24px,1180px)]">
          <div className="mb-[18px] flex gap-2 text-xs text-muted">
            <span>Store</span>
            <span>/</span>
            <span>{product.category}</span>
            <span>/</span>
            <strong>{product.title}</strong>
          </div>
          <div className="grid grid-cols-[1.05fr_0.95fr] gap-[42px] rounded-2xl border border-line bg-white p-7 max-[760px]:grid-cols-1">
            <ProductImageGallery images={product.images} title={product.title} />
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#e9f8fa] px-3 py-[7px] text-[11px] font-black tracking-[1.2px] text-[#078a95] uppercase">
                <PackageCheck size={14} /> Official Store
              </span>
              <h1 className="mt-2 mb-3.5 text-[34px] leading-[1.15] text-navy max-[760px]:text-[27px]">
                {product.title}
              </h1>
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-[28px] font-black text-orange">{product.price}</span>
                {product.oldPrice ? (
                  <span className="text-xs font-medium text-[#96a0ae] line-through">
                    {product.oldPrice}
                  </span>
                ) : null}
                <span className="rounded-full bg-[#f3f6fa] px-3 py-1 text-xs font-bold text-[#526177]">
                  {product.stockKnown
                    ? product.stockQuantity > 0
                      ? `${product.stockQuantity} in stock`
                      : "Out of stock"
                    : "In stock"}
                </span>
              </div>

              {shortText || fullText ? (
                <div className="my-[18px] space-y-3">
                  {showBoth ? (
                    <>
                      <p className="text-sm leading-[1.7] text-muted">{shortText}</p>
                      <div>
                        <h2 className="mb-2 text-sm font-black tracking-wide text-navy uppercase">
                          Description
                        </h2>
                        <p className="whitespace-pre-wrap text-sm leading-[1.7] text-[#445166]">
                          {fullText}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <h2 className="mb-2 text-sm font-black tracking-wide text-navy uppercase">
                        Description
                      </h2>
                      <p className="whitespace-pre-wrap text-sm leading-[1.7] text-[#445166]">
                        {fullText || shortText}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="my-[18px] text-sm leading-[1.7] text-muted">
                  Original product from the X Marketplace official store. Secure checkout and
                  nationwide delivery.
                </p>
              )}

              {product.variantId ? (
                <AddToCartButton
                  productId={product.productUuid}
                  variantId={product.variantId}
                  slug={product.slug}
                  title={product.title}
                  image={product.image}
                  unitPrice={product.priceValue}
                  maxQuantity={
                    product.stockKnown
                      ? product.stockQuantity
                      : Math.max(product.stockQuantity, 99)
                  }
                />
              ) : (
                <p className="rounded-xl bg-[#fff5f0] px-3 py-2 text-sm text-[#b42318]">
                  This product is missing a sellable variant. Re-save it from admin.
                </p>
              )}

              <div className="mt-6 border-t border-line">
                <div className="flex items-center gap-2.5 border-b border-line py-[13px] text-[13px] text-[#56657a]">
                  <Truck size={18} /> Nationwide delivery in 2–5 working days
                </div>
                <div className="flex items-center gap-2.5 border-b border-line py-[13px] text-[13px] text-[#56657a]">
                  <ShieldCheck size={18} /> Cash on delivery available
                </div>
                <div className="flex items-center gap-2.5 border-b border-line py-[13px] text-[13px] text-[#56657a]">
                  <RotateCcw size={18} /> 7-day return policy on eligible items
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
