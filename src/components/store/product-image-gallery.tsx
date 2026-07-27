"use client";

import { useState } from "react";

export function ProductImageGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const gallery = images.length ? images : [];
  const [active, setActive] = useState(0);
  const current = gallery[active] || gallery[0];

  if (!current) return null;

  return (
    <div>
      <div className="min-h-[480px] overflow-hidden rounded-2xl bg-[#eef2f6] max-[760px]:min-h-[330px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="h-full min-h-[480px] w-full object-cover max-[760px]:min-h-[330px]"
          src={current}
          alt={title}
        />
      </div>
      {gallery.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2.5">
          {gallery.slice(0, 8).map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`overflow-hidden rounded-xl border ${
                active === index ? "border-orange" : "border-line"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-20 w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
