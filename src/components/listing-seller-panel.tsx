"use client";

import Link from "next/link";
import { Flag, MessageCircle, Phone, UserRound } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";

export function ListingSellerPanel({
  sellerName,
  phone,
  avatarUrl,
  listingSlug,
  listingTitle,
  listingImage,
}: {
  sellerName: string;
  phone: string | null;
  avatarUrl: string | null;
  listingSlug: string;
  listingTitle: string;
  listingImage: string;
}) {
  const telHref = phone ? `tel:${phone}` : undefined;
  const chatHref = `/messages?listing=${encodeURIComponent(listingSlug)}&title=${encodeURIComponent(listingTitle)}&image=${encodeURIComponent(listingImage)}&seller=${encodeURIComponent(sellerName)}`;

  return (
    <aside className="rounded-[18px] border border-line bg-white p-4 shadow-[0_8px_24px_#04182f0d]">
      <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-navy">
        <span className="grid size-7 place-items-center rounded-full bg-[#fff4d7] text-[#c58a00]">
          <UserRound size={15} />
        </span>
        Ad Posted By
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="size-12 shrink-0 overflow-hidden rounded-full bg-[#e8eef5] ring-2 ring-[#edf1f5]">
          <UserAvatar
            src={avatarUrl}
            alt={sellerName}
            size={48}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="m-0 truncate text-[15px] font-extrabold capitalize text-navy">{sellerName}</p>
          <p className="m-0 truncate text-sm text-muted">{phone || "Number on request"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {telHref ? (
          <a
            href={telHref}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1db954] px-3 text-sm font-extrabold text-white"
          >
            <Phone size={17} /> Call
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1db954]/70 px-3 text-sm font-extrabold text-white"
          >
            <Phone size={17} /> Call
          </button>
        )}
        <Link
          href={chatHref}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange px-3 text-sm font-extrabold text-white"
        >
          <MessageCircle size={17} /> Chat
        </Link>
      </div>

      <button
        type="button"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 border-0 bg-transparent text-sm font-bold text-[#e11d48]"
      >
        <Flag size={15} /> Report this ad
      </button>
    </aside>
  );
}
