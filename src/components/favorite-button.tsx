"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type MouseEvent } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/lib/favorites";

export function FavoriteButton({
  listingId,
  initialFavorited = false,
  className = "",
  iconSize = 17,
}: {
  listingId: string;
  initialFavorited?: boolean;
  className?: string;
  iconSize?: number;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    startTransition(async () => {
      const previous = favorited;
      setFavorited(!previous);

      const result = await toggleFavorite(listingId);
      if (!result.ok) {
        setFavorited(previous);
        if (result.requiresLogin) {
          router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        window.alert(result.message || "Could not update favorite.");
        return;
      }

      setFavorited(result.favorited);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={favorited}
      className={className}
    >
      <Heart
        size={iconSize}
        className={favorited ? "fill-orange text-orange" : undefined}
        strokeWidth={favorited ? 2.2 : 2}
      />
    </button>
  );
}
