"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ListingGallery({ images, title }: { images: string[]; title: string }) {
  const photos = images.length ? images : ["/placeholder-listing.svg"];
  const [index, setIndex] = useState(0);
  const current = photos[index] ?? photos[0];

  function go(delta: number) {
    setIndex((value) => (value + delta + photos.length) % photos.length);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_24px_#04182f0a]">
      <div className="relative aspect-[4/3] bg-[#edf1f5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={current} src={current} alt={title} className="h-full w-full object-cover" />

        {photos.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border-0 bg-white/95 text-navy shadow-[0_4px_14px_#04182f22]"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border-0 bg-white/95 text-navy shadow-[0_4px_14px_#04182f22]"
            >
              <ChevronRight size={22} />
            </button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {photos.map((_, dotIndex) => (
                <button
                  key={dotIndex}
                  type="button"
                  aria-label={`Go to photo ${dotIndex + 1}`}
                  onClick={() => setIndex(dotIndex)}
                  className={`h-2 rounded-full border-0 transition ${
                    dotIndex === index ? "w-5 bg-orange" : "w-2 bg-white/90"
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {photos.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto border-t border-line bg-[#f8fafc] p-3">
          {photos.map((photo, thumbIndex) => (
            <button
              key={`${photo}-${thumbIndex}`}
              type="button"
              onClick={() => setIndex(thumbIndex)}
              className={`relative h-[72px] w-[92px] shrink-0 overflow-hidden rounded-lg border-2 ${
                thumbIndex === index ? "border-orange" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
