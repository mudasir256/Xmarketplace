"use client";

import type { CatalogItem } from "@/lib/catalog";
import { relativeListingTime, type MarketplaceListingCard } from "@/lib/listing-types";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";

export function CatalogCard({
  item,
  store = false,
}: {
  item: CatalogItem | MarketplaceListingCard;
  store?: boolean;
}) {
  const href = store ? `/store/product/${item.id}` : `/product/${item.id}`;
  const postedLabel = store
    ? "In stock"
    : relativeListingTime("createdAt" in item ? item.createdAt : undefined);

  return (
    <article className="group relative overflow-hidden rounded-[14px] border border-brand-line bg-white transition duration-200 ease-out hover:-translate-y-[3px] hover:shadow-[0_14px_30px_#0a234214]">
      <Link href={href} className="absolute inset-0 z-10" aria-label={`View ${item.title}`} />
      <div className="relative h-[190px] overflow-hidden bg-[#e8eef5] max-[760px]:h-[145px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" src={item.image} alt={item.title} />
        {item.badge && (
          <span className="absolute left-3 top-3 rounded-md bg-brand-orange px-[9px] py-1.5 text-[9px] font-black tracking-[.6px] text-white">
            {item.badge}
          </span>
        )}
        <button
          type="button"
          className="absolute right-[11px] top-[11px] z-20 grid size-[34px] place-items-center rounded-full border-0 bg-white text-brand-navy shadow-[0_3px_9px_#0002]"
          aria-label={`Save ${item.title}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <Heart size={17} />
        </button>
      </div>
      <div className="p-[15px] max-[760px]:p-3">
        <div className="flex items-center justify-between text-[11px] text-brand-muted">
          <span>{item.category}</span>
          <span>{postedLabel}</span>
        </div>
        <h3 className="my-[9px] mb-2 text-[15px] leading-[1.35] text-brand-navy">{item.title}</h3>
        <div>
          <span className="text-[19px] font-black text-brand-orange">{item.price}</span>
          {item.oldPrice && <span className="ml-[7px] text-xs font-medium text-[#96a0ae] line-through">{item.oldPrice}</span>}
        </div>
        <div className="mt-3 flex items-center gap-[5px] border-t border-brand-line pt-[11px] text-[11px] text-brand-muted">
          <MapPin size={13} />
          <span>{item.location ?? "Delivery across Pakistan"}</span>
        </div>
      </div>
    </article>
  );
}
