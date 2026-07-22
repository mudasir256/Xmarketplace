"use client";

import { Flag, MessageCircle, Phone, UserRound } from "lucide-react";

export function ListingSellerPanel({
  sellerName,
  phone,
  avatarUrl,
}: {
  sellerName: string;
  phone: string | null;
  avatarUrl: string | null;
}) {
  const telHref = phone ? `tel:${phone}` : undefined;
  const chatHref = phone ? `https://wa.me/${phone.replace(/^\+/, "").replace(/^0/, "92")}` : undefined;

  return (
    <aside className="rounded-[18px] border border-line bg-white p-4 shadow-[0_8px_24px_#04182f0d]">
      <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-navy">
        <span className="grid size-7 place-items-center rounded-full bg-[#fff4d7] text-[#c58a00]">
          <UserRound size={15} />
        </span>
        Ad Posted By
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e8eef5] text-navy">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserRound size={22} />
          )}
        </div>
        <div className="min-w-0">
          <p className="m-0 truncate text-[15px] font-extrabold text-navy">{sellerName}</p>
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
        {chatHref ? (
          <a
            href={chatHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange px-3 text-sm font-extrabold text-white"
          >
            <MessageCircle size={17} /> Chat
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange/70 px-3 text-sm font-extrabold text-white"
          >
            <MessageCircle size={17} /> Chat
          </button>
        )}
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
