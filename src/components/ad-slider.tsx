"use client";

import Image, { type StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import adsImage from "@/images/ads.png";
import digitalSuccessImage from "@/images/Digital-Success-Ads-Banner.png";

const slides: { image: StaticImageData; alt: string }[] = [
  {
    image: adsImage,
    alt: "Grow your business by featuring it on UDealZone",
  },
  {
    image: digitalSuccessImage,
    alt: "Digital Success advertising",
  },
];

export function AdSlider() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  const showSlide = (index: number) => {
    setActiveSlide((index + slides.length) % slides.length);
  };

  return (
    <section className="bg-white pb-8 max-[760px]:pb-[22px]" aria-label="Featured advertisements">
      <div className="mx-auto w-[min(1180px,calc(100%-32px))] max-[760px]:w-[min(1180px,calc(100%-24px))]">
        <div className="group relative aspect-[1024/280] overflow-hidden rounded-[14px] bg-[#f4f5f7] shadow-[0_8px_24px_#04182f13] max-[760px]:aspect-auto max-[760px]:min-h-[145px] max-[760px]:rounded-[10px]">
          <div
            className="flex h-full transition-transform duration-[650ms] ease-[cubic-bezier(.22,.61,.36,1)]"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {slides.map((slide) => (
              <div className="h-full min-w-full" key={slide.alt}>
                <Image
                  className="h-full w-full object-cover"
                  src={slide.image}
                  alt={slide.alt}
                  sizes="(max-width: 760px) calc(100vw - 24px), 1180px"
                  priority={slide.image === adsImage}
                />
              </div>
            ))}
          </div>

          <button
            className="absolute left-[14px] top-1/2 z-[2] grid size-[38px] -translate-y-1/2 place-items-center rounded-full border border-[#ffffffa6] bg-[#fffffff0] p-0 text-brand-navy opacity-0 shadow-[0_5px_14px_#04182f26] transition-[opacity,background] duration-200 hover:bg-white focus-visible:opacity-100 group-hover:opacity-100 max-[760px]:left-2 max-[760px]:size-8 max-[760px]:opacity-90"
            type="button"
            onClick={() => showSlide(activeSlide - 1)}
            aria-label="Previous advertisement"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="absolute right-[14px] top-1/2 z-[2] grid size-[38px] -translate-y-1/2 place-items-center rounded-full border border-[#ffffffa6] bg-[#fffffff0] p-0 text-brand-navy opacity-0 shadow-[0_5px_14px_#04182f26] transition-[opacity,background] duration-200 hover:bg-white focus-visible:opacity-100 group-hover:opacity-100 max-[760px]:right-2 max-[760px]:size-8 max-[760px]:opacity-90"
            type="button"
            onClick={() => showSlide(activeSlide + 1)}
            aria-label="Next advertisement"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-[11px] left-1/2 z-[2] flex -translate-x-1/2 gap-1.5 rounded-[20px] bg-[#0030496b] px-[7px] py-[5px] backdrop-blur-[5px] max-[760px]:bottom-[7px]">
            {slides.map((slide, index) => (
              <button
                className={`h-[7px] rounded-[10px] border-0 p-0 transition-[width,background] duration-250 ${
                  index === activeSlide ? "w-[22px] bg-white" : "w-[7px] bg-[#ffffff9c]"
                }`}
                type="button"
                onClick={() => showSlide(index)}
                aria-label={`Show advertisement ${index + 1}`}
                aria-current={index === activeSlide ? "true" : undefined}
                key={slide.alt}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
