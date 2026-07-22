"use client";

import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";

type UserAvatarProps = {
  src?: string | null;
  alt?: string;
  className?: string;
  size: number;
};

export function UserAvatar({ src, alt = "", className, size }: UserAvatarProps) {
  const [failed, setFailed] = useState(false);
  const usableSrc = src?.trim() || null;
  const showImage = Boolean(usableSrc && !failed);
  const iconSize = Math.max(14, Math.round(size * 0.48));

  useEffect(() => {
    setFailed(false);
  }, [usableSrc]);

  if (showImage) {
    return (
      // Google avatar URLs often 403 without no-referrer.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={usableSrc!}
        alt={alt}
        width={size}
        height={size}
        className={className}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(145deg,#d9e3ea,#b7c6d2)] text-[#4b5c6e] ${className ?? ""}`}
      style={{ width: size, height: size }}
      aria-hidden={alt ? undefined : true}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
    >
      <UserRound size={iconSize} strokeWidth={2.2} />
    </span>
  );
}
